# Verification — Witnesses, Invariants, and Test Interpretation

## Contents

- [Critical Distinction](#critical-distinction)
- [Before you can run: instantiate the consts](#before-you-can-run-instantiate-the-consts)
- [Witnesses (Liveness — Protocol Makes Progress)](#witnesses-liveness--protocol-makes-progress)
- [Invariants (Safety — Properties Hold)](#invariants-safety--properties-hold)
- [Trace Analysis](#trace-analysis)
- [Result Classification](#result-classification)

For the full `quint run` / `verify` / `test` flag reference, see `guidelines/cli.md`. This file
is about *running and interpreting* checks.

## Critical Distinction

Witnesses and invariants ask **opposite** questions — one wants the state reached, the other wants
it never violated:

| Check (how to run it) | Good result | Bad result |
|---|---|---|
| **Witness** (`--witnesses`, positive predicate) | ✅ reached in > 0 traces — the state is reachable | ⚠️ 0 traces — unreachable: over-constrained or a bug |
| **Invariant** (`--invariant`) | ⚪ no counterexample in the sampled traces — *not* a proof | ❌ violated — a real bug (one trace disproves it) |

Never confuse the two. With `--witnesses`, a witness reached in > 0 traces is success; an invariant
violation is a bug. Note the asymmetry: a single trace settles a witness (reached) or refutes an
invariant (violated), but an invariant with *no* counterexample only reflects the traces sampled in
this run — report it that way (see "Simulation is … not a proof" below), never as "safety holds".

---

## Before you can run: instantiate the consts

`quint run` / `verify` / `test` execute a **concrete** module — every `const` must have a value.
A spec module that declares `const N: int` (or `const Nodes: Set[str]`) cannot be run directly:
it fails with `QNT500: Uninitialized const N`. Giving the const a value via `assume` does **not**
fix this — `assume` states a premise, it does not bind the parameter.

Instead, write a small concrete **instance module** that imports the spec with the consts bound,
and run *that* module (`--main`):

```quint
module spec {
  const N: int
  const Nodes: Set[str]
  // ... vars, actions, invariants, witnesses ...
}

// concrete instance — this is what you run
module spec_3 {
  import spec(N = 3, Nodes = Set("n1", "n2", "n3")).*
}
```

```bash
quint run spec.qnt --main spec_3 --invariants inv1 inv2 --max-steps 100
```

By convention the instance module is named `<Spec>Analysis` (e.g. `PaxosAnalysis`) and holds the
concrete `init`/`step` and the witnesses; pass `--main <Spec>Analysis`, not the parameterized spec
module. (This is the same executability rule the quint-modeling skill enforces while building.)

---

## Witnesses (Liveness — Protocol Makes Progress)

### Syntax

Write a witness as the **target state, stated positively** (no negation), and pass it to
`quint run --witnesses`. Quint reports how many sampled traces reached it.

```quint
// State-change evidence: a deposit raised someone's balance above the initial value
val depositHappened: bool =
  users.exists(u => balances.get(u) > INITIAL_BALANCE)

// State-change evidence: a transfer pushed alice's balance below the initial value
val transferHappened: bool =
  balances.get("alice") < INITIAL_BALANCE

// Multi-condition target
val fullCycleReached: bool = and {
  delegations.size() == 0,
  users.forall(u => rewards.get(u) == 0),
  users.exists(u => balances.get(u) > INITIAL_BALANCE),
}
```

Add one witness per major action. A witness reached in **0 traces** means the action is dead — an
over-constrained precondition or a bug.

Phrase the target so **only an action can make it true** — a predicate that already holds at `init`
is "reached" at step 0 and witnesses nothing about the action. (If several actions can reach the same
state and you must confirm a *specific* one fired, use a per-action flag `var`; see `patterns.md` §7.)

### Running witnesses

Pass witnesses (space-separated) to `--witnesses`; they run alongside invariants in one pass:

```bash
quint run spec.qnt \
  --main MyModule \
  --invariant noNegativeBalances \
  --witnesses withdrawalHappened transferSucceeded \
  --max-steps 100 \
  --max-samples 1000
```

### Result interpretation

Each witness is reported as a trace count:

```
withdrawalHappened was witnessed in 90 trace(s) out of 100 explored (90.00%)
transferSucceeded  was witnessed in 0 trace(s) out of 100 explored (0.00%)
```

| Count | Meaning | Action |
|---|---|---|
| > 0 traces | ✅ the target state is reachable | done — non-zero coverage confirms it |
| 0 traces | ⚠️ never reached in this sampling | try more steps — see progressive increase below |

### Progressive increase for 0-trace witnesses

Do not conclude a state is unreachable after one run. Increase steps first:

```bash
quint run spec.qnt --witnesses myWitness --max-steps 100
quint run spec.qnt --witnesses myWitness --max-steps 200
quint run spec.qnt --witnesses myWitness --max-steps 500
```

If still 0 traces after 500 steps, run with `--verbosity 3` to inspect execution, then diagnose:

| Symptom | Root cause | Fix |
|---|---|---|
| No actions execute | Protocol stuck at init | Fix `init` or witness precondition |
| Same action loops | Liveness bug or over-constrained guard | Relax action guard |
| Actions run but never reach witness | Witness condition too strong | Weaken the witness |
| Actions run, witness never reached | Real reachability bug in spec | Investigate spec logic |

### When you want the actual reaching trace

`--witnesses` gives a count, not an example. When you need the simulator to hand you a concrete
trace that *reaches* the state, write the negation as an invariant — `val w = not(target)` — and run
`--invariant w`; the "violation" it reports is an execution that reaches `target`. The two forms are
complementary, not old-vs-new: use `--witnesses` for the routine reachability + coverage check, and
the negated-invariant form when you specifically want the reaching trace (to understand or document
how the state is reached, or to debug a witness that fires unexpectedly).

### Witness as a `run` (alternative form)

```quint
// @witness
run decisionIsReachable =
  init
    .then(3.reps(i => vote(i)))
    .expect(decided == true)
```

Use invariant-style witnesses for nondeterministic exploration; run-style witnesses for documenting known reachable paths.

---

## Invariants (Safety — Properties Hold)

### Running invariants

```bash
quint run spec.qnt \
  --main MyModule \
  --invariant noNegativeBalances \
  --max-steps 200
  # --max-samples left at its 10000 default — see "Choosing parameters" below;
  # don't lower it when confirming a safety invariant
```

### Choosing `--max-samples` and `--max-steps`

These control *how many* traces and *how deep*. Choose them by **what you're doing**, not by habit:

**`--max-samples` — by purpose.**
- **Debugging / shaking out runtime errors / a first run** — a small sample (e.g.
  `--max-samples 50`) is fine. You just want to see the spec execute, catch a crash, or eyeball a
  trace; fast feedback beats coverage.
- **Confirming a safety invariant holds** — keep `--max-samples` at its **`10000` default or
  higher; never lower it** to go faster. "No counterexample" is only as strong as the number of
  traces behind it, and the result is already non-exhaustive — cutting samples directly weakens the
  evidence. For an actual guarantee up to a bound, use `quint verify`.

**`--max-steps` — match it to the protocol's branching, not just its action count.** The default
(`20`) is often too short to reach interesting states. The trap is counting only the named actions
in `step`: a *single* action can expand into many concrete transitions through the `nondet` choices
inside it. A lone `sendMessage` over 3 nodes × 2 message types is **6 distinct transitions per
step**, so a random walk needs well more than 6 steps to exercise meaningful *combinations* — e.g.
to see all 6 (node, kind) pairs sent takes ~12–20 steps, not 1. So estimate the **branching factor**
(number of actions × the `nondet` fan-out inside them), then set `--max-steps` several times higher
than "fire each action once" — enough for the walk to reach a full cycle, a decision, a drained
queue, the state your invariants and witnesses are actually about. Too short and you only ever
witness shallow prefixes. (A small deterministic spec needs few steps; a single action with wide
internal nondet across many participants needs many.)

### Checking several invariants at once

When a spec has more than one invariant, **prefer a single run with `--invariants` (plural, a
space-separated list) over spawning one `quint run` per invariant.** They are checked together
(conjoined with AND), so one run covers them all — the same sampled traces exercise every
invariant, it's far cheaper than N separate runs, and any single violation still names the
invariant it broke.

```bash
quint run spec.qnt --main MyModule \
  --invariants noNegativeBalances totalConserved holderIsMember \
  --max-steps 200   # --max-samples at the 10000 default for a confirmation run
```

Use a single `--invariant` (singular) only when you specifically want to isolate one property
(e.g. to focus a counterexample search or reproduce a seed against just that invariant).

### Result interpretation

| Output | Meaning | Action |
|---|---|---|
| `"No violation found"` | No counterexample in **this run** | Report as a sampling result, not a proof — see below |
| `"An example execution"` | VIOLATED ❌ | Bug — capture seed and analyze trace |

> **Simulation is bounded random sampling, not a proof.** "No violation found" means no
> counterexample turned up in the traces that were sampled — it does **not** establish that the
> invariant holds in every reachable state. When reporting to the user, say "no counterexample
> found across N sampled runs (max-steps M, seed S)" and state the coverage as plain facts; do
> not call the property "proven", "verified", "safe", or "correct", and do not judge whether the
> sample size was "enough" — that is the user's call. For an actual exhaustive guarantee over a
> bounded horizon, use `quint verify` (bounded model checking), and even then scope the claim to
> that bound. Always offer next steps (more samples / a different seed / `quint verify` / tighten
> the property) and frame them as the user's decision.

### Bug protocol: invariant violated

**Step 1 — Capture details**
```bash
# Re-run with the seed from the violation output
quint run spec.qnt --invariant myInv --seed <seed> --verbosity 3 --main MyModule
```

**Step 2 — Analyze trace**
- Find the step N where the invariant became false
- Find the action that caused the transition to step N
- Extract the relevant state snapshot: which variables changed, what values

**Step 3 — Determine root cause**

| Scenario | Root cause | Fix |
|---|---|---|
| Invariant violated at step 0 | `init` produces invalid state | Fix `init` |
| Invariant holds at init, fails after action X | Action X has wrong guard or wrong update | Fix action X |
| Invariant seems too strict | Invariant itself is wrong | Weaken invariant |


## Trace Analysis

Use `--verbosity 3` whenever you need to understand a failure or a never-violated witness.

```bash
quint run spec.qnt --invariant myInv --seed <seed> --verbosity 3 --max-steps 50
```

### Verbosity levels

`--verbosity 3` is the one to reach for when diagnosing — it adds `nondet` picks and state changes on
top of the default example trace. The full 0–5 range is in `cli.md`'s verbosity guide.

### `--mbt` — see *which* action fired at each step

`--verbosity 3` shows state changes and picks, but not always *which named action* produced each
step. Add `--mbt` to surface that: each state in the trace carries `mbt::actionTaken` (the action
name) and `mbt::nondetPicks` (the values chosen inside it).

```bash
quint run spec.qnt --invariant myInv --seed <seed> --verbosity 3 --mbt --max-steps 50
```

Reach for it when a trace reaches the critical state but it's unclear which action drove the
transition — e.g. several actions could produce the same state, or a witness fires unexpectedly and
you need to name the culprit. (For *confirming* a specific action fired as a property rather than
reading it off a trace, the per-action flag `var` in `patterns.md` §7 is the structural alternative.)

### Analysis steps

1. Scan for repeated actions — signal of a stuck loop
2. Find the critical transition: step where invariant violated or witness should have fired
3. Read state before and after that step — what changed?
4. Trace backwards: which actions led here, what nondeterministic picks were made

---

## Result Classification

After running all checks. These classify **what the sampled runs showed** — they describe the
run, not a verdict on the spec's correctness (sampling is not a proof; see the note above).

| Run outcome | Condition | How to report it |
|---|---|---|
| Clean run | Every witness reached in > 0 traces, all invariants without counterexample, all tests pass | "No counterexamples across the sampled runs; all target states reached. Not exhaustive." |
| Liveness concern | One or more witnesses reached in 0 traces after 500+ steps | "Target state not reached in sampling — possibly over-constrained, or sampling missed it." |
| Safety concern | Any invariant violated | "Counterexample found — this IS a bug (one trace is enough to disprove). Capture seed, analyze." |

Note the asymmetry: a violation is conclusive (a single counterexample disproves a safety
property), but the absence of one is not — it only summarizes the traces that were sampled.
