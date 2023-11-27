module SumTypes {
  type T =
    | A
    | B(int)

  val canConstructVariants : List[T] = List(A, B(2))
}
