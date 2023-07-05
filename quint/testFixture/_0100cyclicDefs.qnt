// testing that cyclic definitions are detected
module cyclicDefs {
  pure def foo(x) = bar(x)
  pure def bar(x) = baz(x)
  pure def baz(x) = foo(x)
}
