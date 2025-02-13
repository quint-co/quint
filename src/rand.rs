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
            counter: 0,
            key: rand::rng().random(),
        }
    }

    pub fn next(&mut self, bound: u64) -> u64 {
        let number = rand64(self.key, self.counter);
        self.counter += 1;
        number % bound
    }

    pub fn get_state(&self) -> (u64, u64) {
        (self.key, self.counter)
    }

    pub fn set_state(&mut self, (key, counter): (u64, u64)) {
        self.key = key;
        self.counter = counter;
    }
}
