//! Picking values out of sets without enumerating the elements.

use crate::value::{powerset_at_index, ImmutableMap, Value, ValueInner};
use std::convert::TryInto;

impl Value {
    /// Pick a value from the set, using the given indexes, without enumerating
    /// the elements (and thus avoiding expensive computations).
    ///
    /// The given indexes should have the same length as the length [`bounds`]
    /// for this value, and each value should be within its respective bound.
    pub fn pick<T: Iterator<Item = usize>>(&self, indexes: &mut T) -> Value {
        match self.0.as_ref() {
            ValueInner::Set(set) => {
                let index = indexes
                    .next()
                    .expect("Internal error: too few positions. Report a bug");
                set.iter().collect::<Vec<_>>()[index].clone()
            }
            ValueInner::Interval(start, end) => {
                let index = indexes
                    .next()
                    .expect("Internal error: too few positions. Report a bug");
                let idx: i64 = <usize as TryInto<i64>>::try_into(index).unwrap();
                assert!(idx <= end - start);
                Value::int(start + idx)
            }
            ValueInner::CrossProduct(sets) => {
                Value::tuple(sets.iter().map(|value| value.pick(indexes)).collect())
            }
            ValueInner::PowerSet(base_set) => {
                let index = indexes
                    .next()
                    .expect("Internal error: too few positions. Report a bug");
                powerset_at_index(&base_set.as_set(), index)
            }
            ValueInner::MapSet(domain, range) => {
                let domain_size = domain.cardinality();
                let range_size = range.cardinality();

                if domain_size == 0 {
                    // To reflect the behaviour of TLC, an empty domain needs to give Set(Map()),
                    // so the only element we can pick is Map().
                    return Value::map(ImmutableMap::default());
                }

                assert!(range_size > 0, "Range can't be zero");

                let range_to_pick = if matches!(range.0.as_ref(), ValueInner::MapSet(_, _)) {
                    Value::set(range.as_set().into_owned())
                } else {
                    range.clone()
                };

                let keys = domain.as_set();
                let key_values = keys.iter().map(|key| {
                    let value = range_to_pick.pick(indexes);
                    (key.clone(), value)
                });

                Value::map(ImmutableMap::from_iter(key_values))
            }
            _ => panic!("Not a set"),
        }
    }

    // Some sets require multiple random numbers in order to pick an element efficiently.
    // For example, a cross product will require one random number per set, and return a tuple like
    // (set1.pick(r1), set2.pick(r2), ..., setn.pick(rn)). The `bounds` function will return the list of
    // ranges (bounds) from which each of those numbers should be picked from.
    pub fn bounds(&self) -> Vec<usize> {
        match self.0.as_ref() {
            ValueInner::Set(set) => vec![set.len()],
            ValueInner::Interval(_, _) => vec![self.cardinality()],
            ValueInner::CrossProduct(sets) => sets.iter().map(|set| set.cardinality()).collect(),
            ValueInner::PowerSet(base_set) => vec![base_set.cardinality()],
            ValueInner::MapSet(domain, range) => {
                // Cardinality of range repeated domain times
                vec![range.cardinality(); domain.cardinality()]
            }
            _ => panic!("Not a set"),
        }
    }
}
