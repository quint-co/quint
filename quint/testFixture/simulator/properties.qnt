// Every trace of this spec counts from 0 to 4 and stays at 4, so `quint run`
// and `quint verify` report the same properties whatever the seed or backend.
module properties {
  var n: int

  action init = n' = 0
  action step = if (n < 4) n' = n + 1 else n' = n

  invariant nonNegative = n >= 0
  invariant belowFive = n < 5
  observation two = n == 2
  observation negative = n < 0
}

// The definitions that `import properties.*` brings in are collected too, and
// `belowTwo` is violated in the state where `two` is first reached.
module importsProperties {
  import properties.*

  invariant belowTwo = n < 2
}
