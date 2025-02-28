use quint_simulator::{
    evaluator::{Env, Interpreter},
    helpers,
    value::Value,
};

macro_rules! run_test {
    ($content:expr, $expected_value:expr) => {{
        let parsed = helpers::parse($content, "init", "step", None)?;
        let init_def = parsed.find_definition_by_name("init")?;

        let mut interpreter = Interpreter::new(&parsed.table);
        // Set a specific seed so different runs generate the same result
        let mut env = Env::with_rand_state(interpreter.var_storage.clone(), 0x42);

        let init = interpreter.eval(&mut env, &init_def.expr);
        assert_eq!(init.unwrap(), Value::Bool(true));

        interpreter.shift();

        let input_def = parsed.find_definition_by_name("input")?;
        let input = interpreter.eval(&mut env, &input_def.expr);
        assert_eq!(input.unwrap(), $expected_value);

        Ok(())
    }};
}

#[test]
fn set_pick_test() -> Result<(), Box<dyn std::error::Error>> {
    let quint_content = "module main {
          var x: int
          val input = x 
          action init = {
            nondet v = Set(1, 2, 3).oneOf()
            x' = v
          }
          action step = x' = x
        }";

    run_test!(quint_content, Value::Int(3))
}

#[test]
fn interval_pick_test() -> Result<(), Box<dyn std::error::Error>> {
    let quint_content = "module main {
          var x: int
          val input = x 
          action init = {
            nondet v = 5.to(8).oneOf()
            x' = v
          }
          action step = x' = x
        }";

    run_test!(quint_content, Value::Int(5))
}
