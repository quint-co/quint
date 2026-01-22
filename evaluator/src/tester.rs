use crate::evaluator::{Env, Interpreter};
use crate::ir::{LookupTable, QuintError, QuintEx};
use crate::progress::Reporter;
use serde::Serialize;

/// A test case that can be executed
pub struct TestCase {
    pub name: String,
    pub test: QuintEx,
    pub table: LookupTable,
}

/// Status of a test execution
#[derive(Debug, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum TestStatus {
    Passed,
    Failed,
    Ignored,
}

/// Result of executing a single test
#[derive(Debug, Serialize)]
pub struct TestResult {
    pub name: String,
    pub status: TestStatus,
    pub errors: Vec<QuintError>,
    pub seed: u64,
    pub nsamples: usize,
}

impl TestCase {
    /// Execute this test case with the given seed and maximum samples
    ///
    /// Tests are run repeatedly up to `max_samples` times. If the RNG state
    /// repeats (indicating a deterministic test), execution stops early.
    pub fn execute<R: Reporter>(
        &self,
        seed: u64,
        max_samples: usize,
        mut reporter: R,
    ) -> TestResult {
        let test_name = &self.name;

        let mut interpreter = Interpreter::new(&self.table);
        let mut env = Env::with_rand_state(interpreter.var_storage.clone(), seed);
        let compiled_test = interpreter.compile(&self.test);

        let mut errors = Vec::new();
        let mut nsamples = 0;

        for _ in 0..max_samples {
            let prev_rng_state = env.rand.get_state();

            reporter.next_sample();
            nsamples += 1;

            match compiled_test.execute(&mut env) {
                Ok(result) => {
                    if !result.as_bool() {
                        let error = QuintError::new(
                            "QNT511",
                            &format!("Test {} returned false", test_name),
                        )
                        .with_reference(self.test.id());
                        return TestResult {
                            name: test_name.clone(),
                            status: TestStatus::Failed,
                            errors: vec![error],
                            seed,
                            nsamples,
                        };
                    }

                    if env.rand.get_state() == prev_rng_state {
                        break;
                    }
                }
                Err(e) => {
                    errors.push(e);
                    break;
                }
            }
        }

        let status = if errors.is_empty() {
            TestStatus::Passed
        } else {
            TestStatus::Failed
        };

        TestResult {
            name: test_name.clone(),
            status,
            errors,
            seed,
            nsamples,
        }
    }
}
