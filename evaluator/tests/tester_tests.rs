use quint_evaluator::{helpers, progress};
use quint_evaluator::tester::TestCase;
use std::error::Error;
use std::path::Path;

/// Helper to parse a test definition from a Quint file
fn parse_test_from_path(
    file_path: &Path,
    test_name: &str,
) -> Result<TestCase, Box<dyn Error>> {
    // Use helpers to compile the file
    let output = helpers::parse(
        &std::fs::read_to_string(file_path)?,
        "init",
        "step",
        None,
    )?;

    // Find the test definition (no q:: prefix for regular definitions)
    let test_def = output
        .find_definition_by_name(test_name)?
        .expr
        .clone();

    Ok(TestCase {
        test: test_def,
        table: output.table,
    })
}

#[test]
fn passing_test_ok() {
    let file_path = Path::new("fixtures/runs.qnt");
    let test_case = parse_test_from_path(file_path, "passingTest").unwrap();

    let result = test_case.execute(0, 1, progress::no_report());

    // Test passed - no errors
    assert_eq!(result.errors.len(), 0);
    assert_eq!(result.seed, 0);
    assert!(result.nsamples > 0);
}

#[test]
fn failing_test_returns_qnt511() {
    let file_path = Path::new("fixtures/runs.qnt");
    let test_case = parse_test_from_path(file_path, "failingTest").unwrap();

    let result = test_case.execute(0, 1, progress::no_report());

    // Test failed with QNT511 (test returned false)
    assert_eq!(result.errors.len(), 1);
    assert_eq!(result.errors[0].code, "QNT511");
    assert!(result.errors[0].message.contains("returned false"));
    // Error reference should point to the test definition
    assert!(result.errors[0].reference.is_some());
    assert_eq!(result.errors[0].reference.unwrap(), test_case.test.id());
    assert_eq!(result.seed, 0);
}

#[test]
fn failing_assert_returns_qnt508() {
    let file_path = Path::new("fixtures/runs.qnt");
    let test_case = parse_test_from_path(file_path, "failingAssertTest").unwrap();

    let result = test_case.execute(0, 1, progress::no_report());

    // Test failed with QNT508 (assertion failed)
    assert_eq!(result.errors.len(), 1);
    assert_eq!(result.errors[0].code, "QNT508");
    assert!(result.errors[0].message.contains("Assertion failed"));
    // Error reference should be set (automatic wrapping adds it)
    assert!(result.errors[0].reference.is_some());
}

#[test]
fn failing_expect_action_returns_qnt508() {
    let file_path = Path::new("fixtures/runs.qnt");
    let test_case = parse_test_from_path(file_path, "failingExpectActionTest").unwrap();

    let result = test_case.execute(0, 1, progress::no_report());

    // Test failed with QNT508
    assert_eq!(result.errors.len(), 1);
    assert_eq!(result.errors[0].code, "QNT508");
    // Could be either "Cannot continue" or "does not hold" depending on which part fails
    assert!(result.errors[0].reference.is_some());
}
