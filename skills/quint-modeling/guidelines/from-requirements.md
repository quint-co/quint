# From requirements — written specification

The user has a written requirements or functional-spec document (prose, user stories, a design
doc) and wants it modelled in Quint. Intake here is **reading and structuring**: you extract the
model from the document rather than interviewing for it. After intake, follow the shared spine
(Steps 1–7) in `../SKILL.md`.

This is the non-interactive sibling of `from-nothing`: the same target understanding (entities,
operations, properties, system model), but sourced from a document instead of a conversation.
The interaction is *targeted* — you ask the user only where the document is silent or ambiguous
on something that changes the spec.

## Extract from the document

Read the document and produce, in English, the same understanding the spine builds on:

1. **Entities & state** — what the system tracks and what each entity remembers. → spine Step 2.
2. **System model** — fill the spine's **assumptions checklist** (Step 1): participants, failure
   model, communication, time. Requirements docs frequently leave these *implicit* — list what
   the document states explicitly and flag what it omits (see below).
3. **Operations** — every operation the document describes, with its precondition and effect.
   → spine Step 3 pure functions.
4. **Properties** — the document's stated guarantees become invariants; "the system can reach X"
   statements become witnesses. → spine Step 5. When the document yields **many** candidate
   properties, score each by how directly it validates what the user asked for, so verification
   effort goes to what matters first:
   - **High** — directly validates the requested change / the document's core guarantee.
   - **Medium** — validates a supporting path or edge condition.
   - **Low** — a broad safety check not specific to this request.

   Give each a one-line rationale citing the requirement it comes from. This is a triage aid for
   ordering work and presenting results — not a Quint construct; skip it when there are only a
   couple of obvious properties.

A table is often the cleanest intake artifact:

| Requirement (quote/§) | Entity / operation / property | Maps to |
|---|---|---|
| "a transfer must not overdraw" | invariant: no negative balance | spine Step 5 |
| "any node may propose" | operation `propose(node)` | spine Step 3 |

Linking each modelling decision back to a line in the document keeps the spec traceable and makes
the handoff's "what it covers" trivial to write.

## Resolve gaps before modelling, not by guessing

Requirements docs are written for humans and routinely omit what a formal model must pin down —
exact failure semantics, ordering, what happens on a precondition violation, how many
participants. **Where the document is silent on something that changes state shape or action
semantics, ask one targeted question** rather than inventing a default. Record the answer (and
that it was a gap) so the handoff can note it. Where the document is silent on something
*immaterial* to any property you care about, omit it — that's the "what, not how" rule from the
spine.

## Set scope and granularity (confirm before modelling)

A requirements doc usually describes more than one spec should cover, and states *what* happens
without fixing the *grain* at which to model it. Before the spine, settle two choices — infer them
from the doc and the user's ask, then confirm the parts you inferred (same targeted-question
discipline as the gaps above):

- **Scope — which requirements are in.** Docs carry future phases, explicitly out-of-scope
  sections, and features irrelevant to the property you're after. State which requirements this
  spec models and which it leaves out, tied to what's being verified. Decide this **now**, before
  writing types — the spec you build should be shaped by the scope, not have a scope justified
  after the fact. (The handoff later just records what you agreed here.)
- **Granularity — the atomic grain of each operation.** A requirement like "a customer confirms a
  booking" may be one atomic action, or may decompose into steps (reserve → pay → confirm) whose
  *interleaving* matters. Model an operation as a single action when its intermediate states can't
  be observed or interleaved in a way that affects an invariant; split it into separate actions
  when concurrent interleaving between the steps is part of what you're checking. The doc rarely
  states this — it is a modelling decision, so make it deliberately.

## Then follow the spine

With the understanding extracted, proceed through the spine: separate concerns, shape the state,
write pure functions, wire thin actions, add witnesses then invariants, compose `step`, simulate.
Build incrementally and get approval on the type sketch (spine Step 2) before writing logic.

## Handoff

The spine's Step 7 handoff, with a requirements-specific addition: a **coverage map** linking each
modelled operation/property back to the requirement it came from, and the **scope you agreed
up front** — the requirements left out (and why) — recorded as the "what it does NOT cover" list.
The gaps you had to ask about belong in that same assumptions note.
