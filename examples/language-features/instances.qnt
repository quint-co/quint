module A {
  const x: int
  const y: bool
  const z: str

  pure def f(a) = x + 1
  pure def g(b) = not(b)
}

module instances {
  pure val MyY = true
  pure val z = "world"

  import A(x = 33, y = MyY, z = "hello") as A1

  // now, we can access F and G via A1::F and A1::G
  val test_F = A1::f(10)
  val test_x = A1::x

  // If we want to omit identity bindings such as z = z, we write:
  // import A(x = 15, y = MyY, *) as A2
  import A(x = 15, y = MyY, z = z) as A2

  // the above is equivalent to TLA+'s instance:
  // A2 == INSTANCE A WITH x <- 15, y <- MyY

  export A1
  export A2

  action init = true
  action step = true
}
