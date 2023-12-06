module option {
  // A demonstration of sum types, specifying an option type.

  // An option type for int values.
  type VoteOption =
    | None
    | Some(int)

  var votes: List[VoteOption]
  var outcome: int

  action init = all {
    votes' = [],
    outcome' = 0
  }

  action vote(v) = {
    votes' = votes.append(Some(v))
  }

  action unvote(i) = all {
    votes[i] != None,
    votes' = votes.replaceAt(i, None),
  }

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
