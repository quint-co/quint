module undefinedName {
  // the following definition produces a name resolution error
  def f = S

  import undefinedModule.*

  module definedModule {
    def a = 1
  }

  import definedModule.undefinedDefinition
}
