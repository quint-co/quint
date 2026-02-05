// ! REPL mode for the Quint evaluator
//!
//! This module provides a stateful REPL evaluator that communicates via
//! line-delimited JSON over stdin/stdout. It maintains evaluation state
//! between commands, allowing incremental expression evaluation.

use crate::evaluator::{Env, Interpreter};
use crate::ir::{LookupTable, QuintEx};
use crate::value::Value;
use itf;
use serde::{Deserialize, Serialize};
use std::io::{self, BufRead, Write};
use std::panic::{catch_unwind, AssertUnwindSafe};

/// Commands that can be sent to the REPL evaluator
#[derive(Deserialize, Debug)]
#[serde(tag = "cmd")]
enum ReplCommand {
    /// Initialize the evaluator with a lookup table
    Initialize {
        table: LookupTable,
        #[serde(default)]
        seed: Option<u64>,
        #[serde(default)]
        verbosity: u8,
    },
    /// Update the lookup table with new definitions
    UpdateTable { table: LookupTable },
    /// Evaluate a single expression
    Evaluate { expr: QuintEx },
    /// Shift state variables and check for undefined vars, returning old and new states
    ReplShift {},
    /// Get the current trace states for rendering
    GetTraceStates {},
    /// Reset the evaluator state
    Reset {},
}

/// Responses sent by the REPL evaluator
#[derive(Serialize, Debug)]
#[serde(tag = "response")]
enum ReplResponse {
    /// Confirmation of successful initialization
    Initialized { success: bool },
    /// Confirmation of table update
    TableUpdated { success: bool },
    /// Result of expression evaluation
    EvaluationResult {
        #[serde(flatten)]
        result: ReplResult,
    },
    /// Result of state shift with old and new states
    ReplShiftResult {
        shifted: bool,
        missing_vars: Vec<String>,
        old_state: Option<itf::Value>,
        new_state: Option<itf::Value>,
    },
    /// Trace states in ITF format
    TraceStates { states: Vec<itf::Value> },
    /// Confirmation of reset
    ResetComplete {},
    /// Error response
    Error { message: String },
    /// Error response to be used for when the server cannot recover
    FatalError { message: String },
}

/// Wrapper for evaluation results to match TypeScript Either type
#[derive(Serialize, Debug)]
#[serde(untagged)]
enum ReplResult {
    Ok { ok: itf::Value },
    Err { err: crate::ir::QuintError },
}

/// Stateful REPL evaluator
pub struct ReplEvaluator {
    interpreter: Option<Interpreter>,
    env: Option<Env>,
    trace_states: Vec<Value>,
    verbosity: u8,
}

impl Default for ReplEvaluator {
    fn default() -> Self {
        Self::new()
    }
}

impl ReplEvaluator {
    pub fn new() -> Self {
        Self {
            interpreter: None,
            env: None,
            trace_states: Vec::new(),
            verbosity: 0,
        }
    }

    fn initialize(&mut self, table: LookupTable, seed: Option<u64>, verbosity: u8) -> ReplResponse {
        self.verbosity = verbosity;

        // Create the interpreter with the table
        self.interpreter = Some(Interpreter::new(table));

        let storage = self.interpreter.as_ref().unwrap().var_storage.clone();
        self.env = Some(if let Some(seed) = seed {
            Env::with_rand_state(storage, seed)
        } else {
            Env::new(storage)
        });

        self.trace_states = Vec::new();

        ReplResponse::Initialized { success: true }
    }

    fn update_table(&mut self, table: LookupTable) -> ReplResponse {
        // Update the interpreter's table if it exists, otherwise error
        match &mut self.interpreter {
            Some(interpreter) => {
                interpreter.update_table(table);
            }
            None => {
                return ReplResponse::Error {
                    message: "Evaluator not initialized".to_string(),
                }
            }
        }

        ReplResponse::TableUpdated { success: true }
    }

    fn evaluate(&mut self, expr: QuintEx) -> ReplResponse {
        let interpreter = match &mut self.interpreter {
            Some(i) => i,
            None => {
                return ReplResponse::Error {
                    message: "Evaluator not initialized".to_string(),
                }
            }
        };

        let env = match &mut self.env {
            Some(e) => e,
            None => {
                return ReplResponse::Error {
                    message: "Evaluator not initialized".to_string(),
                }
            }
        };

        let compiled = interpreter.compile(&expr);

        match compiled.execute(env) {
            Ok(value) => {
                let result_itf = value.to_itf();
                ReplResponse::EvaluationResult {
                    result: ReplResult::Ok { ok: result_itf },
                }
            }
            Err(error) => ReplResponse::EvaluationResult {
                result: ReplResult::Err { err: error },
            },
        }
    }

    fn repl_shift(&mut self) -> ReplResponse {
        let env = match &mut self.env {
            Some(e) => e,
            None => {
                return ReplResponse::Error {
                    message: "Evaluator not initialized".to_string(),
                }
            }
        };

        // Check for missing variables before shifting
        let mut missing_vars = Vec::new();
        let storage = env.var_storage.borrow();

        for (_, register) in storage.next_vars.iter() {
            let reg = register.borrow();
            if reg.value.is_none() {
                missing_vars.push(reg.name.to_string());
            }
        }

        // Check if anything actually changed
        // If all nextVars are empty, nothing was set
        let total_next_vars = storage.next_vars.len();
        let any_changed = total_next_vars > 0 && missing_vars.len() < total_next_vars;

        // Drop the borrow to avoid an old state getting referenced.
        // This is needed because the var_storage is under a RefCell,
        // avoiding borrow checker errors at compile time.
        drop(storage);

        if !any_changed {
            return ReplResponse::ReplShiftResult {
                shifted: false,
                missing_vars: vec![],
                old_state: None,
                new_state: None,
            };
        }

        // Save current state before shifting
        let old_state = env.var_storage.borrow().as_record();
        let old_state_itf = old_state.to_itf();
        self.trace_states.push(old_state);

        // Shift the state
        env.var_storage.borrow_mut().shift_vars();

        // Get new state after shifting
        let new_state = env.var_storage.borrow().as_record();
        let new_state_itf = new_state.to_itf();

        ReplResponse::ReplShiftResult {
            shifted: true,
            missing_vars,
            old_state: Some(old_state_itf),
            new_state: Some(new_state_itf),
        }
    }

    fn get_trace_states(&self) -> ReplResponse {
        let states: Vec<itf::Value> = self.trace_states.iter().map(|v| v.to_itf()).collect();
        ReplResponse::TraceStates { states }
    }

    fn reset(&mut self) -> ReplResponse {
        if let Some(env) = &self.env {
            env.var_storage.borrow_mut().vars.clear();
            env.var_storage.borrow_mut().next_vars.clear();
        }
        self.trace_states.clear();
        ReplResponse::ResetComplete {}
    }

    fn handle_command(&mut self, command: ReplCommand) -> ReplResponse {
        match command {
            ReplCommand::Initialize {
                table,
                seed,
                verbosity,
            } => self.initialize(table, seed, verbosity),
            ReplCommand::UpdateTable { table } => self.update_table(table),
            ReplCommand::Evaluate { expr } => self.evaluate(expr),
            ReplCommand::ReplShift {} => self.repl_shift(),
            ReplCommand::GetTraceStates {} => self.get_trace_states(),
            ReplCommand::Reset {} => self.reset(),
        }
    }
}

/// Run the REPL evaluator, reading commands from stdin and writing responses to stdout.
/// Commands and responses are line-delimited JSON (NDJSON).
pub fn run_repl_from_stdin() -> io::Result<()> {
    let stdin = io::stdin();
    let mut stdout = io::stdout();
    let mut evaluator = ReplEvaluator::new();

    for line in stdin.lock().lines() {
        let line = line?;

        // Parse the command
        let command: ReplCommand = match serde_json::from_str(&line) {
            Ok(cmd) => cmd,
            Err(e) => {
                // Send error response for invalid JSON
                let error_response = ReplResponse::Error {
                    message: format!("Invalid command JSON: {e}"),
                };
                serde_json::to_writer(&mut stdout, &error_response)?;
                stdout.write_all(b"\n")?;
                stdout.flush()?;
                continue;
            }
        };

        // Handle the command, catching any panics
        let response = match catch_unwind(AssertUnwindSafe(|| evaluator.handle_command(command))) {
            Ok(response) => response,
            Err(panic_info) => {
                // Panic occurred - extract the panic message
                let msg = panic_info
                    .downcast_ref::<&str>()
                    .copied()
                    .or_else(|| panic_info.downcast_ref::<String>().map(|s| s.as_str()))
                    .unwrap_or("Unknown panic in REPL");

                ReplResponse::FatalError {
                    message: msg.to_string(),
                }
            }
        };

        // Send response
        serde_json::to_writer(&mut stdout, &response)?;
        stdout.write_all(b"\n")?;
        stdout.flush()?;

        if matches!(response, ReplResponse::FatalError { .. }) {
            break;
        }
    }

    Ok(())
}
