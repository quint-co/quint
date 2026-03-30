// A deterministic counter that cycles 0 -> 1 -> 2 -> 0 -> ...
// Used to test the leadsTo temporal operator with TLC.
//
// Note: in TLA+ semantics, any action can be followed by infinite stuttering.
// Temporal properties using leadsTo therefore need fairness to be meaningful:
// without fairness, TLC finds a counterexample where the system stutters forever.
// The `step.weakFair(vars) implies` pattern embeds fairness in the property.
module tlcLeadsTo {
  var n: int

  action init = n' = 0
  action step = n' = (n + 1) % 3

  val vars = n

  // Holds: with fairness, n cycles 0->1->2->0 so n==0 always eventually reaches n==2
  temporal zeroLeadsToTwo = step.weakFair(vars) implies (n == 0 leadsTo n == 2)

  // Holds: with fairness, every value eventually cycles back to 0
  temporal alwaysEventuallyZero = step.weakFair(vars) implies always(eventually(n == 0))

  // Does NOT hold: n is always in {0,1,2}, never reaches 5
  temporal zeroLeadsToFive = step.weakFair(vars) implies (n == 0 leadsTo n == 5)

  // Does NOT hold: without fairness, TLC finds an infinite stuttering path
  // (e.g. n=0 -> n=1 -> stutter forever, never reaching n=2)
  temporal zeroLeadsToTwoNoFairness = n == 0 leadsTo n == 2
}
