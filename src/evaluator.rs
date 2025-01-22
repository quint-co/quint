use color_eyre::eyre::eyre;
use color_eyre::Result;
use fxhash::FxHashMap;

use crate::{ir::*, value::*};

// #[derive(Clone)]
pub struct CompiledExpr<'a>(Box<dyn Fn(&mut Env) -> Result<Value<'a>> + 'a>);

impl<'a> CompiledExpr<'a> {
    pub fn new(closure: impl 'a + Fn(&mut Env) -> Result<Value<'a>>) -> Self {
        CompiledExpr(Box::new(closure))
    }

    pub fn execute(&self, env: &mut Env) -> Result<Value<'a>> {
        self.0(env)
    }
}

// pub struct NamedRegister<'a> {
//     name: String,
//     value: Result<Value>,
// }

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
    paramRegistry: FxHashMap<QuintId, Box<Result<Value<'a>>>>,
    // paramRegistry: Map<bigint, Register> = new Map()
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
        _ => CompiledExpr::new(move |_| Err(eyre!("Undefined builtin value: {name}"))),
    }
}

impl<'a> Interpreter<'a> {
    pub fn new(table: &'a LookupTable) -> Self {
        let mut paramRegistry = FxHashMap::default();

        for (_key, value) in table.iter() {
            if let LookupDefinition::Param(p) = value {
                // Create the heap-allocated error
                let error = Box::new(Err(eyre!("Undefined parameter: {:#?}", p)));

                // Insert the reference into the paramRegistry
                paramRegistry.insert(p.id, error);
            }
        }

        Self {
            table,
            paramRegistry,
        }
    }

    pub fn compile_def<'e>(&mut self, def: &'e LookupDefinition) -> CompiledExpr<'e>
    where
        'a: 'e,
    {
        match def {
            LookupDefinition::Definition(QuintDef::QuintOpDef(op)) => self.compile(&op.expr),
            _ => CompiledExpr::new(move |_| Err(eyre!("def not implemented: {:#?}", def))),
        }
    }

    fn mk_lambda<'e>(
        &mut self,
        params: Vec<QuintLambdaParameter>,
        body: CompiledExpr<'e>,
    ) -> CompiledExpr<'e>
    where
        'a: 'e,
    {
        // I don't think this strategy from the typescript implementation will work
        // with Rust's borrow checker. Maybe there's a different (more local?) approach
        let registers = params
            .into_iter()
            .map(|param| *self.paramRegistry.get(&param.id).unwrap())
            .collect();
        CompiledExpr::new(move |_| Ok(Value::Lambda(registers, body)))
    }

    pub fn compile<'e>(&mut self, expr: &'e QuintEx) -> CompiledExpr<'e>
    where
        'a: 'e,
    {
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
                self.mk_lambda(params.to_vec(), body);
                CompiledExpr::new(move |_| Err(eyre!("expr not implemented: {:#?}", expr)))
            }

            QuintEx::QuintApp {
                id: _,
                opcode,
                args,
            } => match opcode.as_str() {
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
                    CompiledExpr::new(move |_| Err(eyre!("opcode not implemented: {:#?}", opcode)))
                }
            },

            _ => CompiledExpr::new(move |_| Err(eyre!("expr not implemented: {:#?}", expr))),
        }
    }

    pub fn eval<'b>(&mut self, env: &mut Env, expr: &'b QuintEx) -> Result<Value<'a>>
    where
        'a: 'b,
    {
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

pub fn run(table: &LookupTable, expr: &QuintEx) -> Result<i64> {
    let mut interpreter = Interpreter::new(table);
    let mut env = Env::new();

    match interpreter.eval(&mut env, expr)? {
        Value::Int(result) => Ok(result),
        _ => Err(eyre!("Expected integer result")),
    }
}
