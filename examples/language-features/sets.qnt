// -*- mode: Bluespec; -*-
module sets {
  var n: int
  var s: Set[int]

  action Init = all {
    n' = 0,
    s' = Set(0)
  }

  action Next = all {
    n' = n + 1,
    s' = s.union(Set(n + 1)),
    s.exists(x => x == n),
    s.forall(x => x >= 0),
    n.in(s),
    s.contains(n),
    (n + 1).notin(s),
    (n + 1).in(union(s, Set(n + 1))),
    Set(n) == s.intersect(Set(n)),
    n.notin(s.exclude(Set(n))),
    Set(n).subseteq(s),
    Set() == s.filter(x => x > n),
    s == s.map(x => x),
    n <= s.fold(0, (x, y) => x + y),
    s.in(powerset(s)),
    s == flatten(Set(s)),
    chooseSome(s).in(s),
    s.isFinite(),
    n + 1 == size(s),
    Set(0, 1, 2, 3) == 0.to(3),
  }

}
