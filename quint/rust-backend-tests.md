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
