module stopCounter {
  // At every step, the counter either increments or stops. Once stopped,
  // step is disabled, so runs end at different lengths

  var x: int
  var stopped: bool

  def notStopped = not(stopped)
  def alwaysHolds = true

  action init = all {
    x' = 0,
    stopped' = false,
  }

  action step = all {
    not(stopped),
    nondet s = Set(true, false).oneOf()
    all {
      x' = x + 1,
      stopped' = s,
    },
  }
}
