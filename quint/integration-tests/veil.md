# Integration tests of `quint verify --backend veil`

All of the test inputs in the following test cases are commands executed by
`bash`.

The first test that runs Veil downloads elan, and through it Lean, Veil and
Veil's dependencies, into `QUINT_HOME` (`~/.quint` unless set), and builds them:
it takes several minutes and needs to reach GitHub and `release.lean-lang.org`.
Later runs reuse the build. Each test elaborates the spec in Lean, and most of the
tests build a model checker. `npm run veil-integration` runs the tests one at a
time, since a model checker takes gigabytes to build.

<!-- !test program
bash -
-->

## Successful verification

### Explores every reachable state of two-phase commit

Veil's checker explores every reachable state, as TLC does, rather than the
traces of up to `--max-steps` steps.

<!-- !test in explores every state -->
```
quint verify --backend veil --main=two_phase_commit_3 --invariant=consistency \
  ../examples/classic/distributed/TwoPhaseCommit/two_phase_commit.qnt 2>&1 | grep -E '^\[Veil\] Explored|^\[ok\]' | sed -e 's/([0-9]*ms)/(duration)/'
```

<!-- !test out explores every state -->
```
[Veil] Explored 288 states.
[ok] No violation found (duration).
```

### A second check of the same spec runs the checker that the first one built

The first check has Veil build the checker, and the workspace keeps it. A later
check of the same spec runs that checker without loading the spec in Lean, and
Veil builds nothing, which would show as a `VEIL_BUILD_ONLY` line.

<!-- !test in reuses the checker -->
```
check() {
  quint verify --backend veil --main=two_phase_commit_3 --invariant=consistency --verbosity 4 \
    ../examples/classic/distributed/TwoPhaseCommit/two_phase_commit.qnt 2>&1 |
    grep -E '^\[Veil\] Explored|^\[ok\]|VEIL_BUILD_ONLY' | sed -e 's/([0-9]*ms)/(duration)/'
}
check > /dev/null
check
```

<!-- !test out reuses the checker -->
```
[Veil] Explored 288 states.
[ok] No violation found (duration).
```

### Explores only the states where the state constraints hold

The counter of [counter.qnt](../testFixture/veil/counter.qnt) grows without
bound, and the state constraint `belowFive` leaves 5 of its states. A state in
which the constraint fails is not counted.

<!-- !test in explores the states of a state constraint -->
```
quint verify --backend veil ./testFixture/veil/counter.qnt \
  --state-constraints belowFive 2>&1 | grep -E '^\[Veil\] Explored|^\[ok\]' | sed -e 's/([0-9]*ms)/(duration)/'
```

<!-- !test out explores the states of a state constraint -->
```
[Veil] Explored 5 states.
[ok] No violation found (duration).
```

### Refuses a state constraint that is not the name of a definition

<!-- !test in refuses an expression as a state constraint -->
```
quint verify --backend veil ./testFixture/veil/counter.qnt --state-constraints 'n < 5'
```

<!-- !test exit 1 -->
<!-- !test err refuses an expression as a state constraint -->
```
error: the Veil backend takes a state constraint by the name of a definition, not n < 5
```

### Refuses state constraints in checks that do not use them

<!-- !test in refuses ignored state constraints -->
```
quint verify --backend veil ./testFixture/veil/counter.qnt \
  --symbolic --state-constraints belowFive 2>&1 | grep '^error'
```

<!-- !test out refuses ignored state constraints -->
```
error: --state-constraints cannot be combined with --symbolic
```

### Finds no deadlock where every state has a successor

Like TLC run by `--backend tlc`, Veil does not report a state without
successors, which Apalache reports as a deadlock.

<!-- !test check does not report deadlocks -->
```
quint verify --backend veil ./testFixture/apalache/deadlock.qnt
```

## Violations

### Invariant violations are reported with traces

The counterexample is the shortest one, as Veil searches breadth-first.

<!-- !test in prints a trace on invariant violation -->
```
output=$(quint verify --backend veil --invariant inv ./testFixture/apalache/violateOnFive.qnt)
exit_code=$?
echo "$output" | grep -v '^\[Veil\]' | sed -e 's/([0-9]*ms)/(duration)/'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test err prints a trace on invariant violation -->
```
error: found a counterexample
```

<!-- !test out prints a trace on invariant violation -->
```
An example execution:

[State 0] { n: 1 }

[State 1] { n: 2 }

[State 2] { n: 3 }

[State 3] { n: 4 }

[State 4] { n: 5 }

[violation] Found an issue (duration).
```

### Writes a Lean-escaped invariant name with its original Quint spelling

`safety` is a keyword in Lean's Veil syntax, so the generated Lean declaration is
named `safety_`. Its user-facing invariant label remains `safety`.

<!-- !test in round trips an escaped invariant name -->
```
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
cat > "$tmp/escaped-name.qnt" <<'EOF'
module escapedName {
  var n: int
  action init = n' = 1
  action step = n' = n
  invariant safety = n == 0
}
EOF
quint verify --backend veil --out "$tmp/out.json" "$tmp/escaped-name.qnt" >/dev/null 2>&1
printf 'exit: %s\n' "$?"
jq -c '.violated' "$tmp/out.json"
```

<!-- !test out round trips an escaped invariant name -->
```
exit: 1
["safety"]
```

### Invariant violations write ITF to file when `--out-itf` is specified

<!-- !test in writes an ITF trace to file -->
```
output=$(quint verify --backend veil --out-itf violateOnFive.itf.json --invariant inv ./testFixture/apalache/violateOnFive.qnt)
jq -c '[.vars, (.states | map(.n."#bigint"))]' violateOnFive.itf.json
rm ./violateOnFive.itf.json
```

<!-- !test err writes an ITF trace to file -->
```
error: found a counterexample
```

<!-- !test out writes an ITF trace to file -->
```
[["n"],["1","2","3","4","5"]]
```

## Observations

These tests use [properties.qnt](../testFixture/simulator/properties.qnt), in
which `n` counts from 0 to 4. The declared invariants hold, the observation
`two` is reached, and the observation `negative` is never reached. Veil looks
for observations as TLC does.

### Names the declared observations without searching for them

<!-- !test in names the declared observations -->
```
quint verify --backend veil ./testFixture/simulator/properties.qnt | grep -e '^\[ok\]' -e 'search-observations' | sed -e 's/([0-9]*ms)/(duration)/'
```

<!-- !test out names the declared observations -->
```
[ok] No violation found (duration).
Use --search-observations to search for the observations two, negative.
```

### Searches for the declared observations with `--search-observations`

<!-- !test in searches for the declared observations -->
```
quint verify --backend veil --search-observations ./testFixture/simulator/properties.qnt | grep -e '^\[ok\]' -e '^\[warning\]' -e '^Observations:' -e 'observed$' | sed -e 's/([0-9]*ms)/(duration)/'
```

<!-- !test out searches for the declared observations -->
```
[ok] No violation found (duration).
[warning] No reachable state satisfies negative.
Observations:
two was observed
negative was not observed
```

### Stops at the first state that reaches an `--observation`

<!-- !test in observation stops -->
```
quint verify --backend veil --observation two ./testFixture/simulator/properties.qnt | grep -e '^\[observed\]' | sed -e 's/([0-9]*ms)/(duration)/'
```

<!-- !test out observation stops -->
```
[observed] Observed two, which stopped the run (duration).
```

### Fails when no reachable state satisfies an `--observation`

<!-- !test in observation not reached -->
```
quint verify --backend veil --observation negative ./testFixture/simulator/properties.qnt 2>&1 | grep -e '^\[not observed\]' -e '^error' | sed -e 's/([0-9]*ms)/(duration)/'
```

<!-- !test out observation not reached -->
```
[not observed] No reachable state satisfies negative (duration).
error: Observation not reached
```

### Rejects observations with `--inductive-invariant` and `--proofs`

Both prove invariants only.

<!-- !test in observations with induction or proofs -->
```
quint verify --backend veil --inductive-invariant=nonNegative --observation two ./testFixture/simulator/properties.qnt 2>&1 | grep '^error'
quint verify --backend veil --proofs=proofs.lean --invariants nonNegative --search-observations ./testFixture/simulator/properties.qnt 2>&1 | grep '^error'
```

<!-- !test out observations with induction or proofs -->
```
error: --observation cannot be combined with --inductive-invariant
error: --search-observations cannot be combined with --proofs
```

## Temporal properties

### A temporal property that holds

<!-- !test in temporal property holds -->
```
quint verify --backend veil --temporal eventuallyOne ./testFixture/apalache/temporalTest.qnt 2>&1 | grep -E '^\[ok\]' | sed -e 's/([0-9]*ms)/(duration)/'
```

<!-- !test out temporal property holds -->
```
[ok] No violation found (duration).
```

### A violated temporal property is reported with a lasso

The counterexample ends where it repeats from: here the counter cycles through
its five values without ever reaching zero.

<!-- !test in temporal violation lasso -->
```
quint verify --backend veil --temporal eventuallyZero ./testFixture/apalache/temporalTest.qnt 2>&1 | grep -E '^\[State|^The last state|^error'
```

<!-- !test out temporal violation lasso -->
```
[State 0] { n: 1 }
[State 1] { n: 2 }
[State 2] { n: 3 }
[State 3] { n: 4 }
[State 4] { n: 5 }
The last state steps back to [State 0], and the execution repeats from there forever.
error: found a counterexample
```

### A behavior may stutter at any step

As TLC finds it, without fairness the counter may stop at 1 and never reach 2.

<!-- !test in temporal violation stuttering -->
```
quint verify --backend veil --temporal zeroLeadsToTwoNoFairness ./testFixture/apalache/tlcLeadsTo.qnt 2>&1 | grep -E '^\[State|^The last state'
```

<!-- !test out temporal violation stuttering -->
```
[State 0] { n: 0 }
[State 1] { n: 1 }
The last state steps back to [State 1], and the execution repeats from there forever.
```

### Fairness is TLA+'s

With weak fairness of `step`, the counter that cycles 0, 1, 2 reaches 2 from 0.

<!-- !test in fairness holds -->
```
quint verify --backend veil --temporal zeroLeadsToTwo ./testFixture/apalache/tlcLeadsTo.qnt 2>&1 | grep -E '^\[ok\]' | sed -e 's/([0-9]*ms)/(duration)/'
```

<!-- !test out fairness holds -->
```
[ok] No violation found (duration).
```

### A formula about steps is refused

`NeverChangeColor` claims that no step changes a node's color. Veil's model
checker has no atom that relates the two states of a step.

<!-- !test in refuses claimed step formulas -->
```
quint verify --backend veil --main=ewd840_3 --temporal NeverChangeColor ../examples/classic/distributed/ewd840/ewd840.qnt 2>&1 | grep -o 'a formula about steps is supported only as the action of weakFair, strongFair and enabled'
```

<!-- !test out refuses claimed step formulas -->
```
a formula about steps is supported only as the action of weakFair, strongFair and enabled
```

### A formula about steps is refused where a property assumes it

<!-- !test in refuses assumed step formulas -->
```
quint verify --backend veil --main=ewd840_3 --temporal AllNodesTerminateIfNoMessages ../examples/classic/distributed/ewd840/ewd840.qnt 2>&1 | grep -o 'a formula about steps is supported only as the action of weakFair, strongFair and enabled'
```

<!-- !test out refuses assumed step formulas -->
```
a formula about steps is supported only as the action of weakFair, strongFair and enabled
```

## Inductive invariants

An inductive invariant is proved by Veil's SMT backend rather than by its model
checker, in the phases that the Apalache backend checks it in.

### An inductive invariant is proved, with the invariant it implies

<!-- !test in proves an inductive invariant -->
```
quint verify --backend veil --main lock --inductive-invariant safe --invariant mutex \
  ./testFixture/veil/lock.qnt 2>&1 | sed -e 's/([0-9]*ms)/(duration)/'
```

<!-- !test out proves an inductive invariant -->
```
> [1/3] Checking whether the inductive invariant 'safe' holds in the initial state(s) defined by 'init'...
> [2/3] Checking whether 'step' preserves the inductive invariant 'safe'...
> [3/3] Checking whether the inductive invariant 'safe' implies 'mutex'...
[ok] No violation found (duration).
Use --verbosity to produce more (or less) output.
```

### A counterexample to induction is reported with its two states

`mutex` holds in every reachable state, but it is not inductive on its own. Its
reads of `stage` rely on `stageKeys`, which is checked with it. A state is found
in which one process is in its critical section while another one waits for a
free lock. In that state, `enter` lets the other process in too.

<!-- !test in reports a counterexample to induction -->
```
output=$(quint verify --backend veil --main lockMutexOnly --inductive-invariant mutex ./testFixture/veil/lock.qnt)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test err reports a counterexample to induction -->
```
error: the inductive invariant fails after enter
```

<!-- !test out reports a counterexample to induction -->
```
> [1/3] Checking whether the inductive invariant 'mutex' holds in the initial state(s) defined by 'init'...
> [2/3] Checking whether 'step' preserves the inductive invariant 'mutex'...
An example execution:

[State 0]
{
  entries: 0,
  lock: Free,
  stage:
    Map(
      "a" -> { at: Critical, visits: 0 },
      "b" -> { at: Waiting, visits: -1 },
      "c" -> { at: Idle, visits: 0 }
    )
}

[State 1]
{
  entries: 1,
  lock: HeldBy("b"),
  stage:
    Map(
      "a" -> { at: Critical, visits: 0 },
      "b" -> { at: Critical, visits: 0 },
      "c" -> { at: Idle, visits: 0 }
    )
}

[violation] Found an issue (duration).
```

### The keys of a map that no step changes are proved with the inductive invariant

In `lock`, `mutex` reads `stage.get(p)`, but no invariant of the check states
the keys of `stage`. However, `init` gives `stage` the keys `procs`, and each
step changes the stage of one of them. So the check adds `stage.keys() == procs`
and proves it together with `mutex`. `mutex` isn't inductive on its own, and the
check fails as it does in `lockMutexOnly`.

<!-- !test in adds the keys of a map that no step changes -->
```
quint verify --backend veil --main lock --inductive-invariant mutex ./testFixture/veil/lock.qnt 2>&1 | grep -E '^\[Veil\]|^error'
```

<!-- !test out adds the keys of a map that no step changes -->
```
[Veil] Added stage.keys() == procs (from init) to the invariants of this check; it is proved together with them.
error: the inductive invariant fails after enter
```

### A map read at a key that the map may lack is checked

In [ballot.qnt](../testFixture/veil/ballot.qnt), a vote picks a participant
among the keys of `votes`, so these keys stay `participants`. However, `quint`
can't tell that the participant is one of `participants`, and it adds no
invariant for the keys of `votes`. So `counted` reads `votes` at keys that the
check doesn't know `votes` has. A read at a key that a map lacks gives an
unspecified value, and every execution starts in `init`, where the keys of
`votes` are `participants`. So `counted` holds.

<!-- !test in checks a map read at a key that the map may lack -->
```
quint verify --backend veil --main ballot --symbolic --max-steps 2 --invariant counted ./testFixture/veil/ballot.qnt 2>&1 | sed -e 's/([0-9]*ms)/(duration)/'
```

<!-- !test out checks a map read at a key that the map may lack -->
```
[Veil] Checking counted in every execution of up to 2 steps, for every value of the constants...
✓ counted holds in every execution of up to 2 steps
[ok] No violation found (duration).
You may increase --max-steps.
```

### An invariant that is not implied is reported with the state that breaks it

<!-- !test in reports an invariant that is not implied -->
```
output=$(quint verify --backend veil --main lock --inductive-invariant safe --invariant fewEntries ./testFixture/veil/lock.qnt)
exit_code=$?
echo "$output" | grep -v '^>' | sed -e 's/([0-9]*ms)/(duration)/'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test err reports an invariant that is not implied -->
```
error: fewEntries fails in a state where the inductive invariant holds
```

<!-- !test out reports an invariant that is not implied -->
```
An example execution:

[State 0]
{
  entries: 3,
  lock: HeldBy("a"),
  stage:
    Map(
      "a" -> { at: Critical, visits: 1 },
      "b" -> { at: Idle, visits: 1 },
      "c" -> { at: Idle, visits: 1 }
    )
}

[violation] Found an issue (duration).
```

## Invariant synthesis

Veil's invariant synthesizer, `#updr`, searches for the invariants that make an
invariant inductive, for every value of the constants. Veil then certifies what
it found with a theorem that Lean's kernel checks.

### An invariant is made inductive with the clauses that `#updr` finds

`mutex` of [semaphore.qnt](../testFixture/veil/semaphore.qnt) isn't inductive
on its own. `#updr` finds the clause that `freeWhenEmpty` states by hand in
`semaphore_proofs.lean`, meaning that no process is in its critical section
while the lock is free.

<!-- !test in synthesizes an inductive invariant -->
```
quint verify --backend veil --main semaphore --synthesize-invariant mutex ./testFixture/veil/semaphore.qnt 2>&1 |
  grep -v '^Veil.s solver calls' | sed -e 's/([0-9]*ms)/(duration)/'
```

<!-- !test out synthesizes an inductive invariant -->
```
[Veil] Searching with #updr for invariants that make mutex inductive, for every value of the constants...
Veil found 1 strengthening clause, at frame 1:
invariant [ic3_0] ∀ (x0 : str), ¬ critical x0 ∨ ¬ free
Certified: theorem semaphore.ic3_safe, on the axioms propext, Classical.choice, Quot.sound; kernel-checked, standard axioms only.
[ok] Found an inductive invariant that proves mutex (duration).
```

### A search that finds no invariant says why, as Veil writes it

In [token.qnt](../testFixture/veil/token.qnt), a token passes between nodes,
and `finish` fires only when no node holds the token. `neverStopped` holds, but
the invariant that it needs, that some node holds the token, is existential.
`#updr` searches for universal clauses only, and Veil explains why none of them
proves `neverStopped`.

<!-- !test in reports a search that finds no invariant -->
```
quint verify --backend veil --main token --synthesize-invariant neverStopped ./testFixture/veil/token.qnt 2>&1 |
  grep -oE '^No universal inductive invariant [^.]*|^error: .*'
```

<!-- !test out reports a search that finds no invariant -->
```
No universal inductive invariant over the module's vocabulary proves the declared invariants
error: Veil found no inductive invariant that proves neverStopped
```

### A search is refused with another check, or with another backend

`#updr` makes an invariant inductive, so a search can't be combined with the
other checks of invariants. Only Veil runs `#updr`.

<!-- !test in refuses a search in another check -->
```
quint verify --backend veil --main semaphore --synthesize-invariant mutex --symbolic ./testFixture/veil/semaphore.qnt 2>&1 | grep '^error'
quint verify --backend veil --main semaphore --synthesize-invariant mutex --inductive-invariant mutex ./testFixture/veil/semaphore.qnt 2>&1 | grep '^error'
quint verify --main semaphore --synthesize-invariant mutex ./testFixture/veil/semaphore.qnt 2>&1 | grep '^error'
```

<!-- !test out refuses a search in another check -->
```
error: --synthesize-invariant cannot be combined with --symbolic
error: --synthesize-invariant cannot be combined with --inductive-invariant
error: --synthesize-invariant applies only to --backend veil
```

## Bounded symbolic checks

A symbolic check asks Veil's SMT solver whether an execution of up to
`--max-steps` steps breaks an invariant, for every value of the constants. The
counter of [violateOnFive.qnt](../testFixture/apalache/violateOnFive.qnt) starts
at 1 and breaks `inv` after 4 steps.

### An invariant holds in every execution of up to `--max-steps` steps

<!-- !test in symbolic check holds -->
```
quint verify --backend veil --invariant inv --symbolic --max-steps 3 ./testFixture/apalache/violateOnFive.qnt 2>&1 |
  sed -e 's/([0-9]*ms)/(duration)/'
```

<!-- !test out symbolic check holds -->
```
[Veil] Checking inv in every execution of up to 3 steps, for every value of the constants...
✓ inv holds in every execution of up to 3 steps
[ok] No violation found (duration).
You may increase --max-steps.
```

### A violation is shown as Veil writes it, after the fewest steps

Veil shows the states in the fields of the SMT encoding.

<!-- !test in symbolic check finds a violation -->
```
output=$(quint verify --backend veil --invariant inv --symbolic --max-steps 5 ./testFixture/apalache/violateOnFive.qnt)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test err symbolic check finds a violation -->
```
error: inv is violated
```

<!-- !test out symbolic check finds a violation -->
```
[Veil] Checking inv in every execution of up to 5 steps, for every value of the constants...
✗ inv fails after 4 steps:
  State 0 (via init):
    n = 1
  State 1 (via step_):
    n = 2
  State 2 (via step_):
    n = 3
  State 3 (via step_):
    n = 4
  State 4 (via step_):
    n = 5
[violation] Found an issue (duration).
```

### A symbolic check is refused with temporal properties, observations or another backend

<!-- !test in refuses a symbolic check of temporal properties -->
```
quint verify --backend veil --symbolic --temporal eventuallyOne ./testFixture/apalache/temporalTest.qnt 2>&1 | grep '^error'
quint verify --backend veil --symbolic --observation two ./testFixture/simulator/properties.qnt 2>&1 | grep '^error'
quint verify --symbolic --invariant inv ./testFixture/apalache/violateOnFive.qnt 2>&1 | grep '^error'
```

<!-- !test out refuses a symbolic check of temporal properties -->
```
error: --temporal cannot be combined with --symbolic
error: --observation cannot be combined with --symbolic
error: --symbolic applies only to --backend veil
```

## Proofs

A proof file is a Lean file that proves an invariant for every value of the
constants. It is checked against the spec as the spec is compiled now.

### An invariant is proved with the invariants that make it inductive

`mutex` is not inductive on its own. The proof file names `mutex` and
`freeWhenEmpty` in `(invariants := [...])`, and `holds_by_invariants` proves
`mutex` from the theorems that `#gen_theorems` declares for the two invariants.

<!-- !test in proves an invariant with the invariants that strengthen it -->
```
quint verify --backend veil --main semaphore --invariants mutex \
  --proofs ./testFixture/veil/semaphore_proofs.lean ./testFixture/veil/semaphore.qnt 2>&1 | sed -e 's/([0-9]*ms)/(duration)/'
```

<!-- !test out proves an invariant with the invariants that strengthen it -->
```
[Veil] Checking the proofs of ./testFixture/veil/semaphore_proofs.lean...
✓ mutex is proved
[ok] Every proof checks (duration).
```

### Proves a temporal property for every value of the constants

`fairness_proofs.lean` proves `stepFairDone` with Veil's `prove_temporal_by`, and
closes its obligation `holds_temporal% stepFairDone` with `holds_by_temporal_proof`.

<!-- !test in proves a temporal property -->
```
quint verify --backend veil --temporal stepFairDone \
  --proofs ./testFixture/veil/fairness_proofs.lean ./testFixture/veil/fairness.qnt 2>&1 | sed -e 's/([0-9]*ms)/(duration)/'
```

<!-- !test out proves a temporal property -->
```
[Veil] Checking the proofs of ./testFixture/veil/fairness_proofs.lean...
✓ stepFairDone is proved
[ok] Every proof checks (duration).
```

The proof file names exactly the temporal properties that the check proves,
since they decide the actions of the module.

<!-- !test in refuses other temporal properties than the proof file's -->
```
quint verify --backend veil --temporal noopFairDone \
  --proofs ./testFixture/veil/fairness_proofs.lean ./testFixture/veil/fairness.qnt 2>&1 | grep '^error'
```

<!-- !test out refuses other temporal properties than the proof file's -->
```
error: the proof file's quint_module names the temporal properties stepFairDone, and the check proves noopFairDone: they must be the same, since they decide the actions of the module
```

### A proof that trusts the SMT solver counts with --trust-smt

`semaphore_trusted_proofs.lean` leaves `veil.smt.trust` at Veil's default, so the
answers of the SMT solver close the goals of `#gen_theorems` without a proof that
Lean's kernel checks. `--trust-smt` counts that proof and says what it trusts.

<!-- !test in proves an invariant trusting the SMT solver -->
```
quint verify --backend veil --main semaphore --invariants mutex --trust-smt \
  --proofs ./testFixture/veil/semaphore_trusted_proofs.lean ./testFixture/veil/semaphore.qnt 2>&1 | sed -e 's/([0-9]*ms)/(duration)/'
```

<!-- !test out proves an invariant trusting the SMT solver -->
```
[Veil] Checking the proofs of ./testFixture/veil/semaphore_trusted_proofs.lean...
✓ mutex is proved, trusting the SMT solver
[ok] Every proof checks (duration).
```

Without `--trust-smt`, the same proof does not count.

<!-- !test in refuses a trusted answer without --trust-smt -->
```
quint verify --backend veil --main semaphore --invariants mutex \
  --proofs ./testFixture/veil/semaphore_trusted_proofs.lean ./testFixture/veil/semaphore.qnt 2>&1 | head -n 2
```

<!-- !test out refuses a trusted answer without --trust-smt -->
```
[Veil] Checking the proofs of ./testFixture/veil/semaphore_trusted_proofs.lean...
✗ mutex is not proved: its proof rests on sorryAx, which a sorry, an unfinished proof or a trusted SMT answer leaves
```

A `sorry` that is written in a file of the proof leaves the proof unfinished,
with or without `--trust-smt`.

<!-- !test in refuses a written sorry with --trust-smt -->
```
quint verify --backend veil --main semaphore --invariants mutex --trust-smt \
  --proofs ./testFixture/veil/semaphore_trusted_sorry_proofs.lean ./testFixture/veil/semaphore.qnt 2>&1 | head -n 2
```

<!-- !test out refuses a written sorry with --trust-smt -->
```
[Veil] Checking the proofs of ./testFixture/veil/semaphore_trusted_sorry_proofs.lean...
✗ mutex is not proved: its proof rests on sorryAx, and a sorry is written at ./testFixture/veil/semaphore_trusted_sorry_proofs.lean:13
```

### A proof may span several files

The proof file imports `SemaphoreLemmas.lean` from its folder, and that file
proves `mutex`. Each file loads the spec in the way that the proof file does.

<!-- !test in proves an invariant in another file of the proof -->
```
quint verify --backend veil --main semaphore --invariants mutex \
  --proofs ./testFixture/veil/semaphore_split_proofs.lean ./testFixture/veil/semaphore.qnt 2>&1 | sed -e 's/([0-9]*ms)/(duration)/'
```

<!-- !test out proves an invariant in another file of the proof -->
```
[Veil] Checking the proofs of ./testFixture/veil/semaphore_split_proofs.lean...
✓ mutex is proved
[ok] Every proof checks (duration).
```

### A second check of the same proofs reuses what the first one built

The first check builds a Lean module that loads the spec with the options of
the proof file, and a module for each other file of the proof. A later check of
the same spec and options imports those modules, and Lake builds nothing, which
would show as a `Built Quint.Cache` line.

<!-- !test in reuses the module that loads the spec -->
```
check() {
  quint verify --backend veil --main semaphore --invariants mutex --verbosity 4 \
    --proofs ./testFixture/veil/semaphore_split_proofs.lean ./testFixture/veil/semaphore.qnt 2>&1 |
    grep -E '^\[ok\]|Built Quint\.Cache\.' | sed -e 's/([0-9]*ms)/(duration)/'
}
check > /dev/null
check
```

<!-- !test out reuses the module that loads the spec -->
```
[ok] Every proof checks (duration).
```

### An error in another file of the proof is reported at that file's line

`SemaphoreBroken.lean`, which the proof file imports, has a theorem whose proof
fails. Lean then checks no theorem of the proof file, and the error is reported
in full at the line of `SemaphoreBroken.lean`, with the goal that the proof
left. It is reported once with each result and once with the reason that
verification fails.

<!-- !test in reports an error of another file of the proof at its own line -->
```
quint verify --backend veil --main semaphore --invariants mutex \
  --proofs ./testFixture/veil/semaphore_broken_proofs.lean ./testFixture/veil/semaphore.qnt 2>&1 | tail -n +2
```

<!-- !test out reports an error of another file of the proof at its own line -->
```
✗ mutex is not proved: the files of the proof have errors
testFixture/veil/SemaphoreBroken.lean:7:29: Tactic `rfl` failed: The left-hand side
  1
is not definitionally equal to the right-hand side
  2

⊢ 1 = 2
error: mutex is not proved
testFixture/veil/SemaphoreBroken.lean:7:29: Tactic `rfl` failed: The left-hand side
  1
is not definitionally equal to the right-hand side
  2

⊢ 1 = 2
```

### A proof with an error anywhere proves nothing, and Lean's other messages are shown

`semaphore_unfinished_proofs.lean` proves `mutex`, but it also holds a theorem
whose proof fails. The proof is not finished, so `mutex` is not proved. The
output of its `#check` is shown with its line.

<!-- !test in fails a proof that has an error in another theorem -->
```
quint verify --backend veil --main semaphore --invariants mutex \
  --proofs ./testFixture/veil/semaphore_unfinished_proofs.lean ./testFixture/veil/semaphore.qnt 2>&1 |
  head -n 4
```

<!-- !test out fails a proof that has an error in another theorem -->
```
[Veil] Checking the proofs of ./testFixture/veil/semaphore_unfinished_proofs.lean...
✗ mutex is not proved: the files of the proof have errors
./testFixture/veil/semaphore_unfinished_proofs.lean:16:0: info: Nat : Type
./testFixture/veil/semaphore_unfinished_proofs.lean:18:33: Tactic `rfl` failed: The left-hand side
```
