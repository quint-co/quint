use crate::evaluator::{CompiledExprWithArgs, CompiledExprWithLazyArgs};
use crate::ir::QuintError;
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

pub fn compile_eager_op<'a>(op: &str) -> CompiledExprWithArgs<'a> {
    match op {
        "Set" => {
            CompiledExprWithArgs::new(move |_env, args| Ok(Value::Set(args.into_iter().collect())))
        }
        // TODO: Add other constructors
        "not" => CompiledExprWithArgs::new(move |_env, args| Ok(Value::Bool(!args[0].as_bool()))),
        "iff" => CompiledExprWithArgs::new(move |_env, args| {
            Ok(Value::Bool(args[0].as_bool() == args[1].as_bool()))
        }),
        "eq" => CompiledExprWithArgs::new(move |_env, args| Ok(Value::Bool(args[0] == args[1]))),
        "neq" => CompiledExprWithArgs::new(move |_env, args| Ok(Value::Bool(args[0] != args[1]))),
        "iadd" => CompiledExprWithArgs::new(move |_env, args| {
            Ok(Value::Int(args[0].as_int() + args[1].as_int()))
        }),
        "isub" => CompiledExprWithArgs::new(move |_env, args| {
            Ok(Value::Int(args[0].as_int() - args[1].as_int()))
        }),
        "imul" => CompiledExprWithArgs::new(move |_env, args| {
            Ok(Value::Int(args[0].as_int() * args[1].as_int()))
        }),
        "idiv" => CompiledExprWithArgs::new(move |_env, args| {
            let divisor = args[1].as_int();
            if divisor == 0 {
                return Err(QuintError::new("QNT503", "Division by zero"));
            }

            Ok(Value::Int(args[0].as_int() / divisor))
        }),
        "imod" => CompiledExprWithArgs::new(move |_env, args| {
            Ok(Value::Int(args[0].as_int() % args[1].as_int()))
        }),
        "ipow" => CompiledExprWithArgs::new(move |_env, args| {
            Ok(Value::Int(args[0].as_int().pow(args[1].as_int() as u32)))
        }),
        "iuminus" => CompiledExprWithArgs::new(move |_env, args| Ok(Value::Int(-args[0].as_int()))),
        "ilt" => CompiledExprWithArgs::new(move |_env, args| {
            Ok(Value::Bool(args[0].as_int() < args[1].as_int()))
        }),
        "ilte" => CompiledExprWithArgs::new(move |_env, args| {
            Ok(Value::Bool(args[0].as_int() <= args[1].as_int()))
        }),
        "igt" => CompiledExprWithArgs::new(move |_env, args| {
            Ok(Value::Bool(args[0].as_int() > args[1].as_int()))
        }),
        "igte" => CompiledExprWithArgs::new(move |_env, args| {
            Ok(Value::Bool(args[0].as_int() >= args[1].as_int()))
        }),

        // TODO: Add tuple and list ops
        // TODO: powerset
        "contains" => CompiledExprWithArgs::new(move |_env, args| {
            Ok(Value::Bool(args[0].as_set().contains(&args[1])))
        }),
        "in" => CompiledExprWithArgs::new(move |_env, args| {
            Ok(Value::Bool(args[1].as_set().contains(&args[0])))
        }),
        "subseteq" => CompiledExprWithArgs::new(move |_env, args| {
            Ok(Value::Bool(args[0].as_set().is_subset(&args[1].as_set())))
        }),
        "exclude" => CompiledExprWithArgs::new(move |_env, args| {
            Ok(Value::Set(
                args[0]
                    .as_set()
                    .difference(&args[1].as_set())
                    .cloned()
                    .collect(),
            ))
        }),
        "union" => CompiledExprWithArgs::new(move |_env, args| {
            Ok(Value::Set(
                args[0].as_set().union(&args[1].as_set()).cloned().collect(),
            ))
        }),
        "intersect" => CompiledExprWithArgs::new(move |_env, args| {
            Ok(Value::Set(
                args[0]
                    .as_set()
                    .intersection(&args[1].as_set())
                    .cloned()
                    .collect(),
            ))
        }),
        // TODO: size, isFinite
        "to" => CompiledExprWithArgs::new(move |_env, args| {
            Ok(Value::Set(
                (args[0].as_int()..=args[1].as_int())
                    .map(Value::Int)
                    .collect(),
            ))
        }),

        // TODO, fold, maps, and extra ops
        _ => {
            panic!("Unknown eager op");
        }
    }
}
