// demonstrating the use of 'apalache::generate'
module gen {
  var S: Set[int]
  var T: Set[{ x: int, y: bool }]

  action init = {
    nondet iS: Set[int] = apalache::generate(10)
    nondet iT: Set[{ x: int, y: bool }] = apalache::generate(20)
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
