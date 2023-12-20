module secret_santa_with_confirmation {
  import basicSpells.* from "../../spells/basicSpells"
  import secret_santa as B from "./basic_secret_santa"

  /// whether the last participant confimed they didn't picked themselves
  var last_draw: { participant: str, confirmed: bool }

  /// Who had alredy drawn a paper when they got themselves. This way, I know
  /// that none of those people can be the santa of the person who is drawing.
  var gabrielas_memory: str -> Set[str]

  action init = all {
    B::recipient_for_santa' = Map(),
    B::bowl' = B::participants,
    last_draw' = { participant: "none", confirmed: true },
    gabrielas_memory' = Map(),
  }

  action memorize(participant) = {
    gabrielas_memory' = put(gabrielas_memory, participant, B::santas)
  }

  action step = all {
    B::bowl.size() > 0,
    nondet santa = B::participants.filter(participant => not(participant.in(B::recipient_for_santa.keys()))).oneOf()
    nondet recipient = B::bowl.oneOf()
    all {
      B::recipient_for_santa' = put(B::recipient_for_santa, santa, recipient),
      B::bowl' = B::bowl.setRemove(recipient),
      last_draw' = { participant: santa, confirmed: santa != recipient },
      gabrielas_memory' = gabrielas_memory,
    }
  }

  type OptionalString = Some(str) | None
  pure def toElem(s: Set[str]): OptionalString = {
    if (s.size() != 1) {
      None
    } else {
      s.fold(None, (_, elem) => Some(elem))
    }
  }

  def find_out_santa_for(recepient: str): OptionalString = {
    if (gabrielas_memory.has(recepient)) {
      val possible_santas = B::participants.exclude(gabrielas_memory.get(recepient))
      possible_santas.toElem()
    } else {
      None
    }
  }

  val gabriela_finds_out_a_santa = B::participants.exists(participant => {
    match find_out_santa_for(participant) {
      | Some(_) => true
      | None => false
    }
  })

  val safe_from_memorizers = not(gabriela_finds_out_a_santa)

}
