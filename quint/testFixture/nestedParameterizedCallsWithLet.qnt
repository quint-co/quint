module test {
  var x: bool

  pure def p(v: i, f: (i) => bool): bool = {
    val foo = v
    f(foo)
  }

  pure def a(v: { a_value: int }): bool =
    p(v, (x) => x.a_value > 0 and b({ b_value: v.a_value }))

  pure def b(v: { b_value: int }): bool =
    p(v, (x) => x.b_value > 0)

  action init = all { x' = a({ a_value: 1 })  }
  action step = all { x' = b({ b_value: 1 }) }
}
