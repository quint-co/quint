// -*- mode: Bluespec; -*-

/*
 * Quint Specification for Algorithm 15: Consensus Algorithm in the Presence of Crash Failures
 * This specification is derived from book "Distributed Computing: Fundamentals, Simulations,
 * and Advanced Topics" (Second Edition) by Hagit Attiya and Jennifer Welch [1], specifically from
 * Chapter 5, page 93.
 *
 * Tatjana Kirda, Josef Widder and Gabriela Moreira, Informal Systems, 2024-2025
 *
 * [1]: http://lib.ysu.am/disciplines_bk/c95d04e111f3e28ae4cc589bfda1e18b.pdf
*/
module ConsensusAlg {
  const N: int
  const F: int
  const ACTUAL_FAULTS: int
  const MAX_ROUNDS: int

  type Proc = int
  type Value = int
  type Round = int
  type Message = { sender: Proc, values: Set[Value] }

  type Decision =
    | None
    | Some(Value)

  /// The state of a process, using the same nomenclature from the paper
  type LocalState = {
    // The set of values received from processes
    V: Set[Value],
    // The current round
    r: Round,
    // The decision value, if any
    y: Decision,
    // The set of messages received - each message is a set of values
    S: Set[Set[Value]],
    // The value of this process
    x: Value
  }

  type Stage = Starting | Sending | Receiving | Computing

  //
  // Local functions
  //

  def getFirst(s: Set[int]): int = s.fold(0, (_, v) => v)

  def minValue(values: Set[int]): int = {
    val initial = getFirst(values)
    values.fold(initial, (min, v) => if (v < min) v else min)
  }

  pure def compute(s: LocalState): LocalState = {
    val newV = s.V.union(flatten(s.S))
    val newR = s.r + 1
    val newY = if (s.r == MAX_ROUNDS) Some(minValue(newV)) else s.y

    { V: newV, r: newR, y: newY, S: Set(), x: s.x }
  }

  //
  // State machine
  //

  val Procs: Set[int] = 1.to(N - 1)

  var round: Round
  var correctProcsMessages: Set[Message]
  var crashedProcsMessages: Set[Message]
  var procState: int -> LocalState
  var crashed: Set[int]
  var newlyCrashed: Set[int]
  var stage: Stage

  //
  // Invariants
  //

  val agreement = Procs.exclude(crashed).forall(p => {
    Procs.exclude(crashed).forall(q => {
      (procState.get(p).y != None and procState.get(q).y != None) implies
        procState.get(p).y == procState.get(q).y
    })
  })

  /// If all processes have the same initial value v, then this must be the only decision value
  val validity = {
    val allXValues = Procs.map(p => procState.get(p).x)

    allXValues.size() == 1 implies
      val decisionValue = allXValues.getOnlyElement()

      Procs.exclude(crashed).forall(p => {
        match procState.get(p).y {
          | Some(y) => y == decisionValue
          | None => true
        }
      })
  }

  //
  // Actions
  //

  action init = all {
    nondet initialValues = Procs.setOfMaps(Set(1, 2, 3)).oneOf()
    procState' = Procs.mapBy(i => {
      val initialValue = initialValues.get(i)
      {
        V: Set(initialValue),
        r: 1,
        y: None,
        S: Set(),
        x: initialValue,
      }
    }),
    round' = 1,
    correctProcsMessages' = Set(),
    crashed' = Set(),
    newlyCrashed' = Set(),
    crashedProcsMessages' = Set(),
    stage' = Starting,
  }

  action initializeProcsStateWithDistinctValues = all {
    procState' = Procs.mapBy(i => {
      { V: Set(i), r: 1, y: None, S: Set(), x: i }
    }),
    round' = 1,
    correctProcsMessages' = Set(),
    crashed' = Set(),
    newlyCrashed' = Set(),
    crashedProcsMessages' = Set(),
  }

  action sendMessages = all {
    correctProcsMessages' = Procs.exclude(crashed).exclude(newlyCrashed).map(p => {
      { sender: p, values: procState.get(p).V }
    }),
    crashedProcsMessages' =
      if (newlyCrashed.size() > 0) {
         newlyCrashed.map(p => { sender: p, values: procState.get(p).V })
      } else {
        crashedProcsMessages
      },
    round' = round,
    procState' = procState,
    crashed' = crashed,
    newlyCrashed' = newlyCrashed,
  }

  action crashProcess(p) = all {
    newlyCrashed' = Set(p),
    crashed' = crashed,
    round' = round,
    procState' = procState,
    correctProcsMessages' = correctProcsMessages,
    crashedProcsMessages' = crashedProcsMessages
  }

  /// Crash some number of processes smaller or equal to ACTUAL_FAULTS
  action crash = all {
    if (ACTUAL_FAULTS - crashed.size() > 0) {
      nondet newCrashCount = oneOf(1.to(ACTUAL_FAULTS - crashed.size()))
      nondet newlyCrashedProcesses = Procs.exclude(crashed).powerset().filter(s => {
        s.size() == newCrashCount
      }).oneOf()
      newlyCrashed' = newlyCrashedProcesses
    } else {
      newlyCrashed' = newlyCrashed
    },
    crashed' = crashed,
    round' = round,
    procState' = procState,
    correctProcsMessages' = correctProcsMessages,
    crashedProcsMessages' = crashedProcsMessages
  }

  action receiveMessages = all {
    round' = round,
    correctProcsMessages' = Set(),
    crashedProcsMessages' = Set(),
    crashed' = crashed,
    newlyCrashed' = newlyCrashed,

    val newCorrectValues: Set[Set[Value]] = correctProcsMessages.map(m => m.values)
    if (crashedProcsMessages.size() == 0) {
      procState' = procState.keys().mapBy(p => {... procState.get(p), S: newCorrectValues})
    } else {
      val newCrashedProcsValues: Set[Set[Value]] = crashedProcsMessages.map(m => m.values)
      // for each process we pick from which newly crashed they receive a message
      nondet crashedMessagesReceived = Procs.setOfMaps(newCrashedProcsValues.union(Set(Set()))).oneOf()

      procState' = procState.keys().mapBy(p => {
        ...procState.get(p),
        S: newCorrectValues.union(Set(crashedMessagesReceived.get(p)))
      })
    },
  }

  action computeAction = all {
    correctProcsMessages' = Set(),
    procState' = procState.keys().mapBy(p => compute(procState.get(p))),
    round' = round + 1,
    crashed' = crashed.union(newlyCrashed),
    newlyCrashed' = Set(),
    crashedProcsMessages' = Set(),
  }

  /// the set `s` of correct processes don't receive the messages from `newlyCrashed`
  action receiveMessage(s) = all {
    round' = round,
    correctProcsMessages' = Set(),
    crashedProcsMessages' = Set(),
    val newCorrectValues: Set[Set[Value]] = correctProcsMessages.map(m => m.values)
    val newCrashedProcsValues: Set[Set[Value]] = crashedProcsMessages.map(m => m.values)
    procState' = procState.keys().mapBy(p => {
      { ...procState.get(p),
        S: if (s.contains(p))
             newCorrectValues
           else
             newCorrectValues.union(newCrashedProcsValues)
      }
    }),
    crashed' = crashed,
    newlyCrashed' = newlyCrashed,
  }

  action stuttering = all {
    round' = round,
    correctProcsMessages' = correctProcsMessages,
    crashedProcsMessages' = crashedProcsMessages,
    procState' = procState,
    crashed' = crashed,
    newlyCrashed' = newlyCrashed,
    stage' = stage,
  }

  action step =
    if (round > MAX_ROUNDS) {
      stuttering
    } else {
      match stage {
        | Starting => all { crash, stage' = Sending }
        | Sending => all { sendMessages, stage' = Receiving }
        | Receiving => all { receiveMessages, stage' = Computing }
        | Computing => all { computeAction, stage' = Starting }
      }
  }
}

module properValues {
  // quint run --main properValues --invariant agreement ConsensusAlg.qnt
  import ConsensusAlg(N = 6, F = 1, ACTUAL_FAULTS = 1, MAX_ROUNDS = 2).*

  run consensusRunTest =
    init
      .then((F + 1).reps(_ => step))
      .expect(agreement)
      .expect(validity)
}

module badValues {
  // quint run ConsensusAlg.qnt --main badValues --invariant agreement --max-steps 5
  // quint test --main=badValues ConsensusAlg.qnt
  import ConsensusAlg(N = 6, F = 1, ACTUAL_FAULTS = 2, MAX_ROUNDS = 2).*

  run consensusRunTest =
    init
      .then((F + 1).reps(_ => step))
      .expect(validity)

  /// We crash process p, and the set s does not receive p's messages
  run stepHidePsMessagesFromS(p, s) = {
    crashProcess(p).then(sendMessages).then(receiveMessage(s)).then(computeAction)
  }

  /// If there is at most one fault (F = 1) two rounds should be enough to reach agreement.
  /// But in reality we have two faulty processes, 1 and 2. In the first round, process 1 crashes,
  /// and process 2 receives messages from process 1. In the second round, process 2 crashes, and
  /// some process see the 1 while others don't
  run consensusDisagreementTest =
    initializeProcsStateWithDistinctValues
      .then(stepHidePsMessagesFromS(1, Set(3, 4, 5)))
      .then(stepHidePsMessagesFromS(2, Set(4, 5)))
      .expect(not(agreement))
}
