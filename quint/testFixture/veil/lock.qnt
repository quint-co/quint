// A lock that processes take in turn, whose `mutex` is true but not inductive on its own.
module lock {
  type Stage = Idle | Waiting | Critical
  type Lock = Free | HeldBy(str)

  pure val procs = Set("a", "b", "c")

  var stage: str -> { at: Stage, visits: int }
  var lock: Lock
  var entries: int

  action init = all {
    stage' = procs.mapBy(_ => { at: Idle, visits: 0 }),
    lock' = Free,
    entries' = 0,
  }

  action request(p) = all {
    stage.get(p).at == Idle,
    stage' = stage.set(p, { ...stage.get(p), at: Waiting }),
    lock' = lock,
    entries' = entries,
  }

  action enter(p) = all {
    stage.get(p).at == Waiting,
    lock == Free,
    stage' = stage.set(p, { at: Critical, visits: stage.get(p).visits + 1 }),
    lock' = HeldBy(p),
    entries' = entries + 1,
  }

  action leave(p) = all {
    lock == HeldBy(p),
    stage' = stage.set(p, { ...stage.get(p), at: Idle }),
    lock' = Free,
    entries' = entries,
  }

  action step = {
    nondet p = procs.oneOf()
    any { request(p), enter(p), leave(p) }
  }

  // At most one process is in its critical section: true, but not inductive on its own.
  val mutex = procs.filter(p => stage.get(p).at == Critical).size() <= 1

  // The lock is held by the process in its critical section.
  val holder = procs.forall(p => stage.get(p).at == Critical iff lock == HeldBy(p))

  invariant safe = and {
    stage.keys() == procs,
    mutex,
    holder,
    entries >= procs.filter(p => stage.get(p).visits > 0).size(),
  }

  // False: a process enters as often as it likes.
  val fewEntries = entries <= 1
}

// The lock, with `mutex` to check on its own, and the keys of `stage` that its reads rely on.
module lockMutexOnly {
  import lock.*

  val stageKeys = stage.keys() == procs
}
