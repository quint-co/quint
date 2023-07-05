// testing that the definitions may be out of order
module unorderedDefs {
  pure def double(x) = plus(x, x)
  pure def plus(x, y) = x + y
}
