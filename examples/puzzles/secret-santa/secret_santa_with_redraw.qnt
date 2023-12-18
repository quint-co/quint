module secret_santa_with_redraw {
  // When a participant draws themself, they put their name back and draw again

  import basicSpells.* from "../../spells/basicSpells"
  import secret_santa_with_confirmation.* from "./secret_santa_with_confirmation"
  export secret_santa_with_confirmation.*

  action redraw(participant: str): bool = {
    nondet new_name = bowl.oneOf()
    all {
      bowl' = bowl.exclude(Set(new_name)).union(Set(participant)),
      recipient_for_santa' = recipient_for_santa.set(participant, new_name),
      last_draw' = { participant: participant, confirmed: new_name != participant }
    }
  }

  action step_with_confirmation =
    if (last_draw.confirmed) all {
      bowl.size() > 0,
      nondet santa = participants.filter(participant => not(participant.in(recipient_for_santa.keys()))).oneOf()
      nondet recipient = bowl.oneOf()
      all {
        recipient_for_santa' = put(recipient_for_santa, santa, recipient),
        bowl' = bowl.setRemove(recipient),
        last_draw' = { participant: santa, confirmed: santa != recipient }
      }
    } else all {
      bowl != Set(),
      redraw(last_draw.participant)
    }


  val inv = (bowl.size() == 0 and last_draw.confirmed) implies no_person_is_self_santa

  // temporal problem =

  // We need fairness for this to work
  temporal success = always(bowl == Set() implies eventually(no_person_is_self_santa))

  // I can say something like: "Also, this doesn't really work if blabla, but you'd need a temporal property to explore that scenario"
}
