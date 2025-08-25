use quint_evaluator::{
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

        let init = interpreter.eval(&mut env, init_def.expr.clone());
        assert_eq!(init.unwrap(), Value::Bool(true));

        interpreter.shift();

        let input_def = parsed.find_definition_by_name("input")?;
        let input = interpreter.eval(&mut env, input_def.expr.clone());
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

#[test]
fn nested_set_of_maps_pick_test() -> Result<(), Box<dyn std::error::Error>> {
    // Regression test for issue #1736
    let quint_content = "module main {
          val A = Set(\"a\", \"b\", \"c\")
          val B = Set(2, 3, 4)
          val C = Set(\"x\", \"y\")

          var myMap: str -> (int -> str)

          val input = myMap.get(\"a\").get(2)

          action init = {
            nondet _foo = A.setOfMaps(B.setOfMaps(C)).oneOf()
            myMap' = _foo
          }
          action step = myMap' = myMap
        }";

    run_test!(quint_content, Value::Str("x".into()))
}
