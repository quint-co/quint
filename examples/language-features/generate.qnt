// demonstrating the use of 'generate'
module gen {
  var S: Set[int]
  var T: Set[{ x: int, y: bool }]

  action init = {
    nondet iS = generate(10)
    nondet iT = generate(20)
    all {
      S' = iS,
      T' = iT,
    }
  }

  action step =
    all {
      S' = S,
      T' = T,
    }
}
