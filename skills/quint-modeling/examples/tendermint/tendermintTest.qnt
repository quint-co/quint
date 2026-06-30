/* =============================================================================
 * Tests for the Tendermint Choreo reference example.
 *
 * Per the test-separation guideline (quint-lang/guidelines/tests.md), `run` tests
 * live in this file, NOT in the spec — `tendermint.qnt` has no `run` definitions.
 * Each module here instantiates the parametric `tendermint` spec with concrete
 * consts (the const-instantiation pattern) and drives a scenario:
 *   - `valid`        — a run where consensus succeeds; `line28Test` exercises the
 *                      proposal/prevote/precommit cue chain across a round change.
 *   - `no_agreement` — a faulty proposer equivocates; `disagreementTest` shows the
 *                      `agreement` invariant being violated (a counterexample demo).
 *
 * Run / test (from this directory):
 *   quint run  tendermintTest.qnt --main=valid --invariant="agreement and validity and accountability"
 *   quint test tendermintTest.qnt --main=valid
 *   quint run  tendermintTest.qnt --main=no_agreement --invariant=accountability
 *   quint test tendermintTest.qnt --main=no_agreement
 * ============================================================================= */
module valid {
  // quint run tendermintTest.qnt --main valid --invariant="agreement and validity and accountability"
  // quint test tendermintTest.qnt --main valid

  import basicSpells.* from "./spells/basicSpells"

  import tendermint(
    F = 1,
    CORRECT = Set("p1","p2", "p3"),
    FAULTY = Set("p4"),
    PROPOSER = Map(0 -> "p1", 1 -> "p2", 2 -> "p3", 3 -> "p4"),
    VALUES =  Map(0 -> "v0", 1 -> "v1", 2 -> "v2", 3 -> "v3"),
    MAX_ROUND = 4
  ).* from "./tendermint"

  run line28Test = {
    val v0_proposal = { proposal: "v0", round: 0, src: "p1", valid_round: -1 }

    init
      .then("p1".with_cue(listen_proposal_in_propose, v0_proposal).perform(broadcast_prevote_for_proposal))
      .then("p2".with_cue(listen_proposal_in_propose, v0_proposal).perform(broadcast_prevote_for_proposal))

      .then("p1".with_cue(listen_proposal_in_prevote_commit, v0_proposal).perform(lock_value_and_precommit))
      .then("p2".with_cue(listen_proposal_in_prevote_commit, v0_proposal).perform(lock_value_and_precommit))

      .then("p2".with_cue(listen_quorum_precommits_any, ()).perform(trigger_precommit_timeout))

      .then(step_with("p2", on_precommit_timeout))
      // p2 starts a new round
      .expect(s.system.get("p2").round == 1)

      // since p2 is the proposer in the new round, it will propose the stored valid value
      .expect(and {
        s.system.get("p2").stage == ProposeStage,
        s.messages.values().forall(ms => {
          ms.contains(Propose({ src: "p2", round: 1, proposal: "v0", valid_round: 0 }))
        })
      })

      // Which enables line 28 to be called by p2, as it is in propose stage and can receive
      // the new proposal with valid_round 0.
      .then("p2"
        .with_cue(listen_proposal_in_propose_prevote, { proposal: "v0", round: 1, src: "p2", valid_round: 0 })
        .perform(broadcast_prevote_with_validation)
      )
  }
}

module no_agreement {
  // Should fail:
  // quint run tendermintTest.qnt --main no_agreement --invariants=agreement validity accountability
  //
  // Should succeed (accountability should still hold):
  // quint run tendermintTest.qnt --main no_agreement --invariant=accountability
  // quint test tendermintTest.qnt --main no_agreement

  import tendermint(
    F = 1,
    CORRECT = Set("p1", "p2"),
    FAULTY = Set("p3","p4"),
    // a faulty node is the proposer in the first round
    PROPOSER = Map(0 -> "p3", 1 -> "p2", 2 -> "p3", 3 -> "p4"),
    VALUES =  Map(0 -> "v0", 1 -> "v1", 2 -> "v2", 3 -> "v3"),
    MAX_ROUND = 4
  ).* from "./tendermint"

  run disagreementTest = {
    val v0_proposal = { proposal: "v0", round: 0, src: "p3", valid_round: -1 }
    val v1_proposal = { proposal: "v1", round: 0, src: "p3", valid_round: -1 }

    init
      .then("p1".with_cue(listen_proposal_in_propose, v0_proposal).perform(broadcast_prevote_for_proposal))
      .then("p2".with_cue(listen_proposal_in_propose, v1_proposal).perform(broadcast_prevote_for_proposal))
      .then("p1".with_cue(listen_proposal_in_prevote_commit, v0_proposal).perform(lock_value_and_precommit))
      .then("p2".with_cue(listen_proposal_in_prevote_commit, v1_proposal).perform(lock_value_and_precommit))
      .then("p1".with_cue(listen_proposal_in_precommit_no_decision, v0_proposal).perform(decide_on_proposal))
      .then("p2".with_cue(listen_proposal_in_precommit_no_decision, v1_proposal).perform(decide_on_proposal))
      .expect(not(agreement))
  }
}
