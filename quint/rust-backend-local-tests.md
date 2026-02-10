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
  --verbosity=3 \
  /tmp/debug_test.qnt 2>&1 | grep "this tests debug"

rm /tmp/debug_test.qnt
```

<!-- !test out rust backend debug -->
```
[DEBUG] this tests debug 42
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
