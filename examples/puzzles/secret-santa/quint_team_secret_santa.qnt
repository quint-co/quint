module quint_team_secret_santa {
  import basicSpells.* from "../../spells/basicSpells"
  import secret_santa_with_redraw(participants = Set("Gabriela", "Igor", "Jure", "Shon", "Thomas")).* from "./secret_santa_with_redraw"

  action assign_santa_and_confirm(santa, recipient) = all {
        recipient_for_santa' = put(recipient_for_santa, santa, recipient),
        bowl' = bowl.setRemove(recipient),
        last_draw' = { participant: santa, confirmed: santa != recipient }
  }

  run deadlock_Test = init_with_confirmation
    .then(assign_santa_and_confirm("Igor", "Jure"))
    .then(assign_santa_and_confirm("Thomas", "Shon"))
    .then(assign_santa_and_confirm("Jure", "Igor"))
    .then(assign_santa_and_confirm("Shon", "Thomas"))
    .then(step_with_confirmation)
    .expect(bowl == Set() implies no_person_is_self_santa)

  // run finding_out_my_santa_Test = init_redraw
  //   .then(assign_santa_and_confirm("Igor", "Jure"))
  //   .then(assign_santa_and_confirm("Thomas", "Shon"))
  //   .then(assign_santa_and_confirm("Jure", "Igor"))
  //   .then(assign_santa_and_confirm("Gabriela", "Gabriela"))
  //   .then(redraw("Gabriela"))
  //   .then(draw_name("Shon"))
  //   .expect(santa_for.get("Shon") == "Gabriela")

}
