// demonstrating the use of 'generate'
module gen {
  var S: Set[int]
  var T: Set[{ x: int, y: bool }]

  action init = {
    nondet iS = generate(10, Set(Set(0)))
    nondet iT = generate(20, Set(Set({ x: 0, y: false })))
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
