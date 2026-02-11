use std::path::Path;
use std::process::Command;
use std::process::Stdio;
use std::time::Duration;

use criterion::{criterion_group, criterion_main, Criterion};
use quint_evaluator::helpers;
use quint_evaluator::progress;
use quint_evaluator::Verbosity;

fn run_in_rust(file_path: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let parsed = helpers::parse_from_path(file_path, "init", "step", Some("inv"), None)?;

    let result = parsed.simulate(
        10,
        1_000,
        0,
        progress::no_report(),
        None,
        false,
        Verbosity::default(),
    );

    match result {
        Ok(r) => assert!(r.result),
        Err(e) => panic!("Error in simulation: {e}"),
    }

    Ok(())
}

fn run_in_quint(file_path: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let quint = Command::new("quint")
        .arg("run")
        .arg(file_path)
        .args(["--max-samples", "1000"])
        .args(["--max-steps", "10"])
        .args(["--invariant", "inv"])
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
    group.measurement_time(Duration::from_secs(60));
    group.warm_up_time(Duration::from_secs(10));

    let path = Path::new("fixtures/tictactoe.qnt");
    group.bench_function("rust", |b| b.iter(|| run_in_rust(path)));
    group.bench_function("typescript", |b| b.iter(|| run_in_quint(path)));
    group.finish();
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
