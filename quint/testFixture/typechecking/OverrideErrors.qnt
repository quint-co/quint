module A {
  const c: bool
}

module OverrideErrors {
  var x: bool

  import A(c = 1) as A1
  import A(c = x) as A2
}
