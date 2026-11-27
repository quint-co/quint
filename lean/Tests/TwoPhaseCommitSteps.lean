module

public import Quint

/-! Two-phase commit proved safe for any set of participants, over the steps that `#gen_steps` states, with
`grind` closing the initializer and every step. The invariants that make `consistency` inductive are the
ones of `TwoPhaseCommitProof.lean`, stated as facts about one state. No SMT solver is called. -/

quint_module "../../examples/classic/distributed/TwoPhaseCommit/two_phase_commit.qnt" (main := two_phase_commit)
  (declared := false) (invariants := [consistency])

#gen_steps

/-- `consistency` and the invariants that make it inductive, as facts about one state. An equation between
the keys of a map and a set is stated by members, which `grind` reads. -/
structure Inv (ps : Std.ExtTreeSet String compare) (s : State (FieldAbstractType ps)) : Prop where
  consistency : ∀ q ∈ Quint.Set.tuples2 ps ps,
    ¬(Quint.Map.get s.stages q.1 = .Committed ∧ Quint.Map.get s.stages q.2 = .Aborted)
  stageDomain : ∀ p, p ∈ s.stages ↔ p ∈ ps
  votesSubset : ∀ p ∈ s.votes, p ∈ ps
  votesSent : ∀ p ∈ s.votes, Message.ParticipantPrepared p ∈ s.messages
  sentNotWorking : ∀ p ∈ ps, Message.ParticipantPrepared p ∈ s.messages → Quint.Map.get s.stages p ≠ .Working
  commitMsg : Message.CoordinatorCommit ∈ s.messages ↔ s.coordinatorStage = .Committed
  abortMsg : Message.CoordinatorAbort ∈ s.messages ↔ s.coordinatorStage = .Aborted
  commitHasAllVotes : s.coordinatorStage = .Committed → ∀ p, p ∈ s.votes ↔ p ∈ ps
  committedNeedsMsg : ∀ p ∈ ps, Quint.Map.get s.stages p = .Committed → Message.CoordinatorCommit ∈ s.messages
  abortedPrepared : ∀ p ∈ ps, Quint.Map.get s.stages p = .Aborted → Message.ParticipantPrepared p ∈ s.messages →
    Message.CoordinatorAbort ∈ s.messages

theorem inv_init {ps} {th : Theory ps} {s} (h : Initial th s) : Inv ps s := by
  cases h
  constructor <;> grind

theorem inv_step {ps} {th : Theory ps} {s s'} (h : Inv ps s) (hs : Step th s s') : Inv ps s' := by
  rcases h with ⟨h0, h1, h2, h3, h4, h5, h6, h7, h8, h9⟩
  cases hs <;> constructor <;> grind

theorem consistency_holds : holds% consistency := by
  intro ps th st hr
  exact (reachable_induction (P := fun _ s => Inv ps s) (fun _ _ _ hi => inv_init hi)
    (fun _ _ _ _ hP hst => inv_step hP hst) th st hr).consistency

/-- info: 'two_phase_commit.consistency_holds' depends on axioms: [propext, Classical.choice, Quot.sound] -/
#guard_msgs in
#print axioms consistency_holds

end two_phase_commit
