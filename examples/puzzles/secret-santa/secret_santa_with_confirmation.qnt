module secret_santa_with_confirmation {
  import secret_santa.* from "./basic_secret_santa"
  export secret_santa.*

  // whether the last participant confimed they didn't picked themselves
  var last_draw: { participant: str, confirmed: bool }

  action init_with_confirmation = all {
    recipient_for_santa' = Map(),
    bowl' = participants,
    last_draw' = { participant: "none", confirmed: false }
  }
}
