// -*- mode: Bluespec; -*-
/**
 * A simple mutex definition where two processes can increment a shared counter.
 *
 * Based on [1] and [2].
 *
 * [1]: https://www.hillelwayne.com/post/refinement/
 * [2]: https://lamport.azurewebsites.net/pubs/teaching-concurrency.pdf
 *
 * Run in verifier with:
 *   quint verify mutex.qnt --invariant=correctness --inductive-invariant=inv
 */
module mutex {
  type ProcessID = str
  type Stage = Start | Incrementing | Done
  type LockState = Free | Taken(ProcessID)

  var counter: int
  var lock: LockState
  var local_memory: ProcessID -> { tmp: int, stage: Stage }

  pure val processes = Set("p1", "p2")

  action aquire_lock(p) = all {
    // We assume we can acquire the lock in one atomic step.
    lock == Free,
    lock' = Taken(p),
  }

  action release_lock(p) = all {
    lock == Taken(p),
    lock' = Free,
  }

  action get_counter(p) = all {
    local_memory.get(p).stage == Start,
    local_memory' = local_memory.set(p, { stage: Incrementing, tmp: counter }),
    // This is read-only, the counter is not modified here.
    counter' = counter,
  }

  action increment_counter(p) = all {
    local_memory.get(p).stage == Incrementing,
    local_memory' = local_memory.set(p, { stage: Done, tmp: 0 }),
    // Write to the counter (without reading it, as we assume reading and
    // writing cannot be done in the same step - otherwise we wouldn't need a
    // lock in the first place).
    counter' = local_memory.get(p).tmp + 1,
  }

  action init = all {
    local_memory' = processes.mapBy(_ => { tmp: 0, stage: Start }),
    counter' = 0,
    lock' = Free,
  }

  action step = {
    nondet process = processes.oneOf()
    any {
      all { get_counter(process), aquire_lock(process) },
      all { increment_counter(process), release_lock(process) },
    }
  }

  /// Ranges from which to pick values, used for the inductive invariant.
  val typeOK = and {
    counter.in(Int),
    lock.in(Set(Free).union(processes.map(p => Taken(p)))),
    local_memory.in(
      setOfMaps(processes, tuples(0.to(2), Set(Start, Incrementing, Done))
        .map(((tmp, stage)) => { tmp: tmp, stage: stage })
      )
    ),
  }

  /// Inductive invariant
  val inv = and {
    typeOK,
    counter == processes.filter(p => local_memory.get(p).stage == Done).size(),
    processes.forall(p => {
      local_memory.get(p).stage == Incrementing
        implies (lock == Taken(p) and local_memory.get(p).tmp == counter)
    }),
  }

  /// Ordinary invariant. Check it using the inductive invariant:
  ///   quint verify mutex.qnt --invariant=correctness --inductive-invariant=inv
  /// This is possible because the inductive invariant implies the ordinary invariant.
  /// You can see why by inspecting the second predicate in `inv`.
  val correctness =
    processes.forall(p => local_memory.get(p).stage == Done)
      implies counter == processes.size()
}
