module

public meta import Lean
public meta import Veil
public meta import Quint.IR
public meta import Quint.Embed

/-! Quint's temporal properties as Veil `temporal` declarations, which `#temporal_check` model checks.

A temporal property means what it means in TLA+: it is about the behaviors of `init` and `step` that may
stutter at any step, not only at the dead ends where Veil's checker stutters. The module gets an action
that changes nothing, as Veil's own TLA+ ports have, so that every state can stutter.

A predicate on one state becomes `⌜ … ⌝`; `always`, `eventually` and `leadsTo` become `□`, `◇` and `↝`;
and a quantifier over a set ranges over the elements of the set.

Fairness is TLA+'s: `WF_v(A)` is `◇□ ENABLED ⟨A⟩_v → □◇ ⟨A⟩_v`, and `SF_v(A)` the same with `□◇` on the
left, where `⟨A⟩_v` is the action `A ∧ v' ≠ v`. The module gets that action, and the formula reads Veil's
`Enabled` and `⟨ ⟩` of it: Veil decides a step's action by its label, and a step under this label is
exactly an `⟨A⟩_v` step. The action adds no step when `A` is `step` or one of the actions `step` offers,
the only ones accepted. Fairness is accepted only as an assumption, on the left of `implies`: Veil checks
every labelling of a run, and a run fair in TLA+'s sense has one that takes its `⟨A⟩_v` steps under this
label, while as a claim a labelling that takes them under another would break it. `enabled(A)` is
`Enabled` of `A` itself.

A formula about steps (`orKeep`, `mustChange`, `next`, a primed assignment, an action) relates the two
states of a step, which no atom of Veil's model checker does, and `◯` does only through a quantifier over
the values a variable takes, which Veil enumerates for finite types alone. It is refused, except as the
action of fairness and `enabled`. -/

public meta section

namespace Quint.Embed

open Lean Elab Command Term

/-- The operators of Quint's temporal logic that are about steps rather than states. -/
private def stepOperators : List String :=
  ["weakFair", "strongFair", "enabled", "orKeep", "mustChange", "next"]

private def isTemporalDef (ctx : Ctx) (n : String) : Bool :=
  match ctx.lookup n with
  | some (.def _ _ "temporal" _ _) => true
  | _ => false

/-- Whether `e` is a formula of temporal logic rather than a predicate on one state: it applies a
temporal operator, or names a `temporal` definition. -/
private partial def isTemporal (ctx : Ctx) : IR.Expr → Bool
  | .app _ op args =>
    ["always", "eventually", "leadsTo"].contains op || stepOperators.contains op || isTemporalDef ctx op ||
      args.any (isTemporal ctx)
  | .name _ n => isTemporalDef ctx n
  | .lambda _ _ _ body => isTemporal ctx body
  | .letE _ _ _ _ value body => isTemporal ctx value || isTemporal ctx body
  | _ => false

/-- The formula `op` joins `fs` with, or `unit` for none. -/
private def joinFormulas (op : TSyntax `tlfml → TSyntax `tlfml → M (TSyntax `tlfml)) (unit : TSyntax `tlfml) :
    List (TSyntax `tlfml) → M (TSyntax `tlfml)
  | [] => pure unit
  | f :: fs => fs.foldlM op f

private def disjunction (fs : List (TSyntax `tlfml)) : M (TSyntax `tlfml) := do
  joinFormulas (fun a b => `(tlfml| ($a) ∨ ($b))) (← `(tlfml| ⊥)) fs

/-- The declaration names of the actions whose steps are steps of `step`: `step` itself and, through
`any`, every action it offers. -/
private partial def stepAlternatives (ctx : Ctx) : IR.Expr → List String
  | .app _ "actionAny" args => args.flatMap (stepAlternatives ctx)
  | .name _ n =>
    match ctx.lookup n with
    | some (.def _ dn "action" body _) => dn :: stepAlternatives ctx body
    | _ => []
  | _ => []

/-- `e` with every definition it names that takes no parameters replaced by its body, so that it reads the
state variables themselves. -/
private partial def unfoldValues (ctx : Ctx) : IR.Expr → IR.Expr
  | e@(.name _ n) =>
    match ctx.lookup n with
    | some (.def _ _ q body _) =>
      match body with
      | .lambda .. => e
      | _ => if ["val", "pureval", "def", "puredef"].contains q then unfoldValues ctx body else e
    | _ => e
  | .app id op args => .app id op (args.map (unfoldValues ctx))
  | e => e

/-- A name for an action of the module that none of its actions has, nor a branch numbered after it. -/
private def freshActionName (base : String) : M String := do
  let declared := (← Veil.getCurrentModule).actions.map (·.name.toString)
  let taken (n : String) := declared.any fun d => d == n || d.startsWith (n ++ "_")
  let mut name := base
  let mut i := 1
  while taken name do
    name := s!"{base}{i}"
    i := i + 1
  pure name

/-- The Veil actions of `A ∧ v' ≠ v` for the action `a` and the expression `v` of `op`, or of `A` itself
without `v`: one per branch of `A`, which must be `step` or one of the actions it offers. -/
private def actionsOf (op : String) (a : IR.Expr) (v : Option IR.Expr) : M (List Ident) := do
  let ctx ← read
  let (stepName, stepBody) ← entryPoint ctx "q::step"
  let alternatives := ((ctx.lookup stepName).map (·.name)).toList ++ stepAlternatives ctx stepBody
  let (n, body) ← match a with
    | .name _ n =>
      match ctx.lookup n with
      | some (.def _ dn "action" body _) =>
        if alternatives.contains dn then pure (dn, body)
        else unsupported s!"{op} of {n}, which is neither step nor an action step offers"
      | _ => unsupported s!"{op} of {n}, which is not an action"
    | _ => unsupported s!"{op} of an action with arguments"
  let changed ← v.mapM fun v => do
    let v := unfoldValues ctx v
    let refs := references v
    if refs.any fun r => ctx.stateReaders.contains r && !ctx.vars.contains r then
      unsupported s!"{op} over variables read through an operator"
    let prop : M Term := do `(¬ ($(← withPost (exprTerm v)) = $(← exprTerm v)))
    pure prop
  let base := n.replace "::" "_"
  emitActions (← freshActionName (if v.isSome then base ++ "_changes" else base ++ "_enabled")) body changed

/-- Whether `e` applies a temporal operator or names a `temporal` definition, at any depth. -/
private partial def mentionsTemporal (ctx : Ctx) : IR.Expr → Bool
  | .app _ op args =>
    ["always", "eventually", "leadsTo", "weakFair", "strongFair", "enabled"].contains op ||
      isTemporalDef ctx op || args.any (mentionsTemporal ctx)
  | .name _ n => isTemporalDef ctx n
  | .lambda _ _ _ body => mentionsTemporal ctx body
  | .letE _ _ _ _ value body => mentionsTemporal ctx value || mentionsTemporal ctx body
  | _ => false

/-- Whether `e` reads the state after a step: through `next`, a primed assignment, `orKeep`, `mustChange`,
or an action. -/
private partial def readsNextState (ctx : Ctx) : IR.Expr → Bool
  | e@(.app _ op args) =>
    ["next", "orKeep", "mustChange"].contains op || isAction ctx e || args.any (readsNextState ctx)
  | e@(.name ..) => isAction ctx e
  | .lambda _ _ _ body => readsNextState ctx body
  | e@(.letE _ _ _ _ value body) => isAction ctx e || readsNextState ctx value || readsNextState ctx body
  | _ => false

/-- Whether `e` is a formula about one step, with no temporal operator in it. -/
private def isStepFormula (ctx : Ctx) (e : IR.Expr) : Bool :=
  readsNextState ctx e && !mentionsTemporal ctx e

/-- The Veil formula of the temporal property `e`. `bound` are the quantified names in scope: each ranges
over a subtype of the elements of a set, so a state predicate reads its value as `x.val`. `positive` is
whether `e` is claimed, `negative` whether it is assumed: both under `↔`, and fairness must be only
assumed. -/
private partial def formula (bound : List Ident) (positive negative : Bool) (e : IR.Expr) :
    M (TSyntax `tlfml) := do
  let ctx ← read
  let same := formula bound positive negative
  let flipped := formula bound negative positive
  let both := formula bound true true
  if isStepFormula ctx e then
    throwError "quint_module: a formula about steps is supported only as the action of weakFair, \
      strongFair and enabled: Veil's model checker has no atom that relates the two states of a step"
  if !isTemporal ctx e then
    let p ← bound.foldrM (fun x acc => `(let $x:ident := Subtype.val $x; $acc)) (← propTerm e)
    return ← `(tlfml| ⌜ $p ⌝)
  match e with
  | .app _ "always" [p] => `(tlfml| □ ($(← same p)))
  | .app _ "eventually" [p] => `(tlfml| ◇ ($(← same p)))
  | .app _ "leadsTo" [p, q] => `(tlfml| ($(← flipped p)) ↝ ($(← same q)))
  | .app _ "not" [p] => `(tlfml| ¬ ($(← flipped p)))
  | .app _ "and" ps | .app _ "actionAll" ps =>
    joinFormulas (fun a b => `(tlfml| ($a) ∧ ($b))) (← `(tlfml| ⊤)) (← ps.mapM same)
  | .app _ "or" ps | .app _ "actionAny" ps => disjunction (← ps.mapM same)
  | .app _ "implies" [p, q] => `(tlfml| ($(← flipped p)) → ($(← same q)))
  | .app _ "iff" [p, q] => `(tlfml| ($(← both p)) ↔ ($(← both q)))
  | .app _ "ite" [c, a, b] =>
    let c ← both c
    `(tlfml| (($c) → ($(← same a))) ∧ ((¬ ($c)) → ($(← same b))))
  | .app _ op [set, .lambda _ [(_, x)] _ body] =>
    if op != "forall" && op != "exists" then unsupported s!"{op} in a temporal property"
    -- The elements are listed before the search, from the set outside of any state.
    let fromState := (references set).any fun n =>
      ctx.vars.contains n || ctx.stateReaders.contains n || ctx.constReaders.contains n
    if fromState then unsupported "a temporal quantifier over a set that depends on the state or a constant"
    let x ← ident x
    let dom ← `({ a : $(← elemType set) // TSet.contains a $(← exprTerm set) })
    let body ← formula (bound ++ [x]) positive negative body
    if op == "forall" then `(tlfml| ∀ $x:ident : $dom, $body) else `(tlfml| ∃ $x:ident : $dom, $body)
  | .name _ n =>
    match ctx.lookup n with
    | some (.def _ _ "temporal" body _) => same body
    | _ => unsupported s!"{n} in a temporal property"
  | .app _ op [a, v] =>
    if op != "weakFair" && op != "strongFair" then unsupported s!"{op} in a temporal property"
    if positive then
      throwError "quint_module: {op} is supported only as an assumption, on the left of implies: Veil \
        checks every labelling of a run, and one that takes its steps under another action's label breaks it"
    let ids ← actionsOf op a (some v)
    let enabled ← disjunction (← ids.mapM fun id => `(tlfml| Enabled $id:ident))
    let taken ← disjunction (← ids.mapM fun id => `(tlfml| ⟨ $id:ident ⟩))
    if op == "weakFair" then `(tlfml| (◇ □ ($enabled)) → (□ ◇ ($taken)))
    else `(tlfml| (□ ◇ ($enabled)) → (□ ◇ ($taken)))
  | .app _ "enabled" [a] =>
    disjunction (← (← actionsOf "enabled" a none).mapM fun id => `(tlfml| Enabled $id:ident))
  | .app _ op _ => unsupported s!"{op} in a temporal property"
  | _ => unsupported "this temporal property"

/-- The properties `quint compile --temporal a,b` names, each with the name the spec gives it: the
conjuncts of `q::temporalProps`, or that definition itself when it is not a conjunction of names. -/
private def requestedProperties (ctx : Ctx) : List (String × IR.Expr) :=
  match ctx.lookup "q::temporalProps" with
  | some (.def _ _ _ e _) =>
    let asName (a : IR.Expr) : Option (String × IR.Expr) := match a with
      | .name _ n => some (n, a)
      | _ => none
    let named : Option (List (String × IR.Expr)) := match e with
      | .app _ "and" args => args.mapM asName
      | _ => none
    named.getD [("temporalProps", e)]
  | _ => []

open Veil in
/-- The temporal properties `quint compile --temporal` names, as Veil `temporal` declarations, the action
that lets every state stutter, and the actions their fairness and `enabled` read. Nothing when the spec
names none. -/
def emitTemporal : M Unit := do
  let props := requestedProperties (← read)
  if props.isEmpty then return
  emit (← `(command| action $(mkIdent (Name.mkSimple (← freshActionName "stutter"))):ident { pure () }))
  for (n, e) in props do
    -- Keep the property label in Quint form; the proposition's references are escaped separately.
    let name := mkIdent (Name.mkSimple n)
    let φ ← formula [] true false e
    emit (← `(command| temporal [$name:ident] $φ:tlfml))

end Quint.Embed
