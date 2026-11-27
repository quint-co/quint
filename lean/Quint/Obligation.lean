module

public import Veil
public meta import Lean
public meta import Veil

/-! `holds% p`: the statement that a proof obligation of a verification plan makes about the invariant `p` of
the module a `quint_module` opened. It holds in every reachable state, for every value of the module's
parameters, which are the spec's constants and, in the SMT encoding, its uninterpreted sorts, under every
theory. `quint verify --backend veil --proofs` checks a theorem against it, so a proof that states anything
weaker does not count.

`holds_by_invariants` proves `holds% p` for an invariant `p` of the module from the theorems that Veil's
`#gen_theorems` and `prove_veil_invariant_goal` declare: that the initializer establishes, and every action
preserves, each invariant of the module, assuming all of them.

`holds_temporal% p` is the statement of the obligation of a temporal property `p` of the module: every behavior of
the transition system that `holds%` is about, which starts in an initial state and takes a step of the system at
each position, satisfies `p`, for every value of the module's parameters and every theory that meets its
assumptions. It assumes no invariant. `holds_by_temporal_proof` proves it from the theorem `p._proof` of Veil's
`prove_temporal_by [p]`, which may assume the module's invariants, and from the theorem `q_holds : holds% q` of each
invariant `q` of the module, which establish them. -/

public section

namespace Quint.Obligation

open Veil

/- The step comes before the theorem `h` about the procedure, so that the step fixes the procedure and its
parameters, and `h` is then checked against a statement without metavariables. -/

/-- `post` holds after a step of `tr`, when `tr` is the transition of `act` and `act` meets its
specification. -/
theorem post_of_wp {m : Mode} {ρ σ α : Type} [Inhabited α] {act : VeilM m ρ σ α} {tr : Transition ρ σ}
    {assu : ρ → Prop} {pre post : SProp ρ σ} {th : ρ} {s s' : σ} (ha : assu th) (hp : pre th s)
    (ht : tr th s s') (heq : act.toTransitionDerived = tr)
    (h : act.meetsSpecificationIfSuccessfulAssuming assu pre post) : post th s' := by
  subst heq
  rw [← VeilM.toTransitionDerived_sound] at ht
  exact (Transition.meetsSpecificationIfSuccessful_eq act _ post).mpr h th s s' ⟨ha, hp⟩ ht

/-- `post` holds after a step of `tr'`, when `tr` is `tr'` and meets its specification. -/
theorem post_of_tr {ρ σ : Type} {tr tr' : Transition ρ σ} {assu : ρ → Prop} {pre post : SProp ρ σ}
    {th : ρ} {s s' : σ} (ha : assu th) (hp : pre th s) (ht : tr' th s s') (heq : tr = tr')
    (h : tr.meetsSpecificationIfSuccessfulAssuming assu pre post) : post th s' := by
  subst heq
  exact h th s s' ⟨ha, hp⟩ ht

/-- Every state of a behavior of `sys`, which starts in an initial state and takes a step of `sys` at each
position, is reachable. -/
theorem reachable_of_behavior {ρ σ l : Type} {sys : RelationalTransitionSystem ρ σ l} {th : ρ} {e : Nat → σ}
    (has : sys.assumptions th) (h0 : sys.init th (e 0)) (hn : ∀ i, sys.next th (e i) (e (i + 1))) :
    ∀ i, sys.reachable th (e i) := by
  intro i
  induction i with
  | zero => exact .init _ has h0
  | succ i ih => exact .step _ _ ih (hn i)

end Quint.Obligation

end

public meta section

namespace Quint.Obligation

open Lean Elab Term Veil

syntax (name := holdsTerm) "holds% " ident : term

@[term_elab holdsTerm]
def elabHolds : TermElab := fun stx expected => do
  let p : Ident := ⟨stx[1]⟩
  let mod ← getCurrentModule (errMsg := "holds% is used inside the module that a quint_module opened")
  let ctx ← Veil.Synthesizer.QueryCtx.ofModule mod
  let (th, st) := (mkIdent `th, mkIdent `st)
  let body ← `(∀ ($th : $(ctx.theoryT)) ($st : $(ctx.stateT)), ($(ctx.rtsExpr)).reachable $th $st → $p $th $st)
  let binders := ctx.sortBinders ++ ctx.typeclassBinders
  elabTerm (← if binders.isEmpty then pure body else `(∀ $binders*, $body)) expected

syntax (name := holdsTemporalTerm) "holds_temporal% " ident : term

@[term_elab holdsTemporalTerm]
def elabHoldsTemporal : TermElab := fun stx expected => do
  let p : Ident := ⟨stx[1]⟩
  let mod ← getCurrentModule (errMsg := "holds_temporal% is used inside the module that a quint_module opened")
  let ctx ← Veil.Synthesizer.QueryCtx.ofModule mod
  let (th, e, i) := (mkIdent `th, mkIdent `e, mkIdent `i)
  let rts := ctx.rtsExpr
  let body ← `(∀ ($th : $(ctx.theoryT)), ($rts).assumptions $th → ∀ ($e : Lentil.exec $(ctx.stateT)),
    ($rts).init $th ($e 0) → (∀ $i:ident, ($rts).next $th ($e $i) ($e ($i + 1))) →
      ($p $th : Lentil.pred $(ctx.stateT)) $e 0)
  let binders := ctx.sortBinders ++ ctx.typeclassBinders
  elabTerm (← if binders.isEmpty then pure body else `(∀ $binders*, $body)) expected

open Tactic

/-- The leading binders of `e`, without unfolding anything. -/
private def binderInfos : Expr → List BinderInfo
  | .forallE _ _ b bi => bi :: binderInfos b
  | _ => []

/-- Proves `holds% p` for an invariant `p` of the module, by induction over the conjunction of the module's
invariants. For each of them and for the initializer and each action, it needs the theorem that
`#gen_theorems` declares, or `prove_veil_invariant_goal`, with `using wp` or `using tr`. -/
syntax (name := holdsByInvariants) "holds_by_invariants" : tactic

@[tactic holdsByInvariants]
def evalHoldsByInvariants : Tactic := fun _ => withMainContext do
  let mod ← getCurrentModule (errMsg := "holds_by_invariants is used inside the module that a quint_module opened")
  let goal ← getMainGoal
  let target ← instantiateMVars (← goal.getType)
  -- `holds% p`: the module's parameters, then the theory, the state and reachability.
  let infos := binderInfos target
  let some p := (target.getForallBody.getAppFn.constName?).map (·.replacePrefix mod.name .anonymous)
    | throwError "holds_by_invariants proves a goal of the form holds% p"
  let invariants := mod.invariants.map (·.name)
  let some index := invariants.findIdx? (· == p)
    | throwError "holds_by_invariants: {p} is not an invariant of {mod.name}; name it in (invariants := [...])"
  let (_, goal) ← goal.introN (infos.length - 3)
  replaceMainGoal [goal]
  let ids := [`th, `st, `st', `lbl, `h, `has, `hinit, `hinv, `htr].map mkIdent
  let [th, st, st', lbl, h, has, hinit, hinv, htr] := ids | unreachable!
  /- `thm` applied to a hole for each of its leading binders, `drop` aside. Instances too are left to
  unification: the transition system decides equality classically, where `holds% p` takes instances. -/
  let applied (thm : Name) (drop : Nat := 0) : TacticM Term := do
    let some info := (← getEnv).find? thm | throwError "holds_by_invariants: {thm} is not declared"
    let holes ← (List.range ((binderInfos info.type).length - drop)).toArray.mapM fun _ => `((_))
    `(@$(mkIdent thm) $holes*)
  -- The conjunction of the invariants, in this order, that the theorems assume.
  let assumed ← applied (mod.name ++ assembledInvariantsName) (drop := 2)
  let mut proj : Term := h
  for _ in [:index] do proj ← `(And.right $proj)
  if index + 1 < invariants.size then proj ← `(And.left $proj)
  let obligation (proc inv : Name) (initial : Bool) : TacticM Term := do
    let wp := mod.name ++ .mkSimple s!"{proc}_{inv}"
    let tr := wp.appendAfter "_tr"
    let derivedEq ← applied (mod.name ++ toDerivedEqName (toExtName proc))
    let (pre, step) ← if initial then pure ((← `(trivial)), hinit) else pure (hinv, htr)
    if (← getEnv).contains wp then
      let heq ← if initial then pure derivedEq else `(rfl)
      `(Quint.Obligation.post_of_wp $has $pre $step $heq $(← applied wp))
    else if (← getEnv).contains tr then
      let heq ← if initial then `(rfl) else `(($derivedEq).symm)
      `(Quint.Obligation.post_of_tr $has $pre $step $heq $(← applied tr))
    else
      throwError "holds_by_invariants: neither {wp} nor {tr} is declared: run #gen_theorems, or prove it with \
        prove_veil_invariant_goal {proc} {inv}"
  /- The step of the transition system unfolded once to the procedure's own transition, which every
  theorem about the procedure then matches without unfolding the system again. -/
  let unfolded := #[assembledRTSName, assembledInitName, assembledNextName, assembledNextActName].map
    fun n => mkIdent (mod.name ++ n)
  let keeps (proc : Name) (initial : Bool) : TacticM (TSyntax ``Lean.Parser.Tactic.tacticSeq) := do
    let proofs ← invariants.mapM (obligation proc · initial)
    let tuple ← if proofs.size == 1 then pure proofs[0]! else `(⟨$proofs,*⟩)
    let step := if initial then hinit else htr
    `(Lean.Parser.Tactic.tacticSeq|
      dsimp -failIfUnchanged only [$[$unfolded:ident],*] at $has:ident $step:ident
      exact $tuple)
  -- `cases` rather than `match`, whose motive over the step costs more than the whole proof.
  let steps ← mod.actions.mapM fun act => do `(tactic| case $(mkIdent act.name):ident => $(← keeps act.name false))
  let steps := #[← `(tactic| cases $lbl:ident)] ++ steps
  -- Tactic blocks run in order, so the steps fix the instances of `assumed` before `p` is projected out.
  evalTactic (← `(tactic| exact Veil.RelationalTransitionSystem.Invariant.mono
    (Veil.RelationalTransitionSystem.invariant_of_inductive (p := fun $th $st => $assumed $th $st)
      (fun $th $st' $has $hinit => by $(← keeps initializerName true))
      (fun $th $st $lbl $st' $has $hinv $htr => by $[$steps];*))
    (fun $th $st $h => by exact $proj)))

/-- Proves `holds_temporal% p` from the theorem `p._proof` of `prove_temporal_by [p]`, and from the theorem
`q_holds : holds% q` of each invariant `q` of the module, which give the invariants that `p._proof` assumes in every
state of a behavior: each one is reachable. -/
syntax (name := holdsByTemporalProof) "holds_by_temporal_proof" : tactic

@[tactic holdsByTemporalProof]
def evalHoldsByTemporalProof : Tactic := fun _ => withMainContext do
  let mod ← getCurrentModule
    (errMsg := "holds_by_temporal_proof is used inside the module that a quint_module opened")
  let goal ← getMainGoal
  let target ← instantiateMVars (← goal.getType)
  -- `holds_temporal% p`: the module's parameters, then the theory, its assumptions, the behavior, its start and steps.
  let infos := binderInfos target
  let some p := (target.getForallBody.getAppFn.constName?).map (·.replacePrefix mod.name .anonymous)
    | throwError "holds_by_temporal_proof proves a goal of the form holds_temporal% p"
  let proof := mod.name ++ p ++ `_proof
  unless (← getEnv).contains proof do
    throwError "holds_by_temporal_proof: {proof} is not declared: prove {p} with prove_temporal_by [{p}]"
  let ctx ← Veil.Synthesizer.QueryCtx.ofModule mod
  let (_, goal) ← goal.introNP (infos.length - 5)
  replaceMainGoal [goal]
  let ids := [`th, `has, `e, `hinit, `hnext, `hr, `k, `lbl, `h].map mkIdent
  let [th, has, e, hinit, hnext, hr, k, lbl, h] := ids | unreachable!
  -- The invariants, in the order of the conjunction that `p._proof` assumes, at the `k`th state of the behavior.
  let holds ← mod.invariants.toList.mapM fun inv => do
    let thm := mod.name ++ inv.name.appendAfter "_holds"
    let some info := (← getEnv).find? thm
      | throwError "holds_by_temporal_proof: {thm} is not declared: prove holds% {inv.name} first"
    let holes ← (List.range ((binderInfos info.type).length - 3)).toArray.mapM fun _ => `((_))
    `(@$(mkIdent thm) $holes* $th ($e $k) ($hr $k))
  let invariants ← match holds.reverse with
    | [] => `(trivial)
    | last :: rest => rest.foldlM (fun acc t => `(And.intro $t $acc)) last
  /- A step of the transition system is a step of `NextStep`, which `p._proof` reads: the first goes through each
  action's derived transition, and the second through the action's own. -/
  let unfolded := #[assembledRTSName, assembledNextName, assembledNextActName, assembledNextTrName].map
    fun n => mkIdent (mod.name ++ n)
  let steps ← mod.actions.mapM fun act => do
    let derivedEq := mkIdent (mod.name ++ toDerivedEqName (toExtName act.name))
    `(tactic| case $(mkIdent act.name):ident => (rw [$derivedEq:ident] at $h:ident; exact $h:ident))
  evalTactic (← `(tactic| (
    intro $th:ident $has:ident $e:ident $hinit:ident $hnext:ident
    have $hr := Quint.Obligation.reachable_of_behavior $has $hinit $hnext
    refine ($(mkIdent proof) (σ := $(ctx.stateT)) $th $has) $e 0 (And.intro $hinit (And.intro ?_ ?_))
    · intro $k:ident
      obtain ⟨$lbl, $h⟩ := $hnext $k
      simp only [Lentil.action_pred, Nat.zero_add]
      refine Exists.intro $lbl ?_
      cases $lbl:ident <;> simp only [$[$unfolded:ident],*] at $h:ident ⊢
      $[$steps];*
    · intro $k:ident
      simp only [Lentil.state_pred, Nat.zero_add]
      exact $invariants)))

end Quint.Obligation
