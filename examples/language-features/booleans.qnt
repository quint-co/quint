// basic boolean builtin operators
module booleans {
  var b: bool

  action Init = {
    b' = true
  }

  action Next = all {
    b.or(true),
    not(b.and(false)),
    b.implies(b),
    b.iff(b),
    b == b,
    b != not(b),
    b' = not(b)
  }
}
