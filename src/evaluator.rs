use crate::{ir::*, value::*};
use fxhash::FxHashMap;
use std::cell::RefCell;
use std::rc::Rc;

pub type EvalResult<'a> = Result<Value<'a>, String>;

#[derive(Clone)]
pub struct CompiledExpr<'a>(Rc<dyn Fn(&mut Env) -> EvalResult<'a> + 'a>);

impl<'a> CompiledExpr<'a> {
    pub fn new(closure: impl 'a + Fn(&mut Env) -> EvalResult<'a>) -> Self {
        CompiledExpr(Rc::new(closure))
    }

    pub fn execute(&self, env: &mut Env) -> EvalResult<'a> {
        self.0(env)
    }
}

#[derive(Default)]
pub struct Env {
    // rand
    // recorder
    // trace
    // varStorage: Box<[Option<Value<'a>>]>,
    //
    // Can we make this into Vec<Optional<?>> for better performance?
    // values: FxHashMap<QuintId, Value>,
    // cache: FxHashMap<QuintId, Closure<'a>>,
    // parent: Option<&'a Env<'a>>,
}

impl Env {
    pub fn new() -> Self {
        Self {
            // values: FxHashMap::default(),
            // cache: FxHashMap::default(),
            // parent: None,
        }
    }
}

pub struct Interpreter<'a> {
    table: &'a LookupTable,
    param_registry: FxHashMap<QuintId, Rc<RefCell<EvalResult<'a>>>>,
    // param_registry: Map<bigint, Register> = new Map()
    // constRegistry: Map<bigint, Register> = new Map()
    // scopedCachedValues: Map<bigint, CachedValue> = new Map()
    // initialNondetPicks: Map<string, RuntimeValue | undefined> = new Map()
    // memo: Map<bigint, EvalFunction> = new Map()
    // memoByInstance: Map<bigint, Map<bigint, EvalFunction>> = new Map()
    // namespaces: List<string> = List()
    // varStorage: VarStorage
}

fn builtin_value<'e>(name: String) -> CompiledExpr<'e> {
    match name.as_str() {
        "true" => CompiledExpr::new(move |_| Ok(Value::Bool(true))),
        "false" => CompiledExpr::new(move |_| Ok(Value::Bool(false))),
        // "iadd" => CompiledExpr::new(move |args| Ok(Value::Int(args.0.to_int() + args.1.to_int()))),
        _ => CompiledExpr::new(move |_| Err(format!("Undefined builtin value: {name}"))),
    }
}

impl<'a> Interpreter<'a> {
    pub fn new(table: &'a LookupTable) -> Self {
        let mut param_registry = FxHashMap::default();

        for (_key, value) in table.iter() {
            if let LookupDefinition::Param(p) = value {
                // Create the heap-allocated error
                let error = Rc::new(RefCell::new(Err(format!("Undefined parameter: {:#?}", p))));

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
            _ => CompiledExpr::new(move |_| Err(format!("def not implemented: %{:#?}", def))),
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
                .unwrap_or_else(|| builtin_value(name.to_string())),

            QuintEx::QuintLambda {
                id: _,
                params,
                expr,
            } => {
                let body = self.compile(expr);
                let lambda = self.mk_lambda(params.to_vec(), body);
                CompiledExpr::new(move |_| Ok(lambda.clone()))
            }

            QuintEx::QuintApp { id, opcode, args } => match opcode.as_str() {
                "iadd" => {
                    let lhs = self.compile(&args[0]);
                    let rhs = self.compile(&args[1]);
                    CompiledExpr::new(move |env| {
                        let lhs = lhs.execute(env)?;
                        let rhs = rhs.execute(env)?;
                        Ok(Value::Int(lhs.as_int()? + rhs.as_int()?))
                    })
                }
                _ => {
                    let op = self.table.get(id).map(|def| self.compile_def(def)).unwrap();
                    let compiled_args =
                        args.iter().map(|arg| self.compile(arg)).collect::<Vec<_>>();
                    CompiledExpr::new(move |env| {
                        let lambda = op.execute(env)?;
                        let closure = lambda.as_closure()?;
                        let arg_values = compiled_args
                            .iter()
                            .map(|arg| arg.execute(env))
                            .collect::<Result<Vec<_>, _>>()?;
                        closure(env, arg_values)
                    })
                }
            },

            _ => CompiledExpr::new(move |_| Err(format!("expr not implemented: %{:#?}", expr))),
        }
    }

    pub fn eval(&mut self, env: &mut Env, expr: &'a QuintEx) -> EvalResult<'a> {
        self.compile(expr).execute(env)
    }
}

// pub fn prepare(
//     table: &LookupTable,
//     expr: QuintEx,
// ) -> Result<Box<dyn FnMut() -> Result<Value> + '_>> {
//     let interpreter = Interpreter::new(table);
//     // let expr: &'static Expr = Box::leak(Box::new(Expr::Call(main_sym, vec![])));

//     let closure = interpreter.compile(&expr)?;

//     let mut env = Env::new();

//     // for def in interpreter.table.defs.values() {
//     //     let sym = def.sym;
//     //     let closure = interpreter.compile(&def.body)?;
//     //     env.cache.insert(sym, closure);
//     // }

//     Ok(Box::new(move || closure(&mut env)))
// }

pub fn run<'a>(table: &'a LookupTable, expr: &'a QuintEx) -> Result<Value<'a>, String> {
    let mut interpreter = Interpreter::new(table);
    let mut env = Env::new();

    interpreter.eval(&mut env, expr)
}
