use crate::evaluator::{CompiledExprWithArgs, CompiledExprWithLazyArgs};
use crate::ir::{FxHashMap, QuintError};
use crate::value::{FxHashSet, Value};
use itertools::Itertools;

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
    CompiledExprWithLazyArgs::from_fn(match op {
        "ite" => |env, args| {
            let cond = args[0].execute(env).map(|c| c.as_bool())?;
            if cond {
                args[1].execute(env)
            } else {
                args[2].execute(env)
            }
        },
        "matchVariant" => |env, args| {
            let matched_expr = args[0].execute(env)?;
            let (variant_label, variant_value) = matched_expr.as_variant();
            let cases = &args[1..];

            let matching_case = cases.chunks_exact(2).find_map(|chunk| match chunk {
                [case_label_expr, case_elim_expr] => {
                    let case_label = case_label_expr.execute(env).ok()?;
                    if case_label.as_str() == variant_label || case_label.as_str() == "_" {
                        Some(case_elim_expr)
                    } else {
                        None
                    }
                }
                _ => None,
            });

            match matching_case {
                Some(case_elim_expr) => {
                    let case_elim = case_elim_expr.execute(env)?;
                    case_elim.clone().as_closure()(env, vec![variant_value.clone()])
                }
                None => Err(QuintError::new(
                    "QNT505",
                    &format!("No match for variant {}", variant_label),
                )),
            }
        },
        _ => {
            panic!("Unknown lazy op: {op}")
        }
    })
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
        "List" => |_env, args| Ok(Value::List(args.into_iter().collect())),
        "Map" => |_env, args| {
            Ok(Value::Map(
                args.into_iter().map(|kv| kv.as_tuple2()).collect(),
            ))
        },
        "variant" => |_env, args| Ok(Value::Variant(args[0].as_str(), Box::new(args[1].clone()))),
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
        "tuples" => |_env, args| Ok(Value::CrossProduct(args)),

        "range" => |_env, args| {
            let start = args[0].as_int();
            let end = args[1].as_int();
            Ok(Value::List((start..end).map(Value::Int).collect()))
        },
        "nth" => |_env, args| {
            let list = args[0].as_list();
            let index = args[1].as_int();

            // TODO: extract into function to use it in `item` as well
            if index < 0 || index >= list.len().try_into().unwrap() {
                return Err(QuintError::new("QNT510", "Out of bounds, nth(${index})"));
            }

            Ok(list[index as usize].clone())
        },
        "replaceAt" => |_env, args| {
            let mut list = args[0].as_list().clone();
            let index = args[1].as_int();

            if index < 0 || index >= list.len().try_into().unwrap() {
                return Err(QuintError::new(
                    "QNT510",
                    "Out of bounds, replaceAt(${index})",
                ));
            }

            list[index as usize] = args[2].clone();
            Ok(Value::List(list))
        },

        "head" => |_env, args| {
            // Get the first element of a list. Not allowed in empty lists.
            let list = args[0].as_list();
            match list.first() {
                Some(h) => Ok(h.clone()),
                None => Err(QuintError::new("QNT505", "Called 'head' on an empty list")),
            }
        },

        "tail" => |_env, args| {
            // Get the tail (all elements but the head) of a list. Not allowed in empty lists.
            let list = args[0].as_list();
            match list.get(1..) {
                Some(t) => Ok(Value::List(t.to_vec())),
                None => Err(QuintError::new("QNT505", "Called 'tail' on an empty list")),
            }
        },

        "slice" => |_env, args| {
            let list = args[0].as_list();
            let start = args[1].as_int();
            let end = args[2].as_int();

            match list.get(start as usize..end as usize) {
                Some(s) if start >= 0 => Ok(Value::List(s.to_vec())),
                _ => Err(QuintError::new(
                    "QNT506",
                    format!(
                        "slice(..., {start}, {end}) applied to a list of size {size}",
                        start = start,
                        end = end,
                        size = list.len()
                    )
                    .as_str(),
                )),
            }
        },

        "length" => |_env, args| Ok(Value::Int(args[0].cardinality().try_into().unwrap())),
        "append" => |_env, args| {
            let mut list = args[0].as_list().clone();
            list.push(args[1].clone());
            Ok(Value::List(list))
        },
        "concat" => |_env, args| {
            let mut list = args[0].as_list().clone();
            list.extend(args[1].as_list().iter().cloned());
            Ok(Value::List(list))
        },
        "indices" => |_env, args| {
            let size: i64 = args[0].cardinality().try_into().unwrap();
            Ok(Value::Interval(0, size - 1))
        },

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

        "powerset" => |_env, args| Ok(Value::PowerSet(Box::new(args[0].clone()))),
        "contains" => |_env, args| Ok(Value::Bool(args[0].contains(&args[1]))),
        "in" => |_env, args| Ok(Value::Bool(args[1].contains(&args[0]))),
        "subseteq" => |_env, args| Ok(Value::Bool(args[0].subseteq(&args[1]))),
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

        "size" => |_env, args| Ok(Value::Int(args[0].cardinality().try_into().unwrap())),

        "isFinite" => |_env, _args| {
            // at the moment, we support only finite sets, so just return true
            Ok(Value::Bool(true))
        },
        "to" => |_env, args| {
            let start = args[0].as_int();
            let end = args[1].as_int();
            if start > end {
                // Avoid having different intervals that represent the same thing (empty set)
                return Ok(Value::Set(FxHashSet::default()));
            }
            Ok(Value::Interval(start, end))
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

        "flatten" => |_env, args| {
            Ok(Value::Set(
                args[0].as_set().iter().flat_map(|v| v.as_set()).collect(),
            ))
        },

        "get" => |_env, args| {
            let map = args[0].as_map();
            let key = args[1].clone();
            match map.get(&key) {
                Some(value) => Ok(value.clone()),
                None => Err(QuintError::new(
                    "QNT507",
                    format!(
                        "Called 'get' with a non-existing key. Key is {key}. Map has keys: {keys}",
                        key = key,
                        keys = map.keys().map(|k| k.to_string()).join(", ")
                    )
                    .as_str(),
                )),
            }
        },

        "set" => |_env, args| {
            let mut map = args[0].as_map().clone();
            let key = args[1].clone();

            if !map.contains_key(&key) {
                return Err(QuintError::new(
                    "QNT507",
                    "Called 'set' with a non-existing key",
                ));
            }

            map.insert(key, args[2].clone());
            Ok(Value::Map(map))
        },
        "put" => |_env, args| {
            let mut map = args[0].as_map().clone();
            let key = args[1].clone();
            let value = args[2].clone();
            map.insert(key, value);
            Ok(Value::Map(map))
        },

        "setBy" => |env, args| {
            let mut map = args[0].as_map().clone();
            let key = args[1].clone();
            match map.get(&key) {
                Some(value) => {
                    let new_value = args[2].as_closure()(env, vec![value.clone()])?;
                    map.insert(key, new_value);
                    Ok(Value::Map(map))
                }
                None => Err(QuintError::new(
                    "QNT507",
                    format!("Called 'setBy' with a non- existing key {}", key).as_str(),
                )),
            }
        },

        "keys" => |_env, args| Ok(Value::Set(args[0].as_map().keys().cloned().collect())),
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

        "select" => |env, args| {
            Ok(Value::List(args[0].as_list().iter().try_fold(
                vec![],
                |mut acc, v| {
                    if args[1].as_closure()(env, vec![v.clone()])?.as_bool() {
                        acc.push(v.clone());
                    }
                    Ok(acc)
                },
            )?))
        },

        "mapBy" => |env, args| {
            let closure = args[1].as_closure();
            let keys = args[0].as_set();
            let size = keys.len();

            Ok(Value::Map(keys.iter().try_fold(
                FxHashMap::with_capacity_and_hasher(size, Default::default()),
                |mut acc, key| {
                    let value = closure(env, vec![key.clone()])?;
                    acc.insert(key.clone(), value);
                    Ok(acc)
                },
            )?))
        },
        "setToMap" => |_env, args| {
            let set = args[0].as_set();
            Ok(Value::Map(set.iter().map(|v| v.as_tuple2()).collect()))
        },
        "setOfMaps" => |_env, args| {
            Ok(Value::MapSet(
                Box::new(args[0].clone()),
                Box::new(args[1].clone()),
            ))
        },

        // TODO fail, assert
        "allListsUpTo" => |_env, args| {
            let set = args[0].as_set();
            let length = args[1].as_int();
            let mut lists = FxHashSet::default();
            let mut last_lists = FxHashSet::<Vec<Value>>::default();
            lists.insert(vec![]);
            last_lists.insert(vec![]);
            for _ in 0..length {
                let new_lists: FxHashSet<Vec<Value>> = set
                    .iter()
                    .flat_map(|value| {
                        last_lists.iter().map(move |list| {
                            let mut new_list = list.clone();
                            new_list.push(value.clone());
                            new_list
                        })
                    })
                    .collect();
                lists.extend(new_lists.iter().cloned());
                last_lists = new_lists;
            }

            Ok(Value::Set(lists.into_iter().map(Value::List).collect()))
        },
        "getOnlyElement" => |_env, args| {
            let set = args[0].as_set();
            let mut iter = set.clone().into_iter();
            match (iter.next(), iter.next()) {
                (Some(v), None) => Ok(v),
                (_, _) => Err(QuintError::new(
                    "QNT505",
                    format!(
                        "Called 'getOnlyElement' on a set with {} elements.\
                        Make sure the set has exactly one element.",
                        set.clone().len()
                    )
                    .as_str(),
                )),
            }
        },
        // TODO: extra ops, (q::debug ...)
        _ => {
            panic!("Unknown eager op: {op}")
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
