// A simple counter spec for testing TLC verification
// This should verify successfully with default settings
module tlcCounter {
  var counter: int

  action init = counter' = 0

  action step = counter' = counter + 1

  // Invariant that always holds for bounded model checking
  val inv = counter >= 0
}
