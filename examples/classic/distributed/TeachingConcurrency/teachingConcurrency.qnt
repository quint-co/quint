// -*- mode: Bluespec; -*-
/**
 * A simple algorithm from Lamport's "Teaching Concurrency" paper:
 * https://lamport.azurewebsites.net/pubs/teaching-concurrency.pdf
 *
 * Lamport writes:
 * Invariance is the key to understanding concurrent systems, but few en-
 * gineers or computer scientists have learned to think in terms of invariants.
 * Here is a simple example. Consider N processes numbered from 0 through
 * N − 1 in which each process i executes
 *   x [i] : = 1;
 *   y[i] : = x [(i − 1) mod N ]
 * and stops, where each x [i] initially equals 0. (The reads and writes of
 * each x [i] are assumed to be atomic.) This algorithm satisfies the following
 * property: after every process has stopped, y[i] equals 1 for at least one
 * process i. It is easy to see that the algorithm satisfies this property; the last
 * process i to write y[i] must set it to 1. But that process doesn’t set y[i] to 1
 * because it was the last process to write y. What a process does depends only
 * on the current state, not on what processes wrote before it. The algorithm
 * satisfies this property because it maintains an inductive invariant
 *
 * Run in verifier with:
 * quint verify teachingConcurrency.qnt --invariant yContainsOne --inductive-invariant inv
 */

// An example instance of the algorithm with N=5.
module teachingConcurrency {
  import teachingConcurrencyN(NUM_PROCS=5).*
}

// A concurrency algorithm providing a basic form of mutual
// exclusion. For details and proofs see section 7.2 of
// https://lamport.azurewebsites.net/tla/proving-safety.pdf
module teachingConcurrencyN {
  import basicSpells.* from "../../../spells/basicSpells"

  // N processes (numbered from 0 to N-1).
  const NUM_PROCS: int

  pure val PROCS = 0.to(NUM_PROCS - 1)

  type Stage = Init | Processing | Done

  var x: int -> int
  var y: int -> int
  var stages: int -> Stage

  action init = all {
    x' = PROCS.mapBy(_ => 0),
    y' = PROCS.mapBy(_ => 0),
    stages' = PROCS.mapBy(_ => Init),
  }

  action step = {
    nondet p = PROCS.oneOf()
    any {
      all {
        stages.get(p) == Init,
        x' = x.set(p, 1),
        y' = y,
        stages' = stages.set(p, Processing),
      },
      all {
        stages.get(p) == Processing,
        x' = x,
        y' = y.set(p, x.get((p - 1) % NUM_PROCS)),
        stages' = stages.set(p, Done),
      },
      all {
        x' = x,
        y' = y,
        stages' = stages,
      },
    }
  }

  // Correctness invariant: (after every process has
  // stopped) y[i] == 1 for at least one process.
  val yContainsOne = {
    stages.values() == Set(Done) implies y.values().contains(1)
  }

  val typeOK = and {
    x.in(setOfMaps(PROCS, Set(0,1))),
    y.in(setOfMaps(PROCS, Set(0,1))),
    stages.in(setOfMaps(PROCS, Set(Init, Processing, Done))),
  }

  val inv = and {
    typeOK,
    PROCS.forall(p => stages.get(p) != Init implies x.get(p) == 1),
    yContainsOne
  }

  // Termination invariant: all processes have stopped
  // (i.e. none is pending scheduling).
  val termination = {
    stages.values() == Set(Done)
  }

  temporal correct = eventually(termination and yContainsOne)
}
