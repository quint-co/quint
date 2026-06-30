# Quint Operator Reference — Complete

This file covers operators missing from SKILL.md's quick reference. Read this when you need the full operator surface.

## Contents

- [Set operators (extended)](#set-operators-extended)
- [List operators (extended)](#list-operators-extended)
- [Map operators (extended)](#map-operators-extended)
- [Run tests and witnesses](#run-tests-and-witnesses)
- [Temporal operators (extended)](#temporal-operators-extended)
- [Debug output](#debug-output)

---

## Set operators (extended)

```quint
// Membership
1.in(Set(1, 2, 3))                       // true  (reverse of contains)
Set(1, 2).subseteq(Set(1, 2, 3))         // true

// Structure
Set(1, 2).powerset()
  // Set(Set(), Set(1), Set(2), Set(1, 2))
Set(Set(1, 2), Set(3, 4)).flatten()      // Set(1, 2, 3, 4)

// Selection
Set(5).getOnlyElement()                  // 5 — deterministic; undefined if size != 1
nondet x = Set(1, 2, 3).oneOf()        // nondeterministic pick — use in actions only
```

**Picking an element**: use `getOnlyElement()` when the set has exactly one element (deterministic), or `oneOf()` inside a `nondet` binding in an action for a nondeterministic pick. `oneOf` outside a `nondet` binding causes a type/effect error.

> Quint also has a `chooseSome` operator in its type signatures, but the simulator and verifier **do not implement it** — calling it raises a runtime error (`QNT501: Runtime does not support the built-in operator 'chooseSome'`). Do not use it in executable specs.

---

## List operators (extended)

```quint
List(1, 2, 3).indices()                  // Set(0, 1, 2)
List(1, 2, 3).replaceAt(1, 9)           // List(1, 9, 3)
List(1, 2, 3, 4, 5).slice(1, 3)         // List(2, 3)  — i inclusive, j exclusive
range(1, 4)                              // List(1, 2, 3)  — i inclusive, j exclusive
```

**`range` vs `to`**: `range(i, j)` returns a `List[int]` (ordered, j exclusive). `i.to(j)` returns a `Set[int]` (unordered, j inclusive).

---

## Map operators (extended)

```quint
// set vs put — critical distinction
Map(1 -> "a", 2 -> "b").set(2, "x")     // Map(1 -> "a", 2 -> "x") — update EXISTING key only
Map(1 -> "a", 2 -> "b").put(3, "c")     // Map(1 -> "a", 2 -> "b", 3 -> "c") — add or update

// Functional update
Map(1 -> 10, 2 -> 20).setBy(2, x => x + 5)  // Map(1 -> 10, 2 -> 25)

// Building maps
Set((1, true), (2, false)).setToMap()   // Map(1 -> true, 2 -> false)
Set(1, 2).setOfMaps(Set(true, false))
  // all possible maps from {1,2} to {true,false}
```

**`set` vs `put`**: `set(k, v)` has undefined behavior when `k` is not already a key. Use `put` when you might be inserting a new key; use `set` (or `setBy`) when you know the key exists. In practice, `put` is almost always what you want for state updates.

---

## Run tests and witnesses

`run` definitions define concrete execution scenarios. They are the primary way to write witnesses (reachability checks) and deterministic tests.

```quint
// Basic pattern: chain actions with .then(), assert state with .expect()
run happyPath = init.then(vote(1)).then(vote(2)).then(decide).expect(decided == true)

// Repeat an action N times
run threeVotes = init.then(3.reps(i => vote(i))).expect(votes.size() == 3)

// Negative test — assert an action fails
run cannotDoubleVote = init.then(vote(1)).then(vote(1).fail())

// Assert mid-trace. An `assert` must ride inside an `all { }` that also assigns
// the state variables — a bare `.then(assert(...))` step assigns nothing and
// fails to typecheck (effect mismatch with the rest of the trace). Use `.expect`
// for an after-the-fact check.
run checkAfterVote =
  init
    .then(all { vote(1), assert(votes.size() == 0) })  // assert BEFORE vote executes
    .expect(votes.size() == 1)                         // assert AFTER (no extra step needed)
```

### Operators

| Operator | Signature | Meaning |
| --- | --- | --- |
| `a.then(b)` | `(bool, bool) => bool` | Execute `a`, then `b` from the resulting state |
| `a.expect(p)` | `(bool, bool) => bool` | Execute `a`, fail if `p` is false in resulting state |
| `n.reps(i => A)` | `(int, (int) => bool) => bool` | Execute action `A` n times; iteration index passed as `i` |
| `a.fail()` | `(bool) => bool` | True when `a` evaluates to false |
| `assert(p)` | `(bool) => bool` | Does not change state; fails if `p` is false |

### Using run as a witness

A witness is a `run` that demonstrates a state is reachable. The spec verifier checks that the `run` completes without failure:

```quint
// @witness
run decisionIsReachable =
  init
    .then(3.reps(i => vote(i)))
    .expect(decided == true)
```

This `run`-style witness documents a *known* reachable path and is checked with `quint test` (it passes when the path completes). For exploratory reachability, write the target as a predicate and use `quint run --witnesses <pred>` instead — a non-zero trace count means reachable. See `guidelines/simulations.md` for the full witnesses treatment.

---

## Temporal operators (extended)

```quint
// Logical equivalence
p.iff(q)           // true when p and q have the same truth value

// Stuttering — `vars` is a Set of state variables: Set(x), Set(x, y), ...
a.orKeep(vars)     // a is true, OR all vars in vars are unchanged
a.mustChange(vars) // a is true AND at least one var in vars changed

// Action enablement
enabled(a)         // true when action a's preconditions are satisfiable

// Fairness
a.weakFair(vars)   // if a is eventually always enabled, it eventually fires
a.strongFair(vars) // if a is infinitely often enabled, it eventually fires
```

The `vars` argument is a **`Set` of state variables**, so every variable in it must have the **same type** (e.g. `Set(votes, committed)` where both are `Set[int]`). To cover differently-typed variables, group cohesive state into one record variable and pass `Set(localState)`, or pass `Set(theOneVar)`. The official examples use a single variable: `Next.weakFair(Set(x))`.

### Fairness in practice

Fairness conditions are needed to rule out trivially non-terminating behaviours in liveness proofs. Add `weakFair` for actions that should eventually fire when continuously enabled (e.g. message delivery). Add `strongFair` for actions that may be intermittently enabled but must eventually fire.

```quint
// @temporal — pass same-typed vars; here both are sets
temporal liveness: bool =
  step.weakFair(Set(votes, delivered)).implies(eventually(decided))
```

---

## Debug output

```quint
// Print a label and value; returns the value unchanged
q::debug("votes after round", votes)

// Self-labelling form — prints the expression text and its value
q::debug(votes.size())
```

`q::debug` is a `pure def` — it can appear anywhere including inside expressions. It prints to stdout during REPL evaluation and simulation. Remove before formal verification with Apalache.
