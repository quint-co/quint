//! Picking values out of sets without enumerating the elements.

use crate::ir::QuintError;
use crate::value::{powerset_at_index, powerset_at_index_large, ImmutableMap, Value, ValueInner};
use num_bigint::BigUint;

impl Value {
    /// Pick a value from the set, using the given indexes, without enumerating
    /// the elements (and thus avoiding expensive computations).
    ///
    /// The given indexes should have the same length as the length [`bounds`]
    /// for this value, and each value should be within its respective bound.
    pub fn pick<T: Iterator<Item = u64>>(&self, indexes: &mut T) -> Result<Value, QuintError> {
        Ok(match self.0.as_ref() {
            ValueInner::Set(set) => {
                let index = indexes
                    .next()
                    .expect("Internal error: too few positions. Report a bug");

                set.iter()
                    .nth(index as usize)
                    .cloned()
                    .expect("Internal error: Index out of bounds. Report a bug")
            }
            ValueInner::Interval(start, end) => {
                let index = indexes
                    .next()
                    .expect("Internal error: too few positions. Report a bug");
                let idx: i64 = index as i64;
                assert!(idx <= end - start);
                Value::int(start + idx)
            }
            ValueInner::CrossProduct(sets) => {
                let elements = sets
                    .iter()
                    .map(|value| value.pick(indexes))
                    .collect::<Result<_, _>>()?;
                Value::tuple(elements)
            }
            ValueInner::PowerSet(base_set) => {
                if self.is_large_powerset() {
                    // Large powerset: reassemble u32 digits into BigUint
                    let digits: Vec<u32> = indexes.map(|i| i as u32).collect();
                    let big_index = BigUint::new(digits);
                    let base = base_set.as_set()?;
                    powerset_at_index_large(base.as_ref(), &big_index)
                } else {
                    // Small powerset: single index
                    let index = indexes
                        .next()
                        .expect("Internal error: too few positions. Report a bug");
                    let base = base_set.as_set()?;
                    powerset_at_index(base.as_ref(), index)
                }
            }
            ValueInner::MapSet(domain, range) => {
                let domain_size = domain.cardinality()?;

                if domain_size == 0 {
                    // To reflect the behaviour of TLC, an empty domain needs to give Set(Map()),
                    // so the only element we can pick is Map().
                    return Ok(Value::map(ImmutableMap::default()));
                }

                // Check that range is non-empty for non-infinite sets
                // Infinite sets (Int, Nat) will fail the cardinality check, which is fine
                if !matches!(
                    range.0.as_ref(),
                    ValueInner::InfiniteInt | ValueInner::InfiniteNat
                ) {
                    let range_size = range.cardinality()?;
                    assert!(range_size > 0, "Range can't be zero");
                }

                let range_to_pick = if matches!(range.0.as_ref(), ValueInner::MapSet(_, _)) {
                    Value::set(range.as_set()?.into_owned())
                } else {
                    range.clone()
                };

                let keys = domain.as_set()?;
                let key_values = keys
                    .iter()
                    .map(|key| {
                        let value = range_to_pick.pick(indexes)?;
                        Ok((key.clone(), value))
                    })
                    .collect::<Result<_, _>>()?;

                Value::map(key_values)
            }
            ValueInner::InfiniteInt => {
                // Pick a random integer from the entire i64 range
                let index = indexes
                    .next()
                    .expect("Internal error: too few positions. Report a bug");

                // Offset by i64::MIN to include negative values on all architectures
                let value = (index as i64).wrapping_add(i64::MIN);

                Value::int(value)
            }
            ValueInner::InfiniteNat => {
                // Pick a random natural number (>= 0)
                // The bound is set to i64::MAX, so this is always non-negative
                let index = indexes
                    .next()
                    .expect("Internal error: too few positions. Report a bug");

                let value = index as i64;
                Value::int(value)
            }
            _ => panic!("Not a set"),
        })
    }

    // Some sets require multiple random numbers in order to pick an element efficiently.
    // For example, a cross product will require one random number per set, and return a tuple like
    // (set1.pick(r1), set2.pick(r2), ..., setn.pick(rn)). The `bounds` function will return the list of
    // ranges (bounds) from which each of those numbers should be picked from.
    pub fn bounds(&self) -> Result<Vec<u64>, QuintError> {
        Ok(match self.0.as_ref() {
            ValueInner::Set(set) => vec![set.len() as u64],
            ValueInner::Interval(_, _) => vec![self.cardinality()?],
            ValueInner::CrossProduct(sets) => sets
                .iter()
                .map(|set| set.cardinality())
                .collect::<Result<Vec<_>, _>>()?,
            ValueInner::PowerSet(base_set) => {
                if self.is_large_powerset() {
                    // Large powerset: return vectorized representation as u32 digits
                    // The caller will reassemble these into BigUint for random generation
                    let n = base_set.cardinality()?;
                    let cardinality = BigUint::from(1u64) << n;
                    // Return the u32 digits as individual u64 bounds
                    cardinality
                        .to_u32_digits()
                        .iter()
                        .map(|&d| d as u64)
                        .collect()
                } else {
                    vec![self.cardinality()?]
                }
            }
            ValueInner::MapSet(domain, range) => {
                // If the range is an infinite set, we handle it specially
                let range_bounds = range.bounds()?;
                let domain_card = domain.cardinality()? as usize;

                // Repeat the range bounds for each element in the domain
                range_bounds.repeat(domain_card)
            }
            ValueInner::InfiniteInt => {
                // For Int, we use the maximum u64 value as the bound
                // This allows picking from the full i64 range via wrapping conversion
                vec![u64::MAX]
            }
            ValueInner::InfiniteNat => {
                // For Nat, we bound to i64::MAX + 1 so values stay in [0,
                // i64::MAX] when converted to i64 (which is necessary as the
                // result of pick() must be a Value::Int and thus fit in i64).
                vec![i64::MAX as u64 + 1]
            }
            _ => panic!("Not a set"),
        })
    }
}
