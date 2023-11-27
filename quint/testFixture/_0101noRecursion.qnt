// accidental recursion should be detected and reported
module noRecursion {
  // Quint does not allow for recursive definitions
  pure def blackhole(x) = blackhole(x + 1)
}
