//! Random number generator using the squares-rnd algorithm.
//!
//! This is stateful and stable. During a single Quint simulation, this can be
//! called many times. Whenever the same simulation (same Quint modules and
//! parameters) is run again, if the same seed is used, it should yield the same
//! results. It should also be possible to get the seed from intermediate
//! states, as we often run many simulations and then only want to re-run a
//! specific one (one of the samples), so we should be able to get the seed for
//! that one.
//!
//! # External replay and deterministic debugging
//!
//! [`Rand`] accepts an optional [`ChoiceSource`] via [`Rand::set_choice_source`].
//! When installed, every draw (`next`, `next_biguint`) is delegated to the
//! source instead of the internal `squares_rnd` stream. This enables:
//!
//! * **External replay**: record the sequence of choices made during a run and
//!   replay it exactly by feeding the same sequence back in.
//! * **Deterministic debugging**: reproduce a specific execution path without
//!   relying on a fixed seed (which is fragile across spec or evaluator changes).
//! * **Model-based testing**: drive the evaluator with a handcrafted sequence of
//!   choices to exercise a particular path through the specification.
//!
//! When no [`ChoiceSource`] is installed, the behavior is byte-identical to the
//! unpatched evaluator — there is no observable difference.

use num_bigint::{BigUint, RandBigInt};
use num_traits::ToPrimitive;
use rand::Rng;
use rand::SeedableRng;
use squares_rnd::rand64;

/// A source of nondeterministic choices for the Quint evaluator.
///
/// This trait is the seam between the evaluator's five RNG call sites and an
/// external sequence of choices. Implementations must return a value in
/// `[0, bound)` for every call and must answer every call **infallibly**.
///
/// The trait is **object-safe** so it can be stored as `Box<dyn ChoiceSource>`
/// inside [`Rand`].
///
/// # Use cases
///
/// * **External replay** — a pre-recorded tape of choices reproduces a prior run
///   byte-for-byte when replayed through this seam.
/// * **Deterministic debugging** — drive execution down a specific path without
///   relying on a fixed PRNG seed.
/// * **Model-based testing** — supply a handcrafted sequence of choices to
///   exercise invariants along a known path through the specification.
pub trait ChoiceSource {
    /// Draw the next choice in `[0, bound)`.
    ///
    /// Mirrors [`Rand::next`]: the caller guarantees `bound >= 1`. Consumes
    /// exactly one slot from the source.
    fn next(&mut self, bound: u64) -> u64;

    /// Draw the next choice in `[0, bound)` as a [`BigUint`].
    ///
    /// Required because the large-powerset path in [`Rand::next_biguint`]
    /// bypasses `next` entirely (it seeds a `StdRng` internally). Omitting
    /// this method would silently fall back to real randomness on large
    /// powersets and break replay. Consumes exactly one slot.
    fn next_biguint(&mut self, bound: &BigUint) -> BigUint;
}

pub struct Rand {
    counter: u64,
    key: u64,
    /// Optional external choice source. When `Some`, every draw is delegated to
    /// it and the counter is still advanced for `get_state()` consistency.
    choice_source: Option<Box<dyn ChoiceSource>>,
}

impl Default for Rand {
    fn default() -> Self {
        Self::new()
    }
}

impl Rand {
    pub fn new() -> Self {
        Self {
            counter: rand::thread_rng().gen(),
            key: squares_rnd::KEY,
            choice_source: None,
        }
    }

    pub fn with_state(state: u64) -> Self {
        Self {
            counter: state,
            key: squares_rnd::KEY,
            choice_source: None,
        }
    }

    /// Install an external [`ChoiceSource`].
    ///
    /// Every subsequent call to [`next`](Self::next) and
    /// [`next_biguint`](Self::next_biguint) will delegate to `source` for the
    /// returned value. The internal counter is still advanced on every draw so
    /// that [`get_state`](Self::get_state) remains meaningful.
    pub fn set_choice_source(&mut self, source: Box<dyn ChoiceSource>) {
        self.choice_source = Some(source);
    }

    /// Remove and return the installed [`ChoiceSource`], if any.
    pub fn take_choice_source(&mut self) -> Option<Box<dyn ChoiceSource>> {
        self.choice_source.take()
    }

    pub fn next(&mut self, bound: u64) -> u64 {
        if let Some(src) = self.choice_source.as_mut() {
            let value = src.next(bound);
            self.counter = self.counter.saturating_add(1);
            return value;
        }

        let number = rand64(self.key, self.counter);
        self.counter = self.counter.saturating_add(1);

        number % bound
    }

    pub fn get_state(&self) -> u64 {
        self.counter
    }

    /// Generate a random BigUint in the range [0, bound).
    /// Maintains determinism by using the current counter state to seed the RNG.
    pub fn next_biguint(&mut self, bound: &BigUint) -> BigUint {
        // For small bounds that fit in u64, use existing deterministic path
        if let Some(bound_u64) = bound.to_u64() {
            return BigUint::from(self.next(bound_u64));
        }

        if let Some(src) = self.choice_source.as_mut() {
            let value = src.next_biguint(bound);
            self.counter = self.counter.saturating_add(1);
            return value;
        }

        // For large bounds, create a seeded RNG from current state
        // This maintains determinism while leveraging num-bigint's random generation
        let mut rng = rand::rngs::StdRng::seed_from_u64(self.counter);
        let result = rng.gen_biguint_range(&BigUint::ZERO, bound);

        // Advance our counter to maintain state progression
        self.counter = self.counter.saturating_add(1);

        result
    }
}
