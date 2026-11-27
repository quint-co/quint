// Fairness as TLA+ has it: a step of `noop` changes nothing, so it is no ⟨step⟩_vars step and does not
// make `step` fair.
module fairness {
  var done: bool
  action init = done' = false
  action finish = all { not(done), done' = true }
  action noop = done' = done
  action step = any { finish, noop }
  val vars = done
  // Holds in TLA+: a noop step leaves `vars` unchanged, so it is no ⟨step⟩_vars step.
  temporal stepFairDone = weakFair(step, vars) implies eventually(done)
  // Fails: noop never changes vars, so its fairness constrains nothing, and the behavior may stutter.
  temporal noopFairDone = weakFair(noop, vars) implies eventually(done)
  // Holds: while not done, finish can take a step.
  temporal enabledUntilDone = always(not(done) implies enabled(finish))
}
