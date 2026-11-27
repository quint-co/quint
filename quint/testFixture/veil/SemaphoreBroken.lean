import Quint

/-! A file of a proof with an error in its theorem `broken`. -/

quint_module "semaphore.qnt" (main := semaphore) (smt := true) (invariants := [mutex, freeWhenEmpty])

theorem broken : 1 = 2 := by rfl

end semaphore
