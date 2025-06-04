//! Simulation for Quint models.

use crate::{
    evaluator::{Env, Interpreter},
    ir::{LookupTable, QuintError, QuintEx},
    itf::Trace,
};
use serde::{Deserialize, Serialize};

/// Simulation input that depends on the typescript Quint tool.
#[derive(Serialize, Deserialize)]
pub struct ParsedQuint {
    pub init: QuintEx,
    pub step: QuintEx,
    pub invariant: QuintEx,
    pub table: LookupTable,
}

/// Simulation output.
pub struct SimulationResult {
    pub result: bool,
    pub best_traces: Vec<Trace>,
    pub trace_statistics: TraceStatistics,
    pub samples: usize,
    // TODO
    // witnessing_traces
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

/// Simulation progress update.
pub struct ProgressUpdate {
    /// Current sample
    pub current: usize,
    /// Total number of samples
    pub total: usize,
}

impl ProgressUpdate {
    pub fn percentage(&self) -> u32 {
        (self.current as f64 / self.total as f64 * 100.0).round() as u32
    }
}

/// Callback type for reporting simulation progress
pub type ProgressCallback = Box<dyn FnMut(ProgressUpdate)>;

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
    pub fn simulate(
        &self,
        steps: usize,
        samples: usize,
        n_traces: usize,
        mut progress_callback: Option<ProgressCallback>,
    ) -> Result<SimulationResult, QuintError> {
        let mut interpreter = Interpreter::new(&self.table);
        let mut env = Env::new(interpreter.var_storage.clone());

        let init = interpreter.compile(&self.init);
        let step = interpreter.compile(&self.step);
        let invariant = interpreter.compile(&self.invariant);

        // Have one extra space as we insert first and then pop if we have too many traces
        let mut best_traces = Vec::with_capacity(n_traces + 1);
        let mut trace_lengths = Vec::with_capacity(n_traces + 1);

        for sample_number in 1..=samples {
            if let Some(callback) = &mut progress_callback {
                callback(ProgressUpdate {
                    current: sample_number,
                    total: samples,
                });
            }

            let mut trace = Vec::with_capacity(steps + 1);

            if !init.execute(&mut env)?.as_bool() {
                trace_lengths.push(0);
                return Ok(SimulationResult {
                    result: false,
                    best_traces,
                    trace_statistics: get_trace_statistics(&trace_lengths),
                    samples: sample_number,
                });
            }

            for step_number in 1..=(steps + 1) {
                interpreter.shift();

                trace.push(interpreter.var_storage.borrow().as_record());

                if !invariant.execute(&mut env)?.as_bool() {
                    trace_lengths.push(trace.len());
                    // Found a counterexample
                    collect_trace(
                        &mut best_traces,
                        n_traces,
                        Trace {
                            states: trace,
                            violation: false,
                        },
                    );
                    return Ok(SimulationResult {
                        result: false,
                        best_traces,
                        trace_statistics: get_trace_statistics(&trace_lengths),
                        samples: sample_number,
                    });
                }

                if step_number != steps + 1 && !step.execute(&mut env)?.as_bool() {
                    // The run cannot be extended. In some cases, this may indicate a deadlock.
                    // Since we are doing random simulation, it is very likely
                    // that we have not generated good values for extending
                    // the run. Hence, do not report an error here, but simply
                    // drop the run. Otherwise, we would have a lot of false
                    // positives, which look like deadlocks but they are not.
                    trace_lengths.push(trace.len());
                    break;
                }
            }
            trace_lengths.push(trace.len());
            collect_trace(
                &mut best_traces,
                n_traces,
                Trace {
                    states: trace,
                    violation: false,
                },
            );
        }
        Ok(SimulationResult {
            result: true,
            best_traces,
            trace_statistics: get_trace_statistics(&trace_lengths),
            samples,
        })
    }
}

/// Get statistics about the lengths of traces collected during simulation.
fn get_trace_statistics(trace_lengths: &[usize]) -> TraceStatistics {
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
