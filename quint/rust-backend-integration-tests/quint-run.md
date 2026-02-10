# Integration tests with locally-built Rust backend

Tests in this script verify features of the Rust backend that require
running against a locally-built evaluator (not the released version).

These tests run in PR CI after building the Rust evaluator from source.

<!-- !test program
bash -
-->

## quint run tests

### Run finds an invariant violation

The command `run` finds an invariant violation.

<!-- !test in run finds violation -->
```
output=$(quint run --backend=rust --seed=0x308623f2a48e7 --max-steps=4 \
  --invariant='n < 10' ../examples/language-features/counters.qnt 2>&1)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms.*)/(duration)/g' -e 's#^.*counters.qnt#      HOME/counters.qnt#g'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test out run finds violation -->
```
An example execution:

[State 0] { n: 1 }

[State 1] { n: 2 }

[State 2] { n: 3 }

[State 3] { n: 6 }

[State 4] { n: 12 }

[violation] Found an issue (duration).
Use --verbosity=3 to show executions.
Use --seed=0x308623f2a4983 --backend=rust to reproduce.
error: Invariant violated
```

### Run finds an invariant violation with metadata

The command `run` finds an invariant violation and outputs metadata for MBT, when given the `--mbt` flag.

<!-- !test in run finds violation with metadata -->
```
output=$(quint run --backend=rust --seed=0x8 --mbt --max-steps=4 --max-samples=1 \
  --invariant='n < 10' ../examples/language-features/counters.qnt 2>&1)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms.*)/(duration)/g' -e 's#^.*counters.qnt#      HOME/counters.qnt#g'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test out run finds violation with metadata -->
```
An example execution:

[State 0] { mbt::actionTaken: "init", mbt::nondetPicks: {  }, n: 1 }

[State 1] { mbt::actionTaken: "OnPositive", mbt::nondetPicks: {  }, n: 2 }

[State 2] { mbt::actionTaken: "OnPositive", mbt::nondetPicks: {  }, n: 3 }

[State 3] { mbt::actionTaken: "OnDivByThree", mbt::nondetPicks: {  }, n: 6 }

[State 4] { mbt::actionTaken: "OnDivByThree", mbt::nondetPicks: {  }, n: 12 }

[violation] Found an issue (duration).
Use --verbosity=3 to show executions.
Use --seed=0x8 --backend=rust to reproduce.
error: Invariant violated
```

### Run finds invariant violation with metadata on bank spec

Make sure the bank spec we use at the Getting Started guide has correct tracking of metadata

<!-- !test in run finds violation with metadata on bank -->
```
output=$(quint run --backend=rust --seed=0x1 --mbt \
  --invariant=no_negatives ./testFixture/simulator/gettingStarted.qnt 2>&1)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms.*)/(duration)/g' -e 's#^.*gettingStarted.qnt#      HOME/gettingStarted.qnt#g'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test out run finds violation with metadata on bank -->
```
An example execution:

[State 0]
{
  balances: Map("alice" -> 0, "bob" -> 0, "charlie" -> 0),
  mbt::actionTaken: "init",
  mbt::nondetPicks: { account: None, amount: None }
}

[State 1]
{
  balances: Map("alice" -> 0, "bob" -> 0, "charlie" -> -21),
  mbt::actionTaken: "withdraw",
  mbt::nondetPicks: { account: Some("charlie"), amount: Some(21) }
}

[violation] Found an issue (duration).
Use --verbosity=3 to show executions.
Use --seed=0x1 --backend=rust to reproduce.
error: Invariant violated
```

### Run can hide fields

<!-- !test in run can hide fields -->
```
output=$(quint run --backend=rust --seed=0xcc198528dea8b --mbt \
  --hide balances mbt::nondetPicks \
  --invariant=no_negatives ./testFixture/simulator/gettingStarted.qnt 2>&1)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms.*)/(duration)/g' -e 's#^.*gettingStarted.qnt#      HOME/gettingStarted.qnt#g'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test out run can hide fields -->
```
An example execution:

[State 0] { mbt::actionTaken: "init" }

[State 1] { mbt::actionTaken: "withdraw" }

[violation] Found an issue (duration).
Use --verbosity=3 to show executions.
Use --seed=0xcc198528dea8b --backend=rust to reproduce.
error: Invariant violated
```

### Run finds an example

The command `run` finds an example.

<!-- !test in run finds example -->
```
quint run --backend=rust --seed=17 --max-steps=4 --invariant='n < 100' ../examples/language-features/counters.qnt 2>&1 | \
  sed 's/([0-9]*ms.*)/(duration)/g' | \
  sed 's#^.*counters.qnt#      HOME/counters.qnt#g'
```

<!-- !test out run finds example -->
```
An example execution:

[State 0] { n: 1 }

[State 1] { n: 2 }

[State 2] { n: 1 }

[State 3] { n: 2 }

[State 4] { n: 3 }

[ok] No violation found (duration).
Trace length statistics: max=5, min=5, average=5.00
You may increase --max-samples and --max-steps.
Use --verbosity to produce more (or less) output.
Use --seed=0x1d4c5 --backend=rust to reproduce.
```

### Run shows the operator calls

The command `run` shows operator calls on a small spec.

<!-- !test in run shows calls -->
```
output=$(quint run --backend=rust --max-steps=1 --seed=0x1 \
  --invariant=no_negatives \
  --verbosity=3 \
  ./testFixture/simulator/gettingStarted.qnt 2>&1)
exit_code=$?
echo "$output" | grep -E "q::initAndInvariant|q::stepAndInvariant" | head -n 2
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test out run shows calls -->
```
q::initAndInvariant => true
q::stepAndInvariant => false
```

### Run outputs ITF

<!-- !test in run itf -->
```
quint run --backend=rust --out-itf=out-itf-example.itf.json --max-steps=5 --seed=123 \
  --invariant=no_negatives \
  --verbosity=0 \
  ./testFixture/simulator/gettingStarted.qnt
cat out-itf-example.itf.json | jq '.states[0]."balances"."#map"[0]'
rm out-itf-example.itf.json
```

<!-- !test out run itf -->
```
[
  "alice",
  {
    "#bigint": "0"
  }
]
```

### Run without violation outputs ITF

<!-- !test in successful run itf -->
```
quint run --backend=rust --out-itf=out-itf-example.itf.json --max-steps=5 --seed=123  --verbosity=0 ./testFixture/simulator/gettingStarted.qnt
cat out-itf-example.itf.json | jq '.states[0]."balances"."#map"[0]'
rm out-itf-example.itf.json
```

<!-- !test out successful run itf -->
```
[
  "alice",
  {
    "#bigint": "0"
  }
]
```

### Run to generate multiple ITF traces with violation

<!-- !test in run with n-traces itf violation -->
```
quint run --backend=rust --out-itf=out-itf-example.itf.json --n-traces=3 --max-steps=5 --seed=123 --verbosity=0  ./testFixture/simulator/gettingStarted.qnt \
   --invariant=no_negatives 
cat out-itf-example0.itf.json | jq '.["#meta"].status'
cat out-itf-example1.itf.json | jq '.["#meta"].status'
cat out-itf-example2.itf.json | jq '.["#meta"].status'
rm out-itf-example*.itf.json
```

<!-- !test out run with n-traces itf violation -->
```
"violation"
"violation"
"violation"
```

### run fails on invalid seed

<!-- !test exit 1 -->
<!-- !test in run invalid seed -->
```
quint run --backend=rust --seed=NotANumber ./testFixture/simulator/gettingStarted.qnt
```

<!-- !test err run invalid seed -->
```
--seed must be a big integer, found: NotANumber
```

### Fail on run with uninitialized constants

FIXME: this should not be a runtime error

<!-- !test in run uninitialized -->
```
output=$(quint run --backend=rust testFixture/_1041compileConst.qnt --seed=1 2>&1)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms.*)/(duration)/g' \
  -e 's#^.*_1041compileConst.qnt#HOME/_1041compileConst.qnt#g'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test out run uninitialized -->
```
[error] Runtime error (duration).
HOME/_1041compileConst.qnt:5:24 - error: [QNT500] Uninitialized const N. Use: import <moduleName>(N=<value>).*
5:   action init = { x' = N }
                          ^

Use --seed=0x1 --backend=rust to reproduce.
error: Runtime error
```

### run fails on invalid module

<!-- !test exit 1 -->
<!-- !test in run invalid module -->
```
quint run --backend=rust --main=invalid ./testFixture/_1050diffName.qnt
```

<!-- !test err run invalid module -->
```
error: [QNT405] Main module invalid not found
error: Argument error
```

### Runtime error prints trace and seed

This test verifies that when a runtime error occurs, the trace up to the error point
and the seed are printed, allowing the user to reproduce and debug the error.

<!-- !test in runtime error prints trace -->
```
output=$(quint run --backend=rust testFixture/simulator/runtimeError.qnt 2>&1)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms.*)/(duration)/g' \
  -e 's#^.*runtimeError.qnt#HOME/runtimeError.qnt#g' \
  -e 's/--seed=0x[0-9a-f]*/--seed=SEED/g'
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test out runtime error prints trace -->
```
An example execution:

[State 0] { x: 1 }

[State 1] { x: 2 }

[error] Runtime error (duration).
HOME/runtimeError.qnt:9:22 - error: [QNT510] Out of bounds, nth(2)
9:   action step = x' = vec[x]
                        ^^^^^^

Use --seed=SEED --backend=rust to reproduce.
error: Runtime error
```

### Prints witnesses counts

<!-- !test exit 0 -->
<!-- !test in witnesses -->
```
output=$(quint run --backend=rust ../examples/games/tictactoe/tictactoe.qnt --witnesses="won(X)" stalemate --max-samples=100 --seed=0x1 --verbosity=1)
exit_code=$?
echo "$output" | sed -e 's/([0-9]*ms.*)/(duration)/g'
exit $exit_code
```

<!-- !test out witnesses -->
```
[ok] No violation found (duration).
Witnesses:
won(X) was witnessed in 96 trace(s) out of 100 explored (96.00%)
stalemate was witnessed in 4 trace(s) out of 100 explored (4.00%)
Use --seed=0x1995 --backend=rust to reproduce.
```

### Prints violated invariants when multiple invariants are given 

<!-- !test exit 1 -->
<!-- !test in multiple invariants -->
```
output=$(quint run --backend=rust ../examples/games/tictactoe/tictactoe.qnt --invariants="not(won(X))" "not(stalemate)" --max-samples=100 --seed=0x2b442ab439177)
exit_code=$?
echo "$output" | tail -n4 | sed -e 's/([0-9]*ms.*)/(duration)/g'
exit $exit_code
```

<!-- !test out multiple invariants -->
```
[violation] Found an issue (duration).
  ❌ not(won(X))
Use --verbosity=3 to show executions.
Use --seed=0x2b442ab439177 --backend=rust to reproduce.
```

### Error when --n-traces is greater than --max-samples

<!-- !test in n-traces greater than max-samples -->
```sh
quint run --backend=rust ./examples/language-features/counters.qnt --n-traces 10 --max-samples 5
```

<!-- !test exit 1 -->
<!-- !test err n-traces greater than max-samples -->
```text
--n-traces (10) cannot be greater than --max-samples (5).
```

<!-- !test in n-traces greater than default max-samples -->
```sh
quint run --backend=rust ./examples/language-features/counters.qnt --n-traces 20000
```

<!-- !test exit 1 -->
<!-- !test err n-traces greater than default max-samples -->
```text
--n-traces (20000) cannot be greater than --max-samples (10000).
```

### Error when non-array options are set more than once

<!-- !test in non-array options set more than once -->
```sh
quint run --backend=rust ./examples/language-features/counters.qnt --max-steps 10 --max-steps 15
```

<!-- !test exit 1 -->
<!-- !test err non-array options set more than once -->
```text
--max-steps can not be specified more than once
```

### `expect` does not duplicate states in traces for `quint run`

Regression test to ensure that `expect` does not add duplicate states to the trace
when using `quint run` with `--out-itf`.

<!-- !test in expect no duplicate states in run -->
```
quint run --backend=rust --out-itf=expect-run.itf.json --max-steps=20 --seed=42 --verbosity=0 \
  ./testFixture/expectNoStateDuplication.qnt
cat expect-run.itf.json | jq '.states | length'
rm expect-run.itf.json
```

<!-- !test out expect no duplicate states in run -->
```
42
```

## Seed produces reproducible results

This test verifies that running with the same seed produces identical traces.

<!-- !test in rust backend seed reproducibility -->
```
# First run: capture seed and trace output
OUTPUT1=$(quint run \
  --backend=rust \
  --max-steps=5 \
  --max-samples=1 \
  --verbosity=3 \
  ./testFixture/simulator/gettingStarted.qnt 2>&1)

# Extract the seed from first run
SEED=$(echo "$OUTPUT1" | grep -o "\-\-seed=0x[0-9a-f]*")

# Filter out timing info and save trace from first run
echo "$OUTPUT1" | grep -v "duration\|samples/s\|ETA\|speed\|traces/second\|No violation found" > run1.txt

# Second run with the captured seed
quint run \
  --backend=rust \
  --max-steps=5 \
  --max-samples=1 \
  --verbosity=3 \
  $SEED \
  ./testFixture/simulator/gettingStarted.qnt 2>&1 | grep -v "duration\|samples/s\|ETA\|speed\|traces/second\|No violation found" > run2.txt

diff run1.txt run2.txt && echo "Traces are identical"

# Cleanup
rm -f run1.txt run2.txt
```

<!-- !test out rust backend seed reproducibility -->
```
Traces are identical
```

## Produces ITF trace with --out-itf

<!-- !test in rust backend itf output -->
```
quint run \
  --backend=rust \
  --out-itf=rust-out.itf.json \
  --max-steps=5 \
  ./testFixture/simulator/gettingStarted.qnt > /dev/null
cat rust-out.itf.json | jq '.vars'
rm rust-out.itf.json
```

<!-- !test out rust backend itf output -->
```
[
  "balances"
]
```

## Nested parameterized calls with let

This test verifies that the Rust backend handles nested parameterized function calls with let bindings correctly.

<!-- !test check rust backend nested parameterized calls -->
```
quint run \
  --backend=rust \
  --max-steps=5 \
  --max-samples=1 \
  ./testFixture/nestedParameterizedCallsWithLet.qnt
```

## Run fails with bigint outside i64 range

This test verifies that the Rust backend rejects integers outside the i64 range.

<!-- !test in run bigint outside i64 range -->
```
cat > /tmp/bigint_test.qnt << 'EOF'
module bigintTest {
  var x: int

  action init = {
    x' = 9223372036854775808  // 2^63, outside i64 range
  }

  action step = {
    x' = x + 1
  }
}
EOF

output=$(quint run --backend=rust --main=bigintTest /tmp/bigint_test.qnt 2>&1)
exit_code=$?
echo "$output" | grep -o "QNT600.*i64 range"
rm /tmp/bigint_test.qnt
exit $exit_code
```

<!-- !test exit 1 -->
<!-- !test out run bigint outside i64 range -->
```
QNT600] Integer literal 9223372036854775808 is outside i64 range
```

## Debug output in init action

This test verifies that q::debug output is printed when using the Rust backend.

<!-- !test in rust backend debug -->
```
cat > /tmp/debug_test.qnt << 'EOF'
module debugTest {
  var x: int

  action init = {
    x' = q::debug("this tests debug", 42)
  }

  action step = {
    x' = x + 1
  }
}
EOF

quint run \
  --backend=rust \
  --max-samples=1 \
  --main=debugTest \
  /tmp/debug_test.qnt 2>&1 | grep "this tests debug"

rm /tmp/debug_test.qnt
```

<!-- !test out rust backend debug -->
```
> this tests debug 42
```
