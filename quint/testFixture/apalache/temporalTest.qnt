// This spec defines a model to test temporal verification
module temporalTest {
  var n: int

  action init = n' = 1
  action step = n' = if (n == 5) 1 else n + 1
  def inv = n < 5

  temporal eventuallyZero = eventually(n == 0) // does NOT hold
  temporal eventuallyOne  = eventually(n == 1) // holds
  temporal eventuallyFive = eventually(n == 5) // holds
}
