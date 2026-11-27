# lean/

Quint in Lean 4 through Veil (see `README.md`). Commands: the `lean/Makefile` header.

- The toolchain comes from `nix develop .#lean`, whose elan is nixpkgs': on NixOS only that elan
  patches the Lean it fetches, and has `lake` link through Nix's `cc`, so compiled checkers run.
  Outside it, `make -C lean build` needs an `elan` on PATH. Nothing else in the repo depends on this
  module.
- `quint_module` shells out to `quint compile --target json --flatten=false` and reads its **stdout**
  through a temporary file. `--out` writes a different document, and Node truncates a pipe at 64 KiB, so
  neither works in its place.
- Without flattening, `quint compile` adds `q::init` and `q::step` only for an explicit `--init` and
  `--step`, which `Command.load` always passes, and leaves type aliases in the inferred types, which
  `Resolve` replaces by the types they name.
- Veil picks how to store a state field from the head symbol of its type, so `Embed.tyTerm` emits
  `Std.ExtTreeSet` and `Std.ExtTreeMap` rather than the `Quint.Set` and `Quint.Map` abbreviations.
  An abbreviation sends the elaborator into a non-terminating fallback.
- Veil elaborates every mutable field's type again at each statement of an action (`elabStateFieldView`
  in Veil's `Context.lean`), and a default argument of that type stays a pending tactic each time, which
  every later statement carries: with `Std.ExtTreeMap`'s `cmp := by exact compare`, two map fields took
  one action past 6 GB at seven statements. `Embed.tyTerm` writes the comparator out, which keeps each
  statement's cost flat. Outside Lean's module system, Veil unfolds `compare` while reading the field
  types with `Meta.reduceAll`. This exceeds the heartbeat limit for string keys. Start examples whose
  state holds strings in sets or maps with `module`.
- Veil reads the state again at each statement of an action, and a definition that reads the state is
  a ghost function that reads it where it is called, so a call after an assignment would see the state
  after the step. `Branch.assignmentsLast` puts a branch's assignments after its choices and guards,
  ordered so that one whose right-hand side reads a variable, directly or through a definition
  (`Ctx.defReads`), comes before that variable's own; a cycle through a definition is refused.
- `Embed.actionBody` conjoins consecutive `require`s, and `Embed.inlineCall` puts an action's arguments
  in place of its parameters rather than binding them. Both keep an action's statements few, since Veil
  elaborates the type of every field again at each statement. `Embed.actionBody` binds a pre-state local
  only for a variable a branch reads after assigning it.
- `Smt.everyIndex` writes `E0`, not `E__`, since Veil reads a variable on the left of an assignment as
  universally quantified only when every character is an uppercase letter or a digit.
- A Veil relation over a datatype with arguments fails SMT translation (`cannot translate Type`), which is
  why `Smt.layout` splits a set of a sum into one relation per variant.
- The solver does not unfold a Lean definition, so a variant reached through the definition Quint
  generates for it (`Committed`) is written as its constructor; otherwise SMT treats `Committed` and
  `Working` as possibly equal constants and returns spurious counterexamples.
- Veil's model checker tells states apart by a relation only when it can enumerate the relation's
  domain: over a type without `Veil.Enumeration` it explored one state where two were reachable, and
  missed a violation. `Embed.declareSum` derives it for an enumeration kept as a Lean `inductive`.
- Veil's handler for `deriving Std.TransOrd, Std.LawfulEqOrd` fails on a type with one constructor of
  one field ("No Sigma-typed hypothesis found to destruct"), so `Embed.emitOrdLawsOfField` states both for
  a one-field record or a one-variant sum through Veil's own `by_equiv`.
- Lean structures cannot be polymorphic in a row, so a definition whose type has a row variable is never
  declared: `Embed.instanceTerm` inlines it at each use, with `Ctx.tySubst` putting that use's types in
  place of its variables wherever `typeOf` reads one.
- Whether a record is a generic type depends on the rest of the spec (`Embed.genericLabels`): adding a
  definition over `Pair[a]` turns every `{ fst: int, snd: int }` from a structure of its own into
  `Pair Int Int`, which renames what a hand-written proof refers to.
- `temporal` is a token once Veil is loaded, and a keyword of Quint: it cannot name a field, a
  `quint_module` option (hence `temporalProps`) or a Quint module.
- Veil's `#temporal_check` stutters only at dead ends, so `Temporal.emitTemporal` adds an action that
  changes nothing, as Veil's own TLA+ ports do. Its `⟨a⟩` is decided by a step's label, so fairness reads
  an action of its own, `A ∧ v' ≠ v` (`Embed.emitActions`), exact only as an assumption. No atom relates a
  step's two states, so a formula about steps is refused.
- Such an action's guard comes before its assignments and reads their right-hand sides, so it adds one
  statement and no local of the state before the step.
- `#temporal_check` writes a lasso's states by `ToJson`, not the `Display` a safety trace uses, so the
  records and sums `Embed` generates have a `ToJson` in the shape of their `Display`;
  `quint/src/veilItf.ts` reads both.
- Veil's `#updr` reads a field's type by name and refuses a hygienic `Bool✝`, so `Embed.tyTerm` and
  `Smt.sortOf` write `Bool` and `Int` as plain identifiers rather than through a quotation.
- `Smt.veilEnums` declares enumerations as Veil `enum`s, since `#updr` refuses an enumeration that is a
  Lean `inductive` (`IC3: function … has unsupported result type`). A Veil `enum`'s values reach the
  solver's model as indices of a finite sort, which `Induction.readStates` maps back to labels through
  Veil's `parseEnumAssignmentsFromModel`.
- Inside a quotation, the braces of Veil's `enum T = {a, b}` parse as a structure instance, so
  `Smt.emitModule` builds that command from text.
- lean-smt declares a structure projection as an uninterpreted function, and it fails on a string
  literal (`incorrect number of universe levels Array`) and on `Std.ExtTreeMap`. A record that was held
  in a function gave spurious counterexamples because of the first. That is why `Quint.Smt` scalarizes
  every value.
- `mkIntLit` writes `(0 : Int)`, since a numeral with no type in a Veil assignment fails SMT translation
  with `cannot translate Type`.
- `action`, `theory`, `pick`, `distinct` and `type` are tokens once Veil is loaded, and no Lean variable
  or field of `Quint/*.lean` takes those names. `Steps.declareRel` builds Lean's `InductiveType` and
  `Constructor` positionally, since their field `type` cannot be named. `_root_.List.range` is written
  inside `namespace Quint`, since `List.range` is `Quint.List.range` of `Builtins` there.
- `Steps.quint_norm_step` unfolds Veil's field representation by name (`FieldRepresentation.get`,
  `CanonicalField.set`, `IteratedArrow.curry` and the others it lists), and `#gen_steps` reads each
  constructor of `Step` off the result. After a Veil update, a constructor that still reads
  `FieldRepresentation.get` means that one of those definitions changed.
- Veil compiles invariants and actions. Without a `Decidable` instance, as for a quantifier over `Int`, it
  leaves an invariant uncompiled; with `open Classical` it compiles the classical one and fails as
  noncomputable. `Smt.toBool` writes a plain `decide`.
- The model of a counterexample at the initializer has the state before the initializer, since the
  initializer's verification condition is its weakest precondition. `(initEquations := true)` puts the
  state that the initializer reaches in the model. cvc5 answers `unknown` (`INCOMPLETE`) on the
  quantified equations of a map keyed by integers, where the assignments are decided. `quint verify`
  asks for the equations only to show a counterexample, and `#quint_check_induction` writes no state at
  the initializer without them.
- A map chosen from `setOfMaps(D, R)` takes `D` as its keys (`Smt.Val.mapOf`): choosing a relation for the
  keys and requiring it to equal `D` left cvc5 at `unknown`.
- The library uses Lean's module system, which `#model_check compiled` requires of the file that runs
  it. `Quint.IR` and `Quint.Embed` are `public meta`, since they run at elaboration time. `Quint.Builtins`
  is `@[expose] public`, since proofs unfold its definitions and the compiled checker runs them.
- The `quint` package ships `lakefile.lean`, `lean-toolchain`, `lake-manifest.json`, `Quint.lean` and
  `Quint/*.lean` for `quint verify --backend veil`, which builds them in a workspace under
  `~/.quint/veil`. A change to the library rebuilds only the library there; a change to the other three
  makes a new workspace, where Veil builds again from scratch.
- Veil's registry of modules (`globalEnv`) is a scoped environment extension that Veil itself never adds
  to, and only an entry that `ScopedEnvExtension.add` records reaches the `.olean`. `quint_module` adds its
  module that way, so that `veil module M` re-opens it in a file that imports this one. Veil's verification
  conditions live in a manager of the process, which `Command.elabReopenedModule` fills again.
- Veil's transition system decides equality classically, while `holds% p` takes `DecidableEq` instances
  as parameters. `holds_by_invariants` therefore leaves every argument of Veil's theorems to unification:
  a synthesized instance is not the classical one, and the check that they agree times out.
- In `prove_temporal_by`, Veil reads `⟨ a ⟩` as the transition relation of the action `a`, where
  `#temporal_check` reads a step's label. A fairness assumption over the actions `A ∧ v' ≠ v` therefore
  means TLA+'s `⟨A⟩_v` in a proof.
- `unveil_temporal` opens an obligation into goals over the state's fields only when its step is a step of
  one action (`veil_tr% a`). A step of `⟨ a ⟩ ∨ ⟨ b ⟩` or of a lambda over actions stays in `setIn` and
  `getFrom`, which neither `grind` nor SMT takes. `Liveness.or_and_implies` splits it first.
- `unveil_temporal` replaces some `Decidable` instances with `Classical.propDecidable` and leaves others, so
  one `if` of the spec can reach a goal with two instances. `omega` reads the two as different terms. A proof
  decides each `if` with `split` instead, as `rank_lowers` of `Tests/TemporalProofs.lean` does.
- `veil_term%` takes only the name of a declaration, and `FieldRepresentation.get (getFrom st).f` does not
  elaborate for a map field. A rank or a predicate that a temporal proof reads is a definition of the spec,
  as `rank` of `examples/classic/distributed/ewd840/ewd840.qnt` is.
- Lentil's `tapply` takes a lemma whose arguments are named, as in `wf1_inv (σ := σ) (inv := …)`, and a state
  predicate as a term (`state_pred p`), not as `⌜ p ⌝`.
- `make -C lean test` reruns the regression tests in `Tests/`. The tests need `QUINT_BIN` and the Lean
  toolchain. Reuse a spec from `examples/` before adding a purpose-built fixture.
  Veil's SMT commands only work through `lake build`: `lake env lean` cannot load cvc5's native library.

## Which doc answers what

- `README.md` — what the embedding is, the options of `quint_module`, and its limits.
- `Quint/Builtins.lean` — the meaning of each Quint builtin, with the evaluator it is checked against.
- `Quint/Temporal.lean` — what a temporal property becomes, and which ones are refused.
- `Quint/Smt.lean` — the SMT encoding of `(smt := true)`: what each value is stored as, which
  enumerations are Veil enums, and which expressions are expanded.
- `Quint/Induction.lean` — `#quint_check_induction`'s report, and how a counterexample's states are read
  back from the solver's model.
- `Quint/Obligation.lean` — `holds% p` and `holds_temporal% p`, which `quint verify --proofs` checks, and
  `holds_by_invariants` and `holds_by_temporal_proof`.
- `Quint/Liveness.lean` — the rules for proofs of temporal properties.
- `Quint/Steps.lean` — what `#gen_steps` declares, and the tactics that open a step.
