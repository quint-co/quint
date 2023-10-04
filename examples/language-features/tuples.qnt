module tuples {
  var myTup: (int, str)

  def combineTuples(t1, t2) = (t1._1, t2._2)
  val combined = combineTuples((true, 1, 2), (false, 2, 2))

  action init = myTup' = (0, "hello")

  action step = myTup' = combineTuples(myTup, (1, "world"))

  // Unpacking
  pure val a = Set((1, 4), (2, 3)).map( ((p, g)) => p + g)
  pure val s = Set(1, 2, 3)
  pure val m = tuples(s, s).mapBy( ((j, k)) => j+k )
  pure val n = tuples(s, s, s).mapBy( ((j, k, i)) => j+k+i )
}
