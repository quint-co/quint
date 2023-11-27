module A {
  const c: int
  var a: int
}

module nonConstOverride {
  import A(c = 1, a = false) as A1
}
