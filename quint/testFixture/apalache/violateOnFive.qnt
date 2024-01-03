// This spec defines a model with an invariant
// that will be violated on the 5th step.
module violateOnFive {
  var n: int

  action init = n' = 1
  action step = n' = n + 1
  def inv = n < 5
}
