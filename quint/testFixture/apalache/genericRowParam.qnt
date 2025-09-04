module base {
  type Generic[other] = { foo: int | other }

  var s: Generic[other]
}

module genericRowParam {
  import base.*
  type Concrete = Generic[{ bar: bool }]

  action init = s' = { foo: 1, bar: true }
  action step = s' = if (s.bar) { ...s, foo: s.foo + 1 } else s
}
