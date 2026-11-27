module

public meta import Quint.Embed

/-! The SMT encoding of a spec, which `quint_module … (smt := true)` emits: every value scalarized, stored as
the scalars an SMT solver reasons about, as Apalache encodes TLA+, where `Quint.Embed` keeps the Lean values a
model checker runs.

- `int` is `Int`, `bool` a proposition, stored as a `Bool`, `str` an uninterpreted sort with one constant
  per string literal, pairwise distinct, an enumeration a Veil `enum` (`veilEnums`), and a declared type
  an uninterpreted sort.
- A record or a tuple is one component per field. A sum is a tag, of an enumeration of its labels, and the
  components of each variant's payload, which matter only while the tag names that variant.
- A set is a `Bool` relation over the components of its elements, one per variant for a set of a sum. A
  map is a relation over the components of its keys that holds of its keys, and the components of its
  value, as functions of the key's.

A map's value at a key it lacks is unspecified, as Apalache's is: `get` there reads a value that every check
holds for whichever it is, and never refuses the read. The value is free where a map is built (`Map`,
`setToMap`, `mapBy`) and where `set` or `setBy` updates a key that the map lacks (`unspecified`), and an
update of another key keeps it, as an Apalache array keeps it. `Map(1 -> 9).get(2) == 9` is then not proved,
and `m.get(k) == m.get(k)` is.

lean-smt takes none of the Lean values `Quint.Embed` writes: it declares a structure projection as an
uninterpreted function, and fails on a string literal and on `Std.ExtTreeMap`.

An expression is translated where it is used, as Apalache does: a definition is inlined at each use, a set,
a map or an operator stays an expression (`Val.lazy`) until a membership, a lookup or a quantifier reads
it, and a quantifier, a `size` or a `map` over a set whose elements are known, a literal set or a range
with constant bounds, is expanded over them. -/

public section

namespace Quint

/-- Chunked function defaults keep wide first-order selector signatures within Lean's
standard typeclass synthesis budget. This instance imposes no constraint on a selector. -/
instance (priority := 1100) smtWideFunctionInhabited [Inhabited β] :
    Inhabited (α₁ → α₂ → α₃ → α₄ → α₅ → α₆ → α₇ → α₈ → β) where
  default := fun _ _ _ _ _ _ _ _ => default

end Quint

end

public meta section

namespace Quint.Smt

open Lean Elab Command Term
open IR (Ty Row isUnit)
open Embed

/-- A value. -/
inductive Val where
  /-- A boolean, as a proposition. -/
  | prop (p : Term)
  /-- An integer, a string, a value of an enumeration or of a declared type. -/
  | term (t : Term)
  /-- A record or a tuple, by field name, a tuple's numbered from 1. -/
  | record (fields : List (String × Val))
  /-- A value of the sum type `row`, which is not an enumeration: its tag, and the payloads of the variants
  it may be. -/
  | sum (row : Row) (tag : Term) (payloads : List (String × Val))
  /-- A set, map or operator `e` not read yet, with the values of the names it reads from where it was
  written and the types that place instantiates. -/
  | lazy (e : IR.Expr) (env : List (String × Val)) (σ : IR.TySubst)
  /-- A set or map of type `ty` in the components `base ++ suffix ++ …`, at the index arguments `args`.
  `state` when `base` is a state variable, whose reads an action tracks. -/
  | held (base : String) (state : Bool) (suffix : String) (ty : Ty) (args : List Term)
  /-- A set or map that is `a` when `c` holds, else `b`. -/
  | cond (c : Term) (a b : Val)
  /-- Quint's `Int`, `Nat` or `Bool`. -/
  | builtinSet (name : String)
  /-- A map whose keys are the set `keys` and whose values are those of the map `values` at them, as a map
  chosen from `setOfMaps(keys, …)` is. -/
  | mapOf (keys values : Val)
  /-- A finite relation certified to be functional, with optional membership guards. -/
  | finiteMap (keyTy valueTy : Ty) (entries : List (Option Term × Val × Val))
  | listLit (values : List Val)
  | listAppend (xs value : Val)
  | listConcat (xs ys : Val)
  | listFiltered (entries : List (Term × Val))
  | listWindow (xs : Val) (start length : Term)
  | listUpdate (xs : Val) (index : Term) (value : Val)
  | listRange (lo length : Term)
  | indexSet (length : Term)
  /-- An index certified by the surrounding quantifier over this length. -/
  | listIndex (index length : Term)
  deriving Inhabited

abbrev Env := List (String × Val)

/-- An element of a set whose elements are known: a condition for it to be one, when it may not be, and a
key that tells literal elements apart. -/
structure Elem where
  guard : Option Term := none
  val : Val
  key : Option String := none

/-! ## Terms -/

private def conj : List Term → M Term
  | [] => `(True)
  | [a] => pure a
  | a :: rest => do `($a ∧ $(← conj rest))

/-- `t` and, when it is a conjunction, the conjuncts it holds, as `conj` nests them: each is a fact that a
read can rely on. -/
private partial def conjuncts (t : Term) : List Term :=
  t :: match t with
    | `($a ∧ $b) => conjuncts a ++ conjuncts b
    | `(($a)) => conjuncts a
    | _ => []

private def disj : List Term → M Term
  | [] => `(False)
  | [a] => pure a
  | a :: rest => do `($a ∨ $(← disj rest))

/-- A proposition as the `Bool` a component stores. A quantifier over an infinite sort has no `Decidable`
instance, so an action that stores one does not elaborate. -/
private def toBool (p : Term) : M Term := `(decide $p)

private def iteTerm (c a b : Term) : M Term := `(if $c then $a else $b)

private def guarded (g : Option Term) (p : Term) (conjoin : Bool) : M Term :=
  match g with
  | none => pure p
  | some g => if conjoin then `($g ∧ $p) else `($g → $p)

/-! ## Types -/

/-- The fields of a record or tuple type, as `Val.record` names them, with their types. -/
def fieldsOf : Ty → List (String × Ty)
  | .record r => sortedFields r
  | .tup r => (tupleFields r).zipIdx.map fun (t, i) => (toString (i + 1), t)
  | _ => []

def isEnum (r : Row) : Bool := r.fields.all (isUnit ·.2)

/-- The row of a sum type, without the row variable Quint leaves on a sum of one variant. -/
def sumRow (r : Row) : Row := .row r.fields .empty

/-- The suffix of the component of a field, or of a variant's payload, after the value's own. -/
def fieldSuffix (f : String) : String := "_" ++ f

/-- The suffix of the tag of a sum, and of the relation that holds of a map's keys. -/
def tagSuffix : String := "_tag"
def keysSuffix : String := "_keys"

/-- A map-valued entry needs its own domain component, distinct from the outer map's. -/
def entrySuffix : Ty → String
  | .fn .. => ".mapEntry"
  | _ => ""
def lengthSuffix : String := ".listLength"
def cellsSuffix : String := ".listCells"

/-- Whether a type is one component: a boolean, an integer, a string, a declared type or an enumeration. -/
def isScalar : Ty → Bool
  | .bool | .int | .str | .const _ => true
  | .sum r => isEnum (sumRow r)
  | _ => false

/-- Types with a fixed, backend-independent total order used only to canonicalize set arguments. -/
private partial def orderedChoiceType : Ty → Bool
  | .int | .bool | .str => true
  | .sum r => r.fields.all (orderedChoiceType ·.2)
  | t@(.record _) | t@(.tup _) => (fieldsOf t).all (orderedChoiceType ·.2)
  | _ => false

private partial def choiceCodeCount : Ty → Nat
  | .sum r => if isEnum (sumRow r) then 1 else 1 + (r.fields.map (choiceCodeCount ·.2)).foldl (· + ·) 0
  | t@(.record _) | t@(.tup _) => ((fieldsOf t).map (choiceCodeCount ·.2)).foldl (· + ·) 0
  | _ => 1

private partial def hasLists : Ty → Bool
  | .list _ => true
  | .record r | .tup r | .sum r => r.fields.any (hasLists ·.2)
  | .fn _ v => hasLists v
  | _ => false

/-- The enumeration of the labels of a sum. -/
def tagRow (r : Row) : Row := .row (r.fields.map fun (l, _) => (l, .tup .empty)) .empty

/-- One component of a value: the suffix of its name, the scalar types of the index arguments it takes, and
the scalar type it holds, `bool` for a relation. -/
structure Comp where
  suffix : String
  args : List Ty
  ty : Ty

mutual
  /-- The components a value of type `t` is stored in. -/
  partial def layout (t : Ty) : Except String (List Comp) := do
    if isScalar t then return [{ suffix := "", args := [], ty := t }]
    match t with
    | .record _ | .tup _ =>
      (fieldsOf t).flatMapM fun (f, ft) => do
        pure ((← layout ft).map fun c => { c with suffix := fieldSuffix f ++ c.suffix })
    | .sum r =>
      let r := sumRow r
      let tag : Comp := { suffix := tagSuffix, args := [], ty := .sum (tagRow r) }
      let payloads ← r.fields.flatMapM fun (l, p) => do
        if isUnit p then pure [] else
        pure ((← layout p).map fun c => { c with suffix := fieldSuffix l ++ c.suffix })
      pure (tag :: payloads)
    | .set (.sum r) =>
      let r := sumRow r
      if isEnum r then return [{ suffix := "", args := [.sum r], ty := .bool }]
      r.fields.mapM fun (l, p) => do
        pure { suffix := fieldSuffix l, args := ← if isUnit p then pure [] else indexTys p, ty := .bool }
    | .set e => pure [{ suffix := "", args := ← indexTys e, ty := .bool }]
    | .fn k v =>
      let ks ← indexTys k
      let keys : Comp := { suffix := keysSuffix, args := ks, ty := .bool }
      pure (keys :: (← layout v).map fun c => { c with suffix := entrySuffix v ++ c.suffix, args := ks ++ c.args })
    | .list e =>
      pure ({ suffix := lengthSuffix, args := [], ty := .int } ::
        (← layout e).map fun c => { c with suffix := cellsSuffix ++ c.suffix, args := .int :: c.args })
    | _ => throw s!"a value of type {repr t} in the SMT encoding"

  /-- The scalar types of the components of a set's element or a map's key, which index a relation or a
  function. -/
  partial def indexTys (t : Ty) : Except String (List Ty) := do
    if isScalar t then return [t]
    match t with
    | .record _ | .tup _ => (fieldsOf t).flatMapM fun (_, ft) => indexTys ft
    | .sum _ => throw "a sum with payloads as a key of a map or inside an element of a set"
    | _ => throw "a non-scalar collection as an element of a set or a key of a map"
end

/-- The enumeration of the labels of `r`, declared before the module. -/
private def tagType (r : Row) : M Ident := declareSum (tagRow r)

/-- The uninterpreted sort of `str`. -/
private def strIdent : Ident := mkIdent `str

private def tagCtor (r : Row) (label : String) : M Term := do
  let ty ← tagType r
  -- A Veil `enum` opens its labels as constants of the module.
  if (← read).enums.contains (tyKey (.sum (tagRow r))) then return mkIdent (Name.mkSimple (← escaped label))
  pure (mkIdent (ty.getId ++ Name.mkSimple label))

/-- The sort of a scalar type. -/
private def sortOf : Ty → M Term
  | .bool => pure (mkIdent `Bool)
  | .int => pure (mkIdent `Int)
  | .str => pure strIdent
  | .const n => pure (mkIdent (Name.mkSimple n))
  | .sum r => do pure (← tagType (sumRow r))
  | t => throwError "quint_module: {repr t} is not a scalar"

private def ofExcept (r : Except String α) : M α :=
  match r with
  | .ok a => pure a
  | .error e => unsupported e

/-- The sorts of the components of a set's element or a map's key. -/
private def indexSorts (t : Ty) : M (List Term) := do (← ofExcept (indexTys t)).mapM sortOf

/-! ## Values -/

/-- The term of the component `base ++ suffix` at `args`: inside an action, a state variable's field is
recorded as read, and read from the local holding its value before the step when that is in `pre`. -/
private def compTerm (base : String) (state : Bool) (suffix : String) (args : List Term) : M Term := do
  let c := (← escaped base) ++ suffix
  let mut id := mkIdent (Name.mkSimple c)
  if state && (← get).inAction then
    modify fun st => { st with readVars := st.readVars.insert c }
    if (← get).pre.contains c then id := mkIdent (Name.mkSimple (c ++ "~"))
  if args.isEmpty then pure id else `($id $(args.toArray)*)

/-- The value of type `t` stored in the components `base ++ suffix ++ …` at `args`. -/
partial def heldVal (base : String) (state : Bool) (suffix : String) (t : Ty) (args : List Term) : M Val := do
  match t with
  | .bool => pure (.prop (← `($(← compTerm base state suffix args) = true)))
  | .set _ | .fn .. | .list _ => pure (.held base state suffix t args)
  | .record _ | .tup _ =>
    .record <$> (fieldsOf t).mapM fun (f, ft) => do pure (f, ← heldVal base state (suffix ++ fieldSuffix f) ft args)
  | .sum r =>
    let r := sumRow r
    if isEnum r then return .term (← compTerm base state suffix args)
    let tag ← compTerm base state (suffix ++ tagSuffix) args
    let payloads ← (r.fields.filter (!isUnit ·.2)).mapM fun (l, p) => do
      pure (l, ← heldVal base state (suffix ++ fieldSuffix l) p args)
    pure (.sum r tag payloads)
  | _ => pure (.term (← compTerm base state suffix args))

/-- The terms of the components of `v`, a value of the index type `t` (`indexSorts`). -/
partial def comps (v : Val) (t : Ty) : M (List Term) := do
  match v, t with
  | .prop p, _ => pure [← toBool p]
  | .term x, _ | .listIndex x _, _ => pure [x]
  | .record fs, _ =>
    (fieldsOf t).flatMapM fun (f, ft) => do
      match fs.lookup f with
      | some fv => comps fv ft
      | none => throwError "quint_module: no field {f}"
  | _, _ => unsupported "a set, a map or a sum with payloads as an index"

/-- The value of the index type `t` whose components are `xs`, with what is left of `xs`. -/
partial def ofComps (t : Ty) (xs : List Term) : M (Val × List Term) := do
  match t with
  | .record _ | .tup _ =>
    let mut rest := xs
    let mut fs := []
    for (f, ft) in fieldsOf t do
      let (v, r) ← ofComps ft rest
      fs := fs ++ [(f, v)]
      rest := r
    pure (.record fs, rest)
  | _ =>
    match xs with
    | x :: rest => if t matches .bool then pure (.prop (← `($x = true)), rest) else pure (.term x, rest)
    | [] => throwError "quint_module: too few components"

/-- `k`, with the variables `bs` of the given sorts bound around what it translates. -/
private def withBinders (bs : List (Ident × Term)) (k : M α) : M α :=
  withReader (fun c => { c with smtBinders := c.smtBinders ++ bs.map fun (x, s) => ((⟨x.raw⟩ : Term), s) }) k

/-- Fresh binders for the components of the index type `t`, and the value they make up. -/
private def binders (t : Ty) : M (List (Ident × Term) × Val) := do
  let sorts ← indexSorts t
  let xs ← sorts.mapM fun _ => freshName "x"
  let ts : List Term := xs.map fun x => ⟨x.raw⟩
  pure (xs.zip sorts, (← ofComps t ts).1)

/-- `∀` or `∃` over the values of the type `t`: for a sum with payloads, over each variant's payload. -/
private def quantify (isForall : Bool) (t : Ty) (body : Val → M Term) : M Term := do
  let over (bs : List (Ident × Term)) (p : Term) : M Term :=
    bs.foldrM (fun (x, s) acc => if isForall then `(∀ $x:ident : $s, $acc) else `(∃ $x:ident : $s, $acc)) p
  match t with
  | .sum r =>
    let r := sumRow r
    if isEnum r then
      let (bs, v) ← binders t
      return ← over bs (← withBinders bs (body v))
    let cases ← r.fields.mapM fun (l, p) => do
      let tag ← tagCtor r l
      if isUnit p then body (.sum r tag [])
      else
        let (bs, v) ← binders p
        over bs (← withBinders bs (body (.sum r tag [(l, v)])))
    if isForall then conj cases else disj cases
  | _ =>
    let (bs, v) ← binders t
    over bs (← withBinders bs (body v))

/-- A value of type `t` that nothing constrains. It is a function of the variables bound around it
(`Ctx.smtBinders`), so that it may differ wherever they do: for each value of a quantifier's variable, a map
can be built and read at a key of its own. An action picks it, so that each step picks again. An invariant or
an assumption reads a function of the theory, which every check and `holds%` quantify over: each check is of
one step, so a value the theory fixes for every step is still free in each. -/
def unspecified (t : Ty) : M Val := do
  let args := (← read).smtBinders
  let .str _ base := (← freshName ".quint.unspecified").getId | throwError "quint_module: a fresh name"
  let .ok cs := layout t
    | unsupported "a value at a key that a map may lack, of a type that the SMT encoding does not store"
  for c in cs do
    let entry := (mkIdent (Name.mkSimple (base ++ c.suffix)), args.map (·.2) ++ (← c.args.mapM sortOf),
      ← sortOf c.ty, c.ty matches .bool)
    if (← get).inAction then modify fun st => { st with smtPicks := st.smtPicks.push entry }
    else modify fun st => { st with smtUnspecified := st.smtUnspecified.push entry }
  heldVal base false "" t (args.map (·.1))

/-- The integer a term written by `mkIntLit` is. -/
private def intOfTerm? (t : Term) : Option Int :=
  match t with
  | `(($n:num : Int)) => some n.getNat
  | `((-$n:num : Int)) => some (-(n.getNat : Int))
  | _ => none

/-- A deliberately small, syntax-directed certificate; unknown propositions stay unknown. -/
private partial def knownTruth (p : Term) : Option Bool :=
  match p with
  | `(True) => some true
  | `(False) => some false
  | `(($p)) => knownTruth p
  | `($a = $b) => if a == b then some true else do
      return (← intOfTerm? a) == (← intOfTerm? b)
  | `(¬ $p) => (!·) <$> knownTruth p
  | `($a ∧ $b) =>
      match knownTruth a, knownTruth b with
      | some false, _ | _, some false => some false
      | some true, some true => some true
      | _, _ => none
  | `($a ∨ $b) =>
      match knownTruth a, knownTruth b with
      | some true, _ | _, some true => some true
      | some false, some false => some false
      | _, _ => none
  | `($a → $b) =>
      match knownTruth a, knownTruth b with
      | some false, _ | _, some true => some true
      | some true, some false => some false
      | _, _ => none
  | `($a ↔ $b) => if a == b then some true else do
      return (← knownTruth a) == (← knownTruth b)
  | _ => none

/-- The integer an expression folds to, through the values of the spec and of `env`: `N - 1` for
`pure val N = 3`. -/
partial def foldInt (e : IR.Expr) (env : Env) : M (Option Int) := do
  let both (a b : IR.Expr) (f : Int → Int → Int) : M (Option Int) := do
    let (x, y) := (← foldInt a env, ← foldInt b env)
    pure (do pure (f (← x) (← y)))
  match e with
  | .int _ i => pure (some i)
  | .app _ "iadd" [a, b] => both a b (· + ·)
  | .app _ "isub" [a, b] => both a b (· - ·)
  | .app _ "imul" [a, b] => both a b (· * ·)
  | .app _ "iuminus" [a] => pure ((← foldInt a env).map (- ·))
  | .name _ n =>
    if let some v := env.lookup n then
      return match v with
        | .term t => intOfTerm? t
        | _ => none
    match (← read).lookup n with
    | some (.def _ _ q body _) =>
      if ["val", "pureval", "def", "puredef"].contains q then foldInt body [] else pure none
    | _ => pure none
  | _ => pure none

/-- A key that tells a literal element apart from another: an integer, a string or a variant without
payload. -/
private def litKey (e : IR.Expr) (env : Env) : M (Option String) := do
  if let some i ← foldInt e env then return some s!"i{i}"
  match e with
  | .str _ s => pure (some s!"s{s}")
  | .bool _ b => pure (some s!"b{b}")
  | _ =>
    match (← read).asCtor e with
    | some (l, none) => pure (some s!"c{l}")
    | _ => pure none

/-- The largest range of constants whose elements a quantifier or a `size` is expanded over. -/
private def rangeLimit : Int := 1000

/-- The substitution of the type variables of the definition `defId` at a use of type `useType`. -/
private def substAt (defId : Nat) (useType : Option Ty) : M IR.TySubst := do
  pure <| match (← read).output.types.get? defId, useType with
    | some scheme, some t => matchTy {} scheme t
    | _, _ => {}

private def withSubst (σ : IR.TySubst) (k : M α) : M α :=
  withReader (fun c => { c with tySubst := σ }) k

private def opOf : IR.Expr → String
  | .app _ op _ => op
  | .name _ n => n
  | _ => "expression"

mutual
  /-- The value of `e`, in the context of the values of `env`. -/
  partial def eval (e : IR.Expr) (env : Env) : M Val := do
    match e with
    | .bool _ b => pure (.prop (← if b then `(True) else `(False)))
    | .int _ i => pure (.term (← mkIntLit i))
    | .str _ s =>
      match (← read).strConsts.get? s with
      | some c => pure (.term (mkIdent c))
      | none => throwError "quint_module: no constant for the string literal {s}"
    | .name id n => resolve id n env
    | .lambda .. => pure (.lazy e env (← read).tySubst)
    | .letE _ _ n q value body =>
      if q == "nondet" then unsupported "nondet outside an action"
      eval body ((n, ← eval value env) :: env)
    | .app id op args => evalApp id op args env

  /-- The value a name stands for: a local, a state variable or constant, a definition inlined, or one of
  the builtin sets `Int`, `Nat` and `Bool`. -/
  partial def resolve (id : Nat) (n : String) (env : Env) : M Val := do
    if let some v := env.lookup n then return v
    let ctx ← read
    match ctx.lookup n with
    | some (.var _ _ t) => heldVal n true "" t []
    | some (.const _ _ t) => heldVal n false "" t []
    | some (.def defId _ q body _) =>
      if q == "action" || q == "nondet" || q == "run" then unsupported s!"the action {n} in an expression"
      let σ ← substAt defId (← typeOf? id)
      match body with
      | .lambda .. => pure (.lazy body [] σ)
      | _ => withSubst σ (eval body [])
    | _ =>
      if ["Int", "Nat", "Bool"].contains n then pure (.builtinSet n)
      else unsupported s!"the name {n}"

  /-- `f` applied to `args`: a lambda, a local operator, or a definition inlined. -/
  partial def apply (f : IR.Expr) (env : Env) (args : List Val) : M Val := do
    match f with
    | .lambda _ params _ body =>
      if params.length != args.length then unsupported s!"an operator of {params.length} parameters applied to {args.length}"
      eval body (((params.map (·.2)).zip args) ++ env)
    | .name id n =>
      match ← resolve id n env with
      | .lazy g genv σ => withSubst σ (apply g genv args)
      | _ => unsupported s!"applying {n}, which is not an operator"
    | _ => unsupported "applying an expression that is not an operator"

  /-- Establish non-strict order from constants, reflexivity, or a comparison on this path. -/
  partial def ordered (lo hi : Term) : M Bool := do
    if lo == hi then return true
    if let (some a, some b) := (intOfTerm? lo, intOfTerm? hi) then return a ≤ b
    let facts := (← read).smtReadFacts
    return facts.contains (← `($lo ≤ $hi)) || facts.contains (← `($lo < $hi))

  partial def boundTerm (e : IR.Expr) (env : Env) : M Term := do
    if let some n ← foldInt e env then mkIntLit n else term e env

  partial def difference (hi lo : Term) : M Term := do
    if hi == lo then return ← mkIntLit 0
    if let (some a, some b) := (intOfTerm? hi, intOfTerm? lo) then mkIntLit (a - b) else `($hi - $lo)

  partial def certifiedIndex (iv : Val) (len : Term) : M Term := do
    match iv with
      | .listIndex index bound =>
        if bound == len then pure index else unsupported "nth with an index certified for a different list"
      | .term index => do
        let facts := (← read).smtReadFacts
        let lower := (intOfTerm? index).any (0 ≤ ·) || facts.contains (← `($(← mkIntLit 0) ≤ $index))
        let upper := (match intOfTerm? index, intOfTerm? len with
          | some k, some n => k < n
          | _, _ => false) || facts.contains (← `($index < $len))
        if lower && upper then pure index
        else unsupported "nth without a statically certified live index (use indices().forall)"
      | _ => unsupported "a non-integer list index"

  partial def readList (xs : IR.Expr) (iv : Val) (env : Env) : M Val := do
    let v ← eval xs env
    let index ← certifiedIndex iv (← listLength v)
    let .list elem ← typeOf xs.id | unsupported "read of a non-list"
    listAt v index elem none

  partial def readGuardFacts (e : IR.Expr) (env : Env) (positive : Bool) : M (List Term) := do
    if let .app _ op _ := e then
      if (env.lookup op).isSome then return []
      if let some (.def ..) := (← read).lookup op then return []
    match e with
    | .app _ "not" [a] => readGuardFacts a env (!positive)
    | .app _ "and" args =>
      if positive then return (← args.mapM (readGuardFacts · env true)).flatten
      else return []
    | .app _ "eq" [a, b] | .app _ "neq" [a, b] =>
      let equal ← eqVal (← eval a env) (← eval b env) (← typeOf a.id)
      let neq := match e with | .app _ "neq" _ => true | _ => false
      return [← if positive != neq then pure equal else `(¬ $equal)]
    | .app _ "contains" [s, k] | .app _ "in" [k, s] =>
      if positive then return [← mem (← eval s env) (← eval k env)] else return []
    | .app _ op [a, b] =>
      if !["ilt", "ilte", "igt", "igte"].contains op then return []
      let x ← term a env
      let y ← term b env
      match op, positive with
      | "ilt", true | "igte", false => return [← `($x < $y)]
      | "ilte", true | "igt", false => return [← `($x ≤ $y)]
      | "igt", true | "ilte", false => return [← `($y < $x)]
      | _, _ => return [← `($y ≤ $x)]
    | _ => return []

  partial def withReadGuard (e : IR.Expr) (env : Env) (positive : Bool) (k : M α) : M α := do
    if isAction (← read) e then unsupported "an effectful condition used to certify a list read"
    let facts ← readGuardFacts e env positive
    withReader (fun c => { c with smtReadFacts := facts ++ c.smtReadFacts }) k

  partial def prop (e : IR.Expr) (env : Env) : M Term := do
    match ← eval e env with
    | .prop p => pure p
    | _ => unsupported "a boolean that is not a proposition"

  partial def term (e : IR.Expr) (env : Env) : M Term := do
    match ← eval e env with
    | .term t | .listIndex t _ => pure t
    | _ => unsupported "a value that is not a scalar where one is expected"

  partial def evalApp (id : Nat) (op : String) (args : List IR.Expr) (env : Env) : M Val := do
    let ctx ← read
    if env.lookup op |>.isSome then return ← apply (.name id op) env (← args.mapM (eval · env))
    if let some (.def defId _ q body _) := ctx.lookup op then
      if q == "action" || q == "nondet" || q == "run" then unsupported s!"the action {op} in an expression"
      let argTypes ← args.mapM (typeOf? ·.id)
      let resType ← typeOf? id
      let useType : Option Ty := do pure (.oper (← argTypes.mapM (·)) (← resType))
      let vals ← args.mapM (eval · env)
      return ← withSubst (← substAt defId useType) (apply body [] vals)
    let p (k : M Term) : M Val := do pure (.prop (← k))
    let t (k : M Term) : M Val := do pure (.term (← k))
    match op, args with
    | "and", _ | "actionAll", _ => p do conj (← args.mapM (prop · env))
    | "or", _ | "actionAny", _ => p do disj (← args.mapM (prop · env))
    | "not", [a] => p do `(¬ $(← prop a env))
    | "assert", [a] => eval a env
    | "implies", [a, b] => p do `($(← prop a env) → $(← prop b env))
    | "iff", [a, b] => p do `($(← prop a env) ↔ $(← prop b env))
    | "eq", [a, b] => p do eqVal (← eval a env) (← eval b env) (← typeOf a.id)
    | "neq", [a, b] => p do `(¬ $(← eqVal (← eval a env) (← eval b env) (← typeOf a.id)))
    | "ite", [c, a, b] => do
      let test ← prop c env
      if let some yes := knownTruth test then return ← eval (if yes then a else b) env
      let av ← withReadGuard c env true (eval a env)
      let bv ← withReadGuard c env false (eval b env)
      iteVal test av bv (← typeOf id)
    | "iadd", [a, b] => t do `($(← term a env) + $(← term b env))
    | "isub", [a, b] => t do `($(← term a env) - $(← term b env))
    | "imul", [a, b] => t do `($(← term a env) * $(← term b env))
    | "iuminus", [a] => t do `(- $(← term a env))
    -- Normalize both signs before Euclidean division to obtain Quint's truncation.
    | "idiv", [a, b] => t do
      let av ← term a env
      let bv ← term b env
      certifyNonzero b env bv
      let aa ← iteTerm (← `(0 ≤ $av)) av (← `(- $av))
      let bb ← iteTerm (← `(0 ≤ $bv)) bv (← `(- $bv))
      let q ← `($aa / $bb)
      iteTerm (← `((0 ≤ $av) ↔ (0 ≤ $bv))) q (← `(- $q))
    | "imod", [a, b] => t do
      let av ← term a env
      let bv ← term b env
      certifyNonzero b env bv
      let aa ← iteTerm (← `(0 ≤ $av)) av (← `(- $av))
      let bb ← iteTerm (← `(0 ≤ $bv)) bv (← `(- $bv))
      let r ← `($aa % $bb)
      iteTerm (← `(0 ≤ $av)) r (← `(- $r))
    | "ipow", [a, b] => t do
      let av ← term a env
      evalPower a av b env
    | "ilt", [a, b] => p do `($(← term a env) < $(← term b env))
    | "ilte", [a, b] => p do `($(← term a env) ≤ $(← term b env))
    | "igt", [a, b] => p do `($(← term a env) > $(← term b env))
    | "igte", [a, b] => p do `($(← term a env) ≥ $(← term b env))
    | "List", _ => .listLit <$> args.mapM (eval · env)
    | "length", [xs] => t do listLength (← eval xs env)
    | "concat", [xs, ys] => return .listConcat (← eval xs env) (← eval ys env)
    | "tail", [xs] => do
      let v ← eval xs env
      let n ← listLength v
      let _ ← certifiedIndex (.term (← mkIntLit 0)) n
      let len ← if let some k := intOfTerm? n then mkIntLit (k - 1) else `($n - (1 : Int))
      return .listWindow v (← mkIntLit 1) len
    | "replaceAt", [xs, i, y] => do
      let v ← eval xs env
      let j ← certifiedIndex (← eval i env) (← listLength v)
      return .listUpdate v j (← eval y env)
    | "slice", [xs, a, b] => do
      let v ← eval xs env
      let n ← listLength v
      let lo ← certifiedIndex (← eval a env) n
      let hi ← boundTerm b env
      unless (← ordered lo hi) && (← ordered hi n) do unsupported "slice without certified ordered endpoints"
      return .listWindow v lo (← difference hi lo)
    | "range", [a, b] => do
      let (lo, hi) := (← boundTerm a env, ← boundTerm b env)
      unless ← ordered lo hi do unsupported "range without certified ordered bounds"
      return .listRange lo (← difference hi lo)
    | "indices", [xs] => return .indexSet (← listLength (← eval xs env))
    | "select", [xs, f] => do
      let v ← eval xs env
      let len ← listLength v
      let some n ← listCapacity v | unsupported "select without a justified input capacity"
      let symbolic := (intOfTerm? len).isNone
      if symbolic then checkFoldDependency f env (mapConstructor := true)
      -- Reading a filtered cell compares with every candidate's prefix count (quadratic term size).
      if n > 64 then unsupported "select exceeding the prefix-count limit of 64 candidates"
      let .list elem ← typeOf xs.id | unsupported "select on a non-list"
      let entries ← (_root_.List.range n.toNat).mapM fun (j : Nat) => do
        let x ← listAt v (← mkIntLit (Int.ofNat j)) elem none
        let .prop test ← apply f env [x] | unsupported "a non-boolean list filter"
        let live ← if symbolic then `($(← mkIntLit j) < $len ∧ $test) else pure test
        return (live, x)
      return .listFiltered entries
    | "foldl", [xs, init, f] | "foldr", [xs, init, f] => do
      let v ← eval xs env
      let len ← listLength v
      let some n ← listCapacity v | unsupported "a list fold without a justified capacity"
      let symbolic := (intOfTerm? len).isNone
      if symbolic then checkFoldDependency f env (mapConstructor := true)
      if n > rangeLimit then unsupported "a list fold exceeding the unrolling limit"
      let .list elem ← typeOf xs.id | unsupported "folding a non-list"
      let order := _root_.List.range n.toNat
      let mut acc ← eval init env
      for j in (if op == "foldl" then order else order.reverse) do
        let x ← listAt v (← mkIntLit j) elem none
        let next ← apply f env (if op == "foldl" then [acc, x] else [x, acc])
        acc ← if symbolic then iteVal (← `($(← mkIntLit j) < $len)) next acc (← typeOf init.id)
          else pure next
      return acc
    | "append", [xs, v] => return .listAppend (← eval xs env) (← eval v env)
    | "nth", [xs, i] => readList xs (← eval i env) env
    | "head", [xs] => readList xs (.term (← mkIntLit 0)) env
    | "Rec", _ => .record <$> recFields args env
    | "fieldNames", [r] => do
      let .record row ← typeOf r.id | unsupported "fieldNames of a non-record"
      if row.tailVar.isSome then unsupported "fieldNames of an open row"
      let .record _ ← eval r env | unsupported "fieldNames of an unsupported record expression"
      let names := row.fields.map fun (f, _) => IR.Expr.str id f
      return .lazy (.app id "Set" names) [] ctx.tySubst
    | "field", [r, f] => do
      let f ← strLit f
      match ← eval r env with
      | .record fs => match fs.lookup f with
        | some v => pure v
        | none => throwError "quint_module: no field {f}"
      | _ => unsupported "a field of a value that is not a record"
    | "with", [r, f, v] => do
      let f ← strLit f
      match ← eval r env with
      | .record fs => do
        let nv ← eval v env
        pure (.record (fs.map fun (g, x) => if g == f then (g, nv) else (g, x)))
      | _ => unsupported "updating a field of a value that is not a record"
    | "Tup", _ => do pure (.record (← args.zipIdx.mapM fun (a, i) => do pure (toString (i + 1), ← eval a env)))
    | "item", [tup, index] => do
      let some i ← foldInt index env | unsupported "a tuple index that is not a constant"
      match ← eval tup env with
      | .record fs => match fs.lookup (toString i) with
        | some v => pure v
        | none => throwError "quint_module: no item {i}"
      | _ => unsupported "an item of a value that is not a tuple"
    | "variant", [label, payload] => do
      let label ← strLit label
      let .sum r ← typeOf id | unsupported "a variant whose type is not a sum"
      let r := sumRow r
      let value ← eval payload env
      if isEnum r then return .term (← tagCtor r label)
      let tag ← tagCtor r label
      match (r.fields.lookup label) with
      | some pt => if isUnit pt then pure (.sum r tag []) else pure (.sum r tag [(label, value)])
      | none => throwError "quint_module: no variant {label}"
    | "matchVariant", s :: cases => matchVal (← eval s env) (← typeOf s.id) cases env (← typeOf id)
    | "Map", pairs => do
      let .fn kt vt ← typeOf id | unsupported "Map that is not a map"
      let entries ← pairs.mapM fun pair => do
        checkFoldDependency pair env (mapConstructor := true)
        let .app _ "Tup" [k, v] := pair | unsupported "a Map entry that is not a pair"
        pure (none, ← eval k env, ← eval v env)
      certifyMap kt vt entries
    | "setToMap", [s] => do
      checkFoldDependency s env (mapConstructor := true)
      let .fn kt vt ← typeOf id | unsupported "setToMap that is not a map"
      let some es ← finite (← eval s env) | unsupported "setToMap without known finite support"
      if es.length > rangeLimit.toNat then unsupported "setToMap exceeding the candidate limit"
      let entries ← es.mapM fun el => do
        let .record fs := el.val | unsupported "setToMap of a non-pair"
        let (some k, some v) := (fs.lookup "1", fs.lookup "2") | unsupported "setToMap of a non-pair"
        pure (el.guard, k, v)
      certifyMap kt vt entries
    | "mapBy", [s, f] => do
      for e in [s, f] do checkFoldDependency e env (mapConstructor := true)
      pure (.lazy (.app id op args) env ctx.tySubst)
    | "set", [m, k, v] => do
      noteMapRead (← eval m env) (← eval k env)
      discard (eval v env)
      pure (.lazy (.app id op args) env ctx.tySubst)
    | "setBy", [m, k, f] => do
      let mv ← eval m env
      let kv ← eval k env
      noteMapRead mv kv
      discard (apply f env [← mapGet mv kv (present := true)])
      pure (.lazy (.app id op args) env ctx.tySubst)
    | "put", [m, k, v] => do
      for e in [m, k, v] do discard (eval e env)
      pure (.lazy (.app id op args) env ctx.tySubst)
    | "get", [m, k] => do
      let mv ← eval m env
      let kv ← eval k env
      noteMapRead mv kv
      mapGet mv kv (valueTy := ← typeOf id)
    | "in", [x, s] | "contains", [s, x] => p do mem (← eval s env) (← eval x env)
    | "subseteq", [a, b] => p do
      let .set elem ← typeOf a.id | unsupported "subseteq of a value that is not a set"
      quantIn true (← eval a env) elem fun x => do mem (← eval b env) x
    | "forall", [s, f] | "exists", [s, f] => p do
      let .set elem ← typeOf s.id | unsupported s!"{op} over a value that is not a set"
      quantIn (op == "forall") (← eval s env) elem fun x => do
        match ← apply f env [x] with
        | .prop q => pure q
        | _ => unsupported s!"{op} of an operator that is not a predicate"
    | "chooseSome", [s] => do
      let .set elem ← typeOf s.id | unsupported "chooseSome of a non-set"
      chooseFinite (← eval s env) elem
    | "fold", [s, init, f] => setFold s init f env
    | "size", [s] => t do
      let .set elem ← typeOf s.id | unsupported "the size of a value that is not a set"
      size (← eval s env) elem
    | "isFinite", [s] => p do
      match ← eval s env with
      | .builtinSet "Int" | .builtinSet "Nat" => `(False)
      | .indexSet _ | .lazy (.app _ "to" _) .. => `(True) -- finite even with symbolic bounds
      | v =>
        if (← finite v).isSome then `(True)
        else unsupported "isFinite of a set without a known finite domain"
    | "filter", [s, f] | "map", [s, f] => do
      let source ← eval s env
      if let some candidates ← finite source then
        for el in candidates do discard (apply f env [el.val])
      else checkFoldDependency f env (mapConstructor := true)
      pure (.lazy (.app id op args) env ctx.tySubst)
    | "Set", _ | "to", _ | "union", _ | "intersect", _ | "exclude", _
    | "flatten", _ | "tuples", _ | "setOfMaps", _ | "keys", _ | "powerset", _ => do
      for arg in args do discard (eval arg env)
      pure (.lazy (.app id op args) env ctx.tySubst)
    | _, _ => unsupported s!"{op} in the SMT encoding"

  partial def recFields : List IR.Expr → Env → M (List (String × Val))
    | f :: v :: rest, env => do pure ((← strLit f, ← eval v env) :: (← recFields rest env))
    | [], _ => pure []
    | _, _ => unsupported "a record with an odd number of arguments"

  /-- Definedness is certified, never inserted as a transition guard. -/
  partial def certifyNonzero (e : IR.Expr) (env : Env) (v : Term) : M Unit := do
    if let some n ← foldInt e env then
      if n != 0 then return
    let zero ← mkIntLit 0
    let facts := (← read).smtReadFacts
    let forward ← `($v = $zero)
    let backward ← `($zero = $v)
    if facts.contains (← `(¬ $forward)) || facts.contains (← `(¬ $backward)) ||
        facts.contains (← `($zero < $v)) || facts.contains (← `($v < $zero)) then return
    unsupported "arithmetic without a certified nonzero operand"

  /-- Conditional exponents retain each arm's definedness context. -/
  partial def evalPower (base : IR.Expr) (av : Term) (exponent : IR.Expr) (env : Env) : M Term := do
    if let .app _ "ite" [c, a, b] := exponent then
      let test ← prop c env
      if let some yes := knownTruth test then return ← evalPower base av (if yes then a else b) env
      let x ← withReadGuard c env true (evalPower base av a env)
      let y ← withReadGuard c env false (evalPower base av b env)
      return ← iteTerm test x y
    let some n ← foldInt exponent env | do
      let ev ← term exponent env
      let bv ← foldInt base env
      let zero ← mkIntLit 0
      if bv == some 0 then
        unless (← read).smtReadFacts.contains (← `($zero < $ev)) do
          unsupported "a zero power without a certified positive exponent"
        return zero
      if bv == some 1 || bv == some (-1) then
        unless ← ordered zero ev do unsupported "a power without a certified nonnegative exponent"
        if bv == some 1 then return ← mkIntLit 1
        return ← iteTerm (← `($ev % (2 : Int) = (0 : Int))) (← mkIntLit 1) (← mkIntLit (-1))
      unsupported "a power with an exponent that is not a constant"
    if n < 0 then unsupported "a negative power"
    if n == 0 then certifyNonzero base env av
    powerTerm av n.toNat

  /-- Exponentiation by squaring avoids linear expansion for closed exponents. -/
  partial def powerTerm (a : Term) (n : Nat) : M Term := do
    if n == 0 then return ← mkIntLit 1
    if n == 1 then return a
    let half ← powerTerm a (n / 2)
    let x ← freshName ".quint.power"
    let square ← `($x:ident * $x:ident)
    let body ← if n % 2 == 0 then pure square else `($square * $a)
    `(let $x:ident : Int := $half; $body)

  /-- `match` on the value `s` of type `sTy`, with `cases` its labels and lambdas, of result type `rTy`: the
  case of `s`'s variant, by its tag. -/
  partial def matchVal (s : Val) (sTy : Ty) (cases : List IR.Expr) (env : Env) (rTy : Ty) : M Val := do
    let .sum r := sTy | unsupported "matching on a value that is not a sum"
    let r := sumRow r
    let tag ← match s with
      | .term t => pure t
      | .sum _ tag _ => pure tag
      | _ => unsupported "matching on a value that is not a sum"
    let knownLabel ← r.fields.findSomeM? fun (l, _) => do
      return if tag == (← tagCtor r l) then some l else none
    -- A constructed scrutinee evaluates only its selected eliminator.
    if let some label := knownLabel then
      let rec select : List IR.Expr → M Val
        | l :: f :: rest => do
          let name ← strLit l
          if name == label || name == "_" then
            let payload := match s with
              | .sum _ _ ps => (ps.lookup name).getD (.record [])
              | _ => .record []
            apply f env [payload]
          else select rest
        | _ => unsupported "a match without a selected case"
      return ← select cases
    -- The last case is the one whose label every other case has tested.
    let rec go : List IR.Expr → M Val
      | label :: f :: rest => do
        let l ← strLit label
        let payload : Val := match s with
          | .sum _ _ ps => (ps.lookup l).getD (.record [])
          | _ => .record []
        let body ← apply f env [payload]
        if l == "_" || rest.isEmpty then pure body
        else iteVal (← `($tag = $(← tagCtor r l))) body (← go rest) rTy
      | _ => unsupported "a match case that is not a label and a lambda"
    go cases

  /-- Inject a narrowed constructor row into the destination tag sort. -/
  partial def retag (source target : Row) (tag : Term) : M Term := do
    if tyKey (.sum (tagRow source)) == tyKey (.sum (tagRow target)) then return tag
    for (l, _) in source.fields do
      if tag == (← tagCtor source l) then return ← tagCtor target l
    let some (first, _) := source.fields.head? | unsupported "an empty sum row"
    unless source.fields.all (fun (l, _) => (target.fields.lookup l).isSome) do
      unsupported "a sum tag outside its destination row"
    let mut result ← tagCtor target first
    for (l, _) in source.fields do
      result ← iteTerm (← `($tag = $(← tagCtor source l))) (← tagCtor target l) result
    return result

  /-- `a = b`, for values of type `t`. -/
  partial def eqVal (a b : Val) (t : Ty) : M Term := do
    match a, b with
    | .prop p, .prop q => `($p ↔ $q)
    | .term x, .term y | .listIndex x _, .term y | .term x, .listIndex y _
    | .listIndex x _, .listIndex y _ => `($x = $y)
    | .record fs, .record gs =>
      conj (← (fieldsOf t).mapM fun (f, ft) => do
        match fs.lookup f, gs.lookup f with
        | some x, some y => eqVal x y ft
        | _, _ => throwError "quint_module: no field {f}")
    | .sum r ta pa, .sum s tb pb =>
      let cases ← r.fields.filterMapM fun (l, pt) => do
        if (s.fields.lookup l).isNone then return none
        let tags ← `($ta = $(← tagCtor r l) ∧ $tb = $(← tagCtor s l))
        let payload ← match pa.lookup l, pb.lookup l with
          | some x, some y => eqVal x y pt
          | _, _ => `(True) -- A missing payload's tag cannot be active.
        return some (← `($tags ∧ $payload))
      disj cases
    | _, _ =>
      match t with
      | .list elem =>
        let (la, lb) := (← listLength a, ← listLength b)
        let lengths ← `($la = $lb)
        if intOfTerm? la == some 0 || intOfTerm? lb == some 0 then return lengths
        if let some n := intOfTerm? la then
          if 0 ≤ n && n ≤ rangeLimit then
            let cells ← (_root_.List.range n.toNat).mapM fun j => do
              let i ← mkIntLit (Int.ofNat j)
              eqVal (← listAt a i elem none) (← listAt b i elem none) elem
            return ← conj (lengths :: cells)
        let i ← freshName ".quint.listEq"
        let it : Term := ⟨i.raw⟩
        let cells ← withBinders [(i, mkIdent `Int)] do
          eqVal (← listAt a it elem none) (← listAt b it elem none) elem
        `($lengths ∧ ∀ $i:ident : Int, 0 ≤ $it ∧ $it < $la → $cells)
      | .set elem =>
        -- Candidate support is exhaustive for these expressions, not a bound on state.
        if let (some xs, some ys) := (← finite a, ← finite b) then
          let left ← xs.mapM fun el => do guarded el.guard (← mem b el.val) false
          let right ← ys.mapM fun el => do guarded el.guard (← mem a el.val) false
          return ← conj (left ++ right)
        quantify true elem fun x => do `($(← mem a x) ↔ $(← mem b x))
      | .fn k v =>
        if let (some xs, some ys) := (← finiteKeys a, ← finiteKeys b) then
          let left ← xs.mapM fun el => do guarded el.guard (← mapKeys b el.val) false
          let right ← ys.mapM fun el => do guarded el.guard (← mapKeys a el.val) false
          let vals ← if xs.isEmpty || ys.isEmpty then pure [] else
            xs.mapM fun el => do
              guarded el.guard (← eqVal (← mapGet a el.val true) (← mapGet b el.val true) v) false
          return ← conj (left ++ right ++ vals)
        let keys ← quantify true k fun x => do `($(← mapKeys a x) ↔ $(← mapKeys b x))
        let vals ← if (← finiteKeys a).any List.isEmpty || (← finiteKeys b).any List.isEmpty then `(True) else
          quantify true k fun x => do
            `($(← mapKeys a x) → $(← eqVal (← mapGet a x true) (← mapGet b x true) v))
        `($keys ∧ $vals)
      | _ => unsupported "comparing values of different shapes"

  /-- `if c then a else b`, for values of type `t`. -/
  partial def iteVal (c : Term) (a b : Val) (t : Ty) : M Val := do
    match a, b with
    | .prop p, .prop q => pure (.prop (← `(($c → $p) ∧ (¬ $c → $q))))
    | .term x, .term y | .listIndex x _, .term y | .term x, .listIndex y _
    | .listIndex x _, .listIndex y _ => pure (.term (← iteTerm c x y))
    | .record fs, .record gs =>
      .record <$> (fieldsOf t).mapM fun (f, ft) => do
        match fs.lookup f, gs.lookup f with
        | some x, some y => pure (f, ← iteVal c x y ft)
        | _, _ => throwError "quint_module: no field {f}"
    | .sum ra ta pa, .sum rb tb pb =>
      let .sum target := t | unsupported "a conditional sum without a sum type"
      let r := sumRow target
      let ta ← retag ra r ta
      let tb ← retag rb r tb
      -- A payload one side does not have is one its tag never names.
      let payloads ← r.fields.filterMapM fun (l, pt) => do
        match pa.lookup l, pb.lookup l with
        | some x, some y => pure (some (l, ← iteVal c x y pt))
        | some x, none | none, some x => pure (some (l, x))
        | none, none => pure none
      pure (.sum r (← iteTerm c ta tb) payloads)
    | _, _ => pure (.cond c a b)

  partial def listLength (v : Val) : M Term := do
    match v with
    | .held base state suffix (.list _) args => compTerm base state (suffix ++ lengthSuffix) args
    | .listLit vs => mkIntLit vs.length
    | .listRange _ n => pure n
    | .listFiltered es =>
      es.foldlM (fun count (p, _) => `($count + (if $p then (1 : Int) else (0 : Int)))) (← mkIntLit 0)
    | .listWindow _ _ n => pure n
    | .listUpdate xs .. => listLength xs
    | .listConcat a b =>
      let (la, lb) := (← listLength a, ← listLength b)
      if let (some na, some nb) := (intOfTerm? la, intOfTerm? lb) then return ← mkIntLit (na + nb)
      `($la + $lb)
    | .listAppend xs _ =>
      let n ← listLength xs
      if let some k := intOfTerm? n then mkIntLit (k + 1) else `($n + (1 : Int))
    | .cond c a b => iteTerm c (← listLength a) (← listLength b)
    | _ => unsupported "length of a non-list"

  /-- An expression-derived upper bound, never a bound inferred from a state initializer.
  The live length remains independent and guards every unrolled iteration. -/
  partial def listCapacity (v : Val) : M (Option Int) := do
    if let some n := intOfTerm? (← listLength v) then return some n
    match v with
    | .listFiltered es => return some es.length
    | .cond _ a b =>
      let ca ← listCapacity a
      let cb ← listCapacity b
      return do pure (max (← ca) (← cb))
    | .listAppend xs _ => return (← listCapacity xs).map (· + 1)
    | .listConcat a b =>
      let ca ← listCapacity a
      let cb ← listCapacity b
      return do pure ((← ca) + (← cb))
    | .listUpdate xs .. | .listWindow xs .. => listCapacity xs
    | _ => return none

  /-- Total backing cells. Only live cells are compared or decoded. -/
  partial def listAt (v : Val) (i : Term) (elem : Ty) (fallback : Option Val) : M Val := do
    match v with
    | .held base state suffix (.list _) args => heldVal base state (suffix ++ cellsSuffix) elem (args ++ [i])
    | .listRange lo _ => return .term (← `($lo + $i))
    | .listFiltered [] => listAt (.listLit []) i elem fallback
    | .listFiltered es@((_, first) :: _) =>
      let mut count ← mkIntLit 0
      let mut result := first
      for (p, x) in es do
        result ← iteVal (← `($p ∧ $i = $count)) x result elem
        count ← `($count + (if $p then (1 : Int) else (0 : Int)))
      return result
    | .listWindow xs start _ => listAt xs (← `($start + $i)) elem fallback
    | .listUpdate xs j x => iteVal (← `($i = $j)) x (← listAt xs i elem fallback) elem
    | .listConcat a b =>
      let la ← listLength a
      if intOfTerm? la == some 0 then return ← listAt b i elem fallback
      if intOfTerm? (← listLength b) == some 0 then return ← listAt a i elem fallback
      let av ← listAt a i elem fallback
      let bv ← listAt b (← `($i - $la)) elem (some av)
      iteVal (← `($i < $la)) av bv elem
    | .listLit [] =>
      match fallback with
      | some v => pure v
      | none => unsupported "reading backing cells of an empty list"
    | .listLit (v :: vs) =>
      if let some j := intOfTerm? i then
        if let some cell := (v :: vs)[j.toNat]? then return cell
      (v :: vs).zipIdx |>.foldrM (fun (v, j) acc => do
        iteVal (← `($i = $(← mkIntLit j))) v acc elem) ((v :: vs).getLast!)
    | .listAppend xs v =>
      iteVal (← `($i < $(← listLength xs))) (← listAt xs i elem (some v)) v elem
    | .cond c a b =>
      let av ← if intOfTerm? (← listLength a) == some 0 then
          listAt a i elem (some (← listAt b i elem fallback))
        else listAt a i elem fallback
      iteVal c av (← listAt b i elem (some av)) elem
    | _ => unsupported "indexing a non-list"

  /-- Length constraints on live lists, including lists inside structured values. -/
  partial def wellFormed (v : Val) (ty : Ty) : M Term := do
    match ty, v with
    | .list elem, _ =>
      let n ← listLength v
      let i ← freshName ".quint.listWf"
      let it : Term := ⟨i.raw⟩
      if !(hasLists elem) || intOfTerm? n == some 0 then return ← `(0 ≤ $n)
      let cell ← withBinders [(i, mkIdent `Int)] do wellFormed (← listAt v it elem none) elem
      `(0 ≤ $n ∧ ∀ $i:ident : Int, 0 ≤ $it ∧ $it < $n → $cell)
    | .record _, .record fs | .tup _, .record fs =>
      conj (← (fieldsOf ty).mapM fun (f, ft) => wellFormed ((fs.lookup f).getD (.record [])) ft)
    | .sum r, .sum _ tag ps =>
      conj (← ps.mapM fun (l, p) => do
        `($tag = $(← tagCtor r l) → $(← wellFormed p ((r.fields.lookup l).getD (.tup .empty)))))
    | .fn k t, _ =>
      if !hasLists t then return ← `(True)
      quantify true k fun key => do `($(← mapKeys v key) → $(← wellFormed (← mapGet v key true) t))
    | _, _ => `(True)

  /-- Whether `x` is in the set `s`, as a proposition. -/
  partial def mem (s : Val) (x : Val) : M Term := do
    match s with
    | .cond c a b => do `(($c → $(← mem a x)) ∧ (¬ $c → $(← mem b x)))
    | .held base state suffix (.set elem) args =>
      match elem, x with
      | .sum r, .sum _ tag payloads =>
        let r := sumRow r
        disj (← r.fields.filterMapM fun (l, pt) => do
          let isL ← `($tag = $(← tagCtor r l))
          if isUnit pt then
            some <$> `($isL ∧ $(← compTerm base state (suffix ++ fieldSuffix l) args) = true)
          else match payloads.lookup l with
            | some pv => some <$> do
              `($isL ∧ $(← compTerm base state (suffix ++ fieldSuffix l) (args ++ (← comps pv pt))) = true)
            | none => pure none)
      | _, _ => `($(← compTerm base state suffix (args ++ (← comps x elem))) = true)
    | .lazy e env σ => withSubst σ (memExpr e env x)
    | .indexSet n =>
      match x with
      | .term i | .listIndex i _ => `(0 ≤ $i ∧ $i < $n)
      | _ => unsupported "a non-integer member of indices"
    | .builtinSet "Nat" =>
      match x with
      | .term t | .listIndex t _ => `(0 ≤ $t)
      | _ => unsupported "a membership in Nat of a non-integer"
    | .builtinSet _ => `(True)
    | _ => unsupported "a membership in a value that is not a set"

  partial def memExpr (e : IR.Expr) (env : Env) (x : Val) : M Term := do
    let elemOf (s : IR.Expr) : M Ty := do
      match ← typeOf s.id with
      | .set t => pure t
      | _ => unsupported "a set expression that is not a set"
    match e with
    | .app _ "Set" args => do
      let elem ← elemOf e
      disj (← args.mapM fun a => do eqVal x (← eval a env) elem)
    | .app _ "to" [a, b] => do
      let .term t := x | unsupported "a membership in a range of a non-integer"
      `($(← term a env) ≤ $t ∧ $t ≤ $(← term b env))
    | .app _ "union" [a, b] => do `($(← mem (← eval a env) x) ∨ $(← mem (← eval b env) x))
    | .app _ "intersect" [a, b] => do `($(← mem (← eval a env) x) ∧ $(← mem (← eval b env) x))
    | .app _ "exclude" [a, b] => do `($(← mem (← eval a env) x) ∧ ¬ $(← mem (← eval b env) x))
    | .app _ "filter" [s, f] => do
      let .prop q ← apply f env [x] | unsupported "a filter by an operator that is not a predicate"
      `($(← mem (← eval s env) x) ∧ $q)
    | .app _ "map" [s, f] => do
      if let some p ← memFields s f env x then return p
      let elem ← elemOf e
      let src ← eval s env
      quantIn false src (← elemOf s) fun y => do eqVal x (← apply f env [y]) elem
    | .app _ "tuples" args => do
      let .record fs := x | unsupported "a membership in tuples of a non-tuple"
      conj (← args.zipIdx.mapM fun (a, i) => do
        match fs.lookup (toString (i + 1)) with
        | some v => mem (← eval a env) v
        | none => throwError "quint_module: no item {i + 1}")
    | .app _ "setOfMaps" [d, r] => do
      let .set (.fn k _) ← typeOf e.id | unsupported "setOfMaps that is not a set of maps"
      let dom ← eval d env
      let rng ← eval r env
      let keys ← quantify true k fun y => do `($(← mapKeys x y) ↔ $(← mem dom y))
      let vals ← quantIn true dom k fun y => do mem rng (← mapGet x y true)
      `($keys ∧ $vals)
    | .app _ "flatten" [s] =>
      quantIn false (← eval s env) (← elemOf s) fun inner => mem inner x
    | .app _ "keys" [m] => mapKeys (← eval m env) x
    | .app _ "powerset" [s] => do
      let elem ← elemOf s
      quantify true elem fun y => do `($(← mem x y) → $(← mem (← eval s env) y))
    | _ =>
      match ← eval e env with
      | .lazy e' _ _ => if e'.id == e.id then unsupported s!"a set {opOf e} in the SMT encoding" else mem (← eval e env) x
      | v => mem v x

  /-- `x ∈ s.map(f)` field by field, when `f` puts each component of its argument in a field of its own: `x`'s
  fields are then in the sets `s` takes them from, a `tuples` one set per component. Expanding over `s`
  would be a disjunction over every element, and `tuples(processes, 0.to(10), locations)` has thousands. -/
  partial def memFields (s f : IR.Expr) (env : Env) (x : Val) : M (Option Term) := do
    let .lambda _ [(_, p)] _ body := f | return none
    let .record xs := x | return none
    let untupled : List (Nat × String) × IR.Expr := (untuple p body).getD ([], body)
    let bound := untupled.1
    let body := untupled.2
    let fieldValues ← match body with
      | .app _ "Rec" args => do
        let rec pairs : List IR.Expr → M (List (String × IR.Expr))
          | n :: v :: rest => do pure ((← strLit n, v) :: (← pairs rest))
          | _ => pure []
        pairs args
      | .app _ "Tup" args => pure (args.zipIdx.map fun (a, i) => (toString (i + 1), a))
      | _ => return none
    -- The component of the argument each field is, 0 for the whole argument.
    let componentOf (v : IR.Expr) : Option Nat := match v with
      | .app _ "item" [.name _ q, .int _ i] => if q == p then some i.toNat else none
      | .name _ y => if y == p then some 0 else (bound.find? (·.2 == y)).map (·.1)
      | _ => none
    let comps? : Option (List (String × Nat)) := fieldValues.mapM fun (fld, v) => (fld, ·) <$> componentOf v
    let some comps := comps? | return none
    let sets : List (Nat × IR.Expr × Env × IR.TySubst) ← match ← eval s env with
      | .lazy (.app _ "tuples" as) senv σ => pure (as.zipIdx.map fun (a, i) => (i + 1, a, senv, σ))
      | .lazy e' senv σ => pure [(0, e', senv, σ)]
      | _ => return none
    let indices := comps.map (·.2)
    if indices.eraseDups.length != indices.length || indices.length != sets.length ||
        !sets.all (fun (i, _) => indices.contains i) then return none
    some <$> conj (← comps.mapM fun (fld, i) => do
      let some (_, a, senv, σ) := sets.find? (fun (j, _) => j == i) | throwError "quint_module: no component {i}"
      let some v := xs.lookup fld | throwError "quint_module: no field {fld}"
      withSubst σ do mem (← eval a senv) v)

  /-- The elements of the set `s`, when they are known. -/
  partial def finite (s : Val) : M (Option (List Elem)) := do
    match s with
    | .lazy e env σ => withSubst σ (finiteExpr e env)
    | .cond c a b =>
      let (some xs, some ys) := (← finite a, ← finite b) | return none
      let guard (g : Term) (es : List Elem) : M (List Elem) := es.mapM fun el => do
        pure { el with guard := some (← guarded el.guard g true) }
      return some ((← guard c xs) ++ (← guard (← `(¬ $c)) ys))
    | .indexSet len =>
      let some n := intOfTerm? len | return none
      if n > rangeLimit then return none
      some <$> (_root_.List.range n.toNat).mapM fun (i : Nat) => do
        pure { val := .term (← mkIntLit (Int.ofNat i)), key := some s!"i{i}" }
    | v@(.held _ _ _ (.set elem) _) => do
      let xs ← finiteDomain elem
      xs.mapM fun es => es.mapM fun el => do
        pure { el with guard := some (← mem v el.val) }
    | .builtinSet "Bool" => do
      pure (some [{ val := .prop (← `(False)), key := some "bfalse" }, { val := .prop (← `(True)), key := some "btrue" }])
    | _ => pure none

  /-- A fixed strict order on supported choice values, independent of candidate enumeration. -/
  partial def choiceLess (a b : Val) (ty : Ty) : M Term := do
    let scalar : Val → M Term
      | .term t | .listIndex t _ => pure t
      | _ => unsupported "chooseSome on a non-scalar value"
    let asProp : Val → M Term
      | .prop p => pure p
      | _ => unsupported "chooseSome on a non-boolean value"
    match ty with
    | .int => `($(← scalar a) < $(← scalar b))
    | .bool => `(¬ $(← asProp a) ∧ $(← asProp b))
    | .str => `($(← choiceStringCode (← scalar a)) < $(← choiceStringCode (← scalar b)))
    | .sum r =>
      let r := sumRow r
      let (ta, pa) ← choiceSumView a r
      let (tb, pb) ← choiceSumView b r
      let rank (tag : Term) : M Term := do
        let mut result ← mkIntLit 0
        for ((label, _), i) in (sortedFields r).zipIdx do
          result ← iteTerm (← `($tag = $(← tagCtor r label))) (← mkIntLit (Int.ofNat i)) result
        return result
      let mut cases := [← `($(← rank ta) < $(← rank tb))]
      for (l, pt) in r.fields do
        if let (some av, some bv) := (pa.lookup l, pb.lookup l) then
          cases := cases ++ [← `($ta = $tb ∧ $ta = $(← tagCtor r l) ∧ $(← choiceLess av bv pt))]
      disj cases
    | .record _ | .tup _ =>
      let .record af := a | unsupported "chooseSome on a non-record value"
      let .record bf := b | unsupported "chooseSome on a non-record value"
      let mut equalBefore ← `(True)
      let mut cases := []
      for (f, ft) in fieldsOf ty do
        let some av := af.lookup f | unsupported "chooseSome with a missing field"
        let some bv := bf.lookup f | unsupported "chooseSome with a missing field"
        cases := cases ++ [← `($equalBefore ∧ $(← choiceLess av bv ft))]
        equalBefore ← `($equalBefore ∧ $(← eqVal av bv ft))
      disj cases
    | _ => unsupported "chooseSome on a type without a canonical value order"

  /-- A syntax-directed nonemptiness certificate, independent of initial states. -/
  partial def choiceNonempty (s : Val) : M Bool := do
    if let .cond _ a b := s then return (← choiceNonempty a) && (← choiceNonempty b)
    let some es ← finite s | return false
    return es.any fun el => el.guard.isNone || el.guard.bind knownTruth == some true

  /-- Singleton choice is forced. Finite universes use an arbitrary immutable function of
  the extensional membership bitmask, not a minimum or a per-call nondeterministic pick. -/
  partial def chooseFinite (s : Val) (elem : Ty) : M Val := do
    let some es ← finite s | unsupported "chooseSome without known finite support"
    if es.length > 64 then unsupported "chooseSome exceeding the candidate limit of 64"
    unless ← choiceNonempty s do unsupported "chooseSome without certified nonemptiness"
    let some anchor := es.head? | unsupported "chooseSome of an empty set"
    if es.length == 1 then return anchor.val
    let forced ← es.allM fun el => do
      return knownTruth (← eqVal anchor.val el.val elem) == some true
    if forced then return anchor.val
    let some name := (← get).smtChoices.get? (tyKey elem)
      | unsupported "chooseSome without a canonical set argument"
    let some domain ← finiteDomain elem | return ← chooseOrdered es elem name
    if domain.length > 64 then return ← chooseOrdered es elem name
    let mut mask ← mkIntLit 0
    let mut live := []
    for (el, i) in domain.zipIdx do
      let p ← mem s el.val
      live := live ++ [(p, el.val)]
      let weight ← mkIntLit (Int.ofNat (2 ^ i))
      mask ← `($mask + (if $p then $weight else (0 : Int)))
    let selector : Term := mkIdent name
    let selected ← `($selector $mask)
    -- The fallback is a live member even when the arbitrary selector is out of range.
    let mut result := anchor.val
    for (p, value) in live do result ← iteVal p value result elem
    for ((p, value), i) in live.zipIdx do
      result ← iteVal (← `($p ∧ $selected = $(← mkIntLit (Int.ofNat i)))) value result elem
    return result

  /-- An arbitrary selector on a canonical sorted vector represents every allowed choice.
  Sorting canonicalizes the argument; it does not constrain the selected member to a minimum. -/
  partial def chooseOrdered (es : List Elem) (elem : Ty) (name : Name) : M Val := do
    unless orderedChoiceType elem do unsupported "chooseSome without a canonical set argument"
    for el in es do certifyChoiceStrings el.val elem
    if (elem matches .int) && es.all (·.guard.isNone) then
      let constants := es.mapM fun el => match el.val with
        | .term t => intOfTerm? t
        | _ => none
      if let some constants := constants then
        let values := constants.mergeSort (· ≤ ·) |>.eraseDups
        let count ← mkIntLit (Int.ofNat values.length)
        let args := count :: (← values.mapM mkIntLit) ++
          (← (_root_.List.replicate (64 - values.length) (0 : Int)).mapM mkIntLit)
        let f : Term := mkIdent name
        let selectedName ← freshName ".quint.choicePick"
        let selected ← `(($f $(args.toArray)*) % $count)
        let mut result ← mkIntLit 0
        for (value, i) in values.zipIdx do
          result ← iteTerm (← `($selectedName:ident = $(← mkIntLit (Int.ofNat i)))) (← mkIntLit value) result
        return .term (← `(let $selectedName:ident : Int := $selected; $result))
    let es ← uniqueCandidates es elem
    let mut bindings : List (Ident × Term) := []
    let mut live : List (Term × Val) := []
    for el in es do
      let g ← freshName ".quint.choiceLive"
      let p ← guarded el.guard (← `(True)) true
      -- Live flags are integers, avoiding Prop-valued let bindings in SMT.
      bindings := bindings ++ [(g, ← iteTerm p (← mkIntLit 1) (← mkIntLit 0))]
      live := live ++ [(← `($g:ident = (1 : Int)), el.val)]
    let mut ranked : List (Term × Term × Val) := []
    for (p, value) in live do
      let mut rank ← mkIntLit 0
      for (q, other) in live do
        let less ← choiceLess other value elem
        rank ← `($rank + (if $q ∧ $less then (1 : Int) else (0 : Int)))
      let r ← freshName ".quint.choiceRank"
      bindings := bindings ++ [(r, rank)]
      ranked := ranked ++ [(p, (mkIdent r.getId : Term), value)]
    let defaultValue ← choiceDefault elem
    let mut count ← mkIntLit 0
    for (p, _) in live do count ← `($count + (if $p then (1 : Int) else (0 : Int)))
    let countName ← freshName ".quint.choiceSize"
    bindings := bindings ++ [(countName, count)]
    let mut args : List Term := [mkIdent countName.getId]
    for i in _root_.List.range 64 do
      let mut cell := defaultValue
      if i < es.length then
        for (p, rank, value) in ranked do
          cell ← iteVal (← `($p ∧ $rank = $(← mkIntLit (Int.ofNat i)))) value cell elem
      args := args ++ (← choiceCodes cell elem)
    let f : Term := mkIdent name
    let selectedName ← freshName ".quint.choicePick"
    bindings := bindings ++ [(selectedName, ← `(($f $(args.toArray)*) % $countName:ident))]
    let mut result := defaultValue
    for (p, rank, value) in ranked do
      result ← iteVal (← `($p ∧ $rank = $selectedName:ident)) value result elem
    wrapChoiceBindings result bindings

  partial def choiceStringCode (value : Term) : M Term := do
    let literals := (← read).strConsts.toList.mergeSort (fun a b => a.1 ≤ b.1)
    let mut result ← mkIntLit 0
    for ((_, name), i) in literals.zipIdx do
      let literal : Term := mkIdent name
      result ← iteTerm (← `($value = $literal)) (← mkIntLit (Int.ofNat i)) result
    return result

  /-- Only literal-supported strings are assigned finite codes. Arbitrary strings remain unbounded. -/
  partial def certifyChoiceStrings (value : Val) (ty : Ty) : M Unit := do
    match ty, value with
    | .str, .term t =>
      unless (← read).strConsts.toList.any (fun (_, n) => t == (mkIdent n : Term)) do
        unsupported "chooseSome with a string outside certified literal support"
    | .record _, .record fs | .tup _, .record fs =>
      for (f, ft) in fieldsOf ty do
        let some v := fs.lookup f | unsupported "choice with a missing field"
        certifyChoiceStrings v ft
    | .sum row, .sum _ _ ps =>
      for (l, v) in ps do
        let some pt := row.fields.lookup l | unsupported "choice with a missing variant"
        certifyChoiceStrings v pt
    | _, _ => pure ()

  partial def choiceSumView (value : Val) (row : Row) : M (Term × List (String × Val)) := do
    match value with
    | .term tag => return (tag, [])
    | .sum source tag payloads => return (← retag source row tag, payloads)
    | _ => unsupported "choice on a non-sum value"

  /-- Integer codes are injective on values, with inactive sum payloads masked to zero. -/
  partial def choiceCodes (value : Val) (ty : Ty) : M (List Term) := do
    match ty, value with
    | .int, .term t | .int, .listIndex t _ => return [t]
    | .bool, .prop p => return [← iteTerm p (← mkIntLit 1) (← mkIntLit 0)]
    | .str, .term t => return [← choiceStringCode t]
    | .record _, .record fs | .tup _, .record fs =>
      (fieldsOf ty).flatMapM fun (f, ft) => do
        let some v := fs.lookup f | unsupported "choice with a missing record component"
        choiceCodes v ft
    | .sum row, _ =>
      let row := sumRow row
      let (tag, ps) ← choiceSumView value row
      let mut rank ← mkIntLit 0
      for ((l, _), j) in (sortedFields row).zipIdx do
        rank ← iteTerm (← `($tag = $(← tagCtor row l))) (← mkIntLit (Int.ofNat j)) rank
      let mut result := [rank]
      if isEnum row then return result
      for (l, pt) in sortedFields row do
        let payload ← match ps.lookup l with
          | some v => pure v
          | none => choiceDefault pt
        for code in ← choiceCodes payload pt do
          result := result ++ [← iteTerm (← `($tag = $(← tagCtor row l))) code (← mkIntLit 0)]
      return result
    | _, _ => unsupported "choice without injective scalar codes"

  partial def wrapChoiceBindings (value : Val) (bindings : List (Ident × Term)) : M Val := do
    let wrap (body : Term) := bindings.foldrM
      (fun (x, v) rest => `(let $x:ident : Int := $v; $rest)) body
    match value with
    | .term t => return .term (← wrap t)
    | .prop p => return .prop (← `($(← wrap (← toBool p)) = true))
    | .record fs => return .record (← fs.mapM fun (f, v) => return (f, ← wrapChoiceBindings v bindings))
    | .sum row tag ps =>
      let payloads ← ps.mapM fun (l, v) => return (l, ← wrapChoiceBindings v bindings)
      return .sum row (← wrap tag) payloads
    | _ => unsupported "choice with a non-scalarized result"

  partial def choiceDefault (elem : Ty) : M Val := do
    match elem with
    | .int => return .term (← mkIntLit 0)
    | .bool => return .prop (← `(False))
    | .str =>
      let literals := (← read).strConsts.toList.mergeSort (fun a b => a.1 ≤ b.1)
      let some (_, name) := literals.head? | unsupported "choice without string literal support"
      return .term (mkIdent name)
    | .sum r =>
      let r := sumRow r
      let some (l, pt) := (sortedFields r).head? | unsupported "choice on an empty enumeration"
      let tag ← tagCtor r l
      if isEnum r then return .term tag
      let payloads ← if isUnit pt then pure [] else do pure [(l, ← choiceDefault pt)]
      return .sum r tag payloads
    | .record _ | .tup _ =>
      return .record (← (fieldsOf elem).mapM fun (f, t) => return (f, ← choiceDefault t))
    | _ => unsupported "chooseSome without a canonical padding value"

  /-- All values of a finite scalar sort or a small product of such sorts. -/
  partial def finiteDomain (t : Ty) : M (Option (List Elem)) := do
    match t with
    | .bool => finite (.builtinSet "Bool")
    | .sum r =>
      if !isEnum (sumRow r) then return none
      some <$> (sortedFields (sumRow r)).mapM fun (label, _) => do
        pure { val := .term (← tagCtor (sumRow r) label), key := some s!"c{label}" }
    | .record _ | .tup _ =>
      let mut products : List (List (String × Val)) := [[]]
      for (f, ft) in fieldsOf t do
        let some choices ← finiteDomain ft | return none
        if products.length * choices.length > rangeLimit.toNat then return none
        products := products.flatMap fun fs => choices.map fun e => (f, e.val) :: fs
      return some (products.map fun fs => { val := .record fs.reverse })
    | _ => pure none

  partial def finiteExpr (e : IR.Expr) (env : Env) : M (Option (List Elem)) := do
    let restrict (es : List Elem) (cond : Val → M Term) : M (List Elem) :=
      es.mapM fun el => do
        let c ← cond el.val
        pure { el with guard := some (← match el.guard with | some g => `($g ∧ $c) | none => pure c) }
    match e with
    | .app _ "Set" args => do
      some <$> args.mapM fun a => do pure { val := ← eval a env, key := ← litKey a env }
    | .app _ "to" [a, b] => do
      let (some lo, some hi) := (← foldInt a env, ← foldInt b env) | return none
      if hi - lo ≥ rangeLimit then return none
      some <$> (_root_.List.range (hi - lo + 1).toNat).mapM fun (i : Nat) => do
        let k := lo + Int.ofNat i
        pure { val := .term (← mkIntLit k), key := some s!"i{k}" }
    | .app _ "filter" [s, f] => do
      let some es ← finite (← eval s env) | return none
      some <$> restrict es fun v => do
        match ← apply f env [v] with
        | .prop q => pure q
        | _ => unsupported "a filter by an operator that is not a predicate"
    | .app _ "map" [s, f] => do
      let some es ← finite (← eval s env) | return none
      some <$> es.mapM fun el => do pure { el with val := ← apply f env [el.val], key := none }
    | .app _ "union" [a, b] => do
      let (some ea, some eb) := (← finite (← eval a env), ← finite (← eval b env)) | return none
      pure (some (ea ++ eb))
    | .app _ "intersect" [a, b] | .app _ "exclude" [a, b] => do
      let some ea ← finite (← eval a env) | return none
      let other ← eval b env
      some <$> restrict ea fun v => do
        if e matches .app _ "intersect" _ then mem other v else do `(¬ $(← mem other v))
    | .app _ "tuples" args => do
      let mut acc : List Elem := [{ val := .record [] , key := some "" }]
      for (a, i) in args.zipIdx do
        let some es ← finite (← eval a env) | return none
        acc ← acc.flatMapM fun pre => es.mapM fun el => do
          let .record fs := pre.val | throwError "quint_module: tuples"
          let guard ← match pre.guard, el.guard with
            | some g, some h => some <$> `($g ∧ $h)
            | g, h => pure (g <|> h)
          pure { guard, val := .record (fs ++ [(toString (i + 1), el.val)]),
                 key := do
                   let part ← el.key
                   pure ((← pre.key) ++ toString part.length ++ ":" ++ part) }
      pure (some acc)
    | .app _ "flatten" [s] => do
      let some outer ← finite (← eval s env) | return none
      let mut elems := []
      for el in outer do
        let some inner ← finite el.val | return none
        let inner ← match el.guard with
          | some g => restrict inner fun _ => pure g
          | none => pure inner
        elems := elems ++ inner
      pure (some elems)
    | .app _ "keys" [m] => finiteKeys (← eval m env)
    | .app _ op _ =>
      if ["Set", "to", "union", "intersect", "exclude", "filter", "map", "tuples", "setOfMaps", "powerset",
          "Map", "mapBy", "put", "set", "setBy"].contains op then return none
      finite (← eval e env)
    | .name .. | .letE .. => finite (← eval e env)
    | _ => pure none

  /-- The keys of the map `m`, when they are known. -/
  partial def finiteKeys (m : Val) : M (Option (List Elem)) := do
    match m with
    | .finiteMap _ _ entries => pure (some (entries.map fun (g, k, _) => { guard := g, val := k }))
    | .mapOf keys _ => finite keys
    | v@(.held _ _ _ (.fn kt _) _) => do
      let xs ← finiteDomain kt
      xs.mapM fun es => es.mapM fun el => do
        pure { el with guard := some (← mapKeys v el.val) }
    | .lazy (.app _ "mapBy" [s, _]) env σ => withSubst σ do finite (← eval s env)
    | .lazy (.app _ "setBy" [m, _, _]) env σ | .lazy (.app _ "set" [m, _, _]) env σ =>
      withSubst σ do finiteKeys (← eval m env)
    | .lazy (.app _ "put" [m, k, _]) env σ => withSubst σ do
      let some ks ← finiteKeys (← eval m env) | return none
      pure (some (ks ++ [{ val := ← eval k env, key := ← litKey k env }]))
    | .lazy e@(.name ..) env σ | .lazy e@(.app ..) env σ => withSubst σ do
      match ← eval e env with
      | .lazy e' _ _ => if e'.id == e.id then pure none else finiteKeys (← eval e env)
      | v => finiteKeys v
    | _ => pure none

  /-- `∀` or `∃` over the elements of the set `s` of `elem`s: over each one when they are known. -/
  partial def quantIn (isForall : Bool) (s : Val) (elem : Ty) (body : Val → M Term) : M Term := do
    if let .indexSet n := s then
      let i ← freshName ".quint.indexSet"
      let it : Term := ⟨i.raw⟩
      let p ← withBinders [(i, mkIdent `Int)] (body (.listIndex it n))
      if isForall then return ← `(∀ $i:ident : Int, 0 ≤ $it ∧ $it < $n → $p)
      else return ← `(∃ $i:ident : Int, (0 ≤ $it ∧ $it < $n) ∧ $p)
    match ← finite s with
    | some es =>
      let cases ← es.mapM fun el => do guarded el.guard (← body el.val) (conjoin := !isForall)
      if isForall then conj cases else disj cases
    | none =>
      quantify isForall elem fun x => do
        let inS ← mem s x
        let p ← withReader (fun c => { c with smtReadFacts := inS :: c.smtReadFacts }) (body x)
        if isForall then `($inS → $p) else `($inS ∧ $p)

  /-- Check total dependencies before scalarization can erase undefined reads. -/
  partial def checkFoldDependency (e : IR.Expr) (env : Env)
      (bound : List String := []) (seen : List String := [])
      (mapConstructor : Bool := false) : M Unit := do
    let checkName (n : String) : M Unit := do
      if bound.contains n then return
      if seen.contains n then unsupported "a recursive fold dependency"
      if let some v := env.lookup n then
        match v with
        | .lazy body genv σ => withSubst σ (checkFoldDependency body genv [] (n :: seen) mapConstructor)
        | .term _ | .prop _ | .held .. | .listIndex .. | .mapOf .. | .finiteMap .. =>
          unless mapConstructor do unsupported "a fold dependency through an uncertified local value"
        | _ => unsupported "a fold dependency through an uncertified local value"
      else
        match (← read).lookup n with
        | some (.def _ _ q body _) =>
          if !["val", "pureval", "def", "puredef"].contains q then
            unsupported "an effectful fold dependency"
          checkFoldDependency body [] [] (n :: seen) mapConstructor
        | some (.var ..) | some (.const ..) => pure ()
        | _ =>
          if !["Int", "Nat", "Bool"].contains n then
            unsupported s!"an unknown fold dependency {n}"
    match e with
    | .bool .. | .int .. | .str .. => pure ()
    | .name _ n => checkName n
    | .lambda _ ps _ body => checkFoldDependency body env (ps.map (·.2) ++ bound) seen mapConstructor
    | .letE _ _ n q value body =>
      if q == "nondet" then unsupported "a nondeterministic fold dependency"
      checkFoldDependency value env bound seen mapConstructor
      checkFoldDependency body env (n :: bound) seen mapConstructor
    | .app _ op args =>
      if (env.lookup op).isSome || ((← read).lookup op).isSome then
        checkName op
      else if !(mapConstructor && ["variant", "List", "Map", "setToMap", "mapBy", "put"].contains op) && !["Set", "to", "union", "intersect", "exclude", "filter", "map", "tuples",
          "flatten", "size", "contains", "in", "subseteq", "Tup", "Rec", "item", "field", "get",
          "iadd", "isub", "imul", "iuminus", "ilt", "ilte", "igt", "igte",
          "eq", "neq", "and", "or", "not", "implies", "iff", "ite"].contains op then
        unsupported s!"an uncertified fold dependency {op}"
      for a in args do checkFoldDependency a env bound seen mapConstructor

  /-- Exact unordered reductions: one direct accumulator operand and an independent contribution.
  Only commutative monoids are admitted; candidate order is not part of the semantics. -/
  partial def setFold (s init f : IR.Expr) (env : Env) : M Val := do
    for e in [s, init, f] do checkFoldDependency e env
    let .set elem ← typeOf s.id | unsupported "fold of a non-set"
    let resultTy ← typeOf init.id
    let isBool ← match resultTy with
      | .bool => pure true
      | .int => pure false
      | _ => unsupported "a non-scalar set fold"
    let marker ← freshName ".quint.foldAccumulator"
    let mt : Term := ⟨marker.raw⟩
    let av := if isBool then Val.prop mt else Val.term mt
    let ev ← heldVal ".quint.foldElement" false "" elem []
    let expanded ← apply f env [av, ev]
    let out ← match expanded with
      | .term t | .prop t => pure t
      | _ => unsupported "a non-scalar set fold operator"
    let (op, a, b) ← match out with
      | `($a + $b) => pure ("iadd", a, b)
      | `($a * $b) => pure ("imul", a, b)
      | `($a ∧ $b) => pure ("and", a, b)
      | `($a ∨ $b) => pure ("or", a, b)
      | _ => unsupported "a set fold without an exact commutative reduction"
    let contribution ← if a == mt then pure b else if b == mt then pure a
      else unsupported "a set fold without a direct accumulator operand"
    if (contribution.raw.find? (fun stx => stx.isIdent && stx.getId == marker.getId)).isSome then
      unsupported "a set fold whose contribution depends on the accumulator"
    if (!isBool) != (["iadd", "imul"].contains op) then
      unsupported "a set fold reduction with incompatible types"
    let some es ← finite (← eval s env) | unsupported "a set fold without known finite support"
    if es.length > rangeLimit.toNat then unsupported "a set fold exceeding the unrolling limit"
    let identity ← match op with
      | "iadd" => mkIntLit 0
      | "imul" => mkIntLit 1
      | "and" => `(True)
      | _ => `(False)
    let mut acc ← if isBool then prop init env else term init env
    for el in ← uniqueCandidates es elem do
      let value ← apply f env [av, el.val]
      let out ← match value with
        | .term t | .prop t => pure t
        | _ => unsupported "a non-scalar set fold contribution"
      let (candidateOp, a, b) ← match out with
        | `($a + $b) => pure ("iadd", a, b)
        | `($a * $b) => pure ("imul", a, b)
        | `($a ∧ $b) => pure ("and", a, b)
        | `($a ∨ $b) => pure ("or", a, b)
        | _ => unsupported "a set fold without an exact commutative contribution"
      if candidateOp != op then unsupported "a set fold with inconsistent reductions"
      let value ← if a == mt then pure b else if b == mt then pure a
        else unsupported "a set fold without a direct accumulator operand"
      if (value.raw.find? (fun stx => stx.isIdent && stx.getId == marker.getId)).isSome then
        unsupported "a set fold whose contribution depends on the accumulator"
      let value ← match el.guard with
        | none => pure value
        | some g => iteTerm g value identity
      acc ← match op with
        | "iadd" => `($acc + $value)
        | "imul" => `($acc * $value)
        | "and" => `($acc ∧ $value)
        | _ => `($acc ∨ $value)
    return if isBool then .prop acc else .term acc

  /-- Candidate guards that retain exactly one occurrence of every live value. -/
  partial def uniqueCandidates (es : List Elem) (elem : Ty) : M (List Elem) := do
    let mut result : List Elem := []
    for (el, i) in es.zipIdx do
      let mut conds : List Term := el.guard.toList
      let mut dup := false
      for e' in es.take i do
        let sameKey := e'.key.isSome && e'.key == el.key
        if e'.key.isSome && el.key.isSome && !sameKey then continue
        if sameKey then
          match e'.guard with
          | none => dup := true
          | some g => conds := conds ++ [← `(¬ $g)]
        else
          let same ← eqVal e'.val el.val elem
          conds := conds ++ [← match e'.guard with
            | some g => `(¬ ($g ∧ $same))
            | none => `(¬ $same)]
      if dup then continue
      let guard ← if conds.isEmpty then pure none else some <$> conj conds
      result := result ++ [{ el with guard }]
    return result

  /-- The cardinality of known finite support, with symbolic duplicates removed. -/
  partial def size (s : Val) (elem : Ty) : M Term := do
    if let .indexSet n := s then return n
    let some es ← finite s | unsupported "the size of a set whose elements are not known"
    let terms ← (← uniqueCandidates es elem).mapM fun el => do
      match el.guard with
      | none => mkIntLit 1
      | some g => iteTerm g (← mkIntLit 1) (← mkIntLit 0)
    match terms with
    | [] => mkIntLit 0
    | t :: rest => rest.foldlM (fun acc x => `($acc + $x)) t

  /-- Distinctness is certified only for literals, closed enumeration tags and product components. -/
  partial def mapKeysDiffer (a b : Val) (ty : Ty) : M Bool := do
    if knownTruth (← eqVal a b ty) == some false then return true
    match a, b, ty with
    | .term x, .term y, .sum r =>
      if !isEnum r then return false
      let cs ← r.fields.mapM fun (l, _) => tagCtor r l
      return cs.contains x && cs.contains y && x != y
    | .term x, .term y, .str =>
      let cs := (← read).strConsts.toList.map fun (_, n) => (mkIdent n : Term)
      return cs.contains x && cs.contains y && x != y
    | .record fs, .record gs, _ =>
      for (f, ft) in fieldsOf ty do
        if let (some x, some y) := (fs.lookup f, gs.lookup f) then
          if ← mapKeysDiffer x y ft then return true
      return false
    | _, _, _ => return false

  /-- Refuse ambiguous relations rather than selecting a pair by enumeration order. -/
  partial def certifyMap (kt vt : Ty) (entries : List (Option Term × Val × Val)) : M Val := do
    if entries.length > rangeLimit.toNat then unsupported "a finite map exceeding the candidate limit"
    for ((g, k, v), i) in entries.zipIdx do
      for (h, l, w) in entries.drop (i + 1) do
        if g.any (fun p => knownTruth p == some false) ||
            h.any (fun p => knownTruth p == some false) then continue
        unless (← mapKeysDiffer k l kt) ||
            knownTruth (← eqVal v w vt) == some true do
          unsupported "a finite map without certified functionality"
    return .finiteMap kt vt entries

  /-- Record the key definition that puts the key `k` in the map `m` (`Ctx.smtKeyDefs`), when nothing around
  the read does. -/
  partial def noteMapRead (m k : Val) : M Unit := do
    let domain ← mapKeys m k
    let facts := (← read).smtReadFacts.flatMap conjuncts
    if knownTruth domain == some true || facts.contains domain then return
    if let .held base true "" (.fn _ _) [] := m then
      for (var, keys, definition) in (← read).smtKeyDefs do
        if var != base then continue
        let inKeys ← mem (← eval keys []) k
        if knownTruth inKeys == some true || facts.contains inKeys then
          modify fun st => { st with smtKeysUsed := st.smtKeysUsed.insert definition }
          return

  /-- `v`, which an update of the map `m` stores at `k`, when `k` is a key of `m`, else an unspecified value:
  Quint's `set` and `setBy` update a key that the map has. -/
  partial def atKey (m k : Val) (vt : Ty) (v : Val) : M Val := do
    let isKey ← mapKeys m k
    if knownTruth isKey == some true || ((← read).smtReadFacts.flatMap conjuncts).contains isKey then return v
    iteVal isKey v (← unspecified vt) vt

  /-- Whether `k` is a key of the map `m`, as a proposition. -/
  partial def mapKeys (m : Val) (k : Val) : M Term := do
    match m with
    | .cond c a b => do `(($c → $(← mapKeys a k)) ∧ (¬ $c → $(← mapKeys b k)))
    | .held base state suffix (.fn kt _) args =>
      `($(← compTerm base state (suffix ++ keysSuffix) (args ++ (← comps k kt))) = true)
    | .finiteMap kt _ entries =>
      disj (← entries.mapM fun (g, l, _) => do guarded g (← eqVal k l kt) true)
    | .mapOf keys _ => mem keys k
    | .lazy e env σ => withSubst σ do
      match e with
      | .app _ "mapBy" [s, _] => mem (← eval s env) k
      | .app _ "put" [m, k', _] => do
        let .fn kt _ ← typeOf m.id | unsupported "put on a value that is not a map"
        `($(← mapKeys (← eval m env) k) ∨ $(← eqVal k (← eval k' env) kt))
      | .app _ "set" [m, _, _] | .app _ "setBy" [m, _, _] => mapKeys (← eval m env) k
      | _ =>
        match ← eval e env with
        | .lazy e' _ _ => if e'.id == e.id then unsupported s!"a map {opOf e} in the SMT encoding" else mapKeys (← eval e env) k
        | v => mapKeys v k
    | _ => unsupported "the keys of a value that is not a map"

  /-- The value of the map `m` at `k`. At a key that `m` does not have, a map that a variable or a choice holds
  gives the value stored there, and one that `Map`, `setToMap` or `mapBy` builds gives an unspecified value.
  With `present`, the caller reads the value only where `k` is a key of `m`, so any value does elsewhere.
  `valueTy` is the type of the value where it is used, which an empty `Map()` leaves a variable of. -/
  partial def mapGet (m : Val) (k : Val) (present : Bool := false) (valueTy : Option Ty := none) : M Val := do
    match m with
    | .cond c a b => do
      let ty := valueTy.getD (← mapValueType m)
      iteVal c (← mapGet a k present valueTy) (← mapGet b k present valueTy) ty
    | .held base state suffix (.fn kt vt) args => heldVal base state (suffix ++ entrySuffix vt) vt (args ++ (← comps k kt))
    | .finiteMap kt vt entries => do
      let vt := valueTy.getD vt
      let tests ← entries.mapM fun (g, l, v) => do pure (← guarded g (← eqVal k l kt) true, v)
      let (tests, other) ← match tests.findIdx? (knownTruth ·.1 == some true), tests.getLast? with
        | some i, _ => pure (tests.take i, tests[i]!.2)
        | none, some (_, last) => if present then pure (tests.dropLast, last) else pure (tests, ← unspecified vt)
        | none, none => pure ([], ← unspecified vt)
      tests.foldrM (fun (c, v) acc => iteVal c v acc vt) other
    | .mapOf _ values => mapGet values k present valueTy
    | .lazy e env σ => withSubst σ do
      match e with
      | .app _ "mapBy" [s, f] => do
        let .fn _ vt ← typeOf e.id | unsupported "mapBy that is not a map"
        let vt := valueTy.getD vt
        let inS ← mem (← eval s env) k
        let v ← apply f env [k]
        if present || knownTruth inS == some true then pure v else iteVal inS v (← unspecified vt) vt
      | .app _ "put" [m, k', v] => do
        let .fn kt vt ← typeOf m.id | unsupported s!"updating a value that is not a map"
        let vt := valueTy.getD vt
        iteVal (← eqVal k (← eval k' env) kt) (← eval v env) (← mapGet (← eval m env) k present valueTy) vt
      | .app _ "set" [m, k', v] => do
        let .fn kt vt ← typeOf m.id | unsupported s!"updating a value that is not a map"
        let vt := valueTy.getD vt
        let mv ← eval m env
        let kv ← eval k' env
        let value ← eval v env
        let value ← if present then pure value else atKey mv kv vt value
        iteVal (← eqVal k kv kt) value (← mapGet mv k present valueTy) vt
      | .app _ "setBy" [m, k', f] => do
        let .fn kt vt ← typeOf m.id | unsupported s!"updating a value that is not a map"
        let vt := valueTy.getD vt
        let mv ← eval m env
        let kv ← eval k' env
        let value ← apply f env [← mapGet mv kv (present := true) (valueTy := valueTy)]
        let value ← if present then pure value else atKey mv kv vt value
        iteVal (← eqVal k kv kt) value (← mapGet mv k present valueTy) vt
      | _ =>
        match ← eval e env with
        | .lazy e' _ _ =>
          if e'.id == e.id then unsupported s!"a map {opOf e} in the SMT encoding" else mapGet (← eval e env) k present valueTy
        | v => mapGet v k present valueTy
    | _ => unsupported "a lookup in a value that is not a map"

  partial def mapValueType (m : Val) : M Ty := do
    match m with
    | .finiteMap _ vt _ => pure vt
    | .held _ _ _ (.fn _ v) _ => pure v
    | .lazy e _ σ => withSubst σ do
      match ← typeOf e.id with
      | .fn _ v => pure v
      | _ => unsupported "a lookup in a value that is not a map"
    | .cond _ a _ => mapValueType a
    | .mapOf _ values => mapValueType values
    | _ => unsupported "a lookup in a value that is not a map"

end

/-! ## Actions -/

/-- The index arguments Veil reads as universally quantified, after `fixed`: spelled only in capitals and
digits. With their sorts. -/
private def everyIndex (fixed : List Term) (sorts : List Term) : List (Ident × Term) :=
  sorts.zipIdx.map fun (s, i) => (mkIdent (Name.mkSimple s!"E{fixed.length + i}"), s)

open Veil in
/-- `comp args := value`, an assignment of the component `comp`, which reads what `value` read; `bound` are
the arguments that range over every index. In `equations`, the equation `comp args = value` instead, for
every value of `bound`. -/
private def assignComp (comp : String) (args : List Term) (bound : List (Ident × Term)) (value : M Term)
    (refs : List String) : M Stmt :=
  stmt (assigns := some comp) (refs := refs) do
    let f := mkIdent (Name.mkSimple comp)
    let target : Term ← if args.isEmpty then pure f else `($f $(args.toArray)*)
    let value := withBinders bound value
    if !(← get).equations then return ← `(doElem| $target:term := $(← value))
    let eq ← bound.foldrM (fun (x, s) acc => `(∀ $x:ident : $s, $acc)) (← `($target = $(← value)))
    `(doElem| require $eq)

/-- The assignments that store `v`, a value of type `t`, in the components of the state variable `x` that
start with `suffix`, at the index arguments `fixed` and, for a set or a map, at every index after them. -/
partial def writes (x : String) (suffix : String) (t : Ty) (v : Val) (fixed : List Term)
    (bound : List (Ident × Term)) (refs : List String) : M Branch := do
  let c := (← fieldName x) ++ suffix
  let every (sorts : List Term) : List (Ident × Term) × List Term :=
    let bs := everyIndex fixed sorts
    (bs, bs.map fun (e, _) => (⟨e.raw⟩ : Term))
  match t, v with
  | .bool, .prop p => pure [← assignComp c fixed bound (toBool p) refs]
  | .list elem, _ =>
    let len ← assignComp (c ++ lengthSuffix) fixed bound (listLength v) refs
    let (bs, es) := every [← sortOf .int]
    let i := es.head!
    let old ← heldVal x true (suffix ++ cellsSuffix) elem (fixed ++ es)
    let cells ← writes x (suffix ++ cellsSuffix) elem (← withBinders (bound ++ bs) (listAt v i elem (some old)))
      (fixed ++ es) (bound ++ bs) refs
    pure (len :: cells)
  | .set (.sum r), _ =>
    let r := sumRow r
    if isEnum r then
      let (bs, es) := every [← tagType r]
      return [← assignComp c (fixed ++ es) (bound ++ bs) (do toBool (← mem v (← ofComps (.sum r) es).1)) refs]
    r.fields.mapM fun (l, pt) => do
      let tag ← tagCtor r l
      if isUnit pt then assignComp (c ++ fieldSuffix l) fixed bound (do toBool (← mem v (.sum r tag []))) refs
      else
        let (bs, es) := every (← indexSorts pt)
        let pv := (← ofComps pt es).1
        assignComp (c ++ fieldSuffix l) (fixed ++ es) (bound ++ bs)
          (do toBool (← mem v (.sum r tag [(l, pv)]))) refs
  | .set elem, _ =>
    let (bs, es) := every (← indexSorts elem)
    pure [← assignComp c (fixed ++ es) (bound ++ bs) (do toBool (← mem v (← ofComps elem es).1)) refs]
  | .fn k vt, _ =>
    let (bs, es) := every (← indexSorts k)
    let kv := (← ofComps k es).1
    let keys ← assignComp (c ++ keysSuffix) (fixed ++ es) (bound ++ bs) (do toBool (← mapKeys v kv)) refs
    let value ← withBinders (bound ++ bs) (mapGet v kv (valueTy := vt))
    pure (keys :: (← writes x (suffix ++ entrySuffix vt) vt value (fixed ++ es) (bound ++ bs) refs))
  | .record _, .record fs | .tup _, .record fs =>
    (fieldsOf t).flatMapM fun (f, ft) => do
      match fs.lookup f with
      | some fv => writes x (suffix ++ fieldSuffix f) ft fv fixed bound refs
      | none => throwError "quint_module: no field {f}"
  | .sum target, .sum r tag payloads =>
    let tag ← retag r (sumRow target) tag
    let tagWrite ← assignComp (c ++ tagSuffix) fixed bound (pure tag) refs
    let rest ← payloads.flatMapM fun (l, pv) => do
      match target.fields.lookup l with
      | some pt => writes x (suffix ++ fieldSuffix l) pt pv fixed bound refs
      | none => throwError "quint_module: no variant {l}"
    pure (tagWrite :: rest)
  | _, .term tm | _, .listIndex tm _ => pure [← assignComp c fixed bound (pure tm) refs]
  | _, _ => unsupported s!"assigning a value of a different shape to {x}"

/-- `x' = rhs`. An update of one key of the map `x`, or an addition or removal of known elements of the set
`x`, writes those points; anything else writes every component at every index. -/
partial def assignment (x : String) (rhs : IR.Expr) (env : Env) : M Branch := do
  let some (.var _ _ t) := (← read).lookup x | unsupported s!"assigning {x}, which is not a state variable"
  let refs := references rhs
  let self (w : IR.Expr) : Bool := match w with
    | .name _ w => w == x && (env.lookup w).isNone
    | _ => false
  match t, rhs with
  | _, .name _ w => if self (.name 0 w) then return [] else writes x "" t (← eval rhs env) [] [] refs
  | .list elem, .app _ "append" [w, v] =>
    if !self w then return ← writes x "" t (← eval rhs env) [] [] refs
    let n ← listLength (← eval w env)
    let cells ← writes x cellsSuffix elem (← eval v env) [n] [] refs
    let len ← assignComp ((← fieldName x) ++ lengthSuffix) [] [] (do `($n + (1 : Int))) refs
    pure (cells ++ [len])
  | .fn kt vt, .app _ "set" [w, k, v] | .fn kt vt, .app _ "put" [w, k, v] =>
    if !self w then return ← writes x "" t (← eval rhs env) [] [] refs
    let wv ← eval w env
    let kv ← eval k env
    let ks ← comps kv kt
    if rhs matches .app _ "put" _ then
      let vals ← writes x (entrySuffix vt) vt (← eval v env) ks [] refs
      let keys ← assignComp ((← fieldName x) ++ keysSuffix) ks [] `(true) refs
      return keys :: vals
    noteMapRead wv kv
    writes x (entrySuffix vt) vt (← atKey wv kv vt (← eval v env)) ks [] refs
  | .fn kt vt, .app _ "setBy" [w, k, f] =>
    if !self w then return ← writes x "" t (← eval rhs env) [] [] refs
    let wv ← eval w env
    let kv ← eval k env
    noteMapRead wv kv
    let old ← mapGet wv kv (present := true)
    writes x (entrySuffix vt) vt (← atKey wv kv vt (← apply f env [old])) (← comps kv kt) [] refs
  | .set elem, .app _ "union" [w, .app _ "Set" elems] | .set elem, .app _ "exclude" [w, .app _ "Set" elems] =>
    if !self w || elem matches .sum _ then return ← writes x "" t (← eval rhs env) [] [] refs
    let value ← if rhs matches .app _ "union" _ then `(true) else `(false)
    elems.mapM fun a => do assignComp (← fieldName x) (← comps (← eval a env) elem) [] (pure value) refs
  | _, _ => writes x "" t (← eval rhs env) [] [] refs

open Veil in
/-- `require p`, a guard. -/
private def requireStmt (p : M Term) (refs : List String) : M Stmt := do
  let (p, reads, defReads) ← tracked p
  pure { elem := some (← `(doElem| require $p)), reads, defReads, guard := some p, refs }

open Veil in
/-- `nondet n = s.oneOf()`: the components of `n` picked, then required to make up an element of `s`, the
value they make up, and the facts the rest of the action may rely on: that the value is in `s`. -/
private def pickStmts (n : String) (s : IR.Expr) (env : Env) : M (Branch × Val × List Term) := do
  let .set elem ← typeOf s.id | unsupported "nondet over a value that is not a set"
  let set ← eval s env
  let x ← escaped n
  let refs := references s
  if let (.lazy (.app _ "setOfMaps" [d, r]) senv σ, .fn kt vt) := (set, elem) then
    -- Only the values are chosen, at every key of their sort: the keys are `d`.
    let ks ← indexSorts kt
    let picks ← (← ofExcept (layout vt)).mapM fun c => stmt (refs := refs) (binds := some n) do
      let ty ← (ks ++ (← c.args.mapM sortOf)).foldrM (fun a acc => `($a → $acc)) (← sortOf c.ty)
      let xi := mkIdent (Name.mkSimple (x ++ entrySuffix vt ++ c.suffix))
      `(doElem| let $xi:ident ← pick $ty)
    let v : Val := .mapOf (← withSubst σ (eval d senv)) (.held n false "" elem [])
    let inRange ← requireStmt (withSubst σ do
      let (dv, rv) := (← eval d senv, ← eval r senv)
      quantIn true dv kt fun key => do mem rv (← mapGet v key true)) refs
    return (picks ++ [inRange], v, [])
  let cs ← ofExcept (layout elem)
  if let [{ suffix := "", args := [], .. }] := cs then
    if !(elem matches .bool) then
      let xi := mkIdent (Name.mkSimple x)
      let v : Val := .term xi
      let st ← stmt (refs := refs) (binds := some n) do
        let p ← mem set v
        `(doElem| let $xi:ident :| $p)
      let (inS, _, _) ← tracked (mem set v)
      return ([st], v, [inS])
  let picks ← cs.mapM fun c => stmt (refs := refs) (binds := some n) do
    let ty ← (← c.args.mapM sortOf).foldrM (fun a acc => `($a → $acc)) (← sortOf c.ty)
    let xi := mkIdent (Name.mkSimple (x ++ c.suffix))
    `(doElem| let $xi:ident ← pick $ty)
  let v ← heldVal n false "" elem []
  let inS ← requireStmt (mem set v) refs
  pure (picks ++ [inS], v, inS.guard.toList)

mutual
  /-- The branches of a Quint action, as `Quint.Embed.branches` takes them apart, with every value of a
  `let`, an argument or a `nondet` in `env`. -/
  partial def branches (e : IR.Expr) (env : Env) : M (List Branch) := do
    let ctx ← read
    match e with
    | .app _ "actionAll" args =>
      args.foldlM (init := [[]]) fun acc a => do
        let bs ← branches a env
        pure (acc.flatMap fun pre => bs.map fun b => pre ++ b)
    | .app _ "actionAny" args =>
      if args.isEmpty then unsupported "an empty any"
      pure (← args.mapM (branches · env)).flatten
    | .app _ "assign" [.name _ x, rhs] => pure [← assignment x rhs env]
    | .letE _ _ n "nondet" (.app _ "oneOf" [s]) body =>
      let (picks, v, inS) ← pickStmts n s env
      withReader (fun c => { c with smtReadFacts := inS ++ c.smtReadFacts }) do
        pure ((← branches body ((n, v) :: env)).map (picks ++ ·))
    | .letE _ _ n q value body =>
      if q == "nondet" then unsupported "a nondet binding that is not `oneOf`"
      branches body ((n, ← eval value env) :: env)
    | .app _ "ite" [c, a, b] =>
      if !isAction ctx a && !isAction ctx b then return [[← requireStmt (prop e env) (references e)]]
      let condition ← prop c env
      if let some yes := knownTruth condition then return ← branches (if yes then a else b) env
      let yes ← requireStmt (pure condition) (references c)
      let no ← requireStmt (do `(¬ $(← prop c env))) (references c)
      let as ← withReadGuard c env true (branches a env)
      let bs ← withReadGuard c env false (branches b env)
      pure (((as.map (yes :: ·)) ++ (bs.map (no :: ·))).filter fun br =>
        !br.any (fun st => st.guard.any (fun g => knownTruth g == some false)))
    | .app _ "matchVariant" (s :: cases) =>
      if !cases.any (isAction ctx) then return [[← requireStmt (prop e env) (references e)]]
      matchBranches s cases env
    | .name _ n => call n [] e env
    | .app _ op args => call op args e env
    | _ => pure [[← requireStmt (prop e env) (references e)]]

  /-- A call of a user action, inlined with its parameters taking the values of the arguments; anything
  else is a guard. -/
  partial def call (op : String) (args : List IR.Expr) (e : IR.Expr) (env : Env) : M (List Branch) := do
    match (← read).lookup op with
    | some (.def _ _ q body _) =>
      if q != "action" && q != "nondet" && q != "run" then return [[← requireStmt (prop e env) (references e)]]
      let (params, body) := lambdaOf body
      if params.length != args.length then
        unsupported s!"calling {op} with {args.length} arguments, not {params.length}"
      let vals ← args.mapM (eval · env)
      let marker : Stmt := { elem := none, through := some op }
      pure ((← branches body (params.map (·.2) |>.zip vals)).map (marker :: ·))
    | _ => pure [[← requireStmt (prop e env) (references e)]]

  /-- `match` in an action: one alternative per case, which requires the scrutinee's tag to be the case's
  label, or for `_` none of the others, and runs the case with its payload. -/
  partial def matchBranches (s : IR.Expr) (cases : List IR.Expr) (env : Env) : M (List Branch) := do
    let .sum r ← typeOf s.id | unsupported "matching on a value that is not a sum"
    let r := sumRow r
    let sv ← eval s env
    let tag ← match sv with
      | .term t => pure t
      | .sum _ tag _ => pure tag
      | _ => unsupported "matching on a value that is not a sum"
    let rec labels : List IR.Expr → M (List (String × IR.Expr))
      | l :: f :: rest => do pure ((← strLit l, f) :: (← labels rest))
      | _ => pure []
    let cs ← labels cases
    let knownLabel ← r.fields.findSomeM? fun (l, _) => do
      return if tag == (← tagCtor r l) then some l else none
    let selectedLabel := knownLabel.map fun l => if cs.any (·.1 == l) then l else "_"
    let named := (cs.map (·.1)).filter (· != "_")
    let mut out := []
    for (l, f) in cs do
      if selectedLabel.isSome && selectedLabel != some l then continue
      let test ← requireStmt (if l == "_" then do
          conj (← named.mapM fun o => do `($tag ≠ $(← tagCtor r o)))
        else do `($tag = $(← tagCtor r l))) (references s)
      let payload : Val := match sv with
        | .sum _ _ ps => (ps.lookup l).getD (.record [])
        | _ => .record []
      let (params, body) := lambdaOf f
      let env' := (params.map (·.2) |>.zip [payload]) ++ env
      out := out ++ (← branches body env').map (test :: ·)
    pure out
end

/-- Whether the identifier `x` occurs in `stx`. -/
private def mentions (stx : Syntax) (x : Ident) : Bool :=
  (stx.find? fun s => s.isIdent && s.getId == x.getId).isSome

open Veil in
/-- The statements of the action of branch `i` of `body`, `br`: the unspecified values that it picks, a local
for each component the branch both assigns and reads, holding its value before the step, then the branch,
translated again with every read of such a component going to its local. A value is translated where it is
bound, before the statement that uses it, so the reads of a statement are not known, and every read of an
assigned component is from before the step. -/
private def actionItems (body : IR.Expr) (i : Nat) (br : Branch) :
    M (Array (TSyntax ``Lean.Parser.Term.doSeqItem)) := do
  let assigned := (br.filterMap (·.assigns)).eraseDups
  modify fun s => { s with pre := Std.HashSet.ofList assigned, readVars := {}, smtPicks := #[] }
  let brs ← try branches body [] finally modify fun s => { s with pre := {} }
  let read := (← get).readVars.toList
  let some br := brs[i]? | unsupported "a branch that changed when it was translated again"
  let prologue ← (assigned.filter read.contains).toArray.mapM fun c => do
    `(doElem| let $(mkIdent (Name.mkSimple (c ++ "~"))):ident := $(mkIdent (Name.mkSimple c)):ident)
  -- Negative lengths do not denote Quint states, including at a synthetic
  -- initializer that assumes an induction hypothesis rather than constructing a list.
  let mut domain := #[]
  for d in (← (MonadReader.read : M Ctx)).main.declarations do
    if let .var _ n t := d then
      if hasLists t then
        let p ← wellFormed (← heldVal n true "" t []) t
        domain := domain.push (← `(doElem| require $p))
  let items := domain ++ prologue ++ (br.filterMap (·.elem)).toArray
  -- The other branches that the translation went through pick values of their own.
  let picked := (← get).smtPicks.filter fun (x, _) => items.any (mentions ·.raw x)
  let picks ← picked.mapM fun (x, args, sort, _) => do
    `(doElem| let $x:ident ← pick $(← args.foldrM (fun a acc => `($a → $acc)) sort))
  (picks ++ items).mapM fun s => `(Lean.Parser.Term.doSeqItem| $s:doElem)

/-! ## Declarations -/

/-- Every sum row a type mentions. -/
private partial def sumRows : Ty → List Row
  | .sum r => sumRow r :: r.fields.flatMap (sumRows ·.2)
  | .set e | .list e => sumRows e
  | .fn a b => sumRows a ++ sumRows b
  | .oper args r => args.flatMap sumRows ++ sumRows r
  | .tup r | .record r => r.fields.flatMap (sumRows ·.2)
  | .app _ args => args.flatMap sumRows
  | _ => []

/-- Whether a type holds `str` anywhere. -/
private partial def mentionsStr : Ty → Bool
  | .str => true
  | .set e | .list e => mentionsStr e
  | .fn a b => mentionsStr a || mentionsStr b
  | .oper args r => args.any mentionsStr || mentionsStr r
  | .tup r | .record r | .sum r => r.fields.any (mentionsStr ·.2)
  | .app _ args => args.any mentionsStr
  | _ => false

/-- The ids of an expression and of everything inside it. -/
private partial def exprIds : IR.Expr → List Nat
  | e@(.app _ _ args) => e.id :: args.flatMap exprIds
  | e@(.lambda _ ps _ b) => e.id :: ps.map (·.1) ++ exprIds b
  | e@(.letE _ d _ _ v b) => e.id :: d :: exprIds v ++ exprIds b
  | e => [e.id]

private partial def mentionsChoice : IR.Expr → Bool
  | .app _ "chooseSome" _ => true
  | .app _ _ args => args.any mentionsChoice
  | .lambda _ _ _ body => mentionsChoice body
  | .letE _ _ _ _ value body => mentionsChoice value || mentionsChoice body
  | _ => false

/-- The types of the state, the constants and every expression of the main module. -/
private def moduleTypes (ctx : Ctx) : List Ty :=
  ctx.main.declarations.flatMap fun d => match d with
    | .var _ _ t | .const _ _ t => [t]
    | .def _ _ _ e _ => (exprIds e).filterMap ctx.output.types.get?
    | .assume _ _ e => (exprIds e).filterMap ctx.output.types.get?
    | _ => []

/-- The enumerations declared as Veil `enum`s, by structural key: every enumeration and the tag of every
sum, except one that shares a label with another, since a Veil `enum` opens its labels as constants of
the module. Veil's `#updr` takes a Veil `enum`, a sort its constants axiomatize, and refuses a Lean
`inductive`, which lean-smt declares as a datatype. -/
def veilEnums (ctx : Ctx) : Std.HashMap String Row := Id.run do
  let rows := ((moduleTypes ctx).flatMap sumRows).filter fun r => r.tailVar.isNone && !r.fields.isEmpty
  let mut unique : Std.HashMap String Row := {}
  for r in rows.map tagRow do unique := unique.insert (tyKey (.sum r)) r
  let labels := unique.toList.flatMap fun (_, r) => r.fields.map (·.1)
  unique.filter fun _ r => r.fields.all fun (l, _) => labels.count l == 1

open Veil in
/-- The components of the state variable or, with `isConst`, the constant `n` of type `t`. -/
private def declareState (n : String) (t : Ty) (isConst : Bool) : M Unit := do
  for c in ← ofExcept (layout t) do
    let name := mkIdent (Name.mkSimple ((← fieldName n) ++ c.suffix))
    let ty ← (← c.args.mapM sortOf).foldrM (fun a acc => `($a → $acc)) (← sortOf c.ty)
    let isBool := c.ty matches .bool
    let cmd ← if c.args.isEmpty then
        if isConst then `(command| immutable individual $name:ident : $ty) else `(command| individual $name:ident : $ty)
      else if isBool then
        if isConst then `(command| immutable relation $name:ident : $ty) else `(command| relation $name:ident : $ty)
      else if isConst then `(command| immutable function $name:ident : $ty) else `(command| function $name:ident : $ty)
    emit cmd

/-- `e` as an equation `m.keys() == s`, for a state variable `m` and a set `s` that reads no state
variable. -/
private def keyEquation (ctx : Ctx) (e : IR.Expr) : Option (String × IR.Expr) :=
  let keysOf (a b : IR.Expr) : Option (String × IR.Expr) := match a with
    | .app _ "keys" [.name _ m] =>
      let readsState := (references b).any fun n => ctx.vars.contains n || ctx.stateReaders.contains n
      if ctx.vars.contains m && !readsState then some (m, b) else none
    | _ => none
  match e with
  | .app _ "eq" [a, b] => keysOf a b <|> keysOf b a
  | _ => none

open Veil in
/-- The module in the SMT encoding, up to the `#gen_spec` that closes its specification. -/
def emitModule : M Unit := do
  let ctx ← read
  let m := ctx.main
  let types := moduleTypes ctx
  let moduleName := mkIdent (Name.mkSimple m.name)
  let isModule := (← getEnv).header.isModule
  if isModule then emit (← `(command| public section))
  emit (← `(command| namespace $moduleName:ident))
  for r in types.flatMap sumRows do
    if r.tailVar.isNone && !r.fields.isEmpty then discard (tagType r)
  emit (← `(command| end $moduleName:ident))
  if isModule then emit (← `(command| end))
  emit (← `(command| veil module $moduleName:ident))
  if !ctx.strConsts.isEmpty || types.any mentionsStr then emit (← `(command| type $strIdent:ident))
  for (_, r) in ctx.enums.toList do
    let name ← declareSum r
    -- Parsed from text: in a quotation, the braces of Veil's `enum` syntax read as a structure instance.
    let labels ← r.fields.mapM fun (l, _) => escaped l
    let text := s!"enum {name.getId} = \{{", ".intercalate labels}}"
    match Parser.runParserCategory (← getEnv) `command text with
    | .ok stx => emit ⟨stx⟩
    | .error err => throwError "quint_module: {text}: {err}"
  for d in m.declarations do
    if let .typedef _ n _ none := d then emit (← `(command| type $(mkIdent (Name.mkSimple n)):ident))
  for (_, c) in ctx.strConsts.toList do
    emit (← `(command| immutable individual $(mkIdent c):ident : $strIdent:ident))
  -- Never let a generated component alias another state field or constant.
  let mut componentNames : Std.HashSet String := {}
  for d in m.declarations do
    if let some (n, t) := (match d with
        | .var _ n t | .const _ n t => some (n, t)
        | _ => none) then
      for c in ← ofExcept (layout t) do
        let name := (← fieldName n) ++ c.suffix
        if componentNames.contains name then unsupported s!"colliding SMT component {name}"
        componentNames := componentNames.insert name
  for d in m.declarations do
    if let .const _ n t := d then declareState n t (isConst := true)
  for d in m.declarations do
    if let .var _ n t := d then declareState n t (isConst := false)
  -- One shared arbitrary selector per complete finite universe. Every deterministic
  -- choice function on this universe has a corresponding interpretation of this function.
  let usesChoice := m.declarations.any fun d => match d with
    | .def _ _ _ body _ | .assume _ _ body => mentionsChoice body
    | _ => false
  for t in (if usesChoice then types else []) do
    if !(← get).smtChoices.contains (tyKey t) then
      if let some domain ← finiteDomain t then
        if !domain.isEmpty && domain.length ≤ 64 then
          let name := mkIdent (Name.mkSimple (".quint.choice" ++ toString (← get).smtChoices.size))
          emit (← `(command| immutable function $name:ident : Int → Int))
          modify fun st => { st with smtChoices := st.smtChoices.insert (tyKey t) name.getId }
    if !(← get).smtChoices.contains (tyKey t) && orderedChoiceType t then
      let args := _root_.List.replicate (1 + 64 * choiceCodeCount t) (mkIdent `Int : Term)
      let ty ← args.foldrM (fun a b => `($a → $b)) (mkIdent `Int : Term)
      let name := mkIdent (Name.mkSimple (".quint.choice" ++ toString (← get).smtChoices.size))
      emit (← `(command| immutable function $name:ident : $ty))
      modify fun st => { st with smtChoices := st.smtChoices.insert (tyKey t) name.getId }
  -- What follows waits for the theory's unspecified values (`unspecified`), which only translating it finds.
  modify fun st => { st with deferred := some #[] }
  let lits := ctx.strConsts.toList.map (mkIdent ·.2)
  let pairs := lits.zipIdx.flatMap fun (a, i) => (lits.drop (i + 1)).map (a, ·)
  if !pairs.isEmpty then
    let different ← conj (← pairs.mapM fun (a, b) => `($a ≠ $b))
    let name := mkIdent `str_distinct
    emit (← `(command| assumption [$name:ident] $different))
  for d in m.declarations do
    if let .const _ n t := d then
      if hasLists t then
        let name ← freshName ".quint.listConstantWellFormed"
        let p ← wellFormed (← heldVal n false "" t []) t
        emit (← `(command| assumption [$name:ident] $p))
  let (_, initBody) ← entryPoint ctx "q::init"
  -- Veil starts the initializer from any state, so it reaches the one that satisfies its equations.
  modify fun s => { s with equations := ctx.smtEquations }
  let brs ← inAction (branches initBody [])
  emitInit (← brs.toArray.zipIdx.mapM fun (br, i) => inAction (actionItems initBody i br))
  modify fun s => { s with equations := false }
  for d in m.declarations do
    if let .assume _ n e := d then
      let name := mkIdent (Name.mkSimple (if n == "_" then "assumption" else n))
      emit (← `(command| assumption [$name:ident] $(← prop e [])))
  let keyDefs := ctx.main.declarations.filterMap fun d => match d with
    | .def _ n _ e _ => if ctx.inlined.contains n then none else (keyEquation ctx e).map fun (v, s) => (v, s, n)
    | _ => none
  let keyTerm (k : String) : M Term := do
    let some (.def _ _ _ e _) := ctx.lookup k | unsupported s!"the key definition {k}"
    prop e []
  let (stepName, stepBody) ← entryPoint ctx "q::step"
  modify fun st => { st with smtKeysUsed := {} }
  withReader (fun c => { c with smtKeyDefs := keyDefs }) do
    let alts ← (stepActions ctx stepName stepBody).mapM fun (n, body) => do
      pure (n, body, ← inAction (branches body []))
    for ((_, body, brs), names) in alts.zip (← branchNames (alts.map fun (n, _, brs) => (n, brs))) do
      for ((br, name), i) in (brs.zip names).zipIdx do
        let items ← inAction (actionItems body i br)
        emit (← `(command| action $name:ident { $items* }))
  let actionKeys := (← get).smtKeysUsed
  let mut conjoined : Std.HashSet String := {}
  for d in m.declarations do
    if let .var _ n t := d then
      if hasLists t then
        let name ← freshName ".quint.listWellFormed"
        let p ← wellFormed (← heldVal n true "" t []) t
        emit (← `(command| invariant [$name:ident] $p))
  for n in ctx.inlined.toList do
    if let some (.def _ _ _ e _) := ctx.lookup n then
      -- Keep the user-facing invariant label in Quint form. Only the Lean declaration used in its
      -- proposition is escaped, so induction reports can return the original name.
      let name := mkIdent (Name.mkSimple n)
      modify fun st => { st with smtKeysUsed := {} }
      let p ← withReader (fun c => { c with smtKeyDefs := keyDefs }) (prop e [])
      -- The invariant is stated with the key definitions of its reads, which the check then proves with it.
      let keys := (← get).smtKeysUsed.toList
      let p ← conj ((← keys.mapM keyTerm) ++ [p])
      conjoined := conjoined.insertMany keys
      emit (← `(command| invariant [$name:ident] $p))
  -- A key definition of an action's reads that no invariant was stated with is an invariant of its own.
  for k in actionKeys.toList do
    unless conjoined.contains k do
      let name := mkIdent (Name.mkSimple (← escaped k))
      emit (← `(command| invariant [$name:ident] $(← keyTerm k)))
  let held := (← get).deferred.getD #[]
  modify fun st => { st with deferred := none }
  for (x, args, sort, isBool) in (← get).smtUnspecified do
    unless held.any (mentions ·.raw x) do continue
    let ty ← args.foldrM (fun a acc => `($a → $acc)) sort
    emit (← if args.isEmpty then `(command| immutable individual $x:ident : $ty)
      else if isBool then `(command| immutable relation $x:ident : $ty)
      else `(command| immutable function $x:ident : $ty))
  emit (← `(command| #gen_state))
  for cmd in held do emit cmd

/-- What `#quint_check_induction` reads of a module in the SMT encoding, to write the states of a
counterexample as Quint values: each state variable's name in a trace, its field and its type, the string
literal each constant of `str` is, the type of each enumeration, by its labels, and whether the
initializer states its assignments as equations (`Ctx.smtEquations`), without which the model of a
counterexample at the initializer has the state before it, not the one it reaches. -/
structure ModuleInfo where
  vars : List (String × String × Ty)
  strConsts : List (String × Name)
  /-- The Lean `inductive` of each enumeration that is not a Veil `enum`. -/
  enums : List (List String × Name)
  /-- The sort of each Veil `enum`, whose values the model numbers. -/
  veilEnums : List (List String × Name)
  initEquations : Bool
  deriving Inhabited

/-- The modules in the SMT encoding elaborated so far, by name. -/
initialize modules : EnvExtension (NameMap ModuleInfo) ← registerEnvExtension (pure {})

/-- The labels of an enumeration, which name its type in `ModuleInfo.enums` and `ModuleInfo.veilEnums`. -/
def enumKey (r : Row) : List String := (r.fields.map (·.1)).mergeSort

/-- Record the module of `ctx` in `modules`. -/
def recordModule : M Unit := do
  let ctx ← read
  let vars ← ctx.main.declarations.filterMapM fun d => match d with
    | .var _ n t => do pure (some (ctx.output.itfNames.getD n n, ← fieldName n, t))
    | _ => pure none
  let rows := (vars.flatMap fun (_, _, t) => sumRows t).filter (·.tailVar.isNone)
  let (ofVeil, ofLean) := rows.partition fun r => ctx.enums.contains (tyKey (.sum (tagRow r)))
  let enums ← ofLean.mapM fun r => do pure (enumKey r, Name.mkSimple ctx.main.name ++ (← tagType r).getId)
  let veilEnums ← ofVeil.mapM fun r => do pure (enumKey r, (← tagType r).getId)
  let info : ModuleInfo :=
    { vars, strConsts := ctx.strConsts.toList, enums, veilEnums, initEquations := ctx.smtEquations }
  modifyEnv fun env => modules.modifyState env (·.insert (Name.mkSimple ctx.main.name) info)

/-- The string literals in value positions: a field name, a variant label or a record key is not a value. -/
private partial def strLiterals : IR.Expr → List String
  | .str _ s => [s]
  | .app _ "field" [r, .str _ _] => strLiterals r
  | .app _ "with" [r, .str _ _, v] => strLiterals r ++ strLiterals v
  | .app _ "variant" [.str _ _, p] => strLiterals p
  | .app _ "Rec" args => (args.zipIdx.filter (·.2 % 2 == 1)).flatMap (strLiterals ·.1)
  | .app _ "matchVariant" (s :: cases) =>
    strLiterals s ++ (cases.zipIdx.filter (·.2 % 2 == 1)).flatMap (strLiterals ·.1)
  | .app _ _ args => args.flatMap strLiterals
  | .lambda _ _ _ b => strLiterals b
  | .letE _ _ _ _ v b => strLiterals v ++ strLiterals b
  | _ => []

/-- Labels that fieldNames can turn into string values, including inside instantiated record types. -/
private partial def recordLabels : Ty → List String
  | .record r => r.fields.map (·.1) ++ r.fields.flatMap (recordLabels ·.2)
  | .tup r | .sum r => r.fields.flatMap (recordLabels ·.2)
  | .set t | .list t => recordLabels t
  | .fn k v => recordLabels k ++ recordLabels v
  | .oper args v => args.flatMap recordLabels ++ recordLabels v
  | .app _ args => args.flatMap recordLabels
  | _ => []

/-- String constants for literal values and for field labels observed by fieldNames. -/
def strConstants (ctx : Ctx) : Std.HashMap String Name := Id.run do
  let exprs := ctx.main.declarations.filterMap fun d => match d with
    | .def _ _ _ e _ | .assume _ _ e => some e
    | _ => none
  let labels := if exprs.any (fun e => (references e).contains "fieldNames")
    then (moduleTypes ctx).flatMap recordLabels else []
  let lits := (exprs.flatMap strLiterals ++ labels).eraseDups
  let mut out : Std.HashMap String Name := {}
  let mut taken : Std.HashSet String := {}
  for s in lits do
    let base := "str_" ++ String.ofList (s.toList.map fun ch => if ch.isAlphanum then ch else '_')
    let mut name := base
    let mut i := 1
    while taken.contains name do
      name := s!"{base}_{i}"
      i := i + 1
    taken := taken.insert name
    out := out.insert s (Name.mkSimple name)
  out

end Quint.Smt
