# Choreo Framework

Choreo is a structured framework for writing distributed protocol specs in Quint. Instead of a blank file, it gives you pre-built abstractions for message passing, state management, and Byzantine fault tolerance.

**Use Choreo when:** consensus protocols (Raft, Paxos, Tendermint, HotStuff), BFT protocols, multi-phase commit, any message-passing protocol with N processes.

## Contents

- [1. Two-File Split](#1-two-file-split)
- [2. The `choreo::cue` Pattern](#2-the-choreocue-pattern)
- [3. Testing with Cues](#3-testing-with-cues)
- [4. Witness-Based Test Discovery](#4-witness-based-test-discovery)

**Import:**
```quint
import choreo(processes = NODES) as choreo from "./choreo"
```

---

## 1. Two-File Split

Choreo specs split into two files:

```
algorithm.qnt   — pure consensus logic (no distributed state)
consensus.qnt   — distributed system: N processes, message buffer, actions
```

```quint
// algorithm.qnt — pure logic only
module algorithm {
  type LocalState = {
    currentRound: int,
    votes: Set[Vote],
    decisions: Set[Decision],
  }

  type Result = {
    output: Set[ConsensusOutput],
    post: LocalState,
  }

  pure def processInput(state: LocalState, input: Input, id: ID): Result = {
    // All business logic here — no global state access
  }
}

// consensus.qnt — distributed wrapper
module consensus {
  import algorithm.* from "./algorithm"

  type Environment = {
    processes: ID -> LocalState,
    messageBuffer: Set[Message],
  }

  const correctProcesses: Set[ID]
  const byzantineProcesses: Set[ID]

  // Actions call algorithm.* pure functions
}
```

**Why**: Pure functions in `algorithm.qnt` can be tested directly in the REPL with any state. The distributed wrapper in `consensus.qnt` handles network, faults, and nondeterminism.

---

## 2. The `choreo::cue` Pattern

The core abstraction: separates **when** (listen) from **what** (act).

```quint
choreo::cue(context, listen_operator, act_operator)
```

- `listen_operator`: returns a `Set[Params]` — the messages/events that match current state
- `act_operator`: takes one `Params` value and returns a `Transition`
- If the set is empty, no transition fires

### Example: Tendermint proposal handling

```quint
// 1. Listen: filter proposals relevant to current state
pure def listen_proposal_in_propose(ctx: LocalContext): Set[ProposeMsg] = {
  val s = ctx.state
  val proposals = ctx.messages.get_proposals()
  proposals.filter(p => and {
    s.stage == ProposeStage,
    p.valid_round == -1,
    p.src == PROPOSER.get(s.round),
  })
}

// 2. Act: produce a transition for a matching proposal
pure def broadcast_prevote_for_proposal(ctx: LocalContext, p: ProposeMsg): Transition = {
  val s = ctx.state
  val effects = if (valid(p.proposal) and s.locked_round == -1)
    Set(choreo::Broadcast(PreVote({ src: s.process_id, round: s.round, id: Some(id(p.proposal)) })))
  else
    Set(choreo::Broadcast(PreVote({ src: s.process_id, round: s.round, id: None })))
  { post_state: { ...s, stage: PreVoteStage }, effects: effects }
}

// 3. Wire together in main_listener
pure def main_listener(ctx: LocalContext): Set[Transition] =
  Set(
    choreo::cue(ctx, listen_proposal_in_propose, broadcast_prevote_for_proposal),
    choreo::cue(ctx, listen_quorum_prevotes_any, trigger_prevote_timeout),
    choreo::cue(ctx, listen_quorum_precommits_any, trigger_precommit_timeout),
    on_propose_timeout(ctx),   // non-cue transitions mix in freely
    on_prevote_timeout(ctx),
    on_precommit_timeout(ctx),
  ).flatten()
```

The `main_listener` is a protocol at-a-glance — good names make it read like the paper.

### `Transition` type

```quint
{
  post_state: LocalState,      // new local state after transition
  effects: Set[choreo::Effect] // messages to broadcast, custom effects
}
```

Built-in effects: `choreo::Broadcast(msg)`. Custom effects via `choreo::CustomEffect(...)`.

---

## 3. Testing with Cues

The cue pattern enables **controlled, non-cheating** tests. `.with_cue()` verifies the listen condition is met before executing.

```quint
module protocolTest {
  import protocol.* from "./protocol"

  // Happy path: inject a proposal, verify stage transition
  run proposalHandlingTest = {
    val proposal = { proposal: "v0", round: 0, src: "p1", valid_round: -1 }
    init
      .then("p1".with_cue(listen_proposal_in_propose, proposal).perform(broadcast_prevote_for_proposal))
      .expect(s.system.get("p1").stage == PreVoteStage)
      .then("p2".with_cue(listen_proposal_in_propose, proposal).perform(broadcast_prevote_for_proposal))
  }

  // Timeout test
  run timeoutTest = {
    init
      .then("p1".step_with(on_propose_timeout))
      .then("p2".step_with(on_propose_timeout))
      .expect(NODES.forall(n => s.system.get(n).round == 1))
  }

  // Message injection: manually add messages to the buffer
  run messageInjectionTest = {
    val msg1 = { src: "p1", round: 2, value: "v0" }
    init
      .then(
        "p3".step_with_messages(
          (ctx) => listen_prevote(ctx).filter(m => m.round == 2),
          (msgs) => msgs.setAdd(PreVote(msg1))
        )
      )
      .expect(s.system.get("p3").votes.size() == 1)
  }
}
```

### Testing operators

| Operator | Signature | Effect |
|---|---|---|
| `"node".with_cue(listen, params).perform(act)` | — | Assert listen returns params, then call act |
| `"node".step_with(listener)` | — | Execute a timeout or special listener |
| `"node".step_with_messages(listener_fn, msg_fn)` | — | Inject messages, then run listener |

### Anti-patterns

```quint
// ❌ Wrong syntax
.then("p1", with_cue(listen, params), perform(act))

// ✅ Methods chain on the string
.then("p1".with_cue(listen, params).perform(act))

// ❌ Wrong order
.then(step_with("p1", listener))

// ✅ Node comes first
.then("p1".step_with(listener))

// ❌ Messages are Sets, not arrays
val msg = s.messages.get("p1")[0]

// ✅ Use find + unwrap
val msg = s.messages.get("p1").get_votes().find(m => m.round == 0).unwrap()
```

---

## 4. Witness-Based Test Discovery

For complex actions requiring deep state setup, use witnesses to find reachable traces, then convert them to deterministic tests.

### Step 1: Add a logging custom effect

```quint
// Add to your action
choreo::CustomEffect(Log(BroadcastedPrecommit(ctx.state.process_id, params)))

// Handle it
def apply_custom_effect(env: GlobalContext, effect: CustomEffects): GlobalContext =
  match effect {
    | Log(logType) => { ...env, extensions: { ...env.extensions, log: logType } }
    | _ => env
  }
```

### Step 2: Write a witness

```quint
val canBroadcastPrecommit: bool =
  match choreo::s.extensions.log {
    | BroadcastedPrecommit(_) => false
    | _ => true
  }
```

### Step 3: Find a counterexample

```bash
# Here we want the actual PATH, so use the negated-invariant form (not --witnesses):
# canBroadcastPrecommit is written not(target); a reported violation is a trace reaching it.
quint run spec.qnt --main myProtocol --invariant canBroadcastPrecommit \
  --max-steps 50 --init init_displayer
```

If still satisfied, increase `--max-steps` until violated. Then minimize:

```bash
# Minimize: decrease until you can't find violation
quint run spec.qnt --main myProtocol --invariant canBroadcastPrecommit --max-steps 19
```

### Step 4: Convert counterexample to a `run`

Read the trace's `log` field. Each log entry maps to a `with_cue().perform()` call:

```
Log: BroadcastedPrecommit("p1", { round: 2, value: "v0" })
→ "p1".with_cue(listen_precommit, { round: 2, value: "v0" }).perform(broadcast_precommit)
```

```quint
run canBroadcastPrecommitTest =
  init
    .then("p1".with_cue(listen_proposal_in_propose, v0_proposal).perform(broadcast_prevote_for_proposal))
    .then("p2".with_cue(listen_proposal_in_propose, v0_proposal).perform(broadcast_prevote_for_proposal))
    .then("p1".with_cue(listen_quorum_prevotes, v0_proposal).perform(broadcast_precommit))
```

### Step 5: Clean up

Remove all `Log(...)` effects, the `log` field from `Extensions`, and the `apply_custom_effect` instrumentation. Keep only the tests.
