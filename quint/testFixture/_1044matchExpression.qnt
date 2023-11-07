module SumTypes {
  type T = A | B(int) | C(str)

  val c = C("Foo")

  val ex = match c {
    | A    => 0
    | B(n) => n
    | _    => -1
  }
}
