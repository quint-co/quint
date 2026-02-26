// Fixture for testing runtime error stack traces
module runtimeErrorStackTrace {
  var n: int

  pure def divide(x: int, y: int): int = x / y

  pure def compute(a: int): int = divide(a, 0)

  action init = n' = 0

  run errorTest = init.then(n' = compute(n + 1))
}
