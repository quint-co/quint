use std::rc::Rc;

use quint_simulator::{
    evaluator::{run, Env, EvalResult, Interpreter},
    helpers,
    value::Value,
};

fn assert_from_string(input: &str, expected: &str) -> Result<(), Box<dyn std::error::Error>> {
    let quint_content = |expr: &str| {
        format!(
            "module main {{
              type T = Some(int) | None
              val expr = {expr}
              val init = true
              val step = true
            }}"
        )
    };

    let parsed = helpers::parse(&quint_content(input), "init", "step", None)?;
    let input_def = parsed.find_definition_by_name("expr")?;
    let value = run(&parsed.table, &input_def.expr);

    if expected == "undefined" {
        assert!(value.is_err(), "Expected error, got: {:?}", value);
        return Ok(());
    }

    let parsed_expected = helpers::parse(&quint_content(expected), "init", "step", None)?;
    let expected_def = parsed_expected.find_definition_by_name("expr")?;
    let expected_value = run(&parsed_expected.table, &expected_def.expr);

    let value = value.map(|v| v.normalize());

    assert_eq!(
        value, expected_value,
        "expression: {input}, expected: {expected:#?}, got: {value:#?}",
    );

    Ok(())
}
fn eval_run(callee: &str, input: &str) -> EvalResult {
    let quint_content = {
        format!(
            "module main {{
              type T = Some(int) | None
              val init = true
              val step = true
              {input}
            }}"
        )
    };

    let parsed = helpers::parse(&quint_content, "init", "step", None).unwrap();
    let run_def = parsed.find_definition_by_name(callee).unwrap();
    let mut interpreter = Interpreter::new(&parsed.table);
    let mut env = Env::new(Rc::clone(&interpreter.var_storage));

    interpreter.eval(&mut env, run_def.expr.clone())
}

fn assert_var_after_run(
    var_name: &str,
    expected: &str,
    callee: &str,
    input: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let quint_content = {
        format!(
            "module main {{
              type T = Some(int) | None
              val init = true
              val step = true
              {input}
              val expected = {expected}
            }}"
        )
    };

    let parsed = helpers::parse(&quint_content, "init", "step", None)?;
    let run_def = parsed.find_definition_by_name(callee)?;
    let mut interpreter = Interpreter::new(&parsed.table);
    let mut env = Env::new(Rc::clone(&interpreter.var_storage));

    let run_result = interpreter.eval(&mut env, run_def.expr.clone());

    assert_eq!(run_result, Ok(Value::Bool(true)));

    let storage = env.var_storage.borrow();
    let var_value = storage
        .next_vars
        .values()
        .find(|v| v.borrow().name == var_name)
        .unwrap()
        .borrow();
    let var_value = var_value.clone().value.unwrap().normalize();

    let parsed_expected = helpers::parse(&quint_content, "init", "step", None)?;
    let expected_def = parsed_expected.find_definition_by_name("expected")?;
    let expected_value = run(&parsed_expected.table, &expected_def.expr)?;

    assert_eq!(
        var_value, expected_value,
        "expression: {input}, expected: {expected:#?}, got: {var_value:#?}",
    );

    Ok(())
}

#[test]
fn set1() -> Result<(), Box<dyn std::error::Error>> {
    let expr = "Set(1, 2, 3).map(x => x + 5).forall(x => x > 3)";
    assert_from_string(expr, "true")
}

#[test]
fn integer_literals() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("15", "15")?;
    assert_from_string("100_000_000", "100000000")?;
    assert_from_string("0xabcdef", "11259375")?;
    assert_from_string("0xab_cd_ef", "11259375")?;
    assert_from_string("0xAbCdEF", "11259375")?;
    assert_from_string("0xaB_cD_eF", "11259375")
}

#[test]
fn addition() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("2 + 3", "5")
}

#[test]
fn subtraction() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("2 - 3", "-1")
}

#[test]
fn negation() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("-(2 + 3)", "-5")
}

#[test]
fn multiplication() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("2 * 3", "6")
}

#[test]
fn division() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("7 / 2", "3")
}

#[test]
fn remainder() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("7 % 2", "1")
}

#[test]
fn power() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("3^4", "81")?;
    assert_from_string("(-2)^3", "-8")?;
    assert_from_string("-2^3", "-8")?;
    assert_from_string("(-2)^4", "16")?;
    assert_from_string("-2^4", "-16")?;
    assert_from_string("0^(-1)", "undefined")?;
    assert_from_string("0^0", "undefined")
}

#[test]
fn greater_than() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("5 > 3", "true")?;
    assert_from_string("5 > 5", "false")?;
    assert_from_string("3 > 5", "false")
}

#[test]
fn less_than() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("5 < 3", "false")?;
    assert_from_string("5 < 5", "false")?;
    assert_from_string("3 < 5", "true")
}

#[test]
fn greater_than_or_equal() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("5 >= 4", "true")?;
    assert_from_string("5 >= 5", "true")?;
    assert_from_string("4 >= 5", "false")
}

#[test]
fn less_than_or_equal() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("5 <= 4", "false")?;
    assert_from_string("5 <= 5", "true")?;
    assert_from_string("4 <= 5", "true")
}

#[test]
fn integer_equality() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("5 == 4", "false")?;
    assert_from_string("4 == 4", "true")
}

#[test]
fn integer_inequality() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("5 != 4", "true")?;
    assert_from_string("4 != 4", "false")
}

#[test]
fn boolean_literals() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("false", "false")?;
    assert_from_string("true", "true")
}

#[test]
fn not() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("not(false)", "true")?;
    assert_from_string("not(true)", "false")
}

#[test]
fn and() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("false and false", "false")?;
    assert_from_string("false and true", "false")?;
    assert_from_string("true and false", "false")?;
    assert_from_string("true and true", "true")?;
    assert_from_string("and(true, true, false)", "false")?;
    assert_from_string("and(true, true, true)", "true")
}

#[test]
fn and_short_circuit() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("false and (1/0 == 0)", "false")?;
    assert_from_string("true and (1/0 == 0)", "undefined")
}

#[test]
fn or() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("false or false", "false")?;
    assert_from_string("false or true", "true")?;
    assert_from_string("true or false", "true")?;
    assert_from_string("true or true", "true")?;
    assert_from_string("or(false, true, true)", "true")?;
    assert_from_string("or(true, true, false)", "true")?;
    assert_from_string("or(false, false, false)", "false")
}

#[test]
fn or_short_circuit() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("false or (1/0 == 0)", "undefined")?;
    assert_from_string("true or (1/0 == 0)", "true")
}

#[test]
fn implies() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("false implies false", "true")?;
    assert_from_string("false implies true", "true")?;
    assert_from_string("true implies false", "false")?;
    assert_from_string("true implies true", "true")
}

#[test]
fn implies_short_circuit() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("false implies (1/0 == 0)", "true")?;
    assert_from_string("true implies (1/0 == 0)", "undefined")
}

#[test]
fn iff() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("false iff false", "true")?;
    assert_from_string("false iff true", "false")?;
    assert_from_string("true iff false", "false")?;
    assert_from_string("true iff true", "true")
}

#[test]
fn boolean_equality() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("false == false", "true")?;
    assert_from_string("true  == true", "true")?;
    assert_from_string("false == true", "false")?;
    assert_from_string("true  == false", "false")
}

#[test]
fn boolean_inequality() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("false != false", "false")?;
    assert_from_string("true  != true", "false")?;
    assert_from_string("false != true", "true")?;
    assert_from_string("true  != false", "true")
}

#[test]
fn if_then_else() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("if (false) false else true", "true")?;
    assert_from_string("if (true) false else true", "false")?;
    assert_from_string("if (3 > 5) 1 else 2", "2")?;
    assert_from_string("if (5 > 3) 1 else 2", "1")
}

#[test]
fn value_definitions() -> Result<(), Box<dyn std::error::Error>> {
    let input = "val x = 3 + 4
       val y = 2 * x
       y - x";
    assert_from_string(input, "7")
}

#[test]
fn multi_arg_definitions() -> Result<(), Box<dyn std::error::Error>> {
    let input = "def mult(x, y) = (x * y)
       mult(2, mult(3, 4))";
    assert_from_string(input, "24")
}

#[test]
fn named_def_used_instead_of_lambda() -> Result<(), Box<dyn std::error::Error>> {
    let input = "def positive(x) = x > 0
       (-3).to(3).filter(positive)";
    assert_from_string(input, "Set(1, 2, 3)")
}

#[test]
fn higher_order_operators_with_lambda() -> Result<(), Box<dyn std::error::Error>> {
    let input = "def ho(lo, n) = lo(n)
       ho(x => x * 2, 3)";
    assert_from_string(input, "6")
}

#[test]
fn higher_order_operators_in_folds() -> Result<(), Box<dyn std::error::Error>> {
    let input = "def plus(i, j) = i + j
       2.to(6).fold(0, plus)";
    assert_from_string(input, "20")
}

// TODO: variables
// #[test]
// fn compile_variables() -> Result<(), Box<dyn std::error::Error>> {
//     let context = "var x: int";
//     let input = "x' = 1";
//     assert_var_exists("x", context, input)
// }

#[test]
fn compile_over_sets() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("2.to(5)", "Set(2, 3, 4, 5)")
}

#[test]
fn interval_cardinality() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("2.to(5).size()", "4")
}

#[test]
fn interval_is_finite() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("2.to(5).isFinite()", "true")
}

#[test]
fn set_is_flat() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Set(1, 3 - 1, 3)", "Set(1, 2, 3)")
}

#[test]
fn flat_set_cardinality() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Set(1, 4 - 1, 3).size()", "2")
}

#[test]
fn flat_set_is_finite() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Set(1, 4 - 1, 3).isFinite()", "true")
}

#[test]
fn flat_set_without_duplicates() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Set(1, 2, 3 - 1, 3, 1)", "Set(1, 2, 3)")
}

#[test]
fn set_of_sets() -> Result<(), Box<dyn std::error::Error>> {
    let input = "Set(Set(1, 2), Set(2, 3), Set(1, 3))";
    // Rust's order is different from Typescript
    // I think rust's is keeping the original order
    // assert_from_string(input, "Set(Set(1, 2), Set(1, 3), Set(2, 3))")
    assert_from_string(input, "Set(Set(1, 2), Set(2, 3), Set(1, 3))")
}

#[test]
fn set_of_sets_cardinality() -> Result<(), Box<dyn std::error::Error>> {
    let input = "Set(Set(1, 2), Set(2, 3), Set(1, 3)).size()";
    assert_from_string(input, "3")
}

#[test]
fn set_of_intervals() -> Result<(), Box<dyn std::error::Error>> {
    let input = "Set(1.to(3), 3.to(4))";
    assert_from_string(input, "Set(Set(1, 2, 3), Set(3, 4))")
}

#[test]
fn set_equality() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Set(1, 2) == Set(1, 3 - 1)", "true")?;
    assert_from_string("Set(1, 2) == Set(1, 3 - 3)", "false")
}

#[test]
fn intervals_equality() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("1.to(3) == 1.to(4 - 1)", "true")?;
    assert_from_string("1.to(3) == Set(1, 2, 3)", "true")?;
    assert_from_string("Set(1, 2, 3) == 1.to(3)", "true")?;
    assert_from_string("(-3).to(4) == Set(-3, -2, -1, 0, 1, 2, 3, 4)", "true")?;
    assert_from_string("(-2).to(-4) == Set()", "true")?;
    assert_from_string("3.to(-2) == Set()", "true")?;
    assert_from_string("1.to(3) == 1.to(4)", "false")?;
    assert_from_string("(-1).to(3) == 1.to(3)", "false")?;
    assert_from_string("2.to(4) == 1.to(4)", "false")?;
    assert_from_string("(-4).to(-2) == (-2).to(-4)", "false")?;
    assert_from_string("3.to(0) == 4.to(-1)", "true")
    // See: https://github.com/informalsystems/quint/issues/578
    // assert_from_string("-1.to(2) == Set(-1, 0, 1, 2)", "true")
}

#[test]
fn set_inequality() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Set(1, 2) != Set(1, 3 - 1)", "false")?;
    assert_from_string("Set(1, 2) != Set(1, 3 - 3)", "true")
}

#[test]
fn intervals_inequality() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("1.to(3) != 1.to(4 - 1)", "false")?;
    assert_from_string("1.to(3) != Set(1, 2, 3)", "false")?;
    assert_from_string("Set(1, 2, 3) != 1.to(3)", "false")?;
    assert_from_string("1.to(3) != 1.to(4)", "true")?;
    assert_from_string("2.to(4) != 1.to(4)", "true")
}

#[test]
fn set_of_sets_without_duplicates() -> Result<(), Box<dyn std::error::Error>> {
    let input = "Set(Set(1, 2), Set(2, 3), Set(1, 3), Set(2 - 1, 2 + 1))";
    assert_from_string(input, "Set(Set(1, 2), Set(2, 3), Set(1, 3))")
}

#[test]
fn set_contains() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Set(1, 2, 3).contains(2)", "true")?;
    assert_from_string("Set(1, 2, 3).contains(4)", "false")
}

#[test]
fn set_in() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("2.in(Set(1, 2, 3))", "true")?;
    assert_from_string("4.in(Set(1, 2, 3))", "false")
}

#[test]
fn set_in_interval() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("2.in(1.to(3))", "true")?;
    assert_from_string("4.in(1.to(3))", "false")?;
    assert_from_string("1.to(3).in(Set(1.to(3), 2.to(4)))", "true")
}

#[test]
fn set_in_nested_sets() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Set(1, 2).in(Set(Set(1, 2), Set(2, 3)))", "true")?;
    assert_from_string("Set(1, 3).in(Set(Set(1, 2), Set(2, 3)))", "false")
}

#[test]
fn set_subseteq() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Set(1, 2).subseteq(Set(1, 2, 3))", "true")?;
    assert_from_string("Set(1, 2, 4).subseteq(Set(1, 2, 3))", "false")
}

#[test]
fn interval_subseteq() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("2.to(4).subseteq(1.to(10))", "true")?;
    assert_from_string("2.to(0).subseteq(3.to(0))", "true")?;
    assert_from_string("Set(2, 3, 4).subseteq(1.to(10))", "true")?;
    assert_from_string("2.to(4).subseteq(1.to(3))", "false")?;
    assert_from_string("2.to(4).subseteq(Set(1, 2, 3))", "false")
}

#[test]
fn set_union() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Set(1, 2).union(Set(1, 3))", "Set(1, 2, 3)")?;
    assert_from_string("1.to(3).union(2.to(4))", "Set(1, 2, 3, 4)")?;
    assert_from_string("Set(1, 2, 3).union(2.to(4))", "Set(1, 2, 3, 4)")?;
    assert_from_string("1.to(3).union(Set(2, 3, 4))", "Set(1, 2, 3, 4)")
}

#[test]
fn set_intersect() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Set(1, 2).intersect(Set(1, 3))", "Set(1)")?;
    assert_from_string("1.to(3).intersect(2.to(4))", "Set(2, 3)")?;
    assert_from_string("Set(1, 2, 3).intersect(2.to(4))", "Set(2, 3)")?;
    assert_from_string("1.to(3).intersect(Set(2, 3, 4))", "Set(2, 3)")
}

#[test]
fn set_exclude() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Set(1, 2, 4).exclude(Set(1, 3))", "Set(2, 4)")?;
    assert_from_string("1.to(3).exclude(2.to(4))", "Set(1)")?;
    assert_from_string("Set(1, 2, 3).exclude(2.to(4))", "Set(1)")?;
    assert_from_string("1.to(3).exclude(Set(2, 3, 4))", "Set(1)")
}

#[test]
fn set_flatten() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string(
        "Set(Set(1, 2), Set(2, 3), Set(3, 4)).flatten()",
        "Set(1, 2, 3, 4)",
    )?;
    assert_from_string(
        "Set(Set(Set(1, 2), Set(2, 3)), Set(Set(3, 4))).flatten()",
        "Set(Set(1, 2), Set(2, 3), Set(3, 4))",
    )
}

#[test]
fn set_exists() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Set(1, 2, 3).exists(x => true)", "true")?;
    assert_from_string("Set(1, 2, 3).exists(x => false)", "false")?;
    assert_from_string("Set(1, 2, 3).exists(x => x >= 2)", "true")?;
    assert_from_string("Set(1, 2, 3).exists(x => x >= 5)", "false")
}

#[test]
fn set_exists_with_tuples() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string(
        "tuples(1.to(3), 4.to(6)).exists(((x, y)) => x + y == 7)",
        "true",
    )
}

#[test]
fn set_exists_over_intervals() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("1.to(3).exists(x => true)", "true")?;
    assert_from_string("1.to(3).exists(x => false)", "false")?;
    assert_from_string("1.to(3).exists(x => x >= 2)", "true")?;
    assert_from_string("1.to(3).exists(x => x >= 5)", "false")
}

#[test]
fn set_forall() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Set(1, 2, 3).forall(x => true)", "true")?;
    assert_from_string("Set(1, 2, 3).forall(x => false)", "false")?;
    assert_from_string("Set(1, 2, 3).forall(x => x >= 2)", "false")?;
    assert_from_string("Set(1, 2, 3).forall(x => x >= 0)", "true")
}

#[test]
fn set_forall_with_tuples() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string(
        "tuples(1.to(3), 4.to(6)).forall(((x, y)) => x + y <= 9)",
        "true",
    )
}

#[test]
fn set_forall_over_nested_sets() -> Result<(), Box<dyn std::error::Error>> {
    let input = "Set(Set(1, 2), Set(2, 3)).forall(s => 2.in(s))";
    assert_from_string(input, "true")
}

#[test]
fn set_forall_over_intervals() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("1.to(3).forall(x => true)", "true")?;
    assert_from_string("1.to(3).forall(x => false)", "false")?;
    assert_from_string("1.to(3).forall(x => x >= 2)", "false")?;
    assert_from_string("1.to(3).forall(x => x >= 0)", "true")
}

#[test]
fn set_map() -> Result<(), Box<dyn std::error::Error>> {
    // a bijection
    assert_from_string("Set(1, 2, 3).map(x => 2 * x)", "Set(2, 4, 6)")?;
    // not an injection: 2 and 3 are mapped to 1
    assert_from_string("Set(1, 2, 3).map(x => x / 2)", "Set(0, 1)")
}

#[test]
fn set_map_with_tuples() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string(
        "tuples(1.to(3), 4.to(6)).map(((x, y)) => x + y)",
        "Set(5, 6, 7, 8, 9)",
    )
}

#[test]
fn set_map_over_intervals() -> Result<(), Box<dyn std::error::Error>> {
    // a bijection
    assert_from_string("1.to(3).map(x => 2 * x)", "Set(2, 4, 6)")?;
    // not an injection: 2 and 3 are mapped to 1
    assert_from_string("1.to(3).map(x => x / 2)", "Set(0, 1)")
}

#[test]
fn set_filter() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Set(1, 2, 3, 4).filter(x => false)", "Set()")?;
    assert_from_string("Set(1, 2, 3, 4).filter(x => true)", "Set(1, 2, 3, 4)")?;
    assert_from_string("Set(1, 2, 3, 4).filter(x => x % 2 == 0)", "Set(2, 4)")
}

#[test]
fn set_filter_with_tuples() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string(
        "tuples(1.to(5), 2.to(3)).filter(((x, y)) => x < y)",
        "Set((1, 2), (1, 3), (2, 3))",
    )
}

#[test]
fn set_filter_over_intervals() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("1.to(4).filter(x => false)", "Set()")?;
    assert_from_string("1.to(4).filter(x => true)", "Set(1, 2, 3, 4)")?;
    assert_from_string("1.to(4).filter(x => x % 2 == 0)", "Set(2, 4)")
}

#[test]
fn set_filter_over_sets_of_intervals() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string(
        "Set(1.to(4), 2.to(3)).filter(S => S.contains(1))",
        "Set(Set(1, 2, 3, 4))",
    )?;
    assert_from_string("Set(1.to(4), 2.to(3)).filter(S => S.contains(0))", "Set()")
}

#[test]
fn set_fold() -> Result<(), Box<dyn std::error::Error>> {
    // sum
    assert_from_string("Set(1, 2, 3).fold(10, (v, x) => v + x)", "16")?;
    assert_from_string("Set().fold(10, (v, x) => v + x)", "10")?;
    // flatten
    let input = "Set(1.to(3), 4.to(5), 6.to(7)).fold(Set(0), (a, s) => a.union(s))";
    assert_from_string(input, "Set(0, 1, 2, 3, 4, 5, 6, 7)")?;
    assert_from_string("Set().fold(Set(), (a, s) => a.union(s))", "Set()")?;
    // product by using a definition
    let input = "def prod(x, y) = x * y;
       2.to(4).fold(1, prod)";
    assert_from_string(input, "24")
}

#[test]
fn set_powerset() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string(
        "2.to(4).powerset()",
        "Set(Set(), Set(2), Set(3), Set(2, 3), Set(4), Set(2, 4), Set(3, 4), Set(2, 3, 4))",
    )
}

#[test]
fn set_powerset_equality() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string(
        "2.to(3).powerset() == Set(Set(), Set(2), Set(3), Set(2, 3))",
        "true",
    )?;
    assert_from_string("2.to(3).powerset() == Set(2, 3).powerset()", "true")?;
    assert_from_string("2.to(4).powerset() == Set(2, 3).powerset()", "false")
}

#[test]
fn set_powerset_contains() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("2.to(3).powerset().contains(Set(2))", "true")?;
    assert_from_string("2.to(3).powerset().contains(Set(2, 4))", "false")
}

#[test]
fn set_powerset_subseteq() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("2.to(4).powerset().subseteq(1.to(5).powerset())", "true")
}

#[test]
fn set_powerset_cardinality() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Set().powerset().size()", "1")?;
    assert_from_string("2.to(4).powerset().size()", "8")?;
    assert_from_string("2.to(5).powerset().size()", "16")
}

// TODO builtin values tests

#[test]
fn tuple_constructors() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Tup(1, 2, 3)", "(1, 2, 3)")?;
    assert_from_string("(1, 2, 3)", "(1, 2, 3)")?;
    assert_from_string("(1, 2, 3,)", "(1, 2, 3)")
}

#[test]
fn tuple_access() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("(4, 5, 6)._1", "4")?;
    assert_from_string("(4, 5, 6)._2", "5")?;
    assert_from_string("(4, 5, 6)._3", "6")
}

#[test]
fn tuple_equality() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("(4, 5, 6) == (5 - 1, 5, 6)", "true")?;
    assert_from_string("(4, 5, 6) == (5, 5, 6)", "false")
}

#[test]
fn cross_products() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("tuples(Set(), Set(), Set())", "Set()")?;
    assert_from_string("tuples(Set(), 2.to(3))", "Set()")?;
    assert_from_string("tuples(2.to(3), Set(), 3.to(5))", "Set()")?;
    assert_from_string(
        "tuples(1.to(2), 2.to(3))",
        "Set((1, 2), (1, 3), (2, 2), (2, 3))",
    )?;
    assert_from_string("tuples(1.to(1), 1.to(1), 1.to(1))", "Set((1, 1, 1))")?;
    assert_from_string(
        "tuples(1.to(3), 2.to(4)) == tuples(1.to(3), 2.to(5 - 1))",
        "true",
    )?;
    assert_from_string(
        "tuples(1.to(3), 2.to(4)) == tuples(1.to(3), 2.to(5 + 1))",
        "false",
    )?;
    assert_from_string(
        "tuples(1.to(3), 2.to(4)).subseteq(tuples(1.to(3), 2.to(5 + 1)))",
        "true",
    )?;
    assert_from_string(
        "tuples(1.to(4), 2.to(4)).subseteq(tuples(1.to(3), 2.to(5)))",
        "false",
    )?;
    assert_from_string(
        "Set(tuples(1.to(2), 2.to(3)))",
        "Set(Set((1, 2), (1, 3), (2, 2), (2, 3)))",
    )
}

#[test]
fn cross_product_cardinality() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("tuples(1.to(4), 2.to(4)).size()", "12")?;
    assert_from_string("tuples(Set(), 2.to(4)).size()", "0")
}

#[test]
fn list_constructors() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("[4, 2, 3]", "List(4, 2, 3)")?;
    assert_from_string("[4, 2, 3, ]", "List(4, 2, 3)")?;
    assert_from_string("List(4, 2, 3)", "List(4, 2, 3)")
}

#[test]
fn list_range() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("range(3, 7)", "List(3, 4, 5, 6)")?;
    assert_from_string("range(4, 5)", "List(4)")?;
    assert_from_string("range(3, 3)", "List()")
}

#[test]
fn list_equality() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("[4, 5, 6] == [5 - 1, 5, 6]", "true")?;
    assert_from_string("[4, 5, 6] == [5, 5, 6]", "false")
}

#[test]
fn list_access() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("[4, 5, 6].nth(0)", "4")?;
    assert_from_string("[4, 5, 6].nth(2)", "6")?;
    assert_from_string("[4, 5, 6].nth(-1)", "undefined")?;
    assert_from_string("[4, 5, 6].nth(3)", "undefined")
}

#[test]
fn list_length() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("[4, 5, 6].length()", "3")?;
    assert_from_string("[].length()", "0")
}

#[test]
fn list_indices() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("[4, 5, 6].indices()", "Set(0, 1, 2)")?;
    assert_from_string("[].indices()", "Set()")
}

#[test]
fn list_append() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("[4, 2, 3].append(5)", "List(4, 2, 3, 5)")?;
    assert_from_string("[].append(3)", "List(3)")
}

#[test]
fn list_concat() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("[4, 2, 3].concat([5, 6])", "List(4, 2, 3, 5, 6)")?;
    assert_from_string("[].concat([3, 4])", "List(3, 4)")?;
    assert_from_string("[3, 4].concat([])", "List(3, 4)")?;
    assert_from_string("[].concat([])", "List()")
}

#[test]
fn list_head() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("[4, 5, 6].head()", "4")?;
    assert_from_string("[].head()", "undefined")
}

#[test]
fn list_tail() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("[4, 5, 6].tail()", "List(5, 6)")?;
    assert_from_string("[4].tail()", "List()")?;
    assert_from_string("[].tail()", "undefined")
}

#[test]
fn list_slice() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("[4, 5, 6, 7].slice(1, 3)", "List(5, 6)")?;
    assert_from_string("[4, 5, 6, 7].slice(0, 4)", "List(4, 5, 6, 7)")?;
    assert_from_string("[4, 5, 6, 7].slice(1, 7)", "undefined")?;
    assert_from_string("[4, 5, 6, 7].slice(-1, 3)", "undefined")?;
    assert_from_string("[1, 2].slice(1, 2)", "List(2)")?;
    assert_from_string("[1, 2].slice(1, 1)", "List()")?;
    assert_from_string("[1, 2].slice(2, 2)", "List()")?;
    assert_from_string("[1, 2].slice(2, 1)", "undefined")?;
    assert_from_string("[].slice(0, 0)", "List()")?;
    assert_from_string("[].slice(1, 0)", "undefined")?;
    assert_from_string("[].slice(1, 1)", "undefined")?;
    assert_from_string("[].slice(0, -1)", "undefined")
}

#[test]
fn list_replace_at() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("[4, 5, 6].replaceAt(0, 10)", "List(10, 5, 6)")?;
    assert_from_string("[4, 5, 6].replaceAt(2, 10)", "List(4, 5, 10)")?;
    assert_from_string("[4, 5, 6].replaceAt(4, 10)", "undefined")?;
    assert_from_string("[4, 5, 6].replaceAt(-1, 10)", "undefined")
}

#[test]
fn list_foldl() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("[].foldl(3, (i, e) => i + e)", "3")?;
    assert_from_string("[4, 5, 6, 7].foldl(1, (i, e) => i + e)", "23")?;
    assert_from_string(
        "[4, 5, 6, 7].foldl([], (l, e) => l.append(e))",
        "List(4, 5, 6, 7)",
    )
}

#[test]
fn list_foldr() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("[].foldr(3, (e, i) => e + i)", "3")?;
    assert_from_string("[4, 5, 6, 7].foldr(1, (e, i) => e + i)", "23")?;
    assert_from_string(
        "[4, 5, 6, 7].foldr([], (e, l) => l.append(e))",
        "List(7, 6, 5, 4)",
    )
}

#[test]
fn list_select() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("[].select(e => e % 2 == 0)", "List()")?;
    assert_from_string("[4, 5, 6].select(e => e % 2 == 0)", "List(4, 6)")
}

#[test]
fn all_lists_up_to() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string(
        "Set(1, 2, 3).allListsUpTo(2)",
        "Set(List(), List(1), List(2), List(3), List(1, 1), List(2, 1), List(3, 1), List(1, 2), List(2, 2), List(3, 2), List(1, 3), List(2, 3), List(3, 3))"
    )?;
    assert_from_string(
        "Set(1).allListsUpTo(3)",
        "Set(List(), List(1), List(1, 1), List(1, 1, 1))",
    )?;
    assert_from_string("Set().allListsUpTo(3)", "Set(List())")?;
    assert_from_string("Set(1).allListsUpTo(0)", "Set(List())")
}

#[test]
fn set_get_only_element() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Set(5).getOnlyElement()", "5")?;
    assert_from_string("Set().getOnlyElement()", "undefined")?;
    assert_from_string("Set(1, 2).getOnlyElement()", "undefined")
}

#[test]
fn record_constructors() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Rec(\"a\", 2, \"b\", true)", "{ a: 2, b: true }")?;
    assert_from_string("{ a: 2, b: true }", "{ a: 2, b: true }")?;
    assert_from_string("{ a: 2, b: true, }", "{ a: 2, b: true }")
}

#[test]
fn record_equality() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("{ a: 2 + 3, b: true } == { a: 5, b: true }", "true")?;
    assert_from_string("{ a: 3, b: true } == { b: true, a: 3 }", "true")?;
    assert_from_string("{ a: 2 + 3, b: true } == { a: 1, b: false }", "false")
}

#[test]
fn record_field_access() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("{ a: 2, b: true }.a", "2")?;
    assert_from_string("{ a: 2, b: true }.b", "true")
}

#[test]
fn record_field_names() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("{ a: 2, b: true }.fieldNames()", "Set(\"a\", \"b\")")
}

#[test]
fn record_field_update() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("{ a: 2, b: true }.with(\"a\", 3)", "{ a: 3, b: true }")
}

#[test]
fn variant_constructor() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Some(40 + 2)", "Some(42)")?;
    assert_from_string("None", "None")
}

#[test]
fn variant_match() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("match Some(40 + 2) { Some(x) => x | None => 0 }", "42")?;
    assert_from_string("match None { Some(x) => x | None => 0 }", "0")
}

#[test]
fn variant_match_default() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("match None { Some(x) => x | _ => 3 }", "3")
}

#[test]
fn map_by_constructor() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string(
        "2.to(4).mapBy(i => 2 * i)",
        "Map(Tup(2, 4), Tup(3, 6), Tup(4, 8))",
    )?;
    assert_from_string(
        "Set(2.to(4)).mapBy(s => s.size())",
        "Map(Tup(Set(2, 3, 4), 3))",
    )
}

#[test]
fn set_to_map_constructor() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string(
        "setToMap(Set((3, 6), (4, 10 - 2), (5, 10)))",
        "Map(Tup(3, 6), Tup(4, 8), Tup(5, 10))",
    )
}

#[test]
fn map_constructor() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string(
        "Map(3 -> 6, 4 -> 10 - 2, 5 -> 10)",
        "Map(Tup(3, 6), Tup(4, 8), Tup(5, 10))",
    )
}

#[test]
fn map_get() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("3.to(5).mapBy(i => 2 * i).get(4)", "8")?;
    assert_from_string("Set(2.to(4)).mapBy(s => s.size()).get(Set(2, 3, 4))", "3")
}

#[test]
fn map_update() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string(
        "3.to(5).mapBy(i => 2 * i).set(4, 20)",
        "Map(Tup(3, 6), Tup(4, 20), Tup(5, 10))",
    )?;
    assert_from_string("3.to(5).mapBy(i => 2 * i).set(7, 20)", "undefined")
}

#[test]
fn map_set_by() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string(
        "3.to(5).mapBy(i => 2 * i).setBy(4, old => old + 1)",
        "Map(Tup(3, 6), Tup(4, 9), Tup(5, 10))",
    )?;
    assert_from_string(
        "3.to(5).mapBy(i => 2 * i).setBy(7, old => old + 1)",
        "undefined",
    )
}

#[test]
fn map_put() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string(
        "3.to(5).mapBy(i => 2 * i).put(10, 11)",
        "Map(Tup(3, 6), Tup(4, 8), Tup(5, 10), Tup(10, 11))",
    )
}

#[test]
fn map_keys() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("Set(3, 5, 7).mapBy(i => 2 * i).keys()", "Set(3, 5, 7)")
}

#[test]
fn map_equality() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string(
        "3.to(5).mapBy(i => 2 * i) == 3.to(5).mapBy(i => 3 * i - i)",
        "true",
    )?;
    assert_from_string(
        "3.to(5).mapBy(i => 2 * i) == 3.to(6).mapBy(i => 2 * i)",
        "false",
    )
}

#[test]
fn set_of_maps() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("2.to(3).setOfMaps(5.to(6))",
        "Set(Map(Tup(2, 5), Tup(3, 5)), Map(Tup(2, 6), Tup(3, 5)), Map(Tup(2, 5), Tup(3, 6)), Map(Tup(2, 6), Tup(3, 6)))"
    )?;

    assert_from_string("2.to(3).setOfMaps(5.to(6)) == Set(Map(2 -> 5, 3 -> 5), Map(2 -> 6, 3 -> 5), Map(2 -> 5, 3 -> 6), Map(2 -> 6, 3 -> 6))",
        "true"
    )?;

    assert_from_string("Set().setOfMaps(Set(3, 5))", "Set(Map())")?;
    assert_from_string("Set().setOfMaps(Set())", "Set(Map())")?;
    assert_from_string("Set(1, 2).setOfMaps(Set())", "Set()")?;

    assert_from_string(
        "Set(2).setOfMaps(5.to(6))",
        "Set(Map(Tup(2, 5)), Map(Tup(2, 6)))",
    )?;
    assert_from_string(
        "2.to(3).setOfMaps(Set(5))",
        "Set(Map(Tup(2, 5), Tup(3, 5)))",
    )?;
    assert_from_string("2.to(4).setOfMaps(5.to(8)).size()", "64")?;
    assert_from_string(
        "2.to(4).setOfMaps(5.to(7)).subseteq(2.to(4).setOfMaps(4.to(8)))",
        "true",
    )?;
    assert_from_string(
        "2.to(4).setOfMaps(5.to(10)).subseteq(2.to(4).setOfMaps(4.to(8)))",
        "false",
    )?;
    assert_from_string(
        "2.to(3).setOfMaps(5.to(6)).contains(Map(2 -> 5, 3 -> 5))",
        "true",
    )?;
    assert_from_string(
        "2.to(3).setOfMaps(5.to(6)) == 2.to(4 - 1).setOfMaps(5.to(7 - 1))",
        "true",
    )
}

#[test]
fn run_then_success() -> Result<(), Box<dyn std::error::Error>> {
    assert_var_after_run(
        "n",
        "12",
        "run1",
        "var n: int\n
         run run1 = (n' = 1).then(n' = n + 2).then(n' = n * 4)",
    )
}

#[test]
fn run_then_failure_when_rhs_is_unreachable() -> Result<(), Box<dyn std::error::Error>> {
    let input = "var n: int\n
                 run run1 = (n' = 1).then(all { n == 0, n' = n + 2 }).then(n' = 3)";
    let result = eval_run("run1", input);

    assert!(result.is_err());
    let err = result.unwrap_err();
    assert_eq!(
        err.to_string(),
        "[QNT513] Cannot continue in A.then(B), A evaluates to 'false'"
    );
    assert!(err.reference.is_some());

    Ok(())
}

#[test]
fn run_then_false_when_rhs_is_false() -> Result<(), Box<dyn std::error::Error>> {
    let input = "var n: int\n
                 run run1 = (n' = 1).then(all { n == 0, n' = n + 2 })";
    let result = eval_run("run1", input);

    assert!(result.is_ok());
    assert_eq!(result.unwrap(), Value::Bool(false));

    Ok(())
}

#[test]
fn run_reps() -> Result<(), Box<dyn std::error::Error>> {
    let input = "var n: int\n
                 var hist: List[int]\n
                 run run1 = (all { n' = 1, hist' = [] })\n
                            .then(3.reps(_ => all { n' = n + 1, hist' = hist.append(n) }))\n
                 run run2 = (all { n' = 1, hist' = [] })\n
                            .then(3.reps(i => all { n' = i, hist' = hist.append(i) }))";
    assert_var_after_run("hist", "List(1, 2, 3)", "run1", input)?;
    assert_var_after_run("hist", "List(0, 1, 2)", "run2", input)
}

#[test]
fn run_reps_false_when_action_is_false() -> Result<(), Box<dyn std::error::Error>> {
    let input = "var n: int\n
                 run run1 = (n' = 0).then(10.reps(i => all { n < 5, n' = n + 1 }))";
    let result = eval_run("run1", input);

    assert!(result.is_err());
    let err = result.unwrap_err();
    assert_eq!(
        err.to_string(),
        "[QNT513] Reps loop could not continue after iteration #6 evaluated to false"
    );
    assert!(err.reference.is_some());

    Ok(())
}

#[test]
fn run_fail() -> Result<(), Box<dyn std::error::Error>> {
    let input = "var n: int\n
                 run run1 = (n' = 1).fail()";
    let result = eval_run("run1", input);

    assert_eq!(result, Ok(Value::Bool(false)));

    Ok(())
}

#[test]
fn run_assert() -> Result<(), Box<dyn std::error::Error>> {
    let input = "var n: int\n
                 run run1 = (n' = 3).then(all { assert(n < 3), n' = n })";
    let result = eval_run("run1", input);

    assert!(result.is_err());
    assert_eq!(result.unwrap_err().to_string(), "[QNT508] Assertion failed");

    Ok(())
}

#[test]
fn run_expect_failure() -> Result<(), Box<dyn std::error::Error>> {
    let input = "var n: int\n
                 run run1 = (n' = 0).then(n' = 3).expect(n < 3)";
    let result = eval_run("run1", input);

    assert!(result.is_err());
    let err = result.unwrap_err();
    assert_eq!(
        err.to_string(),
        "[QNT508] Expect condition does not hold true"
    );
    assert!(err.reference.is_some());

    Ok(())
}

#[test]
fn run_expect_success() -> Result<(), Box<dyn std::error::Error>> {
    assert_var_after_run(
        "n",
        "3",
        "run1",
        "var n: int\n
         run run1 = (n' = 0).then(n' = 3).expect(n == 3)",
    )
}

#[test]
fn run_expect_failure_when_lhs_is_false() -> Result<(), Box<dyn std::error::Error>> {
    let input = "var n: int\n
                 run run1 = (n' = 0).then(all { n == 1, n' = 3 }).expect(n < 3)";
    let result = eval_run("run1", input);

    assert!(result.is_err());
    let err = result.unwrap_err();
    assert_eq!(err.to_string(), "[QNT508] Cannot continue to \"expect\"");
    assert!(err.reference.is_some());

    Ok(())
}

#[test]
fn run_expect_and_then_expect_failure() -> Result<(), Box<dyn std::error::Error>> {
    let input = "var n: int\n
                 run run1 = (n' = 0).then(n' = 3).expect(n == 3).then(n' = 4).expect(n == 3)";
    let result = eval_run("run1", input);

    assert!(result.is_err());
    let err = result.unwrap_err();
    assert_eq!(
        err.to_string(),
        "[QNT508] Expect condition does not hold true"
    );
    assert!(err.reference.is_some());

    Ok(())
}

#[test]
fn run_q_debug() -> Result<(), Box<dyn std::error::Error>> {
    assert_var_after_run(
        "n",
        "2",
        "run1",
        "var n: int\n
         run run1 = (n' = 1).then(n' = q::debug(\"n plus one\", n + 1))",
    )
}
