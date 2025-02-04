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

pub fn compile_lazy_op(_op: &str) -> CompiledExprWithLazyArgs {
    unimplemented!();
}

pub fn compile_eager_op<'a>(op: &str) -> CompiledExprWithArgs<'a> {
    CompiledExprWithArgs::from_fn(match op {
        "Set" => |_env, args| Ok(Value::Set(args.into_iter().collect())),
        // TODO: Add other constructors
        "not" => |_env, args| Ok(Value::Bool(!args[0].as_bool())),
        "iff" => |_env, args| Ok(Value::Bool(args[0].as_bool() == args[1].as_bool())),
        "eq" => |_env, args| Ok(Value::Bool(args[0] == args[1])),
        "neq" => |_env, args| Ok(Value::Bool(args[0] != args[1])),
        "iadd" => |_env, args| Ok(Value::Int(args[0].as_int() + args[1].as_int())),
        "isub" => |_env, args| Ok(Value::Int(args[0].as_int() - args[1].as_int())),
        "imul" => |_env, args| Ok(Value::Int(args[0].as_int() * args[1].as_int())),
        "idiv" => |_env, args| {
            let divisor = args[1].as_int();
            if divisor == 0 {
                return Err(QuintError::new("QNT503", "Division by zero"));
            }

            Ok(Value::Int(args[0].as_int() / divisor))
        },
        "imod" => |_env, args| Ok(Value::Int(args[0].as_int() % args[1].as_int())),
        "ipow" => |_env, args| Ok(Value::Int(args[0].as_int().pow(args[1].as_int() as u32))),
        "iuminus" => |_env, args| Ok(Value::Int(-args[0].as_int())),
        "ilt" => |_env, args| Ok(Value::Bool(args[0].as_int() < args[1].as_int())),
        "ilte" => |_env, args| Ok(Value::Bool(args[0].as_int() <= args[1].as_int())),
        "igt" => |_env, args| Ok(Value::Bool(args[0].as_int() > args[1].as_int())),
        "igte" => |_env, args| Ok(Value::Bool(args[0].as_int() >= args[1].as_int())),

        // TODO: Add tuple and list ops
        // TODO: powerset
        "contains" => |_env, args| Ok(Value::Bool(args[0].as_set().contains(&args[1]))),
        "in" => |_env, args| Ok(Value::Bool(args[1].as_set().contains(&args[0]))),
        "subseteq" => |_env, args| Ok(Value::Bool(args[0].as_set().is_subset(&args[1].as_set()))),
        "exclude" => |_env, args| {
            Ok(Value::Set(
                args[0]
                    .as_set()
                    .difference(&args[1].as_set())
                    .cloned()
                    .collect(),
            ))
        },
        "union" => |_env, args| {
            Ok(Value::Set(
                args[0].as_set().union(&args[1].as_set()).cloned().collect(),
            ))
        },
        "intersect" => |_env, args| {
            Ok(Value::Set(
                args[0]
                    .as_set()
                    .intersection(&args[1].as_set())
                    .cloned()
                    .collect(),
            ))
        },
        // TODO: size, isFinite
        "to" => |_env, args| {
            Ok(Value::Set(
                (args[0].as_int()..=args[1].as_int())
                    .map(Value::Int)
                    .collect(),
            ))
        },

        // TODO, fold, maps, and extra ops
        _ => {
            panic!("Unknown eager op");
        }
    })
}
