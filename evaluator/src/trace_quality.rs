//! Trace quality comparison logic.
//!
//! This module contains all logic for comparing traces by quality, used for
//! selecting the "best" traces during simulation.

use std::cmp::Ordering;

use crate::Verbosity;

/// Trait for types that can be compared by trace quality.
pub trait TraceQuality {
    /// Returns true if this trace represents a violation of an invariant.
    fn is_violation(&self) -> bool;

    /// Returns true if this trace contains diagnostic information.
    fn has_diagnostics(&self) -> bool;

    /// Returns the length (number of states) in this trace.
    fn trace_length(&self) -> usize;
}

/// Compare two values by quality using the TraceQuality trait.
///
/// Prefer short traces for violations, and longer traces for non-violations. Therefore,
/// trace a is better than trace b iff:
///
///  - when a has a violation: a is shorter or b has no violation;
///  - when a has no violation: a is longer and b has no violation.
///
/// For traces considered of equal value, both violations or both non-violations, we
/// consider the one with diagnostics to be better (if verbosity allows).
pub fn compare_by_quality<T: TraceQuality>(a: &T, b: &T, verbosity: Verbosity) -> Ordering {
    #[inline]
    fn flag_cmp<F>(a: bool, b: bool, elze: F) -> Ordering
    where
        F: FnOnce(bool) -> Ordering,
    {
        match (a, b) {
            (true, false) => Ordering::Less,
            (false, true) => Ordering::Greater,
            _ => elze(a), // a and b can only be equal here
        }
    }

    flag_cmp(a.is_violation(), b.is_violation(), |both_violations| {
        flag_cmp(
            verbosity.has_diagnostics() && a.has_diagnostics(),
            verbosity.has_diagnostics() && b.has_diagnostics(),
            |_| {
                if both_violations {
                    a.trace_length().cmp(&b.trace_length())
                } else {
                    b.trace_length().cmp(&a.trace_length())
                }
            },
        )
    })
}

/// Insert a value into a sorted vector, maintaining order by quality.
///
/// After insertion, if the vector exceeds `max_capacity`, the worst element is removed.
pub fn insert_sorted_by_quality<T: TraceQuality>(
    collection: &mut Vec<T>,
    item: T,
    max_capacity: usize,
    verbosity: Verbosity,
) {
    let pos =
        collection.binary_search_by(|existing| compare_by_quality(existing, &item, verbosity));
    collection.insert(pos.unwrap_or_else(|i| i), item);
    if collection.len() > max_capacity {
        collection.pop();
    }
}
