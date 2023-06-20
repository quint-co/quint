module integers {
  var n: int

  action init = {
    n' = 0
  }

  action step = all {
    n' = n + 1,
    n == n - 0,
    n == n * 1,
    n == n / 1,
    n == n.ipow(1),
    0 == n % n,
    0 == (-n) + n,
    n + 1 > n,
    n - 1 < n,
    n >= n,
    n <= n,
  }
}
