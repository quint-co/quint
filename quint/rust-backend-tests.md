# Integration tests with the Rust backend

Tests in this script verify that Quint can download and run simulation with the
`rust` backend (`--backend rust`).

Note that these tests only run before releases.

<!-- !test program
bash -
-->

## Downloads the rust backend and run a simulation

Asserts that on an empty `QUINT_HOME` directory, it downloads the latest Rust
evaluator from GitHub releases. Note that a successful run indicates a
successful download and execution of the spec with the set backend.

This test passes the `--n-threads` flag to the rust backend to check that the
CLI accepts it correctly.

<!-- !test in download and run -->
```
QUINT_HOME="$(mktemp -d)" quint run \
  --backend=rust \
  --n-threads=4 \
  ./testFixture/simulator/gettingStarted.qnt \
  | grep -o "Downloading Rust evaluator from https://api.github.com/repos/informalsystems/quint/releases/assets/"
```

<!-- !test out download and run -->
```
Downloading Rust evaluator from https://api.github.com/repos/informalsystems/quint/releases/assets/
```

## Seed produces reproducible results

This test verifies that running with the same seed produces identical traces.

<!-- !test in rust backend seed reproducibility -->
```
# Run once with ITF output to capture the trace and seed
quint run \
  --backend=rust \
  --out-itf=seed-test-1.itf.json \
  --max-steps=5 \
  --max-samples=1 \
  ./testFixture/simulator/gettingStarted.qnt 2>&1 | grep -o "Use --seed=0x[0-9a-f]*" | head -1 > seed.txt

# Extract just the seed value
SEED=$(cat seed.txt | sed 's/Use //')

# Run again with the captured seed
quint run \
  --backend=rust \
  --out-itf=seed-test-2.itf.json \
  --max-steps=5 \
  --max-samples=1 \
  $SEED \
  ./testFixture/simulator/gettingStarted.qnt > /dev/null 2>&1

# Compare the traces (excluding metadata that contains timestamps)
jq '.states' seed-test-1.itf.json > trace1.json
jq '.states' seed-test-2.itf.json > trace2.json
diff trace1.json trace2.json && echo "Traces are identical"

# Cleanup
rm -f seed-test-1.itf.json seed-test-2.itf.json seed.txt trace1.json trace2.json
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
