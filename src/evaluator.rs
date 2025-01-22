use color_eyre::eyre::eyre;
use color_eyre::Result;
use fxhash::FxHashMap;

use crate::{ir::*, value::*};

pub struct CompiledExpr<'a>(Box<dyn Fn(&mut Env) -> Result<Value> + 'a>);

impl<'a> CompiledExpr<'a> {
    pub fn new(closure: impl 'a + Fn(&mut Env) -> Result<Value>) -> Self {
        CompiledExpr(Box::new(closure))
    }

    pub fn execute(&self, env: &mut Env) -> Result<Value> {
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
    // paramRegistry: Map<bigint, Register> = new Map()
    // constRegistry: Map<bigint, Register> = new Map()
    // scopedCachedValues: Map<bigint, CachedValue> = new Map()
    // initialNondetPicks: Map<string, RuntimeValue | undefined> = new Map()
    // memo: Map<bigint, EvalFunction> = new Map()
    // memoByInstance: Map<bigint, Map<bigint, EvalFunction>> = new Map()
    // namespaces: List<string> = List()
    // varStorage: VarStorage
}

impl<'a> Interpreter<'a> {
    pub fn new(table: &'a LookupTable) -> Self {
        Self { table }
    }

    pub fn compile<'e>(&self, expr: &'e QuintEx) -> Result<CompiledExpr<'e>>
    where
        'a: 'e,
    {
        match expr {
            QuintEx::QuintInt { id: _, value: n } => {
                Ok(CompiledExpr::new(move |_| Ok(Value::Int(*n).clone())))
            }
            QuintEx::QuintBool { id: _, value: b } => {
                Ok(CompiledExpr::new(move |_| Ok(Value::Bool(*b).clone())))
            }
            _ => Err(eyre!("Not implemented")),
            // Expr::Lit(lit) => {
            //     let val = match lit {
            //         Lit::Int(n) => Value::Int(*n),
            //         Lit::Bool(b) => Value::Bool(*b),
            //         Lit::Set(elems) => {
            //             let elems = elems
            //                 .iter()
            //                 .map(|elem| self.compile(elem))
            //                 .collect::<Result<Vec<_>>>()?;

            //             return Ok(Box::new(move |env| {
            //                 let elems = elems
            //                     .iter()
            //                     .map(|elem| elem(env))
            //                     .collect::<Result<FxHashSet<_>>>()?;

            //                 Ok(Value::Set(elems))
            //             }));
            //         }
            //     };

            // }

            //     Expr::Var(var) => {
            //         let sym = var.sym;
            //         Ok(Box::new(move |env| {
            //             env.value(&sym)
            //                 .cloned()
            //                 .ok_or_else(|| eyre!("Undefined variable: {sym}"))
            //         }))
            //     }

            //     Expr::Let(sym, value, body) => {
            //         let value = self.compile(value)?;
            //         let body = self.compile(body)?;

            //         Ok(Box::new(move |env| {
            //             let value = value(env)?;
            //             body(&mut env.with(sym.sym, value))
            //         }))
            //     }

            //     Expr::Block(exprs) => {
            //         let exprs = exprs
            //             .iter()
            //             .map(|expr| self.compile(expr))
            //             .collect::<Result<Vec<_>>>()?;

            //         Ok(Box::new(move |env| {
            //             let mut result = Value::Int(0);
            //             for expr in &exprs {
            //                 result = expr(env)?;
            //             }
            //             Ok(result)
            //         }))
            //     }

            //     Expr::BinOp(op, lhs, rhs) => {
            //         let lhs = self.compile(lhs)?;
            //         let rhs = self.compile(rhs)?;
            //         let apply = op.to_fn();

            //         Ok(Box::new(move |env| {
            //             let l = lhs(env)?;
            //             let r = rhs(env)?;
            //             apply(l, r)
            //         }))
            //     }

            //     Expr::If(cnd, thn, els) => {
            //         let cnd = self.compile(cnd)?;
            //         let thn = self.compile(thn)?;
            //         let els = self.compile(els)?;

            //         Ok(Box::new(move |env| match cnd(env)? {
            //             Value::Bool(true) => thn(env),
            //             Value::Bool(false) => els(env),
            //             _ => Err(eyre!("Condition must be boolean")),
            //         }))
            //     }

            //     Expr::While(cond, body) => {
            //         let cond = self.compile(cond)?;
            //         let body = self.compile(body)?;

            //         Ok(Box::new(move |env| {
            //             let mut result = Value::Int(0);
            //             while cond(env)?.as_bool()? {
            //                 result = body(env)?;
            //             }
            //             Ok(result)
            //         }))
            //     }

            //     Expr::Call(sym, args) => {
            //         let def = self
            //             .table
            //             .defs
            //             .get(sym)
            //             .ok_or_else(|| eyre!("Undefined function: {sym}"))?;

            //         let args = args
            //             .iter()
            //             .map(|arg| self.compile(arg))
            //             .collect::<Result<Vec<_>>>()?;

            //         Ok(Box::new(move |env| {
            //             let mut values = FxHashMap::default();
            //             for (param, arg) in def.args.iter().zip(&args) {
            //                 values.insert(param.sym, arg(env)?);
            //             }

            //             let body = env
            //                 .cached(sym)
            //                 .ok_or_else(|| eyre!("Cached function not found: {sym}"))?;

            //             body(&mut env.nested(values))
            //         }))
            //     }

            //     Expr::SetAdd(set, elem) => {
            //         let set = self.compile(set)?;
            //         let elem = self.compile(elem)?;

            //         Ok(Box::new(move |env| {
            //             let mut set = set(env)?;
            //             let elem = elem(env)?;

            //             match &mut set {
            //                 Value::Set(elems) => {
            //                     elems.insert(elem);
            //                     Ok(Value::Set(elems.clone()))
            //                 }
            //                 _ => Err(eyre!("Expected set")),
            //             }
            //         }))
            //     }

            //     Expr::SetContains(set, elem) => {
            //         let set = self.compile(set)?;
            //         let elem = self.compile(elem)?;

            //         Ok(Box::new(move |env| {
            //             let set = set(env)?;
            //             let elem = elem(env)?;

            //             match &set {
            //                 Value::Set(elems) => Ok(Value::Bool(elems.contains(&elem))),
            //                 _ => Err(eyre!("Expected set")),
            //             }
            //         }))
            //     }
        }
    }

    pub fn eval(&self, expr: &QuintEx) -> Result<Value> {
        let compiled_expr = self.compile(expr)?;

        let mut env = Env::new();

        // Should be on-demand
        // for def in self.table.defs.values() {
        //     let sym = def.sym;
        //     let closure = self.compile(&def.body)?;
        //     env.cache.insert(sym, closure);
        // }

        compiled_expr.execute(&mut env)
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
    let interpreter = Interpreter::new(table);

    match interpreter.eval(expr)? {
        Value::Int(result) => Ok(result),
        _ => Err(eyre!("Expected integer result")),
    }
}
