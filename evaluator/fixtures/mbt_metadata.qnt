module mbtMetadata {
  // Every run of this spec dead-ends: once n == 2, both picks of z disable
  // incBy, so step evaluates to false

  var n: int

  def inv = n >= 0

  action init = n' = 0

  action incBy(z: int): bool = all {
    n + z <= 2,
    n' = n + z,
  }

  action step = {
    nondet z = 1.to(2).oneOf()
    any {
      incBy(z),
    }
  }
}
