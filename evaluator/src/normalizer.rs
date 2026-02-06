//! Normalization for [`Value`], which consists of enumerating sets. Used for
//! map keys and set elements, to make sure we don't end up with something like
//! `Map(Set(1, 2, 3) -> "a", 1.to(3) -> "b")` (the two keys are the same).

use crate::ir::QuintError;
use crate::value::{Value, ValueInner};

impl Value {
    #[allow(clippy::unnecessary_to_owned)]
    pub fn normalize(self) -> Result<Value, QuintError> {
        Ok(match self.0.as_ref() {
            ValueInner::Int(_) | ValueInner::Bool(_) | ValueInner::Str(_) => self,
            ValueInner::Set(_)
            | ValueInner::Interval(_, _)
            | ValueInner::CrossProduct(_)
            | ValueInner::PowerSet(_)
            | ValueInner::MapSet(_, _)
            | ValueInner::InfiniteInt
            | ValueInner::InfiniteNat => Value::set(
                self.as_set()?
                    .into_owned()
                    .into_iter()
                    .map(|v| v.normalize())
                    .collect::<Result<_, _>>()?,
            ),
            ValueInner::Tuple(elems) => {
                let normalized = elems
                    .iter()
                    .cloned()
                    .map(|v| v.normalize())
                    .collect::<Result<_, _>>()?;
                Value::tuple(normalized)
            }
            ValueInner::Record(fields) => {
                let normalized = fields
                    .iter()
                    .map(|(k, v)| Ok((k.clone(), v.clone().normalize()?)))
                    .collect::<Result<_, _>>()?;
                Value::record(normalized)
            }
            ValueInner::Map(map) => {
                let normalized = map
                    .iter()
                    .map(|(k, v)| Ok((k.clone().normalize()?, v.clone().normalize()?)))
                    .collect::<Result<_, _>>()?;
                Value::map(normalized)
            }
            ValueInner::List(elems) => {
                let normalized = elems
                    .iter()
                    .cloned()
                    .map(|v| v.normalize())
                    .collect::<Result<_, _>>()?;
                Value::list(normalized)
            }
            ValueInner::Variant(label, value) => {
                Value::variant(label.clone(), value.clone().normalize()?)
            }
            ValueInner::Lambda(_, _) => panic!("Cannot normalize lambda"),
        })
    }
}
