module base {
  type Generic[other] = { foo: int | other }
  type Uses[s] = { ctx: Generic[s] }

  var s: Uses[s]
}

module polyStateVar {
  import base.*
  type Fields = { bar: bool }
  type Concrete = Generic[Fields]
  type U = Uses[Concrete]

  pure def aux(s: Concrete): Concrete = if (s.bar) { ...s, foo: s.foo + 1 } else s
  pure def aux2(c: U): U = if (c.ctx.bar) { ctx: { foo: 1, bar: true } } else { ctx: { foo: 2, bar: true } }

  action init = s' = aux2({ ctx: { foo: 1, bar: true } })
  action step = s' = { ctx: aux(s.ctx) }
}
