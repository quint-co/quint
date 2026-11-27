module

public import Quint

/-! `mutex` of `semaphore.qnt`, proved in a file that also holds a command that prints, and a theorem whose
proof fails. -/

set_option veil.smt.trust false

quint_module "semaphore.qnt" (main := semaphore) (smt := true) (invariants := [mutex, freeWhenEmpty])

#gen_theorems

theorem mutex_holds : holds% mutex := by holds_by_invariants

#check Nat

theorem unfinished : 1 = 2 := by rfl

end semaphore
