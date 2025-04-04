//! The CLI has two main commands:
//!  1. `run`: Runs the simulation on a file with specified parameters,
//!      to be used for development and tests.
//!  2. `simulate-from-stdin`: Reads input from standard input (STDIN) and
//!      simulates based on that input, used in the integration with the `quint` typescript tool.

use std::fs::{self, File};
use std::io::{self, Read, Write};
use std::path::PathBuf;
use std::time::Instant;

use argh::FromArgs;
use eyre::bail;
use quint_simulator::ir::{QuintError, QuintEx};
use quint_simulator::simulator::{ParsedQuint, SimulationResult};
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
    SimulateFromStdin(SimulateQuintArgs),
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
}

/// Run simulation with input from STDIN
#[derive(FromArgs)]
#[argh(subcommand, name = "simulate-from-stdin")]
struct SimulateQuintArgs {}

/// Data expected on STDIN for simulation
#[derive(Serialize, Deserialize)]
struct SimulateInput {
    parsed: ParsedQuint,
    source: String,
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

/// Data to be written to STDOUT after simulation
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

/// The CLI has two main commands: 1. `run`: Runs the simulation on a file with
/// specified parameters, to be used for development and tests. 2.
/// `simulate-from-stdin`: Reads input from standard input (STDIN) and simulates
/// based on that input, used in the integration with the `quint` typescript tool.
fn main() -> eyre::Result<()> {
    let top_level: TopLevel = argh::from_env();

    match top_level.command {
        Command::Run(args) => run_simulation(args),
        Command::SimulateFromStdin(_) => simulate_from_stdin(),
    }
}

/// Utility to run the simulation with command-line arguments. Not meant to be
/// user-facing, but quite useful for development and testing. This calls the
/// `quint` typescript binary to parse the provided file (expects `quint` to be
/// installed and in the PATH).
fn run_simulation(args: RunArgs) -> eyre::Result<()> {
    log::set_json(false);

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

    let start = Instant::now();
    log!("Simulation", "Starting simulation");
    let result = parsed.simulate(args.max_steps, args.max_samples, args.n_traces);

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

/// Reads input from standard input (STDIN), parses it, and performs a simulation based on the parsed input.
/// The result of the simulation is then printed in JSON format to standard output (STDOUT).
fn simulate_from_stdin() -> eyre::Result<()> {
    log::set_json(true);

    // Read all input from STDIN
    let mut input = String::new();
    io::stdin().read_to_string(&mut input)?;

    let input: SimulateInput = serde_json::from_str(&input)?;
    let parsed = input.parsed;

    let result = parsed.simulate(input.nsteps, input.nruns, input.ntraces);

    // Transform the SimulationResult into the Outcome format expected by Quint
    let outcome = to_outcome(input.source, result);

    // Serialize the outcome to JSON and print it to STDOUT
    println!("{}", serde_json::to_string(&outcome)?);

    Ok(())
}

/// Converts the result of a simulation into an `Outcome` struct.
///
/// The status is determined based on whether the simulation result indicates success, violation, or error.
/// Errors are collected into a vector if any are present.
/// Best traces are converted to the intermediate trace format (ITF).
fn to_outcome(source: String, result: Result<SimulationResult, QuintError>) -> Outcome {
    let status = match &result {
        Ok(r) if r.result => SimulationStatus::Success,
        Ok(_) => SimulationStatus::Violation,
        Err(_) => SimulationStatus::Error,
    };

    let errors = result
        .as_ref()
        .err()
        .map_or_else(Vec::new, |e| vec![e.clone()]);

    let best_traces = result.as_ref().ok().map_or_else(Vec::new, |r| {
        r.best_traces
            .iter()
            .cloned()
            .map(|t| SimulationTrace {
                // TODO: Fetch seed from the random generator state
                seed: 0,
                states: t.clone().to_itf(source.clone()),
                result: !t.violation,
            })
            .collect()
    });

    Outcome {
        status,
        errors,
        best_traces,
        // TODO: This simulator is not tracking witnesses yet
        witnessing_traces: vec![],
        samples: 0,
    }
}
