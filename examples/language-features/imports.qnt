// this file demonstrates namespaces of modules and imports

// Math is a stateless module: Its definitions may be imported
module Math {
  def sqr(x) = x * x
  def pow(x, y) = x^y
}

module A {
  // we cannot access sqr here, as we have not imported it yet
  // val test_sqr_before = sqr(3) == 9
  //                       ^^^ error: sqr is not found

  // import all names from Math, namely, sqr and pow
  import Math.*

  // we can access sqr here and everywhere in the name scope of A
  val test_sqr = sqr(2) == 4
}

module B {
  import A.*

  // Import introduces names in the module lookup table,
  // but it is not transitive. Hence, we cannot access sqr here.
  // val test_sqr = sqr(2) == 4
  //                ^^^ error: sqr is not available

  // however, we can access test_sqr
  val test_test_sqr = test_sqr
}

// module C is stateful, it cannot be imported
module C {
  var n: int
}

module D {
  // import C.*
  //        ^ error: C is stateful
}

// demonstrate that the same module may be imported via different paths
module basics {
  def double(x) = 2 * x
}

module spec {
  import basics.*

  def quad(x) = double(double(x))
}

module test {
  // first, we import `basics`, as we need `double`
  // (let's pretend that we do not know that `spec` imports `basics`)
  import basics.*
  // second, we import `spec`, as we need `quad`
  import spec.*

  def quadShouldDoubleTwice = {
    Set(1, 2, 3).forall(i => quad(i) == double(i) + double(i))
  }
}
