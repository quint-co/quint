module

public import Veil

/-! Proof rules for the temporal properties of a Quint spec, which `prove_temporal_by` proves in the proof mode of
Lentil.

The fairness of an action `A` reaches a proof as `◇□ E → □◇ D`, where `E` and `D` are the disjunctions of
`Enabled a` and `⟨ a ⟩` over the actions `a` that the embedding declares for the `⟨A⟩_v` steps of `A`'s
alternatives (`Quint.Temporal`), and not as Lentil's `𝒲ℱ a` of one action. `wf1_inv` takes it in that form.
`unveil_temporal` turns an obligation about one step into first-order goals over the state's fields only when the
step is a step of one action, so `or_and_implies` first splits an obligation about `⟨ a ⟩ ∨ ⟨ b ⟩` into one for each
action. Lentil has no rule for a leads-to that a decreasing rank proves, which `leads_to_by_rank` is. -/

public section

namespace Quint.Liveness

open Lentil

/-- `◇ q` from `¬ q ↝ q`: either `q` holds already, or it follows from `¬ q`. -/
theorem eventually_of_leads_to_not {σ : Type} (q : pred σ) : ((¬ q) ↝ q) |-tl- (◇ q) := by
  intro e i h
  by_cases hq : q e i
  · exact ⟨0, by simpa using hq⟩
  · obtain ⟨k, hk⟩ := h 0 (by simpa [tl_not] using hq)
    exact ⟨k, by simpa using hk⟩

/-- `P ↝ Q` from a rank that every step out of `P` lowers, until `Q` holds. -/
theorem leads_to_by_rank {σ : Type} {P Q : pred σ} (m : σ → Nat) :
    (∀ k : Nat, ((P ∧ ¬ Q ∧ ⌜fun s => m s = k⌝) ↝ (Q ∨ (P ∧ ⌜fun s => m s < k⌝)))) |-tl- (P ↝ Q) := by
  intro e i h
  simp only [tl_forall, leads_to, always, tl_implies, eventually, tl_and, tl_or, tl_not, state_pred] at h ⊢
  suffices hs : ∀ k j, m (e (i + j)) = k → P e (i + j) → ∃ l, Q e (i + j + l) from
    fun j hP => hs _ j rfl hP
  intro k
  induction k using Nat.strongRecOn with
  | _ k ih =>
    intro j hk hP
    by_cases hQ : Q e (i + j)
    · exact ⟨0, by simpa using hQ⟩
    · obtain ⟨l, hl⟩ := h k j ⟨hP, hQ, hk⟩
      rcases hl with hq | ⟨hP', hlt⟩
      · exact ⟨l, hq⟩
      · obtain ⟨l', hl'⟩ := ih _ hlt (j + l) (by simp [Nat.add_assoc])
          (by simpa [Nat.add_assoc] using hP')
        exact ⟨l + l', by simpa [Nat.add_assoc] using hl'⟩

/-- WF1 for a fairness assumption `◇□ E → □◇ D`, with an invariant `inv` of every state, which each step's
obligation may assume before and after the step. -/
theorem wf1_inv {σ : Type} {p q E D : pred σ} (inv : σ → Prop) (next : σ → σ → Prop) :
    ((p ∧ ⌜inv⌝ ∧ ⟨next⟩ ∧ ◯ ⌜inv⌝ ⇒ ◯ (p ∨ q)) ∧ (D ∧ p ∧ ⌜inv⌝ ∧ ⟨next⟩ ∧ ◯ ⌜inv⌝ ⇒ ◯ q) ∧
      (p ∧ ⌜inv⌝ ⇒ E)) |-tl-
    ((□ ⟨next⟩ ∧ □ ⌜inv⌝) ∧ ((◇□ E) → □◇ D) → p ↝ q) := by
  intro e i ⟨h1, h2, h3⟩ ⟨⟨hn, hi⟩, hw⟩
  simp only [always_implies, always, tl_implies, tl_and, tl_or, action_pred, later, state_pred, leads_to,
    eventually] at h1 h2 h3 hn hi hw ⊢
  intro k hp
  refine Classical.byContradiction fun hq => ?_
  have hq' : ∀ l, ¬ q e (i + k + l) := fun l h => hq ⟨l, h⟩
  -- Without `q`, `p` holds from `k` on.
  have hpl : ∀ l, p e (i + k + l) := by
    intro l
    induction l with
    | zero => simpa using hp
    | succ l ih =>
      rcases h1 (k + l) ⟨by simpa [Nat.add_assoc] using ih, by simpa [Nat.add_assoc] using hi (k + l),
          by simpa [Nat.add_assoc] using hn (k + l), by simpa [Nat.add_assoc] using hi (k + l + 1)⟩ with h | h
      · simpa [Nat.add_assoc] using h
      · exact absurd (by simpa [Nat.add_assoc] using h) (hq' (l + 1))
  obtain ⟨j, hj⟩ := hw ⟨k, fun l => by
    simpa [Nat.add_assoc] using h3 (k + l) ⟨by simpa [Nat.add_assoc] using hpl l,
      by simpa [Nat.add_assoc] using hi (k + l)⟩⟩ k
  exact hq' (j + 1) (by simpa [Nat.add_assoc] using h2 (k + j) ⟨by simpa [Nat.add_assoc] using hj,
    by simpa [Nat.add_assoc] using hpl j, by simpa [Nat.add_assoc] using hi (k + j),
    by simpa [Nat.add_assoc] using hn (k + j), by simpa [Nat.add_assoc] using hi (k + j + 1)⟩)

/-- An obligation about a step of one of the actions `A ∨ B`, as one obligation for each. -/
theorem or_and_implies {σ : Type} {A B X Y : pred σ} :
    ((A ∧ X ⇒ Y) ∧ (B ∧ X ⇒ Y)) |-tl- ((A ∨ B) ∧ X ⇒ Y) := by
  intro e i ⟨ha, hb⟩ k ⟨hab, hx⟩
  rcases hab with h | h
  · exact ha k ⟨h, hx⟩
  · exact hb k ⟨h, hx⟩

end Quint.Liveness
