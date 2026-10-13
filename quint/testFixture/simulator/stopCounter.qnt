// At every step, the counter either adds a random amount or stops.
// Once stopped, `step` is disabled, so runs end at different lengths.
module stopCounter {
  var x: int
  var stopped: bool

  action init = all {
    x' = 0,
    stopped' = false,
  }

  action step = all {
    not(stopped),
    nondet d = 1.to(1000).oneOf()
    nondet s = Set(true, false).oneOf()
    all {
      x' = x + d,
      stopped' = s,
    },
  }
}
