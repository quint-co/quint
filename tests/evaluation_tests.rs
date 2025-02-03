use quint_simulator::{
    evaluator::run,
    ir::{QuintDef, QuintOutput},
    value::Value,
};
use std::fs::File;

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

#[test]
fn from_quint() -> Result<(), Box<dyn std::error::Error>> {
    use std::{env, process::Command};

    let quint_content = "module main { val init = true val step = true }";

    let root = env::temp_dir().join("quint-simulator");
    std::fs::create_dir_all(&root).unwrap();
    std::fs::write(root.join("in.qnt"), quint_content).unwrap();
    let path = format!(
        "{}:{}",
        root.join("bin").display(),
        env::var("PATH").unwrap_or_else(|_| "".into())
    );

    let output = Command::new("quint")
        .arg("compile")
        .arg("in.qnt")
        .current_dir(&root)
        .env("PATH", path)
        .stdout(std::process::Stdio::piped())
        .output()
        .unwrap();

    let serialized_quint = String::from_utf8(output.stdout).unwrap();

    let parsed: QuintOutput = serde_json::from_str(serialized_quint.as_str()).unwrap();

    // Evaluate the expression inside the second declaration
    if let QuintDef::QuintOpDef(def) = &parsed.modules[0].declarations[1] {
        let value = run(&parsed.table, &def.expr).unwrap();
        assert_eq!(value, Value::Bool(true));
    };

    Ok(())
}
