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
    // Regression test for QNT-109: powerset overflow for sets with > 64 elements
    // This test verifies that we can pick from powersets of large sets without overflow
    let quint_content = "module main {
          // Create a set with 70 elements (more than 64)
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
fn powerset_samples_large_subsets() -> Result<(), Box<dyn std::error::Error>> {
    // BUG DETECTION TEST: Demonstrates that powerset sampling is broken
    //
    // With the current implementation:
    // - bounds() returns vec![70] for a 70-element set (WRONG! should be 2^70)
    // - rand.next(70) generates indices 0-69 (capped at 69)
    // - powerset_at_index interprets index as bit vector
    // - To get a subset of size N, we need N bits set in the index
    // - Max index 69 has only ~7 bits set, so we can only sample small subsets!
    //
    // This test samples 10,000 times and checks if we ever see a large subset (size > 30)
    // Expected with bug: NEVER see large subsets (max size will be ~7)
    // Expected with fix: Should occasionally see large subsets
    let quint_content = "module main {
          val largeSet = 1.to(70)
          var subsetSize: int
          val input = subsetSize

          action init = {
            nondet s = largeSet.powerset().oneOf()
            subsetSize' = s.size()
          }
          action step = subsetSize' = subsetSize
        }";

    let parsed = helpers::parse(quint_content, "init", "step", None)?;
    let init_def = parsed.find_definition_by_name("init")?;
    let input_def = parsed.find_definition_by_name("input")?;

    let mut max_size_seen = 0;

    // Sample 10,000 times with different seeds
    for seed in 0..10000 {
        let mut interpreter = Interpreter::new(&parsed.table);
        let mut env = Env::with_rand_state(interpreter.var_storage.clone(), seed);

        let init_result = interpreter.eval(&mut env, init_def.expr.clone());
        assert!(init_result.is_ok());

        interpreter.shift();

        let size = interpreter.eval(&mut env, input_def.expr.clone())?;
        let n = size.as_int();
        if n > max_size_seen {
            max_size_seen = n;
        }
    }

    println!(
        "Maximum subset size seen across 10,000 samples: {}",
        max_size_seen
    );

    // With the bug, max_size_seen will be <= ~7 (popcount of indices 0-69)
    // With proper implementation, should eventually see large subsets (size > 30)
    assert!(
        max_size_seen > 30,
        "Bug confirmed: Maximum subset size was only {}, but should be able to sample large subsets (> 30). \
         This proves we're only sampling from ~70 specific subsets instead of 2^70 possibilities.",
        max_size_seen
    );

    Ok(())
}
