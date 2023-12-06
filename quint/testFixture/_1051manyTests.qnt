module manyTests {
  var x: int
  action init = x' = 0

  run firstTest = init.then(x' = 1).then(all { assert(x == 1), x' = x })
  run secondTest = init.then(x' = 2).then(all { assert(x == 2), x' = x })
}
