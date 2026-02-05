module runtimeError {
  // This breaks on the third state

  val vec = [1, 2]

  var x: int

  action init = x' = vec[0]
  action step = x' = vec[x]
}
