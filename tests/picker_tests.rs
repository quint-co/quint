use quint_simulator::{
    evaluator::{Env, Interpreter},
    value::Value,
};

mod helpers;

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

    let parsed = helpers::parse(&quint_content)?;
    let init_def = helpers::find_definition_by_name(&parsed, "init")?;
    let input_def = helpers::find_definition_by_name(&parsed, "input")?;

    let mut interpreter = Interpreter::new(&parsed.table);
    let mut env = Env::new(interpreter.var_storage.clone());

    // Set a specific seed so different runs generate the same result
    env.rand.set_state(123_456);

    let init = interpreter.eval(&mut env, &init_def.expr);
    assert_eq!(init.unwrap(), Value::Bool(true));

    interpreter.shift();

    // After shifting, the value of x should be 2
    let input = interpreter.eval(&mut env, &input_def.expr);
    assert_eq!(input.unwrap(), Value::Int(2));

    Ok(())
}
