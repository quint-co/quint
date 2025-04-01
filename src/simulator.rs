use crate::{
    evaluator::{Env, Interpreter},
    ir::{LookupTable, QuintError, QuintEx},
    itf::Trace,
};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ParsedQuint {
    pub init: QuintEx,
    pub step: QuintEx,
    pub invariant: QuintEx,
    pub table: LookupTable,
}

pub struct SimulationResult {
    pub result: bool,
    pub best_traces: Vec<Trace>,
    // TODO
    // witnessing_traces
    // samples
}

impl ParsedQuint {
    pub fn simulate(
        &self,
        steps: usize,
        samples: usize,
        n_traces: usize,
    ) -> Result<SimulationResult, QuintError> {
        let mut interpreter = Interpreter::new(&self.table);
        let mut env = Env::new(interpreter.var_storage.clone());

        let init = interpreter.compile(&self.init);
        let step = interpreter.compile(&self.step);
        let invariant = interpreter.compile(&self.invariant);

        // Have one extra space as we insert first and then pop if we have too many traces
        let mut best_traces = Vec::with_capacity(n_traces + 1);

        for _sample_number in 1..=samples {
            let mut trace = Vec::with_capacity(steps + 1);

            if !init.execute(&mut env)?.as_bool() {
                return Ok(SimulationResult {
                    result: false,
                    best_traces,
                });
            }

            for step_number in 1..=(steps + 1) {
                interpreter.shift();

                trace.push(interpreter.var_storage.as_record());

                if !invariant.execute(&mut env)?.as_bool() {
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
                    });
                }

                if step_number != steps + 1 && !step.execute(&mut env)?.as_bool() {
                    // The run cannot be extended. In some cases, this may indicate a deadlock.
                    // Since we are doing random simulation, it is very likely
                    // that we have not generated good values for extending
                    // the run. Hence, do not report an error here, but simply
                    // drop the run. Otherwise, we would have a lot of false
                    // positives, which look like deadlocks but they are not.
                    break;
                }
            }
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
        })
    }
}

fn collect_trace(best_traces: &mut Vec<Trace>, n_traces: usize, trace: Trace) {
    insert_trace_sorted_by_quality(best_traces, trace);
    if best_traces.len() > n_traces {
        best_traces.pop();
    }
}

fn compare_traces_by_quality(a: &Trace, b: &Trace) -> std::cmp::Ordering {
    match (a.violation, b.violation) {
        (true, true) => a.states.len().cmp(&b.states.len()),
        (true, false) => std::cmp::Ordering::Less,
        (false, true) => std::cmp::Ordering::Greater,
        (false, false) => b.states.len().cmp(&a.states.len()),
    }
}

fn insert_trace_sorted_by_quality(best_traces: &mut Vec<Trace>, trace: Trace) {
    let index = best_traces.binary_search_by(|t| compare_traces_by_quality(t, &trace));
    match index {
        Ok(index) => best_traces.insert(index, trace),
        Err(index) => best_traces.insert(index, trace),
    }
}
