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

    pub fn next(&mut self, bound: u64) -> u64 {
        let number = rand64(self.key, self.counter);
        self.counter = self.counter.saturating_add(1);
        number % bound
    }

    pub fn get_state(&self) -> u64 {
        self.counter
    }

    pub fn set_state(&mut self, counter: u64) {
        self.counter = counter;
    }
}
