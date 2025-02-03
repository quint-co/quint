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

    pub fn execute(&self, env: &mut Env, args: Vec<Value<'a>>) -> EvalResult<'a> {
        self.0(env, args)
    }
}

impl<'a> CompiledExprWithLazyArgs<'a> {
    pub fn new(closure: impl 'a + Fn(&mut Env, &Vec<CompiledExpr<'a>>) -> EvalResult<'a>) -> Self {
        CompiledExprWithLazyArgs(Rc::new(closure))
    }

    pub fn execute(&self, env: &mut Env, args: &Vec<CompiledExpr<'a>>) -> EvalResult<'a> {
        self.0(env, args)
    }
}

#[derive(Default)]
pub struct Env {
    // Other params from Typescript implementation, for future reference:
    // rand
    // recorder
    // trace
    // varStorage
}

impl Env {
    pub fn new() -> Self {
        Self {
            // TODO
        }
    }
}

pub struct Interpreter<'a> {
    table: &'a LookupTable,
    param_registry: FxHashMap<QuintId, Rc<RefCell<EvalResult<'a>>>>,
    // Other params from Typescript implementation, for future reference:
    // constRegistry: Map<bigint, Register> = new Map()
    // scopedCachedValues: Map<bigint, CachedValue> = new Map()
    // initialNondetPicks: Map<string, RuntimeValue | undefined> = new Map()
    // memo: Map<bigint, EvalFunction> = new Map()
    // memoByInstance: Map<bigint, Map<bigint, EvalFunction>> = new Map()
    // namespaces: List<string> = List()
    // varStorage: VarStorage
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
        let mut param_registry = FxHashMap::default();

        for (_key, value) in table.iter() {
            if let LookupDefinition::Param(p) = value {
                // Create the heap-allocated error
                let error = Rc::new(RefCell::new(Err(QuintError::new(
                    "QNT501",
                    format!("Param {} not set", p.name).as_str(),
                ))));

                // Insert the reference into the param_registry
                param_registry.insert(p.id, error);
            }
        }

        Self {
            table,
            param_registry,
        }
    }

    pub fn compile_def(&mut self, def: &'a LookupDefinition) -> CompiledExpr<'a> {
        match def {
            LookupDefinition::Definition(QuintDef::QuintOpDef(op)) => self.compile(&op.expr),
            LookupDefinition::Param(p) => {
                let register = self.param_registry.get(&p.id).unwrap().clone();
                CompiledExpr::new(move |_| register.borrow().clone())
            }
            _ => unimplemented!(),
        }
    }

    fn mk_lambda<'e>(&self, params: Vec<QuintLambdaParameter>, body: CompiledExpr<'a>) -> Value<'a>
    where
        'a: 'e,
    {
        let registers = params
            .into_iter()
            .map(|param| {
                let register = self.param_registry.get(&param.id).unwrap().clone();
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
            _ => unimplemented!(),
        }
    }

    pub fn compile_op(&mut self, id: QuintId, op: &'a str) -> CompiledExprWithArgs<'a> {
        match self.table.get(&id) {
            Some(def) => {
                let op = self.compile_def(def);
                CompiledExprWithArgs::new(move |env, args| {
                    let lambda = op.execute(env)?;
                    let closure = lambda.as_closure()?;
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
    let mut env = Env::new();

    interpreter.eval(&mut env, expr)
}
