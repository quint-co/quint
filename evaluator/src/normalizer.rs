//! Normalization for [`Value`], which consists of enumerating sets. Used for
//! map keys and set elements, to make sure we don't end up with something like
//! `Map(Set(1, 2, 3) -> "a", 1.to(3) -> "b")` (the two keys are the same).

use crate::value::{Value, ValueInner};

impl Value {
    #[allow(clippy::unnecessary_to_owned)]
    pub fn normalize(self) -> Value {
        match self.0.as_ref() {
            ValueInner::Int(_) | ValueInner::Bool(_) | ValueInner::Str(_) => self,
            ValueInner::Set(_)
            | ValueInner::Interval(_, _)
            | ValueInner::CrossProduct(_)
            | ValueInner::PowerSet(_)
            | ValueInner::MapSet(_, _) => Value::set(
                self.as_set()
                    .into_owned()
                    .into_iter()
                    .map(|v| v.normalize())
                    .collect(),
            ),
            ValueInner::Tuple(elems) => Value::tuple(elems.iter().cloned().map(|v| v.normalize()).collect()),
            ValueInner::Record(fields) => Value::record(
                fields
                    .iter()
                    .map(|(k, v)| (k.clone(), v.clone().normalize()))
                    .collect(),
            ),
            ValueInner::Map(map) => Value::map(
                map.iter()
                    .map(|(k, v)| (k.clone().normalize(), v.clone().normalize()))
                    .collect(),
            ),
            ValueInner::List(elems) => Value::list(elems.iter().cloned().map(|v| v.normalize()).collect()),
            ValueInner::Variant(label, value) => {
                Value::variant(label.clone(), value.clone().normalize())
            }
            ValueInner::Lambda(_, _) => panic!("Cannot normalize lambda"),
        }
    }
}
