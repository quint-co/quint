module A {
  const c: bool
}

module OverrideErrors {
  var x: bool

  module A1 = A(c = 1)
  module A2 = A(c = x)
}
