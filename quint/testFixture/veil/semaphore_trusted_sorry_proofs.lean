module

public import Quint

/-! `semaphore_trusted_proofs.lean`, with a lemma that a `sorry` leaves unfinished. -/

quint_module "semaphore.qnt" (main := semaphore) (smt := true) (invariants := [mutex, freeWhenEmpty])

#gen_theorems

theorem mutex_holds : holds% mutex := by holds_by_invariants

theorem later : 1 + 1 = 2 := by sorry

end semaphore
