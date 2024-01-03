// a regression test for:
// https://github.com/informalsystems/quint/issues/843
module bug843pureValCache {
  def foo(x) = {
    pure val bar = x + 1
    bar
  }

  var t: int

  run aTest = (t' = foo(1)).then(t' = foo(2)).then(all{
    assert(t == 3),
    t' = t,
  })

}
