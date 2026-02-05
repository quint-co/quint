//! Nondeterministic evaluation with retry logic for oneOf expressions.
//!
//! This module implements the retry logic for `nondet` expressions with `oneOf`,
//! matching the behavior from the TypeScript implementation in PR #1670.

use crate::{
    evaluator::{CompiledExpr, Env},
    ir::QuintError,
    value::{Value, ValueInner},
};
use num_bigint::BigUint;
use std::cell::RefCell;
use std::rc::Rc;
use std::sync::OnceLock;

static RETRY_THRESHOLD: OnceLock<usize> = OnceLock::new();

/// The maximum size of set bounds for which we retry nondet expressions.
/// If the set is too big, it is better to be greedy and let the execution fail
/// if we pick a "wrong" value. As retrying large sets can take a long time.
///
/// Configurable via QUINT_RETRY_NONDET_SMALLER_THAN environment variable.
///
/// Using OnceLock to avoid reading and parsing the environment variable on
/// every call.
fn get_retry_threshold() -> usize {
    *RETRY_THRESHOLD.get_or_init(|| {
        std::env::var("QUINT_RETRY_NONDET_SMALLER_THAN")
            .ok()
            .and_then(|s| s.parse().ok())
            .unwrap_or(100)
    })
}

/// Check if we should retry nondet expressions based on set bounds.
/// We only retry if all bounds are smaller than the threshold and finite.
fn should_retry_nondet(bounds: &[usize]) -> bool {
    let threshold = get_retry_threshold();
    bounds.iter().all(|&bound| bound < threshold)
}

/// Increment positions to the next combination, similar to counting in mixed-radix.
/// Returns true if we successfully incremented, false if we've wrapped around.
fn increment_positions(positions: &mut [usize], bounds: &[usize]) {
    for i in (0..positions.len()).rev() {
        if positions[i] < bounds[i] - 1 {
            positions[i] += 1;
            return;
        } else {
            positions[i] = 0;
        }
    }
}

/// Evaluates a nondet oneOf expression with retry logic.
///
/// This function implements the retry behavior where:
/// - If the set is empty, returns false
/// - If the body evaluates to false and the set is small enough, retries with next position
/// - If the set is too large, doesn't retry (for performance)
/// - Continues until a non-false result or all positions are exhausted
pub fn eval_nondet_one_of(
    set_expr: CompiledExpr,
    body_expr: CompiledExpr,
    cached_value: Rc<RefCell<Option<Result<Value, QuintError>>>>,
) -> CompiledExpr {
    CompiledExpr::new(move |env: &mut Env| {
        // Evaluate the set from which to pick
        let set = set_expr.execute(env)?;

        // Special handling for large PowerSet
        // These are too large to retry through, so just pick once
        if set.is_large_powerset() {
            if let ValueInner::PowerSet(base_set) = set.0.as_ref() {
                let n = base_set.cardinality().map_err(|e| {
                    QuintError::new(
                        "QNT601",
                        &format!("Failed to compute powerset base cardinality: {}", e.message),
                    )
                })?;
                let cardinality = BigUint::from(1u64) << n;
                let random_index = env.rand.next_biguint(&cardinality);
                let positions: Vec<usize> = random_index
                    .to_u32_digits()
                    .iter()
                    .map(|&d| d as usize)
                    .collect();

                let picked_value = set.pick(&mut positions.into_iter())?;
                cached_value.replace(Some(Ok(picked_value)));
                let result = body_expr.execute(env);
                cached_value.replace(None);
                return result;
            }
        }

        // Standard path for other sets and small powersets
        let bounds = set.bounds()?;
        for bound in &bounds {
            if *bound == 0 {
                return Ok(Value::bool(false));
            }
        }

        // Generate initial random positions
        let original_positions = bounds
            .iter()
            .map(|&bound| env.rand.next(bound))
            .collect::<Vec<_>>();
        let mut new_positions = original_positions.clone();

        // Check if we should retry based on set size
        let should_retry_set = should_retry_nondet(&bounds);

        loop {
            let picked_value = set.pick(&mut new_positions.iter().copied())?;

            // Set the picked value to the corresponding cache and evaluate the body
            cached_value.replace(Some(Ok(picked_value)));
            let result = body_expr.execute(env);

            // If result is false and we can retry, try next position
            let should_retry = matches!(result, Ok(ref v) if matches!(v.0.as_ref(), ValueInner::Bool(false)))
                && should_retry_set;

            if should_retry {
                // Increment positions to try next combination
                increment_positions(&mut new_positions, &bounds);

                // If we're back to original positions, we've tried everything
                if new_positions == original_positions {
                    // Clear the cached value and return the last result
                    cached_value.replace(None);
                    return result;
                }
            } else {
                // Clear the cached value and return the result (success or error)
                cached_value.replace(None);
                return result;
            }
        }
    })
}
