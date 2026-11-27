module

public import Veil
public meta import Lean
public meta import Veil

/-! The steps of the module that a `quint_module` opened, as plain Lean: `#gen_steps`, and the tactics that
open a step.

`#gen_steps` declares, inside the module:

- `Step th s s'`, with one constructor for each action of the module. The constructor's explicit
  arguments are the values that the action chooses with `nondet`, then the facts that its guard states,
  and its index is the state after the step, written as a record of the fields of `s`;
- `Initial th s`, the same for the initializer;
- `reachable_induction`, which proves a property of every reachable state from a proof that `Initial`
  states have it and that every `Step` keeps it.

The constructors are read off Veil's own transition of each action, unfolded and with Veil's field
representation reduced to plain reads by `quint_norm_step`, so `Step` is exactly the module's transition
relation. When the unfolded transition does not end in an equation that gives the next state, the
constructor takes that state as an argument, and the unfolded transition as its one fact.

`open_step f` and `open_some f` open `hx : f … = some x` for a spec function `f` that returns an
`Option`: `if c then some e else none`, whose guard becomes `hc`, or `some e`. `open_take` opens a case of
`Step` for an action that takes the record such a function returns. -/

public meta section

namespace Quint.Steps

open Lean Elab Command Term Meta Veil

/-- Turns Veil's representation of the state's fields in `h` into reads `s.f` and record updates. -/
syntax (name := normStep) "quint_norm_step" " at " ident : tactic

macro_rules
  | `(tactic| quint_norm_step at $h:ident) => `(tactic| (
      dsimp -failIfUnchanged +instances only [FieldRepresentation.get, FieldRepresentation.setSingle, getFrom,
        setIn, id, CanonicalField.set, IteratedArrow.curry, IteratedArrow.uncurry, FieldUpdatePat.match,
        IteratedProd.patCmp, Option.elim, ↓reduceIte] at $h:ident
      simp -failIfUnchanged only [ite_true, eq_self_iff_true] at $h:ident))

set_option hygiene false in
/-- Opens `hx : f … = some x` of a function `f` that guards with `if`: the guard becomes `hc`, and `x` the
value that `f` returns. -/
macro "open_step " f:ident : tactic => `(tactic| (
  unfold $f:ident at hx
  dsimp only at hx
  obtain ⟨hc, hx⟩ := Option.ite_none_right_eq_some.mp hx
  cases hx))

set_option hygiene false in
/-- `open_step` for a function without a guard. -/
macro "open_some " f:ident : tactic => `(tactic| (
  unfold $f:ident at hx
  cases hx))

set_option hygiene false in
/-- In a case of `Step` for an action `take(f(…))`, which requires `f(…) != None` and assigns each field
from the record that `f` returns: names that record `x`, with `hx : f … = some x`, and reads `x` in place of
the match on `f …` in the goal. -/
macro "open_take" : tactic => `(tactic| (
  obtain ⟨x, hx⟩ := Option.ne_none_iff_exists'.mp ‹¬ _ = none›
  simp only [hx]))

/-- The parts of an unfolded transition `∃ x, p ∧ … ∧ r = s'`: one argument for each value chosen and for each
fact, in the order the transition states them, the record `r` of the state after the step when one
equation gives it, and the `rcases` pattern that takes the transition apart into those arguments. -/
private structure Parts where
  args : Array Expr
  next : Option Expr
  pattern : String

/-- Takes `e` apart as `Parts`, with `tgt` the state that the transition reaches, and runs `k` on them while
the arguments are in the local context. -/
private partial def split {α : Type} (e tgt : Expr) (args : Array Expr) (next : Option Expr)
    (k : Parts → MetaM α) : MetaM α := do
  let e := e.consumeMData
  match e.getAppFn.constName?, e.getAppArgs with
  | some ``Exists, #[ty, .lam n _ body _] =>
    withLocalDeclD n ty fun x => do
      let name := s!"a{args.size}"
      split (body.instantiate1 x) tgt (args.push x) next fun parts =>
        k { parts with pattern := s!"⟨{name}, {parts.pattern}⟩" }
  | some ``And, #[l, r] =>
    split l tgt args next fun pl =>
      split r tgt pl.args pl.next fun pr =>
        k { pr with pattern := s!"⟨{pl.pattern}, {pr.pattern}⟩" }
  | some ``Eq, #[_, lhs, rhs] =>
    if next.isNone && rhs == tgt && !lhs.containsFVar tgt.fvarId! then
      k { args, next := some lhs, pattern := "rfl" }
    else if next.isNone && lhs == tgt && !rhs.containsFVar tgt.fvarId! then
      k { args, next := some rhs, pattern := "rfl" }
    else premise e
  | _, _ => premise e
where
  premise (e : Expr) : MetaM α :=
    withLocalDeclD (.mkSimple s!"h{args.size}") e fun h =>
      k { args := args.push h, next, pattern := s!"a{args.size}" }

/-- `e` with the binder info of its first binders set to `infos`, in order. -/
private def withBinderInfos : Expr → List BinderInfo → Expr
  | .forallE n t b _, bi :: rest => .forallE n t (withBinderInfos b rest) bi
  | e, _ => e

/-- A constructor of a step relation, read off the unfolded transition that `unfold` leaves in `h`. -/
private structure Ctor where
  name : Name
  ty : Expr
  /-- The number of the relation's parameters, which are the module's. -/
  params : Nat
  args : Nat
  /-- Whether the constructor takes the state after the step as an argument. -/
  takesNext : Bool
  pattern : String

/-- The constructor `name` of the relation `rel`, from the goal `∀ params, ∀ fixed, ∀ (t : σ) (h : _), False`
with `fixed` binders between the module's parameters and `t`: `unfold` unfolds `h`, and the constructor
states `rel params fixed r` of the record `r` that the unfolded `h` gives for `t`. Also the relation's type,
`∀ params, ∀ fixed, σ → Prop`. -/
private def readCtor (rel name : Name) (goal : Expr) (fixed : Nat)
    (unfold : TSyntax `tactic) : TermElabM (Ctor × Expr) := do
  let goal ← instantiateMVars goal
  forallTelescope goal fun xs _ => do
    let params := xs.size - fixed - 2
    let ps := xs[:params + fixed].toArray
    let tgt := xs[params + fixed]!
    let mvar ← mkFreshExprMVar (mkConst ``False)
    let [g] ← Tactic.run mvar.mvarId! (Tactic.evalTactic unfold)
      | throwError "#gen_steps: unfolding {name} closed or split its transition"
    g.withContext do
      let some h := (← getLCtx).findFromUserName? `h | throwError "#gen_steps: {name} lost its transition"
      let tgtTy ← inferType tgt
      -- The module's instances, which `(smt := true)` takes as parameters, are found by instance resolution.
      let infos ← xs[:params].toArray.toList.mapM fun p => do
        pure (if (← isClass? (← inferType p)).isSome then BinderInfo.instImplicit else .implicit)
      let relTy := withBinderInfos (← instantiateMVars (← mkForallFVars ps (← mkArrow tgtTy (mkSort .zero)))) infos
      split (← instantiateMVars h.type) tgt #[] none fun parts => do
        let (binders, index) := match parts.next with
          | some r => (ps ++ parts.args, r)
          | none => (ps.push tgt ++ parts.args, tgt)
        let ty ← instantiateMVars (← mkForallFVars binders (mkAppN (mkConst rel) (ps.push index)))
        if ty.hasMVar then throwError "#gen_steps: the constructor {name} has a hole: {ty}"
        let ty := withBinderInfos ty (infos ++ List.replicate fixed .implicit)
        pure ({ name, ty, params, args := parts.args.size, takesNext := parts.next.isNone,
                pattern := parts.pattern }, relTy)

/-- Declares the inductive predicate `rel` with the constructors `ctors` and the type `type`, whose first
`fixed` binders after the module's parameters are parameters too. -/
private def declareRel (rel : Name) (ty : Expr) (fixed : Nat) (ctors : List Ctor) (doc : String) :
    TermElabM Unit := do
  let params := (ctors.head?.map (·.params)).getD 0 + fixed
  addDecl <| .inductDecl [] params
    [InductiveType.mk rel ty (ctors.map fun c => Constructor.mk c.name c.ty)] false
  mkCasesOn rel
  mkRecOn rel
  addDocStringCore rel doc

/-- The term that applies the constructor `c` to the arguments that its pattern names. -/
private def ctorApp (c : Ctor) : TermElabM Term := do
  let args := (List.range c.args).toArray.map fun i => mkIdent (.mkSimple s!"a{i}")
  let hole ← `(_)
  let args : Array Term := (if c.takesNext then #[hole] else #[]) ++ args.map (⟨·⟩)
  `($(mkIdent c.name) $args*)

private def parsePattern (p : String) : TermElabM (TSyntax `rcasesPat) := do
  match Parser.runParserCategory (← getEnv) `rcasesPat p with
  | .ok stx => pure ⟨stx⟩
  | .error e => throwError "#gen_steps: the pattern {p} does not parse: {e}"

/-- An explicit binder `(x : t)` made implicit. -/
private def implicitBinder (b : TSyntax ``Lean.Parser.Term.bracketedBinder) :
    TermElabM (TSyntax ``Lean.Parser.Term.bracketedBinder) := do
  match b with
  | `(bracketedBinder| ($xs* : $t)) => `(bracketedBinder| {$xs* : $t})
  | _ => pure b

/-- `b`, a binder of instances, as instance-implicit binders, which instance resolution reads: the encoding with
`(smt := true)` takes instances of its sorts, such as `DecidableEq`, as parameters of the module. -/
private def instanceBinders (b : TSyntax ``Lean.Parser.Term.bracketedBinder) :
    TermElabM (Array (TSyntax ``Lean.Parser.Term.bracketedBinder)) := do
  match b with
  | `(bracketedBinder| ($xs* : $t)) => xs.mapM fun x => `(bracketedBinder| [$(⟨x.raw⟩):ident : $t])
  | _ => pure #[b]

/-- Declares `Step`, `Initial` and `reachable_induction` for the module that a `quint_module` opened. -/
syntax (name := genSteps) "#gen_steps" : command

@[command_elab genSteps]
def elabGenSteps : CommandElab := fun _ => do
  let mod ← getCurrentModule (errMsg := "#gen_steps is used inside the module that a quint_module opened")
  let ids := [`th, `s, `s', `h, `P, `h0, `hs, `st, `hr, `has, `hP, `lbl].map mkIdent
  let [th, s, s', h, P, h0, hs, st, hr, has, hP, lbl] := ids | unreachable!
  let stepName := mod.name ++ `Step
  let initialName := mod.name ++ `Initial
  let thm ← liftTermElabM do
    let ctx ← Veil.Synthesizer.QueryCtx.ofModule mod
    let binders := ctx.sortBinders ++ ctx.typeclassBinders
    let rts := ctx.rtsExpr
    let (theoryT, stateT) := (ctx.theoryT, ctx.stateT)
    let quantified (body : Term) : TermElabM Term := do
      if binders.isEmpty then pure body else `(∀ $binders*, $body)
    let rtsName := mkIdent (mod.name ++ assembledRTSName)
    let unfoldInit ← `(tactic| (
      simp only [$rtsName:ident, $(mkIdent (mod.name ++ assembledInitName)):ident,
        $(mkIdent (mod.name ++ toExtName initializerName ++ `tr)):ident] at $h:ident
      quint_norm_step at $h:ident))
    let unfoldStep (act : Name) : TermElabM (TSyntax `tactic) := `(tactic| (
      simp only [$rtsName:ident, $(mkIdent (mod.name ++ assembledNextName)):ident,
        $(mkIdent (mod.name ++ assembledNextActName)):ident,
        $(mkIdent (mod.name ++ toDerivedEqName (toExtName act))):ident,
        $(mkIdent (mod.name ++ toExtName act ++ `tr)):ident] at $h:ident
      quint_norm_step at $h:ident))
    let initGoal ← elabType (← quantified (← `(∀ ($th : $theoryT) ($s : $stateT)
      ($h : ($rts).init $th $s), False)))
    synthesizeSyntheticMVarsNoPostponing
    let (init, initialT) ← readCtor initialName (initialName ++ `init) initGoal 1 unfoldInit
    declareRel initialName initialT 1 [init]
      "An initial state of the module: the record that the initializer gives, with the values it chooses."
    let mut steps := #[]
    let mut relT := none
    for act in mod.actions do
      let goal ← elabType (← quantified (← `(∀ ($th : $theoryT) ($s $s' : $stateT)
        ($h : ($rts).tr $th $s $(mkIdent (mod.name ++ `Label ++ act.name)) $s'), False)))
      synthesizeSyntheticMVarsNoPostponing
      let (c, t) ← readCtor stepName (stepName ++ act.name) goal 2 (← unfoldStep act.name)
      steps := steps.push (act.name, c)
      relT := some t
    let some stepT := relT | throwError "#gen_steps: the module has no action"
    declareRel stepName stepT 2 (steps.toList.map (·.2))
      "A step of the module: one constructor for each action, whose arguments are the values the action \
      chooses and the facts its guard states, to the record of the state after the step."
    let implicit := (← ctx.sortBinders.mapM implicitBinder) ++ (← ctx.typeclassBinders.flatMapM instanceBinders)
    let initTacs := #[unfoldInit, ← `(tactic| rcases $h:ident with $(← parsePattern init.pattern):rcasesPat),
      ← `(tactic| exact $h0 _ _ $has ($(← ctorApp init)))]
    let stepCases ← steps.mapM fun (act, c) => do
      `(tactic| case $(mkIdent act):ident => (
        $(← unfoldStep act):tactic
        rcases $h:ident with $(← parsePattern c.pattern):rcasesPat
        exact $hs _ _ _ $has $hP ($(← ctorApp c))))
    let stepTacs := #[← `(tactic| cases $lbl:ident)] ++ stepCases
    `(command|
      /-- A property of states holds in every reachable state when every `Initial` state has it and every
      `Step` keeps it. -/
      theorem $(mkIdent `reachable_induction) $implicit* ($P : $theoryT → $stateT → Prop)
          ($h0 : ∀ ($th : $theoryT) ($s : $stateT), ($rts).assumptions $th → $(mkIdent initialName) $th $s → $P $th $s)
          ($hs : ∀ ($th : $theoryT) ($s $s' : $stateT), ($rts).assumptions $th → $P $th $s → $(mkIdent stepName) $th $s $s' →
            $P $th $s')
          ($th : $theoryT) ($st : $stateT) ($hr : ($rts).reachable $th $st) : $P $th $st :=
        Veil.RelationalTransitionSystem.invariant_of_inductive (p := $P)
          (fun $th $s $has $h => by $[$initTacs];*)
          (fun $th $s $lbl $s' $has $hP $h => by $[$stepTacs];*) $th $st $hr)
  elabCommand thm

end Quint.Steps
