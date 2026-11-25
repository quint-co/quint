import Quint

/-! The proof of `mutex` that `semaphore_split_proofs.lean` imports. -/

set_option veil.smt.trust false

quint_module "semaphore.qnt" (main := semaphore) (smt := true) (invariants := [mutex, freeWhenEmpty])

#gen_theorems

theorem mutex_inductive : holds% mutex := by holds_by_invariants

end semaphore
