module SumTypes {
  type T =
    | A
    | B(int)

  val canConstructVariants = List(A, B(2))
}
