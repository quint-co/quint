// this file demonstrates namespaces of modules and imports

// Math is a stateless module: Its definitions may be imported
module Math {
  def sqr(x) = x * x
  def pow(x, y) = x^y
}

module A {
  // import all names from Math, namely, sqr and pow
  import Math.*

  // we can access sqr here and everywhere in the name scope of A
  val test_sqr = sqr(2) == 4
}

module B {
  import A.*

  // Import introduces names in the module lookup table,
  // but it is not transitive. Hence, we cannot access sqr here.
  // val test_test_sqr = sqr(2) == 4
  //                     ^^^^^^ error: Failed to resolve name sqr in definition for test_test_sqr, in module B

  // however, we can access test_sqr
  val test_test_sqr = test_sqr

  // To enable transitivity, we need to export the names that we want to make
  // available when importing the current module
  export A.*
}

module C {
  import B.*

  // Now we can access all definitions from B, including the definitions from A
  // (which were exported by B)
  val test_exported = test_sqr
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

// Qualified imports and exports
module E {
  var x: int
  action init = x' = 1

  // Export Math as a qualified name
  // to be accessed by E::Math
  export Math
}

module F {
  var y: int
  action init = y' = 2

  // Export basics qualified as ExportedBasics
  // to be accessed by F::ExportedBasics
  export basics as ExportedBasics
}

module imports {
  import E
  import F as MyF

  val test_exported1 = E::Math::pow(2, 2) == 4
  val test_exported2 = MyF::ExportedBasics::double(2) == 4

  action init = all {
    E::init,
    MyF::init
  }

  action step = all {
    E::x' = E::x,
    MyF::y' = MyF::y,
  }
}
