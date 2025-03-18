use std::path::Path;

use criterion::{black_box, criterion_group, criterion_main, Criterion};
use quint_simulator::evaluator::{Env, Interpreter};
use quint_simulator::helpers;
use quint_simulator::ir::QuintOutput;

fn simulate(
    output: &QuintOutput,
    init_name: &str,
    step_name: &str,
    invariant_name: &str,
    steps: usize,
    samples: usize,
) -> Result<(), Box<dyn std::error::Error>> {
    let init_def = output.find_definition_by_name(init_name)?;
    let step_def = output.find_definition_by_name(step_name)?;
    let invariant_def = output.find_definition_by_name(invariant_name)?;

    let mut interpreter = Interpreter::new(&output.table);
    let mut env = Env::with_rand_state(interpreter.var_storage.clone(), 0x42);

    let init = interpreter.compile(&init_def.expr);
    let step = interpreter.compile(&step_def.expr);
    let invariant = interpreter.compile(&invariant_def.expr);

    for _ in 1..=samples {
        init.execute(&mut env)?;

        for _ in 1..=steps {
            interpreter.shift();
            invariant.execute(&mut env)?;
            step.execute(&mut env)?;
        }
    }

    Ok(())
}

fn run(
    parsed: &QuintOutput,
    init: &str,
    step: &str,
    inv: &str,
    steps: usize,
) -> Result<(), Box<dyn std::error::Error>> {
    let result = simulate(parsed, init, step, inv, steps, 1);

    match result {
        Ok(()) => Ok(()),
        Err(e) => panic!("Error in simulation: {e}"),
    }
}

pub fn criterion_benchmark(c: &mut Criterion) {
    let mut group = c.benchmark_group("evaluator");

    {
        let path = Path::new("fixtures/tictactoe.qnt");
        let parsed = helpers::parse_from_path(path, "init", "step", Some("inv"), None).unwrap();
        group.bench_function("tictactoe", |b| {
            b.iter(|| run(black_box(&parsed), "init", "step", "inv", 10).unwrap())
        });
    }

    {
        let path = Path::new("fixtures/jmt/apply_state_machine.qnt");
        let parsed =
            helpers::parse_from_path(path, "init", "step_fancy", Some("allInvariants"), None)
                .unwrap();
        group.bench_function("JMT", |b| {
            b.iter(|| run(black_box(&parsed), "init", "step_fancy", "allInvariants", 3).unwrap())
        });
    }

    group.finish();
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
