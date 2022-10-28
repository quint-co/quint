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

  module nested {
    def b = 2
  }

  // conflicting name coming from import
  import nested.b
}
