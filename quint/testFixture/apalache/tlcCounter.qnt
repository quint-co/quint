// A simple counter spec for testing TLC verification
// This should verify successfully with default settings
module tlcCounter {
  var counter: int

  action init = counter' = 0

  action step = all {
    counter < 3,
    counter' = counter + 1
    }

  val inv = counter >= 0
}
