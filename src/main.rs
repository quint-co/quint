use quint_simulator::ir::QuintOutput;
use std::fs::File;

fn main() {
    let file = File::open("fixtures/simple.json").unwrap();
    let parsed: QuintOutput = serde_json::from_reader(file).unwrap();
    println!("{:?}", parsed);
}
