import Quint
import SemaphoreBroken

/-! `mutex` of `semaphore.qnt`, in a proof that imports a file with an error. -/

quint_module "semaphore.qnt" (main := semaphore) (smt := true) (invariants := [mutex, freeWhenEmpty])

theorem mutex_holds : holds% mutex := by holds_by_invariants

end semaphore
