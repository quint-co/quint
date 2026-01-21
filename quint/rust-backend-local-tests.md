# Integration tests with locally-built Rust backend

Tests in this script verify features of the Rust backend that require
running against a locally-built evaluator (not the released version).

These tests run in PR CI after building the Rust evaluator from source.

<!-- !test program
bash -
-->

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

## `expect` does not duplicate states in traces for `quint run`

Regression test to ensure that `expect` does not add duplicate states to the trace
when using `quint run` with `--out-itf` and the Rust backend.

<!-- !test in rust backend expect no duplicate states in run -->
```
quint run --backend=rust --out-itf=expect-run-rust.itf.json --max-steps=20 --seed=42 --verbosity=0 \
  ./testFixture/expectNoStateDuplication.qnt
cat expect-run-rust.itf.json | jq '.states | length'
rm expect-run-rust.itf.json
```

<!-- !test out rust backend expect no duplicate states in run -->
```
42
```

## Basic test execution with Rust backend

This test verifies that `quint test --backend=rust` successfully runs passing tests.

<!-- !test check rust backend test passing -->
```
quint test --backend=rust ./testFixture/_1051manyTests.qnt
```

## Failing test with Rust backend

This test verifies that failing tests are properly reported when using the Rust backend.

<!-- !test exit 1 -->
<!-- !test in rust backend test failing -->
```
output=$(quint test --backend=rust --main failingTestCounters --seed 1 ./testFixture/simulator/failingTestCounters.qnt 2>&1)
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/g' -e 's#^.*failingTestCounters.qnt#      HOME/failingTestCounters.qnt#g'
```

<!-- !test out rust backend test failing -->
```

  failingTestCounters
    1) failingTest failed after 1 test(s)

  1 failed

  1) failingTest:
      HOME/failingTestCounters.qnt:45:10 - error: [QNT508] Assertion failed
      45:          assert(n == 0),
                   ^^^^^^^^^^^^^^
    Use --seed=0x1 --match=failingTest to repeat.


  Use --verbosity=3 to show executions.
  Further debug with: quint test --verbosity=3 testFixture/simulator/failingTestCounters.qnt
error: Tests failed
```

## Test with --out-itf produces ITF traces

TODO: The Rust backend does not yet support --out-itf for test command.

<!-- Test disabled until --out-itf support is added
<!-- !test in rust backend test itf -->
<!--
```
quint test --backend=rust --out-itf='{test}.itf.json' \
  ./testFixture/expectNoStateDuplication.qnt > /dev/null
cat NoExpectTest.itf.json | jq '.states | length'
cat WithExpectTest.itf.json | jq '.states | length'
rm NoExpectTest.itf.json WithExpectTest.itf.json
```

<!-- !test out rust backend test itf -->
<!--
```
2
2
```
-->

## Test seed reproducibility

This test verifies that the same seed produces identical results with the Rust backend.

<!-- !test in rust backend test seed reproducibility -->
```
# First run: capture seed
OUTPUT1=$(quint test --backend=rust --main failingTestCounters \
  ./testFixture/simulator/failingTestCounters.qnt 2>&1)
SEED=$(echo "$OUTPUT1" | grep -o "\-\-seed=0x[0-9a-f]*")

# Second run with captured seed
OUTPUT2=$(quint test --backend=rust --main failingTestCounters \
  $SEED ./testFixture/simulator/failingTestCounters.qnt 2>&1)

# Both should have the same seed in the output
echo "$OUTPUT1" | grep -o "seed=0x[0-9a-f]*" > seed1.txt
echo "$OUTPUT2" | grep -o "seed=0x[0-9a-f]*" > seed2.txt
diff seed1.txt seed2.txt && echo "Seeds are identical"

rm seed1.txt seed2.txt
```

<!-- !test out rust backend test seed reproducibility -->
```
Seeds are identical
```

## Test with --match filter

This test verifies that the --match flag works with the Rust backend.

<!-- !test in rust backend test match -->
```
output=$(quint test --backend=rust --match=firstTest ./testFixture/_1051manyTests.qnt)
echo "$output" | sed -e 's/([0-9]*ms)/(duration)/g'
```

<!-- !test out rust backend test match -->
```

  manyTests
    ok firstTest passed 1 test(s)

  1 passing (duration)
```

## `expect` does not duplicate states in traces for `quint test`

TODO: The Rust backend does not yet support --out-itf for test command.

<!-- Test disabled until --out-itf support is added
<!-- !test in rust backend expect no duplicate states in test -->
<!--
```
quint test --backend=rust --out-itf='{test}.itf.json' \
  ./testFixture/expectNoStateDuplication.qnt > /dev/null
cat NoExpectTest.itf.json | jq '.states | length'
cat WithExpectTest.itf.json | jq '.states | length'
rm NoExpectTest.itf.json WithExpectTest.itf.json
```

<!-- !test out rust backend expect no duplicate states in test -->
<!--
```
2
2
```
-->
