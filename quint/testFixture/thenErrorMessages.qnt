module test {
  var x: int

  action init(ok) = all { ok, x' = 1 }
  action a = x' = 1
  action b = all { false, x' = 2 }
  action c = x' = 3

  run bFailsTest = init(true)
    .then(a)
    .then(b)
    .then(c)
    .then(c)

  run initFailsTest = init(false)
    .then(a)

  run lastActionFailsTest = init(true)
    .then(a)
    .then(b)
}
