use std::fs::{self, File};
use std::io::{self, Read, Write};
use std::path::PathBuf;
use std::time::Instant;

use argh::FromArgs;
use eyre::bail;
use quint_simulator::ir::{QuintError, QuintEx, QuintOutput};
use quint_simulator::{helpers, log};
use serde::{Deserialize, Serialize};

#[derive(FromArgs)]
#[argh(description = "Quint simulator")]
struct TopLevel {
    #[argh(subcommand)]
    command: Command,
}

#[derive(FromArgs)]
#[argh(subcommand)]
enum Command {
    Run(RunArgs),
    SimulateQuint(SimulateQuintArgs),
}

/// Run simulation with command-line arguments
#[derive(FromArgs)]
#[argh(subcommand, name = "run")]
struct RunArgs {
    /// the file to read
    #[argh(positional)]
    file: PathBuf,

    /// name of the initializer action (default: "init")
    #[argh(option, default = "\"init\".to_string()")]
    init: String,

    /// name of the step action (default: "step")
    #[argh(option, default = "\"step\".to_string()")]
    step: String,

    /// name of the invariant to check
    #[argh(option)]
    inv: Option<String>,

    /// name of the main module to check (default: computed from filename)
    #[argh(option)]
    main: Option<String>,

    /// the maximum on the number of steps in every trace (default: 10)
    #[argh(option, default = "10")]
    max_steps: usize,

    /// the maximum number of runs to attempt before giving up (default: 10_000)
    #[argh(option, default = "10000")]
    max_samples: usize,

    /// how many traces to generate (only affects output to out-itf) (default: 1)
    #[argh(option, default = "1")]
    n_traces: usize,

    /// enable JSON output
    #[argh(switch)]
    json: bool,
}

/// Run simulation with input from STDIN
#[derive(FromArgs)]
#[argh(subcommand, name = "simulate-quint")]
struct SimulateQuintArgs {
    /// enable JSON output
    #[argh(switch)]
    json: bool,
}

#[derive(Serialize, Deserialize)]
struct SimulateInput {
    parsed: QuintOutput,
    source: String,
    init: QuintEx,
    step: QuintEx,
    inv: Option<QuintEx>,
    witnesses: Vec<QuintEx>,
    nruns: usize,
    nsteps: usize,
    ntraces: usize,
}

#[derive(Serialize)]
#[serde(rename_all = "lowercase")]
enum SimulationStatus {
    #[serde(rename = "ok")]
    Success,
    Violation,
    Error,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Outcome {
    status: SimulationStatus,
    errors: Vec<QuintError>,
    best_traces: Vec<SimulationTrace>,
    witnessing_traces: Vec<usize>,
    samples: usize,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SimulationTrace {
    seed: usize,
    states: itf::Trace<itf::Value>,
    result: bool,
}

fn main() -> eyre::Result<()> {
    let top_level: TopLevel = argh::from_env();

    match top_level.command {
        Command::Run(args) => run_simulation(args),
        Command::SimulateQuint(args) => simulate_from_stdin(args),
    }
}

fn run_simulation(args: RunArgs) -> eyre::Result<()> {
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
        args.main.as_deref(),
    )
    .unwrap();

    let init_def = parsed.find_definition_by_name("q::init").unwrap();
    let step_def = parsed.find_definition_by_name("q::step").unwrap();
    let invariant_def = parsed.find_definition_by_name("q::inv").unwrap();

    let start = Instant::now();
    log!("Simulation", "Starting simulation");
    let result = parsed.simulate(
        &init_def.expr,
        &step_def.expr,
        &invariant_def.expr,
        args.max_steps,
        args.max_samples,
        args.n_traces,
    );

    let elapsed = start.elapsed();

    match result {
        Ok(result) => {
            log!("Result", "{}", result.result);
            for (i, trace) in result.best_traces.into_iter().enumerate() {
                let itf_trace = trace.to_itf(args.file.display().to_string());
                let json_data = serde_json::to_string(&itf_trace)?;
                let filename = format!("out_{i}.itf.json");
                let mut file = File::create(filename.clone())?;
                file.write_all(json_data.as_bytes())?;
                log!("Trace", "{filename}")
            }
        }
        Err(e) => log!("Error", "Simulation failed: {e}"),
    }

    log!("Elapsed", "{elapsed:.2?}");
    Ok(())
}

fn simulate_from_stdin(args: SimulateQuintArgs) -> eyre::Result<()> {
    log::set_json(args.json);

    // Read all input from STDIN
    let mut input = String::new();
    io::stdin().read_to_string(&mut input)?;

    let input: SimulateInput = serde_json::from_str(&input)?;

    let parsed = input.parsed;

    let result = parsed.simulate(
        &input.init,
        &input.step,
        &input
            .inv
            .unwrap_or(QuintEx::QuintBool { id: 0, value: true }),
        input.nsteps,
        input.nruns,
        input.ntraces,
    );

    let outcome = Outcome {
        status: match result {
            Ok(ref r) if r.result => SimulationStatus::Success,
            Ok(_) => SimulationStatus::Violation,
            Err(_) => SimulationStatus::Error,
        },
        errors: result
            .as_ref()
            .err()
            .map(|e| vec![e.clone()])
            .unwrap_or_default(),
        best_traces: result
            .as_ref()
            .ok()
            .map(|r| {
                r.best_traces
                    .iter()
                    .cloned()
                    .map(|t| SimulationTrace {
                        seed: 0,
                        states: t.clone().to_itf(input.source.clone()),
                        result: !t.violation,
                    })
                    .collect()
            })
            .unwrap_or_default(),
        witnessing_traces: vec![],
        samples: 0,
    };

    println!("{}", serde_json::to_string(&outcome)?);

    Ok(())
}
