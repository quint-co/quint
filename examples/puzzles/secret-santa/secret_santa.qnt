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

  val no_person_gets_themself = participants.forall(participant =>
    participant.in(person_to_gift.keys()) implies person_to_gift.get(participant) != participant
  )
}

module quint_team_secret_santa {
  import secret_santa(participants = Set("Gabriela", "Igor", "Jure", "Shon", "Thomas")).*
}
