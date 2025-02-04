use quint_simulator::{
    evaluator::run,
    ir::{QuintDef, QuintOutput},
    value::Value,
};
use std::fs::File;
use std::io::Write;
use std::process::Command;
use tempfile::NamedTempFile;

#[test]
fn simple() -> Result<(), Box<dyn std::error::Error>> {
    let file = File::open("fixtures/simple.json").unwrap();
    let parsed: QuintOutput = serde_json::from_reader(file).unwrap();

    // Evaluate the expression inside the second declaration
    if let QuintDef::QuintOpDef(def) = &parsed.modules[0].declarations[1] {
        let value = run(&parsed.table, &def.expr).unwrap();
        assert_eq!(value.to_string(), "2");
    };

    Ok(())
}

#[test]
fn ints_and_sets() -> Result<(), Box<dyn std::error::Error>> {
    let file = File::open("fixtures/ints_and_sets.json").unwrap();
    let parsed: QuintOutput = serde_json::from_reader(file).unwrap();

    // Evaluate the expression inside the second declaration
    if let QuintDef::QuintOpDef(def) = &parsed.modules[0].declarations[3] {
        let value = run(&parsed.table, &def.expr).unwrap();
        assert_eq!(
            value,
            Value::Set(vec![4, 6, 7, 8].into_iter().map(Value::Int).collect())
        );
    };

    Ok(())
}
#[test]
fn sets() -> Result<(), Box<dyn std::error::Error>> {
    let file = File::open("fixtures/sets.json").unwrap();
    let parsed: QuintOutput = serde_json::from_reader(file).unwrap();

    // Evaluate the expression inside the second declaration
    if let QuintDef::QuintOpDef(def) = &parsed.modules[0].declarations[6] {
        let value = run(&parsed.table, &def.expr).unwrap();
        assert_eq!(value, Value::Bool(true));
    };

    Ok(())
}

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

    println!("{:?}", def);
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
