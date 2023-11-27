module _1041compileConst {
  const N: int
  var x: int

  action init = { x' = N }

  action step = { x' = x - 1 }
}