module

public meta import Lean
public meta import Veil
public meta import Quint.Smt

/-! `#quint_check_induction`: Veil's induction checks of a module `quint_module (smt := true)` emitted,
reported as one line that `quint verify --backend veil --inductive-invariant` reads.

A counterexample's states are written as Quint values, in the shape Veil's `Display` gives a trace of the
model checker (`quint/src/veilItf.ts`), from the solver's model of each component (`Quint.Smt`). The
model gives a function as a chain of `if`s on its argument's values, so a set or a map shows the indices
the model names: every value of a `str` sort, which the model makes finite, every label of an
enumeration, and the integers between the least and the greatest the model mentions. -/

public meta section

namespace Quint.Induction

open Lean Elab Command Meta Veil Veil.Verifier
open Quint.IR (Ty Row isUnit)
open Quint.Smt

/-- The marker that starts the line. -/
def marker : String := "QUINT_INDUCTION"

/-- What decides a check: proven by any of its verification conditions, else disproven by any, else the
first other status, in the order `#check_invariants` reports them. -/
private def statusOf (vc : VCResult VCMetadata SmtResult) (all : Array (VCResult VCMetadata SmtResult)) :
    Option VCStatus :=
  let statuses := all.foldl (init := #[vc.status]) fun acc alt =>
    if alt.alternativeFor == some vc.id && !alt.isDormant then acc.push alt.status else acc
  [some .proven, some .disproven, none, some .error, some .timeout, some .unknown].find? statuses.contains
    |>.getD vc.status

/-- Why a verification condition was not decided, as the solver gave it. -/
private def reasons (vc : VCResult VCMetadata SmtResult) : List String :=
  vc.timing.dischargers.toList.flatMap fun d => match d.result with
    | some (.error exs _) => exs.toList.map fun (_, j) => j.compress
    | some (.unknown (some (.unknown rs)) _) => rs.toList
    | _ => []

/-! ## Values of a model -/

/-- A value of a model that a component holds or is indexed by. -/
inductive Lit where
  | int (i : Int)
  | bool (b : Bool)
  | ctor (n : Name)
  deriving BEq, Inhabited

mutual
  /-- The value `e` reduces to, through the `if`s of a model's functions applied to values. -/
  partial def evalLit (e : Expr) : MetaM (Option Lit) := do
    let e := (← instantiateMVars e).headBeta.consumeMData
    if let some i := e.int? then return some (.int i)
    if let some n := e.nat? then return some (.int n)
    if let .lit (.natVal n) := e then return some (.int n)
    if e.isConstOf ``Bool.true || e.isConstOf ``True then return some (.bool true)
    if e.isConstOf ``Bool.false || e.isConstOf ``False then return some (.bool false)
    if e.isAppOfArity ``ite 5 then
      match ← evalProp (e.getArg! 1) with
      | some true => return ← evalLit (e.getArg! 3)
      | some false => return ← evalLit (e.getArg! 4)
      | none => return none
    if e.isAppOfArity ``Decidable.decide 2 then return (← evalProp (e.getArg! 0)).map .bool
    if let .const n _ := e then
      if (← getEnv).find? n matches some (.ctorInfo _) then return some (.ctor n)
    -- A proposition a relation holds.
    (·.map .bool) <$> evalProp e

  /-- The truth of a proposition about values. -/
  partial def evalProp (e : Expr) : MetaM (Option Bool) := do
    let e := (← instantiateMVars e).headBeta.consumeMData
    let both (a b : Expr) (f : Lit → Lit → Option Bool) : MetaM (Option Bool) := do
      match ← evalLit a, ← evalLit b with
      | some x, some y => pure (f x y)
      | _, _ => pure none
    let ints (f : Int → Int → Bool) : Lit → Lit → Option Bool
      | .int x, .int y => some (f x y)
      | _, _ => none
    if e.isConstOf ``True then return some true
    if e.isConstOf ``False then return some false
    if e.isAppOfArity ``Eq 3 then return ← both (e.getArg! 1) (e.getArg! 2) fun x y => some (x == y)
    if e.isAppOfArity ``Not 1 then return (← evalProp (e.getArg! 0)).map (!·)
    if e.isAppOfArity ``And 2 then
      let (a, b) := (← evalProp (e.getArg! 0), ← evalProp (e.getArg! 1))
      return do pure ((← a) && (← b))
    if e.isAppOfArity ``Or 2 then
      let (a, b) := (← evalProp (e.getArg! 0), ← evalProp (e.getArg! 1))
      return do pure ((← a) || (← b))
    if e.isAppOfArity ``Iff 2 then
      let (a, b) := (← evalProp (e.getArg! 0), ← evalProp (e.getArg! 1))
      return do pure ((← a) == (← b))
    if e.isAppOfArity ``LE.le 4 then return ← both (e.getArg! 2) (e.getArg! 3) (ints (· ≤ ·))
    if e.isAppOfArity ``LT.lt 4 then return ← both (e.getArg! 2) (e.getArg! 3) (ints (· < ·))
    if e.isAppOfArity ``GE.ge 4 then return ← both (e.getArg! 2) (e.getArg! 3) (ints (· ≥ ·))
    if e.isAppOfArity ``GT.gt 4 then return ← both (e.getArg! 2) (e.getArg! 3) (ints (· > ·))
    if e.isAppOfArity ``ite 5 then
      match ← evalProp (e.getArg! 1) with
      | some true => return ← evalProp (e.getArg! 3)
      | some false => return ← evalProp (e.getArg! 4)
      | none => return none
    match ← evalLit' e with
    | some (.bool b) => pure (some b)
    | _ => pure none

  /-- `evalLit` without reading a proposition, which `evalProp` falls back to. -/
  partial def evalLit' (e : Expr) : MetaM (Option Lit) := do
    if e.isConstOf ``Bool.true then return some (.bool true)
    if e.isConstOf ``Bool.false then return some (.bool false)
    if e.isAppOfArity ``Decidable.decide 2 then return (← evalProp (e.getArg! 0)).map .bool
    pure none
end

/-- Every integer a model's value mentions. -/
private partial def intsIn (e : Expr) : List Int :=
  match e.int? with
  | some i => [i]
  | none => match e with
    | .app f a => intsIn f ++ intsIn a
    | .lam _ t b _ | .forallE _ t b _ => intsIn t ++ intsIn b
    | .letE _ t v b _ => intsIn t ++ intsIn v ++ intsIn b
    | .mdata _ b => intsIn b
    | _ => []

/-- What reading a counterexample's states needs: the module, the values of the model's components by
field name, and the indices to try. -/
structure Reader where
  info : ModuleInfo
  /-- The string literal of each value of `str` that is one, by its index in the model's finite sort. -/
  strNames : List (Int × String)
  strSize : Nat
  /-- The label of each value of a Veil `enum`, by its index in the model's sort, by the enum's labels. -/
  enumLabels : List (List String × List (Int × String))
  ints : List Int

/-- The largest number of indices a set or a map is read at. -/
private def indexLimit : Nat := 10000

namespace Reader

variable (r : Reader)

/-- The values to try for an index of scalar type `t`. -/
def candidates (t : Ty) : MetaM (List Expr) := do
  match t with
  | .bool => pure [mkConst ``Bool.false, mkConst ``Bool.true]
  | .int => pure (r.ints.map toExpr)
  | .str => pure ((_root_.List.range r.strSize).map mkRawNatLit)
  | .sum row =>
    let key := enumKey (sumRow row)
    if let some (_, labels) := r.enumLabels.find? (·.1 == key) then
      return labels.map fun (i, _) => mkRawNatLit i.toNat
    let some (_, ty) := r.info.enums.find? (·.1 == key) | return []
    let some (.inductInfo i) := (← getEnv).find? ty | return []
    pure (i.ctors.map (mkConst ·))
  | _ => pure []

/-- The label of `v`, a value of the enumeration `row`. -/
def label (row : Row) : Lit → Option String
  | .ctor n => some n.getString!
  | .int k => (r.enumLabels.find? (·.1 == enumKey (sumRow row))).bind (·.2.lookup k)
  | .bool _ => none

/-- Every tuple of values to try for the indices `ts`. -/
def tuples (ts : List Ty) : MetaM (List (List Expr)) := do
  ts.foldrM (init := [[]]) fun t acc => do
    let cs ← r.candidates t
    pure ((cs.flatMap fun c => acc.map (c :: ·)).take indexLimit)

/-- A complete, bounded index product. Sampled integers never certify completeness. -/
def exhaustiveTuples (ts : List Ty) (component : String) : MetaM (List (List Expr)) := do
  let mut count := 1
  for t in ts do
    if t matches .int | .const _ then
      throwError "the model's collection {component} has non-enumerable indices"
    let cs ← r.candidates t
    if cs.isEmpty then throwError "the model's collection {component} has unreadable indices"
    count := count * cs.length
    if count > indexLimit then throwError "the model's collection {component} exceeds the witness index limit"
  r.tuples ts

/-- A scalar value of type `t`, as `Display` writes it. -/
def scalarJson (t : Ty) (v : Lit) : Json :=
  let ctor (label : String) := Json.mkObj [("$veil", "ctor"), ("name", toJson label), ("args", Json.arr #[])]
  match t, v with
  | .str, .int k =>
    let name := ((r.strNames.find? (·.1 == k)).map (·.2)).getD s!"str{k}"
    Json.str name.quote
  | .sum row, .int k => ((r.label row v).map ctor).getD (toJson k)
  | _, .int i => toJson i
  | _, .bool b => toJson b
  | _, .ctor n => ctor n.getString!

/-- A value no component constrains: any is one the counterexample allows. -/
def defaultLit (t : Ty) : MetaM Lit := do
  match ← r.candidates t with
  | c :: _ => pure ((← evalLit c).getD (.int 0))
  | [] => pure (match t with | .bool => .bool false | _ => .int 0)

/-- The scalar of type `t` that the component `c`, read with `get`, holds at `args`. -/
def leaf (get : String → Option Expr) (c : String) (t : Ty) (args : List Expr) : MetaM Lit := do
  match get c with
  | none => r.defaultLit t
  | some f =>
    match ← evalLit (mkAppN f args.toArray) with
    | some v => pure v
    | none => throwError "the model's value of {c} could not be read"

/-- `Display`'s tuple: a pair nests to the right, and one component is itself. -/
private def tupleJson : List Json → Json
  | [] => Json.mkObj [("$veil", "ctor"), ("type", "Unit"), ("name", "unit"), ("args", Json.arr #[])]
  | [j] => j
  | j :: rest => Json.mkObj [("$veil", "ctor"), ("type", "Prod"), ("name", "mk"),
      ("args", Json.arr #[Json.mkObj [("value", j)], Json.mkObj [("value", tupleJson rest)]])]

/-- The value of the index type `t` whose components are `xs`, with what is left of `xs`. -/
partial def indexJson (t : Ty) (xs : List Expr) : MetaM (Json × List Expr) := do
  match t with
  | .record _ | .tup _ =>
    let mut rest := xs
    let mut fields := #[]
    for (f, ft) in fieldsOf t do
      let (j, more) ← indexJson ft rest
      fields := fields.push (f, j)
      rest := more
    pure (if t matches .tup _ then tupleJson (fields.toList.map (·.2)) else recordJson fields.toList, rest)
  | _ =>
    let x :: rest := xs | throwError "too few indices"
    let some v ← evalLit x | throwError "an index that is not a value"
    pure (r.scalarJson t v, rest)
where
  recordJson (fields : List (String × Json)) : Json :=
    Json.mkObj [("$veil", "record"), ("fields", Json.arr (fields.toArray.map fun (f, j) =>
      Json.mkObj [("name", toJson f), ("value", j)]))]

/-- The value of type `t` in the components `base ++ suffix ++ …` at `args`, read with `get`. -/
partial def valueJson (get : String → Option Expr) (base suffix : String) (t : Ty) (args : List Expr) :
    MetaM Json := do
  let c := base ++ suffix
  if isScalar t then return r.scalarJson t (← r.leaf get c t args)
  match t with
  | .list elem =>
    let some f := get (c ++ lengthSuffix)
      | throwError "the model's list length {c} is missing"
    let some (.int n) ← evalLit (mkAppN f args.toArray)
      | throwError "the model's list length {c} could not be read"
    if n < 0 then throwError "the model's list length {c} is negative: {n}"
    if n > indexLimit then throwError "the model's list {c} has {n} elements (limit {indexLimit})"
    let values ← (_root_.List.range n.toNat).mapM fun i =>
      valueJson get base (suffix ++ cellsSuffix) elem (args ++ [toExpr (Int.ofNat i)])
    pure (Json.arr values.toArray)
  | .record _ =>
    let fields ← (fieldsOf t).mapM fun (f, ft) => do
      pure (Json.mkObj [("name", toJson f), ("value", ← valueJson get base (suffix ++ fieldSuffix f) ft args)])
    pure (Json.mkObj [("$veil", "record"), ("fields", Json.arr fields.toArray)])
  | .tup _ =>
    tupleJson <$> (fieldsOf t).mapM fun (f, ft) => valueJson get base (suffix ++ fieldSuffix f) ft args
  | .sum row =>
    let row := sumRow row
    let some label := r.label (tagRow row) (← r.leaf get (c ++ tagSuffix) (.sum (tagRow row)) args)
      | throwError "the tag of {c} is not a label"
    let payload ← match row.fields.lookup label with
      | some p => if isUnit p then pure #[] else do
        pure #[Json.mkObj [("value", ← valueJson get base (suffix ++ fieldSuffix label) p args)]]
      | none => throwError "no variant {label}"
    pure (Json.mkObj [("$veil", "ctor"), ("name", toJson label), ("args", Json.arr payload)])
  | .set (.sum row) =>
    let row := sumRow row
    if isEnum row then return ← readSet c (.sum row)
    let elems ← row.fields.flatMapM fun (l, p) => do
      let rel := c ++ fieldSuffix l
      let ctor (args : Array Json) := Json.mkObj [("$veil", "ctor"), ("name", toJson l), ("args", Json.arr args)]
      if isUnit p then
        pure (if (← r.leaf get rel .bool args) == .bool true then [ctor #[]] else [])
      else
        let tys ← ofExcept (indexTys p)
        (← r.exhaustiveTuples tys rel).filterMapM fun xs => do
          if (← r.leaf get rel .bool (args ++ xs)) != .bool true then return none
          pure (some (ctor #[Json.mkObj [("value", (← r.indexJson p xs).1)]]))
    pure (Json.mkObj [("$veil", "set"), ("elements", Json.arr elems.toArray)])
  | .set e => readSet c e
  | .fn k v =>
    unless (get (c ++ keysSuffix)).isSome do
      throwError "the model's map domain {c} is missing"
    let tys ← ofExcept (indexTys k)
    let mut count := 1
    for ty in tys do
      if ty matches .int | .const _ then
        throwError "the model's map domain {c} has non-enumerable keys"
      let cs ← r.candidates ty
      if cs.isEmpty then throwError "the model's map domain {c} has unreadable keys"
      count := count * cs.length
      if count > indexLimit then throwError "the model's map domain {c} exceeds the witness index limit"
    let entries ← (← r.tuples tys).filterMapM fun xs => do
      if (← r.leaf get (c ++ keysSuffix) .bool (args ++ xs)) != .bool true then return none
      pure (some (Json.mkObj [("key", (← r.indexJson k xs).1), ("value", ← valueJson get base (suffix ++ entrySuffix v) v (args ++ xs))]))
    pure (Json.mkObj [("$veil", "map"), ("entries", Json.arr entries.toArray)])
  | _ => throwError "a value of type {repr t}"
where
  ofExcept {α : Type} (x : Except String α) : MetaM α := match x with
    | .ok a => pure a
    | .error e => throwError e
  readSet (c : String) (e : Ty) : MetaM Json := do
    let elems ← (← r.exhaustiveTuples (← ofExcept (indexTys e)) c).filterMapM fun xs => do
      if (← r.leaf get c .bool (args ++ xs)) != .bool true then return none
      pure (some (← r.indexJson e xs).1)
    pure (Json.mkObj [("$veil", "set"), ("elements", Json.arr elems.toArray)])

/-- A state: each state variable's value, read with `get`, by its field. -/
def stateJson (get : String → Option Expr) : MetaM Json := do
  let fields ← r.info.vars.mapM fun (_, field, t) => do
    pure (Json.mkObj [("name", toJson field), ("value", ← r.valueJson get field "" t [])])
  pure (Json.mkObj [("fields", Json.arr fields.toArray)])

end Reader

/-- The states `states` of a model, each by the values of its components, as Quint states, with `th` the
values of the immutable components and `others` the rest of the model. -/
private def readStates (info : ModuleInfo) (ce : AnnotatedSmtModel) (states : List (Std.HashMap Name Expr))
    (th : Std.HashMap Name Expr) (others : List Expr) : CommandElabM (Except String Json) := do
  let ints := (states.flatMap (·.toList) ++ th.toList).flatMap (fun (_, e) => intsIn e) ++ others.flatMap intsIn
  let ints := match ints.min?, ints.max? with
    | some lo, some hi =>
      if hi - lo < 200 then (_root_.List.range (hi - lo + 1).toNat).map (lo + Int.ofNat ·) else ints.eraseDups
    | _, _ => [0]
  let strSize := ((← parseSortsFromModel ce.raw).get? `str).bind fun ty => match ty with
    | .app (.const ``Fin _) n => n.nat?
    | _ => none
  let assignments ← parseEnumAssignmentsFromModel ce.raw
  let enumLabels := info.veilEnums.map fun (labels, sort) =>
    (labels, ((assignments.get? (Name.toEnumInst sort)).getD {}).toList.map fun (l, i) => (Int.ofNat i, l.getString!))
  let ctx := ce.raw.ctx.toExprWithCtx (mkConst ``True)
  ctx.runMetaM fun _ => do
    let strNames ← info.strConsts.filterMapM fun (lit, c) => do
      match th.get? c with
      | some e => pure ((← evalLit e).bind fun | .int k => some (k, lit) | _ => none)
      | none => pure none
    let r : Reader := { info, strNames, strSize := strSize.getD 0, enumLabels, ints }
    try
      let js ← states.mapM fun fields => r.stateJson (fields.get? <| Name.mkSimple ·)
      pure (.ok (Json.arr js.toArray))
    catch e => pure (.error (← e.toMessageData.toString))

/-- The states of the counterexample `ce` to a check of `act` in the module `mod`: before the step, and after
it when the model has it. At the initializer, the state it reaches: the one after it when the model has it,
else, when `ModuleInfo.initEquations` states its assignments as equations, the one before it. -/
private def statesOf (mod : Veil.Module) (info : ModuleInfo) (act : Name) (ce : AnnotatedSmtModel) :
    CommandElabM (Option (Except String Json)) := do
  let (pre, post, th, params, extras) ← classifyModelValues ce.raw mod act
  if act != `initializer && post.isEmpty then
    return some (.error "the model has no post-state; a complete transition witness could not be decoded")
  let states ← if act != `initializer then pure [pre, post]
    else if !post.isEmpty then pure [post]
    else if info.initEquations then pure [pre]
    else return none
  some <$> readStates info ce states th (params.toList.map (·.2) ++ extras.toList.map (·.2))

/-- The model of the counterexample a verification condition's solver found. -/
private def modelOf (vc : VCResult VCMetadata SmtResult) : Option AnnotatedSmtModel := Id.run do
  for d in vc.timing.dischargers do
    if let some (.disproven (some (.sat ces)) _) := d.result then
      for ce? in ces do
        if let some ce := ce? then return some ce
  none

/-- `#quint_check_induction` checks that the initializer establishes each invariant and each action
preserves it; `#quint_check_induction initializer` only the first. -/
syntax (name := quintCheckInduction) "#quint_check_induction" (ppSpace ident)? : command

@[command_elab quintCheckInduction]
def elabQuintCheckInduction : CommandElab := fun stx => do
  let onlyInit := !stx[1].isNone
  let mod ← getCurrentModule (errMsg := "#quint_check_induction runs inside the module of a quint_module")
  let some info := (modules.getState (← getEnv)).find? mod.name
    | throwError "#quint_check_induction runs inside the module of a quint_module (smt := true)"
  let mod ← mod.ensureVerificationSpec stx
  let results ← waitFilteredSync fun
    | .induction m => !onlyInit || m.action == `initializer
    | .trace _ => false
  let conditions := results.vcs.filter fun vc => !vc.isDormant && vc.alternativeFor.isNone
  let entries ← conditions.toList.filterMapM fun vc => do
    let .induction m := vc.metadata | return none
    let status := statusOf vc results.vcs
    -- The transition-style alternative has the state after the step as well.
    let alt := results.vcs.find? fun a => a.alternativeFor == some vc.id
    let states : Option (Except String Json) ← match (alt.bind modelOf) <|> modelOf vc with
      | some ce => statesOf mod info m.action ce
      | none => pure none
    pure <| some <| Json.mkObj [
      ("invariant", toJson m.property.toString),
      ("action", toJson m.action.toString),
      ("status", match status with | some s => toJson s | none => Json.null),
      ("states", match states with | some (.ok j) => j | _ => Json.null),
      ("unreadable", match states with | some (.error e) => toJson e | _ => Json.null),
      ("reasons", toJson ((alt.map reasons).getD [] ++ reasons vc))]
  logInfo m!"{marker} {(Json.mkObj [("conditions", Json.arr entries.toArray)]).compress}"

end Quint.Induction
