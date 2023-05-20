module InstancesFrom {
  pure val MyY = true
  pure val z = "world"

  import A(x = 33, y = MyY, z = "hello") as A1 from "./instances"

  // now, we can access F and G via A1::F and A1::G
  val test_F = A1::f(10)
  val test_x = A1::x

  // If we want to omit identity bindings such as z = z, we write:
  // import A(x = 15, y = MyY, *) as A2
  import A(x = 15, y = MyY, z = z) as A2 from "./instances"

  // the above is equivalent to TLA+'s instance:
  // A2 == INSTANCE A WITH x <- 15, y <- MyY

  export A1
  export A2
}
