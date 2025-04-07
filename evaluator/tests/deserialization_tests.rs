use quint_evaluator::ir::QuintOutput;
use std::{env, fs::File};

#[test]
fn simple() {
    let file = File::open("fixtures/simple.json").unwrap();
    let parsed: QuintOutput = serde_json::from_reader(file).unwrap();
    insta::assert_yaml_snapshot!(parsed);
}

#[test]
fn tictactoe() {
    let file = File::open("fixtures/tictactoe.json").unwrap();
    let parsed: QuintOutput = serde_json::from_reader(file).unwrap();
    insta::assert_yaml_snapshot!(parsed);
}

#[test]
fn ewd840() {
    let file = File::open("fixtures/ewd840.json").unwrap();
    let parsed: QuintOutput = serde_json::from_reader(file).unwrap();
    insta::assert_yaml_snapshot!(parsed);
}

#[test]
fn ewd426() {
    let file = File::open("fixtures/ewd426.json").unwrap();
    let parsed: QuintOutput = serde_json::from_reader(file).unwrap();
    insta::assert_yaml_snapshot!(parsed);
}

#[test]
fn jmt() {
    let file = File::open("fixtures/jmt.json").unwrap();
    let parsed: QuintOutput = serde_json::from_reader(file).unwrap();
    insta::assert_yaml_snapshot!(parsed);
}
