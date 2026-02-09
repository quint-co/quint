//! Simulation for Quint models.

use crate::{
    evaluator::{Env, Interpreter},
    ir::{LookupTable, QuintError, QuintEx},
    itf::Trace,
    progress::Reporter,
};
use serde::{Deserialize, Serialize};
use std::fmt;
use std::panic::{catch_unwind, AssertUnwindSafe};

/// Simulation input that depends on the typescript Quint tool.
#[derive(Serialize, Deserialize, Clone)]
pub struct ParsedQuint {
    pub init: QuintEx,
    pub step: QuintEx,
    pub invariant: QuintEx,
    pub witnesses: Vec<QuintEx>,
    pub table: LookupTable,
}

/// Simulation output.
pub struct SimulationResult {
    pub result: bool,
    pub best_traces: Vec<Trace>,
    pub trace_statistics: TraceStatistics,
    pub samples: usize,
    pub witnessing_traces: Vec<usize>,
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
    /// Simulate a Quint model for a given number of steps and samples, storing
    /// up to `n_traces` traces of the greatest quality.
    ///
    /// Start evaluating `init` and check that it satisfies the `invariant`.
    /// Then, evaluate `step` `steps` times, checking that `invariant` holds every time.
    ///
    /// Repeat this `samples` times, and return the best `n_traces` traces
    ///
    /// If `init` or `invariant` return false at any given point, simulation stops.
    /// If `step` returns false, we continue, as that just means we failed to progress
    /// in a specific setting.
    ///
    /// If `seed` is provided, it will be used to initialize the random number generator
    /// for reproducibility. Otherwise, a random seed will be generated.
    pub fn simulate<R: Reporter>(
        &self,
        steps: usize,
        samples: usize,
        n_traces: usize,
        mut reporter: R,
        seed: Option<u64>,
    ) -> Result<SimulationResult, SimulationError> {
        let mut interpreter = Interpreter::new(self.table.clone());
        let mut env = match seed {
            Some(s) => Env::with_rand_state(interpreter.var_storage.clone(), s),
            None => Env::new(interpreter.var_storage.clone()),
        };

        let init = interpreter.compile(&self.init);
        let step = interpreter.compile(&self.step);
        let invariant = interpreter.compile(&self.invariant);

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
                        });
                    }

                    trace_lengths.push(env.trace.len());

                    collect_trace(
                        &mut best_traces,
                        n_traces,
                        Trace {
                            states: std::mem::take(&mut env.trace),
                            violation: !success,
                            seed,
                        },
                    );

                    if !success {
                        // Found a violation, stop simulation and return results
                        return Ok(SimulationResult {
                            result: false,
                            best_traces,
                            trace_statistics: get_trace_statistics(&trace_lengths),
                            samples: sample_number,
                            witnessing_traces,
                        });
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
            result: true,
            best_traces,
            trace_statistics: get_trace_statistics(&trace_lengths),
            samples,
            witnessing_traces,
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

/// Collect a trace of the simulation, up to a maximum of `n_traces`.
///
/// Assumes `best_traces` is sorted by quality.
fn collect_trace(best_traces: &mut Vec<Trace>, n_traces: usize, trace: Trace) {
    insert_trace_sorted_by_quality(best_traces, trace);
    if best_traces.len() > n_traces {
        best_traces.pop();
    }
}

/// Compare two traces by quality.
///
/// Prefer short traces for error, and longer traces for non error.
/// Therefore, trace a is better than trace b iff
///  - when a has an error: a is shorter or b has no error;
///  - when a has no error: a is longer and b has no error.
fn compare_traces_by_quality(a: &Trace, b: &Trace) -> std::cmp::Ordering {
    match (a.violation, b.violation) {
        (true, true) => a.states.len().cmp(&b.states.len()),
        (true, false) => std::cmp::Ordering::Less,
        (false, true) => std::cmp::Ordering::Greater,
        (false, false) => b.states.len().cmp(&a.states.len()),
    }
}

/// Insert a trace into a sorted vector of traces, maintaining the order by quality.
fn insert_trace_sorted_by_quality(best_traces: &mut Vec<Trace>, trace: Trace) {
    let index = best_traces.binary_search_by(|t| compare_traces_by_quality(t, &trace));
    match index {
        Ok(index) => best_traces.insert(index, trace),
        Err(index) => best_traces.insert(index, trace),
    }
}
