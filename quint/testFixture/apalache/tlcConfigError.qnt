// Spec for testing TLC configuration errors
module tlcConfigError {
  var x: int

  action init = x' = 0

  action step = x' = x + 1

  // Note: There is no action named "nonExistentInit"
  // Trying to use --init=nonExistentInit should cause an error
}
