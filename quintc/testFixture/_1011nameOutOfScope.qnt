module nameOutOfScope {
  // produce a scoped definition of name 'x'
  def f(x) = x > 10
  // the following definition produces a name resolution error since 'x' is not in scope
  val A = x + 1
}
