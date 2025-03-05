use std::rc::Rc;

use crate::value::Value;

impl<'a> Value<'a> {
    #[allow(clippy::unnecessary_to_owned)]
    pub fn normalize(self) -> Value<'a> {
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
            Value::Variant(label, value) => Value::Variant(
                label,
                Rc::new(<Value<'_> as Clone>::clone(&value).normalize()),
            ),
            Value::Lambda(_, _) => panic!("Cannot normalize lambda"),
        }
    }
}
