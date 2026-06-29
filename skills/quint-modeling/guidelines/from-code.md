# From code — intake for generating a Quint spec from source

This is the **code-intake flow**: extract a system's structure from source code (Rust, Go,
TypeScript, …). It carries only the code-specific intake; **after intake, follow the shared
spine (Steps 1–7) in `../SKILL.md`.**

## Contents

- **Why a spec from code** — the spec as a persistent grounding artifact
- **Phase 0: Research (compact)** — catalog the codebase before deep reading
- **Phase 1: Understand the code** — Steps 1.1–1.4 (domain, operations, state vars, system model)
- **The source-construct → Quint mapping** — the construct translation table
- **Set scope and abstraction level** — modules in/out, atomic granularity, details to hide (confirm with the user)
- **After intake** — hand off to the shared spine
- **Handoff** — spine Step 7 plus a source-file correspondence map

## Why a spec from code

**The spec is a persistent grounding artifact, not throwaway output** — the machine-checked source
of truth for what the system *is supposed to do*, used to verify every future change against. Code
stays primary: the spec *verifies* code, it does not generate it. A 50–200 line model captures what
1000 lines of code can't, and reviewing at the spec stage — then re-verifying it whenever the code
changes — is the highest-leverage check you get.

## Phase 0: Research (compact)

Before reading code in detail, catalog the codebase to keep the main context window lean
(target: under 400 lines of catalog). Skip this for simple single-file cases with a clear
entry point and no concurrency.

> Explore `[path]`. Find and catalog:
> 1. The top-level entry points and their signatures
> 2. The state-carrying data structures (structs, maps, enums)
> 3. The concurrency primitives (mutexes, channels, goroutines, async tasks)
> 4. The message types and their payload shapes
> 5. Any existing tests that reveal expected behavior
>
> Output a compact summary — file paths, key types, key operations. Do not read every file.
> Prioritize what is most relevant to concurrent/distributed behavior.

If the catalog missed something critical, do a targeted follow-up read — do not re-read the
whole codebase from scratch.

## Phase 1: Understand the code

Using the research output, answer in English.

### Step 1.1 — Identify the problem domain

1. **Overall purpose?** (e.g. "distributed leader election", "token transfer protocol")
2. **What entities exist?** (nodes, validators, clients, coordinators)
3. **What resources are shared or contested?** (leader slot, token balances, lock ownership)

### Step 1.2 — Catalog operations and their purpose

| Operation | Purpose | State it reads | State it writes | Concurrency notes |
|---|---|---|---|---|
| `functionName` | What it does | Which vars | Which vars | Atomic? Per-node? |

**Focus on:** public API / entry points, state-modifying operations, message send/receive
points, timeout/timer triggers.

**Skip:** side-effect-free getters, logging, metrics, serialization, retry plumbing (unless
retry is what you're verifying).

### Step 1.3 — Identify state variables

| Variable | Type | Purpose | Scope |
|---|---|---|---|
| `varName` | int / enum / record | What it tracks | Global / per-node |

**Look for:** state-machine enums, per-node bookkeeping, shared global state, message buffers.

### Step 1.4 — Extract system-model assumptions

Read these off the code — concurrency primitives reveal the time model, error/recovery paths
reveal the failure model, transport reveals communication. **Fill in the spine's system-model
assumptions checklist (Step 1)** from what the code shows.

## The source-construct → Quint mapping

This is the heart of code intake: translate each language construct into its Quint counterpart.

| Source | Quint |
|---|---|
| State enum | Sum type `\| State1 \| State2`, or `str` constant |
| Struct / record | `type T = { field1: Type1, field2: Type2 }` |
| `Vec<T>` / array | `List[T]` |
| `HashSet<T>` | `Set[T]` |
| `HashMap<K, V>` | `K -> V` (map type) |
| Thread / process | Element of `NODES`; per-actor `NodeId -> LocalState` |
| Atomic CAS | Guarded action (atomicity is implicit) |
| Message queue | `Set[Message]` — message soup, no ordering unless ordering is what you verify |

**Sum types use named constructors**, not inline tagged records:

```quint
type Message =
  | VoteRequest({ term: int, candidateId: int })
  | VoteResponse({ term: int, voterId: int, granted: bool })
```

## Set scope and abstraction level — propose, then confirm

You now understand what the code does. **Before** handing off to the spine, pin down three
decisions that the code itself cannot answer — they depend on *what you intend to verify*, and
getting them wrong is expensive to unwind once types and logic exist. Code is the flow where this
matters most: a codebase offers far more detail than a spec should reproduce.

First, **infer** as much as you can from what the user already told you — the request usually
states (or strongly implies) the target property, which modules matter, and how faithful the
model must be. Don't re-ask what's already answered. Draft the three decisions from that, then
**present them as a proposal and ask the user to confirm the parts you inferred** — especially
anything you had to guess. This is the same propose-then-approve gate as the spine's type sketch,
just one step earlier.

**1. Scope — which modules/components.** From the Phase 0 catalog, decide which modules/files are
*in* the spec and which are out, and what an out-of-scope component is replaced by (an abstract
map, an assumption). "Model the consensus core in `raft.rs`/`log.rs`; treat storage as an abstract
`Key -> Value` map; exclude the gRPC transport." Model what the target invariants depend on; leave
the rest out. **Only stop to confirm scope with the user when the boundary is genuinely
ambiguous** — if the request already makes it clear (names the component, the property, the entry
point), just state your inferred scope in one line and move on. Don't turn an obvious boundary into
a question.

**2. Granularity — how many implementation steps become one atomic transition.** Real code does
one logical operation in many small steps (lock → read → check → mutate → unlock → ack). In the
model, decide the **atomic grain**: which sequences collapse into a single action.
- **Fuse into one atomic action** when the intermediate states are not observable to other actors,
  or cannot interleave in a way that affects an invariant you care about.
- **Keep the steps separate** when the concurrent interleaving *between* sub-steps is exactly what
  you are verifying — a check-then-act race (TOCTOU), a partial-write window, a torn read.

  This is the choice that most determines whether the spec can *find* a concurrency bug versus
  silently *assume it away*, so make it deliberately and state it. (Atomicity is implicit in
  Quint — an action either fires whole or not at all — so fusing is the default; splitting is the
  decision that costs you nothing in syntax but buys interleaving coverage.) For **distributed
  protocols specifically, lean toward splitting at message boundaries** — a process's local update
  and another process observing its message are not simultaneous, so fusing them assumes away the
  interleavings where most real bugs live. (This is also what Choreo structures for you.)

**3. Implementation details — which mechanism to hide.** Source code is full of plumbing a spec
should *assume away*, not reproduce. For each concern the code surfaces, state model-it vs.
hide-it and why:

| Detail in the code | Default in the spec | Model it only when… |
|---|---|---|
| Locks / mutexes / atomics | hide — steps are atomic (see decision 2) | lock-acquisition order is the property |
| Serialization / wire format | hide — pass structured values | a (de)serialization bug is the target |
| Retry / backoff / timeout plumbing | hide — model the outcome (success/failure) | retry semantics are the property |
| **Bounded channels / queues** | hide — unbounded `Set[Msg]` message soup, delivery is an action firing | back-pressure / blocking-on-full / capacity is the property |
| Network transport (sockets, framing) | hide — message soup; no delivery order | loss or ordering is what you verify |
| Error-propagation boilerplate | hide — a failed op is a guarded action that doesn't fire; *but if the error value itself is observable state you assert on (revert reason, error code), return it from a `pure def` as `{error, state}` instead* | error handling itself is the property |
| Concrete data structures (ring buffers, trees) | hide — `List` / `Set` / `Map` | the structure's own invariant is the target |
| Identifiers (node/request/txn IDs) | abstract — a small symbolic set (`NodeId = int`, opaque) | identity arithmetic/ordering is the property |
| Unbounded counters / sequence numbers | abstract — a small capped int or round counter | the bound itself is the property |

The governing rule is the spine's "what, not how": if a detail doesn't affect an invariant you
care about, it doesn't belong in the spec. These choices become the `const` declarations and
system-model assumptions the spine's Step 1 will encode — you are deciding them here as one
coherent set, with the user's sign-off, rather than discovering them ad hoc while writing.

## After intake

With scope, granularity, and abstraction level agreed, hand the understanding (entities, the
operations table, the state variables, the filled-in assumptions checklist) to the **shared spine,
Steps 1–7** in `../SKILL.md`. The spine shapes the state, writes the pure functions, wires thin
actions, proposes witnesses-then-invariants, composes `step`, and simulates. Do not duplicate that
work here.

## Handoff (spine Step 7, with a code-specific addition)

Follow the spine's Step 7 handoff (covers / does NOT cover / when to update / ground truth),
and add a **source-file correspondence map** so each module is traceable back to the code it
grounds. When those files change, update the spec first and re-verify before touching the code.

```
Raft.qnt       ↔   src/consensus/raft.rs, src/consensus/log.rs
Membership.qnt ↔   src/cluster/membership.go
```

To implement changes against this spec, use the `quint-execute-spec` skill.
