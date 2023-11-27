module maps {
  var n: int
  var m: int -> int

  action init = all {
    n' = 0,
    m' = Map((0, 1)),
  }

  action step = {
    val nextN = m.get(n)
    val mKeys = m.keys()
    all {
        n' = nextN,
        m' = m.put(nextN, nextN + 1),
        mKeys.mapBy(x => x + 1) == m,
        mKeys.map(x => (x, x + 1)).setToMap() == m,
        setOfMaps(mKeys, mKeys.map(x => x + 1)).contains(m),
        m.set(n, n).get(n) == n,
        m.setBy(n, x => x + 1).get(n) == nextN + 1,
    }
  }}
