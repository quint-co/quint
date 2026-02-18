// -*- mode: Bluespec; -*-

/*
 * Quint Specification for Algorithm 18: K-set Consensus Algorithm in the Presence of Crash Failures
 * This specification is derived from book "Distributed Computing: Fundamentals, Simulations, and
 * Advanced Topics" (Second Edition) by Hagit Attiya and Jennifer Welch [1], specifically from Chapter 5,
 * page 120.
 *
 * Tatjana Kirda, Josef Widder and Gabriela Moreira, Informal Systems, 2024-2025
 *
 * [1]: http://lib.ysu.am/disciplines_bk/c95d04e111f3e28ae4cc589bfda1e18b.pdf
 */
module KSetAgreementConsensus {
  import ConsensusAlg.* from "ConsensusAlg"
  export ConsensusAlg.*

  const K: int

  val kSetAgreement = {
    // Get all decided values (excluding None) and ensure they are unique
    val decidedValues = Procs.exclude(crashed).map(p => procState.get(p).decision).filter(v => v != None)
  
    // Check that number of unique decided values is at most K
    decidedValues.size() <= K
  }
}

module KSetProperValues {
  // quint run --main KSetProperValues --invariant kSetAgreement KSetAgreementConsensus.qnt
  // quint test --main KSetProperValues KSetAgreementConsensus.qnt
  import KSetAgreementConsensus(NUM_PPROCESSES = 8, MAX_FAULTS = 3, ACTUAL_FAULTS = 3, K = 2, MAX_ROUNDS = (3/2 + 1)).*

  run consensusRunTest =
    init
    .then(((MAX_FAULTS/K + 1) * 4 + 1).reps(_ => step))
    .expect(kSetAgreement)
    .expect(validity)
}

module KSetBadValues {
  // quint run KSetAgreementConsensus.qnt --main KSetBadValues --invariant kSetAgreement --max-steps 8
  // The command above should fail, but it might take a few minutes (and extra samples) to find a violation
  // Use --seed=0x12d0977afd37f0 to find it (generated in quint v0.23.0)
  // quint test --main=KSetBadValues KSetAgreementConsensus.qnt
  import KSetAgreementConsensus(NUM_PPROCESSES = 8, MAX_FAULTS = 3, ACTUAL_FAULTS = 4, K = 2, MAX_ROUNDS = (3/2 + 1)).*

  run consensusRunTest  =
    init
      .then(((MAX_FAULTS/K + 1) * 4 + 1).reps(_ => step))
      .expect(validity)

  //
  //  Auxiliary definitions to crash in a specific way
  //

  action crashProcessesFromConfig(hidingConfigs) = all {
    // Collect all processes that need to be crashed from all hiding configurations
    val nc = flatten(hidingConfigs.map(config => config.hiddenProcs))
    all {
      newlyCrashed' = nc,
      crashed.intersect(nc).size() == 0, // Ensure no process is crashed twice
      crashed' = crashed,
      round' = round,
      procState' = procState,
      correctProcsMessages' = correctProcsMessages,
      crashedProcsMessages' = crashedProcsMessages
    }
  }

  action receiveMessagesWithHiding(hidingConfigs) = all {
    round' = round,
    correctProcsMessages' = Set(),
    crashedProcsMessages' = Set(),
    crashed' = crashed,
    newlyCrashed' = newlyCrashed,

    val newCorrectValues: Set[Set[Value]] = correctProcsMessages.map(m => m.values)
    val newCrashedProcsValues: Set[Set[Value]] = crashedProcsMessages.map(m => m.values)

    procState' = procState.keys().mapBy(p => {
      // Find if this process is a target in any hiding config
      val configForThisProc = hidingConfigs.filter(config => config.targetProc == p)

      val processedValues =
        if (configForThisProc.size() > 0) {
          // Get all processes that should be hidden from this process
          val hiddenFromThis = flatten(configForThisProc.map(config => config.hiddenProcs))

          // Filter out messages from hidden processes
          val allowedCrashedMessages = crashedProcsMessages
            .filter(m => not(hiddenFromThis.contains(m.sender)))
            .map(m => m.values)

          newCorrectValues.union(allowedCrashedMessages)
        } else {
          // If process is not in hiding configs, it receives all messages
          newCorrectValues.union(newCrashedProcsValues)
        }

      { ...procState.get(p), valuesCurrentRound: processedValues }
    }),
  }

  run stepWithMultipleHiding(hidingConfigs) =
    crashProcessesFromConfig(hidingConfigs)
      .then(sendMessages)
      .then(receiveMessagesWithHiding(hidingConfigs))
      .then(computeAction)

  // Test scenario where processes decide on different values:
  // For K-Set agreement, we would need at least one round with less than K crashes
  // In this scenario, we don't have this, as we have 2 round and in each round 2 processes fail.
  run consensusDisagreementTest =
    initializeProcsStateWithDistinctValues
       // In the first round, processes 1 and 2 crash:
       // only process 3 sees process 1's value (the smallest),
       // process 4 sees process 2's value (the second smallest),
       // while all others consider 3 to be the smallest value.
      .then(stepWithMultipleHiding(Set(
        { hiddenProcs: Set(1), targetProc: 4 },
        { hiddenProcs: Set(1), targetProc: 5 },
        { hiddenProcs: Set(1), targetProc: 6 },
        { hiddenProcs: Set(1), targetProc: 7 },
        { hiddenProcs: Set(2), targetProc: 5 },
        { hiddenProcs: Set(2), targetProc: 6 },
        { hiddenProcs: Set(2), targetProc: 7 },
        )))
      // In the second round, processes 3 and 4 crash:
      // only process 5 sees all values, including process 3's value (the smallest),
      // process 6 sees process 4's value (the second smallest),
      // process 7 doesn't see a new value and sticks to 3.
      .then(stepWithMultipleHiding(Set(
        { hiddenProcs: Set(3), targetProc: 6 },
        { hiddenProcs: Set(3, 4), targetProc: 7 }) ))
      // Thus processes 5, 6, and 7 decide on different values, although K=2 and only two different
      // values are allowed.
      .expect(not(kSetAgreement))
}
