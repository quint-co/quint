use quint_simulator::{
    evaluator::run,
    ir::{QuintDef, QuintOutput},
};
use std::fs::File;

fn main() {
    let file = File::open("fixtures/simple.json").unwrap();
    let parsed: QuintOutput = serde_json::from_reader(file).unwrap();
    println!("{:?}", parsed);

    if let QuintDef::QuintOpDef(def) = &parsed.modules[0].declarations[1] {
        let value = run(&parsed.table, &def.expr);
        match value {
            Ok(value) => println!("{:#}", value),
            Err(err) => println!("Error: {:#?}", err),
        }
    };
}
