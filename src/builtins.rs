use crate::evaluator::{CompiledExprWithArgs, CompiledExprWithLazyArgs};
use crate::ir::QuintError;
use crate::value::{FxHashSet, Value};

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
        "Rec" => |_env, args| {
            Ok(Value::Record(
                args.chunks_exact(2)
                    .map(|chunk| (chunk[0].as_str(), chunk[1].clone()))
                    .collect(),
            ))
        },
        "Tup" => |_env, args| Ok(Value::Tuple(args.into_iter().collect())),
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
        "ipow" => |_env, args| {
            let base = args[0].as_int();
            let exp = args[1].as_int();
            if base == 0 && exp == 0 {
                return Err(QuintError::new("QNT503", "0^0 is undefined"));
            }
            if exp < 0 {
                return Err(QuintError::new("QNT503", "i^j is undefined for j < 0"));
            }

            Ok(Value::Int(base.pow(exp as u32)))
        },
        "iuminus" => |_env, args| Ok(Value::Int(-args[0].as_int())),
        "ilt" => |_env, args| Ok(Value::Bool(args[0].as_int() < args[1].as_int())),
        "ilte" => |_env, args| Ok(Value::Bool(args[0].as_int() <= args[1].as_int())),
        "igt" => |_env, args| Ok(Value::Bool(args[0].as_int() > args[1].as_int())),
        "igte" => |_env, args| Ok(Value::Bool(args[0].as_int() >= args[1].as_int())),

        "item" => |_env, args| Ok(args[0].as_list()[args[1].as_int() as usize - 1].clone()),

        // TODO: tuples with cross prod
        "field" => |_env, args| {
            Ok(args[0]
                .as_record_map()
                .get(&args[1].as_str())
                .unwrap()
                .clone())
        },

        "fieldNames" => |_env, args| {
            Ok(Value::Set(
                args[0]
                    .as_record_map()
                    .keys()
                    .map(|s| Value::Str(s.clone()))
                    .collect(),
            ))
        },

        "with" => |_env, args| {
            let mut record = args[0].as_record_map().clone();
            record.insert(args[1].as_str().to_string(), args[2].clone());
            Ok(Value::Record(record))
        },

        // TODO: Add list ops
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

        "size" => |_env, args| Ok(Value::Int(args[0].cardinality())),

        "isFinite" => |_env, _args| {
            // at the moment, we support only finite sets, so just return true
            Ok(Value::Bool(true))
        },
        "to" => |_env, args| {
            Ok(Value::Set(
                (args[0].as_int()..=args[1].as_int())
                    .map(Value::Int)
                    .collect(),
            ))
        },

        "fold" => |env, args| {
            apply_lambda(
                FoldOrder::Forward,
                args[0].as_set().iter().cloned(),
                args[1].clone(),
                |arg| args[2].as_closure()(env, arg.to_vec()),
            )
        },

        "foldl" => |env, args| {
            apply_lambda(
                FoldOrder::Forward,
                args[0].as_list().iter().cloned(),
                args[1].clone(),
                |arg| args[2].as_closure()(env, arg.to_vec()),
            )
        },

        "foldr" => |env, args| {
            apply_lambda(
                FoldOrder::Backward,
                args[0].as_list().iter().cloned(),
                args[1].clone(),
                |arg| args[2].as_closure()(env, arg.to_vec()),
            )
        },

        // TODO: Map operators
        "exists" => |env, args| {
            for v in args[0].as_set() {
                let result = args[1].as_closure()(env, vec![v.clone()])?;
                if result.as_bool() {
                    return Ok(Value::Bool(true));
                }
            }
            Ok(Value::Bool(false))
        },

        "forall" => |env, args| {
            for v in args[0].as_set() {
                let result = args[1].as_closure()(env, vec![v.clone()])?;
                if !result.as_bool() {
                    return Ok(Value::Bool(false));
                }
            }
            Ok(Value::Bool(true))
        },

        "map" => |env, args| {
            Ok(Value::Set(
                args[0]
                    .as_set()
                    .iter()
                    .map(|v| args[1].as_closure()(env, vec![v.clone()]))
                    .collect::<Result<_, _>>()?,
            ))
        },

        "filter" => |env, args| {
            Ok(Value::Set(args[0].as_set().iter().try_fold(
                FxHashSet::default(),
                |mut acc, v| {
                    if args[1].as_closure()(env, vec![v.clone()])?.as_bool() {
                        acc.insert(v.clone());
                    }
                    Ok(acc)
                },
            )?))
        },

        // TODO, fold, maps, and extra ops
        "flatten" => |_env, args| {
            Ok(Value::Set(
                args[0].as_set().iter().flat_map(|v| v.as_set()).collect(),
            ))
        },
        _ => {
            panic!("Unknown eager op");
        }
    })
}

enum FoldOrder {
    Forward,
    Backward,
}

fn apply_lambda<'a, T>(
    order: FoldOrder,
    iterable: T,
    initial: Value<'a>,
    mut closure: impl FnMut(&[Value<'a>]) -> Result<Value<'a>, QuintError>,
) -> Result<Value<'a>, QuintError>
where
    T: Iterator<Item = Value<'a>> + DoubleEndedIterator,
{
    let reducer = |acc: Result<Value<'a>, QuintError>, elem: Value<'a>| {
        acc.and_then(|acc| match order {
            FoldOrder::Forward => closure(&[acc, elem]),
            FoldOrder::Backward => closure(&[elem, acc]),
        })
    };

    match order {
        FoldOrder::Forward => iterable.fold(Ok(initial), reducer),
        FoldOrder::Backward => iterable.rev().fold(Ok(initial), reducer),
    }
}
