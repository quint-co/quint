module

public import Quint

/-! `mutex` of `semaphore.qnt`, proved as `semaphore_proofs.lean` proves it, but with Veil's default
`veil.smt.trust`: the answers of the SMT solver close the goals of `#gen_theorems` without a proof that
Lean's kernel checks, which only `--trust-smt` counts. -/

quint_module "semaphore.qnt" (main := semaphore) (smt := true) (invariants := [mutex, freeWhenEmpty])

#gen_theorems

theorem mutex_holds : holds% mutex := by holds_by_invariants

end semaphore
