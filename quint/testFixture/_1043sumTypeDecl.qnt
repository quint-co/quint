module SumTypes {
  type T =
    | A
    | B(int)

  val canConstructVariants : List[T] = List(A, B(2))

  type SingleType =
    | Foo

  val canConstructVariantsWithSingleType: SingleType = Foo
}
