module A {
  const c: int
  var a: int
}

module nonConstOverride {
  module A1 = A(c = 1, a = false)
}
