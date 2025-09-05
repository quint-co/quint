use std::path::Path;

use quint_evaluator::helpers;

#[test]
fn tictactoe_ok() {
    let file_path: &Path = Path::new("fixtures/tictactoe.qnt");

    let parsed = helpers::parse_from_path(file_path, "init", "step", Some("inv"), None).unwrap();
    // Pass an invariant that should hold
    let result = parsed.simulate(10, 100, 0, None);
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
    let result = parsed.simulate(10, 100, 0, None);
    assert!(result.is_ok());
    // Should find violation
    assert!(!result.unwrap().result);
}

#[test]
/// This spec ensures variables from different instances are treated independently
fn instances_ok() {
    let file_path: &Path = Path::new("fixtures/instances.qnt");

    let parsed =
        helpers::parse_from_path(file_path, "init", "step", Some("inv"), Some("instances"))
            .unwrap();
    // Pass an invariant that should hold
    let result = parsed.simulate(10, 100, 0, None);
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
    let result = parsed.simulate(10, 100, 0, None);
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
    // Should not cause runtime error - init should return false due to empty oneOf
    let result = parsed.simulate(10, 100, 0, None);
    match &result {
        Ok(_) => {}
        Err(e) => panic!("Simulation failed with error: {e}"),
    }
    assert!(result.is_ok());

    // The simulation should succeed without runtime errors
    // Since init returns false (due to empty oneOf), no traces will be generated
    // But there should be no invariant violations since the invariant is simply 'true'
    let sim_result = result.unwrap();
    // The result should be true (no invariant violations found)
    assert!(
        sim_result.result,
        "Expected no invariant violations, but result was false"
    );
}
