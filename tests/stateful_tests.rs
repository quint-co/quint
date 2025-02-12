use quint_simulator::{
    evaluator::{Env, Interpreter},
    value::Value,
};

mod helpers;

#[test]
fn stateful_test() -> Result<(), Box<dyn std::error::Error>> {
    let quint_content = format!(
        "module main {{
          var x: int
          val input = x 
          action init = x' = 0
          action step = x' = x + 1
        }}"
    );

    let parsed = helpers::parse(quint_content)?;
    let init_def = helpers::find_definition_by_name(&parsed, "init")?;
    let step_def = helpers::find_definition_by_name(&parsed, "step")?;
    let input_def = helpers::find_definition_by_name(&parsed, "input")?;

    let mut interpreter = Interpreter::new(&parsed.table);
    let mut env = Env::new(interpreter.var_storage.clone());
    let v = interpreter.eval(&mut env, &init_def.expr);

    assert_eq!(v.unwrap(), Value::Bool(true));

    Ok(())
}
