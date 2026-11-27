## Veil distribution tests

<!-- !test program
bash -
-->

These tests check that `quint verify --backend veil` works for someone who has
never installed Lean. With no `elan` on `PATH`, the first run downloads elan
into `QUINT_HOME`. Lake then uses elan to download Lean, Veil and Veil's
dependencies, and it builds them, which takes several minutes. Lake runs
`git`, `curl` and `npm` to fetch them, and on Linux it also runs `unzip`. The
run needs to reach GitHub, `release.lean-lang.org` and the npm registry too.

### A first run sets Veil up and checks the spec

The test takes every directory that holds an `elan` off `PATH`, and it starts
from an empty `QUINT_HOME`. The counter of
[counter.qnt](../../testFixture/veil/counter.qnt) has 5 states where the state
constraint `belowFive` holds, and its invariant holds in all of them. The
second run reuses what the first run set up, so it checks the spec without
downloading or building Veil again. Finally, the test deletes its `QUINT_HOME`,
which holds about 5 GB by then.

<!-- !test in first run -->
```
IFS=: read -ra dirs <<< "$PATH"
kept=()
for dir in "${dirs[@]}"; do
  [ -x "$dir/elan" ] || kept+=("$dir")
done
without_elan=$(IFS=:; echo "${kept[*]}")
quint_home=$(mktemp -d)
check() {
  PATH="$without_elan" QUINT_HOME="$quint_home" quint verify --backend veil \
    ./testFixture/veil/counter.qnt --state-constraints belowFive |
    sed -e 's!in .*/veil/workspace-[0-9a-f]*:!in (workspace):!' -e 's/([0-9]*ms)/(duration)/'
}
check
check
rm -rf "$quint_home"
```

<!-- !test out first run -->
```
Downloading elan v4.2.4... done.
Setting up Veil in (workspace): Lake downloads Lean, Veil and its dependencies, and builds them. This happens once and takes a while.
[Veil] Running Veil's model checker, which is compiled at the first check of a spec...
[Veil] Explored 5 states.
[ok] No violation found (duration).
Use --verbosity to produce more (or less) output.
[Veil] Running Veil's model checker, which is compiled at the first check of a spec...
[Veil] Explored 5 states.
[ok] No violation found (duration).
Use --verbosity to produce more (or less) output.
```
