// -*- mode: Bluespec; -*-
/**
 * Lamport's bakery algorithm in Quint
 * https://lamport.azurewebsites.net/pubs/bakery.pdf
 *
 * The encoding of the algorithm itself is more Quint-native than the original Pluscal/TLA+ model
 * from https://lamport.azurewebsites.net/tla/Bakery.tla. This means that the semantics of the
 * non-atomic write operation is not encoded within the algorithm. Here, the algorithm is encoded
 * in Quint's functional layer, while the semantics of the write operations (writing arbitrary
 * intermediary values) is handled on the statemachine/action layer.
 * As a result, the inductive invariant needs more supporting lemmas. Them main ingredients are
 * translations of Lamport's model
 *
 * Run in verifier with:
 *   quint verify bakery.qnt --main verification --inductive-invariant IndInv --invariant correctness
 *
 * Josef Widder, Informal Systems, 2025
 */
module bakery {

  /// Number of processes in the system.
  const N: int

  /// In simulations, this is used to capture the possible values read
  /// from safe registers.
  const DOMAIN: Set[int]
  const MAX_VALUE: int // In case of domain is Int, this has no effect. Shouldn't be negative.

  assume good_value = DOMAIN != Nat implies (MAX_VALUE.in(DOMAIN) and MAX_VALUE >= 0 and DOMAIN.forall(i => i <= MAX_VALUE))

  /// If true, no value outside of the domain is allowed to be written
  const ENFORCE_DOMAIN: bool

  val processes = 1.to(N)

  // Encoding the control flow of the bakery algorithm, which has an outer loop that goes through
  // several locations. At some locations operations are iterated over each process. The waiting
  // loop contains two waiting statements that consists of conditional GOTOs to locations L2 and L3
  type Outer =
    | L11
    | L12ComputeMax
    | L13WriteNum
    | L14Wait
    | L15EnterCritical
    | L15CS
    | L16
    | L17NonCritical

  val outer_set = Set(L11, L12ComputeMax, L13WriteNum, L14Wait, L15EnterCritical, L15CS, L16, L17NonCritical)

  type Iter = int

  type Inner =
    | L2
    | L3
    | None

  val inner_set = Set(L2, L3, None)

  type Location = (Outer, Iter, Inner)

  val locations =
    tuples(outer_set, 1.to(N), inner_set)

  /// Given a program location, return the next one.
  pure def next_instr(l: Location): Location =
    val outer = l._1
    val j = l._2
    val inner = l._3
    match outer {
      | L11 => (L12ComputeMax, 1, None) // set choose = 1
      | L12ComputeMax =>                // max. We ned to iterate reading n numbers
        if (j < N)
          (outer, j + 1, inner)
        else
          (L13WriteNum, 1, None)
      | L13WriteNum => (L14Wait, 1, L2) // choose = 0
      | L14Wait =>
        if (inner == L2)
          (outer, j, L3)
        else // inner == L3
          if (j < N)
            (outer, j + 1, L2)
          else
            (L15EnterCritical, 1, None) // leave loop
      | L15EnterCritical => (L15CS, 1, None)
      | L15CS =>            (L16, 1, None)
      | L16 =>              (L17NonCritical, 1, None)
      | L17NonCritical =>   (L11, 1, None) // "goto L1"
    }

  type LocalState = {
    id: int,
    max: int, // to store intermediate max values while reading n numbers
    pc: Location
  }

  type Output =
    | WriteNumber(int)
    | WriteChoosing(int)
    | Critical // signaling that a node has entered the critical section
    | Leave
    | Nop

  type Result = {
    post: LocalState,
    out: Output
  }

  pure def maximum(a: int, b: int): int =
    if (a > b) a else b

  pure def less(a: (int, int), c: (int, int)): bool =
    if (a._1 < c._1) true
    else if (a._1 == c._1) a._2 < c._2
    else false

  pure def bakery(s: LocalState, choosing: int -> int, number: int -> int): Result =
    val outer = s.pc._1
    val j = s.pc._2
    val inner = s.pc._3
    match outer {
      | L11 => { post: { ...s, max: 0, pc: next_instr(s.pc) }, out: WriteChoosing(1)} // we need to reset max here
      | L12ComputeMax =>
        if (j < N)
          { post: { ...s, pc: next_instr(s.pc),
                          max: maximum(s.max, number.get(j)) }, // read next number and update intermediate max
            out: Nop}
        else
          { post: { ...s, pc: next_instr(s.pc),
                          max: maximum(s.max, number.get(j)) },
            out: WriteNumber(1 + maximum(s.max, number.get(j)))}
      | L13WriteNum => {post: { ...s, pc: next_instr(s.pc)}, out: WriteChoosing(0)}
      | L14Wait =>
        match inner {
          | L2 =>
            if (choosing.get(j) != 0)
              {post: s, out: Nop} // "goto L2"
            else
              {post: { ...s, pc: next_instr(s.pc) }, out: Nop}
          | L3 => // I assume number[j] needs to be read once
            if (number.get(j) != 0 and less((number.get(j), j), (number.get(s.id), s.id)))
              {post: s, out: Nop} // "goto L3"
            else
              {post: { ...s, pc: next_instr(s.pc) }, out: Nop}
          | _ =>  {post: s, out: Nop}
      }
      | L15EnterCritical => {post: { ...s, pc: next_instr(s.pc)}, out: Critical}
      | L15CS =>            {post: { ...s, pc: next_instr(s.pc)}, out: Leave}
      | L16 =>              {post: { ...s, pc: next_instr(s.pc)}, out: WriteNumber(0)}
      | L17NonCritical =>   {post: { ...s, pc: next_instr(s.pc)}, out: Nop}
    }

  /*
   * The state machine
   */

  var system: int -> LocalState
  var flag: int -> int
  var num: int -> int
  var op: int -> Output

  def TypeOK = and {
    val state_space =
      tuples(processes, DOMAIN, locations)
        .map(t => { id: t._1, max: t._2, pc: t._3 })
    system.in(processes.setOfMaps(state_space)),
    system.keys().forall(i => i == system.get(i).id),
    flag.in(processes.setOfMaps(DOMAIN)),
    num.in(processes.setOfMaps(DOMAIN)), // needs to be unbounded
    op.in(processes.setOfMaps(
        Set(Critical, Leave, Nop)
          .union(Set(0,1).map(i => WriteChoosing(i)))
          .union(DOMAIN.union(Set(MAX_VALUE + 1)).map(i => WriteNumber(i)))))
  }

  action init = all {
    system' = processes.mapBy(i => { id: i, max: 0, pc: (L11, 1, None) }),
    flag' = processes.mapBy(i => 0),
    num' = processes.mapBy(i => 0),
    op' = processes.mapBy(i => Nop),
  }

  /// A process can be in the middle of a write operation, or performing a state transition
  action process_step(i) =
    match op.get(i)  {
      | WriteChoosing(x) => // write operation in progress
          nondet next_op = Set(WriteChoosing(x), Nop).oneOf() // Nop ends write
          nondet dirty = DOMAIN.oneOf()
          all {
            flag' =
              if (next_op == Nop)
                flag.set(i, x) // write is over, so we write the required value
              else
                flag.set(i, dirty), // write is ongoing, so we write a dirty value
            num' = num,
            op' = op.set(i, next_op),
            system' = system,
          }
      | WriteNumber(x) => // write operation in progress
          nondet next_op = Set(WriteNumber(x), Nop).oneOf() // Nop ends write
          nondet dirty = DOMAIN.oneOf()
          all {
            flag' = flag,
            val aux =
              if (next_op == Nop)
                num.set(i, x) // write is over, so we write the required value
              else
                num.set(i, dirty) // write is ongoing, so we write a dirty value
            all {
              ENFORCE_DOMAIN implies aux.get(i).in(DOMAIN), // enforce domain
              num' = aux,
            },
            op' = op.set(i, next_op),
            system' = system,
          }
      | _ => // process is doing a step
        val result = bakery(system.get(i), flag, num)
        all {
          ENFORCE_DOMAIN implies result.post.max.in(DOMAIN),
          flag' = flag,
          num' = num,
          op' = op.set(i, result.out),
          system' = system.set(i, result.post),
        }
    }

  action step =
    nondet i = processes.oneOf()
    process_step(i)

  /// use this action if you just want to consider process 1 moving alone without
  /// interleaving of other processes
  action alone = process_step(1)

  /// Mutual exclusion. No two processes are in the critical section at the same time
  def correctness =
    processes.filter(x => op.get(x) == Critical).size() <= 1

  /// Witness that finds a scenario where a process is in the critical section
  def no_critical_witness =
    processes.filter(x => op.get(x) == Critical).size() == 0

  def small_witness = processes.filter(x => num.get(x) > 100).size() < 2

  /// adaptation of Lamport's before function.
  def before(i,j) = and {
    num.get(i) > 0, // i is competing and has finished writing
    or {
      j == i, // i is always before i
      match system.get(j).pc._1 {
        | L11 => true // j is not competing
        | L16 => true // j is not competing
        | L17NonCritical => true // j is not competing
        | L12ComputeMax => or {
            i >= system.get(j).pc._2, // j has not checked i yet
            system.get(j).max >= num.get(i),
            }
          // j is reading all the numbers, j hasn't looked at i yet  or j's max is bigger
        | L13WriteNum => and {
            op.get(j) != Nop implies system.get(j).max >= num.get(i),
            op.get(j) == Nop implies less((num.get(i),i), (num.get(j), j)), // When it has finished writing j's num is bigger
          }
        | L14Wait => and {
          less((num.get(i),i), (num.get(j), j)),
          i >= system.get(j).pc._2, // j has not checked i yet
          }
        | L15CS => false
        | L15EnterCritical => false
      },
    },
  }

  def IndInv = and {
    TypeOK,
    correctness,
    processes.forall(i => and {
      // Linking operation to process states
      op.get(i) == WriteChoosing(1) implies system.get(i).pc == (L12ComputeMax, 1, None),
      op.get(i) == WriteChoosing(0) implies system.get(i).pc == (L14Wait, 1, L2),
      not(op.get(i).in(Set(WriteChoosing(0), WriteChoosing(1)))) implies flag.get(i).in(Set(0,1)),
      match op.get(i) {
        | WriteNumber(x) =>
            if (x == 0)
              system.get(i).pc._1 == L17NonCritical
            else all {
              system.get(i).pc == (L13WriteNum, 1, None),
              system.get(i).max + 1 == x,
            }
        | _ => true
      },
      op.get(i) == Critical implies system.get(i).pc._1 == L15CS,
      op.get(i) == Leave implies system.get(i).pc._1 == L16,
      op.get(i) == Nop implies system.get(i).pc._1.in(Set(L11, L12ComputeMax, L13WriteNum, L14Wait, L15EnterCritical, L17NonCritical)),

      // locations sanity conditions
      system.get(i).pc._1 == L14Wait implies system.get(i).pc._3.in(Set(L2, L3)),

      // linking locations to data
      (system.get(i).pc._1 == L12ComputeMax and op.get(i) == Nop) implies flag.get(i) == 1,
      system.get(i).pc._1 == L13WriteNum implies flag.get(i) == 1,
      (system.get(i).pc._1 == L13WriteNum and op.get(i) == Nop) implies and {
        num.get(i) != 0,
        system.get(i).max + 1 >= num.get(i),
      },
      system.get(i).pc._1.in(Set(L14Wait, L15EnterCritical, L15CS))
        implies system.get(i).max + 1 >= num.get(i),
      system.get(i).pc._1.in(Set(L14Wait, L15EnterCritical, L15CS, L16)) implies num.get(i) != 0,
      (system.get(i).pc._1 == L17NonCritical and op.get(i) == Nop) implies num.get(i) == 0,


      // Lamport's last three conjuncts. The actual meat of his inductive invariant


      // if process j entered the doorway after process i left, (and j already read
      // num[i]), then max[j] >= num[i]
      val j = system.get(i).pc._2 // j is the process that i is currently checking in the waiting loop
      and {
        system.get(i).pc._1 == L14Wait and system.get(i).pc._3 == L3, // (a) i went over L2 for j already -> so j was not in the doorway when i checked
        or {
          // these two require that j is in the doorway now. Together with (a) this
          // implies that j entered the doorway after i went over L2, that is, after
          // i has finished writing its num
          system.get(j).pc._1 == L12ComputeMax and i < system.get(j).pc._2,   // j already read num[i]
          system.get(j).pc._1 == L13WriteNum,                                 // same, but check is implicit as j moved on to write
        }
      } implies system.get(j).max >= num.get(i),

      // when i is in the waiting loop, processes that have been checked by i are after i
      and {
        system.get(i).pc._1 == L14Wait,
        op.get(i) == Nop
      } implies processes.filter(p => p < system.get(i).pc._2).forall(j => before(i, j)),

      // when i is in the critical section, everyone is after i
      system.get(i).pc._1.in(Set(L15CS, L15EnterCritical)) implies
        processes.forall(j => before(i, j)),
    }),
  }
}

module verification {
  // For checking the inductive invariant with Apalache as a backend we need to restrict the
  // variable domain. This restriction is still interesting, as it allows executions where
  // processes enter the critical section.

  // run
  // quint run bakery.qnt --main verification --invariant no_critical_witness --seed=0xcfde13003ffa3
  // to see that even with this parameters a node can actually enter the critical section

  // run
  // quint verify bakery.qnt --main verification --inductive-invariant IndInv --invariant correctness
  // to prove mutual exclusion. It takes 90sec on my laptop.

  import bakery(
    N = 3,
    MAX_VALUE = 10,
    DOMAIN = 0.to(10),
    ENFORCE_DOMAIN = true,
  ).*
}

module simulation {
  import bakery(
    N = 5,
    MAX_VALUE = 100,
    DOMAIN = Nat,
    ENFORCE_DOMAIN = false,
  ).*
}

module understanding {
  // The first of Lamport's conjuncts in the inductive invariant might be hard to understand.
  // run
  // quint run bakery.qnt --main understanding --invariant "not(interesting_before)" --max-steps=50
  // to get scenarios where it is in play. Perhaps you can figure it out.
  // Retry if random simulation doesn't report a violation trace

  import bakery(
    N = 3,
    MAX_VALUE = 100,
    DOMAIN = Nat,
    ENFORCE_DOMAIN = false,
  ).*

  def interesting_before =
    (system.get(3).pc._1 == L14Wait and system.get(3).pc._3 == L3 and num.get(3) > 1) and
    val j = system.get(3).pc._2
    or {
      system.get(j).pc._1 == L12ComputeMax and 3 < system.get(j).pc._2,
      system.get(j).pc._1 == L13WriteNum,
    }
}
