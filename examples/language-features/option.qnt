module option {
  // A demonstration of sum types, specifying an option type.

  // An option type for values.
  type Vote_option =
    | None
    | Some(int)

  var votes: List[Vote_option]
  var outcome: int

  action Init = all {
    votes' = [],
    outcome' = 0
  }

  action Vote(v) = {
    votes' = votes.append(Some(v))
  }

  action Unvote(i) = all {
    votes[i] != None,
    votes' = votes.replaceAt(i, None),
  }

  val SumVotes =
    votes.foldl(0, (sum, vote) => match vote {
        | Some(v) => sum + v
        | None    => sum
      }
    )

  action Next = all {
    any {
      nondet v = oneOf(Int); Vote(v),
      nondet i = oneOf(votes.indices()); Unvote(i),
    },
    outcome' = SumVotes
  }

  run matchWithDefaultTest = {
    val expected = match Some(42) { _ => "default" }
    assert(expected == "default")
  }
}
