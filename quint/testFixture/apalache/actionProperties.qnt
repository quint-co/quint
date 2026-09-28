/**
 * The examples of action properties from Hillel Wayne's "Action Properties"
 * (https://www.hillelwayne.com/post/action-properties/), in Quint.
 *
 * Each module corresponds to an example of the post. The original TLA+ is given
 * in a comment above each property. Properties whose name ends with `Violated`
 * are expected to be violated.
 *
 * Check with, e.g.:
 *   quint verify --backend tlc --main=intro --temporal=increasing actionProperties.qnt
 */

/// Introduction: a counter that only goes up
module intro {
  var x: int

  action init = x' = 1
  action step = all { x < 3, x' = x + 1 }

  // [][x' > x]_x
  temporal increasing = always((next(x) > x).orKeep(x))

  // [][x' > x + 1]_x
  temporal jumpsViolated = always((next(x) > x + 1).orKeep(x))

  // [][Next]_x: the next-state relation is an action property of the spec itself
  temporal nextHolds = always(step.orKeep(x))
}

/// Conditional properties
module conditional {
  var disabled: bool
  var x: int
  var y: int

  action init = all { disabled' = false, x' = 0, y' = 0 }
  // Machine actions keep Inv, World actions may break it (and ignore the kill switch)
  action Machine = all { not(disabled), x < 3, x' = x + 1, y' = x, disabled' = disabled }
  action World = all { x' = 5, y' = x, disabled' = disabled }
  action Toggle = all { disabled' = not(disabled), x' = x, y' = y }
  action step = any { Machine, World, Toggle }

  val vars = (disabled, x, y)
  val Inv = x <= 3

  // [][disabled => UNCHANGED x]_<<disabled, x>>
  temporal killSwitchViolated = always((disabled implies next(x) == x).orKeep((disabled, x)))

  // [][x' /= x => y' = x]_<<x, y>>
  temporal lockstep = always((next(x) != x implies next(y) == x).orKeep((x, y)))

  // [][Machine => Inv']_vars
  temporal machineKeepsInv = always((Machine implies next(Inv)).orKeep(vars))

  // [][World => Inv']_vars
  temporal worldKeepsInvViolated = always((World implies next(Inv)).orKeep(vars))
}

/// Conditional properties: changes must be "because of" an action
module credits {
  type User = str
  type Credit = int
  type Offer = (User, User, Credit)

  val Users: Set[User] = Set("a", "b", "c")
  val Credits: Set[Credit] = Set(1, 2)

  var owner: Credit -> User
  var offers: Set[Offer]

  action init = all { owner' = Map(1 -> "a", 2 -> "b"), offers' = Set() }

  action MakeOffer(src: User, dst: User, credit: Credit): bool = all {
    owner.get(credit) == src,
    src != dst,
    offers' = offers.union(Set((src, dst, credit))),
    owner' = owner,
  }

  // Unlike in the post, we check that `src` still owns the credit (see `creditsUnguarded`)
  action Accept(src: User, dst: User, credit: Credit): bool = all {
    owner.get(credit) == src,
    offers.contains((src, dst, credit)),
    offers' = offers.exclude(Set((src, dst, credit))),
    owner' = owner.set(credit, dst),
  }

  action step = {
    nondet src = Users.oneOf()
    nondet dst = Users.oneOf()
    nondet c = Credits.oneOf()
    any { MakeOffer(src, dst, c), Accept(src, dst, c) }
  }

  // ValidChange(credit) ==
  //   LET co == owner[credit]
  //   IN co /= co' => Accept(co, co', credit)
  temporal ValidChange(c: Credit): bool = {
    val co = owner.get(c)
    temporal nextCo = next(owner).get(c)
    co != nextCo implies Accept(co, nextCo, c)
  }

  // [][\A c \in Credits: ValidChange(c)]_owner
  temporal changeProp = always(Credits.forall(c => ValidChange(c)).orKeep(owner))
}

/// The spec from the post, where `Accept` doesn't check that `src` still owns the credit.
/// `changeProp` is violated: after `a` offers a credit to `b` and to `c`, and `c` accepts,
/// `b` can still accept the stale offer, moving the credit from `c` to `b`.
module creditsUnguarded {
  import credits as C

  action Accept(src: C::User, dst: C::User, credit: C::Credit): bool = all {
    C::offers.contains((src, dst, credit)),
    C::offers' = C::offers.exclude(Set((src, dst, credit))),
    C::owner' = C::owner.set(credit, dst),
  }

  action init = C::init

  action step = {
    nondet src = C::Users.oneOf()
    nondet dst = C::Users.oneOf()
    nondet c = C::Credits.oneOf()
    any { C::MakeOffer(src, dst, c), Accept(src, dst, c) }
  }

  temporal changePropViolated = C::changeProp
}

/// State transitions: a server cannot go directly from `Offline` to `Online`
module serverStatus {
  type Status = Offline | Booting | Online

  var status: Status

  action init = status' = Offline

  action step = status' = match status {
    | Offline => Booting
    | Booting => Online
    | Online => Offline
  }

  // [][status = Offline => status' /= Online]_status
  temporal noSkipBoot = always((status == Offline implies next(status) != Online).orKeep(status))

  // [][status = Booting => status' /= Online]_status
  temporal neverOnlineViolated = always((status == Booting implies next(status) != Online).orKeep(status))
}

/// State transitions: the states and valid transitions of a state machine, used by the following modules
module stateMachine {
  type State = A | B | C | D
  type Transition = (State, State)

  // Transitions == { <<A, B>>, <<A, C>>, <<B, D>>, <<C, A>>, <<C, B>> }
  val Transitions: Set[Transition] = Set((A, B), (A, C), (B, D), (C, A), (C, B))
}

/// State transitions: the valid transitions of a state machine
module transitions {
  import stateMachine.*

  var state: State

  action init = state' = A

  action step = {
    nondet t = Transitions.oneOf()
    all { state == t._1, state' = t._2 }
  }

  // [][<<state, state'>> \in Transitions]_state
  temporal validTransitions = always(Transitions.contains((state, next(state))).orKeep(state))

  // [][<<state, state'>> /= <<C, A>>]_state
  temporal neverBackToAViolated = always(((state, next(state)) != (C, A)).orKeep(state))
}

/// State transitions: combining transitions with conditional properties
module conditionalTransitions {
  import stateMachine.*

  var state: State
  var x: int

  action init = all { state' = A, x' = 0 }

  action step = {
    nondet t = Transitions.oneOf()
    all {
      state == t._1,
      state' = t._2,
      x' = if (t == (A, B) and x < 3) x + 1 else if (t == (A, C) and x > -3) x - 1 else x,
    }
  }

  // T == <<state, state'>>
  temporal T = (state, next(state))

  // [][T = <<A, B>> => x' > x]_<<state, x>>
  temporal abIncrements = always((T == (A, B) implies next(x) > x).orKeep((state, x)))

  // [][x' < x => T = <<A, C>>]_<<state, x>>
  temporal onlyAcDecrements = always((next(x) < x implies T == (A, C)).orKeep((state, x)))

  // [][T = <<C, B>> => x' > x]_<<state, x>>
  temporal cbIncrementsViolated = always((T == (C, B) implies next(x) > x).orKeep((state, x)))
}

/// State transitions: multiple concurrent state machines
module concurrentTransitions {
  import stateMachine.*

  type Machine = M1 | M2 | M3

  val Machines: Set[Machine] = Set(M1, M2, M3)

  var machines: Machine -> State

  action init = machines' = Machines.mapBy(_ => A)

  action step = {
    nondet m = Machines.oneOf()
    nondet t = Transitions.oneOf()
    all { machines.get(m) == t._1, machines' = machines.set(m, t._2) }
  }

  // An adversary that may move a machine to any state
  action adversarialStep = {
    nondet m = Machines.oneOf()
    nondet s = Set(A, B, C, D).oneOf()
    machines' = machines.set(m, s)
  }

  // ChangedState(m) == state[m] /= state'[m]
  temporal ChangedState(m: Machine): bool = machines.get(m) != next(machines).get(m)

  // TransitionAction(m) == <<state[m], state'[m]>>
  temporal TransitionAction(m: Machine): Transition = (machines.get(m), next(machines).get(m))

  // [][\A m \in Machines:
  //   ChangedState(m) => TransitionAction(m) \in Transitions
  // ]_state
  // Holds with `step`, and is violated with `adversarialStep`.
  temporal machinesTransitions =
    always(Machines.forall(m => ChangedState(m) implies Transitions.contains(TransitionAction(m))).orKeep(machines))
}

/// Other uses: if one thread holds the lock, it must release it before another thread can acquire it
module lock {
  import basicSpells.* from "../../../examples/spells/basicSpells"

  type Thread = str

  val Threads: Set[Thread] = Set("t1", "t2")

  var lock: Option[Thread]

  action init = lock' = None

  action step = {
    nondet t = Threads.oneOf()
    any {
      all { lock == None, lock' = Some(t) },
      all { lock != None, lock' = None },
    }
  }

  // A thread may take the lock from another one
  action stealingStep = {
    nondet t = Threads.oneOf()
    lock' = Some(t)
  }

  // [][lock /= NULL => lock' \in {lock, NULL}]_lock
  // Holds with `step`, and is violated with `stealingStep`.
  temporal lockRelease = always((lock != None implies Set(lock, None).contains(next(lock))).orKeep(lock))
}

/// Other uses: an append-only log
module appendOnlyLog {
  var log: List[int]

  action init = log' = []

  action step = all { log.length() < 3, log' = log.append(log.length()) }

  // [][SubSeq(log', 1, Len(log)) = log]_log
  temporal appendOnly = always((next(log).slice(0, log.length()) == log).orKeep(log))

  // [][log /= <<>> => UNCHANGED log]_log
  temporal logFrozenViolated = always((log != [] implies next(log) == log).orKeep(log))
}

/// Other uses: once a predicate becomes true, it cannot become false again
module stickyFlag {
  var n: int
  var flag: bool

  action init = all { n' = 0, flag' = false }

  action step = all { n < 3, n' = n + 1, flag' = (flag or n == 1) }

  // [][flag => flag']_flag
  temporal flagSticks = always((flag implies next(flag)).orKeep(flag))

  // [][~flag => ~flag']_flag
  temporal neverSetViolated = always((not(flag) implies not(next(flag))).orKeep(flag))
}

/// Other uses: once a value is no longer NULL, it doesn't go back to NULL, and doesn't change
module nonNull {
  import basicSpells.* from "../../../examples/spells/basicSpells"

  var value: Option[int]

  action init = value' = None

  action step = value' = match value {
    | None => Some(0)
    | Some(v) => if (v < 3) Some(v + 1) else value
  }

  // [][val /= NULL => val' /= NULL]_val
  temporal staysNonNull = always((value != None implies next(value) != None).orKeep(value))

  // [][val /= NULL => UNCHANGED val]_val
  temporal frozenOnceSetViolated = always((value != None implies next(value) == value).orKeep(value))
}

/// Other uses: while there are messages from the current client, we don't switch to another client
module clientQueue {
  type Client = str

  val Clients: Set[Client] = Set("c1", "c2")

  var curr: Client
  var queue: Client -> List[int]

  action init = all { curr' = "c1", queue' = Clients.mapBy(_ => [1, 2]) }

  // Process a message from the current client, or switch clients when its queue is empty
  action step = {
    nondet c = Clients.oneOf()
    if (queue.get(curr) == []) all { curr' = c, queue' = queue }
    else all { curr' = curr, queue' = queue.setBy(curr, q => q.tail()) }
  }

  // Switch clients at any time
  action impatientStep = {
    nondet c = Clients.oneOf()
    all { curr' = c, queue' = queue.setBy(curr, q => if (q == []) q else q.tail()) }
  }

  // [][queue[curr] /= <<>> => UNCHANGED curr]_<<curr, queue>>
  // Holds with `step`, and is violated with `impatientStep`.
  temporal stickyClient = always((queue.get(curr) != [] implies next(curr) == curr).orKeep((curr, queue)))
}

/// Notes: angle actions and eventually-always action properties
module notes {
  var x: int
  var safe: bool

  action init = all { x' = 0, safe' = true }
  action Machine = all { x' = (x + 1) % 3, safe' = true }
  action World = all { x' = x, safe' = false }
  action step = any { Machine, World }

  val vars = (x, safe)

  // []<><<Machine>>_x, which needs fairness
  temporal machineInfinitelyOften = Machine.weakFair(vars) implies always(eventually(Machine.mustChange(x)))

  // []<><<Machine>>_x, without fairness
  temporal machineInfinitelyOftenViolated = always(eventually(Machine.mustChange(x)))

  // RareWorldResilient == <>[][World => Safe]_x => Resilient, with Resilient == []<>Safe
  temporal rareWorldResilient =
    Machine.weakFair(vars) implies
      (eventually(always((World implies next(safe)).orKeep(vars))) implies always(eventually(safe)))

  // Same, without fairness: the system may stutter forever after World
  temporal rareWorldResilientViolated =
    eventually(always((World implies next(safe)).orKeep(vars))) implies always(eventually(safe))
}
