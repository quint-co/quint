// A token passes between nodes, and `finish` fires only when no node holds it, which never happens. The
// strengthening that `neverStopped` needs, that some node holds the token, is existential.
module token {
  const nodes: Set[str]
  assume someNode = nodes.exists(n => n == n)

  var holders: Set[str]
  var stopped: bool

  action init = all {
    holders' = nodes,
    stopped' = false,
  }

  action pass(n: str, m: str): bool = all {
    holders.contains(n),
    holders' = holders.exclude(Set(n)).union(Set(m)),
    stopped' = stopped,
  }

  action finish = all {
    nodes.forall(n => not(holders.contains(n))),
    holders' = holders,
    stopped' = true,
  }

  action step = any {
    nondet n = nodes.oneOf()
    nondet m = nodes.oneOf()
    pass(n, m),
    finish,
  }

  val neverStopped = not(stopped)
}
