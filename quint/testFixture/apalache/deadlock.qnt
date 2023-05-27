// This spec defines a model that is deadlocked on the 5th step.
module deadlock {
  var n: int

  action init = n' = 1
  action step = all {
    n < 5,
    n' = n + 1
  }
}
