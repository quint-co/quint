
use crate::{
    ir::ImmutableMap,
    value::{powerset_at_index, Value},
};
use std::convert::TryInto;

impl<'a> Value<'a> {
    pub fn pick<T: Iterator<Item = usize>>(&self, indexes: &mut T) -> Value<'a> {
        match self {
            Value::Set(set) => {
                let index = indexes
                    .next()
                    .expect("Internal error: too few positions. Report a bug");
                set.iter().collect::<Vec<_>>()[index].clone()
            }
            Value::Interval(start, end) => {
                let index = indexes
                    .next()
                    .expect("Internal error: too few positions. Report a bug");
                let idx: i64 = <usize as TryInto<i64>>::try_into(index).unwrap();
                assert!(idx <= end - start);
                Value::Int(start + idx)
            }
            Value::CrossProduct(sets) => {
                Value::Tuple(sets.iter().map(|value| value.pick(indexes)).collect())
            }
            Value::PowerSet(base_set) => {
                let index = indexes
                    .next()
                    .expect("Internal error: too few positions. Report a bug");
                powerset_at_index(&base_set.as_set(), index)
            }
            Value::MapSet(domain, range) => {
                let domain_size = domain.cardinality();
                let range_size = range.cardinality();

                if domain_size == 0 {
                    // To reflect the behaviour of TLC, an empty domain needs to give Set(Map())
                    return Value::Map(ImmutableMap::default());
                }

                assert!(range_size > 0, "Range can't be zero");

                let keys = domain.as_set();
                let key_values = keys.iter().map(|key| {
                    let value = range.pick(indexes);
                    (key.clone(), value)
                });

                Value::Map(ImmutableMap::from_iter(key_values))
            }
            _ => panic!("Not a set"),
        }
    }

    pub fn bounds(&self) -> Vec<usize> {
        match self {
            Value::Set(set) => vec![set.len()],
            Value::Interval(_, _) => vec![self.cardinality()],
            Value::CrossProduct(sets) => sets.iter().map(|set| set.cardinality()).collect(),
            Value::PowerSet(base_set) => vec![base_set.cardinality()],
            Value::MapSet(domain, range) => {
                // Cardinality of range repeated domain times
                vec![range.cardinality(); domain.cardinality()]
            }
            _ => panic!("Not a set"),
        }
    }
}
