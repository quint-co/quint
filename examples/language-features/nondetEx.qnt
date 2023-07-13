// demonstrating non-trivial behavior of nondet and oneOf
module nondetEx {
  var x: int
  var y: int
  var delta: int
  var oldDelta: int

  action init = {
    nondet v = Set(1, 2, 3).oneOf()
    all {
      x' = v,
      y' = -v,
      delta' = v,
      oldDelta' = v,
    }
  }

  action step =
    nondet v = Set(1, 2, 3).oneOf()
    all {
      x' = x + v,
      y' = y - v,
      delta' = v,
      oldDelta' = delta,
    }

  // this must be an invariant
  val mirrorInv = all {
    y == -x
  }

  // this invariant must be false, unless the value of v is frozen
  val falseInv = all {
    oldDelta == delta
  }

  run mirrorTest =
    init.then(step)
        .then(step)
        .then(all {
          assert(mirrorInv),
          x' = x,
          y' = y,
          delta' = delta,
          oldDelta' = oldDelta,
        })
}
