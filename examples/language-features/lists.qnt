module lists {
  var n: int
  var l: List[int]

  action init = all {
    n' = 0,
    l' = List(0),
  }

  def test(x) = x < 1

  action step = all {
    n' = n + 1,
    l' = l.append(n + 1),
    List(1, 2, 3).length() + l.length() == List(1, 2, 3).concat(l).length(),
    0 == l.head(),
    l.tail().length() == n,
    n == l.nth(n),
    List().indices() == Set(),
    { val idxs = l.indices()
      val elems = l.foldl(Set(), (acc, j) => acc.union(Set(j)))
      idxs == elems },
    l.replaceAt(0, n).head() == n,
    l.slice(1, l.length()) == l.tail(),
    // Not currently supported by Apalache
    // <unknown>: Input error (see the manual): Expected a constant integer expression. Found: n E@10:54:45.506
    // range(0, n) == l
    range(0, 3) == List(0, 1, 2),
    l.select(x => x < 1) == List(0),
    l.select(test) == List(0),
    (l.foldl(Set(), (acc, x) => acc.union(Set(x))).size()) == n + 1,
  }
}
