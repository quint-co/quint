module option {
  // a demonstration of discriminated unions, specifying an option type.

  // An option type for values.
  // This type declaration is not required. It only defines an alias.
  type vote_option =
    | { tag: "none" }
    | { tag: "some", value: int }

  def Some(v) = { tag: "some", value: v }

  val None = { tag: "none" }

  var votes: List[vote_option]
  var outcome: int

  action Init = all {
    votes <- [],
    outcome <- 0
  }

  action Vote(v) = {
    votes <- votes.append(Some(v))
  }

  action Unvote(i) = all {
    votes[i] != None,
    votes <- votes.replaceAt(i, None),
  }

  val SumVotes =
    def sum_one(sum, w): (int, vote_option) => int =
      // deconstruct a discriminate union.
      w match
        // this pattern binds some_w to the "some" version of w, if w.tag == "some"
        | "some": some_w =>  sum + some_w.value
        // this pattern
        | "none": _ =>       sum

      /* // this is how you would do that in typescript
      if (w.tag == "some") {
        // w has the type { tag: "some", value: int }
        sum + w.value
      } else {
        sum
      }
      */

    votes.foldl(0, sum_one)

  action Next = all {
    any {
      Int.guess(v => Vote(v)),
      votes.domain.guess(i => Unvote(i)),
    },
    outcome <- SumVotes
  }
}
