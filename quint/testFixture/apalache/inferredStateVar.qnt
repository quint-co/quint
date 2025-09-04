module base {
  type Generic[other] = { foo: int | other }
  type Uses[s] = { ctx: Generic[s] }

  var s: Uses[s]
}

module inferredStateVar {
  import base.*
  type Fields = { bar: Set[int] }
  type Concrete = Generic[Fields]
  type U = Uses[Concrete]

  pure def aux(s) = { foo: s, bar: Set() }
  pure def aux2(c: U): U = if (c.ctx.bar.size() > 0) { ctx: c.ctx } else { ctx: c.ctx }

  // By init, we still don't know the type of the bar field
  action init = s' = { ctx: aux(1) }
  // By step, we learn the full type
  action step = s' = aux2(s)
}
