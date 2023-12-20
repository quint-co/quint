module secret_santa_with_redraw {
  // When a participant draws themself, they put their name back and draw again

  import basicSpells.* from "../../spells/basicSpells"
  import commonSpells.* from "../../spells/commonSpells"
  import secret_santa as B from "./basic_secret_santa"
  import secret_santa_with_confirmation.* from "./secret_santa_with_confirmation"
  export secret_santa_with_confirmation.*

  action redraw(participant: str): bool = {
    nondet new_name = B::bowl.oneOf()
    all {
      B::bowl' = B::bowl.exclude(Set(new_name)).union(Set(participant)),
      B::recipient_for_santa' = B::recipient_for_santa.put(participant, new_name),
      last_draw' = { participant: participant, confirmed: new_name != participant }
    }
  }

  action step_with_confirmation =
    if (last_draw.confirmed) all {
      step
    } else all {
      bowl != Set(),
      redraw(last_draw.participant),
      memorize(last_draw.participant),
    }


  val inv = (bowl.size() == 0 and last_draw.confirmed) implies B::no_person_is_self_santa


  // We need fairness for this to work
  temporal success = always(eventually(B::no_person_is_self_santa))

  // I can say something like: "Also, this doesn't really work if blabla, but you'd need a temporal property to explore that scenario"
}
