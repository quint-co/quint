module ModuleToInstantiate {
  const C: int

  val instantiatedValue = C
}

// Used for import tests and for testing specifying an alternate main module
module ModuleToImport {
  val importedValue = 0

  action init = true
  action step = true
}

module ApalacheCompilation {
  // Tests whether we can compile imports
  import ModuleToImport.importedValue

  // Tests whether we can compile instances
  import ModuleToInstantiate(C = 0).*

  var x: int

  type T =
    | A  // Test whether we represent the unit correctly
    | B(int)

  // Tests whether we will sanitize identifiers
  def foo::bar(__123) = __123

  // TODO: Tests that we remove primes from assignments in the init function
  action init = {
    x' = importedValue + instantiatedValue
  }

  // Tests that we can specify an alternative init via CLI args
  action altInit = {
    x' = 0
  }

  action step = x' = x + 1

  // Tests that we can specify an alternative step via CLI args
  action altStep = x' = x + 0

  def inv = x >= 0

  // Tests that we can specify an alternative invariant via CLI args
  def altInv = x >= 0
}
