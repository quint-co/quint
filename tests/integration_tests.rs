use quint_simulator::ir::QuintOutput;
use std::{env, fs::File};

#[test]
fn simple() {
    let file = File::open("fixtures/simple.json").unwrap();
    let parsed: QuintOutput = serde_json::from_reader(file).unwrap();
    insta::assert_yaml_snapshot!(parsed);
}
