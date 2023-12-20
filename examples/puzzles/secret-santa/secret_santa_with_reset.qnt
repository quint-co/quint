module secret_santa_with_reset {
  // When a participant draws themself, everyone returns the papers and the process starts over
  import secret_santa as B from "./basic_secret_santa"
  import secret_santa_with_confirmation.* from "./secret_santa_with_confirmation"
  export secret_santa_with_confirmation.*

  action step_with_reset =
    if (last_draw.confirmed) {
      step
    } else {
      init
    }

  val inv = B::bowl.size() == 0 implies B::no_person_is_self_santa
}
