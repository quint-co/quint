use std::path::Path;

use quint_simulator::helpers;

#[test]
fn tictactoe_ok() {
    let file_path: &Path = Path::new("fixtures/tictactoe.qnt");

    let parsed = helpers::parse_from_path(file_path, "init", "step", Some("inv"), None).unwrap();
    // Pass an invariant that should hold
    let result = parsed.simulate("init", "step", "inv", 10, 100);
    assert!(result.is_ok());
    // Should not find violation
    assert!(result.unwrap().result);
}

#[test]
fn tictactoe_violation() {
    let file_path: &Path = Path::new("fixtures/tictactoe.qnt");

    let parsed = helpers::parse_from_path(file_path, "init", "step", Some("inv"), None).unwrap();
    // Pass an invariant that should not hold
    let result = parsed.simulate("init", "step", "XHasNotWon", 10, 100);
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
    let result = parsed.simulate("init", "step", "inv", 10, 100);
    assert!(result.is_ok());
    // Should not find violation
    assert!(result.unwrap().result);
}
