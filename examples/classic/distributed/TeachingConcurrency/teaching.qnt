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
 *   x[i] : = 1;
 *   y[i] : = x[(i − 1) mod N]
 * and stops, where each x[i] initially equals 0. (The reads and writes of
 * each x[i] are assumed to be atomic.) This algorithm satisfies the following
 * property: after every process has stopped, y[i] equals 1 for at least one
 * process i. It is easy to see that the algorithm satisfies this property; the last
 * process i to write y[i] must set it to 1. But that process doesn’t set y[i] to 1
 * because it was the last process to write y. What a process does depends only
 * on the current state, not on what processes wrote before it. The algorithm
 * satisfies this property because it maintains an inductive invariant
 *
 * Run in verifier with:
 *   quint verify teaching.qnt --inductive-invariant IndInv --invariant correctness
 */
module teaching {
  type Location =
    | Start
    | Middle
    | End

  type LocalState = {
    x: int,
    y: int,
    pc: Location,
  }

  pure def main(s: LocalState, prev: LocalState): LocalState =
    match s.pc {
      | Start =>  { ...s, x: 1, pc: Middle }
      | Middle => { ...s, y: prev.x, pc: End }
      | End => s
    }

  val d = 10
  val n = 5
  val domain = 0.to(d)
  val processes = 0.to(n-1)

  var state: int -> LocalState

  action init =
    nondet initial = processes.setOfMaps(domain).oneOf()
    state' = processes.mapBy(i =>
      { x: 0, y: initial.get(i), pc: Start }
    )

  action step =
    val alive = processes.filter(x => state.get(x).pc != End)
    if (alive != Set())
      nondet i = alive.oneOf()
      val next_state = main(state.get(i), state.get((i + 1) % n))
      state' = state.set(i, next_state)
    else
      state' = state


  val correctness =
    processes.forall(i => state.get(i).pc == End)
      implies
        processes.exists(i => state.get(i).y == 1)

  def TypeOK =
    val local_states = tuples(Set(0, 1), domain, Set(Start, Middle, End)).map(t => { x: t._1, y: t._2, pc: t._3 })
    state.in(processes.setOfMaps(local_states))

  def IndInv = and {
    TypeOK,
    correctness,
    processes.forall(i =>
      state.get(i).pc != Start implies state.get(i).x == 1
    )
  }
}
