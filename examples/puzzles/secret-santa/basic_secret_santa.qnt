module secret_santa {
  import basicSpells.* from "../../spells/basicSpells"

  const participants: Set[str]

  /// get(recipient_for_santa, S) is the recipient for secret santa S
  var recipient_for_santa: str -> str

  /// the bowl of participants, containing a paper piece for each participant name
  var bowl: Set[str]

  val santas = recipient_for_santa.keys()
  val recipients = participants.map(p => recipient_for_santa.get(p))

  /// The initial state
  action init = all {
    recipient_for_santa' = Map(), // No santas or recipients
    bowl' = participants,         // Every participant's name in the bowl
  }

  action draw_recipient(santa: str): bool = {
    nondet recipient = oneOf(bowl)
    all {
      recipient_for_santa' = put(recipient_for_santa, santa, recipient),
      bowl' = bowl.setRemove(recipient),
    }
  }

  action step = all {
    bowl.size() > 0,
    nondet next_santa = participants.exclude(santas).oneOf()
    draw_recipient(next_santa)
  }

  val everyone_gets_a_santa = (bowl.size() == 0).implies(participants == recipients)

  val no_person_is_self_santa = santas.forall(person =>
    get(recipient_for_santa, person) != person
  )

  val invariant = everyone_gets_a_santa and no_person_is_self_santa
}
