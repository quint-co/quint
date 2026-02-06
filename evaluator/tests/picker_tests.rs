use quint_evaluator::{
    evaluator::{Env, Interpreter},
    helpers,
    value::Value,
};

macro_rules! run_test {
    ($content:expr, $expected_value:expr) => {{
        let parsed = helpers::parse($content, "init", "step", None)?;
        let init_def = parsed.find_definition_by_name("init")?;

        let mut interpreter = Interpreter::new(parsed.table.clone());
        // Set a specific seed so different runs generate the same result
        let mut env = Env::with_rand_state(interpreter.var_storage.clone(), 0x42);

        let init = interpreter.eval(&mut env, init_def.expr.clone());
        assert_eq!(init.unwrap(), Value::bool(true));

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

    run_test!(quint_content, Value::int(3))
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

    run_test!(quint_content, Value::int(5))
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

    run_test!(quint_content, Value::str("x".into()))
}

#[test]
fn powerset_large_set_pick_test() -> Result<(), Box<dyn std::error::Error>> {
    // Regression test for overflow with large powersets (base >= 64 elements)
    // This test verifies that we can pick from powersets of large sets without overflow
    let quint_content = "module main {
          // Create a set with 70 elements
          val largeSet = 1.to(70)
          var subset: Set[int]
          val input = subset.size()

          action init = {
            // Pick a subset from the powerset
            nondet s = largeSet.powerset().oneOf()
            subset' = s
          }
          action step = subset' = subset
        }";

    let parsed = helpers::parse(quint_content, "init", "step", None)?;
    let init_def = parsed.find_definition_by_name("init")?;

    let mut interpreter = Interpreter::new(&parsed.table);
    let mut env = Env::with_rand_state(interpreter.var_storage.clone(), 0x42);

    let init = interpreter.eval(&mut env, init_def.expr.clone());
    // Should not panic or overflow - just check it runs successfully
    assert!(init.is_ok());
    assert_eq!(init.unwrap(), Value::bool(true));

    Ok(())
}

#[test]
fn powerset_very_large_set_pick_test() -> Result<(), Box<dyn std::error::Error>> {
    // Regression test for overflow with large powersets (base >= 64 elements)
    // This test verifies that we can pick from powersets of large sets without overflow
    let quint_content = "module main {
          // Create a set with 500 elements
          val largeSet = 1.to(500)
          var subset: Set[int]
          val input = subset.size()

          action init = {
            // Pick a subset from the powerset
            nondet s = largeSet.powerset().oneOf()
            subset' = s
          }
          action step = subset' = subset
        }";

    let parsed = helpers::parse(quint_content, "init", "step", None)?;
    let init_def = parsed.find_definition_by_name("init")?;

    let mut interpreter = Interpreter::new(&parsed.table);
    let mut env = Env::with_rand_state(interpreter.var_storage.clone(), 0x42);

    let init = interpreter.eval(&mut env, init_def.expr.clone());
    // Should not panic or overflow - just check it runs successfully
    assert!(init.is_ok());
    assert_eq!(init.unwrap(), Value::bool(true));

    Ok(())
}
