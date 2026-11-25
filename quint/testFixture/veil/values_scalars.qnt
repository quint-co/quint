module values_scalars {
  type Msg = Ping(int) | Pong | Note({ who: str, n: int })
  var n: int
  var b: bool
  var r: { who: str, n: int }
  var t: (int, str)
  var l: List[int]
  action init = all { n' = -1, b' = false, r' = { who: "a", n: 2 }, t' = (3, "x"), l' = [1, 2] }
  action step = all { n' = n + 1, b' = not(b), r' = r.with("n", r.n + 1), t' = (t._1 + 1, t._2), l' = l.append(n) }
  val small = n < 0
}
