use quint_evaluator::{
    evaluator::{Env, Interpreter},
    helpers,
    value::Value,
};

macro_rules! run_test {
    ($content:expr, $expected_values:expr) => {{
        let parsed = helpers::parse($content, "init", "step", None)?;
        let init_def = parsed.find_definition_by_name("init")?;

        let mut interpreter = Interpreter::new(parsed.table.clone());
        // Set a specific seed so different runs generate the same result
        let mut env = Env::with_rand_state(interpreter.var_storage.clone(), 123_456);

        let init = interpreter.eval(&mut env, init_def.expr.clone());
        assert_eq!(init.unwrap(), Value::bool(true));

        for expected_value in $expected_values {
            interpreter.shift();
            let input_def = parsed.find_definition_by_name("input")?;
            let input = interpreter.eval(&mut env, input_def.expr.clone());
            assert_eq!(input.unwrap(), expected_value);

            let step_def = parsed.find_definition_by_name("step")?;
            let step = interpreter.eval(&mut env, step_def.expr.clone());
            assert_eq!(step.unwrap(), Value::bool(true));
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

    run_test!(quint_content, [Value::int(0), Value::int(1)])
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

    run_test!(quint_content, [Value::int(2), Value::int(5)])
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
        [Value::int(2), Value::int(8), Value::int(32)]
    )
}
