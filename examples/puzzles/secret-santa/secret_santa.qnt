module secret_santa {
  const names: Set[str]

  /// giftees.get(A) == B if A is B's secret santa
  var giftees: str -> str

  /// the bowl of names, containg a paper piece for each participant with their name
  var bowl: Set[str]

  action init = all {
    giftees' = Map(),
    bowl' = names,
  }

  action step = all {
    bowl.size() > 0,
    nondet picker = names.filter(name => not(giftees.keys().contains(name))).oneOf()
    nondet giftee = bowl.oneOf()
    all {
      giftees' = giftees.put(picker, giftee),
      bowl' = bowl.exclude(Set(giftee)),
    }
  }

  val everyone_gets_a_santa = bowl.size() == 0 implies (names == giftees.keys().map(k => giftees.get(k)))

  val no_person_gets_themself = names.forall(name =>
    giftees.keys().contains(name) implies giftees.get(name) != name
  )
}

module quint_team_secret_santa {
  import secret_santa(names = Set("Gabriela", "Igor", "Jure", "Shon", "Thomas")).*
}
