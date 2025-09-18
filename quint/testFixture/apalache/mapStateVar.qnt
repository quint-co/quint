module mapStateVar {
  pure val Keys = Set("a", "b", "c")

  var data: str -> int

  action init = {
    data' = Map()
  }

  action step = {
    nondet key = Keys.oneOf()
    data' = data.put(key, 42)
  }

  // NOTE: Violates after all `Keys` have been added to `data`.
  val never_full = data.keys().size() < Keys.size()
}
