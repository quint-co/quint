module Tuples {
  var myTup: (int, str)

  def combineTuples(t1, t2) = (t1._1, t2._2)
  val combined = combineTuples((true, 1, 2), (false, 2, 2))

  action Init = myTup' = (0, "hello")

  action Next = myTup' = combineTuples(myTup, (1, "world"))

  // Unpacking
  var x: int

  def a(tup) = Set(tup, (x, 4)).map((p, g) => p + g)
  def b(tup, f) = Set(tup, (x, 4)).map(f)
  def c(tup, f) = Set(tup).map(f)
  def func(p, g) = p
  val test = c((1, 2), func)
}
