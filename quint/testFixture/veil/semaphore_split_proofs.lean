import Quint
import SemaphoreLemmas

/-! `mutex` of `semaphore.qnt`, from the theorem of `SemaphoreLemmas.lean`. -/

quint_module "semaphore.qnt" (main := semaphore) (smt := true) (invariants := [mutex, freeWhenEmpty])

theorem mutex_holds : holds% mutex := mutex_inductive

end semaphore
