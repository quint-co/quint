use crate::evaluator::CompiledExprWithLazyArgs;

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
