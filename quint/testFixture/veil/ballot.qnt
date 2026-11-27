// Each participant votes once. A vote picks a participant among the keys of `votes`, so these keys never change,
// but `quint` does not see that the participant it picks is one of `participants`.
module ballot {
  const participants: Set[str]

  var votes: str -> int
  var count: int

  action init = all {
    votes' = participants.mapBy(_ => 0),
    count' = 0,
  }

  action step = {
    nondet p = votes.keys().oneOf()
    all {
      votes.get(p) == 0,
      votes' = votes.set(p, 1),
      count' = count + 1,
    }
  }

  // Once a vote is counted, a participant has voted
  val counted = count > 0 implies participants.exists(p => votes.get(p) == 1)
}
