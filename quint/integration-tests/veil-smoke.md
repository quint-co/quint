# Veil CLI smoke tests

These two cases check that the CLI reports a native model checker's counterexample and accepts
a proof after auditing the compiled declarations. Run them with `npm run veil-smoke`.
Run `npm run veil-integration` for the full suite.

<!-- !test program
bash -
-->

### Invariant violations are reported with traces

The counterexample is the shortest one, as Veil searches breadth-first. The checks ignore setup
progress so the same assertions run with or without an existing Veil workspace.

<!-- !test in prints a trace on invariant violation -->
```
output=$(quint verify --backend veil --invariant inv ./testFixture/apalache/violateOnFive.qnt)
exit_code=$?
printf '%s\n' "$output" | sed -e '/^\[Veil\]/d' -e '/^Downloading elan /d' \
  -e '/^Setting up Veil in /d' -e '/^Building the Quint library for Lean in /d' \
  -e 's/([0-9]*ms)/(duration)/'
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

### An invariant is proved with the invariants that make it inductive

`mutex` is not inductive on its own. The proof file names `mutex` and
`freeWhenEmpty` in `(invariants := [...])`, and `holds_by_invariants` proves
`mutex` from the theorems that `#gen_theorems` declares for the two invariants.

<!-- !test in proves an invariant with the invariants that strengthen it -->
```
set -o pipefail
quint verify --backend veil --main semaphore --invariants mutex \
  --proofs ./testFixture/veil/semaphore_proofs.lean ./testFixture/veil/semaphore.qnt 2>&1 |
  sed -e '/^Downloading elan /d' -e '/^Setting up Veil in /d' \
    -e '/^Building the Quint library for Lean in /d' -e 's/([0-9]*ms)/(duration)/'
```

<!-- !test out proves an invariant with the invariants that strengthen it -->
```
[Veil] Checking the proofs of ./testFixture/veil/semaphore_proofs.lean...
✓ mutex is proved
[ok] Every proof checks (duration).
```
