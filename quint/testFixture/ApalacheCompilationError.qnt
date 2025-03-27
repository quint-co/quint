module ApalacheCompilationError {
  var x: int
  var y: int

  action A = x' = 42

  action parameterizedAction(v) = {
    nondet v2 = 2.to(5).oneOf()
    y' = v + v2
  }

  action init = all {
    A,
    nondet v = 1.to(10).oneOf()
    parameterizedAction(v)
  }

  action step = all {
    A,
    parameterizedAction(x),
  }
}
