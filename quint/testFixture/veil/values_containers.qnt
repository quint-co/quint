module values_containers {
  type Msg = Ping(int) | Pong | Note({ who: str, n: int })
  var n: int
  var m: str -> int
  var s: Set[Msg]
  var e: Msg
  action init = all { n' = -1, m' = Map("a" -> 1), s' = Set(Pong, Ping(4)), e' = Note({ who: "b", n: 5 }) }
  action step = all { n' = n + 1, m' = m.put("b", 2), s' = s.union(Set(Ping(n))), e' = Pong }
  val small = n < 0
}
