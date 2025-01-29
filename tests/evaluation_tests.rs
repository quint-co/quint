use quint_simulator::{
    evaluator::run,
    ir::{QuintDef, QuintOutput},
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
