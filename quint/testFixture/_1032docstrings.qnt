/// Docstring for module
module docstrings {
  /// Top level docstring
  val nestedVals =
    // There are no docstrings for nested vals
    pure val foo = 1
    foo

  /// Docstring for var
  var x: int

  /// Docstring for const
  const N: int
}
