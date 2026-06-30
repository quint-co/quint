# Reference examples

Two fully-runnable Quint specs, bundled so an agent can read a *complete* model end-to-end —
not just the inline snippets in `SKILL.md`. They are chosen to contrast on the axis that drives
a model's whole shape: **how processes communicate**.

Pick by **how the parts coordinate** — passing messages or sharing state — not by domain label.
Almost any system maps onto one; read the closer match as a worked instance of the spine patterns.

| Example | Coordinates by… | Read it when modelling… | Illustrates (spine patterns) |
|---|---|---|---|
| [`tendermint/`](tendermint/tendermint.qnt) | **message passing** (`choreo::`; real BFT consensus) | **any distributed protocol where parties exchange messages** — consensus, BFT, replication, atomic commit, leader election, reliable broadcast/gossip, request/response, mempool. The **default** distributed-systems reference. | grouped `Id -> LocalState` (Step 2), guarded transitions (Step 4), `choreo::cue` listen/act split, `agreement`/`validity`/`accountability` invariants + counterexample demo (Step 5), `const`-instantiation, test separation |
| [`ewd426.qnt`](ewd426.qnt) | **shared state** (no messages) | parts coordinate through **common state** — mutexes/locks, token rings, shared registers, self-stabilization, reading neighbours/environment directly | grouped-map state (Step 2), guarded `step` (Step 4), `const`-instantiation, `temporal` **liveness** (Step 5) |

Both message *soup* (plain `Set[Msg]`, no framework) and hybrid systems (message-passing + a
shared ledger) route through **tendermint** — Choreo's broadcast is soup underneath, and when a
system has both, the message-passing structure dominates (add shared state as its own `var`, per
Step 2).

`tendermint/` is large (~760 lines — a real protocol is large); its banner has a **"quick read"**
path so you can learn the `cue` pattern without reading the whole spec, and the per-read token
cost is paid only when an agent actually opens it.

Justified-*exception* shapes (ordered per-pair queues, flat variables, the contract Result-record
pattern) are intentionally left to prose in `SKILL.md` / the guidelines, not bundled — a bundled
example exerts a "copy me" pull we don't want pointing at exceptions.

## Maintenance contract

These are **owned copies**, snapshotted from the official corpus
(`mcp-servers/kb/kb/examples/`). They must be kept `quint`-clean across Quint upgrades.

| File(s) | Upstream source |
|---|---|
| `ewd426.qnt` | `classic/distributed/ewd426/ewd426.qnt` |
| `tendermint/{tendermint,tendermintTest,choreo}.qnt`, `tendermint/spells/basicSpells.qnt` | `advanced/tendermint/` |

For most files only a top-of-file teaching banner was added; the spec bodies are otherwise
byte-for-byte upstream, so re-syncing is a near-clean diff. **Exception — `tendermint/`:** upstream
ships a single `tendermint.qnt` with its `run` tests inline. We split it per the test-separation
guideline (`quint-lang/guidelines/tests.md`): the spec stays in `tendermint.qnt` (no `run`s), and
the `valid` + `no_agreement` instance/test modules moved to `tendermintTest.qnt` — the only body
change being a `from "./tendermint"` clause added to each `import tendermint(...)`. (We drop
upstream's `tendermintMicro.qnt`, `test_witness.sh`, `witness_bench.py`, and `spells/rareSpells.qnt`,
none of which this example needs.)

- **Pinned Quint version:** 0.32.0 (last verified).

### Re-verify (run from this directory after any Quint upgrade)

```sh
quint typecheck ewd426.qnt
quint run       ewd426.qnt --main=ewd426 --max-steps 15

cd tendermint
quint typecheck tendermint.qnt                   # spec alone — no runs
quint run  tendermintTest.qnt --main=valid --invariant="agreement and validity and accountability" --max-steps 12
quint test tendermintTest.qnt --main=valid       # line28Test must pass
quint test tendermintTest.qnt --main=no_agreement # disagreementTest must pass
```
