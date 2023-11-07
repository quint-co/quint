/// A few handy small models that are good for debugging and inspection
module TendermintModels {
  import TendermintTest(
    Corr = Set("p1", "p2", "p3"),
    Faulty = Set("p4"),
    N = 4,
    T = 1,
    ValidValues = Set("v0", "v1"),
    InvalidValues = Set("v2"),
    MaxRound = 4,
    Proposer = Map(0 -> "p1", 1 -> "p2", 2 -> "p3", 3 -> "p4", 4 -> "p1")
  ) as n4_f1 from "./TendermintTest"

  import TendermintTest(
    Corr = Set("p1", "p2"),
    Faulty = Set("p3", "p4"),
    N = 4,
    T = 1,
    ValidValues = Set("v0", "v1"),
    InvalidValues = Set("v2"),
    MaxRound = 4,
    Proposer = Map(0 -> "p1", 1 -> "p2", 2 -> "p3", 3 -> "p4", 4 -> "p1")
  ) as n4_f2 from "./TendermintTest"

  import TendermintTest(
    Corr = Set("p1", "p2", "p3"),
    Faulty = Set("p4", "p5"),
    N = 5,
    T = 1,
    ValidValues = Set("v0", "v1"),
    InvalidValues = Set("v2"),
    MaxRound = 4,
    Proposer = Map(0 -> "p1", 1 -> "p2", 2 -> "p3", 3 -> "p4", 4 -> "p1")
  ) as n5_f2 from "./TendermintTest"
}
