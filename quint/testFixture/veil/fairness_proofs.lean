module

public import Quint

/-! `stepFairDone` of `fairness.qnt`, by the WF1 rule of `Quint.Liveness`: while `done` is false, `finish` is
enabled, and a fair step of `step` that changes the state makes `done` true. The module states no invariant, so
`holds_by_temporal_proof` needs no `holds%` proof. -/

open Lentil Quint.Liveness

quint_module "fairness.qnt" (temporalProps := [stepFairDone])

prove_temporal_by [stepFairDone]
  tintro hwf
  tapply eventually_of_leads_to_not
  tclear hInit
  trevert hNext hInv hwf ; trewrite [← Lentil.and_imp, ← Lentil.and_imp]
  tapply (wf1_inv (σ := σ) (inv := veil_term% Invariants))
  tsplit_ands
  · tmonotone ; unveil_temporal ; grind
  · tapply or_and_implies
    tsplit_ands
    all_goals tmonotone ; unveil_temporal ; grind
  · tmonotone ; unveil_temporal ; grind

theorem stepFairDone_holds : holds_temporal% stepFairDone := by holds_by_temporal_proof

end fairness
