use crate::storage::{Storage, VariableValue};
use crate::{builtins::*, ir::*, value::*};
use fxhash::FxHashMap;
use std::cell::RefCell;
use std::fmt;
use std::rc::Rc;

pub type EvalResult<'a> = Result<Value<'a>, QuintError>;

#[derive(Clone)]
pub struct CompiledExpr<'a>(Rc<dyn Fn(&mut Env) -> EvalResult<'a> + 'a>);

#[derive(Clone)]
#[allow(clippy::type_complexity)]
pub struct CompiledExprWithArgs<'a>(Rc<dyn Fn(&mut Env, Vec<Value<'a>>) -> EvalResult<'a> + 'a>);

#[derive(Clone)]
pub struct CompiledExprWithLazyArgs<'a>(
    #[allow(clippy::type_complexity)]
    Rc<dyn Fn(&mut Env, &Vec<CompiledExpr<'a>>) -> EvalResult<'a> + 'a>,
);

impl<'a> CompiledExpr<'a> {
    pub fn new(closure: impl 'a + Fn(&mut Env) -> EvalResult<'a>) -> Self {
        CompiledExpr(Rc::new(closure))
    }

    pub fn execute(&self, env: &mut Env) -> EvalResult<'a> {
        self.0(env)
    }
}

impl fmt::Debug for CompiledExpr<'_> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "<CompiledExpr>")
    }
}

impl<'a> CompiledExprWithArgs<'a> {
    pub fn new(closure: impl 'a + Fn(&mut Env, Vec<Value<'a>>) -> EvalResult<'a>) -> Self {
        CompiledExprWithArgs(Rc::new(closure))
    }

    pub fn from_fn(function: fn(&mut Env, Vec<Value<'a>>) -> EvalResult<'a>) -> Self {
        CompiledExprWithArgs(Rc::new(function))
    }

    pub fn execute(&self, env: &mut Env, args: Vec<Value<'a>>) -> EvalResult<'a> {
        self.0(env, args)
    }
}

impl<'a> CompiledExprWithLazyArgs<'a> {
    pub fn new(closure: impl 'a + Fn(&mut Env, &Vec<CompiledExpr<'a>>) -> EvalResult<'a>) -> Self {
        CompiledExprWithLazyArgs(Rc::new(closure))
    }

    pub fn from_fn(function: fn(&mut Env, &Vec<CompiledExpr<'a>>) -> EvalResult<'a>) -> Self {
        CompiledExprWithLazyArgs(Rc::new(function))
    }

    pub fn execute(&self, env: &mut Env, args: &Vec<CompiledExpr<'a>>) -> EvalResult<'a> {
        self.0(env, args)
    }
}

pub struct Env<'a> {
    pub var_storage: Storage<'a>,
    // Other params from Typescript implementation, for future reference:
    // rand
    // recorder
    // trace
}

impl<'a> Env<'a> {
    pub fn new(var_storage: Storage<'a>) -> Self {
        Self { var_storage }
    }
}

pub struct Interpreter<'a> {
    table: &'a LookupTable,
    param_registry: FxHashMap<QuintId, Rc<RefCell<EvalResult<'a>>>>,
    scoped_cached_values: FxHashMap<QuintId, Rc<RefCell<Option<EvalResult<'a>>>>>,
    pub var_storage: Storage<'a>,
    // Other params from Typescript implementation, for future reference:
    // constRegistry: Map<bigint, Register> = new Map()
    // scopedCachedValues: Map<bigint, CachedValue> = new Map()
    // initialNondetPicks: Map<string, RuntimeValue | undefined> = new Map()
    // memo: Map<bigint, EvalFunction> = new Map()
    // memoByInstance: Map<bigint, Map<bigint, EvalFunction>> = new Map()
    // namespaces: List<string> = List()
}

fn builtin_value(name: &str) -> CompiledExpr {
    match name {
        "true" => CompiledExpr::new(move |_| Ok(Value::Bool(true))),
        "false" => CompiledExpr::new(move |_| Ok(Value::Bool(false))),
        _ => unimplemented!(),
    }
}

impl<'a> Interpreter<'a> {
    pub fn new(table: &'a LookupTable) -> Self {
        Self {
            table,
            param_registry: FxHashMap::default(),
            scoped_cached_values: FxHashMap::default(),
            var_storage: Storage::default(),
        }
    }

    pub fn get_or_create_param(
        &mut self,
        param: &QuintLambdaParameter,
    ) -> Rc<RefCell<EvalResult<'a>>> {
        self.param_registry
            .entry(param.id)
            .or_insert_with(|| {
                Rc::new(RefCell::new(Err(QuintError::new(
                    "QNT500",
                    format!("Param {} not set", param.name).as_str(),
                ))))
            })
            .clone()
    }

    pub fn create_var(&mut self, id: &QuintId, name: &str) {
        let key = format!("{}", id); // TODO: include namespaces in the key
        if self.var_storage.vars.contains_key(&key) {
            return;
        }

        // TODO: handle namespaces (already using String as we'll need it later)
        let var_name = name.to_string();
        let register_for_current = Rc::new(RefCell::new(VariableValue {
            name: var_name.clone(),
            value: None,
        }));

        let register_for_next = Rc::new(RefCell::new(VariableValue {
            name: var_name,
            value: None,
        }));

        self.var_storage
            .vars
            .insert(key.clone(), register_for_current);
        self.var_storage.next_vars.insert(key, register_for_next);
    }

    pub fn get_or_create_var(
        &mut self,
        id: &QuintId,
        name: &str,
    ) -> Rc<RefCell<VariableValue<'a>>> {
        let key = format!("{}", id); // TODO: include namespaces in the key
        if !self.var_storage.vars.contains_key(&key) {
            self.create_var(id, name);
        }
        self.var_storage
            .vars
            .entry(key)
            .or_insert(Rc::new(RefCell::new(VariableValue {
                name: name.to_string(),
                value: None,
            })))
            .clone()
    }

    pub fn get_next_var(&self, id: &QuintId) -> Rc<RefCell<VariableValue<'a>>> {
        let key = format!("{}", id); // TODO: include namespaces in the key
        self.var_storage.next_vars.get(&key).unwrap().clone()
    }

    pub fn compile_def(&mut self, def: &'a LookupDefinition) -> CompiledExpr<'a> {
        match def {
            LookupDefinition::Definition(QuintDef::QuintOpDef(op)) => {
                if matches!(op.expr, QuintEx::QuintLambda { .. }) || op.depth.is_none_or(|x| x == 0)
                {
                    // We need to avoid scoped caching in lambdas or top-level expressions
                    // We still have memoization. This caching is special for scoped defs (let-ins)
                    // TODO: We don't really have memoization in rust yet
                    return self.compile(&op.expr);
                }

                let cached_value = {
                    let cached = self.scoped_cached_values.get(&op.id).unwrap();
                    Rc::clone(cached)
                };

                let compiled_expr = self.compile(&op.expr);
                CompiledExpr::new(move |env| {
                    let mut cached = cached_value.borrow_mut();
                    if let Some(value) = cached.as_ref() {
                        // If the value is already cached, return it
                        value.clone()
                    } else {
                        let result = compiled_expr.execute(env);
                        *cached = Some(result.clone());
                        result
                    }
                })
            }
            LookupDefinition::Definition(QuintDef::QuintVar { id, name }) => {
                let register = self.get_or_create_var(id, name);
                CompiledExpr::new(move |_| {
                    register.borrow().clone().value.ok_or(QuintError::new(
                        "QNT502",
                        format!("Variable {} not set", name).as_str(),
                    ))
                })
            }
            LookupDefinition::Param(p) => {
                let register = self.get_or_create_param(p);
                CompiledExpr::new(move |_| register.borrow().clone())
            }
            _ => unimplemented!(),
        }
    }

    fn mk_lambda<'e>(
        &mut self,
        params: Vec<QuintLambdaParameter>,
        body: CompiledExpr<'a>,
    ) -> Value<'a>
    where
        'a: 'e,
    {
        let registers = params
            .into_iter()
            .map(|param| {
                let register = self.get_or_create_param(&param);
                Rc::clone(&register)
            })
            .collect::<Vec<_>>();

        Value::Lambda(registers.clone(), body.clone())
    }

    pub fn compile(&mut self, expr: &'a QuintEx) -> CompiledExpr<'a> {
        match expr {
            QuintEx::QuintInt { id: _, value } => {
                CompiledExpr::new(move |_| Ok(Value::Int(*value)))
            }

            QuintEx::QuintBool { id: _, value } => {
                CompiledExpr::new(move |_| Ok(Value::Bool(*value)))
            }

            QuintEx::QuintStr { id: _, value } => {
                CompiledExpr::new(move |_| Ok(Value::Str(value.clone())))
            }

            QuintEx::QuintName { id, name } => self
                .table
                .get(id)
                .map(|def| self.compile_def(def))
                .unwrap_or_else(|| builtin_value(name)),

            QuintEx::QuintLambda {
                id: _,
                params,
                expr,
            } => {
                let body = self.compile(expr);
                let lambda = self.mk_lambda(params.to_vec(), body);
                CompiledExpr::new(move |_| Ok(lambda.clone()))
            }

            QuintEx::QuintApp { id, opcode, args } => {
                let compiled_args = args.iter().map(|arg| self.compile(arg)).collect::<Vec<_>>();

                if opcode == "assign" {
                    // Assign is too special, so we handle it separately.
                    // We need to build things under the context of the variable being assigned,
                    // as it may come from an instance, and that changed everything
                    // TODO: deal with context (namespaces)
                    let var_def = self.table.get(&args[0].id()).unwrap();
                    self.create_var(&var_def.id(), var_def.name());
                    let register = self.get_next_var(&var_def.id());
                    let expr = self.compile(&args[1]);

                    return CompiledExpr::new(move |env| {
                        let value = expr.execute(env)?;
                        register.borrow_mut().value = Some(value.clone());
                        Ok(Value::Bool(true))
                    });
                }

                if LAZY_OPS.contains(&opcode.as_str()) {
                    // Lazy operator, compile the arguments and give their
                    // closures to the operator so it decides when to eval
                    CompiledExpr::new(move |env| {
                        let op = compile_lazy_op(opcode);
                        op.execute(env, &compiled_args)
                    })
                } else {
                    // Otherwise, this is either a normal (eager) builtin, or an user-defined operator.
                    // For both, we first evaluate the arguments and then apply the operator.
                    let compiled_op = self.compile_op(*id, opcode.as_str());
                    CompiledExpr::new(move |env| {
                        let evaluated_args = compiled_args
                            .iter()
                            .map(|arg| arg.execute(env))
                            .collect::<Result<Vec<_>, _>>()?;
                        compiled_op.execute(env, evaluated_args)
                    })
                }
            }

            QuintEx::QuintLet { id: _, opdef, expr } => {
                // First, we create a cached value (a register with optional value) for the definition in this let expression
                let cached_value = {
                    let cached = self
                        .scoped_cached_values
                        .entry(opdef.id)
                        .or_insert_with(|| Rc::new(RefCell::new(None)));
                    Rc::clone(cached)
                };
                // Then, we build the expression for the let body. It will use the lookup table and, every time it needs the value
                // for the definition under the let, it will use the cached value (or eval a new value and store it).
                let compiled_expr = self.compile(expr);
                CompiledExpr::new(move |env| {
                    let result = compiled_expr.execute(env);
                    // After evaluating the whole let expression, we clear the cached value, as it is no longer in scope.
                    // The next time the whole let expression is evaluated, the definition will be re-evaluated.
                    cached_value.replace(None);
                    result
                })
            }
        }
    }

    pub fn compile_op(&mut self, id: QuintId, op: &'a str) -> CompiledExprWithArgs<'a> {
        match self.table.get(&id) {
            Some(def) => {
                let op = self.compile_def(def);
                CompiledExprWithArgs::new(move |env, args| {
                    let lambda = op.execute(env)?;
                    let closure = lambda.as_closure();
                    closure(env, args)
                })
            }
            None => compile_eager_op(op),
        }
    }

    pub fn eval(&mut self, env: &mut Env, expr: &'a QuintEx) -> EvalResult<'a> {
        self.compile(expr).execute(env)
    }
}

pub fn run<'a>(table: &'a LookupTable, expr: &'a QuintEx) -> Result<Value<'a>, QuintError> {
    let mut interpreter = Interpreter::new(table);
    let mut env = Env::new(interpreter.var_storage.clone());

    interpreter.eval(&mut env, expr)
}
