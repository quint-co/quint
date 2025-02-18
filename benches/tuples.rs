use std::process::Command;
use std::process::Stdio;
use std::{io::Write, time::Duration};

use criterion::{criterion_group, criterion_main, Criterion};
use quint_simulator::{evaluator::run, ir::QuintOutput};
use tempfile::NamedTempFile;

fn run_in_rust(input: &str) -> Result<(), Box<dyn std::error::Error>> {
    let quint_content = format!(
        "module main {{
          val input = {input}
          val init = true
          val step = true
        }}"
    );

    // A unique filename so multiple tests can run in parallel
    let mut file = NamedTempFile::new()?;

    file.write_all(quint_content.as_bytes())?;

    let output = Command::new("quint")
        .arg("compile")
        .arg(file.path())
        .stdout(std::process::Stdio::piped())
        .output()
        .unwrap();

    let serialized_quint = String::from_utf8(output.stdout).unwrap();

    let parsed: QuintOutput = serde_json::from_str(serialized_quint.as_str()).unwrap();

    let def = parsed.find_definition_by_name("input").unwrap();

    let value = run(&parsed.table, &def.expr);
    match value {
        Ok(v) => assert!(v.to_string().contains("Set")),
        Err(e) => panic!("Error in simulation: {e}"),
    };

    Ok(())
}

fn run_in_quint_repl(input: &str) -> Result<(), Box<dyn std::error::Error>> {
    let quint_content = format!(
        "module main {{
          val input = {input}
          val init = true
          val step = true
        }}"
    );

    // A unique filename so multiple tests can run in parallel
    let mut file = NamedTempFile::new()?;
    file.write_all(quint_content.as_bytes())?;

    let mut quint = Command::new("quint")
        .arg("-r")
        .arg(format!("{}::{}", file.path().display(), "main"))
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .unwrap();

    {
        let mut stdin = quint.stdin.take().unwrap();
        stdin.write_all(b"input").unwrap();
    }

    let output = quint.wait_with_output().unwrap();
    let result = std::str::from_utf8(&output.stdout).unwrap();
    assert!(result.contains("Set"));

    Ok(())
}

pub fn criterion_benchmark(c: &mut Criterion) {
    let mut group = c.benchmark_group("tuples");
    group.sample_size(10);
    group.warm_up_time(Duration::from_secs(10));
    group.measurement_time(Duration::from_secs(10));

    let tuples_expression = "tuples(1.to(100), 1.to(100), 1.to(100)).map(((a, b, c)) => a + b)";
    group.bench_function("rust", |b| b.iter(|| run_in_rust(tuples_expression)));
    group.bench_function("typescript", |b| {
        b.iter(|| run_in_quint_repl(tuples_expression))
    });
    group.finish();
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
