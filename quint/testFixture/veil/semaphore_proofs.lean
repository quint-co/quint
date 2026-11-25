module

public import Quint

/-! `mutex` of `semaphore.qnt`, for every set of processes. On its own, `mutex` is not inductive: a process
could enter while another one is in its critical section with the lock free. `freeWhenEmpty` rules that
state out, and `holds_by_invariants` proves `mutex` from the two of them. -/

set_option veil.smt.trust false

quint_module "semaphore.qnt" (main := semaphore) (smt := true) (invariants := [mutex, freeWhenEmpty])

#gen_theorems

theorem mutex_holds : holds% mutex := by holds_by_invariants

end semaphore
