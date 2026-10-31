//! Normalization for [`Value`], which consists of enumerating sets. Used for
//! map keys and set elements, to make sure we don't end up with something like
//! `Map(Set(1, 2, 3) -> "a", 1.to(3) -> "b")` (the two keys are the same).

use crate::ir::QuintError;
use crate::value::{Value, ValueRef};

impl Value {
    #[allow(clippy::unnecessary_to_owned)]
    pub fn normalize(self) -> Result<Value, QuintError> {
        Ok(match self.view() {
            ValueRef::Int(_) | ValueRef::BigInt(_) | ValueRef::Bool(_) | ValueRef::Str(_) => self,
            // Infinite sets cannot be normalized (they're already in canonical form)
            ValueRef::InfiniteInt | ValueRef::InfiniteNat => self,
            ValueRef::Set(_)
            | ValueRef::Interval(_, _)
            | ValueRef::CrossProduct(_)
            | ValueRef::PowerSet(_)
            | ValueRef::MapSet(_, _) => Value::set(
                self.as_set_iter()?
                    .map(|v| v.normalize())
                    .collect::<Result<_, _>>()?,
            ),
            ValueRef::Tuple(elems) => {
                let normalized = elems
                    .iter()
                    .cloned()
                    .map(|v| v.normalize())
                    .collect::<Result<_, _>>()?;
                Value::tuple(normalized)
            }
            ValueRef::Record(fields) => {
                let normalized = fields
                    .iter()
                    .map(|(k, v)| Ok((k.clone(), v.clone().normalize()?)))
                    .collect::<Result<_, _>>()?;
                Value::record(normalized)
            }
            ValueRef::Map(map) => {
                let normalized = map
                    .iter()
                    .map(|(k, v)| Ok((k.clone().normalize()?, v.clone().normalize()?)))
                    .collect::<Result<_, _>>()?;
                Value::map(normalized)
            }
            ValueRef::List(elems) => {
                let normalized = elems
                    .iter()
                    .cloned()
                    .map(|v| v.normalize())
                    .collect::<Result<_, _>>()?;
                Value::list(normalized)
            }
            ValueRef::Variant(label, value) => {
                Value::variant(label.clone(), value.clone().normalize()?)
            }
            ValueRef::Lambda(_, _) => panic!("Cannot normalize lambda"),
        })
    }
}
