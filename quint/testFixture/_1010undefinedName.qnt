module definedModule {
  def a = 1
}

module undefinedName {
  // the following definition produces a name resolution error
  def f = S

  import undefinedModule.*

  import definedModule.undefinedDefinition
}
