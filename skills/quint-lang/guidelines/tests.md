# Writing and Debugging Tests

## Contents

- [File Structure](#file-structure)
- [Writing Tests](#writing-tests)
- [Running Tests](#running-tests)
- [Debugging Failures](#debugging-failures)
- [REPL-First Debugging](#repl-first-debugging)

## File Structure

Tests live in a separate file that imports the main spec. The main spec has no `run` definitions.

```quint
// system.qnt — spec only, no tests
module system {
  // ... vars, actions, invariants ...
}

// systemTest.qnt — tests only
module systemTest {
  import system.* from "./system"

  run basicTest = {
    init
      .then(transfer("alice", "bob", 50))
      .expect(balances.get("alice") == INITIAL_BALANCE - 50)
  }
}
```

Run with:
```bash
quint test systemTest.qnt --main systemTest --match basicTest
```

> **Naming gotcha:** by default `quint test` runs only `run` definitions whose name **ends in
> `Test`** (e.g. `basicTest`). A `run` named otherwise (`happyPath`, `testBasic`, `checkQuorum`) is
> **silently skipped** — no error, no output, exit 0 — which reads as "passed." Either suffix the
> name with `Test`, or select it explicitly with `--match <name>` (or `--match '.*'` for all).

---

## Writing Tests

### Basic pattern

```quint
run happyPath =
  init
    .then(action1(args))
    .expect(condition1)
    .then(action2(args))
    .expect(condition2)
```

### Operators

| Operator | Meaning |
|---|---|
| `a.then(b)` | Execute `a`, then execute `b` from resulting state |
| `a.expect(p)` | Execute `a`, fail if `p` is false in resulting state |
| `n.reps(i => A)` | Execute action `A` n times; iteration index passed as `i` |
| `a.fail()` | Asserts `a` evaluates to false (action should be blocked) |
| `assert(p)` | Does not change state; fails if `p` is false |

### Repeat an action N times

```quint
run threeVotes =
  init
    .then(3.reps(i => vote(i)))
    .expect(votes.size() == 3)
```

### Negative test — assert an action is blocked

```quint
run cannotDoubleVote =
  init
    .then(vote("alice"))
    .then(vote("alice").fail())   // second vote must fail
```

### Assert mid-trace

An `assert` must sit inside an `all { }` block that also assigns the state
variables. A standalone `.then(assert(...))` step assigns nothing, so its effect
cannot unify with the rest of the trace and the test fails to typecheck. For an
after-the-fact check, use `.expect(...)` instead of a trailing assert step.

```quint
run checkTiming =
  init
    .then(all { vote(1), assert(votes.size() == 0) })  // assert BEFORE vote executes
    .expect(votes.size() == 1)                          // assert AFTER
```

### Nondeterministic tests

```quint
run nondetTest = {
  nondet amount = 50.to(300).oneOf()
  nondet user   = USERS.oneOf()
  init
    .then(transfer(user, "treasury", amount))
    .expect(balances.get(user) >= 0)
}
```

Multiple `nondet` bindings explore combinations. Use `--seed` to reproduce a specific run.

### Conditional expectations — one test covering several branches

When the *correct* outcome depends on how the random inputs relate to each other, don't write one
fixed assertion (it can't be right for every draw) and don't split into many hardcoded tests.
Instead branch the `.expect()` on the inputs and assert the outcome that's correct **for that
branch** — a single `run` then exercises the whole decision surface.

```quint
// withdrawCapped is always enabled; it takes the whole balance if asked for more.
run withdrawTest = {
  nondet amount = 50.to(150).oneOf()
  init                              // balance starts at 100
    .then(withdrawCapped(amount))
    .expect(if (amount > 100)
              balance == 0                 // asked for more than held → capped to the balance
            else
              balance == 100 - amount)     // normal deduction
}
```

The branch condition uses the `nondet` values; each arm asserts the result appropriate to that
relationship (under/at/over a threshold, full/partial, etc.).

**Caveat — this only works while the action stays *enabled* across all branches.** A `.then(act)`
on a **disabled** action (its guard is false) cannot proceed: the test stops with `Cannot continue
to "expect"` before the `.expect` is ever evaluated — so you **cannot** write an `if`-arm meaning
"in this case the action was blocked, assert nothing changed." Conditional `.expect()` is for an
always-enabled action whose *result* differs by input. To test that an action is correctly
**blocked** for some inputs, use a separate `.then(act.fail())` step instead (the spec uses
disabled actions, not a `success` boolean — see `patterns.md`).

### Variable scope inside `.expect(...)`

A `val` bound inside an `and { ... }` is **not** in scope for sibling conditions or an `if` guard in
the same block — you get an "unresolved name" error:

```quint
// ❌ actualReward is not visible to the `if` below it
.expect(and {
  val actualReward = reward - commission
  balance == initial + actualReward,
  if (actualReward > 0) balance > initial else true,   // ERROR: actualReward not in scope
})
```

Wrap the conditions in an `all { }` so the shared `val`s scope over all of them — and remember
`all { }` separates conditions with **commas**, not `and`:

```quint
// ✅ shared vals scope over the whole all-block
.expect(
  val actualReward = reward - commission
  all {
    balance == initial + actualReward,
    if (actualReward > 0) balance > initial else true,
  })
```

---

## Running Tests

```bash
# Run a specific test
quint test systemTest.qnt --main systemTest --match basicTest

# Run all tests matching a pattern
quint test systemTest.qnt --main systemTest --match ".*"

# Run with detailed trace output
quint test systemTest.qnt --main systemTest --match basicTest --verbosity 3

# Reproduce a failure with a seed
quint test systemTest.qnt --main systemTest --match basicTest --seed 0x1a2b3c
```

---

## Debugging Failures

### `quint test` output is sparse — it does NOT show the state

On a failure, `quint test` prints only the error code, the offending `run`, and a seed — **no
state, no trace, at any `--verbosity`** (even `--verbosity 5` adds nothing for a test). The two
failure modes read differently, and the error text is your only clue which one you hit:

```
Error [QNT508]: Expect condition does not hold true   ← an .expect(...) evaluated to false
Error [QNT508]: Cannot continue to "expect"           ← a .then(action) was DISABLED (its guard
                                                          was false), so the trace couldn't proceed
```

Both underline the **whole `run` expression**, not the specific `.expect` or action that failed, and
neither tells you the actual values. To debug, you must recover the state yourself — two reliable
ways below.

### Recover the state — Option A: replay in the REPL (best for exploring)

Feed `init` then each action of the failing trace into the REPL and query whatever the `.expect`
checked. Each action prints `true` and the state transition (`old => new`); then evaluate any
expression at the current state:

```bash
printf 'init\ntransfer("alice","bob",50)\nstate.balances.get("alice")\n' \
  | quint -r system.qnt::system --backend=typescript
# >>> true
# { state: { balances: Map("alice" -> 100 => 50, "bob" -> 100 => 150) } }
# >>> 50          ← the value your .expect compared; here 50, so `== 999` is obviously false
```

**`--backend=typescript` is required for piped/non-interactive REPL input.** The default Rust
backend closes its readline on EOF and evaluates nothing (`ERR_USE_AFTER_CLOSE: readline was
closed`) — so without the flag this recipe silently produces no output. (Interactive TTY use works
on either backend; it's specifically piped stdin that needs `typescript`.)

For nondeterministic stepping, set a seed so the run is reproducible: `.seed=<number>` in the REPL
(or `--seed` on the CLI) makes every `nondet`/`oneOf` pick deterministic — same seed, same trace.
Capture the seed `quint test`/`quint run` prints on a failure and replay it to reproduce exactly.

### Recover the state — Option B: dump the trace with `--out-itf` (scriptable)

`quint test --out-itf` writes the full state trace of every test (passing *and* failing) to a JSON
file — useful in scripts or when you want the machine-readable trace:

```bash
quint test systemTest.qnt --match myTest --out-itf "out_{test}_{seq}.itf.json"
# then read the states from out_myTest_0.itf.json (the last state is where it stopped)
```

### Then map the trace to the test code and classify the bug

| Symptom | Type | Fix |
|---|---|---|
| Action doesn't update the field being checked | Spec bug | Fix the action's state update |
| `.expect()` checks a field before the action that sets it | Test bug | Move the `.expect()` later in the chain |
| `.expect()` uses wrong value | Test bug | Correct the expected value |
| Action sets a wrong value | Spec bug | Fix the pure function logic |

### Common mistakes

```quint
// ❌ Checking state before it's set
run bad =
  init
    .then(all { action1, assert(result == 42) })  // assert runs BEFORE action1 updates state

// ✅ Check after
run good =
  init
    .then(action1)
    .expect(result == 42)

// ❌ Forgetting action order matters
run bad =
  init
    .then(approve(100))
    .expect(balance == INITIAL - 100)   // approve doesn't deduct — transfer does

// ✅ Complete the sequence
run good =
  init
    .then(approve(100))
    .then(transfer(100))
    .expect(balance == INITIAL - 100)
```

---

## REPL-First Debugging

Before writing a failing test, isolate the problem in the REPL:

```bash
# Interactive (TTY): either backend works
quint -r system.qnt::system

# Force a specific state with an anonymous action, then step and query
>>> all { balances' = Set("alice").mapBy(_ => 100), phase' = "ready" }
true
>>> transfer("alice", "bob", 50)
true
>>> balances.get("alice")
50
```

When driving the REPL **non-interactively** (piping commands, e.g. from a script or an agent), add
`--backend=typescript` — the default Rust backend evaluates nothing on piped stdin (see Option A
above):

```bash
printf 'init\ntransfer("alice","bob",50)\nbalances.get("alice")\n' \
  | quint -r system.qnt::system --backend=typescript
```

If the REPL shows wrong output, the spec has a bug. If the REPL shows the right output but the test fails, the test chain has a sequencing error.
