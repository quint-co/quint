//! Random number generator using the squares-rnd algorithm.
//!
//! This is stateful and stable. During a signle Quint simulation, this can be
//! called many times. Whenever the same simulation (same Quint modules and
//! parameters) is run again, if the same seed is used, it should yield the same
//! results. It should also be possible to get the seed from intermediate
//! states, as we often run many simulations and then only want to re-run a
//! specific one (one of the samples), so we should be able to get the seed for
//! that one.

use rand::Rng;
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
            counter: rand::rng().random(),
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
}
