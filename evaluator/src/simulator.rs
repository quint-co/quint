//! Simulation for Quint models.

use crate::{
    evaluator::{Env, Interpreter},
    ir::{LookupTable, QuintError, QuintEx},
    itf::Trace,
    progress::Reporter,
    trace_quality::insert_sorted_by_quality,
    verbosity::Verbosity,
};
use serde::{Deserialize, Serialize};
use std::fmt;
use std::panic::{catch_unwind, AssertUnwindSafe};

/// Simulation input that depends on the typescript Quint tool.
#[derive(Serialize, Deserialize, Clone)]
pub struct ParsedQuint {
    pub init: QuintEx,
    pub step: QuintEx,
    /// Individual invariants to check. These will be combined with AND during simulation,
    /// but evaluated separately to report which specific invariants were violated.
    pub invariants: Vec<QuintEx>,
    pub witnesses: Vec<QuintEx>,
    pub table: LookupTable,
}

/// Configuration for simulation runs.
pub struct SimulationConfig {
    /// Number of steps to simulate per sample
    pub steps: usize,
    /// Number of samples to run
    pub samples: usize,
    /// Maximum number of traces to collect
    pub n_traces: usize,
    /// Optional seed for reproducibility
    pub seed: Option<u64>,
    /// Whether to store metadata for model-based testing
    pub store_metadata: bool,
    /// Verbosity level for output
    pub verbosity: Verbosity,
}

/// Simulation output.
pub struct SimulationResult {
    pub result: bool,
    pub best_traces: Vec<Trace>,
    pub trace_statistics: TraceStatistics,
    pub samples: usize,
    pub witnessing_traces: Vec<usize>,
    pub violated_invariants: Vec<usize>,
}

/// Simulation error that includes context about when the error occurred.
#[derive(Debug)]
pub struct SimulationError {
    pub seed: u64,
    pub trace: Trace,
    pub error: QuintError,
}

impl fmt::Display for SimulationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.error)
    }
}

/// Statistics about the length of traces collected during simulation.
#[derive(Serialize, Default, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TraceStatistics {
    /// The average length of the traces
    pub average_trace_length: f64,
    /// The maximum length of the traces
    pub max_trace_length: usize,
    /// The minimum length of the traces
    pub min_trace_length: usize,
}

impl ParsedQuint {
    /// Combines multiple invariants into a single expression using AND.
    /// If the list is empty, returns `true`.
    fn combine_invariants(&self) -> QuintEx {
        self.invariants
            .iter()
            .fold(QuintEx::QuintBool { id: 0, value: true }, |acc, inv| {
                QuintEx::QuintApp {
                    id: 0,
                    opcode: "and".into(),
                    args: vec![acc, inv.clone()],
                }
            })
    }

    /// Simulate a Quint model for a given number of steps and samples, storing
    /// up to `n_traces` traces of the greatest quality.
    ///
    /// Start evaluating `init` and check that it satisfies the `invariant`.
    /// Then, evaluate `step` `steps` times, checking that `invariant` holds every time.
    ///
    /// Repeat this `samples` times, and return the best `n_traces` traces
    ///
    /// If `init` returns false, simulation stops immediately.
    /// If `invariant` returns false, the violation is recorded and simulation
    /// continues until `n_traces` violations have been found (or `n_traces.max(1)`
    /// when `n_traces == 0` for backward compatibility).
    /// If `step` returns false, we continue, as that just means we failed to progress
    /// in a specific setting.
    ///
    /// If `seed` is provided, it will be used to initialize the random number generator
    /// for reproducibility. Otherwise, a random seed will be generated.
    pub fn simulate<R: Reporter>(
        &self,
        config: SimulationConfig,
        mut reporter: R,
    ) -> Result<SimulationResult, SimulationError> {
        let SimulationConfig {
            steps,
            samples,
            n_traces,
            seed,
            store_metadata,
            verbosity,
        } = config;
        let mut interpreter = Interpreter::new(self.table.clone());
        // Setup the store metadata flag for MBT.
        // This was deliberately not passed as an argument to the Interpreter constructor.
        interpreter
            .var_storage
            .borrow_mut()
            .set_store_metadata(store_metadata);
        let mut env = match seed {
            Some(s) => Env::with_rand_state(interpreter.var_storage.clone(), s, verbosity),
            None => Env::new(interpreter.var_storage.clone(), verbosity),
        };

        let init = interpreter.compile(&self.init);
        let step = interpreter.compile(&self.step);

        // Combine individual invariants with AND for efficient checking during simulation
        let combined_invariant = self.combine_invariants();
        let invariant = interpreter.compile(&combined_invariant);

        // Compile individual invariants for violation reporting
        let individual_invariants: Vec<_> = self
            .invariants
            .iter()
            .map(|inv| interpreter.compile(inv))
            .collect();

        if store_metadata {
            interpreter.create_nondet_picks();
        }

        // Compile witnesses and initialize tracking
        let compiled_witnesses: Vec<_> = self
            .witnesses
            .iter()
            .map(|w| interpreter.compile(w))
            .collect();
        let mut witnessing_traces = vec![0; self.witnesses.len()];
        let mut trace_witnessed = vec![false; self.witnesses.len()];

        // Have one extra space as we insert first and then pop if we have too many traces
        let mut best_traces = Vec::with_capacity(n_traces + 1);
        let mut trace_lengths = Vec::with_capacity(n_traces + 1);
        let mut errors_found: usize = 0;
        let mut violated_invariants: Vec<usize> = vec![];

        for sample_number in 1..=samples {
            reporter.next_sample();
            let seed = env.rand.get_state();
            trace_witnessed.fill(false);
            let mut remaining = compiled_witnesses.len();

            // Wrap execute calls to catch panics and print seed
            let result = catch_unwind(AssertUnwindSafe(|| -> Result<bool, QuintError> {
                if !init.execute(&mut env)?.as_bool() {
                    return Ok(false);
                }

                for step_number in 1..=(steps + 1) {
                    // Shift the state and record it in the trace
                    env.shift();

                    // Evaluate witnesses after each step and skip if all satisfied
                    if remaining > 0 {
                        for i in 0..trace_witnessed.len() {
                            // Skip if this witness is already satisfied in a previous step
                            if trace_witnessed[i] {
                                continue;
                            }

                            if let Ok(result) = compiled_witnesses[i].execute(&mut env) {
                                if result.as_bool() {
                                    trace_witnessed[i] = true;
                                    witnessing_traces[i] += 1;
                                    remaining -= 1;
                                    // early break if all witnesses are satisfied.
                                    if remaining == 0 {
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    if !invariant.execute(&mut env)?.as_bool() {
                        trace_lengths.push(env.trace.len());
                        return Ok(false);
                    }

                    if step_number != steps + 1 && !step.execute(&mut env)?.as_bool() {
                        // The run cannot be extended. In some cases, this may indicate a deadlock.
                        // Since we are doing random simulation, it is very likely
                        // that we have not generated good values for extending
                        // the run. Hence, do not report an error here, but simply
                        // drop the run. Otherwise, we would have a lot of false
                        // positives, which look like deadlocks but they are not.
                        trace_lengths.push(env.trace.len());
                        return Ok(true);
                    }
                }
                Ok(true)
            }));

            match result {
                Ok(Ok(success)) => {
                    if env.trace.is_empty() {
                        // Init failed
                        trace_lengths.push(0);
                        return Ok(SimulationResult {
                            result: false,
                            best_traces,
                            trace_statistics: get_trace_statistics(&trace_lengths),
                            samples: sample_number,
                            witnessing_traces,
                            violated_invariants: vec![],
                        });
                    }

                    trace_lengths.push(env.trace.len());
                    insert_sorted_by_quality(
                        &mut best_traces,
                        Trace {
                            states: std::mem::take(&mut env.trace),
                            violation: !success,
                            seed,
                        },
                        n_traces,
                        verbosity,
                    );

                    if !success {
                        errors_found += 1;

                        // Check which individual invariants failed on the FIRST violation only
                        if errors_found == 1 {
                            violated_invariants = individual_invariants
                                .iter()
                                .enumerate()
                                .filter_map(|(idx, inv)| {
                                    if let Ok(result) = inv.execute(&mut env) {
                                        if !result.as_bool() {
                                            return Some(idx);
                                        }
                                    }
                                    None
                                })
                                .collect();
                        }

                        // Continue collecting violations until we have n_traces
                        if errors_found >= n_traces.max(1) {
                            return Ok(SimulationResult {
                                result: false,
                                best_traces,
                                trace_statistics: get_trace_statistics(&trace_lengths),
                                samples: sample_number,
                                witnessing_traces,
                                violated_invariants,
                            });
                        }
                    }
                }
                Ok(Err(e)) => {
                    // QuintError occurred
                    let trace = std::mem::take(&mut env.trace);
                    return Err(SimulationError {
                        seed,
                        trace: Trace {
                            states: trace,
                            violation: false,
                            seed,
                        },
                        error: e,
                    });
                }
                Err(panic_info) => {
                    // Panic occurred
                    let msg = panic_info
                        .downcast_ref::<&str>()
                        .copied()
                        .or_else(|| panic_info.downcast_ref::<String>().map(|s| s.as_str()))
                        .unwrap_or("Unknown panic in thread");

                    let trace = std::mem::take(&mut env.trace);
                    return Err(SimulationError {
                        seed,
                        trace: Trace {
                            states: trace,
                            violation: false,
                            seed,
                        },
                        error: QuintError {
                            code: "QNT500".to_string(),
                            message: msg.to_string(),
                            reference: None,
                        },
                    });
                }
            }
        }

        Ok(SimulationResult {
            result: errors_found == 0,
            best_traces,
            trace_statistics: get_trace_statistics(&trace_lengths),
            samples,
            witnessing_traces,
            violated_invariants: vec![],
        })
    }
}

/// Get statistics about the lengths of traces collected during simulation.
fn get_trace_statistics(trace_lengths: &[usize]) -> TraceStatistics {
    if trace_lengths.is_empty() {
        return TraceStatistics {
            average_trace_length: 0.0,
            max_trace_length: 0,
            min_trace_length: 0,
        };
    }
    TraceStatistics {
        average_trace_length: trace_lengths.iter().sum::<usize>() as f64
            / trace_lengths.len() as f64,
        max_trace_length: *trace_lengths.iter().max().unwrap_or(&0),
        min_trace_length: *trace_lengths.iter().min().unwrap_or(&0),
    }
}
