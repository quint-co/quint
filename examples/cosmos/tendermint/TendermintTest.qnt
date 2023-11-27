// Tests that demonstrate typical behavior.
module TendermintTest {
  import Tendermint.* from "./Tendermint"
  export Tendermint.*

  // Quint will automatically compute the unchanged block in the future
  action unchangedAll = all {
    step' = step,
    fired_action' = fired_action,
    round' = round,
    validValue' = validValue,
    validRound' = validRound,
    msgsPrevote' = msgsPrevote,
    msgsPropose' = msgsPropose,
    msgsPrecommit' = msgsPrecommit,
    decision' = decision,
    lockedValue' = lockedValue,
    lockedRound' = lockedRound,
    evidencePropose' = evidencePropose,
    evidencePrevote' = evidencePrevote,
    evidencePrecommit' = evidencePrecommit,
  }

  // three correct processes behave and decide on the same value
  run decisionTest = {
    if (size(Corr) >= 3) {
      nondet v = oneOf(ValidValues)
      val p1 = Proposer.get(0)
      nondet p2 = Corr.exclude(Set(p1)).oneOf()
      nondet p3 = Corr.exclude(Set(p1, p2)).oneOf()
      Init.then(InsertProposal(p1, v))
          .then(UponProposalInPropose(p1, v))
          .then(UponProposalInPropose(p2, v))
          .then(UponProposalInPropose(p3, v))
          .then(UponProposalInPrevoteOrCommitAndPrevote(p1, v, NilRound))
          .then(UponProposalInPrevoteOrCommitAndPrevote(p2, v, NilRound))
          .then(UponProposalInPrevoteOrCommitAndPrevote(p3, v, NilRound))
          .then(UponProposalInPrecommitNoDecision(p1, v, 0, NilRound))
          .then(UponProposalInPrecommitNoDecision(p2, v, 0, NilRound))
          .then(UponProposalInPrecommitNoDecision(p3, v, 0, NilRound))
          .then(all {
            assert(decision.get(p1) == v),
            assert(decision.get(p2) == v),
            assert(decision.get(p3) == v),
            unchangedAll,
          })
    } else {
      Init.then(unchangedAll)
    }
  }

  // a correct proposer cannot propose twice in the same round
  run noProposeTwiceTest = {
    val p1 = Proposer.get(0)
    Init.then(InsertProposal(p1, "v0"))
        .then(InsertProposal(p1, "v1"))
        .fail()
  }

  // a correct proposer proposes but other processes timeout
  run timeoutProposeTest = {
    if (size(Corr) >= 3) {
      val p1 = Proposer.get(0)
      nondet p2 = Corr.exclude(Set(p1)).oneOf()
      nondet p3 = Corr.exclude(Set(p1, p2)).oneOf()
      Init.then(InsertProposal(p1, "v0"))
          .then(UponProposalInPropose(p1, "v0"))
          .then(OnTimeoutPropose(p2))
          .then(OnTimeoutPropose(p3))
          .then(
            val E = msgsPrevote.get(0).filter(m => m.src.in(Corr))
            UponQuorumOfPrevotesAny(p1, E)
              .then(UponQuorumOfPrevotesAny(p2, E))
              .then(UponQuorumOfPrevotesAny(p3, E))
          )
          .then(
            val E = msgsPrecommit.get(0).filter(m => m.src.in(Corr))
            UponQuorumOfPrecommitsAny(p1, E)
              .then(UponQuorumOfPrecommitsAny(p2, E))
              .then(UponQuorumOfPrecommitsAny(p3, E))
          )
          .then(all {
            // all correct processes switch to the next round
            assert(Corr.forall(p => round.get(p) == 1)),
            unchangedAll,
          })
    } else {
      Init.then(unchangedAll)
    }
  }
}
