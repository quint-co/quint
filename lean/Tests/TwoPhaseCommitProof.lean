import Quint

/-! Two-phase commit, proved safe for any set of participants.

The spec is the parametric `two_phase_commit` module of `two_phase_commit.qnt`, whose constant
`participants` is left open. In the SMT encoding (`smt := true`), `str` is an uninterpreted sort, and
the spec writes no string literal, so the proofs hold for every type of names. The sets of names and the
map from them are relations and a function over that sort, which is the state Veil's SMT backend reasons
about.

`consistency` is the property; the other invariants, written in Quint next to it, make it inductive.
With only `consistency`, SMT returns counterexamples to induction for `aborts` and `commits`: one decision
of the coordinator out while a participant has taken the other, which the other invariants rule out.

With `veil.smt.trust` off, every answer cvc5 gives is rebuilt as a proof that Lean's kernel checks, so
the theorems below rest on Lean's own axioms and on nothing the solver says. -/

set_option veil.smt.trust false

quint_module "../../examples/classic/distributed/TwoPhaseCommit/two_phase_commit.qnt" (main := two_phase_commit) (smt := true)
  (declared := false) (invariants := [consistency, stageDomain, votesSubset, votesSent, sentNotWorking, commitMsg,
    abortMsg, commitHasAllVotes, committedNeedsMsg, abortedPrepared])

#gen_spec
#gen_theorems

/-! Each step preserves consistency for every type of names and every set of participants. -/

/-- info: 'two_phase_commit.commits_consistency' depends on axioms: [propext, Classical.choice, Quot.sound] -/
#guard_msgs in
#print axioms commits_consistency

/-- info: 'two_phase_commit.aborts_consistency' depends on axioms: [propext, Classical.choice, Quot.sound] -/
#guard_msgs in
#print axioms aborts_consistency

/-! So consistency holds in every reachable state, the statement `quint verify --proofs` checks. -/

theorem consistency_holds : holds% consistency := by holds_by_invariants

/-- info: 'two_phase_commit.consistency_holds' depends on axioms: [propext, Classical.choice, Quot.sound] -/
#guard_msgs in
#print axioms consistency_holds

end two_phase_commit
