use crate::evaluator::{CompiledExprWithArgs, CompiledExprWithLazyArgs};
use crate::value::Value;

pub const LAZY_OPS: [&str; 13] = [
    "assign",
    "actionAny",
    "actionAll",
    "ite",
    "matchVariant",
    "oneOf",
    "and",
    "or",
    "next",
    "implies",
    "then",
    "reps",
    "expect",
];

pub fn compile_lazy_op(op: &str) -> CompiledExprWithLazyArgs {
    unimplemented!();
}

pub fn compile_eager_op(op: &str) -> CompiledExprWithArgs {
    match op {
        "iadd" => CompiledExprWithArgs::new(move |_env, args| {
            Ok(Value::Int(args[0].as_int()? + args[1].as_int()?))
        }),
        _ => {
            panic!("Unknown eager op");
        }
    }
}
