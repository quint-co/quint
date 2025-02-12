use quint_simulator::{
    evaluator::{Env, Interpreter},
    value::Value,
};

mod helpers;

#[test]
fn assign_test() -> Result<(), Box<dyn std::error::Error>> {
    let quint_content = "module main {
          var x: int
          val input = x 
          action init = x' = 0
          action step = x' = x + 1
        }"
    .to_string();

    let parsed = helpers::parse(quint_content)?;
    let init_def = helpers::find_definition_by_name(&parsed, "init")?;
    let step_def = helpers::find_definition_by_name(&parsed, "step")?;
    let input_def = helpers::find_definition_by_name(&parsed, "input")?;

    let mut interpreter = Interpreter::new(&parsed.table);
    let mut env = Env::new(interpreter.var_storage.clone());

    let init = interpreter.eval(&mut env, &init_def.expr);
    assert_eq!(init.unwrap(), Value::Bool(true));

    interpreter.shift();

    // After shifting, the value of x should be 0
    let input = interpreter.eval(&mut env, &input_def.expr);
    assert_eq!(input.unwrap(), Value::Int(0));

    let step = interpreter.eval(&mut env, &step_def.expr);
    assert_eq!(step.unwrap(), Value::Bool(true));

    interpreter.shift();

    // After shifting, the value of x should be 1
    let input = interpreter.eval(&mut env, &input_def.expr);
    assert_eq!(input.unwrap(), Value::Int(1));

    Ok(())
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
        }"
    .to_string();

    let parsed = helpers::parse(quint_content)?;
    let init_def = helpers::find_definition_by_name(&parsed, "init")?;
    let step_def = helpers::find_definition_by_name(&parsed, "step")?;
    let input_def = helpers::find_definition_by_name(&parsed, "input")?;

    let mut interpreter = Interpreter::new(&parsed.table);
    let mut env = Env::new(interpreter.var_storage.clone());

    let init = interpreter.eval(&mut env, &init_def.expr);
    assert_eq!(init.unwrap(), Value::Bool(true));

    interpreter.shift();

    // After shifting, the value of x + y should be 2
    let input = interpreter.eval(&mut env, &input_def.expr);
    assert_eq!(input.unwrap(), Value::Int(2));

    let step = interpreter.eval(&mut env, &step_def.expr);
    assert_eq!(step.unwrap(), Value::Bool(true));

    interpreter.shift();

    // After shifting, the value of x + y should be 5
    let input = interpreter.eval(&mut env, &input_def.expr);
    assert_eq!(input.unwrap(), Value::Int(5));

    Ok(())
}
