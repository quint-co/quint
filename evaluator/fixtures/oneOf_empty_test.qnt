module oneOfEmptyTest {
  // Test that oneOf on an empty set returns false instead of causing a runtime error

  var x: int

  action init = x' = 0

  action step =
    if (x == 0) {
      // This should evaluate to false, not cause a runtime error
      nondet v = Set().oneOf()
      x' = v
    } else {
      x' = x
    }

  val inv = true
}
