use std::{fs::File, io::Write};

use crate::{
    evaluator::{Env, Interpreter},
    ir::{QuintError, QuintOutput},
    itf::Trace,
};

#[derive(Debug)]
pub struct SimulationResult {
    pub result: bool,
    // TODO
    // witnessing_traces
    // samples
}

impl QuintOutput {
    pub fn simulate(
        &self,
        init_name: &str,
        step_name: &str,
        invariant_name: &str,
        steps: usize,
        samples: usize,
    ) -> Result<SimulationResult, QuintError> {
        let init_def = self.find_definition_by_name(init_name).unwrap();
        let step_def = self.find_definition_by_name(step_name).unwrap();
        let invariant_def = self.find_definition_by_name(invariant_name).unwrap();

        let mut interpreter = Interpreter::new(&self.table);
        let mut env = Env::new(interpreter.var_storage.clone());

        let init = interpreter.compile(init_def.expr.clone());
        let step = interpreter.compile(step_def.expr.clone());
        let invariant = interpreter.compile(invariant_def.expr.clone());
        let mut trace = Vec::with_capacity(steps + 1);

        for sample_number in 1..=samples {
            trace.clear();

            if !init.execute(&mut env)?.as_bool() {
                return Ok(SimulationResult { result: false });
            }

            for step_number in 1..=(steps + 1) {
                interpreter.shift();

                trace.push(interpreter.var_storage.as_record());

                if !invariant.execute(&mut env)?.as_bool() {
                    println!(
                        "Violation at step {step_number}, sample {sample_number}. Writing trace."
                    );
                    // TODO: improve, this is temporary
                    let itf_trace = Trace(trace).to_itf();
                    let json_data = serde_json::to_string(&itf_trace).unwrap();
                    let mut file = File::create("out.itf.json").unwrap();
                    file.write_all(json_data.as_bytes()).unwrap();
                    return Ok(SimulationResult { result: false });
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
            // for (state, i) in trace.iter().enumerate() {
            //     println!("State {}: {:?}", state, i);
            // }
        }
        Ok(SimulationResult { result: true })
    }
}
