module integers {
  var n: int

  action Init = {
    n' = 0
  }

  action Next = all {
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
