# From nothing — interactive build

The user arrives with only an idea (or an informal proposal doc) and no written spec, code, or
TLA+ to translate. Intake here is a **guided interview**: you elicit the model one layer at a
time, and the user supplies the domain knowledge. After the interview, follow the shared spine
(Steps 1–7) in `../SKILL.md` to turn the elicited model into a verified spec.

Unlike the other flows, there is no source artifact to read — so the risk is *modelling the
wrong thing*. The interview exists to surface the system's real shape before any code is
written, and to catch forks early.

## The interview

Walk these in order. Ask one focused question per layer; do not move on until the answer is
concrete. Each answer feeds a specific part of the spine.

1. **Entities & types** — "What are the core entities, and what does each remember?" Get the
   nouns (users, nodes, accounts, messages) and the data each carries. → feeds the spine's
   Step 2 state record(s).

2. **System model** — "How many participants? Can they fail? Is communication reliable/ordered?
   Is time relevant?" Fill in the spine's **system-model assumptions checklist** (Step 1). Do
   this early — it decides whether you need one actor or `NodeId -> LocalState`, a message soup,
   a fault model.

3. **Operations** — "What can happen? For each operation: who triggers it, what must be true
   first (precondition), and what changes?" → feeds the spine's Step 3 pure functions. List them
   in English first; no code yet.

4. **Properties** — "What must *always* hold? (safety) What must be *reachable*? (liveness)"
   Capture safety conditions (no negative balance, at most one leader, conservation laws) and the
   key reachable states. → feeds the spine's Step 5 witnesses and invariants.

5. **Initial state** — "How does the system start? What are the initial values?" → feeds `init`
   in the spine's Step 4 (remember to pre-populate every map).

6. **Exploration surface** — "Which operations should the simulator be free to fire, over what
   parameter ranges?" → feeds the spine's Step 6 `step`.

## Surface forks, don't bury them

The interview's main value is catching ambiguity. **If two plausible readings of an answer imply
different state shapes or different action semantics, stop and ask** — describe the fork and its
consequence, and let the user choose. Never resolve a behavior-changing ambiguity by guessing a
default. Common forks: single actor vs. N actors; synchronous vs. asynchronous; whether a failed
operation is a no-op or an error state.

## Pace and checkpoints

- Build incrementally, exactly as the spine prescribes — one type, one pure function, one action
  at a time, verifying each before the next. Do not dump a full spec from the interview.
- The type sketch (spine Step 2) is the **highest-leverage checkpoint**: present the types and
  `var` declarations, typecheck them, and get explicit approval before writing any logic.
- **Stop before tests.** When the main spec is complete and simulates cleanly, say so and review
  it with the user *before* writing any `*_test.qnt` file. Tests come after the main spec is
  agreed, not alongside it.

## Handoff

Produce the spine's Step 7 handoff as a short comment block at the top of the spec (or a brief
note): what it models, what it deliberately leaves out, and which design forks were resolved and
how. For an interactive build there is no source artifact to map back to — the "what it does NOT
cover" note is the important part, since the scope was decided in conversation and is easy to
lose.
