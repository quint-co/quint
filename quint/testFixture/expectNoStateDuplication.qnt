module test {
  var x: int

  action init = (x' = 0).then(x' = 1).expect(x == 1)
  action step = (x' = x + 1).expect(x < 10).then(x' = 0)

  run NoExpectTest =
    init
      .then(step)
      .then(step)

  run WithExpectTest =
    init
      .then(step)
      .then(step)
      .expect(x < 44)
}
