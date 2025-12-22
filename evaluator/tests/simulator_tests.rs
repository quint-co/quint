use std::path::Path;

use quint_evaluator::{helpers, progress};

#[test]
fn tictactoe_ok() {
    let file_path: &Path = Path::new("fixtures/tictactoe.qnt");

    let parsed = helpers::parse_from_path(file_path, "init", "step", Some("inv"), None).unwrap();
    // Pass an invariant that should hold
    let result = parsed.simulate(10, 100, 0, progress::no_report(), None);
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
    let result = parsed.simulate(10, 100, 1, progress::no_report(), None);
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
    let result = parsed.simulate(10, 100, 0, progress::no_report(), None);
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
    let result = parsed.simulate(10, 100, 0, progress::no_report(), None);
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

    let result = parsed.simulate(10, 100, 0, progress::no_report(), None);

    // The simulation should succeed without runtime errors
    assert!(result.is_ok());

    // `step` should never succeed, so we should have a trace of length 1 (the initial state)
    assert!(result.unwrap().trace_statistics.max_trace_length == 1);
}
