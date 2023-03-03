module M {
  def b = 2
}

module conflictingNames {
  // name conflict
  var a : int
  def a(x) = x

  // conflict with built-in definition
  def size(x) = 0

  // type alias conflict
  type T = int
  type T = str

  def b = 1

  // conflicting name coming from import
  import M.b
}
