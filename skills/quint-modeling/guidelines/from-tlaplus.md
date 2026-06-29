# From TLA+: translation intake

This is the intake flow for translating an existing TLA+ specification into Quint. Do the TLA+-specific intake and design decisions below, then follow the shared modelling spine (Steps 1–7) in `quint-modeling/SKILL.md`.

## Contents

- **Philosophy: fidelity** — what the translation must preserve
- **The "Maintain" rules** — CONSTANT/ASSUME, abstract sets, sentinel constants, EXTENDS
- **The "Change" rules** — where idiomatic Quint diverges (local state, thin actions, message soup → Choreo, listen/send naming)
- **Phase 1: TLA+ intake** — Steps 1.1–1.4 (domain, EXTENDS, CHOOSE, variables, actions, system model)
- **TLA+-specific output format** — editor mode line, `NameAnalysis` module, `README.md`
- **TLA+-specific pitfalls** — the gotcha table

## Philosophy: fidelity

TLA+ specs have precise semantics that must be maintained. Most TLA+ specs translate close to one-to-one, but Quint offers modern syntax that reads better. The goal is a readable Quint spec **where the TLA+↔Quint mapping is obvious**.

Concretely:

- **Maintain names** — of variables, functions, and operators.
- **Infer TLA+ types.** If a type is genuinely in doubt, ask the user rather than guessing.
- **Translate every TLA+ invariant faithfully.** Each TLA+ invariant operator (`Inv`, `TypeOK`, `VotesSafe`, etc.) becomes a `val` in Quint with the **same name**, the **same conjunct order**, and inline comments that cite the TLA+ formula. Do **not** add invariants that have no TLA+ counterpart, do not split a TLA+ invariant into helper `val`s, and do not introduce safety properties beyond what the TLA+ spec defines.

## The "Maintain" rules

These preserve the TLA+ structure. Keep the concrete forms below — they are the value of this flow.

### Modularity: CONSTANT and ASSUME

- **CONSTANT → separate parametric modules.** If a TLA+ spec uses `CONSTANT` and separate TLA+ files instantiate those constants, do the same in Quint: a parametric module with `const` declarations, plus an instantiation module.
- **ASSUME → a `run` test in the same parametric module as the `const`** — *not* in the instantiation module, and *not* via Quint's `assume` keyword (do not use `assume`).

```quint
run quorumAssumptionTest = {
  all {
    Quorum.forall(Q => Q.subseteq(Acceptor)),
    Quorum.forall(Q1 => Quorum.forall(Q2 => Q1.intersect(Q2) != Set())),
  }
}
```

Run it via `quint test <file> --main <InstanceModule>`. The test passes when all conditions hold; it fails (reporting which step failed) otherwise.

### Abstract TLA+ sets → const + parametric types

`CONSTANT Value, Acceptor` become `const`s with **descriptive lowercase type variables** (e.g. `acceptorType`, `valueType`). Use distinct variables when the sets have independent element types. Any type that mentions them must be made **parametric**. The `var` and function signatures use the module-level type variables directly; the instantiation module infers concrete types from the const values, so no explicit type arguments are needed:

```quint
const Acceptor : Set[acceptorType]
const Value    : Set[valueType]
const Quorum   : Set[Set[acceptorType]]
type Vote[v]          = { bal : int, value : v }
type AcceptorState[v] = { votes : Set[Vote[v]], maxBal : int }
var acceptors : acceptorType -> AcceptorState[valueType]
// function sigs can omit the type param when Quint can infer it:
// (state : AcceptorState, acc : acceptorType, v : valueType, ...)

// Instance: types inferred as acceptorType=int, valueType=int
import Voting(Acceptor = Set(1,2,3), Value = Set(0,1), Quorum = ...).*
```

### TLA+ sentinel constants → variants of a shared sum type

TLA+ sentinel constants (`CONSTANT any, none` with `any \notin Values \union {none}`) should be translated as explicit variants of a **shared sum type** defined in a **separate module** — not as an abstract `const`. Define the type in its own file (e.g. `PaxosValues.qnt`) imported by all modules that need it:

```quint
// PaxosValues.qnt
module PaxosValues {
  type AllValues[v] = Any | NoVal | Val(v)
  //   Val(v) — a real protocol value
  //   Any    — TLA+ `any` sentinel
  //   NoVal  — TLA+ `none` sentinel
}
```

The assume test can then faithfully check both exclusions:

```quint
not(Values.contains(Any)),   // any \notin Values \union {none}
not(Values.contains(NoVal)), // none \notin Values \union {any}
```

The type **must** live in a separate module (see the parametric-type cycle in Pitfalls).

## The "Change" rules

These are the places where idiomatic Quint diverges from the TLA+ structure.

- **Distributed local state.** In TLA+ local variables are often multiple flat maps from process IDs to values. In Quint, encode a `LocalState` record capturing one process's local variables, and store the system state as a map from process ID to `LocalState`. (The spine's Step 2 covers the general mechanics of this map-of-records shape.)

- **Truly thin action layer.** All guards and state computation belong in `pure def`s; actions are single assignments that call the pure def and set the next state. When a TLA+ guard that would *disable* an action is instead absorbed into a pure def's `if-else` (returning the old state on failure), this introduces stuttering — document it on the action with a note and a hint for how to remove it:

  ```quint
  // Note: applyFoo returns st unchanged when <guard> fails — stuttering vs TLA+.
  // To remove stuttering add: <guard>,
  action foo(acc : acceptorID, bal : int) : bool = all {
    acceptors' = acceptors.set(acc, applyFoo(acceptors, acc, bal)),
  }
  ```

  Returning-old-state-on-failure is acceptable as a **transient step** during translation (it lets
  you get the spec running before every guard is lifted out), but it is not the end state: a
  blanket no-op fabricates a transition the protocol doesn't have. Before handoff, lift the guards
  out so the action is properly disabled when its precondition fails — see the spine's Step 6
  ("Model transitions faithfully: guard actions, don't fake no-ops") for the reasoning.

- **Message soup → consider Choreo.** A TLA+ message soup (a `msgs` variable, a `Send(m)` helper, or any `\cup {m}` pattern on a message set) is a strong signal the protocol is genuinely message-passing — **raise Choreo in design before writing any code, unless the protocol is single-actor or simple enough that plain Quint is clearer** (see the spine's "When to use Choreo"). When it fits, use Choreo (`../quint-lang/guidelines/choreo.md`) and ask the user to confirm the node/role decomposition (which processes send/receive which message types, whether to introduce an explicit leader). The TLA+ soup is monotone (messages are never deleted) — decide whether Choreo inboxes should consume messages or leave them in place.

- **Choreo `listen_*` / `send_*` naming.** `listen_X` is named after what it watches for (the triggering condition or incoming message type); `send_X` is named after the message type it produces (= the TLA+ operator name). E.g., TLA+ `Phase2b(a,b,v)` is triggered by a Phase2a message → `listen_phase2a` / `send_phase2b`. For an initial step with no incoming message, use a descriptive name like `listen_start` or `listen_phase1b_quorum`. The `main_listener` then reads as a direct transliteration of the TLA+ `Next` definition.

### TLA+ `EXTENDS` → `import M(...) as m` + `export m`

Quint has no `EXTENDS` keyword. The closest equivalent is a namespaced import where the extending module re-declares the shared `const`s, passes them through, and re-exports the namespace:

```quint
// FastPaxos.qnt — mirrors TLA+ EXTENDS Paxos
const Replicas   : Set[acceptorType]   // re-declare shared consts
const Ballots    : Set[int]
// ...

import Paxos(
  Replicas    = Replicas,              // pass through to base module
  Ballots     = Ballots,
  // ...
) as paxos from "Paxos"
export paxos                           // re-export so analysis modules can call paxos::f
```

The analysis module then calls `paxos::listen_p2a_value`, `paxos::upon_classic_decide`, etc. without duplication.

**Constraint — higher-order const bindings (verify locally).** In some cross-module setups (observed
passing `paxos::f` to `choreo::cue`), a function whose body references module-level `const`s loses
the const binding when used as a higher-order argument across the boundary, failing at runtime with
"Uninitialized const". This is **not** a reliable general rule — a plain higher-order const closure
across a normal `import` runs fine on current Quint — so treat it as a setup-specific gotcha to check
against your own version, not a law. If you do hit it, the fix is to rewrite the body to use only the
type structure: `Values.contains(r.value)` → `r.value != Any and r.value != NoVal` (equivalent when
`Values` only contains `Val(v)` elements, which the assume test guarantees).

**Constraint — cross-module `val` invariants.** The governing insight: a `pure def`'s arguments are
evaluated at the **call site**, so consts passed in refer to the *caller's* (bound) consts; a `val`
is evaluated in **its own defining module's** const environment, which is not propagated across an
import boundary. So referencing `paxos::TypeOKInvariant` (a `val`) from the extending module fails at
runtime with "Uninitialized const". Fix: extract the invariant body into a `pure def` that takes the
consts as explicit parameters, then call it from both the base `val` and the extending module's
invariant.

```quint
// Paxos.qnt — base module
pure def checkPaxosTypeOK(
  values:        Set[AllValues],
  ballots:       Set[int],
  decision:      AllValues,
  replicaStates: Set[StateFields]   // pass s.system.get(a).state for each replica
): bool =
  (values.contains(decision) or decision == NoVal)
  and replicaStates.forall(sf =>
    match sf {
      | AcceptorState(acc) =>
          ballots.contains(acc.maxBallot)
          and ballots.contains(acc.maxVBallot)
          and (values.contains(acc.maxValue) or acc.maxValue == NoVal)
      | CoordState(_) => false
    }
  )

val PaxosTypeOK: bool =
  checkPaxosTypeOK(Values, Ballots, coordState.decision,
                   Replicas.map(a => s.system.get(a).state))

// FastPaxos.qnt — extending module
// paxos::checkPaxosTypeOK works because it takes consts as explicit parameters.
// paxos::PaxosTypeOK would fail — val references do not propagate const bindings.
val FastTypeOK: bool =
  paxos::checkPaxosTypeOK(Values, Ballots, coordState.decision,
                          Replicas.map(a => s.system.get(a).state))
  and (Values.contains(coordState.cValue) or coordState.cValue == NoVal)
```

(In the example above, `checkPaxosTypeOK` works from FastPaxos because `Values`/`Ballots` are
evaluated at the call site against FastPaxos's bound consts.)

When the operator genuinely differs between base and extending module (e.g. `ClassicDecide` iterates `ClassicBallots` in FastPaxos but `Ballots` in Paxos), define the function locally in the extending module. This is semantically correct, not a workaround.

**File length check — ask before combining `EXTENDS` modules.** When the TLA+ source uses `EXTENDS AnotherFile`, check the total line count of both files. If keeping them combined would make the Quint file noticeably longer than its TLA+ counterpart, present the user with a choice:

- **One file** — simpler imports for the analysis module, but potentially long.
- **Two files mirroring TLA+** — each Quint file stays close in length to its TLA+ source; base module content is duplicated (~15–20 lines) since Quint parametric modules cannot be cross-imported cleanly.

Ask the user which they prefer before writing any code. A Quint file should not be substantially longer than the TLA+ spec it translates.

## Phase 1: TLA+ intake

### Step 1.1: Identify the problem domain

Read the spec and answer in English:

1. **What is the overall purpose?** (e.g. "distributed leader election", "two-phase commit")
2. **What entities exist?** (e.g. nodes, validators, clients, coordinators)
3. **What resources are shared or contested?** (e.g. leader slot, token balances, lock ownership)

### Step 1.1b: Analyze TLA+ `EXTENDS` imports

Before translating any spec that uses `EXTENDS AnotherFile`, read `AnotherFile` and list **precisely** which operators/definitions the extending spec actually uses. This determines the Quint module structure. Example:

| Used from Paxos | How used in FastPaxos |
|---|---|
| `PaxosAccepted` | `ClassicAccepted == UNCHANGED<<cValue>> /\ PaxosAccepted` |
| `PaxosInit` | `FastInit == PaxosInit /\ cValue = none` |
| `PaxosTypeOK` | `FastTypeOK == PaxosTypeOK /\ cValue \in Values \union {none}` |
| `Ballots`, `Quorums`, `Replicas`, `Values` | shared constants, inherited |

Operators **not** used (e.g. Phase1a/1b, Phase2a, PaxosNext) can be dropped from scope. This analysis drives the module-structure decision before any code is written.

### Step 1.1c: Flag TLA+ `CHOOSE` operators

Scan the TLA+ spec for any use of `CHOOSE` (e.g. `CHOOSE x \in S : P(x)`). Quint has no direct `CHOOSE` equivalent. For **each** occurrence:

1. Quote the TLA+ expression to the user.
2. Explain what it does in context (picks an arbitrary element satisfying a predicate, defines a canonical representative, etc.).
3. Ask the user how to handle it. Common options:
   - **Nondeterministic choice** — replace with `nondet x = S.filter(e => P(e)).oneOf()` in an action (only valid in an action context).
   - **Deterministic selection** — replace with a deterministic helper (e.g. `S.filter(P).fold(...)`) if the choice is semantically irrelevant.
   - **Constant / abstract value** — introduce a `const` or `pure val` if the chosen value is fixed for a run.
4. **Do not translate any `CHOOSE` occurrence until the user has approved an approach for it.**

### Step 1.2: Analyze the variables

1. **What is local state?** Read and written only by one entity (e.g. round number, decision value). Often a map from entity to variable.
2. **What is global state?** Read and written by more entities (shared variables, message soup).
3. **What is the type of each variable?**
4. **Is there state that fits neither?** Ask the user for advice.

### Step 1.3: Analyze the actions in `Next`

1. **Init.**
2. **What are the actions that constitute `Next`?** Separate entity actions from environment actions. What are their effects on local and global state?

### Step 1.4: System-model assumptions

Fill in the spine's system-model assumptions checklist (Step 1 of `quint-modeling/SKILL.md`) from the TLA+ spec — communication, failures, time, participants. These become the `const` declarations and the `run` test that checks the translated `ASSUME` (Maintain rules above).

---

After this intake and the TLA+-specific design decisions above, follow the shared spine (Steps 1–7) in `quint-modeling/SKILL.md`. For Quint syntax, operators, and the CLI, defer to **quint-lang**.

## TLA+-specific output format

This flow's deliverables differ from the other flows in three ways:

### 1. Spec module — editor mode line

The spec module's **first line must be `// -*- mode: Bluespec; -*-`** — before any other content, including the module header comment. The spec module is the faithful TLA+ translation: same names, same structure, same properties, same conjunct order, a pure functional layer for all guards and state computation, and Choreo for any message soup. No witnesses, runs, or concrete instances live here — those go in the analysis module.

### 2. `NameAnalysis` module — appended to the same `.qnt` file

A second module written at the bottom of the same `.qnt` file (no separate file). It holds the concrete instantiation of the spec module (e.g. 3 nodes, specific constant values), happy-path runs showing how the protocol works, and the witnesses. The module name follows the pattern `<SpecName>Analysis`, e.g. `PaxosAnalysis`. Run with `--main NameAnalysis` (not the spec module name), because the analysis module holds the concrete `init` and `step`.

```quint
module PaxosAnalysis {
  import Paxos(
    Acceptor = Set(1, 2, 3),
    // ... other constants
  ).*

  // happy-path run
  run happyPathTest = { ... }

  // Witness: not in TLA+, inferred for reachability checking
  val canPhase1aSent: bool = ...
}
```

### 3. `README.md` next to the `.qnt` file

This is the spine's Step 7 handoff, in TLA+-translation form. It documents the translation and records simulation results:

- **Purpose** — one paragraph: Quint translation of which TLA+ spec, link to the TLA+ source, brief description of what the protocol does.
- **Invariants** — for each `val` invariant: its name, the TLA+ operator it translates, a one-line description. Note that invariants are taken directly from the TLA+ spec, not invented.
- **Witnesses** — table: name, what it confirms is reachable. State explicitly that witnesses are not in the TLA+ spec and were added for simulation coverage.
- **Experiments** — the executed `quint run` arguments and an output summary (the `[ok]` line, trace-length statistics, witness counts), plus a one-sentence interpretation. Record the **date** of each run. When parameters change (e.g. higher `--max-steps`), add a new dated run block rather than overwriting the old one.

## TLA+-specific pitfalls

| Pitfall | Solution |
|---|---|
| `val` is a keyword | TLA+ specs often have a `val` field; it cannot be a record field name in Quint. Use `value` instead |
| `ASSUME` → `assume` | Do not use Quint's `assume` keyword. Translate TLA+ `ASSUME` as a `run` test in the same parametric module as the `const` (see Maintain rules) |
| `msgs` / message soup → plain `Set[Message]` | Consider Choreo instead — a soup is a strong Choreo signal; raise it in design unless the protocol is single-actor/simple (see the spine) |
| TLA+ `EXTENDS` → duplicating all functions | Use `import M(...) as m` + `export m`. The extending module re-declares shared `const`s and passes them through. Functions with no `const` refs in their body are safely reusable as `m::f` |
| `type T[v] = ...` in same module as `const X: Set[T]`, instantiated with `X = Set(Constructor(v))` | Quint detects a self-referential cycle: `Constructor` is defined by `T`, defined in the module being instantiated. Fix: extract `type T[v]` to a separate shared module imported by both base and extending modules |
| `m::f` fails at runtime with "Uninitialized const" when passed as a higher-order argument *(setup-specific — verify; a plain cross-module higher-order const closure runs fine on current Quint)* | If you hit it: rewrite `f` to avoid const references — use the type structure (e.g. `x != SentinelA and x != SentinelB` rather than `Values.contains(x)`) |
| `paxos::TypeOKInvariant` (a `val`) fails at runtime with "Uninitialized const" | Quint does not propagate `const` bindings when a `val` is accessed across module boundaries, even without higher-order calls. Fix: extract the invariant body into a `pure def` taking the consts as explicit parameters, then call it from both the base `val` and the extending module (see EXTENDS section) |
| TLA+ `CHOOSE` | No direct Quint equivalent. Flag each occurrence to the user (Step 1.1c) and get an approved approach — nondet, deterministic helper, or const — before translating |
| Parenthetical insertions with em-dashes in README or Quint comments | In *generated output* (the spec, its comments, the README) — not this guideline's own prose — do not write sentences that insert a clause between em-dashes ("X — which does Y — Z"). Use separate sentences or plain parentheses instead |
