use criterion::{criterion_group, criterion_main, Criterion};
use quint_simulator::{
    evaluator::run,
    ir::{QuintDef, QuintOutput},
};
use std::io::Write;
use std::process::Command;
use std::process::Stdio;
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

    // Evaluate the expression inside the second declaration
    let def = parsed.modules[0]
        .declarations
        .iter()
        .find_map(|d| {
            if let QuintDef::QuintOpDef(def) = d {
                if def.name == "input" {
                    Some(def)
                } else {
                    None
                }
            } else {
                None
            }
        })
        .unwrap();

    let value = run(&parsed.table, &def.expr);
    match value {
        Ok(v) => assert!(v.to_string().contains("Set")),
        Err(_) => assert!(false),
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

    let echo_cmd = Command::new("echo")
        .arg("input")
        .stdout(Stdio::piped())
        .spawn()
        .unwrap();

    let quint = Command::new("quint")
        .arg("-r")
        .arg(format!("{}::{}", file.path().display(), "main"))
        .stdin(Stdio::from(echo_cmd.stdout.unwrap()))
        .stdout(Stdio::piped())
        .spawn()
        .unwrap();

    let output = quint.wait_with_output().unwrap();
    let result = std::str::from_utf8(&output.stdout).unwrap();
    assert!(result.contains("Set"));

    Ok(())
}

pub fn criterion_benchmark(c: &mut Criterion) {
    let mut group = c.benchmark_group("tuples");
    group.sample_size(10);
    let tuples_expression = "tuples(1.to(100), 1.to(100), 1.to(100)).map(((a, b, c)) => a + b)";
    group.bench_function("rust", |b| b.iter(|| run_in_rust(tuples_expression)));
    group.bench_function("typescript", |b| {
        b.iter(|| run_in_quint_repl(tuples_expression))
    });
    group.finish();
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
