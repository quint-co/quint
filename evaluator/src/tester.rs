use crate::evaluator::{Env, Interpreter};
use crate::ir::{LookupTable, QuintError, QuintEx};
use serde::Serialize;
use std::collections::HashSet;

/// A test case that can be executed
pub struct TestCase {
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
    pub fn execute(&self, seed: u64, max_samples: usize) -> TestResult {
        let test_name = extract_test_name(&self.test);

        // Create interpreter and environment with the provided seed
        let mut interpreter = Interpreter::new(&self.table);
        let mut env = Env::with_rand_state(interpreter.var_storage.clone(), seed);

        // Compile the test expression
        let compiled_test = interpreter.compile(&self.test);

        let mut errors = Vec::new();
        let mut nsamples = 0;
        let mut seen_rng_states = HashSet::new();

        // Run the test up to max_samples times
        for _ in 0..max_samples {
            nsamples += 1;

            // Track RNG state to detect deterministic tests
            let rng_state = env.rand.get_state();
            if !seen_rng_states.insert(rng_state) {
                // Test is deterministic (RNG state repeated), stop early
                break;
            }

            // Evaluate the test
            match compiled_test.execute(&mut env) {
                Ok(result) => {
                    // Check if test returned false (failure)
                    if !result.as_bool() {
                        let error = QuintError::new(
                            "QNT511",
                            &format!("Test {} returned false", test_name),
                        );
                        return TestResult {
                            name: test_name,
                            status: TestStatus::Failed,
                            errors: vec![error],
                            seed,
                            nsamples,
                        };
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
            name: test_name,
            status,
            errors,
            seed,
            nsamples,
        }
    }
}

/// Extract the test name from a test expression
fn extract_test_name(test: &QuintEx) -> String {
    match test {
        QuintEx::QuintName { name, .. } => name.to_string(),
        _ => "unknown_test".to_string(),
    }
}
