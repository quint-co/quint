# Review — auditing an existing Quint spec

This is the **review flow**: the input is a *finished* `.qnt` spec and the job is to audit it, not
build it. There is no new model to produce — the deliverable is a **report** of pass / warn / fail
findings plus fixes. You reach it two ways: directly ("review/audit this spec", a collaborator's or
your own), or as the deeper pass Step 7 escalates to when a quick self-review isn't enough. Either
way the procedure below is the same.

Review does not introduce a new rulebook. **It checks a finished spec against the same discipline
this skill teaches for building one** (the spine, Steps 1–7, and the Conventions). So the
structural pass below is mostly "did the spec follow the rules already stated above?" — this file
points back to them rather than restating them. The genuinely review-only part is the **runtime
checks** (you have to *run* the spec) and the **report format**.

For language/operator questions that come up while reviewing, defer to **quint-lang** as usual.

## Preparation

1. Read the spec. Catalogue: `var` declarations, `pure def`s, `action`s, `val` invariants and
   witnesses, `temporal` properties, `assume` axioms.
2. For the runtime checks, drive the spec: `quint -r <spec_path>::<ModuleName>` then run `init`,
   or use `quint run`.
3. Run **all** checks, record **pass / warn / fail** for each, print the report only at the end.

## Structural checks — does the spec follow the build discipline?

Each row is a rule from the spine; the spec passes if it followed it, warns/fails if not. Re-read
the referenced step if you need the rationale — don't reinvent it here.

| Check | Rule (where it's taught) | Fail / warn when |
|---|---|---|
| **Guarded actions** | Step 4 — logic in `pure def`s, guard lifted into the action | an action carries business logic beyond the guard + assignments, or uses a no-op fallback instead of being disabled |
| **Enums over strings** | Conventions — sum types / typed constants for roles & phases | raw string literals like `"leader"`, `"propose"` in state or guards |
| **Record grouping** | Step 2 — group cohesive state into a record | several `var`s describe one entity but aren't grouped |
| **Witnesses present & per-action** | Step 5 — one witness per major action, checked with `--witnesses` (reached in > 0 traces) | no witnesses, or a major `step` action has none, or a witness reaches 0 traces (dead) |
| **Right abstraction** | "What, not how" + Conventions — opaque IDs, message soup | string manipulation, messages in an ordered `List` (when order isn't the property), serialization/retry/memory detail |
| **Non-trivial invariants** | Step 5 — at least one real protocol property | every invariant is a type/bounds check, or an invariant references no `var` (a tautology) |

Anything that **fails** here is a correctness or value problem; a **warn** is a judgement call to
raise with the user.

## Runtime checks — these need you to *run* the spec (review-only)

- **C-init — `init` assigns every `var`.** Run `init`; every declared `var` must be assigned.
  - Fail: `init` returns `false` / errors (quote it), or a `var` is unassigned.
- **C-step — every `var` updated in every action.** A missing `var' = ...` is a silent stutter
  bug. Warn per gap: "Did you mean `<var>' = <var>`?"
- **C-step-complete — a `step` using `any { ... }` exists and includes all major actions.**
  Warn if missing, or if an action exists but isn't in `step`.
- **R1 — invariants hold at `init`.** Evaluate each invariant after `init`.
  - Fail: invariant `<name>` is `false` at init — either `init` is wrong or the invariant is too
    strong.
- **R2 — no counterexample after each action.** Fire each action reachable from init, re-check all
  invariants.
  - Fail: invariant `<name>` violated after `<action>` — show the state at violation.

> R1/R2 are bounded checks driven from `init`, not a proof. A *violation* is conclusive (the spec
> does break the property); the *absence* of one across what you ran is **not** — report it as "no
> counterexample observed in the runs executed," never "the invariant holds." Stay with `quint
> run` for the review — do **not** reach for `quint verify`; exhaustive model checking is a separate
> activity, only when the user explicitly asks for it (see quint-lang's `guidelines/simulations.md`
> and `guidelines/cli.md`). See `guidelines/simulations.md` for the full result-language discipline.

## Report format

Print after all checks complete:

```
── Spec review: <filename> ──────────────────────────────────

Structural (vs the build discipline)
  thin actions                  [✓ / ⚠ list actions with logic]
  enums over strings            [✓ / ⚠ list raw string literals]
  record grouping               [✓ / ⚠ list ungrouped vars]
  witnesses present & per-action[✓ / ✗ none / ⚠ uncovered or dead]
  right abstraction             [✓ / ⚠ describe what leaked]
  non-trivial invariants        [✓ / ✗ all structural / ⚠ tautologies]

Runtime
  init assigns all vars         [✓ / ✗ error]
  var assignment per action     [✓ / ⚠ list gaps]
  step exists & complete        [✓ / ⚠ missing or incomplete]
  invariants hold at init       [✓ / ✗ list violations]
  no counterexample after acts  [✓ / ✗ <action> broke <invariant>]

── Top issues ─────────────────────────────────────────────
  1. <most important finding + concrete fix>
  2. <second>
  3. <third>

── Suggested next steps ───────────────────────────────────
  1. Fix the fails above
  2. Stress-test flagged scenarios with `quint run` / the REPL
  3. `quint run --invariant <name>` to sample (offer `quint verify` only if the user wants
     exhaustive model checking — it is not part of the review itself)
```

## After the report

Fix any **fail** immediately without asking — those are correctness problems. For **warn**
items, present the list and ask which to address (offer "All" and "None — leave as-is"); address
only what the user selects.
