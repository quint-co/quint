import Quint

/-! Temporal properties proved with Veil's `prove_temporal_by`, for every value of the constants, and closed as the
obligations `holds_temporal% p` that `quint verify --proofs` checks. A proof may assume the module's invariants,
which `holds_by_temporal_proof` takes from their own `holds%` proofs. The rules are those of `Quint.Liveness`. -/

open Lentil Quint.Liveness

/-! Dijkstra's termination detection on a ring (`ewd840.qnt` of the corpus, whose last definitions are the ones
the proof reads). Once every node is inactive, every step of `System` lowers the spec's `rank`, until node 0 detects
termination, which proves `liveness` for every number of nodes `N`. The proof assumes `Typed`, which
`Typed_holds` proves over the steps of the module. -/

/-- Closes a goal `rank s' < k` of the proof of `liveness` below, given `h : rank s = k`: unfolds the `forall`s
of the rank, and decides each `if` of it. -/
macro "rank_lowers " h:ident : tactic => `(tactic| (
  rw [← $h:ident]
  simp only [Quint.Set.forall_eq_true, Quint.Map.get_put, decide_eq_true_eq, Bool.or_eq_true]
  have : ("white" : String) ≠ "black" := by decide
  repeat' split
  all_goals grind))

quint_module "../../examples/classic/distributed/ewd840/ewd840.qnt" (main := ewd840) (declared := false) (invariants := [Typed]) (temporalProps := [liveness])

#gen_steps

theorem Typed_holds : holds% Typed := by
  intro N th st hr
  refine reachable_induction (P := fun _ s => (s.tpos ∈ Quint.Set.to 0 (N - 1) ∧ s.tcolor ∈ Color) ∧
    ∀ j, j ∈ Quint.Set.to 0 (N - 1) → Quint.Map.get s.color j ∈ Color) ?_ ?_ th st hr
  · intro th s _ h
    rcases h with ⟨a, c, ha, hc, n, hn⟩
    simp only [Nodes] at hc hn
    exact ⟨⟨hn, by simp [Color]⟩, fun j hj => Quint.Map.get_mem_of_mem_setOfMaps hc hj⟩
  · intro th s s' _ hP hs
    cases hs <;> simp only [Nodes, Color] at * <;> grind

prove_temporal_by [liveness]
  tclear hInit
  tintro hwf
  tapply (leads_to_by_rank (m := fun st => ((veil_term% rank) st).toNat))
  tintro k
  trevert hNext hInv hwf ; trewrite [← Lentil.and_imp, ← Lentil.and_imp]
  tapply (wf1_inv (σ := σ) (inv := veil_term% Invariants))
  tsplit_ands
  · tmonotone ; unveil_temporal ; simp only [Nodes, Color] at *
    -- A step of any action keeps the state, lowers the rank, or detects termination.
    rcases h_4 with ⟨ht, hb, rfl, rfl, rfl, rfl⟩ | ⟨x, hx, rfl, hg, rfl, rfl, rfl, rfl⟩ | ⟨x, hx, ha, -⟩ |
      ⟨x, hx, ha, -⟩ | ⟨rfl, rfl, rfl, rfl⟩ | ⟨ht, hb, -, rfl, rfl, rfl, rfl⟩ | ⟨x, hx, rfl, hg, -, rfl, rfl, rfl, rfl⟩
    · have hN : 1 ≤ N := by grind
      clear h_3 h_5
      subst ht
      right; right
      exact ⟨h, by rank_lowers h_2⟩
    · have h1 : 1 ≤ s.tpos ∧ s.tpos ≤ N - 1 := by grind
      clear h_3 h_5
      right; right
      exact ⟨h, by rank_lowers h_2⟩
    · exact absurd ha (h x (by grind))
    · exact absurd ha (h x (by grind))
    · left
      exact ⟨h, h_1, by grind⟩
    · have hN : 1 ≤ N := by grind
      clear h_3 h_5
      subst ht
      right; right
      exact ⟨h, by rank_lowers h_2⟩
    · have h1 : 1 ≤ s.tpos ∧ s.tpos ≤ N - 1 := by grind
      clear h_3 h_5
      right; right
      exact ⟨h, by rank_lowers h_2⟩
  · -- A step of `System`, a probe or a pass of the token, lowers the rank.
    tapply or_and_implies
    tsplit_ands
    all_goals (tmonotone ; unveil_temporal ; simp only [Nodes, Color] at *)
    · obtain ⟨ht, hb, -, rfl, rfl, rfl, rfl⟩ := h
      have hN : 1 ≤ N := by grind
      clear h_4 h_6
      subst ht
      right
      exact ⟨h_1, by rank_lowers h_3⟩
    · obtain ⟨x, hx, rfl, hg, -, rfl, rfl, rfl, rfl⟩ := h
      have h1 : 1 ≤ s.tpos ∧ s.tpos ≤ N - 1 := by grind
      clear h_4 h_6
      right
      exact ⟨h_1, by rank_lowers h_3⟩
  · tmonotone ; unveil_temporal ; simp only [Nodes, Color] at *
    -- Node 0 can probe, or the node that holds the token can pass it.
    have hc : Quint.Map.get s.color 0 = "white" ∨ Quint.Map.get s.color 0 = "black" := by
      have := h_3.2 0 (by grind)
      simpa using this
    by_cases ht : s.tpos = 0
    · left
      have hb : s.tcolor = "black" ∨ Quint.Map.get s.color 0 = "black" := by grind
      refine ⟨ht, hb, ?_, by simp⟩
      rcases hb with hb | hb
      · grind
      · exact fun ⟨he, _⟩ => Quint.Map.put_ne_of_get_ne (by grind) he
    · right
      exact ⟨s.tpos, by grind, rfl, by grind, by grind, by simp⟩

theorem liveness_holds : holds_temporal% liveness := by holds_by_temporal_proof

/-- info: 'ewd840.liveness_holds' depends on axioms: [propext, Classical.choice, Quot.sound] -/
#guard_msgs in
#print axioms liveness_holds

end ewd840
