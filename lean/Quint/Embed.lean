module

public meta import Lean
public meta import Veil
public meta import Quint.IR
public meta import Quint.Library
public import Quint.Builtins

/-! A Quint specification as a Veil module, which `quint_module` (`Quint.Command`) elaborates.

The translation reads the IR that `quint compile --target json` prints for a spec and elaborates one Lean
declaration per Quint declaration, in the file that invokes the command:

- a record or sum type becomes a `structure` or `inductive`, named after the spec's type alias;
- a definition that reads no state variable becomes a Lean `def`, one that does a `ghost function`;
- a state variable becomes an `individual`, a constant a `param`;
- `init` becomes `after_init`, each alternative of `step` an `action`, with Quint's `all`, `any`,
  `nondet`, `if` and assignments as Veil statements that read the pre-state and commit at the end;
- an `invariant` becomes a Veil `invariant`, an `assume` an `assumption`.

Expressions are mapped one constructor at a time: literals, names, `let`, lambdas, and each builtin
opcode to its definition in `Quint.Builtins`. Nothing here decides what an operator means. -/

public meta section

namespace Quint.Embed

open Lean Elab Command Term
open IR (Ty Row Output TySubst substTy needsInstance isUnit)

/-- Names Veil declares inside every module (`Veil/Frontend/DSL/Module/Names.lean`); a Quint definition
that carries one of them gets a trailing `_`. -/
private def veilNames : List String :=
  ["ActionTag", "Assumptions", "FieldAbstractType", "FieldConcreteType", "Init", "Instantiation",
   "Invariants", "Label", "LocalRProp", "LocalTheoryProp", "Next", "NextAct", "NextStep", "NextTr",
   "Safeties", "State", "Theory", "complete", "distinct", "enumerableTransitionSystem", "pickSource",
   "relationalTransitionSystem", "initializer", "σ", "ρ", "χ", "init", "step"]

private def leanKeywords : List String :=
  ("fun let if then else match with do by have show from at in end def theorem structure inductive where " ++
   "open namespace section import return for unless mut instance class abbrev example deriving variable " ++
   "universe type action procedure transition invariant safety assumption individual relation function " ++
   "require assert assume pick ghost immutable mutable param enum instantiate after_init trusted theory " ++
   "module termination temporal").splitOn " "

/-- What the elaboration of one spec needs to know about it. -/
structure Ctx where
  output : Output
  main : IR.Module
  /-- Every declaration of the main module, by name. -/
  decls : Std.HashMap String IR.Decl
  /-- Definitions that read a state variable, directly or through another definition. -/
  stateReaders : Std.HashSet String
  /-- Definitions that read a constant, directly or through another definition. -/
  constReaders : Std.HashSet String := {}
  /-- The state variables each definition reads, directly or through other definitions. -/
  defReads : Std.HashMap String (List String) := {}
  /-- Type alias names by structural key. -/
  aliases : Std.HashMap String String
  /-- The names of the state variables, as the spec spells them. -/
  vars : List String
  /-- Definitions stated as Veil invariants. Their bodies are inlined wherever they are used, since the
  invariant takes the Quint name and Veil allows only one declaration per name. -/
  inlined : Std.HashSet String := {}
  /-- Definitions stated as Veil state constraints: the model checker neither counts, checks nor explores a
  state where one fails, as Quint's own does. -/
  stateConstraints : List String := []
  /-- The enumerations declared as Veil `enum`s (`Quint.Smt.veilEnums`), by structural key. -/
  enums : Std.HashMap String Row := {}
  /-- Operators an enclosing `let` defines, which a call applies as a local function. -/
  locals : Std.HashSet String := {}
  /-- What an enclosing `let` defines when its type `needsInstance`, by name, with its definition id and
  value: a use translates the value at that use's types, as `instanceTerm` does for a definition of the
  spec, since a Lean `let` has one type. -/
  inlineLocals : Std.HashMap String (Nat × IR.Expr) := {}
  /-- The types of the use a definition `needsInstance` is inlined at, which `typeOf` puts in place of its
  variables. -/
  tySubst : TySubst := {}
  /-- The type variables the type of some definition mentions, which each use of the definition
  instantiates. The typechecker names every variable apart. -/
  generalized : Std.HashSet String := {}
  /-- Whether this is `quint_library`, whose datatypes a later module reuses (`libraryTypes`). -/
  library : Bool := false
  /-- The records and sums, by `labelKey`, declared as one generic type (`genericLabels`). -/
  generic : Std.HashSet String := {}
  /-- In the SMT encoding (`Quint.Smt`), the constant of the sort `str` each string literal is. -/
  strConsts : Std.HashMap String Name := {}
  /-- In the SMT encoding, whether the initializer's assignments are stated as equations the state
  satisfies, so that the model of a counterexample to an invariant at the initializer has the state the
  initializer reaches. A solver decides those equations, which quantify over every index of a set or a map,
  less often than the assignments. -/
  smtEquations : Bool := false
  smtReadFacts : List Term := []
  /-- In the SMT encoding, the key definitions of the main module that are not invariants of the module: each
  definition whose body is only an equation `m.keys() == s`, where `s` reads no state variable, by `m`, `s`
  and the definition's name. A read of `m` at a key of `s` that nothing around the read puts in `m` makes the
  module state the definition too (`St.smtKeysUsed`), so that a check leaves out the states where the key is
  missing and `m` has an unspecified value there. -/
  smtKeyDefs : List (String × IR.Expr × String) := []
  /-- In the SMT encoding, the variables bound around the expression being translated, by a quantifier or by
  an assignment at every index, with their sorts. -/
  smtBinders : List (Term × Term) := []

/-- Record and sum types declared so far, by structural key, and generic ones by `labelKey`. -/
structure St where
  typeNames : Std.HashMap String Name := {}
  /-- The generic types declared or reused so far, which a type applies to its fields' types. -/
  genericTypes : Std.HashSet Name := {}
  usedNames : Std.HashSet String := {}
  fresh : Nat := 0
  /-- Whether to log each generated declaration, for `(code := true)`. -/
  showCode : Bool := false
  /-- A file to write the generated module to, for `(out := "Module.lean")`. -/
  out : Option System.FilePath := none
  /-- Inside an action, where a read of a state variable is recorded in `readVars`. -/
  inAction : Bool := false
  /-- The state variables read since the last snapshot, collected while translating one statement. -/
  readVars : Std.HashSet String := {}
  /-- The state variables read through a definition, which Veil makes a ghost function that reads the
  state its statement runs in, collected like `readVars`. -/
  defReadVars : Std.HashSet String := {}
  /-- The state variables whose reads go to the local holding their value before the step. -/
  pre : Std.HashSet String := {}
  /-- Whether a read of a state variable is of its value after the step, which `postValues` gives for a
  variable the step assigns. -/
  readsPost : Bool := false
  /-- The right-hand side of each assignment of the step a guard is about, by variable. -/
  postValues : Std.HashMap String Term := {}
  /-- The shared definitions `quint_library` declared, by name, which the module uses (`emitOrReuse`). -/
  reused : Std.HashMap String Name := {}
  /-- In the SMT encoding, whether assignments are being stated as equations (`Ctx.smtEquations`). -/
  equations : Bool := false
  /-- Parametric deterministic choice functions for finite value universes. -/
  smtChoices : Std.HashMap String Name := {}
  /-- The key definitions (`Ctx.smtKeyDefs`) that put a read's key in its map, since the last reset. -/
  smtKeysUsed : Std.HashSet String := {}
  /-- In the SMT encoding, the unspecified values (`Quint.Smt.unspecified`) of the action being translated,
  which it picks, and of everything else, which the theory declares: each component's name, the sorts of its
  arguments, its own sort, and whether that is `Bool`. -/
  smtPicks : Array (Ident × List Term × Term × Bool) := #[]
  smtUnspecified : Array (Ident × List Term × Term × Bool) := #[]
  /-- The commands `emit` holds back, while it does, to elaborate them after declarations that come before
  them. -/
  deferred : Option (Array (TSyntax `command)) := none

abbrev M := ReaderT Ctx (StateRefT St CommandElabM)

def unsupported {α : Type} (what : String) : M α := throwError "quint_module: {what} is not supported"

/-- Elaborate a generated declaration, after logging it under `(code := true)` and appending it to the
file of `(out := ...)`. Writing before elaborating leaves the file readable when a declaration fails. -/
def emit (cmd : TSyntax `command) : M Unit := do
  if let some held := (← get).deferred then
    return ← modify fun st => { st with deferred := some (held.push cmd) }
  if (← get).showCode then logInfo m!"{cmd}"
  if let some path := (← get).out then
    -- Without this the printer renders names it cannot resolve here as `x✝`, and the file does not
    -- elaborate on its own.
    let text ← liftCoreM (withOptions (fun o => (o.setBool `pp.sanitizeNames false).setBool
      `pp.fullNames true) (PrettyPrinter.ppCommand cmd))
    let h ← IO.FS.Handle.mk path IO.FS.Mode.append
    h.putStrLn s!"{text}\n"
    h.flush
  elabCommand cmd

/-! ## Names -/

/-- The declaration a name refers to. -/
def Ctx.lookup (ctx : Ctx) (n : String) : Option IR.Decl :=
  ctx.decls.get? n

/-- A known constructor application: the variant's label and its payload, if it has one. Sees through the
definitions Quint generates for each variant, `Commit` and `RMPrepared(rm)`. -/
def Ctx.asCtor (ctx : Ctx) : IR.Expr → Option (String × Option IR.Expr)
  | .app _ "variant" [.str _ label, payload] =>
    some (label, match payload with | .app _ "Tup" [] => none | p => some p)
  | .name _ n =>
    match ctx.lookup n with
    | some (.def _ _ _ (.app _ "variant" [.str _ label, .app _ "Tup" []]) _) => some (label, none)
    | _ => none
  | .app _ op [arg] =>
    match ctx.lookup op with
    | some (.def _ _ _ (.lambda _ [(_, p)] _ (.app _ "variant" [.str _ label, .name _ q])) _) =>
      if p == q then some (label, some arg) else none
    | _ => none
  | _ => none

/-- A name of the module for a Quint label or variable, with a trailing `_` when Veil or Lean already
takes it, or the module does: in `veil module m`, Veil's own `m.Theory` would read as a field of `m`. -/
def escaped (s : String) : M String := do
  pure (if veilNames.contains s || leanKeywords.contains s || s == (← read).main.name then s ++ "_" else s)

/-- The Lean identifier of a Quint name, with a state variable read inside an action going to the local
that holds its value before the step. -/
def ident (n : String) : M Ident := do
  if let some c := (← get).reused.get? n then return mkIdent (`_root_ ++ c)
  let s ← escaped n
  if (← get).inAction && (← read).vars.contains n then
    modify fun st => { st with readVars := st.readVars.insert n }
    if (← get).pre.contains n then return mkIdent (Name.mkSimple (s ++ "~"))
  pure (mkIdent (Name.mkSimple s))

/-- A call of the definition `d` by its name `n`: inside an action, the state variables `d` reads are
recorded, since a ghost function reads the state its statement runs in. -/
def defIdent (d : String) (n : String) : M Ident := do
  if (← get).inAction then
    let rs := (← read).defReads.getD d []
    modify fun st => { st with defReadVars := st.defReadVars.insertMany rs }
  ident n

/-- The name in basicSpells of the definition `n`, when Lean's core library has a function that means the
same, which every use of `n` is written as instead (`spellTerm`). A module named `basicSpells` is taken to
be Quint's. -/
def Ctx.coreSpell? (ctx : Ctx) (n : String) : Option String :=
  let (m, f) := (ctx.output.origins.get? n).getD (ctx.main.name, n)
  if m == "basicSpells" && ["unwrap", "findFirst"].contains f then some f else none

/-- The core function for the spell `f` (`Ctx.coreSpell?`), applied to `args`. `unwrap` is `Option.get!`,
whose `none` is the default value, with a panic at run time, where Quint stops with an error. -/
def spellTerm (f : String) (args : Array Term) : M Term :=
  match f, args with
  | "unwrap", #[] => `(Option.get!)
  | "unwrap", #[o] => `(Option.get! $o)
  | "findFirst", #[] => `(fun l p => List.find? p l)
  | "findFirst", #[l, p] => `(List.find? $p $l)
  | _, _ => unsupported s!"{f} with {args.size} arguments"

/-- `k` reading the state as it is after the step: a state variable the step assigns is the right-hand
side of its assignment (`postValues`), and any other is its field, which the step leaves as it was. -/
def withPost {α : Type} (k : M α) : M α := do
  let saved := (← get).readsPost
  modify fun s => { s with readsPost := true }
  try k finally modify fun s => { s with readsPost := saved }

/-- The name of the state field for `x`, as a string to build derived names from. -/
def fieldName (x : String) : M String := do
  escaped x

/-- The state field `x` itself, which only an assignment names inside an action. -/
def field (x : String) : M Ident := do
  pure (mkIdent (Name.mkSimple (← fieldName x)))

/-- The local holding the value of state variable `x` before the step. -/
def preState (x : String) : M Ident := do
  pure (mkIdent (Name.mkSimple ((← fieldName x) ++ "~")))

def freshName (base : String) : M Ident := do
  let i := (← get).fresh
  modify fun s => { s with fresh := i + 1 }
  pure (mkIdent (Name.mkSimple s!"{base}_{i}"))

/-! ## Types -/

/-- The fields of a record row, in name order. -/
def sortedFields (r : Row) : List (String × Ty) :=
  (r.fields.toArray.qsort (fun a b => a.1 < b.1)).toList

/-- The fields of a tuple row, in index order. -/
def tupleFields (r : Row) : List Ty :=
  (r.fields.toArray.qsort (fun a b => a.1.toNat! < b.1.toNat!)).toList.map (·.2)

/-- The constructor for the variant `label` of the sum type `r`, under its type's namespace: Lean's
`Option`'s are lowercase. -/
private def ctorName (r : Row) (label : String) : Name :=
  Name.mkSimple (if (Ty.sum r).optionPayload?.isSome then label.decapitalize else label)

mutual
  /-- A canonical spelling of a type, the key of generated record and sum types. -/
  partial def tyKey : Ty → String
    | .bool => "bool" | .int => "int" | .str => "str"
    | .const n => n
    | .var v => "'" ++ v
    | .set e => s!"Set[{tyKey e}]"
    | .list e => s!"List[{tyKey e}]"
    | .fn a b => s!"({tyKey a} -> {tyKey b})"
    | .oper args r => s!"({", ".intercalate (args.map tyKey)}) => {tyKey r}"
    | .tup r => s!"({", ".intercalate ((tupleFields r).map tyKey)})"
    | .record r => s!"\{ {rowKey r} }"
    | .sum r => s!"< {rowKey r} >"
    | .app c args => s!"{c}[{", ".intercalate (args.map tyKey)}]"

  partial def rowKey (r : Row) : String :=
    let fields := (r.fields.toArray.qsort (fun a b => a.1 < b.1)).toList
    ", ".intercalate (fields.map fun (n, t) => s!"{n}: {tyKey t}") ++
      match r.tailVar with | some v => s!" | {v}" | none => ""
end

/-- The key of the generic type of the record or sum `t`: its labels, and which variants carry nothing,
which a type of its own does not take as a parameter. -/
def labelKey : Ty → String
  | .record r => "#{" ++ ", ".intercalate ((sortedFields r).map (·.1)) ++ "}"
  | .sum r => "#<" ++ ", ".intercalate ((sortedFields r).map fun (l, p) => if isUnit p then l else l ++ "(_)") ++ ">"
  | t => tyKey t

/-- The fields of a record, or the variants of a sum that carry something, in name order: what its generic
type takes a parameter for. -/
private def genericFields : Ty → List (String × Ty)
  | .record r => sortedFields r
  | .sum r => (sortedFields r).filter (!isUnit ·.2)
  | _ => []

mutual
  /-- `σ` with the variables of `pattern` bound to what stands in their place in `t`, a type the
  typechecker found to be an instance of `pattern`. -/
  partial def matchTy (σ : TySubst) : Ty → Ty → TySubst
    | .var v, t => if σ.tys.contains v then σ else { σ with tys := σ.tys.insert v t }
    | .set a, .set b | .list a, .list b => matchTy σ a b
    | .fn a r, .fn b s => matchTy (matchTy σ a b) r s
    | .oper as r, .oper bs s => matchTy ((as.zip bs).foldl (fun σ (a, b) => matchTy σ a b) σ) r s
    | .tup p, .tup r | .record p, .record r | .sum p, .sum r => matchRow σ p r
    | .app _ as, .app _ bs => (as.zip bs).foldl (fun σ (a, b) => matchTy σ a b) σ
    | _, _ => σ

  /-- `matchTy` for rows: the fields `pattern` names by name, and its row variable to the other fields. -/
  partial def matchRow (σ : TySubst) (pattern r : Row) : TySubst :=
    let fields := r.fields
    let σ := pattern.fields.foldl (init := σ) fun σ (n, t) =>
      match fields.lookup n with
      | some u => matchTy σ t u
      | none => σ
    match pattern.tailVar with
    | some v =>
      if σ.rows.contains v then σ else
      let rest := fields.filter fun (n, _) => !(pattern.fields.any (·.1 == n))
      let tail := match r.tailVar with | some w => Row.var w | none => .empty
      { σ with rows := σ.rows.insert v (.row rest tail) }
    | none => σ
end

/-- The instances a generated type derives. With `display`, also Veil's `Display`, which shows a value in
a trace as a constructor with its arguments rather than as a string of its `Repr`; Veil derives it only
for an inductive type that is not a structure and has no parameters to supply it for. Without `ordLaws`,
not `Std.TransOrd` and `Std.LawfulEqOrd`, which `emitOrdLawsOfField` states instead. -/
private def derivings (display : Bool := false) (ordLaws : Bool := true) (enumeration : Bool := false) :
    M (Array (TSyntax ``Lean.Parser.Command.derivingClass)) :=
  (#[``DecidableEq, ``Hashable, ``Repr, ``Inhabited, ``Ord] ++
    (if ordLaws then #[``Std.TransOrd, ``Std.LawfulEqOrd] else #[]) ++
    (if display then #[``Veil.Display] else #[]) ++
    (if enumeration then #[``Veil.Enumeration] else #[])).mapM fun c =>
    `(Lean.Parser.Command.derivingClass| $(mkIdent c):ident)

/-- The binders of the type variable `v`, with an instance of each of `classes` for it: by default the ones
every `Quint.Set` and `Quint.Map` over it needs. -/
private def typeVarBinders (v : String)
    (classes := #[``Ord, ``Std.TransOrd, ``Std.LawfulEqOrd, ``DecidableEq, ``Hashable, ``Repr, ``Inhabited]) :
    M (Array (TSyntax ``Lean.Parser.Term.bracketedBinder)) := do
  let a := mkIdent (Name.mkSimple v)
  let instances ← classes.mapM fun c => `(Lean.Parser.Term.bracketedBinderF| [$(mkIdent c) $a])
  pure (#[← `(Lean.Parser.Term.bracketedBinderF| {$a : Type})] ++ instances)

/-- `Std.TransOrd` and `Std.LawfulEqOrd` for `ty`, a type with one constructor of one field of type `t`,
from those of `t`, given those of `params`, the type's parameters. Veil's deriving handler fails on such a
type, as its proof expects the type to stand for a pair. -/
private def emitOrdLawsOfField (ty t : Term) (params : List String := []) : M Unit := do
  for cls in [``Std.TransOrd, ``Std.LawfulEqOrd] do
    let byEquiv := mkCIdent (`Veil ++ cls ++ `by_equiv)
    let binders := (← params.toArray.mapM (typeVarBinders · #[``Ord, cls])).flatten
    emit (← `(command| instance $[$binders:bracketedBinder]* : $(mkCIdent cls) $ty :=
      $byEquiv (α := $t) ⟨fun v => ⟨v⟩, fun ⟨v⟩ => v, fun _ => rfl, fun x => by cases x; rfl⟩
        (fun a b => by show _ = (compare a b).then Ordering.eq; simp only [Ordering.then_eq])))

/-- `Veil.Display` and `Lean.ToJson`, which Veil writes a lasso's states by, for `ty`, the type named `name`
declared for the record or sum `t`: a record shows field by field, a sum as its variant. Without `display`,
only `ToJson`, for a sum Veil derives `Display` for. Each of `params`, the type's parameters, needs the
instance too. -/
private def emitShows (name : Ident) (ty : Term) (t : Ty) (params : List String := []) (display := true) :
    M Unit := do
  let shown := quote name.getId.toString
  let x := mkIdent `x
  let v := mkIdent `v
  -- `f` shows what a field or a variant holds.
  let body (f : Term → M Term) : M Term := match t with
    | .record r => do
      let fields ← (sortedFields r).toArray.mapM fun (n, _) => do
        `(($(quote n), $(← f (← `(($x).$(mkIdent (Name.mkSimple n)):ident)))))
      `(Veil.ValueDisplay.recordJson $shown [$fields,*])
    | .sum r => do
      let alts ← r.fields.toArray.mapM fun (label, payload) => do
        let c := mkIdent (name.getId ++ Name.mkSimple label)
        let ctor ← `(Veil.ValueDisplay.ctorJson $shown $(quote label))
        if isUnit payload then `(Lean.Parser.Term.matchAltExpr| | $c:ident => $ctor [])
        else `(Lean.Parser.Term.matchAltExpr| | $c:ident $v:ident => $ctor [(some "v", $(← f v))])
      `(match $x:ident with $alts:matchAlt*)
    | _ => throwError "quint_module: {name} is not a record or a sum"
  if display then
    let binders := (← params.toArray.mapM (typeVarBinders · #[``Veil.Display])).flatten
    emit (← `(command| instance $[$binders:bracketedBinder]* : Veil.Display $ty where
      display $x:ident := $(← body fun e => `(Veil.Display.display $e))))
  let binders := (← params.toArray.mapM (typeVarBinders · #[``Lean.ToJson])).flatten
  emit (← `(command| instance $[$binders:bracketedBinder]* : Lean.ToJson $ty where
    toJson $x:ident := $(← body fun e => `(Lean.toJson $e))))

/-- The datatype `quint_library` declared for the type of key `key`, which the module then uses as its
own. -/
private def libraryType (key : String) : M (Option Ident) := do
  if (← read).library then return none
  let some n := (libraryTypes.getState (← getEnv)).get? key | return none
  let n := `_root_ ++ n
  modify fun s => { s with typeNames := s.typeNames.insert key n }
  pure (some (mkIdent n))

/-- Record the datatype `name` just declared for the type of structural key `key`, when this is
`quint_library`. -/
private def registerLibraryType (key : String) (name : Ident) : M Unit := do
  if (← read).library then
    let n := (← getCurrNamespace) ++ name.getId
    modifyEnv (libraryTypes.addEntry · (key, n))

/-- A name for a generated type: the alias of the spec when it has one, else built from the labels. -/
private def typeName (key : String) (labels : List String) (kind : String) : M Ident := do
  -- A spec's own `State` would collide with the one Veil declares in every module.
  let base ← escaped <| match (← read).aliases.get? key with
    | some aliasName => aliasName
    | none => kind ++ "_" ++ "_".intercalate labels
  let mut name := base
  let mut i := 1
  while (← get).usedNames.contains name do
    name := s!"{base}{i}"
    i := i + 1
  modify fun s => { s with usedNames := s.usedNames.insert name }
  pure (mkIdent (Name.mkSimple name))

/-- `pair a (pair b c)` for `[a, b, c]`, the right-nested shape of a Quint tuple, its type and its sets of
tuples. `ts` is not empty. -/
private def rightNest (pair : Term → Term → M Term) (ts : List Term) : M Term :=
  ts.dropLast.foldrM pair ts.getLast!

/-- Whether the records or sums with the labels of `t` are one generic type (`declareGeneric`): one over a
type variable of a definition the module declares (`Ctx.generic`), or one `quint_library` declared. -/
private def isGeneric (t : Ty) : M Bool := do
  let key := labelKey t
  pure ((← read).generic.contains key ||
    (!(← read).library && (libraryTypes.getState (← getEnv)).contains key))

/-- The type of every record or sum with the labels of `t`, with a parameter for each of its
`genericFields`, declared on first use. -/
private def declareGeneric (t : Ty) : M Ident := do
  let key := labelKey t
  if let some n := (← get).typeNames.get? key then return mkIdent n
  if let some n ← libraryType key then
    modify fun s => { s with genericTypes := s.genericTypes.insert n.getId }
    return n
  let fields := genericFields t
  let (kind, variants) := match t with
    | .sum r => ("Sum", sortedFields r)
    | _ => ("Rec", fields)
  let name ← typeName key (variants.map (·.1)) kind
  modify fun s => { s with
    typeNames := s.typeNames.insert key name.getId
    genericTypes := s.genericTypes.insert name.getId }
  let params := fields.mapIdx fun i _ => s!"α{i + 1}"
  let paramOf : List (String × Ident) := (fields.map (·.1)).zip (params.map (mkIdent <| Name.mkSimple ·))
  let ps : Array Ident := paramOf.toArray.map (·.2)
  let ty ← `($name $ps*)
  let binders ← ps.mapM fun p => `(Lean.Parser.Term.bracketedBinderF| ($p : Type))
  let oneField := variants.length == 1
  let derivs ← derivings (ordLaws := !oneField)
  match t with
  | .sum _ =>
    let ctors ← variants.toArray.mapM fun (label, _) => do
      let c := mkIdent (Name.mkSimple label)
      match paramOf.lookup label with
      | some p => `(Lean.Parser.Command.ctor| | $c:ident (v : $p))
      | none => `(Lean.Parser.Command.ctor| | $c:ident)
    emit (← `(command| inductive $name:ident $binders* where $[$ctors:ctor]* deriving $derivs,*))
  | _ =>
    let fieldBinders ← paramOf.toArray.mapM fun (n, p) =>
      `(Lean.Parser.Command.structExplicitBinder| ($(mkIdent (Name.mkSimple n)):ident : $p))
    emit (← `(command| structure $name:ident $binders* where
      $[$fieldBinders:structExplicitBinder]* deriving $derivs,*))
  if oneField then emitOrdLawsOfField ty ps[0]! params
  emitShows name ty t params
  registerLibraryType key name
  pure name

mutual
  /-- The Lean type of a Quint type, declaring the record and sum types it mentions. -/
  partial def tyTerm (t : Ty) : M Term := do
    match t with
    -- Unhygienic, so that Veil's `#updr`, which reads a field's type by name, recognizes them.
    | .bool => pure (mkIdent `Bool)
    | .int => pure (mkIdent `Int)
    | .str => `(String)
    | .const n => pure (mkIdent (Name.mkSimple n))
    | .var v => pure (mkIdent (Name.mkSimple v))
    -- Veil chooses how to store a state field from the head of its type, so the container types are
    -- written out rather than through `Quint.Set` and `Quint.Map`, which abbreviate them. The comparator
    -- is written out too: Veil elaborates a field's type again at every statement of an action, and the
    -- default `cmp := by exact compare` would leave one more pending tactic each time, which every later
    -- statement carries along.
    | .set e => do `(Std.ExtTreeSet $(← tyTerm e) $(mkIdent `compare))
    | .list e => do `(List $(← tyTerm e))
    | .fn a b => do `(Std.ExtTreeMap $(← tyTerm a) $(← tyTerm b) $(mkIdent `compare))
    | .oper args r => do
      let r ← tyTerm r
      args.foldrM (fun a acc => do `($(← tyTerm a) → $acc)) r
    | .tup r =>
      match tupleFields r with
      | [] => `(Unit)
      | [t] => tyTerm t
      | ts => do rightNest (fun a b => `($a × $b)) (← ts.mapM tyTerm)
    | .record r => do typeRef (← declareRecord r) t
    | .sum r => do
      match (Ty.sum r).optionPayload? with
      | some p => `(Option $(← tyTerm p))
      | none => typeRef (← declareSum r) t
    | .app c args => do `($(mkIdent (Name.mkSimple c)) $(← args.toArray.mapM tyTerm)*)

  /-- `n`, the type declared for the record or sum `t`: a generic one applied to the types of `t`'s
  `genericFields`. -/
  partial def typeRef (n : Ident) (t : Ty) : M Term := do
    if (← get).genericTypes.contains n.getId then
      `($n $(← (genericFields t).toArray.mapM (tyTerm ·.2))*)
    else pure n

  partial def declareRecord (r : Row) : M Ident := do
    if ← isGeneric (.record r) then return ← declareGeneric (.record r)
    let key := tyKey (.record r)
    if let some n := (← get).typeNames.get? key then return mkIdent n
    if let some n ← libraryType key then return n
    -- Fields in name order, the order `Rec(...)` literals use to call the constructor.
    let fields := sortedFields r
    let fieldTerms ← fields.mapM fun (n, t) => do pure (mkIdent (Name.mkSimple n), ← tyTerm t)
    let name ← typeName key (fields.map (·.1)) "Rec"
    modify fun s => { s with typeNames := s.typeNames.insert key name.getId }
    let binders ← fieldTerms.toArray.mapM fun (n, t) => `(Lean.Parser.Command.structExplicitBinder| ($n:ident : $t))
    let derivs ← derivings (ordLaws := fieldTerms.length != 1)
    emit (← `(command| structure $name:ident where $[$binders:structExplicitBinder]* deriving $derivs,*))
    if let [(_, t)] := fieldTerms then emitOrdLawsOfField name t
    emitShows name name (.record r)
    registerLibraryType key name
    pure name

  partial def declareSum (r : Row) : M Ident := do
    -- A row variable left at a use is one no definition binds, so nothing constrains it. Quint leaves one
    -- on each use of the constructor of a sum type with a single variant, which is that type.
    let r := Row.row r.fields .empty
    if ← isGeneric (.sum r) then return ← declareGeneric (.sum r)
    let key := tyKey (.sum r)
    if let some n := (← get).typeNames.get? key then return mkIdent n
    -- A Veil `enum` is declared inside the module, by `Quint.Smt.emitModule`; here it only takes its name.
    if (← read).enums.contains key then
      let name ← typeName key (r.fields.map (·.1)) "Sum"
      modify fun s => { s with typeNames := s.typeNames.insert key name.getId }
      return name
    if let some n ← libraryType key then return n
    let labels := r.fields
    let ctors ← labels.toArray.mapM fun (label, payload) => do
      let c := mkIdent (Name.mkSimple label)
      if isUnit payload then `(Lean.Parser.Command.ctor| | $c:ident) else
      match payload with
      | t => do
        let t ← tyTerm t
        `(Lean.Parser.Command.ctor| | $c:ident (v : $t))
    let name ← typeName key (labels.map (·.1)) "Sum"
    modify fun s => { s with typeNames := s.typeNames.insert key name.getId }
    let oneField ← match labels with
      | [(_, payload)] => if isUnit payload then pure none else some <$> tyTerm payload
      | _ => pure none
    let derivs ← derivings (display := true) (ordLaws := oneField.isNone)
      (enumeration := labels.all fun (_, p) => isUnit p)
    emit (← `(command| inductive $name:ident where $[$ctors:ctor]* deriving $derivs,*))
    if let some t := oneField then emitOrdLawsOfField name t
    emitShows name name (.sum r) (display := false)
    registerLibraryType key name
    pure name
end

/-- The inferred type of an expression or definition, at the use `Ctx.tySubst` inlines it at. -/
def typeOf (id : Nat) : M Ty := do
  let ctx ← read
  let σ := ctx.tySubst
  match ctx.output.types.get? id with
  | some t =>
    let t := if σ.tys.isEmpty && σ.rows.isEmpty then t else substTy σ t
    -- A variable no definition generalizes is one the spec leaves open, as the element type of
    -- `List()` in an action: the value is the same at every instance, and `Unit` is one.
    let open_ := t.freeVars.filter (!ctx.generalized.contains ·)
    if open_.isEmpty then pure t else
    pure (substTy { tys := Std.HashMap.ofList (open_.map (·, .tup .empty)) } t)
  | none => throwError "quint_module: no inferred type for expression {id}"

/-- `typeOf`, or `none` for an expression `quint_module` builds itself, which has no inferred type. -/
def typeOf? (id : Nat) : M (Option Ty) := do
  if (← read).output.types.contains id then some <$> typeOf id else pure none

/-! ## Expressions -/

/-- Whether an expression is an action: assigns, or chooses non-deterministically, or calls an action.
`all` and `any` of conditions only are the conditions' `and` and `or`. -/
partial def isAction (ctx : Ctx) : IR.Expr → Bool
  | .app _ op args =>
    op == "assign" || op == "oneOf" || args.any (isAction ctx) ||
      (match ctx.lookup op with
       | some (.def _ _ q _ _) => q == "action" || q == "nondet" || q == "run"
       | _ => false)
  | .name _ n =>
    match ctx.lookup n with
    | some (.def _ _ q _ _) => q == "action" || q == "nondet" || q == "run"
    | _ => false
  | .lambda _ _ _ body => isAction ctx body
  | .letE _ _ _ q value body => q == "nondet" || isAction ctx value || isAction ctx body
  | _ => false

def mkIntLit (i : Int) : M Term := do
  let lit := Syntax.mkNumLit (toString i.natAbs)
  if i < 0 then `((-$lit : Int)) else `(($lit : Int))

private def snds (acc : Term) : Nat → M Term
  | 0 => pure acc
  | k + 1 => do snds (← `(($acc).2)) k

/-- `t.i` for a tuple `t` of arity `n` (right-nested pairs), with `i` counted from 1 as in Quint. -/
private def tupleItem (t : Term) (n i : Nat) : M Term := do
  if i == n then snds t (n - 1) else do
    let inner ← snds t (i - 1)
    `(($inner).1)

/-- `e` with its inferred type ascribed, when that type is closed. -/
private def ascribe (id : Nat) (e : Term) : M Term := do
  let t ← typeOf id
  if t.freeVars.isEmpty && (match t with | .record r | .sum r => r.tailVar.isNone | _ => true) then
    `(($e : $(← tyTerm t)))
  else pure e

/-- `k`, which translates the body of the definition `defId`, at a use of it of type `useType`: with the
type variables and row variables of the definition standing for what they are there, and none of the
local operators of the use in scope. -/
private def atUse (defId : Nat) (useType : Option Ty) (k : M α) (keepLocals : Bool := false) : M α := do
  let σ := match (← read).output.types.get? defId, useType with
    | some scheme, some t => matchTy {} scheme t
    | _, _ => {}
  withReader (fun c => { c with tySubst := σ, locals := if keepLocals then c.locals else {} }) k

/-- Whether what a `let` binds, with definition id `defId` and qualifier `q`, is translated at each of its
uses rather than bound: its type `needsInstance`, as the operator `(r) => r.with("a", 1)`, or has a record
over a type variable, as the value `{ m: Map() }`, which Quint generalizes and each use instantiates, where
a Lean `let` has one type. A `nondet` is bound: each use of it reads the one value it chose. -/
private def inlinedLocal (defId : Nat) (q : String) : M Bool := do
  if q == "nondet" then return false
  pure (((← read).output.types.get? defId).any fun t => needsInstance t || !t.recordsOverVars.isEmpty)

/-- `k` with `n` among the definitions translated at each use. -/
private def withInlinedLocal (n : String) (defId : Nat) (value : IR.Expr) (k : M α) : M α :=
  withReader (fun c => { c with inlineLocals := c.inlineLocals.insert n (defId, value) }) k

/-- `k` with `n` among the local operators, when `value`, what a `let` binds to `n`, defines one. -/
private def withLocal (n : String) (value : IR.Expr) (k : M α) : M α :=
  match value with
  | .lambda .. => withReader (fun c => { c with locals := c.locals.insert n }) k
  | _ => k

/-- `k` with the parameters `params` of an operator among the local operators: a parameter of an
operator type is a function the body applies. -/
private def withParams (params : List (Nat × String)) (k : M α) : M α :=
  withReader (fun c => { c with locals := c.locals.insertMany (params.map (·.2)) }) k

/-- Names a definition refers to. -/
partial def references : IR.Expr → List String
  | .name _ n => [n]
  | .app _ op args => op :: args.flatMap references
  | .lambda _ _ _ body => references body
  | .letE _ _ _ _ v b => references v ++ references b
  | _ => []

/-- The names an expression binds, by `let`, `nondet` or a lambda parameter. -/
partial def bindings : IR.Expr → List String
  | .app _ _ args => args.flatMap bindings
  | .lambda _ ps _ body => ps.map (·.2) ++ bindings body
  | .letE _ _ n _ v b => n :: bindings v ++ bindings b
  | _ => []

/-- `body` with `a` in place of the name `p`, or `none` where that would change what a name means: when
`body` binds `p` or a name `a` refers to, or calls `p` while `a` is not a name. -/
def substitute (p : String) (a : IR.Expr) (body : IR.Expr) : Option IR.Expr :=
  if (bindings body).any (fun n => n == p || (references a).contains n) then none else go body
where
  go : IR.Expr → Option IR.Expr
    | .name id n => some (if n == p then a else .name id n)
    | .app id op args => do
      let op ← if op != p then pure op else match a with
        | .name _ m => pure m
        | _ => none
      pure (.app id op (← args.mapM go))
    | .lambda id ps q b => (.lambda id ps q ·) <$> go b
    | .letE id d n q v b => do pure (.letE id d n q (← go v) (← go b))
    | e => some e

/-- The components a tupled lambda `((a, b)) => body` binds, by position, and its body without those
bindings. Quint parses the pattern as one parameter `p` and a `let` per component, `a = p._1`; `none` when
the body uses `p` other than through them. -/
partial def untuple (p : String) : IR.Expr → Option (List (Nat × String) × IR.Expr)
  | .letE _ _ x _ (.app _ "item" [.name _ q, .int _ i]) body =>
    if q != p then none else do
      let (xs, rest) ← untuple p body
      pure ((i.toNat, x) :: xs, rest)
  | body => if (references body).contains p then none else some ([], body)

def strLit (e : IR.Expr) : M String := match e with
  | .str _ s => pure s
  | _ => unsupported "a non-literal field name"

/-- `Int` or `Nat` when `e` names Quint's builtin set of that name, which no definition of the spec
shadows: an infinite set, which a membership reads as a predicate and nothing else can enumerate. -/
private def infiniteSet (e : IR.Expr) : M (Option String) := do
  match e with
  | .name _ n => pure (if (n == "Int" || n == "Nat") && ((← read).lookup n).isNone then some n else none)
  | _ => pure none

mutual
  /-- The Lean term of a Quint expression. -/
  partial def exprTerm (e : IR.Expr) : M Term := do
    match e with
    | .app _ "next" [a] => withPost (exprTerm a)
    | .name id n => do
      if (← get).readsPost && (← read).vars.contains n then
        if let some t := (← get).postValues.get? n then return t
      if isAction (← read) e then unsupported s!"the action {n} in an expression"
      -- The builtin set of booleans, which `ident` would spell as the Lean type.
      if n == "Bool" && ((← read).lookup n).isNone then
        return ← exprTerm (.app id "Set" [.bool id false, .bool id true])
      if let some (defId, value) := (← read).inlineLocals.get? n then
        return ← atUse defId (← typeOf? id) (exprTerm value) (keepLocals := true)
      if let some n ← infiniteSet e then
        unsupported s!"the infinite set {n} other than in a membership: Veil's model checker enumerates every set it reads"
      match (← read).lookup n with
      | some (.def defId dn _ body _) =>
        if let some f := (← read).coreSpell? dn then return ← spellTerm f #[]
        -- A variant named through the definition Quint generates for it is written as the constructor:
        -- the solver does not unfold the definition, and would take `Committed` and `Working` for
        -- values that might be equal.
        if (← read).inlined.contains dn || ((← read).asCtor body).isSome then
          atUse defId (← typeOf? id) (exprTerm body)
        else if let some t ← instanceTerm defId body (← typeOf? id) then pure t
        else pure (← defIdent dn n)
      | _ => pure (← ident n)
    | .bool _ b => if b then `(true) else `(false)
    | .int _ i => mkIntLit i
    | .str _ s => pure (Syntax.mkStrLit s)
    | .lambda _ params _ body => do
      let body ← withParams params (exprTerm body)
      params.foldrM (init := body) fun (id, n) acc => do
        let x ← ident n
        let t ← typeOf id
        if t.freeVars.isEmpty then
          let t ← tyTerm t
          `(fun ($x:ident : $t) => $acc)
        else `(fun $x:ident => $acc)
    | .letE _ defId n q value body => do
      if q == "nondet" then unsupported "nondet outside an action"
      if ← inlinedLocal defId q then return ← withInlinedLocal n defId value (exprTerm body)
      let x ← ident n
      `(let $x:ident := $(← exprTerm value); $(← withLocal n value (exprTerm body)))
    | .app id op args => appTerm id op args

  /-- The definition `defId`, whose body is `body`, inlined at a use of type `useType`, when it
  `needsInstance`: its body, a `fun` for an operator, with every type variable and row variable replaced by
  what it is at that use. -/
  partial def instanceTerm (defId : Nat) (body : IR.Expr) (useType : Option Ty) : M (Option Term) := do
    let some scheme := (← read).output.types.get? defId | return none
    if !needsInstance scheme then return none
    some <$> atUse defId useType (exprTerm body)

  /-- `e` with its type ascribed, for a use that resolves a name from the head of that type: a field, a
  record update, a tuple item or a `match`. Lean may not have inferred the type by then, as for a state
  variable read inside an action. -/
  partial def headTerm (e : IR.Expr) : M Term := do
    if (← typeOf? e.id).isSome then ascribe e.id (← exprTerm e) else exprTerm e

  partial def args2 (op : String) (args : List IR.Expr) : M (Term × Term) := do
    match args with
    | [a, b] => pure (← exprTerm a, ← exprTerm b)
    | _ => unsupported s!"{op} with {args.length} arguments"

  partial def args1 (op : String) (args : List IR.Expr) : M Term := do
    match args with
    | [a] => exprTerm a
    | _ => unsupported s!"{op} with {args.length} arguments"

  partial def args3 (op : String) (args : List IR.Expr) : M (Term × Term × Term) := do
    match args with
    | [a, b, c] => pure (← exprTerm a, ← exprTerm b, ← exprTerm c)
    | _ => unsupported s!"{op} with {args.length} arguments"

  /-- The cases of a `match`: a unit payload has no field, so its binder is bound to `()` instead. -/
  partial def matchAlts (row : Row) : List IR.Expr → M (List (TSyntax ``Lean.Parser.Term.matchAltExpr))
    | label :: .lambda _ [(_, x)] _ body :: rest => do
      let l ← strLit label
      let body ← exprTerm body
      let alt ← if l == "_" then `(Lean.Parser.Term.matchAltExpr| | _ => $body)
        else
          let c := mkIdent (ctorName row l)
          let x ← ident x
          match row.fields.find? (·.1 == l) with
          | some (_, p) =>
            if isUnit p then `(Lean.Parser.Term.matchAltExpr| | .$c:ident => let $x:ident := (); $body)
            else `(Lean.Parser.Term.matchAltExpr| | .$c:ident $x:ident => $body)
          | none => `(Lean.Parser.Term.matchAltExpr| | .$c:ident $x:ident => $body)
      pure (alt :: (← matchAlts row rest))
    | [] => pure []
    | _ => unsupported "a match case that is not a label and a one-parameter lambda"

  partial def recPairs : List IR.Expr → M (List (String × Term))
    | n :: v :: rest => do
      let n ← strLit n
      let v ← exprTerm v
      pure ((n, v) :: (← recPairs rest))
    | [] => pure []
    | _ => unsupported "a record with an odd number of arguments"

  partial def mapEntry (p : IR.Expr) : M Term := do
    match p with
    | .app _ "Tup" [k, v] => do
      let k ← exprTerm k
      let v ← exprTerm v
      `(($k, $v))
    | _ => unsupported "a Map entry that is not a pair"

  /-- The element type of a set expression. -/
  partial def elemType (s : IR.Expr) : M Term := do
    match ← typeOf s.id with
    | .set e => tyTerm e
    | _ => unsupported "a quantifier over something that is not a set"

  partial def appTerm (id : Nat) (op : String) (args : List IR.Expr) : M Term := do
    let ctx ← read
    if let some (defId, value) := ctx.inlineLocals.get? op then
      let argTypes ← args.mapM (typeOf? ·.id)
      let resType ← typeOf? id
      let useType : Option Ty := do pure (.oper (← argTypes.mapM (·)) (← resType))
      let f ← atUse defId useType (exprTerm value) (keepLocals := true)
      return ← `($f $(← args.toArray.mapM exprTerm)*)
    if ctx.locals.contains op then
      let f ← ident op
      return ← `($f $(← args.toArray.mapM exprTerm)*)
    if let some (.def defId dn q body _) := ctx.lookup op then
      if q == "action" || q == "nondet" || q == "run" then unsupported s!"the action {op} in an expression"
      if let some f := ctx.coreSpell? dn then return ← spellTerm f (← args.toArray.mapM exprTerm)
      if let some (label, some payload) := ctx.asCtor (.app id op args) then
        return ← exprTerm (.app id "variant" [.str 0 label, payload])
      let as ← args.toArray.mapM exprTerm
      let argTypes ← args.mapM (typeOf? ·.id)
      let resType ← typeOf? id
      let useType : Option Ty := do pure (.oper (← argTypes.mapM (·)) (← resType))
      let f ← match ← instanceTerm defId body useType with
        | some t => pure t
        | none => defIdent dn op
      -- A type variable of a polymorphic definition may appear in its result only, as in `List()`'s.
      let polymorphic := ((ctx.output.types.get? defId).map (!·.freeVars.isEmpty)).getD false
      return ← if polymorphic && resType.isSome then ascribe id (← `($f $as*)) else `($f $as*)
    match op with
    -- booleans
    | "and" => do
      let as ← args.mapM exprTerm
      match as with
      | [] => `(true)
      | a :: rest => rest.foldlM (fun acc b => `($acc && $b)) a
    | "or" => do
      let as ← args.mapM exprTerm
      match as with
      | [] => `(false)
      | a :: rest => rest.foldlM (fun acc b => `($acc || $b)) a
    | "not" => do `(!$(← args1 op args))
    -- The condition itself, as `quint compile --target tlaplus` writes it.
    | "assert" => args1 op args
    | "implies" => do let (a, b) ← args2 op args; `(!$a || $b)
    | "iff" => do let (a, b) ← args2 op args; `($a == $b)
    | "eq" => do let (a, b) ← args2 op args; `(decide ($a = $b))
    | "neq" => do let (a, b) ← args2 op args; `(decide ($a ≠ $b))
    | "ite" => do let (c, a, b) ← args3 op args; `(if $c = true then $a else $b)
    -- integers
    | "iadd" => do let (a, b) ← args2 op args; `($a + $b)
    | "isub" => do let (a, b) ← args2 op args; `($a - $b)
    | "imul" => do let (a, b) ← args2 op args; `($a * $b)
    | "idiv" => do let (a, b) ← args2 op args; `(Quint.Int.div $a $b)
    | "imod" => do let (a, b) ← args2 op args; `(Quint.Int.mod $a $b)
    | "ipow" => do let (a, b) ← args2 op args; `(Quint.Int.pow $a $b)
    | "iuminus" => do `(-$(← args1 op args))
    | "ilt" => do let (a, b) ← args2 op args; `(decide ($a < $b))
    | "igt" => do let (a, b) ← args2 op args; `(decide ($a > $b))
    | "ilte" => do let (a, b) ← args2 op args; `(decide ($a ≤ $b))
    | "igte" => do let (a, b) ← args2 op args; `(decide ($a ≥ $b))
    | "to" => do let (a, b) ← args2 op args; `(Quint.Set.to $a $b)
    -- sets
    | "Set" => do
      let as ← args.toArray.mapM exprTerm
      ascribe id (← `(Quint.Set.ofList [$as,*]))
    | "in" | "contains" => do
      let (elem, set) ← match op, args with
        | "in", [a, s] | "contains", [s, a] => pure (a, s)
        | _, _ => unsupported s!"{op} with {args.length} arguments"
      match ← infiniteSet set with
      | some "Nat" => `(decide (0 ≤ $(← exprTerm elem)))
      | some _ => `(true)
      | none => `(Quint.Set.mem $(← exprTerm elem) $(← exprTerm set))
    | "union" => do let (a, b) ← args2 op args; `(Quint.Set.union $a $b)
    | "intersect" => do let (a, b) ← args2 op args; `(Quint.Set.intersect $a $b)
    | "exclude" => do let (a, b) ← args2 op args; `(Quint.Set.exclude $a $b)
    | "subseteq" => do let (a, b) ← args2 op args; `(Quint.Set.subseteq $a $b)
    | "filter" => do let (s, f) ← args2 op args; `(Quint.Set.filter $s $f)
    | "map" => do let (s, f) ← args2 op args; `(Quint.Set.map $s $f)
    | "fold" => do let (s, i, f) ← args3 op args; `(Quint.Set.fold $s $i $f)
    | "forall" => do let (s, f) ← args2 op args; `(Quint.Set.forall $s $f)
    | "exists" => do let (s, f) ← args2 op args; `(Quint.Set.exists $s $f)
    | "size" => do `(Quint.Set.size $(← args1 op args))
    | "isFinite" => do `(Quint.Set.isFinite $(← args1 op args))
    | "powerset" => do `(Quint.Set.powerset $(← args1 op args))
    | "flatten" => do `(Quint.Set.flatten $(← args1 op args))
    | "chooseSome" => do `(Quint.Set.chooseSome $(← args1 op args))
    | "getOnlyElement" => do `(Quint.Set.getOnlyElement $(← args1 op args))
    | "tuples" => do
      if args.length < 2 then unsupported s!"tuples with {args.length} arguments"
      rightNest (fun a b => `(Quint.Set.tuples2 $a $b)) (← args.mapM exprTerm)
    | "allListsUpTo" => do let (s, n) ← args2 op args; `(Quint.Set.allListsUpTo $s $n)
    | "oneOf" => unsupported "oneOf outside `nondet x = s.oneOf()`"
    -- maps
    | "Map" => do
      let pairs ← args.toArray.mapM mapEntry
      ascribe id (← `(Quint.Map.ofList [$pairs,*]))
    | "get" => do let (m, k) ← args2 op args; `(Quint.Map.get $m $k)
    | "keys" => do `(Quint.Map.keys $(← args1 op args))
    | "put" | "set" => do let (m, k, v) ← args3 op args; `(Quint.Map.put $m $k $v)
    | "setBy" => do let (m, k, f) ← args3 op args; `(Quint.Map.setBy $m $k $f)
    | "mapBy" => do let (s, f) ← args2 op args; `(Quint.Map.mapBy $s $f)
    | "setToMap" => do `(Quint.Map.setToMap $(← args1 op args))
    | "setOfMaps" => do let (d, c) ← args2 op args; `(Quint.Map.setOfMaps $d $c)
    -- records
    | "Rec" => do
      let pairs ← recPairs args
      let sorted := pairs.toArray.qsort (fun a b => a.1 < b.1)
      let ty ← match ← typeOf id with
        | .record r => declareRecord r
        | _ => unsupported "a record literal whose type is not a record"
      let mk := mkIdent (ty.getId ++ `mk)
      let vals := sorted.map (·.2)
      let v ← `($mk $vals*)
      -- A generic type takes its parameters from the fields, which `List()` leaves open.
      if (← get).genericTypes.contains ty.getId then ascribe id v else pure v
    | "field" => do
      match args with
      | [r, f] => do
        let r ← headTerm r
        let f := mkIdent (Name.mkSimple (← strLit f))
        `(($r).$f:ident)
      | _ => unsupported "field with the wrong arguments"
    | "fieldNames" => do
      match args with
      | [r] =>
        match ← typeOf r.id with
        | .record row => do
          let names := row.fields.map fun (n, _) => Syntax.mkStrLit n
          `((Quint.Set.ofList [$(names.toArray),*] : Quint.Set String))
        | _ => unsupported "fieldNames of a non-record"
      | _ => unsupported "fieldNames with the wrong arguments"
    | "with" => do
      match args with
      | [r, f, v] => do
        let r ← headTerm r
        let f := mkIdent (Name.mkSimple (← strLit f))
        `({ $r with $f:ident := $(← exprTerm v) })
      | _ => unsupported s!"{op} with {args.length} arguments"
    -- tuples
    | "Tup" => do
      let as ← args.mapM exprTerm
      match as with
      | [] => `(())
      | [a] => pure a
      | as => rightNest (fun a b => `(($a, $b))) as
    | "item" => do
      match args with
      | [t, .int _ i] =>
        match ← typeOf t.id with
        | .tup r => tupleItem (← headTerm t) (tupleFields r).length i.toNat
        | _ => unsupported "item of a non-tuple"
      | _ => unsupported "item with a non-literal index"
    -- lists
    | "List" => do
      let as ← args.toArray.mapM exprTerm
      ascribe id (← `([$as,*]))
    | "append" => do let (l, x) ← args2 op args; `($l ++ [$x])
    | "concat" => do let (a, b) ← args2 op args; `($a ++ $b)
    | "head" => do `(Quint.List.head $(← args1 op args))
    | "tail" => do `(Quint.List.tail $(← args1 op args))
    | "length" => do `(Quint.List.length $(← args1 op args))
    | "nth" => do let (l, i) ← args2 op args; `(Quint.List.nth $l $i)
    | "indices" => do `(Quint.List.indices $(← args1 op args))
    | "replaceAt" => do let (l, i, x) ← args3 op args; `(Quint.List.replaceAt $l $i $x)
    | "slice" => do let (l, i, j) ← args3 op args; `(Quint.List.slice $l $i $j)
    | "range" => do let (i, j) ← args2 op args; `(Quint.List.range $i $j)
    | "select" => do let (l, p) ← args2 op args; `(Quint.List.select $l $p)
    | "foldl" => do let (l, i, f) ← args3 op args; `(Quint.List.foldl $l $i $f)
    | "foldr" => do let (l, i, f) ← args3 op args; `(Quint.List.foldr $l $i $f)
    -- sum types
    | "variant" => do
      match args with
      | [label, payload] =>
        let label ← strLit label
        let row ← match ← typeOf id with
          | .sum r => pure r
          | _ => unsupported "a variant whose type is not a sum type"
        let isOption := (Ty.sum row).optionPayload?.isSome
        let ty ← if isOption then pure (mkIdent ``Option) else declareSum row
        let ctor := mkIdent (ty.getId ++ ctorName row label)
        let v : Term ← match payload with
          | .app _ "Tup" [] => pure ctor
          | p => do `($ctor $(← exprTerm p))
        -- `Option` and a generic type take their parameters from where the value goes, which
        -- `None == None` leaves open.
        if isOption || (← get).genericTypes.contains ty.getId then ascribe id v else pure v
      | _ => unsupported "variant with the wrong arguments"
    | "matchVariant" => do
      match args with
      | scrutinee :: cases =>
        let row ← match ← typeOf scrutinee.id with
          | .sum r => pure r
          | _ => unsupported "matching on a non-sum type"
        let alts ← matchAlts row cases
        let alts : Array (TSyntax ``Lean.Parser.Term.matchAlt) := alts.toArray.map fun a => ⟨a.raw⟩
        let s ← headTerm scrutinee
        `(match $s:term with $alts:matchAlt*)
      | _ => unsupported "matchVariant without a scrutinee"
    | "actionAll" | "actionAny" =>
      if args.any (isAction ctx) then unsupported s!"the action operator {op} in an expression"
      appTerm id (if op == "actionAll" then "and" else "or") args
    | "assign" => unsupported s!"the action operator {op} in an expression"
    | _ => unsupported s!"the operator {op}"
end

/-! ## Propositions

An invariant or an assumption is a proposition in Veil, not a `Bool`: that is what the SMT backend reads
and what a Lean proof works with. A Quint expression is `Bool`-valued, so the connectives, the comparisons
and the quantifiers over sets become their `Prop` forms, and anything else is read back with `= true`. A
`match` is read back too: the model checker decides every invariant, and Lean synthesizes no `Decidable`
instance for a `match` whose cases are propositions. -/

/-- A Quint expression as a proposition. -/
partial def propTerm (e : IR.Expr) : M Term := do
  match e with
  | .app id "actionAll" args | .app id "actionAny" args =>
    if args.any (isAction (← read)) then exprTerm e
    else propTerm (.app id (if e matches .app _ "actionAll" _ then "and" else "or") args)
  | .app _ "and" args => do
    match ← args.mapM propTerm with
    | [] => `(True)
    | a :: rest => rest.foldlM (fun acc b => `($acc ∧ $b)) a
  | .app _ "or" args => do
    match ← args.mapM propTerm with
    | [] => `(False)
    | a :: rest => rest.foldlM (fun acc b => `($acc ∨ $b)) a
  | .app _ "not" [a] => do `(¬ $(← propTerm a))
  | .app _ "assert" [a] => propTerm a
  | .app _ "implies" [a, b] => do `($(← propTerm a) → $(← propTerm b))
  | .app _ "iff" [a, b] => do `($(← propTerm a) ↔ $(← propTerm b))
  | .app _ "eq" [a, b] | .app _ "neq" [a, b] | .app _ "subseteq" [a, b] => do
    let op := match e with | .app _ op _ => op | _ => ""
    match op with
    | "eq" => do `($(← exprTerm a) = $(← exprTerm b))
    | "neq" => do `($(← exprTerm a) ≠ $(← exprTerm b))
    | _ => do
      let (a, b) := (← exprTerm a, ← exprTerm b)
      `(∀ x ∈ $a, x ∈ $b)
  | .app _ "ilt" [a, b] => do `($(← exprTerm a) < $(← exprTerm b))
  | .app _ "igt" [a, b] => do `($(← exprTerm a) > $(← exprTerm b))
  | .app _ "ilte" [a, b] => do `($(← exprTerm a) ≤ $(← exprTerm b))
  | .app _ "igte" [a, b] => do `($(← exprTerm a) ≥ $(← exprTerm b))
  | .app _ "in" [a, set] | .app _ "contains" [set, a] => do
    match ← infiniteSet set with
    | some "Nat" => `(0 ≤ $(← exprTerm a))
    | some _ => `(True)
    | none => `($(← exprTerm a) ∈ $(← exprTerm set))
  | .app _ "forall" [set, .lambda _ [(_, x)] _ body] | .app _ "exists" [set, .lambda _ [(_, x)] _ body] => do
    let isForall := match e with | .app _ "forall" _ => true | _ => false
    let x ← ident x
    if isForall then `(∀ $x:ident ∈ $(← exprTerm set), $(← propTerm body))
    else `(∃ $x:ident ∈ $(← exprTerm set), $(← propTerm body))
  | .app _ "ite" [c, a, b] => do
    `(($(← propTerm c) → $(← propTerm a)) ∧ (¬ $(← propTerm c) → $(← propTerm b)))
  | .bool _ b => if b then `(True) else `(False)
  | .letE _ defId n q value body => do
    if q == "nondet" then unsupported "nondet in a proposition"
    if ← inlinedLocal defId q then return ← withInlinedLocal n defId value (propTerm body)
    let x ← ident n
    `(let $x:ident := $(← exprTerm value); $(← withLocal n value (propTerm body)))
  | .name _ n => do
    -- A reference to another definition: read its own proposition when it has one.
    match (← read).lookup n with
    | some (.def _ _ q body _) =>
      if ["val", "pureval", "invariant", "observation"].contains q then propTerm body
      else `($(← exprTerm e) = true)
    | _ => `($(← exprTerm e) = true)
  | _ => do `($(← exprTerm e) = true)

/-! ## Actions -/

/-- The parameters and body of a definition, for inlining a call. -/
def lambdaOf : IR.Expr → List (Nat × String) × IR.Expr
  | .lambda _ params _ body => (params, body)
  | e => ([], e)

/-- A Veil statement of a branch, with what it reads and assigns: an assignment takes effect at once, so
a variable read after its own assignment is the one that needs its value from before the step. -/
structure Stmt where
  /-- The statement, or none for a marker that only names the action the branch passes through. -/
  elem : Option (TSyntax `doElem)
  reads : List String := []
  /-- The state variables read through a definition, which no local can stand in for. -/
  defReads : List String := []
  assigns : Option String := none
  /-- The names the statement's expression refers to, and the local it binds: an assignment does not
  move past a statement that binds a name it refers to. -/
  refs : List String := []
  binds : Option String := none
  /-- The user action this marker stands for, which names the Veil action. -/
  through : Option String := none
  /-- The proposition of a `require`, which `actionBody` conjoins with the requires next to it. -/
  guard : Option Term := none

/-- One way an action can run: its Veil statements, in order. -/
abbrev Branch := List Stmt

/-- What `k` builds, with the state variables it reads directly and through definitions. -/
def tracked {α : Type} (k : M α) : M (α × List String × List String) := do
  let outer := (← get).readVars
  let outerDef := (← get).defReadVars
  modify fun s => { s with readVars := {}, defReadVars := {} }
  let a ← k
  let reads := (← get).readVars.toList
  let defReads := (← get).defReadVars.toList
  modify fun s => { s with readVars := outer.insertMany reads, defReadVars := outerDef.insertMany defReads }
  pure (a, reads, defReads)

/-- Record which state variables `k` reads while it builds one statement. -/
def stmt (k : M (TSyntax `doElem)) (assigns : Option String := none) (refs : List String := [])
    (binds : Option String := none) : M Stmt := do
  let (elem, reads, defReads) ← tracked k
  pure { elem := some elem, reads, defReads, assigns, refs, binds }

open Veil in
/-- `require` that the Quint guard `e` holds, or with `pos` false that it does not. The guard is stated as
a proposition, as an invariant is: a quantifier over an uninterpreted type has no `Bool` reading. -/
private def requireProp (e : IR.Expr) (pos : Bool := true) : M Stmt := do
  let (p, reads, defReads) ← tracked (propTerm e)
  let p ← if pos then pure p else `(¬ $p)
  pure { elem := some (← `(doElem| require $p)), reads, defReads, guard := some p, refs := references e }

/-- The state variables a branch reads after assigning them, which is when reading the field is wrong. -/
def Branch.needPre (br : Branch) : List String := Id.run do
  let mut assigned : Std.HashSet String := {}
  let mut need : Std.HashSet String := {}
  for s in br do
    for r in s.reads do
      if assigned.contains r then need := need.insert r
    if let some a := s.assigns then assigned := assigned.insert a
  pure need.toList

/-- The state variables a branch reads through a definition after assigning them: a ghost function reads
the state its statement runs in, and no local can stand in for it. -/
def Branch.lateDefReads (br : Branch) : List String := Id.run do
  let mut assigned : Std.HashSet String := {}
  let mut late : Std.HashSet String := {}
  for s in br do
    for r in s.defReads do
      if assigned.contains r && s.assigns != some r then late := late.insert r
    if let some a := s.assigns then assigned := assigned.insert a
  pure late.toList

/-- The branch in the order Quint's semantics has: the statements that choose and check, in order, then
the assignments, which take effect together, ordered so that one whose right-hand side reads a variable,
directly or through a definition, comes before that variable's own. An assignment stays before a later
statement that binds a name it refers to, which would change what the name means; then, and in a cycle
such as `x' = y, y' = x`, a statement reads a variable after its assignment, which `needPre` covers. -/
def Branch.assignmentsLast (br : Branch) : Branch := Id.run do
  let mut out : Array Stmt := #[]
  let mut pending : Array Stmt := #[]
  for s in br do
    if s.assigns.isSome then pending := pending.push s
    else
      if s.binds.any (fun n => pending.any (·.refs.contains n)) then
        out := out ++ ordered pending
        pending := #[]
      out := out.push s
  pure (out ++ ordered pending).toList
where
  /-- Assignments grouped by variable, a group first when no other group still to come reads its
  variable, else in the order they came. -/
  ordered (sets : Array Stmt) : Array Stmt := Id.run do
    let mut groups : Array (String × Array Stmt) := #[]
    for s in sets do
      let x := s.assigns.getD ""
      match groups.findIdx? (·.1 == x) with
      | some i => groups := groups.modify i fun (x, ss) => (x, ss.push s)
      | none => groups := groups.push (x, #[s])
    let reads (g : String × Array Stmt) : List String :=
      g.2.toList.flatMap fun s => (s.reads ++ s.defReads).filter (· != g.1)
    let mut out : Array Stmt := #[]
    let mut left := groups
    while !left.isEmpty do
      let i := (left.findIdx? fun g => !left.any fun h => h.1 != g.1 && (reads h).contains g.1).getD 0
      out := out ++ left[i]!.2
      left := left.eraseIdx! i
    pure out

open Veil in
/-- The branches of a Quint action: `any` offers alternatives, `all` takes one branch of each conjunct,
and everything else prefixes the branches of what follows it. Each branch becomes one Veil action, so Veil
reports one verification condition per way the system can step. -/
partial def branches (e : IR.Expr) : M (List Branch) := do
  match e with
  | .app _ "actionAll" args =>
    args.foldlM (init := [[]]) fun acc a => do
      let bs ← branches a
      pure (acc.flatMap fun pre => bs.map fun b => pre ++ b)
  | .app _ "actionAny" args => do
    if args.isEmpty then unsupported "an empty any"
    pure (← args.mapM branches).flatten
  | .app _ "assign" [.name _ x, rhs] => plainAssign x rhs
  | .letE _ defId n q value body => do
    if ← inlinedLocal defId q then withInlinedLocal n defId value (branches body)
    else plainLet n q value body
  | .app _ "ite" [c, a, b] => ite c a b e
  | .app _ "matchVariant" (scrutinee :: cases) => matchBranches scrutinee cases
  | .name _ n => inlineCall n [] e
  | .app _ op args => inlineCall op args e
  | _ => do pure [[← requireProp e]]
where
  /-- `match e { L(x) => A, … }` in an action: one alternative per case, which requires that `e` is the
  case's variant, binds the variant's payload to `x`, and runs `A`. A case `_` requires that `e` is
  none of the other variants. -/
  matchBranches (scrutinee : IR.Expr) (cases : List IR.Expr) : M (List Branch) := do
    let row ← match ← typeOf scrutinee.id with
      | .sum r => pure r
      | _ => unsupported "matching on a non-sum type"
    let cs ← matchCases cases
    let others := (cs.map (·.1)).filter (· != "_")
    let mut out : List Branch := []
    for (label, x, body) in cs do
      let (p, reads, defReads) ← tracked do
        let s ← headTerm scrutinee
        let alts ← if label == "_" then do
            let alts ← others.toArray.mapM fun l => do
              `(Lean.Parser.Term.matchAltExpr| | .$(mkIdent (ctorName row l)):ident .. => false)
            pure (alts.push (← `(Lean.Parser.Term.matchAltExpr| | _ => true)))
          else pure #[← `(Lean.Parser.Term.matchAltExpr| | .$(mkIdent (ctorName row label)):ident .. => true),
            ← `(Lean.Parser.Term.matchAltExpr| | _ => false)]
        let alts : Array (TSyntax ``Lean.Parser.Term.matchAlt) := alts.map fun a => ⟨a.raw⟩
        `((match $s:term with $alts:matchAlt*) = true)
      let test : Stmt :=
        { elem := some (← `(doElem| require $p)), reads, defReads, guard := some p, refs := references scrutinee }
      let payload := (row.fields.find? (·.1 == label)).map (·.2)
      let bind ← match payload with
        | some t =>
          if isUnit t then pure [] else do
            let v ← stmt (refs := references scrutinee) (binds := some x) do
              let s ← headTerm scrutinee
              let c := mkIdent (ctorName row label)
              `(doElem| let $(← ident x):ident := match $s:term with | .$c:ident v => v | _ => default)
            pure [v]
        | none => pure []
      for br in ← branches body do
        out := out ++ [test :: bind ++ br]
    pure out

  /-- The cases of a `match`: each label, the name its lambda binds, and its body. -/
  matchCases : List IR.Expr → M (List (String × String × IR.Expr))
    | label :: .lambda _ [(_, x)] _ body :: rest => do pure ((← strLit label, x, body) :: (← matchCases rest))
    | [] => pure []
    | _ => unsupported "a match case that is not a label and a one-parameter lambda"

  -- `x' = x` keeps a variable unchanged, which a Veil action does by not assigning it.
  plainAssign (x : String) (rhs : IR.Expr) : M (List Branch) := match rhs with
  | .name _ y => if x == y then pure [[]] else do
    let target ← field x
    pure [[← stmt (assigns := some x) (refs := [y]) do
      let v ← exprTerm (.name 0 y)
      `(doElem| $target:ident := $v)]]
  | v => do
    let target ← field x
    pure [[← stmt (assigns := some x) (refs := references v) do
      let v ← exprTerm v
      `(doElem| $target:ident := $v)]]

  /-- A `let` or a `nondet` binding in front of the branches of its body. -/
  plainLet (n : String) (q : String) (value body : IR.Expr) : M (List Branch) := do
    let x ← ident n
    let bind ← stmt (refs := references value) (binds := some n) do
      if q == "nondet" then
        match value with
        | .app _ "oneOf" [set] => do
          let set ← exprTerm set
          `(doElem| let $x:ident :| $x:ident ∈ $set)
        | _ => unsupported "a nondet binding that is not `oneOf`"
      else do
        let v ← exprTerm value
        `(doElem| let $x:ident := $v)
    pure ((← withLocal n value (branches body)).map fun br => bind :: br)

  ite (c a b : IR.Expr) (e : IR.Expr) : M (List Branch) := do
    if isAction (← read) a || isAction (← read) b then do
      let yes ← branches a
      let no ← branches b
      let holds ← requireProp c
      let fails ← requireProp c false
      pure ((yes.map fun br => holds :: br) ++ (no.map fun br => fails :: br))
    else do pure [[← requireProp e]]

  /-- A call to a user-defined action, inlined with its arguments bound; anything else is a guard. -/
  inlineCall (op : String) (args : List IR.Expr) (e : IR.Expr) : M (List Branch) := do
    match (← read).lookup op with
    | some (.def _ _ q body _) =>
      if q == "action" || q == "nondet" || q == "run" then
        let (params, body) := lambdaOf body
        if params.length != args.length then
          unsupported s!"calling {op} with {args.length} arguments, not {params.length}"
        -- An argument takes the place of its parameter: a `let` would be one more statement in the
        -- action. Arguments are pure, so the substitution means what the call does, and a state variable in
        -- one is read where the parameter is, which is where `needPre` sees it.
        let mut body := body
        let mut binds := []
        for ((_, p), a) in params.zip args do
          let captured := (references a).any fun n => params.any (·.2 == n)
          if let some b := (if captured then none else substitute p a body) then
            body := b
          else
            let bind ← stmt (refs := references a) (binds := some p) do
              let x ← ident p
              let a ← exprTerm a
              `(doElem| let $x:ident := $a)
            binds := binds ++ [bind]
        let marker : Stmt := { elem := none, through := some op }
        pure ((← branches body).map fun br => marker :: binds ++ br)
      else do pure [[← requireProp e]]
    | _ => do pure [[← requireProp e]]

open Veil in
/-- A branch as an action body: one local per state variable holding its value before the step, then the
branch's statements. Reads go to those locals, so the assignments take effect simultaneously, as Quint's
primed assignments do, and a state field is assigned at most once, which keeps Veil's verification
condition linear in the number of fields. -/
private def actionBody (br : Branch) (needPre : List String) :
    M (Array (TSyntax ``Lean.Parser.Term.doSeqItem)) := do
  let prologue ← needPre.toArray.mapM fun x => do
    let pre ← preState x
    let f ← field x
    `(doElem| let $pre:ident := $f:ident)
  -- Consecutive requires are one, so the action has fewer statements, each of which Veil elaborates along
  -- with the type of every field.
  let mut body := #[]
  let mut guard : Option Term := none
  for s in br do
    match s.guard, s.elem with
    | some g, _ => guard := some (← match guard with | some p => `($p ∧ $g) | none => pure g)
    | none, some e =>
      if let some p := guard then body := body.push (← `(doElem| require $p))
      guard := none
      body := body.push e
    | none, none => pure ()
  if let some p := guard then body := body.push (← `(doElem| require $p))
  (prologue ++ body).mapM fun s => `(Lean.Parser.Term.doSeqItem| $s:doElem)

/-- Translate an action body, with reads of state variables going to the pre-state locals. -/
def inAction {α : Type} (k : M α) : M α := do
  modify fun s => { s with inAction := true }
  try k finally modify fun s => { s with inAction := false }

/-! ## Declarations -/

/-- Definitions `defs` of `m` in dependency order: a definition after everything it refers to, directly or
through a definition of `m` that is inlined rather than declared. -/
partial def sortDefs (m : IR.Module) (defs : List IR.Decl) : List IR.Decl :=
  let names := defs.map (·.name)
  let bodies : Std.HashMap String IR.Expr := Std.HashMap.ofList (m.declarations.filterMap fun d =>
    match d with
    | .def _ n _ e _ => some (n, e)
    | _ => none)
  let rec declared (seen : List String) : List String → List String
    | [] => []
    | n :: todo =>
      if seen.contains n then declared seen todo
      else if names.contains n then n :: declared (n :: seen) todo
      else declared (n :: seen) ((((bodies.get? n).map references).getD []) ++ todo)
  let rec visit (seen : List String) (out : List IR.Decl) : List IR.Decl → List String × List IR.Decl
    | [] => (seen, out)
    | d :: rest =>
      if seen.contains d.name then visit seen out rest
      else
        let deps := match d with
          | .def _ _ _ e _ => declared [d.name] (references e)
          | _ => []
        let (seen, out) := visit (d.name :: seen) out (deps.filterMap fun n => defs.find? (·.name == n))
        visit seen (out ++ [d]) rest
  (visit [] [] defs).2

/-- `m` without the constants nothing refers to, which a model checker would need values for all the
same. -/
def withoutUnusedConstants (m : IR.Module) : IR.Module :=
  let used := Std.HashSet.ofList (m.declarations.flatMap fun d => match d with
    | .def _ _ _ e _ | .assume _ _ e => references e
    | _ => [])
  { m with declarations := m.declarations.filter fun d => match d with
    | .const _ n _ => used.contains n
    | _ => true }

/-- The type variables of the definitions of `m`, its own and the ones a `let` makes. -/
def generalizedTyVars (m : IR.Module) (types : Std.HashMap Nat Ty) : Std.HashSet String :=
  let ids := m.declarations.flatMap fun d => match d with
    | .def id _ _ e _ => id :: letDefs e
    | _ => []
  Std.HashSet.ofList (ids.flatMap fun id => ((types.get? id).map (·.freeVars)).getD [])
where
  letDefs : IR.Expr → List Nat
    | .app _ _ args => args.flatMap letDefs
    | .lambda _ _ _ body => letDefs body
    | .letE _ d _ _ v b => d :: letDefs v ++ letDefs b
    | _ => []

/-- The records and sums, by `labelKey`, over a type variable of a definition of `m` that is declared
rather than inlined (`needsInstance`), which `declareGeneric` gives one type. An inlined definition's own
variables are what they are at each use, so they make none generic. -/
def genericLabels (m : IR.Module) (types : Std.HashMap Nat Ty) : Std.HashSet String :=
  let defs := m.declarations.filterMap fun d => match d with | .def id _ _ e _ => some (id, e) | _ => none
  let declared := Std.HashSet.ofList <| defs.flatMap fun (id, _) =>
    (((types.get? id).filter (!needsInstance ·)).map (·.freeVars)).getD []
  Std.HashSet.ofList <| (defs.flatMap fun (id, e) => id :: exprIds e).flatMap fun id =>
    (((types.get? id).map (·.recordsOverVars)).getD []).filterMap fun t =>
      if t.freeVars.any declared.contains then some (labelKey t) else none
where
  /-- The ids of an expression, of everything inside it, and of what its lambdas and `let`s bind. -/
  exprIds : IR.Expr → List Nat
    | .app id _ args => id :: args.flatMap exprIds
    | .lambda id ps _ body => id :: ps.map (·.1) ++ exprIds body
    | .letE id d _ _ v b => id :: d :: exprIds v ++ exprIds b
    | e => [e.id]

/-- The `roots` each definition reads, through any chain of definitions; only the definitions that read
some. -/
private def readsOf (m : IR.Module) (roots : List String) : Std.HashMap String (List String) := Id.run do
  let defs := m.declarations.filterMap fun d => match d with | .def _ n _ e _ => some (n, e) | _ => none
  let mut reads : Std.HashMap String (Std.HashSet String) := {}
  for (n, e) in defs do
    reads := reads.insert n (Std.HashSet.ofList ((references e).filter roots.contains))
  let mut changed := true
  while changed do
    changed := false
    for (n, e) in defs do
      let cur := reads.getD n {}
      let next := (references e).foldl (fun acc r => acc.insertMany (reads.getD r {}).toList) cur
      if next.size != cur.size then
        reads := reads.insert n next
        changed := true
  pure (reads.fold (fun acc n rs => if rs.isEmpty then acc else acc.insert n rs.toList) {})

private def varsOf (m : IR.Module) : List String :=
  m.declarations.filterMap fun d => match d with | .var _ n _ => some n | _ => none

/-- The state variables each definition reads, through any chain of definitions; only the definitions
that read some. -/
def defReadsOf (m : IR.Module) : Std.HashMap String (List String) :=
  readsOf m (varsOf m)

/-- The state variables, and the definitions that read one through any chain of definitions. -/
def stateReaders (m : IR.Module) : Std.HashSet String :=
  (defReadsOf m).fold (fun acc n _ => acc.insert n) (Std.HashSet.ofList (varsOf m))

/-- The constants, and the definitions that read one through any chain of definitions: the Veil module
declares the constants, so it declares these too. -/
def constReaders (m : IR.Module) : Std.HashSet String :=
  let consts := m.declarations.filterMap fun d => match d with | .const _ n _ => some n | _ => none
  (readsOf m consts).fold (fun acc n _ => acc.insert n) (Std.HashSet.ofList consts)

/-- Whether a definition goes inside the Veil module: it reads the state or a constant. -/
private def insideModule (n : String) : M Bool := do
  pure ((← read).stateReaders.contains n || (← read).constReaders.contains n)

open Veil in
/-- A pure definition as a Lean `def`, one that reads the state as a `ghost function`, and one that reads
a constant as a `theory ghost function`. -/
private def emitDef (id : Nat) (n : String) (e : IR.Expr) : M Unit := do
  let ctx ← read
  let f ← ident n
  let (params, body) := lambdaOf e
  let scheme ← typeOf id
  let retTy := match scheme with | .oper _ r => r | t => t
  let typedParams ← params.mapM fun (pid, p) => do
    pure (← ident p, ← tyTerm (← typeOf pid))
  -- A ghost function takes its parameters as binders: Veil adds the theory and the state after the
  -- ones it declares, so a parameter written into the type would take the theory's place.
  let isGhost := ctx.stateReaders.contains n || ctx.constReaders.contains n
  if isGhost && !typedParams.isEmpty then
    let ret ← tyTerm retTy
    let b ← withParams params (exprTerm body)
    let xs := typedParams.toArray.map (·.1)
    let ts := typedParams.toArray.map (·.2)
    if ctx.stateReaders.contains n then
      emit (← `(command| ghost function $f:ident $[($xs:ident : $ts)]* : $ret := $b))
    else
      emit (← `(command| theory ghost function $f:ident $[($xs:ident : $ts)]* : $ret := $b))
    return
  -- Otherwise the parameters go into the type and the body, so one quotation serves a ghost function
  -- without parameters and Lean's `def`.
  let mut ty ← tyTerm retTy
  for (_, t) in typedParams.reverse do
    ty ← `($t → $ty)
  let mut bodyTerm ← withParams params (exprTerm body)
  for (x, t) in typedParams.reverse do
    bodyTerm ← `(fun ($x:ident : $t) => $bodyTerm)
  if ctx.stateReaders.contains n then
    emit (← `(command| ghost function $f:ident : $ty := $bodyTerm))
  else if ctx.constReaders.contains n then
    emit (← `(command| theory ghost function $f:ident : $ty := $bodyTerm))
  else if scheme.freeVars.isEmpty then
    emit (← `(command| def $f:ident : $ty := $bodyTerm))
  else
    -- A polymorphic definition binds its type variables, and then its parameters, as binders: the
    -- body of `def f : T := body` does not see the variables `T` binds.
    let mut binders : Array (TSyntax ``Lean.Parser.Term.bracketedBinder) := #[]
    for v in scheme.freeVars do
      binders := binders ++ (← typeVarBinders v)
    for (x, t) in typedParams do
      binders := binders.push (← `(Lean.Parser.Term.bracketedBinderF| ($x:ident : $t)))
    emit (← `(command| def $f:ident $binders* : $(← tyTerm retTy) := $(← withParams params (exprTerm body))))

/-- The definition `q::init` or `q::step` stands for, by its own name. -/
def entryPoint (ctx : Ctx) (q : String) : M (String × IR.Expr) := do
  match ctx.lookup q with
  | some (.def _ _ _ (.name _ n) _) =>
    match ctx.lookup n with
    | some (.def _ _ _ e _) => pure (n, e)
    | _ => throwError "quint_module: {n} is not a definition"
  | some (.def _ _ _ e _) => pure (q, e)
  | _ => throwError "quint_module: the spec has no {q}; pass --init or --step"

/-- The named alternatives of `step`: `any { a, b }` of parameterless actions, else `step` itself. -/
def stepActions (ctx : Ctx) (stepName : String) (e : IR.Expr) : List (String × IR.Expr) :=
  match e with
  | .app _ "actionAny" args =>
    let named := args.mapM fun a => match a with
      | .name _ n => match ctx.lookup n with
        | some (.def _ _ "action" body _) => some (n, body)
        | _ => none
      | _ => none
    match named with
    | some alts => alts
    | none => [(stepName, e)]
  | _ => [(stepName, e)]

/-- The same branch with the reads that come after their own assignment taken from the pre-state locals.
A branch that needs none is translated without any, so that its action has no statement it does not
need. -/
private def reread (br : Branch) (body : IR.Expr) (i : Nat) : M Branch := do
  let br := br.assignmentsLast
  let late := br.lateDefReads
  if !late.isEmpty then
    unsupported s!"assignments that read each other through a definition that reads {late}"
  let need := br.needPre
  if need.isEmpty then return br
  modify fun s => { s with pre := Std.HashSet.ofList need }
  let brs ← branches body
  modify fun s => { s with pre := {} }
  match brs[i]? with
  | some br => pure br.assignmentsLast
  | none => unsupported "a branch that changed when it was translated again"

open Veil in
/-- One Veil action per branch of the action `body`, named `name`, numbered when there are several. With
`guard`, each requires a proposition about the step it takes, which reads the state before the step as a
guard does and after it through `withPost`. Quint's assignments take effect together, and a read after
one already goes to the value from before the step, so the assignments come last, after the guard,
which reads each assigned variable's value after the step from the right-hand side of its assignment. -/
def emitActions (name : String) (body : IR.Expr) (guard : Option (M Term)) : M (List Ident) := do
  let brs ← inAction (branches body)
  brs.zipIdx.mapM fun (br, i) => do
    let id := mkIdent (Name.mkSimple (if brs.length == 1 then name else s!"{name}_{i}"))
    let items ← inAction do
      let br ← reread br body i
      let some prop := guard | actionBody br br.needPre
      let (sets, rest) := br.partition (·.assigns.isSome)
      let mut post : Std.HashMap String Term := {}
      for s in sets do
        if let (some x, some e) := (s.assigns, s.elem) then
          if let `(doElem| $_:ident := $rhs) := e then post := post.insert x rhs
      modify fun st => { st with postValues := post }
      let p ← try prop finally modify fun st => { st with postValues := {} }
      let guarded : Stmt := { elem := some (← `(doElem| require $p)), guard := some p }
      actionBody (rest ++ [guarded] ++ sets) br.needPre
    emit (← `(command| action $id:ident { $items* }))
    pure id

open Veil in
/-- A state variable or, with `immutable`, a constant: a field holding a Lean value. -/
private def emitState (n : String) (t : Ty) (isConst : Bool) : M Unit := do
  let name ← field n
  let ty ← tyTerm t
  if isConst then emit (← `(command| param $name:ident : $ty))
  else emit (← `(command| individual $name:ident : $ty))

/-- A definition Quint generates for a variant, which every use inlines as the constructor. -/
private def isVariantDef (e : IR.Expr) : Bool := match e with
  | .lambda _ [_] _ (.app _ "variant" _) | .app _ "variant" _ => true
  | _ => false

open Veil in
/-- A definition declared before the Veil module, or none when `quint_library` declared it as `M.f`, for
the definition `f` of `M`, with the same type and value: the module then uses `M.f`. One of the same name
that differs leaves the module to declare its own, with a warning. -/
private def emitOrReuse (id : Nat) (n : String) (e : IR.Expr) : M Unit := do
  let some (m, f) := (← read).output.origins.get? n | emitDef id n e
  let lib := Name.mkStr (Name.mkSimple m) f
  if !(← getEnv).contains lib then return ← emitDef id n e
  -- Declared to compare, then taken back, with everything it declared on the way.
  let env ← getEnv
  let st ← get
  set { st with out := none, showCode := false }
  emitDef id n e
  let same ← sameConstant ((← getCurrNamespace) ++ Name.mkSimple (← escaped n)) lib
  setEnv env
  set st
  if same then modify fun st => { st with reused := st.reused.insert n lib }
  else
    logWarning m!"quint_module: {lib} is not the {f} of {m} this spec reads, so the spec declares its own"
    emitDef id n e

/-- The types of the state, then the pure definitions, in a namespace named after the main module, which
the Veil module reopens. In a file of Lean's module system they are public, since a private declaration is
out of reach of what Veil generates, and exposed, since a proof in a file that imports this one unfolds
them. The definitions the module declares, in the order they are declared. -/
def emitDefinitions : M (List IR.Decl) := do
  let ctx ← read
  let m := ctx.main
  let moduleName := mkIdent (Name.mkSimple m.name)
  let isModule := (← getEnv).header.isModule
  if isModule then emit (← `(command| @[expose] public section))
  emit (← `(command| namespace $moduleName:ident))
  -- The types of the state, declared up front.
  for d in m.declarations do
    match d with
    | .var _ _ t | .const _ _ t => discard (tyTerm t)
    | _ => pure ()
  let userDefs := m.declarations.filter fun d => match d with
    | .def id n q e _ =>
      -- Invariants and observations are `val`s too; one the module states as an invariant is inlined, as
      -- is one that `needsInstance`, at each of its uses.
      !n.startsWith "q::" && ["pureval", "puredef", "val", "def", "invariant", "observation"].contains q &&
        !ctx.inlined.contains n &&
        !isVariantDef e &&
        (ctx.coreSpell? n).isNone &&
        !((ctx.output.types.get? id).map needsInstance).getD false
    | _ => false
  let sorted := sortDefs m userDefs
  for d in sorted do
    if let .def id n _ e _ := d then
      if !(← insideModule n) then emitOrReuse id n e
  emit (← `(command| end $moduleName:ident))
  if isModule then emit (← `(command| end))
  pure sorted

open Veil in
/-- `after_init` from the bodies of the branches of `init`. Quint's `init` is the disjunction of its
branches, and Veil's `after_init` one program: it picks one of the branches, then runs it. -/
def emitInit (bodies : Array (Array (TSyntax ``Lean.Parser.Term.doSeqItem))) : M Unit := do
  let some last := bodies.back? | unsupported "an init with no branch"
  if bodies.size == 1 then return ← emit (← `(command| after_init { $last* }))
  let k := mkIdent `initBranch
  let mut chain := last
  for (items, i) in (bodies.pop).zipIdx.reverse do
    let c ← `(($k).val = $(Syntax.mkNumLit (toString i)))
    let branch ← `(doElem| if $c then $items* else $chain*)
    chain := #[← `(Lean.Parser.Term.doSeqItem| $branch:doElem)]
  let n := Syntax.mkNumLit (toString bodies.size)
  emit (← `(command| after_init {
    let $k:ident ← pick (Fin $n)
    $chain*
  }))

/-- The name of the Veil action of each branch of each alternative `(n, brs)` of `step`: the user actions
the branch runs through, numbered when that does not tell two branches of `n` apart, else `n`, numbered
when it has several. A name that two alternatives would both give starts with `n`, as `Issue_take` and
`Serve_take` do for `any { Issue, Serve }` when both call `take`. -/
def branchNames (alts : List (String × List Branch)) : M (List (List Ident)) := do
  let called ← alts.mapM fun (_, brs) => brs.mapM fun br => do
    let called ← br.filterMap (·.through) |>.mapM fieldName
    pure (if called.isEmpty then none else some ("_".intercalate (called.map (·.replace "::" "_"))))
  let shared (i : Nat) (name : String) : Bool :=
    called.zipIdx.any fun (names, j) => j != i && names.contains (some name)
  (alts.zip called).zipIdx.mapM fun (((n, brs), called), i) => do
    let base ← field n
    let prefixed ← fieldName n
    let names := called.map (·.map fun c => if shared i c then s!"{prefixed}_{c}" else c)
    pure <| names.zipIdx.map fun (name, k) => match name with
      | some c => if (names.filter (· == some c)).length == 1 then mkIdent (Name.mkSimple c)
        else mkIdent (Name.mkSimple s!"{c}_{k}")
      | none => if brs.length == 1 then base else mkIdent (base.getId.appendAfter s!"_{k}")

open Veil in
/-- Every declaration of the module, in Veil's order, up to the `#gen_spec` that closes its specification. -/
def emitModule : M Unit := do
  let ctx ← read
  let m := ctx.main
  let moduleName := mkIdent (Name.mkSimple m.name)
  let sorted ← emitDefinitions
  emit (← `(command| veil module $moduleName:ident))
  for d in m.declarations do
    match d with
    | .const _ n t => emitState n t (isConst := true)
    | .typedef _ n _ none => emit (← `(command| type $(mkIdent (Name.mkSimple n)):ident))
    | _ => pure ()
  for d in m.declarations do
    if let .var _ n t := d then emitState n t (isConst := false)
  emit (← `(command| #gen_state))
  for d in sorted do
    if let .def id n _ e _ := d then
      if (← insideModule n) then emitDef id n e
  let (_, initBody) ← entryPoint ctx "q::init"
  -- `reread` translates again, so it runs inside the action too: a nested `(← reread ..)` would be lifted
  -- out of `inAction`, and its reads would not go to the pre-state.
  let brs ← inAction (branches initBody)
  emitInit (← brs.toArray.zipIdx.mapM fun (br, i) => inAction do
    let br ← reread br initBody i
    actionBody br br.needPre)
  for d in m.declarations do
    if let .assume _ n e := d then
      let name := mkIdent (Name.mkSimple (if n == "_" then "assumption" else n))
      let e ← propTerm e
      emit (← `(command| assumption [$name:ident] $e))
  let (stepName, stepBody) ← entryPoint ctx "q::step"
  let alts ← (stepActions ctx stepName stepBody).mapM fun (n, body) => do
    pure (n, body, ← inAction (branches body))
  for ((_, body, brs), names) in alts.zip (← branchNames (alts.map fun (n, _, brs) => (n, brs))) do
    for ((br, name), i) in (brs.zip names).zipIdx do
      let items ← inAction do
        let br ← reread br body i
        actionBody br br.needPre
      emit (← `(command| action $name:ident { $items* }))
  for n in ctx.inlined.toList do
    if let some (.def _ _ _ e _) := ctx.lookup n then
      let name ← ident n
      let e ← propTerm e
      emit (← `(command| invariant [$name:ident] $e))
  -- Veil names a state constraint stated without a name, which leaves the definition its own declaration,
  -- or its invariant when it is one too.
  for n in ctx.stateConstraints do
    if let some (.def _ _ _ e _) := ctx.lookup n then
      let p ← propTerm e
      emit (← `(command| state_constraint $p:term))

end Quint.Embed
