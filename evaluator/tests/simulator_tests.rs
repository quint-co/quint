use std::path::Path;
use std::sync::atomic::Ordering;
use std::sync::Arc;

use quint_evaluator::ir::{LookupDefinition, OpQualifier, QuintDeclaration};
use quint_evaluator::simulator::{ParsedQuint, SimulationConfig, StoppingObservations};
use quint_evaluator::{helpers, progress, Verbosity};

#[test]
fn tictactoe_ok() {
    let file_path: &Path = Path::new("fixtures/tictactoe.qnt");

    let parsed = helpers::parse_from_path(file_path, "init", "step", Some("inv"), None).unwrap();
    // Pass an invariant that should hold
    let config = SimulationConfig {
        steps: 10,
        samples: 100,
        n_traces: 0,
        seed: None,
        store_metadata: false,
        verbosity: Verbosity::default(),
        stopping_observations: Default::default(),
    };
    let result = parsed.simulate(config, progress::no_report());
    assert!(result.is_ok());
    // Should not find violation
    assert!(result.unwrap().result);
}

#[test]
fn tictactoe_violation() {
    let file_path: &Path = Path::new("fixtures/tictactoe.qnt");

    let parsed =
        helpers::parse_from_path(file_path, "init", "step", Some("XHasNotWon"), None).unwrap();
    // Pass an invariant that should not hold
    let config = SimulationConfig {
        steps: 10,
        samples: 100,
        n_traces: 1,
        seed: None,
        store_metadata: false,
        verbosity: Verbosity::default(),
        stopping_observations: Default::default(),
    };
    let result = parsed.simulate(config, progress::no_report());
    assert!(result.is_ok());
    // Should find violation
    assert!(!result.as_ref().unwrap().result);
    // The best trace should be a violation
    assert!(
        result
            .unwrap()
            .best_traces
            .first()
            .expect("best_traces should not be empty")
            .violation
    );
}

#[test]
/// This spec ensures variables from different instances are treated independently
fn instances_ok() {
    let file_path: &Path = Path::new("fixtures/instances.qnt");

    let parsed =
        helpers::parse_from_path(file_path, "init", "step", Some("inv"), Some("instances"))
            .unwrap();
    // Pass an invariant that should hold
    let config = SimulationConfig {
        steps: 10,
        samples: 100,
        n_traces: 0,
        seed: None,
        store_metadata: false,
        verbosity: Verbosity::default(),
        stopping_observations: Default::default(),
    };
    let result = parsed.simulate(config, progress::no_report());
    assert!(result.is_ok());
    // Should not find violation
    assert!(result.unwrap().result);
}

#[test]
/// inv2 of the same spec ensures constants and values referencing them are compiled correctly
fn instance_overrides_ok() {
    let file_path: &Path = Path::new("fixtures/instances.qnt");

    let parsed =
        helpers::parse_from_path(file_path, "init", "step", Some("inv2"), Some("instances"))
            .unwrap();
    // Pass an invariant that should hold
    let config = SimulationConfig {
        steps: 10,
        samples: 100,
        n_traces: 0,
        seed: None,
        store_metadata: false,
        verbosity: Verbosity::default(),
        stopping_observations: Default::default(),
    };
    let result = parsed.simulate(config, progress::no_report());
    assert!(result.is_ok());
    // Should not find violation
    assert!(result.unwrap().result);
}

#[test]
/// Test that oneOf on empty sets returns false instead of causing runtime errors
fn one_of_empty_set_ok() {
    let file_path: &Path = Path::new("fixtures/oneOf_empty_test.qnt");

    let parsed = helpers::parse_from_path(
        file_path,
        "init",
        "step",
        Some("inv"),
        Some("oneOfEmptyTest"),
    )
    .unwrap();

    let config = SimulationConfig {
        steps: 10,
        samples: 100,
        n_traces: 0,
        seed: None,
        store_metadata: false,
        verbosity: Verbosity::default(),
        stopping_observations: Default::default(),
    };
    let result = parsed.simulate(config, progress::no_report());

    // The simulation should succeed without runtime errors
    assert!(result.is_ok());

    // `step` should never succeed, so we should have a trace of length 1 (the initial state)
    assert!(result.unwrap().trace_statistics.max_trace_length == 1);
}

#[test]
fn tictactoe_multiple_violations() {
    let file_path: &Path = Path::new("fixtures/tictactoe.qnt");

    let parsed =
        helpers::parse_from_path(file_path, "init", "step", Some("XHasNotWon"), None).unwrap();
    // Request 3 violation traces with enough samples to find them
    let config = SimulationConfig {
        steps: 10,
        samples: 1000,
        n_traces: 3,
        seed: None,
        store_metadata: false,
        verbosity: Verbosity::default(),
        stopping_observations: Default::default(),
    };
    let result = parsed.simulate(config, progress::no_report());
    assert!(result.is_ok());
    let result = result.unwrap();
    // Should find violations
    assert!(!result.result);
    // Should have collected 3 best traces
    assert_eq!(result.best_traces.len(), 3);
    // All traces in best_traces should be violations
    for trace in &result.best_traces {
        assert!(trace.violation, "expected all best traces to be violations");
    }
}

#[test]
fn tictactoe_n_traces_1_fast_return() {
    let file_path: &Path = Path::new("fixtures/tictactoe.qnt");

    let parsed =
        helpers::parse_from_path(file_path, "init", "step", Some("XHasNotWon"), None).unwrap();
    // With n_traces=1, should stop on the first violation and not run all 10000 samples
    let config = SimulationConfig {
        steps: 10,
        samples: 10000,
        n_traces: 1,
        seed: None,
        store_metadata: false,
        verbosity: Verbosity::default(),
        stopping_observations: Default::default(),
    };
    let result = parsed.simulate(config, progress::no_report());
    assert!(result.is_ok());
    let result = result.unwrap();
    assert!(!result.result);
    // Should have stopped well before 10000 samples
    assert!(
        result.samples < 10000,
        "expected early return, but ran all {} samples",
        result.samples
    );
}

#[test]
/// The initial state of every trace should be annotated with `init` and no
/// nondet picks, even when a previous sample ended in a failed step attempt
fn mbt_initial_state_metadata_reset() {
    let file_path: &Path = Path::new("fixtures/mbt_metadata.qnt");

    let parsed = helpers::parse_from_path(file_path, "init", "step", Some("inv"), None).unwrap();
    let config = SimulationConfig {
        steps: 5,
        samples: 20,
        n_traces: 20,
        seed: Some(0x42),
        store_metadata: true,
        verbosity: Verbosity::default(),
        stopping_observations: Default::default(),
    };
    let result = parsed.simulate(config, progress::no_report());
    assert!(result.is_ok());
    let result = result.unwrap();
    assert!(!result.best_traces.is_empty());

    for (i, trace) in result.best_traces.iter().enumerate() {
        let state0 = &trace
            .states
            .first()
            .expect("every trace should have an initial state")
            .value;
        let record = state0.as_record_map();

        let action_taken = record
            .get("mbt::actionTaken")
            .expect("initial state should have mbt::actionTaken");
        assert_eq!(
            action_taken.as_str().as_str(),
            "init",
            "trace {i}: initial state labeled {:?} instead of \"init\"",
            action_taken.as_str()
        );

        let picks = record
            .get("mbt::nondetPicks")
            .expect("initial state should have mbt::nondetPicks")
            .as_record_map();
        for (name, pick) in picks.iter() {
            let (label, _) = pick.as_variant();
            assert_eq!(
                label.as_str(),
                "None",
                "trace {i}: initial state has leaked nondet pick for {name}"
            );
        }
    }
}

#[test]
fn tictactoe_best_traces_quality_order() {
    let file_path: &Path = Path::new("fixtures/tictactoe.qnt");

    let parsed =
        helpers::parse_from_path(file_path, "init", "step", Some("XHasNotWon"), None).unwrap();
    // Request 5 traces, enough samples to find violations
    let config = SimulationConfig {
        steps: 10,
        samples: 1000,
        n_traces: 5,
        seed: None,
        store_metadata: false,
        verbosity: Verbosity::default(),
        stopping_observations: Default::default(),
    };
    let result = parsed.simulate(config, progress::no_report());
    assert!(result.is_ok());
    let result = result.unwrap();

    // Verify ordering: violations come before successes
    let mut seen_success = false;
    for trace in &result.best_traces {
        if trace.violation {
            assert!(
                !seen_success,
                "violation trace appeared after a success trace"
            );
        } else {
            seen_success = true;
        }
    }

    // Verify violations are sorted by length (shorter first)
    let violation_lengths: Vec<_> = result
        .best_traces
        .iter()
        .filter(|t| t.violation)
        .map(|t| t.states.len())
        .collect();
    for window in violation_lengths.windows(2) {
        assert!(
            window[0] <= window[1],
            "violation traces not sorted by length: {} > {}",
            window[0],
            window[1]
        );
    }

    // Verify successes are sorted by length (longer first)
    let success_lengths: Vec<_> = result
        .best_traces
        .iter()
        .filter(|t| !t.violation)
        .map(|t| t.states.len())
        .collect();
    for window in success_lengths.windows(2) {
        assert!(
            window[0] >= window[1],
            "success traces not sorted by length: {} < {}",
            window[0],
            window[1]
        );
    }
}

/// Simulates `fixtures/stop_counter.qnt`, storing every run, and checks that
/// the trace length statistics count each run once
fn assert_trace_statistics_count_each_run_once(inv: &str) {
    let file_path: &Path = Path::new("fixtures/stop_counter.qnt");

    let parsed = helpers::parse_from_path(file_path, "init", "step", Some(inv), None).unwrap();
    // Some runs cannot be extended after the first step, others reach the last step
    let samples = 100;
    let config = SimulationConfig {
        steps: 2,
        samples,
        n_traces: samples,
        seed: Some(0x42),
        store_metadata: false,
        verbosity: Verbosity::default(),
        stopping_observations: Default::default(),
    };
    let result = parsed.simulate(config, progress::no_report()).unwrap();
    assert_eq!(result.best_traces.len(), samples);

    let lengths: Vec<usize> = result.best_traces.iter().map(|t| t.states.len()).collect();
    assert!(lengths.contains(&2) && lengths.contains(&3));

    let stats = result.trace_statistics;
    let average = lengths.iter().sum::<usize>() as f64 / lengths.len() as f64;
    assert_eq!(stats.average_trace_length, average);
    assert_eq!(stats.min_trace_length, *lengths.iter().min().unwrap());
    assert_eq!(stats.max_trace_length, *lengths.iter().max().unwrap());
}

#[test]
fn trace_statistics_count_runs_that_cannot_be_extended_once() {
    assert_trace_statistics_count_each_run_once("alwaysHolds");
}

#[test]
fn trace_statistics_count_violating_runs_once() {
    assert_trace_statistics_count_each_run_once("notStopped");
}

/// A counter whose `step` always succeeds, with observations at n == 0 and
/// n == 3, one that is never reached, and the invariant n < 3
const COUNTER: &str = "module counter {
  var n: int
  action init = n' = 0
  action step = n' = n + 1
  val atStart = n == 0
  observation atThree = n == 3
  val negative = n < 0
  invariant belowThree = n < 3
  val checkBelowThree = belowThree
  val seeThree = atThree
  val missingKey = Map(1 -> 2).get(n) == 2
}";

fn counter(invariants: &[&str], observations: &[&str]) -> ParsedQuint {
    let output = helpers::parse(COUNTER, None).expect("quint compile failed");
    let expr = |name: &str| output.find_definition_by_name(name).unwrap().expr.clone();
    ParsedQuint {
        init: expr("init"),
        step: expr("step"),
        invariants: invariants.iter().map(|name| expr(name)).collect(),
        observations: observations.iter().map(|name| expr(name)).collect(),
        table: output.table.clone(),
    }
}

fn stopping_at(indices: &[usize]) -> SimulationConfig {
    SimulationConfig {
        steps: 10,
        samples: 100,
        n_traces: 1,
        seed: Some(1),
        store_metadata: false,
        verbosity: Verbosity::default(),
        stopping_observations: StoppingObservations {
            indices: indices.to_vec(),
            ..Default::default()
        },
    }
}

#[test]
fn a_stopping_observation_ends_the_simulation_at_the_first_state_that_reaches_it() {
    let config = stopping_at(&[1]);
    let stopped = Arc::clone(&config.stopping_observations.stopped);

    let result = counter(&[], &["atStart", "atThree"])
        .simulate(config, progress::no_report())
        .unwrap();

    assert!(result.result);
    assert_eq!(result.samples, 1);
    assert_eq!(result.stopped_by_observations, vec![1]);
    assert_eq!(result.observing_traces, vec![1, 1]);
    assert_eq!(result.best_traces.len(), 1);
    assert!(!result.best_traces[0].violation);
    // States n = 0, 1, 2, 3: the trace ends where `atThree` first holds
    assert_eq!(result.best_traces[0].states.len(), 4);
    assert!(
        stopped.load(Ordering::Relaxed),
        "simulations sharing the flag must see the stop"
    );
}

#[test]
fn a_stopping_observation_that_holds_initially_ends_the_trace_at_the_initial_state() {
    let result = counter(&[], &["atStart", "atThree"])
        .simulate(stopping_at(&[0, 1]), progress::no_report())
        .unwrap();

    assert!(result.result);
    assert_eq!(result.samples, 1);
    assert_eq!(result.stopped_by_observations, vec![0]);
    assert_eq!(result.best_traces[0].states.len(), 1);
}

#[test]
fn a_violation_in_the_state_that_reaches_a_stopping_observation_takes_precedence() {
    let result = counter(&["belowThree"], &["atThree"])
        .simulate(stopping_at(&[0]), progress::no_report())
        .unwrap();

    assert!(!result.result);
    assert!(result.stopped_by_observations.is_empty());
    assert_eq!(result.violated_invariants, vec![0]);
    assert!(result.best_traces[0].violation);
    assert_eq!(result.best_traces[0].states.len(), 4);
}

#[test]
fn observations_that_are_not_stopping_do_not_end_the_simulation() {
    let result = counter(&[], &["atStart", "atThree"])
        .simulate(stopping_at(&[]), progress::no_report())
        .unwrap();

    assert!(result.result);
    assert_eq!(result.samples, 100);
    assert!(result.stopped_by_observations.is_empty());
    assert_eq!(result.observing_traces, vec![100, 100]);
    assert_eq!(result.best_traces[0].states.len(), 11);
}

#[test]
fn an_unreachable_stopping_observation_runs_every_sample() {
    let config = stopping_at(&[1]);
    let stopped = Arc::clone(&config.stopping_observations.stopped);

    let result = counter(&[], &["atStart", "negative"])
        .simulate(config, progress::no_report())
        .unwrap();

    assert!(result.result);
    assert_eq!(result.samples, 100);
    assert!(result.stopped_by_observations.is_empty());
    assert_eq!(result.observing_traces, vec![100, 0]);
    assert_eq!(result.best_traces.len(), 1);
    assert_eq!(result.best_traces[0].states.len(), 11);
    assert!(!stopped.load(Ordering::Relaxed));
}

#[test]
fn a_simulation_stops_before_its_next_sample_once_another_reached_a_stopping_observation() {
    let config = stopping_at(&[0]);
    config
        .stopping_observations
        .stopped
        .store(true, Ordering::Relaxed);

    let result = counter(&[], &["atThree"])
        .simulate(config, progress::no_report())
        .unwrap();

    assert!(result.result);
    assert_eq!(result.samples, 0);
    assert!(result.best_traces.is_empty());
    assert!(result.stopped_by_observations.is_empty());
}

#[test]
fn a_runtime_error_in_an_observation_ends_the_simulation_with_that_error() {
    for stopping in [&[0][..], &[][..]] {
        let result =
            counter(&[], &["missingKey"]).simulate(stopping_at(stopping), progress::no_report());

        let Err(error) = result else {
            panic!("an observation that fails to evaluate must fail the simulation")
        };
        assert!(
            error.error.message.contains("non-existing key"),
            "unexpected error: {}",
            error.error.message
        );
    }
}

#[test]
fn invariant_and_observation_definitions_are_re_evaluated_at_each_state() {
    let parsed = counter(&["checkBelowThree"], &["seeThree"]);
    let qualifier = |name: &str| {
        parsed.table.values().find_map(|def| match def {
            LookupDefinition::Definition(QuintDeclaration::QuintOpDef(d)) if d.name == name => {
                Some(d.qualifier.clone())
            }
            _ => None,
        })
    };
    assert_eq!(qualifier("belowThree"), Some(OpQualifier::Invariant));
    assert_eq!(qualifier("atThree"), Some(OpQualifier::Observation));

    let result = parsed
        .simulate(stopping_at(&[]), progress::no_report())
        .unwrap();

    assert!(!result.result);
    assert_eq!(result.observing_traces, vec![1]);
    assert_eq!(result.best_traces[0].states.len(), 4);
}
