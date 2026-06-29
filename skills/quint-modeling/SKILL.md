---
name: quint-modeling
description: >
  Build a Quint model of a system, protocol, or algorithm. Use this whenever the user wants to
  model, spec out, formally describe, model-check, or verify a system in Quint — e.g. "model this
  protocol in Quint", "spec out this design", "translate this TLA+", "formally check this Rust
  code" — even if they never say the word "specification." When the goal is to verify or
  model-check a design or implementation and no Quint model exists yet, writing the model is the
  required first step, so start here. It generates the spec from whatever the user has — an idea
  developed interactively, natural-language or functional requirements, source code (Rust, Go,
  TypeScript, etc.), or an existing TLA+ specification — and walks the modelling flow (state,
  actions, invariants), adapting to the source type. Also use this to **review or audit an
  existing Quint spec** — "review my .qnt", "audit this spec before I ship it", "is this model
  any good" — it carries the structural + runtime review checklist. Do NOT use this for
  implementing code against a spec that already exists (that's quint-execute-spec) or for pure
  Quint syntax/CLI/debugging questions (quint-lang). For Quint language syntax and the CLI, see the
  quint-lang reference.
---

# Quint Modelling

Produce a Quint specification from whatever the user starts with. This skill owns the
**shared modelling discipline** (below) and **routes** to a flow-specific guideline for the
intake — the part that turns a particular kind of input into the understanding the shared
steps build on.

For language syntax, operators, the CLI, and `basicSpells`, defer to the **quint-lang**
reference. This skill is about *how to model*, not Quint syntax.

---

## Pick the flow

Identify what the user is starting from, then read the matching guideline. The guideline
handles **intake** — extracting the system's state, operations, and assumptions from that
source. After intake, everyone converges on the **Shared modelling spine** below.

| Starting point | Flow | Guideline |
|---|---|---|
| Only an idea / informal proposal, built interactively with the user | **from nothing** | `guidelines/from-nothing.md` |
| A written requirements / functional-spec document | **from requirements** | `guidelines/from-requirements.md` |
| Source code (Rust, Go, TypeScript, …) | **from code** | `guidelines/from-code.md` |
| An existing TLA+ specification | **from TLA+** | `guidelines/from-tlaplus.md` |
| A **finished `.qnt` spec to audit**, not build | **review** | `guidelines/review.md` |

The first four are **build** flows: intake → the Shared modelling spine below. The **review**
flow is different — there is no new model to produce; you audit an existing spec against a
checklist and report findings. It does not use the spine; read `guidelines/review.md` and follow
it directly.

If the starting point is ambiguous (e.g. "a design doc with some pseudocode"), ask the user
which source is authoritative before picking — the intake differs materially.

---

## Shared modelling spine

Every flow lands here. Intake (flow-specific) produces an **understanding** of the system:
its entities, the operations they perform, the state each operation reads and writes, and the
system-model assumptions (communication, failures, time, participants). The spine turns that
understanding into a verified Quint spec.

Two principles hold throughout:

- **Executable from the first line.** Quint specs run immediately — you validate design
  decisions as you make them, not at the end. Never build more than one step without
  verifying the previous one: `quint typecheck`, **then `quint run`**. Typecheck is not
  enough — a spec can typecheck and still fail to *execute*, which defeats the whole point of
  an executable spec. The trap to watch for: a **`const` not given a value** typechecks but
  cannot run — `quint run` fails with `Uninitialized const`. To make the spec runnable,
  **instantiate the const in a concrete instance module** —
  `module spec_3 { import spec(C = Set(1,2,3)).* }` — and run *that* module. (`assume` documents a
  premise; it does not supply a value — see Step 1 and quint-lang's `guidelines/simulations.md`.)
  After each addition, actually run it — if you can't `quint run` the module, it isn't done.
  **Use `quint run` only — never `quint verify`.** This holds for the whole skill: building,
  iterating, reviewing, sanity-checking invariants — every step uses sampled `quint run`, not once
  `quint verify`, not even as a final pass. `verify` is exhaustive bounded model checking
  (Apalache): far slower (minutes to hours) and not part of the modeling workflow. It is a
  *model-checking* tool, documented in quint-lang (`guidelines/cli.md`, `guidelines/simulations.md`)
  — reach for it **only when the user explicitly asks to model-check** the spec, never on your own.
- **What, not how.** Model observable state transitions and their effects. Abstract away
  implementation detail (serialization, memory management, retry plumbing). If a detail
  doesn't affect an invariant you care about, it doesn't belong in the spec.

#### Reference examples

Two complete, runnable specs are bundled in `examples/`, one for each of the **two ways
components coordinate** — by **passing messages** or by **sharing state**. Almost any system maps
onto one of them; pick by *that* question, not by domain label, and read the closer match as a
worked instance of the spine patterns (Step 2 state-shaping, Step 4 guarded actions, Step 5
witnesses + invariants) — to see how the pieces compose into a whole spec. (They are canonical
shapes to learn from, not the only valid ones.)

| Example | Coordinates by… | Read it when modelling… |
|---|---|---|
| `examples/tendermint/` | **message passing** (`choreo::` broadcast/send; real BFT consensus) | **any distributed protocol where parties exchange messages** — consensus, BFT, replication, atomic commit, leader election, reliable broadcast/gossip, request/response, a mempool. This is the **default** reference for distributed systems. Shows: grouped `Id -> LocalState` (Step 2), guarded transitions (Step 4), `choreo::cue` listen/act split, safety invariants (`agreement`/`validity`) + an accountability/liveness angle + a counterexample demo (Step 5), `const`-instantiation, and test separation. Its banner has a "quick read" path so you needn't read all ~760 lines. See also Step 2's "When to use Choreo" and `../quint-lang/guidelines/choreo.md`. |
| `examples/ewd426.qnt` | **shared state** (no messages) | systems whose parts coordinate through **common state** rather than messages — mutexes/locks, token rings, shared registers, self-stabilization, anything where a process reads its neighbours/the environment directly. Shows: grouped-map state (Step 2), guarded `step` (Step 4), `const`-instantiation, and `temporal` **liveness** properties (Step 5). |

If a system has both (e.g. message-passing nodes that also touch a shared ledger), start from
**tendermint** (the message-passing structure dominates) and add shared state as its own `var`,
per Step 2. Plain message *soup* (`Set[Msg]`) without the Choreo framework isn't a separate file —
Choreo's broadcast is soup underneath, so `tendermint/` is also the reference for that shape (read
the state decls + a guarded transition; the `choreo::` wrapper is the only added layer).

### Step 1 — Separate concerns

Partition the understanding into three layers. Keeping them apart is what makes a spec
testable; mixing them is the most common source of untestable specs.

- **State machine** — variables, initialization, transitions → `var`, `init`, actions
- **Functional logic** — pure computations: guards, quorum checks, state updates → `pure def`
- **Properties** — what must always hold, what must be reachable, what must *eventually* happen →
  `val` invariants + witnesses, plus `temporal` properties for liveness (Step 5; quint-lang has the detail)

Also pin down the **system-model assumptions** — they shape every invariant built on top.
Encode them as **`const` declarations**. To actually *check* an assumption (e.g. a quorum
condition like `2 * f < n`), write a **`run` test** that asserts it — the `assume` keyword
*documents* a premise but is not enforced, so don't rely on it as a check (see quint-lang's
`## Assume` for why and the `run`-test pattern). Each flow's intake fills this in from its own
source (interview, requirements doc, code, or TLA+); the checklist is the same regardless:

| Concern | Questions to answer |
|---|---|
| **Communication** | **How do the actors communicate — messages or shared state? If messages: reliable or lossy? ordered or unordered? broadcast or point-to-point?** (The other shaping question — answer it right after actors; it picks the message medium in Step 2 and, with the actor count, settles the Choreo decision.) |
| **Failures** | Crash-stop? Crash-recovery? Byzantine? What fraction `f` of `n`? |
| **Time** | Synchronous? Asynchronous? Partial synchrony? Are timeouts modelled? |
| **Actors / Participants** | **Who are the actors and roles, and what local state does each hold?** (This is the most concrete intake question — answer it first; it feeds Step 2's `Id -> LocalState` shaping directly.) Fixed membership or dynamic? How many processes? |

If an assumption is wrong, every property built on it is wrong — surface them before building.

### Step 2 — Shape the state

**Start from the two questions you answered in Step 1 — *who the actors are* and *how they
communicate*. Together they drive every structural decision this step makes.** They are not just
background; they pick the shape, the message medium, and the framework:

- **How many actors → the state shape.** One actor → a single `var s: Record`. N actors of the
  same kind → one `Id -> LocalState` map (the record describes *one* actor; see "Scaling to N"
  below). Distinct roles → either a field on `LocalState` (e.g. `role: Coordinator | Participant`)
  or separate maps. Get the actor count/roles right and the shape falls out.
- **How actors communicate → the message medium.** Messages → a separate `var` for the medium,
  *not* crammed into `LocalState`: unordered `Set[Message]` soup (the default), or `... ->
  List[Message]` ordered per-pair queues only when delivery order is load-bearing. No messages,
  coordination through common state → shared memory (no medium var; see `examples/ewd426.qnt`).
  This is the "Communication shapes" choice detailed just below.
- **Actors + communication → Choreo or not.** Multiple actors coordinating by **exchanging
  messages** → default to Choreo (see "Default to Choreo" below). A single actor, or actors
  coordinating through **shared state** → plain Quint. So answer "who, how many, and how do they
  talk?" first, and all three decisions below are mostly settled before you write a type.

**Group cohesive state into a record** and let the functional layer operate on that record — this is
the recommended shape, because most of the time the variables that describe one entity *are*
cohesive, and grouping keeps the functional layer clean and the invariants readable. Keeping
variables flat is the deliberate exception, not a co-equal default:

- **Group into a record when** the fields are the local state of one entity (a node's phase + log +
  vote), are always passed together, or an invariant relates several of them. This is the usual case.
- **Keep flat (separate `var`s) only when** the variables are genuinely independent concerns that
  change on their own, or the spec is small enough that grouping adds no clarity. (Some canonical
  examples, e.g. `ewd840`, keep per-field maps flat because the fields don't form an obvious unit.)

**The cohesive case — one unit:**

```quint
type State = {
  phase:    str,
  balances: NodeId -> int,
  members:  Set[NodeId],
}

var state: State
```

The `apply…` pure functions take and return `State`; actions assign the next-state record directly
(`state' = applyTransfer(state, …)`). No per-field reassembly.

**Scaling to N instances** — when there are N actors, the record describes **one** actor's
local state, and the variable becomes a map keyed by actor id. The pure functions are
**unchanged** — they still operate on a single `LocalState`; only the wiring around them
changes:

```quint
type NodeId = int
type LocalState = { phase: str, balance: int, voted: bool }

var nodes:    NodeId -> LocalState   // per-actor cohesive state
var messages: Set[Message]           // genuinely global concern → its OWN var, not inside LocalState
```

| | One instance | N instances |
|---|---|---|
| state var | `var state: State` | `var nodes: NodeId -> LocalState` |
| pure fns | `can…(State, …): bool` + `apply…(State, …): State` | `can…(LocalState, …): bool` + `apply…(LocalState, …): LocalState` — same shape |
| action read | reads `state` | `nodes.get(id)` |
| action write | `state' = applyOp(state, …)` | `nodes' = nodes.set(id, applyOp(nodes.get(id), …))` |
| `init` | one record literal | `NODES.mapBy(_ => <record>)` |

The guideline, stated once: **group cohesive state into a record (one var for one unit, an
`Id -> LocalState` map for N), and keep genuinely independent concerns — the message soup, a shared
registry — as their own separate vars**, never crammed into the per-instance record. Reach for flat
per-field vars only when the fields don't cohere into a unit.

**Communication shapes** (decide alongside the state shape):
- **Message soup** — `var network: Set[Message]`, processes receive any in-flight message. The
  default for asynchronous protocols; use it unless ordering genuinely matters.
- **Shared memory** — no message medium; processes read/write common state directly. See the
  bundled **`examples/ewd426.qnt`** (a token ring where each node reads its neighbours).
- **Ordered per-pair queues** — `... -> List[Message]` with head/tail ops. Use **only when
  delivery order is semantically required** (e.g. logical-clock causality); it is more expensive
  to model-check than soup. The corpus spec `LamportMutex` is the canonical example — prefer
  soup unless you can name why ordering is load-bearing.

#### Default to Choreo for distributed protocols

For **any distributed, message-passing protocol with N processes** (consensus, BFT, replication,
multi-phase commit, broadcast/gossip, leader election), **default to the Choreo framework** — and
make a deliberate, justified decision if you are *not* going to. This isn't a stylistic toss-up:
Choreo's listen → react structure and its clean split between local-state updates and network
effects (the `choreo::cue` pattern) actively push you toward a better-organized, more reviewable
spec than a hand-rolled `NodeId -> LocalState` + message-soup `step`. The default expectation is
Choreo; plain Quint for a message-passing protocol is the thing that needs a reason.

**The one legitimate reason to decline:** on a *small* protocol, Choreo's scaffolding (the type
boilerplate — `LocalContext`/`Transition`/effects — and framework wiring) can add more ceremony
than the spec's structure is worth, making it materially more verbose for little gain. That's a
real judgment call — but it is the **only** routine exception, and even then lean toward Choreo.
Two structural cases also fall outside Choreo: a **single actor** (no inter-process messaging to
choreograph) and **shared-memory coordination** (no message medium at all → plain Quint, see
`examples/ewd426.qnt`).

Not a reason: *"still exploring the design."* You can explore *in* Choreo, and switching frameworks
later is expensive — so don't defer the decision on those grounds.

**This is a structural fork — decide it before writing logic.** If you intend to go plain Quint for
a protocol that would otherwise be a Choreo candidate, **say so to the user, name the
verbosity/benefit tradeoff, and get agreement** (fold this into the type-sketch sign-off below).

When Choreo fits, the per-process state still follows the grouping rule above — Choreo just
supplies the messaging and handler scaffolding around it. See
`../quint-lang/guidelines/choreo.md` for the framework's API and patterns, and
**`examples/tendermint/`** for a complete, runnable Choreo spec — real BFT consensus
demonstrating the `choreo::cue` listen/act split, `agreement`/`validity`/`accountability`
invariants, and `with_cue`-based tests in a separate `tendermintTest.qnt` (run via
`--main=valid`).

Decide grouping (and Choreo-or-not) with the user and **get explicit approval on the type
sketch before writing any logic** (Step 3). Typecheck the types + `var` declarations first;
this is the highest-leverage review point — a wrong shape is expensive to unwind later.

### Step 3 — Write the functional logic (pure functions)

Implement each operation's logic as `pure def`s — they take the state record and arguments and
return plain values, so you can exercise them in the REPL with hand-built states. Split the two
distinct questions a transition answers:

- **Can it happen?** — a `pure def … : bool` guard (the precondition).
- **What's the resulting state?** — a `pure def … : State` that computes the next state, *assuming*
  the guard holds.

```quint
pure def canTransfer(s: State, from: NodeId, recipient: NodeId, amount: int): bool =
  amount > 0 and from != recipient and s.balances.get(from) >= amount

pure def applyTransfer(s: State, from: NodeId, recipient: NodeId, amount: int): State =
  { ...s, balances: s.balances.setBy(from, b => b - amount)
                              .setBy(recipient, b => b + amount) }
```

Write signatures first (stub the bodies), typecheck, then fill in one function at a time and
exercise each in the REPL with a hand-built state before moving on. If the output surprises
you, the function has a bug — fix it before wiring it into the state machine.

> Keep the guard separate from the update because they are separate facts about the operation: one
> says *when* it is allowed, the other says *what it does*. The action (Step 4) uses the guard to
> decide whether it fires at all. A single `pure def` returning `{ success, newState }` — handing
> back the unchanged state when the guard fails — fuses the two and pushes the action toward a no-op
> branch; prefer the split. (If a *failed* operation is itself something the system observes and
> reacts to, model that failure as its own guarded action, not as a fallback.)

### Step 4 — Wire the state machine (guarded actions)

An action puts the guard and the update together in one `all { ... }`: the guard gates whether the
action fires, the update sets the next state. When the guard is false the action is **disabled** —
it does not fire and does not change anything. No `success` flag, no no-op branch.

```quint
action init: bool = all {
  state' = { phase: "idle",
             balances: NODES.mapBy(_ => INITIAL_BALANCE),   // pre-populate every map
             members: NODES },
}

action transferAction(from: NodeId, recipient: NodeId, amount: int): bool = all {
  canTransfer(state, from, recipient, amount),          // guard — disables the action when false
  state' = applyTransfer(state, from, recipient, amount),
}
```

A disabled action is the faithful model of "this cannot happen in this state." Resist adding a
blanket `else` / `unchanged_all` fallback to keep things moving — that puts a transition in the
model that the real system can't take, which is a modeling inaccuracy regardless of what you do
with the spec afterward.

An action and a `pure def` cannot share a name. Pre-populate every map in `init` — `.get()` on an
absent key is undefined behavior. See quint-lang for the full list of such gotchas.

### Step 5 — Properties: witnesses first, then invariants

**Witnesses first.** A witness names a target state and asks whether it is *reachable* — write the
predicate **positively** (the state you hope to reach) and pass it to `quint run --witnesses`, which
reports **how many sampled traces reached it**. Add one per major action: a witness reached in 0
traces means the action is dead (its precondition can never hold), so fix that before spending
effort on safety.

```quint
// the state you want to be reachable — written plainly, no negation
val someBalanceChanged: bool =
  state.members.exists(n => state.balances.get(n) != INITIAL_BALANCE)
```

```
quint run spec.qnt --witnesses someBalanceChanged --max-steps 10
  → someBalanceChanged was witnessed in 90 trace(s) out of 100 explored (90.00%)
```

A non-zero count means the state is reachable; **0% means it never happened** — investigate.

There is a second, complementary form: write the *negation* as an invariant — `val w = not(target)`
— so a reported "violation" is an execution that *reaches* the state. It can't batch with the other
invariants and you read a "violation" as success, but it gives you something `--witnesses` cannot: an
**actual trace** that reaches the state. Pick by what you need — `--witnesses` for the routine
reachability + coverage check, the negated-invariant form when you want to *see the path* (to
understand or document how the state is reached, or to debug a witness that fires unexpectedly).

**Then invariants** — the safety properties that must hold in every reachable state:

```quint
val noNegativeBalances: bool =
  state.members.forall(n => state.balances.get(n) >= 0)
```

Invariants and witnesses run together in one pass: `quint run --invariant noNegativeBalances
--witnesses someBalanceChanged`.

When a source yields *many* candidate properties and you need to prioritize verification effort,
the from-requirements flow describes a High/Medium/Low impact-scoring aid (`guidelines/from-requirements.md`);
it applies wherever you're modelling against stated requirements.

(Witness vs invariant interpretation, fairness, and temporal properties are detailed in quint-lang's
`guidelines/simulations.md`. `someBalanceChanged` is *state* evidence — phrase such a target so only
an action can make it true, since a predicate that already holds at `init` is "reached" at step 0 and
witnesses nothing. To confirm a *specific* action fired when several could reach the same state, use a
per-action flag `var` — quint-lang's `guidelines/patterns.md` §7 covers it and how to debug a witness
that never fires.)

### Step 6 — Compose `step` and simulate

Compose the actions in `any { ... }` and stress the model with random walks.

```quint
action step: bool = {
  nondet from = NODES.oneOf()
  nondet dst  = NODES.oneOf()   // `dst`, not `to` (a built-in) — see quint-lang
  any {
    transferAction(from, dst, 10),
    // other actions…
  }
}
```

- Check **witnesses** with `quint run --witnesses` — expect a non-zero trace count (reachable);
  0% means a dead action.
- Check **invariants** with `quint run` (sampled) — expect no violation; read counterexample
  traces step by step when one appears. Use `quint run` for this, not `quint verify` (see the
  "Executable from the first line" principle — `verify` is only for when the user explicitly asks
  to model-check).

#### A guarded model can reach a state where nothing is enabled

Because actions are guarded (Step 4), the model can reach a state with **no enabled action**. The
trap during a build: **`quint run` does not detect deadlocks** — it stops early and prints `[ok] No
violation found` with a trace shorter than `--max-steps`. A short trace is the only hint, and the
run reads as success, so watch trace length when you expect the protocol to keep going. (For the
record, `quint verify` reports a deadlock outright — `Found a deadlock` — but that's a
model-checking step, only in play if the user explicitly asks for it; don't switch to `verify` just
to chase a suspected deadlock mid-build — inspect the short trace with `quint run` instead.)

Whether reaching such a state is correct depends on the system: one that should keep serving must
never get stuck, while one that genuinely finishes (everyone committed, nothing left to do) is
*supposed* to end in a terminal state. The tool can't tell these apart — only you know which you
intended. (This is the other reason Step 4 avoids the no-op fallback: a blanket `unchanged_all`
lets every trace extend forever, so the model can never reach — or reveal — such a state.)

**A note on bounding.** `--max-steps` (how deep a run explores) is not a modeling decision — it's
always there. Whether the *model itself* has a bounded state space is: some protocols are
**terminating by construction** (a one-shot commit reaches a final state and stops), and modeling
them that way is correct — reaching a terminal state is the design, not a deadlock. You may also
bound an otherwise-unbounded model deliberately to shrink the state space, but never with a no-op
escape hatch (Step 4) — bound it by modeling the real terminal states, not by a fake step.

Tests (`run` definitions) go in a **separate `*_test.qnt` file** that imports the spec — keep
the main module free of test scenarios. Build incrementally: typecheck after every addition,
simulate after every action.

### Step 7 — Self-review, then hand off the spec

Before writing the handoff record, do a quick pass over your own spec against the same bar a
reviewer would apply — catching these now is cheaper than having them bounce back. Most you've
already followed while building; this is the closing check that they all hold together:

- **Guarded actions** — no business logic in an action beyond the guard and assignments; it lives
  in `pure def`s, and the guard is lifted into the action so it's disabled when it can't fire (Step 4).
- **Witness per major action** — every action in `step` has a witness, and each one is reached in
  > 0 traces under `quint run --witnesses`, not dead at 0 traces (Step 5).
- **At least one protocol-level invariant** — a real safety property (no two leaders, conservation,
  agreement), not just a type/bounds check; and every invariant references a `var`.
- **`init` assigns every `var`** and every action assigns every `var` (a missing `x' = x` is a
  silent stutter bug); every map is pre-populated (Step 4).
- **Right abstraction** — IDs are opaque (no string manipulation), messages are a `Set` unless
  ordering is the property, no serialization/retry/memory detail leaked in.

If a spec is large or being handed to someone else, run the full audit in `guidelines/review.md`
(the C1–C6 / R1–R2 checklist with a report) — reach for it when a self-pass isn't enough.

A finished spec needs a short record so the next reader knows its scope and can trust it.
Produce one (as a comment block, a `README.md`, or whatever the flow prefers) covering:

- **What it covers** — which modules/protocols are modelled, which assumptions (`const`
  declarations, with `run`-test checks for the ones that must hold) are encoded, which
  properties are verified.
- **What it does NOT cover** — implementation detail left out on purpose, edge cases excluded
  (and why), properties still to add. This honesty note is what stops the spec from being
  over-trusted.
- **When to update it** — for a spec that grounds an artifact (code, a TLA+ source), update
  the spec and re-verify *before* changing the artifact.

**The spec is the ground truth. Never edit the spec to match broken code.** If the spec is
wrong, stop and discuss with the user — that is the highest-leverage review point.

Each flow adds its own format detail (source-file correspondence for code, a translation
README with recorded `quint run` output for TLA+, a comment block for an interactive build).

---

## Conventions

- `NodeId` / `LocalState` for per-actor state, and `NODES` for the participant set (the `Set[NodeId]`
  the model ranges over); descriptive type names after the protocol (`VoteRequest`, `PrepareMsg`) not
  `Msg1`, `Msg2`.
- Small domains: `N = 3` actors (or `N = 2` for first exploration) and value ranges like
  `0..10` are enough for most safety properties and keep simulation cheap. Use **symbolic IDs**
  (`int` or `str`) for participants.
- Message soup: store sent messages in one `Set` and don't model delivery order unless
  ordering is what you're verifying.
- Abstract time: when the protocol has a notion of time or progress, model it as an integer
  **round/epoch counter** (`round: int`), not wall-clock time or timer mechanics — a timeout is
  just the round advancing. Exception: model timing explicitly only when the timing bound
  itself is what you're verifying.
- Start with **one action**: get `init` + one action + one witness working before adding the
  rest. For N actors, model **one actor first, verify, then generalize** to the map — never
  wire up all N at once.
- Test pure functions in **isolation** in the REPL with hand-built states; that catches logic
  bugs before they get tangled into the state machine.

For everything syntactic — operators, undefined-behavior rules, `basicSpells`, the CLI flags —
consult the **quint-lang** reference rather than reproducing it here.
