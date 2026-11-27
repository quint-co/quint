// A counter that grows without bound, so a model checker explores its states only within a state constraint.
module counter {
  var n: int

  action init = n' = 0
  action step = n' = n + 1

  invariant nonNegative = n >= 0

  /// The state constraint that leaves the five states where `n` is below 5
  val belowFive = n < 5
}
