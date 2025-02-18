use crate::{
    evaluator::{Env, Interpreter},
    ir::{QuintError, QuintOutput},
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

        let init = interpreter.compile(&init_def.expr);
        let step = interpreter.compile(&step_def.expr);
        let invariant = interpreter.compile(&invariant_def.expr);

        for _sample_number in 1..samples {
            if !init.execute(&mut env)?.as_bool() {
                return Ok(SimulationResult { result: false });
            }

            for _step_number in 1..steps {
                interpreter.shift();
                if !invariant.execute(&mut env)?.as_bool() {
                    return Ok(SimulationResult { result: false });
                }

                if !step.execute(&mut env)?.as_bool() {
                    return Ok(SimulationResult { result: false });
                }
            }
        }
        Ok(SimulationResult { result: true })
    }
}
