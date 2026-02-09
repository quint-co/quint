//! Random number generator using the squares-rnd algorithm.
//!
//! This is stateful and stable. During a single Quint simulation, this can be
//! called many times. Whenever the same simulation (same Quint modules and
//! parameters) is run again, if the same seed is used, it should yield the same
//! results. It should also be possible to get the seed from intermediate
//! states, as we often run many simulations and then only want to re-run a
//! specific one (one of the samples), so we should be able to get the seed for
//! that one.

use num_bigint::{BigUint, RandBigInt};
use num_traits::ToPrimitive;
use rand::Rng;
use rand::SeedableRng;
use squares_rnd::rand64;

pub struct Rand {
    counter: u64,
    key: u64,
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
        }
    }

    pub fn with_state(state: u64) -> Self {
        Self {
            counter: state,
            key: squares_rnd::KEY,
        }
    }

    pub fn next(&mut self, bound: usize) -> usize {
        let bound64: u64 = bound.try_into().unwrap();
        let number = rand64(self.key, self.counter);
        self.counter = self.counter.saturating_add(1);

        (number % bound64).try_into().unwrap()
    }

    pub fn get_state(&self) -> u64 {
        self.counter
    }

    /// Generate a random BigUint in the range [0, bound).
    /// Maintains determinism by using the current counter state to seed the RNG.
    pub fn next_biguint(&mut self, bound: &BigUint) -> BigUint {
        // For small bounds that fit in usize, use existing deterministic path
        if let Some(bound_u64) = bound.to_u64() {
            if bound_u64 <= usize::MAX as u64 {
                return BigUint::from(self.next(bound_u64 as usize));
            }
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
