use serde::{Deserialize, Serialize};
use std::fs::File;

#[derive(Serialize, Deserialize, Debug)]
struct QuintModule {}

fn main() {
    let file = File::open("fixtures/simple.json").unwrap();
    let parsed: QuintModule = serde_json::from_reader(file).unwrap();
    println!("{:?}", parsed);
}
