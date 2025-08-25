module t {
  val A = Set("a", "b", "c")
  val B = Set(2, 3, 4)
  val C = Set("x", "y")

  var myMap: str -> (int -> str)

  action init = {
    nondet _foo = A.setOfMaps(B.setOfMaps(C)).oneOf()
    myMap' = _foo
  }

  action step = all {
    myMap' = myMap,
  }
}
