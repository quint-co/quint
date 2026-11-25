# lean/

Quint specifications as [Veil](https://veil.dev) modules in Lean 4, for model checking and proofs.

`quint_module "spec.qnt"` reads a spec and elaborates it into the Lean file that asks for it: its types
become Lean types, its pure definitions Lean definitions, its state variables and actions a Veil module.
From there, Veil's explicit-state model checker runs the spec, its SMT backend proves invariants
inductive for every instance, and Lean proves whatever is left by hand.

Commands: the `Makefile` header.

## Using it

```lean
import Quint

quint_module "two_phase_commit.qnt" (main := two_phase_commit_3)

#model_check {} {}

end two_phase_commit_3
```

The command leaves the Veil module open, so `#model_check`, `#check_invariants` and any Veil command
follow it, and `end <module>` closes it. The module takes the name of the Quint module.

`quint verify --backend veil` does all of this from the command line: it installs Lean, Veil and this
library on first use, through the elan on PATH or else one it installs, and model checks the spec with
`(declared := false)`. Its `--temporal` properties go to `#temporal_check`, which
checks them in a run of its own. An `--inductive-invariant` is proved by Veil's SMT backend instead, in
the encoding of `(smt := true)`, in the phases that the Apalache backend checks it in.

The definitions that are named by `--state-constraints` are passed as `(stateConstraints := […])` to both
checks. A state in which a state constraint fails is neither counted, checked against the invariants, nor
explored, as in Quint's own model checker. For example, `n` in `quint/testFixture/veil/counter.qnt` grows without
bound, and the constraint `n < 5` leaves the 5 states in which `n` is 0 to 4. The state in which `n` is 5
is reached, but it is not counted.

A temporal property means what it means in TLA+, as TLC checks it: a behavior may stutter at any step, so
a property that needs progress fails without fairness, with a lasso that ends in the state it stutters
in. Fairness is TLA+'s too: `weakFair(A, v)` is about the steps of `A` that change `v`, which the module
gets as an action of their own, `A ∧ v' ≠ v`.

`#model_check compiled`, Veil's fast checker, builds a native binary and needs Lean's module system: the
file starts with `module` and imports with `public import Quint`. The interpreted checker runs the
search in Lean's interpreter and doesn't require that setup.

### Proving a module's definitions once

```lean
quint_library "library.qnt" (main := clamp)

theorem clamp.read_under (LIMIT x : Int) (h : x ≤ LIMIT) : clamp.read LIMIT x = .Under x := by
  simp [clamp.read, h]
```

`quint_library` declares the types of one Quint module and its definitions that read no state, in a
namespace named after it, each taking the constants of the module it reads first: `clamp.read LIMIT x`. A
later `quint_module` can reuse those declarations in the same file or in a file that imports it. Reuse
works through any instance when the type and value match. A theorem about `clamp.read` therefore applies
to every spec that reuses the declaration. If the type or value differs, `quint_module` warns and declares
its own definition.

| Option | What it does |
| --- | --- |
| `(main := M)` | The main module of the spec, as `quint compile --main` takes it |
| `(init := i)`, `(step := s)` | The initial and step actions, when they are not `init` and `step` |
| `(invariants := [a, b])` | Definitions to state as Veil invariants, besides those that the compiled spec names and those declared `invariant`. A name that is not a definition of the main module is refused. |
| `(temporalProps := [p, q])` | Temporal properties to state as Veil `temporal` declarations, which `#temporal_check` checks |
| `(stateConstraints := [c, d])` | Definitions of the main module to state as Veil state constraints, which `#model_check` and `#temporal_check` restrict their search to. The option is refused with `(smt := true)`. |
| `(out := "Module.lean")` | Write the generated module to this file, to read or to debug |
| `(variables := "vars.json")` | Write each state variable's name in an ITF trace, the id of its declaration and its field, as `quint verify --backend veil` reads a counterexample back |
| `(code := true)` | Log each generated declaration to the Lean info view |
| `(declared := false)` | State only the invariants the compiled spec names, not every definition declared `invariant` |
| `(smt := true)` | Store every value as the scalars that SMT reasons about (see "The SMT encoding"), which a proof needs |
| `(initEquations := true)` | With `(smt := true)`, state the initializer's assignments as equations, so that a counterexample at the initializer shows the state that the initializer reaches |

The path is taken relative to the Lean file. A `.json` file is read as the output of
`quint compile --target json --flatten=false`; a `.qnt` file is compiled that way by running `quint`,
which the `QUINT_BIN` environment variable names (`lean/Makefile` sets it to the `quint` that
`quint/` builds).

### Proving that an invariant holds

`holds% p` is the statement that the invariant `p` of the open module holds in every reachable state,
for every value of the module's parameters. `quint verify --backend veil --proofs <file> --invariants p`
checks that the theorem `p_holds` of the file proves `holds% p` on Lean's standard axioms alone.
With `--trust-smt`, it also counts a proof that rests on answers of the SMT solver that Lean's kernel
didn't check, which Veil gives unless the file sets `veil.smt.trust` to false. A `sorry` that is written in
a file of the proof still doesn't count.
The file names `p` in `(invariants := [...])` of its `quint_module`, and the check refuses an invariant
that the file does not name. An invariant that the spec declares with the `invariant` qualifier is
named as well, unless the file sets `(declared := false)`. `quint_module` states a named invariant as a
proposition. For example, `holds% p` then reads `∀ i, i ∈ Server → …`, whichever invariants a check proves.
By default, a proof goes over the steps of the module, as the next section shows. `holds_by_invariants`
proves `holds% p` from Veil's own goals instead, which the SMT solver closes. It goes by induction over the
conjunction of the module's invariants, as in `Tests/TwoPhaseCommitProof.lean`:

```lean
set_option veil.smt.trust false

quint_module "two_phase_commit.qnt" (main := two_phase_commit) (smt := true)
  (invariants := [consistency, stageDomain, votesSubset, votesSent, sentNotWorking, commitMsg,
    abortMsg, commitHasAllVotes, committedNeedsMsg, abortedPrepared])

#gen_theorems

theorem consistency_holds : holds% consistency := by holds_by_invariants

end two_phase_commit
```

The invariants of `(invariants := [...])` strengthen `p` when `p` is not inductive on its own. The
tactic needs a theorem for each pair of a procedure and an invariant, where the procedure is the
initializer or an action. The theorem states that the procedure keeps the invariant when all the
invariants hold. `#gen_theorems` declares the theorems that Veil's SMT backend proves, and
`prove_veil_invariant_goal <action> <invariant> using wp by ...` declares one that is proved by hand,
as does `using tr`. When a theorem is missing, the tactic fails and names that theorem.

### Proving an invariant over the module's steps

`#gen_steps`, after `quint_module` or `veil module M`, declares the steps of the module as plain Lean. A
proof of an invariant goes over them by default:

- `Step th s s'` has one constructor for each action. The constructor's explicit arguments are the
  values that the action chooses with `nondet`, then the facts that its guard states. Its index is the
  state after the step, which is written as a record of the fields of `s`.
- `Initial th s` has one constructor, whose index is the record that the initializer gives.
- `reachable_induction` proves a property of every reachable state from a proof that every `Initial`
  state has it and that every `Step` keeps it.

For example, the action `enter` of `quint/testFixture/veil/semaphore.qnt` gets the following constructor:

```lean
Step.enter (x : String) : x ∈ procs → s.free = true →
  Step th s { critical := Quint.Set.union s.critical (Quint.Set.ofList [x]), free := false }
```

`Step` is the transition relation of the module, since its constructors are read off Veil's own
transition of each action. An action that takes the record returned by a pure function, as `take(f(state, i))`
does, gets a constructor whose guard is `¬ f … = none`. Three tactics open the step of that action:

- `open_take` turns that guard into `hx : f … = some x` in a case of `Step`.
- `open_step f` turns `hx` into the guard `hc` of `f` and the record that `f` returns, for an `f` that
  guards with `if`.
- `open_some f` does the same for an `f` without a guard.

`Tests/TwoPhaseCommitSteps.lean` proves
`consistency` of two-phase commit over its steps. It states the invariants as one structure about one
state, and `grind` closes the initializer and every step without an SMT solver.

`#gen_steps` also works in the SMT encoding, where `Step` takes the instances of the module's sorts as
instance-implicit arguments. `veil_smt` does not close a goal of `#gen_steps`
yet, so a proof that uses the SMT solver goes through `holds_by_invariants`.

`quint verify` loads the spec of a proof file once for each spec and each set of `quint_module`
options. The `quint_module` command is built by Lake into a Lean module of its own. The module is named
by a digest of the compiled spec, the options and the sources of the Quint library. It is kept under
`Quint/Cache` in the workspace until the Quint library changes. The checked copy of the proof file imports the module and
re-opens the spec's module with `veil module M` in place of `quint_module`. For example, the first check
of the proofs of a Raft spec took 105 seconds of wall time. A second check imported the module and took
6 seconds. An option that the proof file sets before `quint_module` applies to the proofs,
but not to the loading of the spec.

A proof may span several files. The proof file imports the other Lean files of its folder by their
module names: `import Bridge` imports `Bridge.lean`, and `import Groups.Leaders` imports
`Groups/Leaders.lean`. Those files may import one another. Each of them that loads the spec loads it
with the same `quint_module` options as the proof file. A file that loads no spec holds lemmas of its
own, or it re-opens the module with `veil module M` when it imports a file that loads the spec. Each
file is built by Lake as a Lean module under `Quint/Cache`, and it is built again only when it, or a
file that it imports, changed. An error in a file is reported in full, at that file's
own path and line. A check fails when any file of the proof has an error, even when every theorem that
the check reads is proved, since the proof is not finished. Lean's other messages about the files of the
proof, such as the output of `#check`, are reported as well.

The reference `skills/quint-verification/references/lean-proofs.md` of the `quint-verification` skill
says how a proof is laid out so that it stays short. It also lists the calls of `grind` that close
lemmas, and the facts of the embedding that a proof runs into.

`veil module M` can re-open the module in any file that imports the file of a `quint_module`, since
`quint_module` records its module in Veil's registry of modules, which is saved in the `.olean`. The
verification conditions of a module live only in the process that elaborated it. For that reason,
`veil module M` generates them again for `#gen_theorems` and `#check_invariants`. In a file of Lean's
module system, the pure definitions of the spec are exposed, so that a proof in an importing file can
unfold them.

### Proving a temporal property

`holds_temporal% p` is the statement that every behavior of the open module satisfies the temporal property
`p`, for every value of the module's parameters. A behavior starts in an initial state and takes a step of
the module at each position. One of the module's actions changes nothing, so a behavior may stutter, as in
TLA+. `quint verify --backend veil --proofs <file> --temporal p` checks that the theorem `p_holds` of the file
proves `holds_temporal% p` on Lean's standard axioms alone. The file names `p` in `(temporalProps := [...])`
of its `quint_module`. It names exactly the properties that the check proves, since they decide the actions
of the module.

The proof itself is Veil's `prove_temporal_by [p]`, in the proof mode of Lentil, and it may assume the
module's invariants. `holds_by_temporal_proof` then proves `holds_temporal% p` from it, and from the theorem
`q_holds : holds% q` of each invariant `q` of the module. For example, `quint/testFixture/veil/fairness_proofs.lean`
proves that `done` eventually holds when `step` is weakly fair:

```lean
open Lentil Quint.Liveness

quint_module "fairness.qnt" (temporalProps := [stepFairDone])

prove_temporal_by [stepFairDone]
  tintro hwf
  tapply eventually_of_leads_to_not
  tclear hInit
  trevert hNext hInv hwf ; trewrite [← Lentil.and_imp, ← Lentil.and_imp]
  tapply (wf1_inv (σ := σ) (inv := veil_term% Invariants))
  tsplit_ands
  · tmonotone ; unveil_temporal ; grind
  · tapply or_and_implies
    tsplit_ands
    all_goals tmonotone ; unveil_temporal ; grind
  · tmonotone ; unveil_temporal ; grind

theorem stepFairDone_holds : holds_temporal% stepFairDone := by holds_by_temporal_proof

end fairness
```

`Quint.Liveness` has the rules that a temporal proof needs besides Lentil's:

- `wf1_inv` is the WF1 rule for fairness in the form that the embedding states it. That form is
  `◇□ E → □◇ D` over the actions of the `⟨A⟩_v` steps of `A`'s alternatives, and each obligation of the
  rule may assume an invariant before and after its step.
- `or_and_implies` splits an obligation about a step of one of several actions into one obligation for each
  action. `unveil_temporal` turns an obligation into first-order goals over the state's fields only for a
  step of one action.
- `leads_to_by_rank` proves `P ↝ Q` from a rank that every step out of `P` lowers until `Q` holds.
- `eventually_of_leads_to_not` proves `◇ q` from `¬ q ↝ q`.

`Tests/TemporalProofs.lean` proves `liveness` of `ewd840`, Dijkstra's termination detection on a ring,
for every number of nodes. The rank that the proof lowers is a definition of the spec.

## How state is represented

Without `(smt := true)`, the state is held in the Lean values that the spec runs on. A set is a
`Std.ExtTreeSet`, a map a `Std.ExtTreeMap`, a list a `List` and `str` a `String`. A record or a sum is a
Lean `structure` or `inductive`. These are model checked, and their verification conditions go to Lean
when SMT cannot take them. Two kinds of type take a shape of their own:

- **Options.** A sum type `Some(t) | None`, as basicSpells' `Option`, is Lean's `Option t`, so a
  definition over `Option[a]` is declared once, and basicSpells' `unwrap` and `findFirst` are
  `Option.get!` and `List.find?`, so Lean's lemmas about those apply. `Option.get!` of `none` is the
  default value, where Quint stops with an error.
- **Generic types.** A record or sum over a type variable of a definition the embedding declares, as
  `swap(p: Pair[a])`, makes the records or sums with its labels one Lean type with a parameter per
  field, named after the spec's alias: every `{ fst: int, snd: int }` is `Pair Int Int`, and `swap` is
  declared once, over `Pair a a`. Every other record or sum is a type of its own for its shape, named
  after an alias of that shape.

## The SMT encoding

`(smt := true)` stores every value of the spec as the scalars that SMT reasons about, as Apalache encodes
TLA+. The encoding is used to prove invariants, and `quint verify --backend veil --inductive-invariant`
uses it.

- A record or a tuple is stored as one component per field.
- A sum is stored as a tag and the components of each variant's payload.
- A set is stored as a relation over the components of its elements, one per variant for a set of a sum.
- A map is stored as a relation that holds of its keys, and as a function per component of its value.
- A map's value at a key that the map lacks is unspecified, as it is in Apalache, meaning any value of the
  map's value type. A proof holds whatever value the map gives at that key. The value is free where `Map`,
  `setToMap` or `mapBy` builds the map, and where `set` or `setBy` updates a key that the map lacks. An
  update of another key keeps the value, as Apalache's arrays do.
- `str` is an uninterpreted sort, and each string literal is a constant of it. The constants are distinct.
- An enumeration, and the tag of a sum, is a Veil `enum`: a sort whose values its labels name, which
  `#updr` takes. Two enumerations with a label in common stay Lean `inductive`s, since a Veil `enum` opens
  its labels as constants of the module.

For example, `Map(1 -> 9).get(2) == 9` is not proved, and neither is `m.get(2) == 0` after
`m' = Set(1).mapBy(k => 0)`. Meanwhile, `m.get(k) == m.get(k)` is proved for any key.

For example, a lock spec with a map `stage` and a sum `lock` gets these components:

| Variable | Quint type | Components |
| --- | --- | --- |
| `stage` | `str -> { at: Stage, visits: int }` | `stage_keys : str → Bool`, `stage_at : str → Stage`, `stage_visits : str → Int` |
| `lock` | `Free \| HeldBy(str)` | `lock_tag`, of the labels of `Lock`, and `lock_HeldBy : str` |

An expression is translated where it is used. A definition is inlined, and a quantifier, a `size` or a
`map` over a set whose elements are known is expanded over them. A literal set and a range with constant
bounds have known elements. No Lean value reaches SMT, since lean-smt translates no structure
projection, no string literal and no container.

`#quint_check_induction` runs Veil's checks of the invariants, as `#check_invariants` does, and reports
them on one line, which `quint verify` reads. A counterexample's states are written there as Quint
values. A map keyed by integers is shown at the integers that the solver's model names.
`(initEquations := true)` lets a counterexample at the initializer show the state that the initializer
reaches, which the solver's model has only when the assignments are equations. A solver decides those
equations less often.

`#model_check` runs on the encoding when `str` and every declared type are given a finite type, and no
component is indexed by integers. For example, to check the SMT encoding of two-phase commit, pass
`{ str := Fin 7 }` and `{ participants := fun _ => true }` to `#model_check`. A spec with a string literal
also needs a value for each constant of `str`, such as `{ str_a := 0, str_b := 1 }`. The search may count
one Quint state twice, because a payload that an earlier variant left behind stays in its component. A
`nondet` over a set of integers cannot be run. `quint verify` model checks the Lean values of
`Quint.Embed` instead.

## What the embedding is

- `Quint/IR.lean` decodes the JSON that `quint compile --target json --flatten=false` prints. It
  mirrors `quint/src/ir/quintIr.ts`, as `evaluator/src/ir.rs` does for the Rust evaluator.
- `Quint/Resolve.lean` makes one module of the main module and the definitions it reaches through
  Quint's lookup table, each named as the spec writes it: an instance `as I` gets state variables of its
  own, `I::x`, the definitions that read them, and its constants the values it gives them. A definition of
  another module that reads no state is declared once, `M::f`, taking the constants it reads first, so
  what holds of it holds in every instance of `M`.
- `Quint/Builtins.lean` gives each Quint builtin a Lean definition. A set is a `Std.ExtTreeSet` and a
  map a `Std.ExtTreeMap`, both extensional and both executable. This file is the semantics: what a spec
  means in Lean is what these definitions say.
- `Quint/Embed.lean` translates the spec: one Lean declaration per Quint declaration, and one
  Veil action per branch of the step action, named after the user actions the branch runs through, so
  Veil reports a verification condition per way the system can step. When two alternatives of `step`
  run through the same user actions, each name starts with the name of its alternative, as in
  `Issue_take_assignAll`. A definition polymorphic in the
  fields of a record or the variants of a sum, such as `def setA(r) = r.with("a", 1)`, has no Lean
  declaration: it is inlined at each use, at the record or sum type of that use.
- `Quint/Smt.lean` translates the spec in the SMT encoding, and `Quint/Induction.lean` is
  `#quint_check_induction`, which reads a counterexample's states back from the solver's model.
- `Quint/Temporal.lean` states the temporal properties the spec names as Veil `temporal` declarations,
  and gives the module an action that changes nothing, so that a behavior may stutter at any step, as in
  TLA+.
- `Quint/Library.lean` records the types `quint_library` declares, and tells whether a definition a
  module would declare is the one a library declared.
- `Quint/Command.lean` is the `quint_module` and `quint_library` commands: their options, compiling the
  spec with `quint`, and the declarations of `Embed.lean` and `Temporal.lean`.

What is trusted is the Quint parser and typechecker, which produce the IR, the opcode-to-definition map
in `Embed.lean`, and Veil and Lean's kernel below it.

## Regression tests

Run `make -C lean test` to check the embedding against the specs we already maintain in `examples/`.
The tests rerun even if only a Quint spec has changed. Lake still caches the library and its dependencies.

| Test in `Tests/` | What it checks |
| --- | --- |
| `TicTacToe.lean` | Veil explores all 871 reachable states and finds no invariant violation. The moves exercise action calls with arguments and dependent choices. |
| `TwoPhaseCommitProof.lean` | Lean reconstructs the SMT proofs of safety for any set of participants. |
| `TwoPhaseCommitSteps.lean` | Lean proves the same safety property over the generated steps without an SMT solver. |
| `TemporalProofs.lean` | Lean proves termination detection for any ring size in `ewd840.qnt`. |
| `ConflictingMap.lean` | The SMT embedding rejects a map literal with different values for the same key. The dedicated Quint fixture isolates this rejection. |

Start with an existing spec when adding a test. Add a fixture only when it isolates a behavior that
the existing specs don't exercise.

The local branch `gabriela/veil-lean-full-suite` preserves the full suite.
It includes the slower `#updr` demo and the focused SMT operator checks. To run the full suite separately:

```sh
git worktree add ../quint-lean-full-suite gabriela/veil-lean-full-suite
cd ../quint-lean-full-suite
npm --prefix quint ci
make -C lean test
```

## Limits

- Without `(smt := true)`, lean-smt translates no list, map or string literal, and it leaves a record's
  fields uninterpreted. A verification condition that reads one of those comes back undischarged, or
  with a counterexample that no state of the spec has.
  Use `prove_veil_invariant_goal <action> <invariant> using wp by ...` to discharge the condition in Lean.
- Without `(smt := true)`, Quint's partial operators are total. `get` on a missing key, `head` of an empty
  list and an index out of range give `default` rather than failing. A proof may then be about a case that
  Quint rejects at run time.
- Of temporal properties, a formula about steps (`orKeep`, `mustChange`, `next`, a primed assignment, an
  action) is refused, except as the action of fairness and `enabled`, and fairness is translated only as
  an assumption, on the left of `implies`: Veil's model checker has no atom that relates a step's two
  states, so fairness reads an action the module gets for it (`Quint/Temporal.lean` says why this is
  exact). Fairness and `enabled` are of `step` or an action it offers, without arguments. A quantifier in
  a temporal property ranges over a set that depends on neither the state nor a constant.
- SMT supports lists in state, including concatenation and indexed updates. A read needs a certified live index. The certificate can come from a branch comparison or from quantification over `indices()`.
- In the SMT encoding, a counterexample to induction may be a state where a map lacks a key that every
  reachable state has, because a read there gives an unspecified value. A candidate that states the
  map's keys rules that state out, as `stages.keys() == participants` does. `quint verify` adds the
  invariant that states a map's keys when it can infer them from `init` and the steps, and it proves that
  invariant with the rest.
- A key definition is a definition of the main module whose body is only an equation `m.keys() == s`, over
  a set `s` that doesn't read the state. When a read's key is in `s`, and no condition around the read puts
  it in `m`, the check states the key definition with the invariant that holds the read. Then it proves
  the two together.
- For example, `two_phase_commit.qnt` reads `stages.get(p)` for each `p` in `participants`, and its key
  definition `stageDomain` states `stages.keys() == participants`. A check of `consistency` alone states
  `stageDomain` with it.
- The SMT encoding refuses these:
  - general list folds and unchecked symbolic list indices;
  - a set of sets or of maps;
  - a map keyed by a sum with payloads;
  - the `size` of a set whose elements are not known;
  - a division or a remainder by a value that isn't known to be nonzero;
  - `getOnlyElement`, or `fold` and `chooseSome` when the embedding cannot establish finite support;
  - an operator off a short list of total ones, such as `keys` or `match`, inside the operator of a
    `fold` or a `mapBy`;
  - a value bound outside a `fold` that the operator of the `fold` reads.
- `run` definitions are not translated.
- Outside Lean's module system, Veil unfolds the comparator of a set or map of strings in the state past
  its heartbeat limit. Start the file with `module` to avoid this.
