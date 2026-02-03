//! Normalization for [`Value`], which consists of enumerating sets. Used for
//! map keys and set elements, to make sure we don't end up with something like
//! `Map(Set(1, 2, 3) -> "a", 1.to(3) -> "b")` (the two keys are the same).

use crate::value::{Value, ValueInner};
use crate::ir::QuintError;

impl Value {
    #[allow(clippy::unnecessary_to_owned)]
    pub fn normalize(self) -> Result<Value, QuintError> {
        
        Ok(match self.0.as_ref() {
            ValueInner::Int(_) | ValueInner::Bool(_) | ValueInner::Str(_) => self,
            ValueInner::Set(_)
            | ValueInner::Interval(_, _)
            | ValueInner::CrossProduct(_)
            | ValueInner::PowerSet(_)
            | ValueInner::MapSet(_, _) => {
                let set = self.as_set()?;
                let normalized: Result<Vec<_>, _> = set
                    .iter()
                    .map(|v| v.clone().normalize())
                    .collect();
                Value::set(normalized?.into_iter().collect())
            }
            ValueInner::Tuple(elems) => {
                let normalized: Result<Vec<_>, _> = elems.iter().cloned().map(|v| v.normalize()).collect();
                Value::tuple(normalized?.into_iter().collect())
            }
            ValueInner::Record(fields) => {
                let normalized: Result<Vec<_>, _> = fields
                    .iter()
                    .map(|(k, v)| Ok((k.clone(), v.clone().normalize()?)))
                    .collect();
                Value::record(normalized?.into_iter().collect())
            }
            ValueInner::Map(map) => {
                let normalized: Result<Vec<_>, _> = map
                    .iter()
                    .map(|(k, v)| Ok((k.clone().normalize()?, v.clone().normalize()?)))
                    .collect();
                Value::map(normalized?.into_iter().collect())
            }
            ValueInner::List(elems) => {
                let normalized: Result<Vec<_>, _> = elems.iter().cloned().map(|v| v.normalize()).collect();
                Value::list(normalized?.into_iter().collect())
            }
            ValueInner::Variant(label, value) => {
                Value::variant(label.clone(), value.clone().normalize()?)
            }
            ValueInner::Lambda(_, _) => panic!("Cannot normalize lambda"),
        })
    }
}
