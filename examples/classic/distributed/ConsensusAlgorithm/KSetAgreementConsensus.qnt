// -*- mode: Bluespec; -*-

  /******************************************************************************************************
  (* Quint Specification for Algorithm 18: K-set Consensus Algorithm in the Presence of Crash Failures  *)
  (* This specification is derived from book "Distributed Computing: Fundamentals, Simulations, and     *)
  (* Advanced Topics" (Second Edition) by Hagit Attiya and Jennifer Welch, specifically from Chapter 5, *)
  (* page 120.                                                                                          *)
  (* http://lib.ysu.am/disciplines_bk/c95d04e111f3e28ae4cc589bfda1e18b.pdf                              *)
  *******************************************************************************************************/
module KSetAgreementConsensus {
  import ConsensusAlg.* from "ConsensusAlg"
  export ConsensusAlg.*

  const K : int

  def kSetAgreement = {
    // Get all decided values (excluding None) and ensure they are unique
    val decidedValues = Procs.exclude(crashed).map(p => procState.get(p).y).filter(v => v != None)

    // Check that number of unique decided values is at most K
    decidedValues.size() <= K
  }
}

module KSetProperValues {
  //quint run --main=KSetProperValues KSetAgreementConsensus.qnt
  import KSetAgreementConsensus(N = 8, F = 3, actualFaults = 3, K = 2, MAX_ROUNDS = (3/2 + 1)).*

  run consensusRunTest =
    init
    .then((F/K + 1).reps(_ => step))
    .expect(kSetAgreement)
    .expect(validity)
}

module KSetBadValues {
  //quint run KSetAgreementConsensus.qnt --main KSetBadValues --invariant kSetAgreement --max-steps 5
  //quint test --main=KSetBadValues KSetAgreementConsensus.qnt
  import KSetAgreementConsensus(N = 8, F = 3, actualFaults = 4, K = 2, MAX_ROUNDS = (3/2 + 1)).*

  run consensusRunTest  =
    init
    .then((F/K + 1).reps(_ => step))
    .expect(validity)

  action crashProcessesFromConfig(hidingConfigs) = all {
    // Collect all processes that need to be crashed from all hiding configurations
    newlyCrashed' = flatten(hidingConfigs.map(config => config.hiddenProcs)),
    crashed' = crashed,
    round' = round,
    procState' = procState,
    correctProcsMessages' = correctProcsMessages,
    crashedProcsMessages' = crashedProcsMessages
  }

  action receiveMessagesWithHiding(hidingConfigs) = all {
    round' = round,
    correctProcsMessages' = Set(),
    crashedProcsMessages' = Set(),
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

      { ...procState.get(p), S: processedValues }
    }),
    crashed' = crashed,
    newlyCrashed' = newlyCrashed,
  }

  run stepWithMultipleHiding(hidingConfigs) =
    crashProcessesFromConfig(hidingConfigs)
      .then(sendMessages)
      .then(receiveMessagesWithHiding(hidingConfigs))
      .then(computeAction)

  // Test scenario where processes decide on different values:
  // - Process 6 doesn't receive from 1,2 => decides 3
  // - Process 5 doesn't receive from 1 => decides 2
  // - Process 8 doesn't receive from 3 => decides 1
  // - Process 7 doesn't receive from 1,2,3,4 => decides 5
  run consensusDisagreementTest =
    initializeProcsStateWithDistinctValues
    .then((F/K + 1).reps(_ => stepWithMultipleHiding(Set(
      { hiddenProcs: Set(1, 2), targetProc: 6 },
      { hiddenProcs: Set(1), targetProc: 5 },
      { hiddenProcs: Set(3), targetProc: 8 },
      { hiddenProcs: Set(1, 2, 3, 4), targetProc: 7 }
    ))))
    .expect(not(kSetAgreement))
}
