// A simple counter that uses q::debug to log state transitions.
module debugCounter {
  var n: int

  action init = n' = 0

  action step = n' = q::debug("n", n) + 1

  val inv = n < 3
}
