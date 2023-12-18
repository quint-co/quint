module option {
  // A demonstration of sum types, specifying an option type.

  // An option type for int values.
  type VoteOption =
    | None
    | Some(int)

  var votes: List[VoteOption]

  val sumVotes =
    votes.foldl(0, (sum, v) => match v {
        | Some(n) => sum + n
        | None    => sum
      }
    )

  action step = all {
    any {
      nondet v = oneOf(Int); vote(v),
      nondet i = oneOf(votes.indices()); unvote(i),
    },
    outcome' = sumVotes
  }

  run matchWithDefaultTest = {
    val expected = match Some(42) { _ => "default" }
    assert(expected == "default")
  }
}
