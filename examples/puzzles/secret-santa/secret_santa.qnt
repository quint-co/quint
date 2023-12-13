module secret_santa {
  import commonSpells.* from "../../spells/commonSpells"

  const participants: Set[str]

  /// person_to_gift.get(A) == B if A is B's secret santa
  var person_to_gift: str -> str

  /// the bowl of participants, containg a paper piece for each participant with their participant
  var bowl: Set[str]

  action init = all {
    person_to_gift' = Map(),
    bowl' = participants,
  }

  action draw_name(picker: str): bool = {
    nondet drawed_name = bowl.oneOf()
    all {
      person_to_gift' = person_to_gift.put(picker, drawed_name),
      bowl' = bowl.exclude(Set(drawed_name)),
    }
  }

  action step = all {
    bowl.size() > 0,
    nondet picker = participants.filter(participant => not(participant.in(person_to_gift.keys()))).oneOf()
    draw_name(picker)
  }

  val everyone_gets_a_santa = bowl.size() == 0 implies participants == person_to_gift.mapValuesSet()

  val no_person_gets_themself =  person_to_gift.keys().forall(participant =>
    person_to_gift.get(participant) != participant
  )
}

module quint_team_secret_santa {
  import secret_santa(participants = Set("Gabriela", "Igor", "Jure", "Shon", "Thomas")).*
}

// Below here, more complex things that might be interesting for a tutorial.
// This is not in the state I want it to be yet, which should be:
//   1. the version with redraw should show that, if the last person picks themself, theres's no solution
//     - Additionally, it would be nice to show that you can find information about who is your secret santa in this method.
//       That is, if you pick yourself and redraw, but there is only one person after you, you know that person will be your (non)secret santa.
//   2. the version with reset should show that, eventually, the game is valid (no one gets themselves)

module secret_santa_with_redraw {
  // When a participant draws themself, they put their name back and draw again

  import basicSpells.* from "../../spells/basicSpells"
  import secret_santa.*
  export secret_santa.*

  action step_with_redraw =
    val participants_who_got_themselves = person_to_gift.keys().filter(participant => person_to_gift.get(participant) == participant)
    if (participants_who_got_themselves.size() > 0) {
      nondet participant = participants_who_got_themselves.oneOf()
      all {
        bowl' = bowl.union(Set(participant)),
        person_to_gift' = person_to_gift.mapRemove(participant),
      }
    } else {
      step
    }

  val inv = bowl.size() == 0 implies no_person_gets_themself
}

module secret_santa_with_reset {
// When a participant draws themself, everyone returns the papers and the process starts over
  import secret_santa.*
  export secret_santa.*

  action step_with_reset =
    if (person_to_gift.keys().exists(participant => person_to_gift.get(participant) == participant)) {
      init
    } else {
      step
    }

  val inv = bowl.size() == 0 implies no_person_gets_themself
}

// module quint_team_secret_santa {
//   import secret_santa_with_redraw(participants = Set("Gabriela", "Igor", "Jure", "Shon", "Thomas")).*
// }

// module quint_team_secret_santa {
//   import secret_santa_with_reset(participants = Set("Gabriela", "Igor", "Jure", "Shon", "Thomas")).*
// }
