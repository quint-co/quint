// Regression fixture for #2056.
// `trap1` has a run that does not end in Test, so the default filter selects nothing.
// `withDefaultTest` has both, so the default filter must still run `runOneTest`.

module trap1 {
  val x = 1

  run runOne = x == 1
}

module withDefaultTest {
  val x = 1

  run runOne = x == 1
  run runOneTest = x == 1
}
