//! Normalization for [`Value`], which consists of enumerating sets. Used for
//! map keys and set elements, to make sure we don't end up with something like
//! `Map(Set(1, 2, 3) -> "a", 1.to(3) -> "b")` (the two keys are the same).

use crate::value::Value;
use std::rc::Rc;

impl Value {
    #[allow(clippy::unnecessary_to_owned)]
    pub fn normalize(self) -> Value {
        match self {
            Value::Int(_) | Value::Bool(_) | Value::Str(_) => self,
            Value::Set(_)
            | Value::Interval(_, _)
            | Value::CrossProduct(_)
            | Value::PowerSet(_)
            | Value::MapSet(_, _) => Value::Set(
                self.as_set()
                    .into_owned()
                    .into_iter()
                    .map(|v| v.normalize())
                    .collect(),
            ),
            Value::Tuple(elems) => Value::Tuple(elems.into_iter().map(|v| v.normalize()).collect()),
            Value::Record(fields) => Value::Record(
                fields
                    .into_iter()
                    .map(|(k, v)| (k, v.normalize()))
                    .collect(),
            ),
            Value::Map(map) => Value::Map(
                map.into_iter()
                    .map(|(k, v)| (k.normalize(), v.normalize()))
                    .collect(),
            ),
            Value::List(elems) => Value::List(elems.into_iter().map(|v| v.normalize()).collect()),
            Value::Variant(label, value) => {
                Value::Variant(label, Rc::new(<Value as Clone>::clone(&value).normalize()))
            }
            Value::Lambda(_, _) => panic!("Cannot normalize lambda"),
        }
    }
}
