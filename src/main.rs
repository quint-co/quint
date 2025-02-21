use std::fs;
use std::path::PathBuf;
use std::time::Instant;

use argh::FromArgs;
use eyre::bail;
use quint_simulator::helpers;

#[derive(FromArgs)]
#[argh(description = "Quint simulator")]
struct Args {
    /// the file to read
    #[argh(positional)]
    file: PathBuf,

    /// name of the initializer action (default: "init")
    #[argh(option, default = "\"init\".to_string()")]
    init: String,

    /// name of the step action (default: "step")
    #[argh(option, default = "\"step\".to_string()")]
    step: String,

    /// name of the invariant to check (default: "inv")
    #[argh(option, default = "\"inv\".to_string()")]
    inv: String,

    /// the maximum on the number of steps in every trace (default: 10)
    #[argh(option, default = "10")]
    max_steps: usize,

    /// the maximum number of runs to attempt before giving up (default: 10_000)
    #[argh(option, default = "10000")]
    max_samples: usize,
}

fn main() -> eyre::Result<()> {
    let args: Args = argh::from_env();

    if !fs::exists(&args.file)? {
        bail!("File not found: {}", args.file.display());
    }

    println!("Parsing file: {}", args.file.display());
    let parsed = helpers::parse_from_path(&args.file).unwrap();

    let start = Instant::now();

    println!("Starting simulation");
    let result = parsed.simulate(
        &args.init,
        &args.step,
        &args.inv,
        args.max_steps,
        args.max_samples,
    );

    let elapsed = start.elapsed();

    match result {
        Ok(result) => println!("Result: {}", result.result),
        Err(e) => println!("Simulation failed: {e}"),
    }

    println!("Elapsed: {elapsed:.2?}");

    Ok(())
}
