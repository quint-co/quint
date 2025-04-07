use std::path::Path;

use criterion::{black_box, criterion_group, criterion_main, Criterion};
use quint_evaluator::evaluator::{Env, Interpreter};
use quint_evaluator::helpers;
use quint_evaluator::simulator::ParsedQuint;

fn simulate(
    parsed: &ParsedQuint,
    steps: usize,
    samples: usize,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut interpreter = Interpreter::new(&parsed.table);
    let mut env = Env::with_rand_state(interpreter.var_storage.clone(), 0x42);

    let init = interpreter.compile(&parsed.init);
    let step = interpreter.compile(&parsed.step);
    let invariant = interpreter.compile(&parsed.invariant);

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

fn run(parsed: &ParsedQuint, steps: usize) -> Result<(), Box<dyn std::error::Error>> {
    let result = simulate(parsed, steps, 1);

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
            b.iter(|| run(black_box(&parsed), 10).unwrap())
        });
    }

    {
        let path = Path::new("fixtures/jmt/apply_state_machine.qnt");
        let parsed =
            helpers::parse_from_path(path, "init", "step_fancy", Some("allInvariants"), None)
                .unwrap();
        group.bench_function("JMT", |b| b.iter(|| run(black_box(&parsed), 3).unwrap()));
    }

    group.finish();
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
