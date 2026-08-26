use std::path::Path;

use quint_evaluator::{helpers, progress, simulator::SimulationConfig, Verbosity};

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
