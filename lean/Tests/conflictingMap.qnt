module conflictingMap {
  var x: int
  action init = x' = Map(1 -> 2, 1 -> 3).get(1)
  action step = x' = x
  invariant ok = x == 2
}
