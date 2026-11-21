# Integration tests for invariant and observation definitions

These tests cover how `quint run` combines the `invariant` and `observation`
definitions of a spec with the flags that select properties on the command
line. Each test runs both simulators on
[properties.qnt](../testFixture/simulator/properties.qnt). The output is
printed once when the simulators agree, and both outputs are printed when they
differ.

The rules that the tests check are listed below.

- The `invariant` definitions are checked when no flag selects invariants.
- `--invariant` and `--invariants` replace those definitions, and
  `--no-invariant` checks no invariant.
- The `observation` definitions are always counted. When one of them is never
  reached, a warning is printed, and the exit code stays 0.
- `--observation` stops the run at the first trace that reaches it. When no
  `--observation` is reached, the run fails with exit code 1.
- A violated invariant takes precedence over a reached `--observation`.
- `--no-observation` counts no observation.

These tests run with the Rust backend integration tests, since they need the
Rust evaluator that is built from this repository.

<!-- !test program
bash -c '
# Run `quint run` on the fixture with each simulator, and print the output once when they agree
run_both() {
  local outputs=()
  for backend in typescript rust; do
    local output
    output=$(quint run ./testFixture/simulator/properties.qnt \
      --backend=$backend --seed=0x1 --max-samples=10 --max-steps=5 "$@" 2>&1)
    local code=$?
    outputs+=("$(echo "$output" | grep -v -e "^$" -e "^Use --seed=" | sed -e "s/([0-9]*ms[^)]*)/(duration)/g"
      echo "exit code: $code")")
  done
  if [ "${outputs[0]}" = "${outputs[1]}" ]; then
    echo "${outputs[0]}"
  else
    printf "typescript:\n%s\nrust:\n%s\n" "${outputs[0]}" "${outputs[1]}"
  fi
}
export -f run_both
exec bash -
'
-->

## Without flags

### The declared invariants are checked, and the declared observations are counted

`negative` is never reached, which gives a warning but no failure.

<!-- !test in declared properties -->
    run_both

<!-- !test out declared properties -->
    An example execution:
    [State 0] { n: 0 }
    [State 1] { n: 1 }
    [State 2] { n: 2 }
    [State 3] { n: 3 }
    [State 4] { n: 4 }
    [State 5] { n: 4 }
    [warning] No violation found, but no trace reached negative (duration).
    Checked invariants: nonNegative, belowFive
    Trace length statistics: max=6, min=6, average=6.00
    You may increase --max-samples and --max-steps.
    Use --verbosity to produce more (or less) output.
    Observations:
    two was observed in 10 trace(s) out of 10 explored (100.00%)
    negative was observed in 0 trace(s) out of 10 explored (0.00%)
    exit code: 0
### A violated declared invariant fails the run, and imported definitions are collected

`importsProperties` imports the definitions of `properties` with
`import properties.*`, and it declares `belowTwo` itself.

<!-- !test in declared invariant violated -->
    run_both --main=importsProperties

<!-- !test out declared invariant violated -->
    An example execution:
    [State 0] { n: 0 }
    [State 1] { n: 1 }
    [State 2] { n: 2 }
    [violation] Found an issue (duration).
      ❌ belowTwo
    Use --verbosity=3 to show executions.
    Observations:
    two was observed in 1 trace(s) out of 1 explored (100.00%)
    negative was observed in 0 trace(s) out of 1 explored (0.00%)
    error: Invariant violated
    exit code: 1

### With low verbosity, only the result is printed

<!-- !test in declared properties verbosity 1 -->
    run_both --verbosity=1

<!-- !test out declared properties verbosity 1 -->
    [warning] No violation found, but no trace reached negative (duration).
    exit code: 0

## Selecting invariants

### `--invariant` replaces the declared invariants

The run finds no violation, since `belowTwo` is not checked.

<!-- !test in invariant replaces declared ones -->
    run_both --main=importsProperties --invariant=nonNegative

<!-- !test out invariant replaces declared ones -->
    An example execution:
    [State 0] { n: 0 }
    [State 1] { n: 1 }
    [State 2] { n: 2 }
    [State 3] { n: 3 }
    [State 4] { n: 4 }
    [State 5] { n: 4 }
    [warning] No violation found, but no trace reached negative (duration).
    Checked invariants: nonNegative
    Trace length statistics: max=6, min=6, average=6.00
    You may increase --max-samples and --max-steps.
    Use --verbosity to produce more (or less) output.
    Observations:
    two was observed in 10 trace(s) out of 10 explored (100.00%)
    negative was observed in 0 trace(s) out of 10 explored (0.00%)
    exit code: 0
### `--invariants` replaces the declared invariants too

<!-- !test in invariants replace declared ones -->
    run_both --main=importsProperties --invariants nonNegative belowFive --no-observation

<!-- !test out invariants replace declared ones -->
    An example execution:
    [State 0] { n: 0 }
    [State 1] { n: 1 }
    [State 2] { n: 2 }
    [State 3] { n: 3 }
    [State 4] { n: 4 }
    [State 5] { n: 4 }
    [ok] No violation found (duration).
    Checked invariants: nonNegative, belowFive
    Trace length statistics: max=6, min=6, average=6.00
    You may increase --max-samples and --max-steps.
    Use --verbosity to produce more (or less) output.
    exit code: 0
### `--invariant true` checks no invariant

<!-- !test in invariant true -->
    run_both --main=importsProperties --invariant=true --no-observation

<!-- !test out invariant true -->
    An example execution:
    [State 0] { n: 0 }
    [State 1] { n: 1 }
    [State 2] { n: 2 }
    [State 3] { n: 3 }
    [State 4] { n: 4 }
    [State 5] { n: 4 }
    [ok] No violation found (duration).
    Trace length statistics: max=6, min=6, average=6.00
    You may increase --max-samples and --max-steps.
    Use --verbosity to produce more (or less) output.
    exit code: 0

### `--no-invariant` checks no invariant, and the observations are still counted

<!-- !test in no invariant -->
    run_both --main=importsProperties --no-invariant

<!-- !test out no invariant -->
    An example execution:
    [State 0] { n: 0 }
    [State 1] { n: 1 }
    [State 2] { n: 2 }
    [State 3] { n: 3 }
    [State 4] { n: 4 }
    [State 5] { n: 4 }
    [warning] No violation found, but no trace reached negative (duration).
    Trace length statistics: max=6, min=6, average=6.00
    You may increase --max-samples and --max-steps.
    Use --verbosity to produce more (or less) output.
    Observations:
    two was observed in 10 trace(s) out of 10 explored (100.00%)
    negative was observed in 0 trace(s) out of 10 explored (0.00%)
    exit code: 0

## Looking for observations

### `--observation` stops at the first trace that reaches it

The reported trace ends at the first state where `two` holds. The declared
observations are still counted, but `negative` gives no warning, since the
run looked for `two` only.

<!-- !test in observation stops the run -->
    run_both --observation=two

<!-- !test out observation stops the run -->
    An example execution:
    [State 0] { n: 0 }
    [State 1] { n: 1 }
    [State 2] { n: 2 }
    [observed] Observed two, which stopped the run (duration).
    Checked invariants: nonNegative, belowFive
    Observations:
    two was observed in 1 trace(s) out of 1 explored (100.00%)
    negative was observed in 0 trace(s) out of 1 explored (0.00%)
    exit code: 0

### `--observation` takes an expression

<!-- !test in observation expression -->
    run_both --observation='n == 3' --no-invariant

<!-- !test out observation expression -->
    An example execution:
    [State 0] { n: 0 }
    [State 1] { n: 1 }
    [State 2] { n: 2 }
    [State 3] { n: 3 }
    [observed] Observed n == 3, which stopped the run (duration).
    Observations:
    two was observed in 1 trace(s) out of 1 explored (100.00%)
    negative was observed in 0 trace(s) out of 1 explored (0.00%)
    n == 3 was observed in 1 trace(s) out of 1 explored (100.00%)
    exit code: 0

### With several `--observation` flags, the run stops at the first one that is reached

<!-- !test in first of several observations -->
    run_both --observation=two --observation='n == 1'

<!-- !test out first of several observations -->
    An example execution:
    [State 0] { n: 0 }
    [State 1] { n: 1 }
    [observed] Observed n == 1, which stopped the run (duration).
    Checked invariants: nonNegative, belowFive
    Observations:
    two was observed in 0 trace(s) out of 1 explored (0.00%)
    negative was observed in 0 trace(s) out of 1 explored (0.00%)
    n == 1 was observed in 1 trace(s) out of 1 explored (100.00%)
    exit code: 0

### An `--observation` that is never reached fails the run

<!-- !test in observation not reached -->
    run_both --observation=negative

<!-- !test out observation not reached -->
    [not observed] No trace reached negative (duration).
    Checked invariants: nonNegative, belowFive
    You may increase --max-samples and --max-steps.
    Observations:
    two was observed in 10 trace(s) out of 10 explored (100.00%)
    negative was observed in 0 trace(s) out of 10 explored (0.00%)
    error: Observation not reached
    exit code: 1
### A violated invariant takes precedence over an `--observation` reached in the same state

`belowTwo` is violated in the state where `two` is first reached.

<!-- !test in violation precedes observation -->
    run_both --main=importsProperties --observation=two

<!-- !test out violation precedes observation -->
    An example execution:
    [State 0] { n: 0 }
    [State 1] { n: 1 }
    [State 2] { n: 2 }
    [violation] Found an issue (duration).
      ❌ belowTwo
    Use --verbosity=3 to show executions.
    Observations:
    two was observed in 1 trace(s) out of 1 explored (100.00%)
    negative was observed in 0 trace(s) out of 1 explored (0.00%)
    error: Invariant violated
    exit code: 1

### The observations of a violating trace are counted, even when its initial state is the violation

<!-- !test in observations of a violating initial state -->
    run_both --invariant='n > 0' --observation='n == 0'

<!-- !test out observations of a violating initial state -->
    An example execution:
    [State 0] { n: 0 }
    [violation] Found an issue (duration).
      ❌ n > 0
    Use --verbosity=3 to show executions.
    Observations:
    two was observed in 0 trace(s) out of 1 explored (0.00%)
    negative was observed in 0 trace(s) out of 1 explored (0.00%)
    n == 0 was observed in 1 trace(s) out of 1 explored (100.00%)
    error: Invariant violated
    exit code: 1

### An observation that fails to evaluate ends the run with its error

<!-- !test in observation runtime error -->
    for backend in typescript rust; do
      quint run ./testFixture/simulator/properties.qnt --backend=$backend --seed=0x1 --max-samples=10 \
        --observation='Map(1 -> 2).get(n) == 2' 2>&1 | grep -e '^\[error\]' -e '^error' | sed -e 's/([0-9]*ms[^)]*)/(duration)/g'
      echo "exit code: ${PIPESTATUS[0]}"
    done

<!-- !test out observation runtime error -->
    [error] Runtime error (duration).
    error: [QNT507] Called 'get' with a non-existing key. Key is 0. Map has keys: 1
    error: Runtime error
    exit code: 1
    [error] Runtime error (duration).
    error: [QNT507] Called 'get' with a non-existing key. Key is 0. Map has keys: 1
    error: Runtime error
    exit code: 1

### A trace that reaches an `--observation` has the status `observed` in the ITF output

<!-- !test in observed itf status -->
    quint run --observation two --seed=0x1 --out-itf=observed.itf.json \
      ./testFixture/simulator/properties.qnt > /dev/null
    jq -c '[.["#meta"].status, [.states[].n."#bigint"]]' observed.itf.json
    rm observed.itf.json

<!-- !test out observed itf status -->
    ["observed",["0","1","2"]]

### An `--observation` that is never reached writes no trace

<!-- !test in unreached observation writes no trace -->
    quint run --observation negative --seed=0x1 --max-samples=10 --out-itf=unreached.itf.json \
      ./testFixture/simulator/properties.qnt > /dev/null
    echo "exit code: $?"
    ls unreached*.itf.json 2> /dev/null | wc -l

<!-- !test out unreached observation writes no trace -->
    exit code: 1
    0

## Turning observations off

### `--no-observation` counts no observation

<!-- !test in no observation -->
    run_both --no-observation

<!-- !test out no observation -->
    An example execution:
    [State 0] { n: 0 }
    [State 1] { n: 1 }
    [State 2] { n: 2 }
    [State 3] { n: 3 }
    [State 4] { n: 4 }
    [State 5] { n: 4 }
    [ok] No violation found (duration).
    Checked invariants: nonNegative, belowFive
    Trace length statistics: max=6, min=6, average=6.00
    You may increase --max-samples and --max-steps.
    Use --verbosity to produce more (or less) output.
    exit code: 0
### `--witnesses` is deprecated, and its expressions are counted without stopping the run

<!-- !test in deprecated witnesses -->
    run_both --witnesses='n == 1' --no-invariant

<!-- !test out deprecated witnesses -->
    Warning: --witnesses is deprecated. Declare observation definitions in the spec, or use --observation to stop at the first trace that reaches one.
    An example execution:
    [State 0] { n: 0 }
    [State 1] { n: 1 }
    [State 2] { n: 2 }
    [State 3] { n: 3 }
    [State 4] { n: 4 }
    [State 5] { n: 4 }
    [warning] No violation found, but no trace reached negative (duration).
    Trace length statistics: max=6, min=6, average=6.00
    You may increase --max-samples and --max-steps.
    Use --verbosity to produce more (or less) output.
    Observations:
    two was observed in 10 trace(s) out of 10 explored (100.00%)
    negative was observed in 0 trace(s) out of 10 explored (0.00%)
    n == 1 was observed in 10 trace(s) out of 10 explored (100.00%)
    exit code: 0

## Mistakes in flags

### A property that does not resolve is reported with the flag that gives it

<!-- !test in property typo names its flag -->
    run_both --observation=tow
    run_both --invariants nonNegative belowFiv

<!-- !test out property typo names its flag -->
    error: [QNT404] Name 'tow' not found (given with --observation)
    error: Argument error
    exit code: 1
    error: [QNT404] Name 'belowFiv' not found (given with --invariants)
    error: Argument error
    exit code: 1

### `--observation` takes one observation, and is given once per observation

<!-- !test in observation takes one value -->
    run_both --observation two negative

<!-- !test out observation takes one value -->
    Unknown argument: negative
    Give --observation once per observation, as in --observation a --observation b
    exit code: 1

## Conflicting flags

### `--no-invariant` cannot be combined with `--invariant` or `--invariants`

<!-- !test in no invariant with invariant -->
    run_both --invariant=nonNegative --no-invariant
    run_both --no-invariant --invariants nonNegative

<!-- !test out no invariant with invariant -->
    --no-invariant cannot be combined with --invariant or --invariants
    exit code: 1
    --no-invariant cannot be combined with --invariant or --invariants
    exit code: 1

### `--no-observation` cannot be combined with `--observation` or `--witnesses`

<!-- !test in no observation with observation -->
    run_both --observation=two --no-observation
    run_both --no-observation --witnesses two

<!-- !test out no observation with observation -->
    --no-observation cannot be combined with --observation or --witnesses
    exit code: 1
    --no-observation cannot be combined with --observation or --witnesses
    exit code: 1
