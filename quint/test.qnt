module test {
  var x: int

  action init = {
    x' = 0
  }

  action step = {
    x' = x + 1
  }
}
