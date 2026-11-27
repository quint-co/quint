module

public import Quint

/-! The proof obligations of the verification plan of `two_phase_commit.qnt`, with their proofs. Each
theorem states `holds% p`: the invariant `p` holds in every reachable state, for every value of the
constants. A proof counts when this command accepts it, on Lean's standard axioms alone, so a `sorry`
does not count:

    quint verify two_phase_commit.qnt --backend veil --main two_phase_commit --proofs two_phase_commit_proofs.lean --invariants consistency

The proof of `consistency` goes over the steps that `#gen_steps` states. It proves that `consistency`
holds together with the invariants of `Inv`, which make it inductive, and it calls no SMT solver. -/

quint_module "two_phase_commit.qnt" (main := two_phase_commit) (invariants := [consistency])

#gen_steps

/-- `consistency` and the invariants that make it inductive, in one state. -/
structure Inv (ps : Std.ExtTreeSet String compare) (s : State (FieldAbstractType ps)) : Prop where
  consistency : ∀ q ∈ Quint.Set.tuples2 ps ps,
    ¬(Quint.Map.get s.stages q.1 = .Committed ∧ Quint.Map.get s.stages q.2 = .Aborted)
  stageDomain : ∀ p, p ∈ s.stages ↔ p ∈ ps
  votesSent : ∀ p ∈ s.votes, Message.ParticipantPrepared p ∈ s.messages
  commitMsg : Message.CoordinatorCommit ∈ s.messages → s.coordinatorStage = .Committed
  abortMsg : Message.CoordinatorAbort ∈ s.messages → s.coordinatorStage = .Aborted
  committedMsg : ∀ p ∈ ps, Quint.Map.get s.stages p = .Committed →
    Message.CoordinatorCommit ∈ s.messages
  preparedWaits : ∀ p ∈ ps, Message.ParticipantPrepared p ∈ s.messages →
    s.coordinatorStage = .Working → Quint.Map.get s.stages p = .Prepared
  commitPrepared : Message.CoordinatorCommit ∈ s.messages →
    ∀ p ∈ ps, Quint.Map.get s.stages p = .Prepared ∨ Quint.Map.get s.stages p = .Committed

theorem inv_init {ps} {th : Theory ps} {s} (h : Initial th s) : Inv ps s := by
  cases h
  constructor <;> grind

theorem inv_step {ps} {th : Theory ps} {s s'} (h : Inv ps s) (hs : Step th s s') : Inv ps s' := by
  rcases h with ⟨h0, h1, h2, h3, h4, h5, h6, h7⟩
  cases hs <;> constructor <;> grind

/-- `consistency` holds in every reachable state, for any number of participants. -/
theorem consistency_holds : holds% consistency := by
  intro ps th st hr
  exact (reachable_induction (P := fun _ s => Inv ps s) (fun _ _ _ hi => inv_init hi)
    (fun _ _ _ _ hP hst => inv_step hP hst) th st hr).consistency

end two_phase_commit
