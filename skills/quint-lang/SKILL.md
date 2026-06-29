---
name: quint-lang
description: >
  Quint language and CLI reference — the expert on Quint syntax, operators, types, `basicSpells`,
  the toolchain (typecheck/run/test/verify), and how to read simulation and counterexample output.
  Use when writing or debugging the contents of a `.qnt` file, fixing a typecheck/parse error,
  looking up an operator or idiom, analyzing an invariant violation or counterexample trace, or
  optimizing state-space exploration. This is for working IN Quint at the language level — not for
  analyzing or running TLA+/TLC itself. For building a NEW model end-to-end from some source —
  including translating a TLA+ spec into Quint, or modeling code/requirements/an idea — use the
  quint-modeling skill, which owns that workflow and consults this reference for syntax. Keywords:
  quint, syntax, operators, typecheck, model checking, counterexample, basicSpells, CLI,
  specification language.
---
# Quint Language Reference

Quint is an executable specification language for complex systems, developed by Informal Systems. It compiles to TLA+ and supports simulation and model checking.

## Module structure

```quint
module MyProtocol {
  // type aliases, constants, state, actions, properties
}
```

Modules can import others:
```quint
import Voting.*              // all definitions
import Voting(quorum)        // specific definition
import Voting as V           // namespace alias
```

---

## Types

| Type | Description | Example |
|---|---|---|
| `int` | Integers | `-1, 0, 42` |
| `bool` | Booleans | `true, false` |
| `str` | Strings | `"hello"` |
| `Set[T]` | Finite set | `Set(1, 2, 3)` |
| `List[T]` | Ordered sequence | `List(1, 2, 3)` |
| `K -> V` | Key-value map (type is `K -> V`, **not** `Map[K, V]`) | value: `Map("a" -> 1)` |
| `(T1, T2)` | Tuple | `(1, "x")` |
| `{ f: T, g: U }` | Record | `{ x: 1, ok: true }` |
| `T \| U` | Sum (variant) | (use type alias) |

Type aliases:
```quint
type NodeId = int
type Phase = str   // "propose" | "vote" | "commit"
```

---

## Definitions

```quint
// Module parameter — fixed at instantiation, not a state variable
const N: int
const Nodes: Set[str]

// Pure function — no state access, usable anywhere
pure def max(a: int, b: int): int = if (a > b) a else b

// Stateful operator — can read vars, takes arguments (unlike val)
def isActive(n: str): bool = active.contains(n)

// State-reading value — can read vars, no arguments
val quorum: bool = votes.size() * 2 > nodes.size()

// Compile-time constant
pure val N: int = 4
val threshold: int = N / 2 + 1
```

`const` vs `pure val`: `const` is a module parameter bound at instantiation (`import A(N = 3)`); `pure val` is a fixed expression computed once. `def` vs `val`: `def` takes arguments; `val` does not.

---

## State variables

```quint
type LocalState = {
  leader: int,
  phase: str,
  votes: Set[int],
  log: List[str],
}

var localState: LocalState  // cohesive local protocol state
var peers: int -> str       // independent concern (peer metadata)
```

State variables can only be read in `val` definitions and actions; they cannot be read in `pure def`.

---

## Actions

Actions describe state transitions. They return `bool` — `true` if the action fires.

```quint
action init: bool = all {
  leader' = 0,
  phase' = "idle",
  votes' = Set(),
  log' = List(),
  state' = Map(),
}

action propose(node: int): bool = all {
  phase == "idle",
  node > 0,
  leader' = node,
  phase' = "propose",
  votes' = votes,
  log' = log,
  state' = state,
}
```

Key rules:
- Every `var` must be assigned in every action (use `x' = x` to leave unchanged).
- `all { ... }` — all sub-expressions must hold (conjunction). Guards are plain boolean expressions inside `all { }`.
- `any { ... }` — at least one must hold (disjunction); the REPL picks non-deterministically.

---

## Non-determinism

```quint
action step: bool = any {
  propose(1),
  propose(2),
  vote,
  timeout,
}

// Non-deterministic choice from a set
action deliverMessage: bool = {
  nondet msg = pending.oneOf()
  all {
    pending.size() > 0,
    delivered' = delivered.union(Set(msg)),
    pending' = pending.exclude(Set(msg)),
    // ... other vars unchanged
  }
}
```

---

## Set operators

```quint
Set(1, 2, 3).contains(2)          // true
Set(1, 2).union(Set(2, 3))        // Set(1, 2, 3)
Set(1, 2, 3).intersect(Set(2, 3)) // Set(2, 3)
Set(1, 2, 3).exclude(Set(2))      // Set(1, 3)
Set(1, 2, 3).filter(x => x > 1)  // Set(2, 3)
Set(1, 2, 3).map(x => x * 2)     // Set(2, 4, 6)
Set(1, 2, 3).fold(0, (acc, x) => acc + x)  // 6
Set(1, 2, 3).size()               // 3
Set(1, 2, 3).forall(x => x > 0)  // true
Set(1, 2, 3).exists(x => x > 2)  // true
1.to(5)                           // Set(1, 2, 3, 4, 5)
nondet x = Set(1, 2, 3).oneOf()   // non-deterministic pick — only valid in nondet bindings
```

---

## List operators

```quint
List(1, 2, 3).head()              // 1
List(1, 2, 3).tail()              // List(2, 3)
List(1, 2, 3).length()            // 3
List(1, 2, 3).nth(1)              // 2  (0-indexed)
List(1, 2, 3).append(4)           // List(1, 2, 3, 4)
List(1, 2).concat(List(3, 4))     // List(1, 2, 3, 4)
List(1, 2, 3).foldl(0, (acc, x) => acc + x)  // 6
List(1, 2, 3).select(x => x > 1) // List(2, 3)
```

---

## Map operators

```quint
Map("a" -> 1, "b" -> 2).get("a")        // 1
Map("a" -> 1).put("b", 2)               // Map("a" -> 1, "b" -> 2)
Map("a" -> 1, "b" -> 2).keys()          // Set("a", "b")
Set(1, 2, 3).mapBy(k => k * 2)          // Map(1 -> 2, 2 -> 4, 3 -> 6)  — set of keys → map
```

---

## Records

Records group related fields into a named type. They are the primary tool for modelling structured state in Quint.

### Type aliases for records

```quint
type NodeState = {
  phase:  str,     // "idle" | "propose" | "vote" | "commit"
  voted:  bool,
  log:    List[int],
}

type Message = {
  from:    int,
  to:      int,
  round:   int,
  payload: str,
}
```

### Creating and accessing

```quint
val n: NodeState = { phase: "idle", voted: false, log: List() }
n.phase                          // "idle"
n.voted                          // false
```

### Updating (immutable — returns a new record)

```quint
{ ...n, phase: "propose" }                          // ✅ preferred — idiomatic, handles multiple fields
{ ...n, voted: true, phase: "vote" }                // ✅ multiple fields at once

n.with("phase", "propose")                          // ⚠️ valid but non-idiomatic — field name is a string literal
```

### Records as state — when to group variables

TLA+ specs typically flatten all state into independent top-level variables. Quint's type system lets you group them. **When fields describe one cohesive local state, make a record type and use a single state variable of that type.**

**Group into a record when:**
- They represent the local state of a single actor (e.g. one node's phase + log + vote)
- They are always passed together as function arguments
- An invariant relates multiple fields of the same conceptual entity

**Keep flat when:**
- The variables represent distinct concerns that change independently
- The component is simple and grouping adds no clarity
- The variables are intentionally in different ownership/lifecycle domains

### Example: preferred grouped local state vs. anti-pattern

**Preferred (cohesive local state):**
```quint
type LocalState = {
  id: int,
  phase: Phase,
  est1: int,
  est2: Option[int],   // Option is from basicSpells, not built in — see Basic spells below
  round: int,
  crashed: bool,
  leader: int,
  received_messages: Set[Message],
}

var localState: LocalState
```

**Avoid for cohesive local state:**
```quint
var id: int
var phase: Phase
var est1: int
var est2: Option[int]
var round: int
var crashed: bool
var leader: int
var received_messages: Set[Message]
```

**For N actors, use a map of grouped records:**
```quint
type LocalState = { phase: str, votedFor: int, log: List[int] }

var nodes: int -> LocalState

action becomeFollower(id: int): bool = {
  val node = nodes.get(id)
  all {
    node.phase == "candidate",
    nodes' = nodes.put(id, {...node, phase: "follower"}),
  }
}
```

### Nested records

```quint
type ClusterState = {
  nodes:   int -> NodeState,
  leader:  int,
  epoch:   int,
}

var cluster: ClusterState

// Read nested field:
cluster.nodes.get(1).phase

// Update nested field (must rebuild from the inside out):
val updated = {...cluster.nodes.get(1), phase: "leader"}
cluster' = {...cluster, nodes: cluster.nodes.put(1, updated)}
```

### Records in sets (messages, events)

```quint
var inFlight: Set[Message]

action send(src: int, dst: int, r: int, p: str): bool = all {
  inFlight' = inFlight.union(Set({ from: src, to: dst, round: r, payload: p })),
  // ...
}

// Filter by field:
inFlight.filter(m => m.to == nodeId)
inFlight.exists(m => m.round == currentRound and m.payload == "vote")
```

---

## Sum types

Sum types (variants) represent a value that can be one of several distinct cases.

```quint
type Action =
  | Propose({ value: int, proposer: int })
  | Vote({ value: int, voter: int })
  | Decide({ value: int })
```

Each variant has a named constructor and carries one payload. A constructor takes exactly one argument — wrap multiple fields in a record (as above) or a tuple.

Construct a value by calling the constructor:
```quint
val a: Action = Propose({ value: 1, proposer: 2 })
```

Pattern-match with `match`, binding the payload:
```quint
pure def describeAction(a: Action): str =
  match a {
    | Propose(p) => "proposal"
    | Vote(v)    => "vote"
    | Decide(d)  => "decision"
  }
```

Use `_` to ignore the payload when you only care which variant it is:
```quint
match a {
  | Propose(_) => "proposal"
  | _          => "other"
}
```

Use sum types when a message, event, or state can take structurally different forms — not just different values of the same type.

---

## Enum types
Enum types are a special case of sum types where each case has no additional data.

```quint
type Phase = IDLE | PROPOSE | VOTE | COMMIT
var phase: Phase

if (phase == PROPOSE) { ... }
```

---

## Variable grouping — decision guide

Before writing `var` declarations, answer these questions for each candidate group:

| Question | Group → record if... | Keep flat if... |
|---|---|---|
| Do these vars always change together? | Yes, in most actions | No, they're independent |
| Do they describe the same entity? | Same node / same message / same round | Different concerns |
| Is there one instance or N instances? | Either one or N (group if cohesive; for N use `Id -> RecordType`) | Flat only when concerns are truly independent |
| Do invariants relate them? | Invariant spans multiple fields of one entity | Invariant uses vars independently |

---

## Boolean operators

```quint
not(p)             // negation — Quint has no ! operator
p and q            // conjunction
p or q             // disjunction
p implies q        // p => q  (not(p) or q)
p iff q            // p == q for booleans

and { p1, p2, p3 } // block form — equivalent to p1 and p2 and p3
or  { p1, p2, p3 } // block form — at least one must hold
```

`and { }` and `or { }` are the same operators as `all { }` and `any { }` in actions — use whichever reads more naturally in context.

---

## Invariants and temporal properties

```quint
// Safety invariant — must hold in every reachable state
// @invariant
val noDuplicateLeader: bool =
  leaders.size() <= 1

// Temporal property — evaluated over traces
// @temporal
temporal eventualProgress: bool =
  eventually(committed.size() > 0)

// Temporal operators
eventually(p)      // p holds in some future state
always(p)          // p holds in all future states
p.implies(q)       // p => q
```

---

## Assume

```quint
assume nodeCountPositive = N > 0
assume quorumMajority = 2 * quorum > N
```

An `assume` states a premise about constants, but it is **not enforced** — a violated `assume`
is silently ignored by `quint typecheck`, `quint run`, and `quint verify` (none of them flags
it). It is documentation, not a checked constraint. To actually *check* a condition on
constants, write a `run` test that asserts it (it executes and fails when the condition is
false):

```quint
run quorumAssumptionTest = all {
  2 * quorum > N,
  N > 0,
}
```

Run it with `quint test`; the test fails (reporting which conjunct broke) if a constant
assignment violates the condition.

---

## Conditional and let

```quint
if (x > 0) "positive" else "non-positive"

val result = {
  val doubled = x * 2
  doubled + 1
}
```


---

## REPL usage

Prefer CLI commands (`quint typecheck`, `quint run`, `quint test`, `quint verify`) for all validation and execution tasks. Open the REPL (`quint` or `quint -r spec.qnt::ModuleName`) only when you need expression-level interaction the CLI does not provide.

Type inspection:
```
>>> :type myExpression
```

---

## File layout

Split specs across two files:

```
<protocol-name>.qnt        # main module — step, init, vars, invariants
<protocol-name>_test.qnt   # test module — run tests and scenario witnesses (imports main)
```

### Module responsibilities

**Main module** (`<protocol-name>.qnt`):
- Declares all state variables, `init`, actions, and safety invariants
- **`step` must live in the main module** — it is the entry point for `quint run` simulation
- The module name matches the file stem: `module myProtocol` in `myProtocol.qnt`

**Test module** (`<protocol-name>_test.qnt`):
- Imports the main module (`import myProtocol.*`)
- Contains `run` tests and scenario witnesses invoked via `quint test` or `quint run`
- Inherits `step` from the main module through the import

### Which `--main` to pass for `quint run`

`quint run` must receive the module that **owns the property** being checked:

| Property location | Correct `--main` |
|---|---|
| Invariant defined in main module | main module name |
| Witness / `run` test defined in test module | test module name (it imports `step` from main) |

The primitive's `module_name` field (set during indexing) always holds the correct value. Use it directly — do not derive from the filename.

---

---

## Basic spells

Many useful operators are not built into Quint but are available in `basicSpells.qnt`, a standard library shipped with most Quint projects. Import it with:

```quint
import basicSpells.* from "./basicSpells"
```

Key definitions it provides:

| Definition | What it does |
|---|---|
| `type Option[a] = Some(a) \| None` | The option type — Quint has **no** built-in `Option`. Any spec field typed `Option[T]` depends on this import. |
| `unwrap(o)` | The value inside `Some`; undefined on `None` |
| `require(cond)` | Blocks the action if `cond` is false (cleaner than bare `all { cond, ... }`) |
| `values(m)` | Set of all values in map `m` |
| `transformValues(m, f)` | New map with `f` applied to every value |
| `has(m, key)` | True if `key` is bound in `m` |
| `getOrElse(m, key, default)` | `m.get(key)` if present, otherwise `default` |
| `mapRemove(m, key)` / `mapRemoveAll(m, ks)` | Copy of `m` without `key` (or without the set of keys `ks`) |
| `setRemove(s, e)` / `setAdd(s, e)` | Copy of set `s` without / with element `e` |
| `find(s, f)` / `findFirst(l, f)` | First element of set / list satisfying `f`, as `Option` |
| `max(i, j)` / `min(i, j)` / `abs(i)` | Max / min of two integers; absolute value |

When you see a spec using `Option`, `require`, `values`, or `transformValues` without an import, it is relying on basicSpells — check whether the project includes it. (Less common operators live in a sibling `rareSpells.qnt`.)

---

## Guidelines

Detailed references — read these when you need more than the quick reference above:

| File | Contents |
| --- | --- |
| `guidelines/operators.md` | Complete operator reference: extended set/list/map operators, `run`/`then`/`expect`/`reps` for tests and witnesses, temporal fairness, `q::debug` |
| `guidelines/simulations.md` | Witnesses vs invariants, result interpretation, progressive increase protocol, trace analysis, coverage standard |
| `guidelines/constraints.md` | Hard language limitations: no string ops, no nested match, no destructuring, no loops, no early returns |
| `guidelines/cli.md` | Full CLI reference: `quint run`, `quint test`, `quint verify` flags, verbosity guide, reading output |
| `guidelines/patterns.md` | 14 core patterns: State Type, Pure Functions, Thin Actions, Map Pre-population, Syntax Rules, Undefined Behavior, Witnesses, Nondeterministic Testing, Separate Test Files, REPL-First Debugging, Separate Concerns First, Extract System Model, Types-First Scaffolding, Logic Stubs |
| `guidelines/tests.md` | Writing and debugging tests: `run`/`then`/`expect`/`reps`/`fail`, nondeterministic tests, error location ≠ failure point, frame counting, REPL-first debugging |
| `guidelines/choreo.md` | Choreo framework for distributed protocols: two-file split, `choreo::cue` pattern, `.with_cue().perform()` testing, witness-based test discovery |
