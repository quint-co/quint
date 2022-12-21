// a module that contains constants
module withConsts {
  // an inconsistent tag naming in disjoint union
  const MyUnion:
    | { tag: "circle", radius: int }
    | { kind: "rectangle", width: int, height: int }
}
