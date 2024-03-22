module ModuleToInstantiate {
  const C: int

  val instantiatedValue = C
}

module ModuleToImport {
  val importedValue = 0
}

module ApalacheCompilation {
  // Tests whether we can compile imports
  import ModuleToImport.*

  // Tests whether we can compile instantiations
  import ModuleToInstantiate(C = 0).*

  var x: int

  type T =
    | A  // Test whether we represent the unit correctly
    | B(int)

  // Tests whether we will sanitize identifiers
  def foo::bar(__123) = __123

  // TODO: Tests that we remove primes from assignments in the init functino
  action init = {
    x' = importedValue + instantiatedValue
  }

  action step = x' = x + 1

  def inv = x >= 0
}
