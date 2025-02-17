use criterion::{criterion_group, criterion_main, Criterion};
use quint_simulator::ir::QuintOutput;
use std::fs::File;
use std::io::Read;
use std::process::Command;
use std::{path::Path, process::Stdio};

fn run_in_rust(file_path: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let dir = tempfile::tempdir()?;
    let file_name = dir.path().join("tictactoe.json");
    let file = File::create(file_name.clone()).expect("failed to open file");

    // Spawn the command and redirect stdout to the temporary file
    // We can't read the output directly because it's too big
    let mut child = Command::new("quint")
        .arg("compile")
        .arg(file_path)
        .stdout(file)
        .spawn()?;

    child.wait()?;

    // Read the output from the temporary file
    let mut serialized_quint = String::new();
    let mut file = File::open(file_name)?;
    file.read_to_string(&mut serialized_quint)?;

    let jd = &mut serde_json::Deserializer::from_str(serialized_quint.as_str());
    let parsed: QuintOutput = serde_path_to_error::deserialize(jd).unwrap();

    let result = parsed.simulate("init", "step", "inv", 10, 10_000);

    match result {
        Ok(r) => assert_eq!(r.result, true),
        Err(_) => assert!(false),
    }

    Ok(())
}

fn run_in_quint(file_path: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let quint = Command::new("quint")
        .arg("run")
        .arg(file_path)
        .stdout(Stdio::piped())
        .spawn()
        .unwrap();

    let output = quint.wait_with_output().unwrap();
    let result = std::str::from_utf8(&output.stdout).unwrap();
    assert!(result.contains("No violation found"));

    Ok(())
}

pub fn criterion_benchmark(c: &mut Criterion) {
    let mut group = c.benchmark_group("tictactoe");
    group.sample_size(10);
    let path = Path::new("fixtures/tictactoe.qnt");
    group.bench_function("rust", |b| b.iter(|| run_in_rust(&path)));
    group.bench_function("typescript", |b| b.iter(|| run_in_quint(&path)));
    group.finish();
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
