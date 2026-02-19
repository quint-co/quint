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
  const NUM_PPROCESSES: int
  const MAX_FAULTS: int
  const ACTUAL_FAULTS: int
  const MAX_ROUNDS: int

  type Process = int
  type Value = int
  type Round = int
  type Message = { sender: Process, values: Set[Value] }

  type Decision =
    | None
    | Some(Value)

  /// The state of a process, using the same nomenclature from the paper
  type LocalState = {
    // The set of values received from processes
    receivedValues: Set[Value],
    // The current round
    currentRound: Round,
    // The decision value, if any
    decision: Decision,
    // The set of messages received - each message is a set of values
    valuesCurrentRound: Set[Set[Value]],
    // The value of this process
    proposalValue: Value
  }

  type Stage = Starting | Sending | Receiving | Computing

  //
  // Local functions
  //

  def minValue(values: Set[int]): int = {
    val initial = values.fold(0, (_, value) => value)
    values.fold(initial, (currentMin, value) => if (value < currentMin) value else currentMin)
  }

  pure def compute(state: LocalState): LocalState = {
    val newReceivedValues = state.receivedValues.union(flatten(state.valuesCurrentRound))
    val newRound = state.currentRound + 1
    val newDecision = if (state.currentRound == MAX_ROUNDS) Some(minValue(newReceivedValues)) else state.decision

    { receivedValues: newReceivedValues, currentRound: newRound, decision: newDecision, valuesCurrentRound: Set(), proposalValue: state.proposalValue }
  }

  //
  // State machine
  //

  val Procs: Set[int] = 1.to(NUM_PPROCESSES - 1)

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

  val agreement = Procs.exclude(crashed).forall(process1 => {
    Procs.exclude(crashed).forall(process2 => {
      (procState.get(process1).decision != None and procState.get(process2).decision != None) implies
        procState.get(process1).decision == procState.get(process2).decision
    })
  })


  /// If all processes have the same initial value, then this must be the only decision value
  val validity = {
    val allProposalValues = Procs.map(process => procState.get(process).proposalValue)

    allProposalValues.size() == 1 implies
      val decisionValue = allProposalValues.getOnlyElement()

      Procs.exclude(crashed).forall(process => {
        match procState.get(process).decision {
          | Some(decidedValue) => decidedValue == decisionValue
          | None => true
        }
      })
  }

  //
  // Actions
  //

  action init = all {
    nondet initialValues = Procs.setOfMaps(1.to(NUM_PPROCESSES + 1)).oneOf()
    procState' = Procs.mapBy(processId => {
      val initialValue = initialValues.get(processId)
      {
        receivedValues: Set(initialValue),
        currentRound: 1,
        decision: None,
        valuesCurrentRound: Set(),
        proposalValue: initialValue,
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
    procState' = Procs.mapBy(processId => {
      { receivedValues: Set(processId), currentRound: 1, decision: None, valuesCurrentRound: Set(), proposalValue: processId }
    }),
    round' = 1,
    correctProcsMessages' = Set(),
    crashed' = Set(),
    newlyCrashed' = Set(),
    crashedProcsMessages' = Set(),
  }

  action sendMessages = all {
    correctProcsMessages' = Procs.exclude(crashed).exclude(newlyCrashed).map(process => {
      { sender: process, values: procState.get(process).receivedValues }
    }),
    crashedProcsMessages' =
      if (newlyCrashed.size() > 0) {
         newlyCrashed.map(process => { sender: process, values: procState.get(process).receivedValues })
      } else {
        Set()
      },
    round' = round,
    procState' = procState,
    crashed' = crashed,
    newlyCrashed' = newlyCrashed,
  }

  action crashProcess(crashedProcess) = all {
    newlyCrashed' = Set(crashedProcess),
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
      nondet newlyCrashedProcesses = Procs.exclude(crashed).powerset().filter(candidateSet => {
        candidateSet.size() == newCrashCount
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

    val newCorrectValues: Set[Set[Value]] = correctProcsMessages.map(message => message.values)
    if (crashedProcsMessages.size() == 0) {
      procState' = procState.keys().mapBy(process => {... procState.get(process), valuesCurrentRound: newCorrectValues})
    } else {
      val newCrashedProcsValues: Set[Set[Value]] = crashedProcsMessages.map(message => message.values)
      // for each process we pick from which newly crashed they receive a message
      nondet crashedMessagesReceived = Procs.setOfMaps(newCrashedProcsValues.union(Set(Set()))).oneOf()

      procState' = procState.keys().mapBy(process => {
        ...procState.get(process),
        valuesCurrentRound: newCorrectValues.union(Set(crashedMessagesReceived.get(process)))
      })
    },
  }

  action computeAction = all {
    correctProcsMessages' = Set(),
    procState' = procState.keys().mapBy(process => compute(procState.get(process))),
    round' = round + 1,
    crashed' = crashed.union(newlyCrashed),
    newlyCrashed' = Set(),
    crashedProcsMessages' = Set(),
  }

  /// The set of correct processes that do not receive messages from `newlyCrashed`
  action receiveMessage(excludedProcesses) = all {
    round' = round,
    correctProcsMessages' = Set(),
    crashedProcsMessages' = Set(),
    val newCorrectValues: Set[Set[Value]] = correctProcsMessages.map(message => message.values)
    val newCrashedProcsValues: Set[Set[Value]] = crashedProcsMessages.map(message => message.values)
    procState' = procState.keys().mapBy(process => {
      { ...procState.get(process),
        valuesCurrentRound: if (excludedProcesses.contains(process))
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
  import ConsensusAlg(NUM_PPROCESSES = 6, MAX_FAULTS = 1, ACTUAL_FAULTS = 1, MAX_ROUNDS = 2).*

  run consensusRunTest =
    init
      .then(((MAX_FAULTS + 1) * 4 + 1).reps(_ => step))
      .expect(agreement)
      .expect(validity)
}

module badValues {
  // (should fail) quint run ConsensusAlg.qnt --main badValues --invariant agreement --max-steps 8
  // quint test --main=badValues ConsensusAlg.qnt
  import ConsensusAlg(NUM_PPROCESSES = 6, MAX_FAULTS = 1, ACTUAL_FAULTS = 2, MAX_ROUNDS = 2).*

  run consensusRunTest =
    init
      .then(((MAX_FAULTS + 1) * 4 + 1).reps(_ => step))
      .expect(validity)

  /// We crash one process, and the set of excluded processes does not receive that process's messages
  run stepHideProcessMessagesFromSet(crashedProcess, excludedProcesses) = {
    crashProcess(crashedProcess).then(sendMessages).then(receiveMessage(excludedProcesses)).then(computeAction)
  }

  /// If there is at most one fault (MAX_FAULTS = 1) two rounds should be enough to reach agreement.
  /// But in reality we have two faulty processes, 1 and 2. In the first round, process 1 crashes,
  /// and process 2 receives messages from process 1. In the second round, process 2 crashes, and
  /// some process see the 1 while others don't
  run consensusDisagreementTest =
    initializeProcsStateWithDistinctValues
      .then(stepHideProcessMessagesFromSet(1, Set(3, 4, 5)))
      .then(stepHideProcessMessagesFromSet(2, Set(4, 5)))
      .expect(not(agreement))
}
