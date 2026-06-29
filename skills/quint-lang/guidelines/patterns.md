# Quint Specification Patterns

Core patterns for writing correct, testable Quint specifications.

## Contents

- [1. State Type Pattern](#1-state-type-pattern)
- [2. Pure Functions Pattern](#2-pure-functions-pattern)
- [3. Thin Actions Pattern](#3-thin-actions-pattern)
- [4. Map Pre-population Pattern](#4-map-pre-population-pattern)
- [5. Syntax Rules](#5-syntax-rules)
- [6. Undefined Behavior — What to Guard Against](#6-undefined-behavior--what-to-guard-against)
- [7. Action Witnesses Pattern](#7-action-witnesses-pattern)
- [8. Nondeterministic Testing Pattern](#8-nondeterministic-testing-pattern)
- [9. Separate Test Files Pattern](#9-separate-test-files-pattern)
- [10. REPL-First Debugging](#10-repl-first-debugging)
- [11. Separate Concerns First](#11-separate-concerns-first)
- [12. Extract the System Model](#12-extract-the-system-model)
- [13. Types-First Scaffolding](#13-types-first-scaffolding)
- [14. Logic Stubs Pattern](#14-logic-stubs-pattern)

---

## 1. State Type Pattern

Encapsulate all state in a single `State` record. This is the fundamental structure for most Quint specs.

```quint
module System {
  // 1. Types — State record encapsulates everything
  type State = {
    field1: Type1,
    field2: str -> int,   // map type syntax: KeyType -> ValueType
  }

  // 2. Constants
  pure val INITIAL_USERS: Set[str] = Set("alice", "bob")

  // 3. Pure functions — ALL business logic here, split into a guard and a next-state function
  pure def canDoOperation(state: State, param: Type1): bool = precondition(state, param)
  pure def applyOperation(state: State, param: Type1): State = {...state, field1: newValue}

  // 4. State variable — keep cohesive state grouped
  var state: State

  // 5. Invariants
  val noNegativeBalances: bool = INITIAL_USERS.forall(u => state.field2.get(u) >= 0)

  // 6. Actions — guarded: the guard gates whether the action fires, then assign the next state
  action doOperation(param: Type1): bool = all {
    canDoOperation(state, param),
    state' = applyOperation(state, param),
  }

  // 7. Initialization — pre-populate ALL maps
  action init: bool = all {
    state' = {
      field1: initialValue,
      field2: INITIAL_USERS.mapBy(u => 0),
    },
  }

  // 8. Step action — nondeterministic exploration
  action step: bool = {
    nondet user = INITIAL_USERS.oneOf()
    any {
      doOperation(user),
    }
  }
}
```

**Section order matters** — the type checker requires definitions before use: Types → Constants → Pure Functions → State Variables → Invariants → Actions → Init → Step.

---

## 2. Pure Functions Pattern

All business logic goes in pure functions. Split each operation into two pure defs: a **guard**
(can it happen?) and a **next-state** function (what does it produce, assuming the guard holds).
The action (Pattern 3) lifts the guard so it is *disabled* when the operation can't happen — no
success flag, no no-op branch.

```quint
// Note: a pure def and an action cannot share a name in the same module (QNT101),
// so the action is `transfer` and the next-state function is `applyTransfer`.
pure def canTransfer(state: State, sender: str, recipient: str, amount: int): bool = and {
  state.balances.get(sender) >= amount,
  amount > 0,
  sender != recipient,
}
pure def applyTransfer(state: State, sender: str, recipient: str, amount: int): State = {
  val newBalances = state.balances
    .setBy(sender,    b => b - amount)
    .setBy(recipient, b => b + amount)
  {...state, balances: newBalances}
}
```

**Why**: Pure functions can be tested directly in the REPL with any state. Logic in actions can only be tested by running the full state machine.

> `to` is a built-in operator (`i.to(j)`), so it cannot be used as a parameter name — that is why the parameters here are `sender`/`recipient` rather than `from`/`to`.

---

## 3. Guarded Actions Pattern

An action puts the guard and the next-state assignment together in one `all { ... }`: the guard
gates whether the action fires, then it assigns the next state. When the guard is false the action
is simply **disabled** (it does not fire and changes nothing) — no success flag, no `unchanged_all`
fallback. A disabled action is the faithful model of "this can't happen now," and it's what lets the
simulator surface dead ends; a blanket no-op fallback fabricates a transition the system doesn't have.

```quint
action transfer(sender: str, recipient: str, amount: int): bool = all {
  canTransfer(state, sender, recipient, amount),
  state' = applyTransfer(state, sender, recipient, amount),
}
```

The action `transfer` uses the pure `canTransfer`/`applyTransfer` — distinct names, since a
`pure def` and an `action` cannot share a name. No conditional logic in the action beyond the guard.

For cohesive local state, avoid decomposing one concept into many top-level vars (`var id`, `var phase`, `var round`, ...). Prefer a `type LocalState` record and one `var localState: LocalState`.

---

## 4. Map Pre-population Pattern

Always pre-populate maps in `init` using `mapBy`. Never start with an empty map if you'll call `.get()` on it.

```quint
// ❌ Wrong — get("alice") is undefined if alice not in map
action init = all { balances' = Map() }

// ✅ Correct — all keys pre-populated
action init = all {
  balances' = USERS.mapBy(u => 0)
}
```

Map type syntax is `KeyType -> ValueType`, not `Map[KeyType, ValueType]`:

```quint
var balances: str -> int      // ✅ correct
var balances: Map[str, int]   // ❌ wrong
```

---

## 5. Syntax Rules

Common gotchas:

```quint
// 1. Parameterless pure def — omit parentheses
pure def name = ...           // ✅
pure def name() = ...         // ❌

// 2. Map type syntax
var m: str -> int             // ✅
var m: Map[str, int]          // ❌

// 3. Record update — spread syntax is idiomatic
{...state, field: newValue}   // ✅ preferred
state.with("field", newValue) // ⚠️ valid, but non-idiomatic (field name is a string literal)

// 4. Variant constructors take one argument — use tuples for multiple values
TimeoutInput((height, round)) // ✅
TimeoutInput(height, round)   // ❌

// 5. Tuple destructuring in match — bind first, then access
| TimeoutInput(hr) => ... hr._1 ... hr._2   // ✅
| TimeoutInput((height, round)) => ...       // ❌

// 6. oneOf is a method on collections
collection.oneOf()            // ✅
oneOf(collection)             // ❌

// 7. Reserved keywords cannot be identifiers or record field names
type T = { value: int }       // ✅
type T = { val: int }         // ❌ — `val` is a keyword (also `def`, `to`, `from`, `import`, …)
def f(sender: int) = ...      // ✅
def f(to: int) = ...          // ❌ — `to` is the built-in i.to(j) operator
```

---

## 6. Undefined Behavior — What to Guard Against

These operations have undefined behavior if preconditions aren't met:

| Operation | Unsafe when | Safe alternative |
| --- | --- | --- |
| `map.get(key)` | key not in map | Pre-populate with `mapBy`, or check `map.keys().contains(key)` |
| `set.getOnlyElement()` | set size ≠ 1 | `oneOf()` inside a `nondet` binding (nondeterministic), or guard the size to 1 first |
| `list.head()` / `list.tail()` | list is empty | Check `list.length() > 0` first |
| `list.nth(i)` | i < 0 or i ≥ length | Check `i >= 0 and i < list.length()` |
| `range(i, j)` / `i.to(j)` | i > j | Ensure `i <= j` |
| `map.set(k, v)` | key not already in map | Use `put(k, v)` instead |

---

## 7. Action Witnesses Pattern

A witness names a target state, written **positively**, and is checked with `quint run --witnesses`,
which reports how many sampled traces reached it.

```quint
// state-evidence: a withdrawal pushed someone's balance below the initial value
val withdrawalHappened = users.exists(u => balances.get(u) < INITIAL_BALANCE)

// multi-condition target
val fullCycleReached = and {
  delegations.size() == 0,
  users.forall(u => rewards.get(u) == 0),
  users.exists(u => balances.get(u) > INITIAL_BALANCE),
}

// quint run --witnesses withdrawalHappened fullCycleReached spec.qnt
//   → withdrawalHappened was witnessed in N trace(s) … (P%)
// N > 0 = reachable; 0 = dead action (over-constrained precondition or bug)
```

Add one witness per major action; a witness reached in 0 traces means the action is dead.

**Make the target a state only an action can produce.** A witness is satisfied by *any* state that
matches, including the initial state — so a predicate that already holds at `init` (e.g. a balance
that starts unequal) is "reached" in 100% of traces at step 0, telling you nothing about the action.
Phrase the target so only the action you care about can make it true (e.g. a balance *below* the
initial value requires a withdraw to have fired), and a non-zero count then genuinely witnesses the
action.

**Distinguishing *which* action fired (rare).** When several actions can produce the same target
state and you must confirm a *specific* one ran, add a dedicated per-action boolean `var` set in that
action's body and read it in the witness:

```quint
var lastWasWithdraw: bool                 // declared; set in EVERY action (false elsewhere)
// ... withdraw sets lastWasWithdraw' = true; other actions set it false ...
val withdrawFired = lastWasWithdraw and withdrawalHappened
```

This costs an assignment in every action (Quint requires every `var` set in every action), so reach
for it only when a plain state-evidence target genuinely can't distinguish the case — usually it can.

When you want an actual *trace* that reaches the state rather than a count, write the negation as an
invariant (`val w = not(target)`) and run `--invariant w` — the reported "violation" is a reaching
execution.

---

## 8. Nondeterministic Testing Pattern

Use `nondet` with `.oneOf()` for broad coverage with random value selection.

```quint
run nondetTest = {
  nondet amount = 50.to(300).oneOf()
  nondet user   = USERS.oneOf()
  init
    .then(transfer(user, "treasury", amount))
    .expect(balances.get(user) >= 0)
}
```

Multiple `nondet` bindings explore combinations. The simulator picks values pseudo-randomly; use `--seed` to reproduce a specific run.

---

## 9. Separate Test Files Pattern

Main spec has no `run` definitions. Tests live in a separate file that imports the spec.

```quint
// system.qnt — main spec, no tests
module system {
  // ... spec only ...
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

Run tests with:
```bash
quint test systemTest.qnt --main systemTest --match basicTest
```

---

## 10. REPL-First Debugging

Test pure functions and action sequences in the REPL before writing formal tests. If REPL output surprises you, the spec has a bug.

```bash
# Test a pure function with a hand-crafted state
echo 'val s = {balances: Set("alice").mapBy(_ => 100)}
transfer(s, "alice", "bob", 50)' | quint repl -r system.qnt::system

# Test an action sequence
echo 'init
transfer("alice", "bob", 50)
balances' | quint repl -r system.qnt::system
```

Anonymous actions are also useful for forcing specific state in the REPL:

```quint
>>> all { balances' = Set("alice").mapBy(_ => 999), owner' = "alice" }
true
>>> balances
Map("alice" -> 999)
```

---

## 11. Separate Concerns First

Before writing any Quint, partition the protocol into three buckets:

- **State machine** — variables, initialization, transitions
- **Functional logic** — pure computations: quorum checks, message filtering, state updates
- **Properties** — invariants, witnesses, temporal properties

This partition maps directly to Quint: state machine → `var` + actions, functional logic → `pure def`, properties → `val` invariants + witnesses. Trying to translate everything at once produces specs where logic ends up in the wrong layer.

---

## 12. Extract the System Model

Before writing `var` declarations, identify the protocol's assumptions explicitly — they're easy to miss when implicit in prose or TLA+. Each becomes a `const` declaration; to actually *check* a condition on those consts, write a `run` test (an `assume` only documents the premise and is not enforced — see the `## Assume` section).

| Concern | Questions to answer |
| --- | --- |
| **Communication** | Reliable or lossy? Ordered or unordered? Broadcast or point-to-point? |
| **Failures** | Crash-stop? Crash-recovery? Byzantine? What fraction `f` of `n`? |
| **Time** | Synchronous? Asynchronous? Partial synchrony? Are timeouts modelled? |
| **Participants** | Fixed membership or dynamic? How many processes? |

```quint
pure val N: int = 4          // total processes
pure val F: int = 1          // max faulty

// Check the assumption — a `run` test actually evaluates it. (`assume` would only document
// it; it is not enforced. Name ends in `Test` so `quint test` picks it up — see tests.md.)
run quorumMajorityTest = { all { 2 * F < N } }
```

If an assumption is wrong, every invariant built on top of it is wrong. Surface them before building anything else.

---

## 13. Types-First Scaffolding

Define all types and run `quint typecheck` before writing any logic. A spec that compiles with only types and `var` declarations is a solid foundation. A spec with correct logic but misaligned types is hard to untangle.

```quint
// Step 1: define all types
// (Option is not built in — it comes from basicSpells; import it or define
//  `type Option[a] = Some(a) | None` yourself.)
type Entry   = { term: int, value: str }
type NodeState = { log: List[Entry], votedFor: Option[int], currentTerm: int }
type Message =
  | VoteRequest({ term: int, src: int })
  | VoteResponse({ term: int, src: int, granted: bool })

// Step 2: declare vars — no logic yet
var nodes:    int -> NodeState
var messages: Set[Message]

// Step 3: quint typecheck — must pass before proceeding
```

Use the full type system: records for structured state, sum types for messages with distinct shapes, `NodeId -> LocalState` maps for per-process state, `Set[Message]` for the message soup.

**Iterate with the user at this step.** Show the type sketch and get explicit approval before writing any functions or actions.

---

## 14. Logic Stubs Pattern

Write correct `pure def` signatures with placeholder bodies that compile. Fill in real logic one function at a time, testing each in the REPL before moving to the next.

```quint
// ✅ Stub — correct signature, placeholder body, compiles
pure def isQuorum(voters: Set[int], allNodes: Set[int]): bool =
  false  // TODO

pure def applyEntry(state: NodeState, entry: Entry): NodeState =
  state  // TODO

// Later — fill in one at a time and test in REPL
pure def isQuorum(voters: Set[int], allNodes: Set[int]): bool =
  voters.size() * 2 > allNodes.size()
```

**Why stubs first**: type mismatches surface at the signature level before logic exists, when they're cheap to fix. A full stub pass also forces you to think through every function's inputs and outputs before committing to an implementation.

Only move to the state machine (actions, `init`, `step`) after all stubs compile and all logic is tested.
