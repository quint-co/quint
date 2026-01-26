use crate::evaluator::{Env, Interpreter};
use crate::ir::{LookupTable, QuintError, QuintId};
use crate::itf::Trace;
use crate::progress::Reporter;
use serde::Serialize;

/// A test case that can be executed
pub struct TestCase {
    pub name: String,
    pub test_def_id: QuintId,
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
pub struct TestResult {
    pub name: String,
    pub status: TestStatus,
    pub errors: Vec<QuintError>,
    pub seed: u64,
    pub nsamples: usize,
    pub traces: Vec<Trace>,
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

        // Look up the test definition and compile it (not just the expression)
        // This ensures instance overrides are applied via compile_under_context
        let test_def = match self.table.get(&self.test_def_id) {
            Some(def) => def,
            None => {
                let error = QuintError::new(
                    "QNT404",
                    &format!("Test definition with id {} not found", self.test_def_id),
                );
                return TestResult {
                    name: test_name.clone(),
                    status: TestStatus::Failed,
                    errors: vec![error],
                    seed,
                    nsamples: 0,
                    traces: Vec::new(),
                };
            }
        };
        let compiled_test = interpreter.compile_def(test_def);

        let mut errors = Vec::new();
        let mut nsamples = 0;
        let mut trace = None;

        for _ in 0..max_samples {
            let prev_rng_state = env.rand.get_state();

            reporter.next_sample();
            nsamples += 1;

            match compiled_test.execute(&mut env) {
                Ok(result) => {
                    env.shift();

                    if !result.as_bool() {
                        let error = QuintError::new(
                            "QNT511",
                            &format!("Test {} returned false", test_name),
                        )
                        .with_reference(self.test_def_id);
                        let states = std::mem::take(&mut env.trace);
                        trace = Some(Trace {
                            states,
                            violation: true,
                            seed,
                        });
                        return TestResult {
                            name: test_name.clone(),
                            status: TestStatus::Failed,
                            errors: vec![error],
                            seed,
                            nsamples,
                            traces: trace.into_iter().collect(),
                        };
                    }

                    let states = std::mem::take(&mut env.trace);
                    trace = Some(Trace {
                        states,
                        violation: false,
                        seed,
                    });

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
            traces: trace.into_iter().collect(),
        }
    }
}
