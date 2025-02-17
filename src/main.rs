use quint_simulator::helpers;
use std::{env, path::Path};

fn main() {
    let args: Vec<String> = env::args().collect();

    let file_path: &Path = Path::new(&args[1]);

    println!("Parsing file: {:?}", file_path);
    let parsed = helpers::parse_from_path(file_path).unwrap();
    println!("Starting simulation");
    let result = parsed.simulate("init", "step", "inv", 10, 10_000);
    println!("{:?}", result)
}
