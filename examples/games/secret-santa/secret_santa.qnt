// -*- mode: Bluespec; -*-
/**
 * A secret santa spec, in celebration of the 2023 end-of-year holidays.
 * This is accompanied by a blogpost! See [1].
 *
 * [1]: https://github.com/informalsystems/quint/tree/main/tutorials/blogpost0-secretsanta/secret_santa.org
 *
 * Gabriela Moreira, Informal Systems, 2023
 */

module secret_santa {
  import basicSpells.* from "../../spells/basicSpells"

  const participants: Set[str]

  /// A map from santas to their recipients. get(recipient_for_santa, S) is the recipient for secret santa S
  var recipient_for_santa: str -> str

  /// The bowl of participants, containing a paper piece for each participant's name
  var bowl: Set[str]

  /// Information about the last draw
  type LastDraw =
    | Self(str) // The name of someone who drew themself
    | Ok        // The draw was Ok

  var last_draw: LastDraw

  /// Who had already drawn a paper when someone got themself. This way, I know
  /// that none of those people can be the santa of the person who is drawing.
  var gabrielas_memory: str -> Set[str]

  /// The initial state
  action init = all {
    recipient_for_santa' = Map(), // No santas or recipients
    bowl' = participants,         // Every participant's name in the bowl
    last_draw' = Ok,              // if no oe has drawn yet, no one has drawn themself
    gabrielas_memory' = Map(),
  }

  val santas = recipient_for_santa.keys()
  val recipients = recipient_for_santa.values()

  action draw_recipient(santa: str): bool = {
    nondet recipient = oneOf(bowl)
    all {
      recipient_for_santa' = put(recipient_for_santa, santa, recipient),
      bowl' = bowl.setRemove(recipient),
      last_draw' = if (santa == recipient) Self(santa) else Ok,
      gabrielas_memory' = gabrielas_memory, // Nothing to memorize, so the memory stays the same
    }
  }

  action stutter = all {
    recipient_for_santa' = recipient_for_santa,
    bowl' = bowl,
    last_draw' = last_draw,
    gabrielas_memory' = gabrielas_memory,
  }

  action step =
    if (empty(bowl)) {
      stutter
    } else {
      nondet next_santa = participants.exclude(santas).oneOf()
      draw_recipient(next_santa)
    }

  action redraw(participant: str): bool = {
    // Draw from the current bowl, without having first put paper back
    nondet new_recipient = oneOf(bowl)
    all {
      new_recipient != participant, // The action requires this precondition
      // Remove the new paper from the bowl, and then put the old one back in
      bowl' = bowl.exclude(Set(new_recipient)).union(Set(participant)),
      recipient_for_santa' = recipient_for_santa.put(participant, new_recipient),
      last_draw' = Ok // We know this is OK due to the precondition
    }
  }

  // Store current santas (people who have already drawn) on a participant's key, meaning that they can't be that participant's santa
  action memorize(participant) = {
    gabrielas_memory' = put(gabrielas_memory, participant, santas)
  }

  action step_with_redraw =
    match last_draw {
      | Ok =>
          step // All good, continue as usual
      | Self(participant) => all {
          not(empty(bowl)),
          redraw(participant),
          memorize(participant),
        }
    }

  action step_with_reset =
    if (last_draw == Ok) {
      step
    } else {
      init
    }

  /* PROPERTIES */

  val everyone_gets_a_santa = empty(bowl) implies (participants == recipients)

  val no_person_is_self_santa = santas.forall(santa =>
    get(recipient_for_santa, santa) != santa
  )

  val inv = (last_draw == Ok) implies no_person_is_self_santa

  /// true iff Gabriela can find out who is a santa for someone.
  /// That is, if exists a participant where find_out_a_santa_for participant is Some()
  val gabriela_finds_out_a_santa = participants.exists(participant => {
    if (gabrielas_memory.has(participant)) {
      val possible_santas = participants.exclude(gabrielas_memory.get(participant))
      possible_santas.size() == 1
    } else {
      false
    }
  })

  val safe_from_memorizers = not(gabriela_finds_out_a_santa)
}

module quint_team_secret_santa {
  import secret_santa(participants = Set("Gabriela", "Igor", "Jure", "Shon", "Thomas")).*
}
