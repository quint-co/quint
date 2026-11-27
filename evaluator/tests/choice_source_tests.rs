//! Tests for [`quint_evaluator::rand::ChoiceSource`] injection into [`Rand`].
//!
//! Three groups:
//!
//! 1. **Pure `Rand` unit tests** (no CLI): verify the delegation contract,
//!    counter-advance semantics, and that a tape of `[2, 0, 1, 7]` is returned
//!    verbatim.
//! 2. **`actionAny` slot count** (requires `quint` CLI): verifies that N actions
//!    consume exactly N draws.
//! 3. **Nondet retry** (requires `quint` CLI): verifies that retry is
//!    draw-free — only the initial-position draw is ever charged.

use std::{cell::Cell, rc::Rc};

use num_bigint::BigUint;
use quint_evaluator::{
    evaluator::{Env, Interpreter},
    helpers,
    rand::{ChoiceSource, Rand},
    value::Value,
    Verbosity,
};

// ─────────────────────────────────────────────────────────────────────────────
// Test double: a ChoiceSource that returns pre-loaded values and counts calls.
// ─────────────────────────────────────────────────────────────────────────────

struct CountingSource {
    values: Vec<u64>,
    idx: usize,
    call_count: Rc<Cell<usize>>,
}

impl CountingSource {
    fn new(values: Vec<u64>, call_count: Rc<Cell<usize>>) -> Self {
        Self {
            values,
            idx: 0,
            call_count,
        }
    }
}

impl ChoiceSource for CountingSource {
    fn next(&mut self, _bound: u64) -> u64 {
        assert!(
            self.idx < self.values.len(),
            "CountingSource exhausted at call {}: only {} value(s) loaded",
            self.idx + 1,
            self.values.len()
        );
        let v = self.values[self.idx];
        self.idx += 1;
        self.call_count.set(self.call_count.get() + 1);
        v
    }

    fn next_biguint(&mut self, _bound: &BigUint) -> BigUint {
        assert!(
            self.idx < self.values.len(),
            "CountingSource exhausted at call {}: only {} value(s) loaded",
            self.idx + 1,
            self.values.len()
        );
        let v = BigUint::from(self.values[self.idx]);
        self.idx += 1;
        self.call_count.set(self.call_count.get() + 1);
        v
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Group 1 — Pure Rand unit tests (no CLI dependency)
// ─────────────────────────────────────────────────────────────────────────────

/// A tape delivering `[2, 0, 1, 7]` produces exactly those values from
/// `Rand::next` when every call uses `bound >= 8`.
///
/// Verifies the basic end-to-end contract: the source's return value
/// is forwarded verbatim, not reduced modulo bound or otherwise transformed.
#[test]
fn tape_delivers_values_in_order() {
    let count = Rc::new(Cell::new(0usize));
    // bound=10 for all four draws; 7 < 10, so every value is in [0, bound).
    let source = CountingSource::new(vec![2, 0, 1, 7], count.clone());

    let mut rand = Rand::with_state(42);
    rand.set_choice_source(Box::new(source));

    assert_eq!(rand.next(10), 2, "1st draw");
    assert_eq!(rand.next(10), 0, "2nd draw");
    assert_eq!(rand.next(10), 1, "3rd draw");
    assert_eq!(rand.next(10), 7, "4th draw");

    assert_eq!(count.get(), 4, "source must be called exactly 4 times");
}

/// Without a choice source the counter advances by exactly 1 per `next()` call,
/// matching the unpatched behavior (QA-failure / no-regression gate).
#[test]
fn no_source_counter_advances_by_one_per_draw() {
    let mut rand = Rand::with_state(1000);
    assert_eq!(rand.get_state(), 1000);

    let _ = rand.next(100);
    assert_eq!(rand.get_state(), 1001);

    let _ = rand.next(100);
    assert_eq!(rand.get_state(), 1002);

    let _ = rand.next(100);
    assert_eq!(rand.get_state(), 1003);
}

/// With a choice source installed the counter still advances by 1 per draw
/// (§3c: "always advance the counter").
///
/// This keeps `get_state()` monotonic regardless of whether a source is present,
/// which is important for seed-based replay and simulator statistics.
#[test]
fn with_source_counter_still_advances() {
    let count = Rc::new(Cell::new(0usize));
    let source = CountingSource::new(vec![0, 0, 0, 0, 0], count.clone());

    let mut rand = Rand::with_state(500);
    rand.set_choice_source(Box::new(source));

    assert_eq!(rand.get_state(), 500);
    let _ = rand.next(10);
    assert_eq!(rand.get_state(), 501);
    let _ = rand.next(10);
    assert_eq!(rand.get_state(), 502);

    assert_eq!(count.get(), 2);
}

// ─────────────────────────────────────────────────────────────────────────────
// Group 2 — Integration tests (require `quint` CLI on PATH)
// ─────────────────────────────────────────────────────────────────────────────

/// `actionAny` over N actions consumes exactly N draws (one per Fisher-Yates
/// iteration, including the degenerate final draw with bound = 1).
///
/// This locks the slot count that tape implementations (todo 7) must budget for.
#[test]
fn action_any_consumes_n_draws() -> Result<(), Box<dyn std::error::Error>> {
    const N: usize = 5;
    let quint_content = "module main {
      var x: int
      val input = x
      action init = x' = 0
      action step = any {
        x' = 1,
        x' = 2,
        x' = 3,
        x' = 4,
        x' = 5,
      }
    }";

    let parsed = helpers::parse(quint_content, None)?;
    let init_def = parsed.find_definition_by_name("init")?;
    let step_def = parsed.find_definition_by_name("step")?;

    let mut interpreter = Interpreter::new(parsed.table.clone());
    let mut env = Env::with_rand_state(interpreter.var_storage.clone(), 0, Verbosity::default());
    interpreter.eval(&mut env, init_def.expr.clone())?;
    interpreter.shift();

    // Bounds are N, N-1, ..., 1.  Returning 0 is always in [0, bound) for bound >= 1.
    let count = Rc::new(Cell::new(0usize));
    let source = CountingSource::new(vec![0; N], count.clone());
    env.rand.set_choice_source(Box::new(source));

    interpreter.eval(&mut env, step_def.expr.clone())?;

    assert_eq!(
        count.get(),
        N,
        "actionAny over {N} actions must consume exactly {N} draws"
    );
    Ok(())
}

/// A `nondet` retry (body predicate rejects the initial pick) consumes **zero**
/// additional RNG draws — the retry is pure mixed-radix arithmetic.
///
/// Design (order-independent per §4 of the work plan):
/// - Spec: `nondet v = Set(1,2,3,4).oneOf()` with body `v == 4`.
///   Exactly one element satisfies the predicate.
/// - Loop k = 0..4: for each k, install a source returning k for the first draw.
/// - By pigeonhole, at least 3 of the 4 k-values start on a rejecting element
///   and therefore exercise the retry path. Retry increments position via
///   pure mixed-radix arithmetic — no additional RNG calls.
/// - Assert draw count == 1 for every k (initial-position draw only).
/// - Assert step returns true (proves 4 was found after retry).
#[test]
fn nondet_retry_consumes_zero_extra_draws() -> Result<(), Box<dyn std::error::Error>> {
    // Pure boolean body: no state mutations, so retry leaves no spurious
    // side-effects.  The evaluator's nondet retry logic is exercised without
    // needing to reason about which iteration order the set uses.
    let quint_content = "module main {
      var x: int
      action init = x' = 0
      action step = {
        nondet v = Set(1, 2, 3, 4).oneOf()
        v == 4
      }
    }";

    let parsed = helpers::parse(quint_content, None)?;
    let init_def = parsed.find_definition_by_name("init")?;
    let step_def = parsed.find_definition_by_name("step")?;

    for k in 0u64..4 {
        // Fresh interpreter + env per k so state doesn't bleed between iterations.
        let mut interpreter = Interpreter::new(parsed.table.clone());
        let mut env =
            Env::with_rand_state(interpreter.var_storage.clone(), 0, Verbosity::default());
        interpreter.eval(&mut env, init_def.expr.clone())?;
        interpreter.shift();

        // Supply k for the single initial-position draw, then zeros as unreachable tail.
        let count = Rc::new(Cell::new(0usize));
        let source = CountingSource::new(vec![k, 0, 0, 0, 0], count.clone());
        env.rand.set_choice_source(Box::new(source));

        let result = interpreter.eval(&mut env, step_def.expr.clone())?;

        assert_eq!(
            count.get(),
            1,
            "k={k}: nondet initial-position draw is 1; retry is free (0 extra draws)"
        );
        assert_eq!(
            result,
            Value::bool(true),
            "k={k}: step must succeed — retry must walk to v==4"
        );
    }

    Ok(())
}
