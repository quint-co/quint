use quint_simulator::{
    evaluator::run,
    ir::{QuintDef, QuintOutput},
};
use std::io::Write;
use std::process::Command;
use tempfile::NamedTempFile;

fn assert_from_string(input: &str, expected: &str) -> Result<(), Box<dyn std::error::Error>> {
    let quint_content = format!(
        "module main {{
          val input = {input}
          val init = true
          val step = true
        }}"
    );

    // A unique filename so multiple tests can run in parallel
    let mut file = NamedTempFile::new()?;

    file.write_all(quint_content.as_bytes())?;

    let output = Command::new("quint")
        .arg("compile")
        .arg(file.path())
        .stdout(std::process::Stdio::piped())
        .output()
        .unwrap();

    let serialized_quint = String::from_utf8(output.stdout).unwrap();

    let parsed: QuintOutput = serde_json::from_str(serialized_quint.as_str()).unwrap();

    // Evaluate the expression inside the second declaration
    let def = parsed.modules[0]
        .declarations
        .iter()
        .find_map(|d| {
            if let QuintDef::QuintOpDef(def) = d {
                if def.name == "input" {
                    Some(def)
                } else {
                    None
                }
            } else {
                None
            }
        })
        .unwrap();

    let value = run(&parsed.table, &def.expr);
    match value {
        Ok(v) => assert_eq!(v.to_string(), expected),
        Err(_) => assert_eq!(expected, "undefined"),
    };

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

// Booleans
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

#[ignore]
#[test]
fn and() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("false and false", "false")?;
    assert_from_string("false and true", "false")?;
    assert_from_string("true and false", "false")?;
    assert_from_string("true and true", "true")?;
    assert_from_string("and(true, true, false)", "false")?;
    assert_from_string("and(true, true, true)", "true")
}

#[ignore]
#[test]
fn and_short_circuit() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("false and (1/0 == 0)", "false")?;
    assert_from_string("true and (1/0 == 0)", "undefined")
}

#[ignore]
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

#[ignore]
#[test]
fn or_short_circuit() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("false or (1/0 == 0)", "undefined")?;
    assert_from_string("true or (1/0 == 0)", "true")
}

#[ignore]
#[test]
fn implies() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("false implies false", "true")?;
    assert_from_string("false implies true", "true")?;
    assert_from_string("true implies false", "false")?;
    assert_from_string("true implies true", "true")
}

#[ignore]
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

#[ignore]
#[test]
fn if_then_else() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string("if (false) false else true", "true")?;
    assert_from_string("if (true) false else true", "false")?;
    assert_from_string("if (3 > 5) 1 else 2", "2")?;
    assert_from_string("if (5 > 3) 1 else 2", "1")
}

#[ignore]
#[test]
fn value_definitions() -> Result<(), Box<dyn std::error::Error>> {
    let input = "val x = 3 + 4
       val y = 2 * x
       y - x";
    assert_from_string(input, "7")
}

#[ignore]
#[test]
fn multi_arg_definitions() -> Result<(), Box<dyn std::error::Error>> {
    let input = "def mult(x, y) = (x * y)
       mult(2, mult(3, 4))";
    assert_from_string(input, "24")
}

#[ignore]
#[test]
fn named_def_used_instead_of_lambda() -> Result<(), Box<dyn std::error::Error>> {
    let input = "def positive(x) = x > 0
       (-3).to(3).filter(positive)";
    assert_from_string(input, "Set(1, 2, 3)")
}

#[ignore]
#[test]
fn higher_order_operators_with_lambda() -> Result<(), Box<dyn std::error::Error>> {
    let input = "def ho(lo, n) = lo(n)
       ho(x => x * 2, 3)";
    assert_from_string(input, "6")
}

#[ignore]
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

#[ignore]
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

#[ignore]
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

#[ignore]
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

#[ignore]
#[test]
fn set_filter_with_tuples() -> Result<(), Box<dyn std::error::Error>> {
    assert_from_string(
        "tuples(1.to(5), 2.to(3)).filter(((x, y)) => x < y)",
        "Set((1, 2), (1, 3), (2, 3)",
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
    assert_from_string("Set().fold(Set(), (a, s) => a.union(s))", "Set()")
    // product by using a definition
    //
    // TODO: let in
    // let input = "def prod(x, y) = x * y;
    //    2.to(4).fold(1, prod)";
    // assert_from_string(input, "24")
}

// TODO powerset tests
// TODO builtin values tests
// TODO tuple tests
// TODO list tests

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

// TODO variants/match tests
// TODO Map tests
// TODO Runs and special ops tests
