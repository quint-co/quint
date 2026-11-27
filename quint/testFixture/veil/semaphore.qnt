// A lock that any set of processes take, whose `mutex` is true but not inductive on its own.
module semaphore {
  const procs: Set[str]

  var critical: Set[str]
  var free: bool

  action init = all {
    critical' = Set(),
    free' = true,
  }

  action enter(p) = all {
    free,
    critical' = critical.union(Set(p)),
    free' = false,
  }

  action leave(p) = all {
    critical.contains(p),
    critical' = critical.exclude(Set(p)),
    free' = true,
  }

  action step = {
    nondet p = procs.oneOf()
    any { enter(p), leave(p) }
  }

  // At most one process is in its critical section: true, but not inductive on its own.
  val mutex = critical.forall(p => critical.forall(q => p == q))

  // No process is in its critical section while the lock is free.
  val freeWhenEmpty = critical.forall(p => not(free))
}
