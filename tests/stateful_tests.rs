use quint_simulator::{
    evaluator::{Env, Interpreter},
    value::Value,
};

mod helpers;

macro_rules! run_test {
    ($content:expr, $expected_values:expr) => {{
        let parsed = helpers::parse($content)?;
        let init_def = helpers::find_definition_by_name(&parsed, "init")?;

        let mut interpreter = Interpreter::new(&parsed.table);
        let mut env = Env::new(interpreter.var_storage.clone());

        // Set a specific seed so different runs generate the same result
        env.rand.set_state((123_456, 0));

        let init = interpreter.eval(&mut env, &init_def.expr);
        assert_eq!(init.unwrap(), Value::Bool(true));

        for expected_value in $expected_values {
            interpreter.shift();
            let input_def = helpers::find_definition_by_name(&parsed, "input")?;
            let input = interpreter.eval(&mut env, &input_def.expr);
            assert_eq!(input.unwrap(), expected_value);

            let step_def = helpers::find_definition_by_name(&parsed, "step")?;
            let step = interpreter.eval(&mut env, &step_def.expr);
            assert_eq!(step.unwrap(), Value::Bool(true));
        }

        Ok(())
    }};
}

#[test]
fn assign_test() -> Result<(), Box<dyn std::error::Error>> {
    let quint_content = "module main {
          var x: int
          val input = x
          action init = x' = 0
          action step = x' = x + 1
        }";

    run_test!(quint_content, [Value::Int(0), Value::Int(1)])
}

#[test]
fn action_all_test() -> Result<(), Box<dyn std::error::Error>> {
    let quint_content = "module main {
          var x: int
          var y: int
          val input = x + y
          action init = all {
            x' = 0,
            y' = 2,
          }
          action step = all {
            x' = x + 1,
            y' = y * 2,
          }
        }";

    run_test!(quint_content, [Value::Int(2), Value::Int(5)])
}

#[test]
fn action_any_test() -> Result<(), Box<dyn std::error::Error>> {
    let quint_content = "module main {
          var x: int
          val input = x
          action init = any {
            x' = 1,
            x' = 2,
          }
          action step = any {
            x' = x * 3,
            x' = x * 4,
          }
        }";

    run_test!(
        quint_content,
        [Value::Int(2), Value::Int(8), Value::Int(24)]
    )
}
