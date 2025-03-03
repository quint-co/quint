use std::fs;
use std::path::PathBuf;
use std::time::Instant;

use argh::FromArgs;
use eyre::bail;
use quint_simulator::{helpers, log};

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
    #[argh(option)]
    inv: Option<String>,

    /// the maximum on the number of steps in every trace (default: 10)
    #[argh(option, default = "10")]
    max_steps: usize,

    /// the maximum number of runs to attempt before giving up (default: 10_000)
    #[argh(option, default = "10000")]
    max_samples: usize,

    /// enable JSON output
    #[argh(switch)]
    json: bool,
}

fn main() -> eyre::Result<()> {
    let args: Args = argh::from_env();
    log::set_json(args.json);

    if !fs::exists(&args.file)? {
        bail!("File not found: {}", args.file.display());
    }

    log!("Parsing", "Parsing file: {}", args.file.display());
    let parsed = helpers::parse_from_path(
        &args.file,
        args.init.as_str(),
        args.step.as_str(),
        args.inv.as_deref(),
    )
    .unwrap();
    let start = Instant::now();

    log!("Simulation", "Starting simulation");
    let result = parsed.simulate(
        "q::init",
        "q::step",
        "q::inv",
        args.max_steps,
        args.max_samples,
    );

    let elapsed = start.elapsed();

    match result {
        Ok(result) => log!("Result", "{}", result.result),
        Err(e) => log!("", "Simulation failed: {e}"),
    }

    log!("Elapsed", "{elapsed:.2?}");

    Ok(())
}
