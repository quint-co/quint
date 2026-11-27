module

public meta import Lean.Data.Json

/-! The Quint intermediate representation, as `quint compile --target json --flatten=false` prints it.

The hand-written definition is `quint/src/ir/quintIr.ts` and `quint/src/ir/quintTypes.ts`; these
inductives mirror it the way `crates/evaluator/src/ir.rs` does for the Rust evaluator. Only the parts the
embedding consumes are decoded: expressions, declarations, the module, the inferred type of every
expression (`types`, keyed by expression id), and the lookup table from each name to its definition
(`table`, `quint/src/names/base.ts`). -/

public meta section

namespace Quint.IR

open Lean

mutual
  /-- A row of a record, tuple or sum type: named fields and a tail that is empty or a row variable. -/
  inductive Row where
    | row (fields : List (String × Ty)) (other : Row)
    | var (name : String)
    | empty

  /-- A Quint type. `const` is a declared type (an alias or an uninterpreted type); `var` a type variable. -/
  inductive Ty where
    | bool | int | str
    | const (name : String)
    | var (name : String)
    | set (elem : Ty)
    | list (elem : Ty)
    | fn (arg : Ty) (res : Ty)
    | oper (args : List Ty) (res : Ty)
    | tup (fields : Row)
    | record (fields : Row)
    | sum (fields : Row)
    | app (ctor : String) (args : List Ty)
end

instance : Inhabited Row := ⟨.empty⟩
instance : Inhabited Ty := ⟨.bool⟩

end Quint.IR

namespace Quint.IR.Row

/-- The named fields of a row, through its nested tails. -/
partial def fields : Row → List (String × Ty)
  | .row fs other => fs ++ fields other
  | _ => []

/-- The variable that ends an open row. -/
partial def tailVar : Row → Option String
  | .row _ other => tailVar other
  | .var v => some v
  | .empty => none

end Quint.IR.Row

namespace Quint.IR

open Lean

/-- The type variables of a type, in order of first occurrence. -/
partial def Ty.freeVars : Ty → List String
  | .var v => [v]
  | .set e | .list e => freeVars e
  | .fn a b => (freeVars a ++ freeVars b).eraseDups
  | .oper args r => (args.flatMap freeVars ++ freeVars r).eraseDups
  | .tup r | .record r | .sum r => (r.fields.flatMap fun f => freeVars f.2).eraseDups
  | .app _ args => (args.flatMap freeVars).eraseDups
  | _ => []

/-- Whether a payload type is the unit tuple, which a variant without arguments carries. -/
def isUnit : Ty → Bool
  | .tup r => r.fields.isEmpty
  | _ => false

/-- `t`, for the sum type `Some(t) | None`, which the embedding writes as Lean's `Option t`.
`Some(()) | None` carries nothing, so it is an enumeration instead. -/
def Ty.optionPayload? : Ty → Option Ty
  | .sum r => do
    let [_, _] := r.fields | none
    guard ((r.fields.lookup "None").any isUnit)
    let t ← r.fields.lookup "Some"
    if isUnit t then none else pure t
  | _ => none

/-- Whether a definition is inlined where it is used, under the types of that use, rather than declared
once: its type has a row variable, and Lean has no type for a record or sum with at least some fields. -/
partial def needsInstance : Ty → Bool
  | .set e | .list e => needsInstance e
  | .fn a b => needsInstance a || needsInstance b
  | .oper args r => args.any needsInstance || needsInstance r
  | .tup r | .record r | .sum r => r.tailVar.isSome || r.fields.any (needsInstance ·.2)
  | .app _ args => args.any needsInstance
  | _ => false

/-- The records and sums inside a type with a type variable in a field, other than `Option`s, which are
Lean's. One with a row variable is left out: no type has exactly its fields. -/
partial def Ty.recordsOverVars : Ty → List Ty
  | .set e | .list e => recordsOverVars e
  | .fn a b => recordsOverVars a ++ recordsOverVars b
  | .oper args r => args.flatMap recordsOverVars ++ recordsOverVars r
  | .tup r => r.fields.flatMap (recordsOverVars ·.2)
  | ty@(.record r) | ty@(.sum r) =>
    let inner := r.fields.flatMap (recordsOverVars ·.2)
    if r.tailVar.isSome || ty.optionPayload?.isSome || ty.freeVars.isEmpty then inner else ty :: inner
  | .app _ args => args.flatMap recordsOverVars
  | _ => []

/-- The types the type variables, and the rows the row variables, of a polymorphic definition take at one
of its uses. -/
structure TySubst where
  tys : Std.HashMap String Ty := {}
  rows : Std.HashMap String Row := {}

mutual
  /-- `t` with the variables `σ` binds replaced. -/
  partial def substTy (σ : TySubst) : Ty → Ty
    | .var v => σ.tys.getD v (.var v)
    | .set e => .set (substTy σ e)
    | .list e => .list (substTy σ e)
    | .fn a b => .fn (substTy σ a) (substTy σ b)
    | .oper args r => .oper (args.map (substTy σ)) (substTy σ r)
    | .tup r => .tup (substRow σ r)
    | .record r => .record (substRow σ r)
    | .sum r => .sum (substRow σ r)
    | .app c args => .app c (args.map (substTy σ))
    | t => t

  partial def substRow (σ : TySubst) : Row → Row
    | .row fs other => .row (fs.map fun (n, t) => (n, substTy σ t)) (substRow σ other)
    | .var v => σ.rows.getD v (.var v)
    | .empty => .empty
end

/-- An `oneOf`, `val`, `def`, `action`, ... qualifier of a definition, kept as the IR spells it. -/
abbrev Qualifier := String

/-- A Quint expression. `letE` flattens the IR's nested `opdef` into the definition's fields. -/
inductive Expr where
  | name (id : Nat) (name : String)
  | bool (id : Nat) (value : Bool)
  | int (id : Nat) (value : Int)
  | str (id : Nat) (value : String)
  | app (id : Nat) (opcode : String) (args : List Expr)
  | lambda (id : Nat) (params : List (Nat × String)) (qualifier : Qualifier) (body : Expr)
  | letE (id : Nat) (defId : Nat) (defName : String) (qualifier : Qualifier) (value : Expr) (body : Expr)
  deriving Inhabited

/-- The id of an expression, the key of its inferred type. -/
def Expr.id : Expr → Nat
  | .name id _ | .bool id _ | .int id _ | .str id _ | .app id _ _ | .lambda id _ _ _ | .letE id _ _ _ _ _ => id

/-- A top-level definition. Imports, exports and instances are not decoded: `table` resolves the names
they bring in. -/
inductive Decl where
  | var (id : Nat) (name : String) (type : Ty)
  | const (id : Nat) (name : String) (type : Ty)
  | def (id : Nat) (name : String) (qualifier : Qualifier) (expr : Expr) (doc : Option String)
  | assume (id : Nat) (name : String) (assumption : Expr)
  | typedef (id : Nat) (name : String) (params : List String) (type : Option Ty)
  deriving Inhabited

def Decl.name : Decl → String
  | .var _ n _ | .const _ n _ | .def _ n _ _ _ | .assume _ n _ | .typedef _ n _ _ => n

def Decl.id : Decl → Nat
  | .var id _ _ | .const id _ _ | .def id _ _ _ _ | .assume id _ _ | .typedef id _ _ _ => id

structure Module where
  id : Nat
  name : String
  declarations : List Decl
  deriving Inhabited

/-- The `import`, `instance` or `export` declaration that brought a definition into another module. -/
structure ImportedFrom where
  kind : String
  /-- The id of that declaration, which tells two instances of one module apart. -/
  id : Nat
  /-- The `I` of `import M(...) as I`; none for `import M(...).*`. -/
  qualifiedName : Option String
  /-- The `M` it imports, instantiates or exports. -/
  protoName : String
  /-- An instance's constants: the id of the name each override binds, and the value it gives. -/
  overrides : List (Nat × Expr)
  deriving Inhabited

/-- What a name refers to, as the lookup table records it. -/
structure Entry where
  /-- The definition, when it is a top-level one: a `def`, `var`, `const` or `typedef`. -/
  decl : Option Decl
  /-- The id of the definition, the same for every name that refers to it. -/
  id : Nat
  name : String
  /-- Whether it is a lambda parameter or what a `let` binds. -/
  isLocal : Bool
  importedFrom : Option ImportedFrom
  /-- For a name an instance brings in, the instance's name and then the module that declares it, innermost
  first, as the Rust evaluator qualifies the state variables it creates there. -/
  namespaces : List String := []
  deriving Inhabited

/-- What `quint compile --target json` prints: the main module, the type of each expression, and the
lookup table. -/
structure Output where
  main : String
  modules : List Module
  /-- Expression and declaration id to its inferred type. Type schemes are flattened to their type: the
  quantified variables are exactly the free `Ty.var`s. -/
  types : Std.HashMap Nat Ty
  /-- Names of the definitions declared with the `invariant` qualifier or passed to `--invariant`. -/
  invariants : List String
  /-- The id of each name in the spec to what it refers to. -/
  table : Std.HashMap Nat Entry := {}
  /-- The name of each state variable in an ITF trace, by its name in the module `Output.resolve` makes,
  when the two differ. -/
  itfNames : Std.HashMap String String := {}
  /-- The module and the name each shared definition is declared with (`Output.resolve`), by its name in
  the module `Output.resolve` makes. -/
  origins : Std.HashMap String (String × String) := {}

/-- The module `main` names. -/
def Output.mainModule (o : Output) : Except String Module :=
  match o.modules.find? (·.name == o.main) with
  | some m => .ok m
  | none => .error s!"module {o.main} is not in the compiled output"

/-! ## Decoding -/

private def getField (j : Json) (k : String) : Except String Json :=
  match j.getObjVal? k with
  | .ok v => .ok v
  | .error _ => .error s!"missing field {k} in {j.compress.take 200}"

private def getStr (j : Json) (k : String) : Except String String := do (← getField j k).getStr?
private def getNat (j : Json) (k : String) : Except String Nat := do (← getField j k).getNat?
private def getArr (j : Json) (k : String) : Except String (Array Json) := do (← getField j k).getArr?

mutual
  partial def decodeTy (j : Json) : Except String Ty := do
    match ← getStr j "kind" with
    | "bool" => pure .bool
    | "int" => pure .int
    | "str" => pure .str
    | "const" => pure (.const (← getStr j "name"))
    | "var" => pure (.var (← getStr j "name"))
    | "set" => pure (.set (← decodeTy (← getField j "elem")))
    | "list" => pure (.list (← decodeTy (← getField j "elem")))
    | "fun" => pure (.fn (← decodeTy (← getField j "arg")) (← decodeTy (← getField j "res")))
    | "oper" =>
      pure (.oper (← (← getArr j "args").toList.mapM decodeTy) (← decodeTy (← getField j "res")))
    | "tup" => pure (.tup (← decodeRow (← getField j "fields")))
    | "rec" => pure (.record (← decodeRow (← getField j "fields")))
    | "sum" => pure (.sum (← decodeRow (← getField j "fields")))
    | "app" =>
      let ctor ← getField j "ctor"
      let name ← match ctor.getStr? with
        | .ok n => pure n
        | .error _ => getStr ctor "name"
      pure (.app name (← (← getArr j "args").toList.mapM decodeTy))
    | k => throw s!"unknown type kind {k}"

  partial def decodeRow (j : Json) : Except String Row := do
    match ← getStr j "kind" with
    | "row" =>
      let fields ← (← getArr j "fields").toList.mapM fun f => do
        pure (← getStr f "fieldName", ← decodeTy (← getField f "fieldType"))
      pure (.row fields (← decodeRow (← getField j "other")))
    | "var" => pure (.var (← getStr j "name"))
    | "empty" => pure .empty
    | k => throw s!"unknown row kind {k}"
end

/-- Integer literals print as JSON numbers of arbitrary size; `bigint` ids print the same way. -/
private def getInt (j : Json) : Except String Int :=
  match j with
  | .num n => if n.exponent == 0 then .ok n.mantissa else .error s!"non-integer literal {j.compress}"
  | _ => .error s!"expected an integer, got {j.compress}"

partial def decodeExpr (j : Json) : Except String Expr := do
  let id ← getNat j "id"
  match ← getStr j "kind" with
  | "name" => pure (.name id (← getStr j "name"))
  | "bool" => pure (.bool id (← (← getField j "value").getBool?))
  | "int" => pure (.int id (← getInt (← getField j "value")))
  | "str" => pure (.str id (← getStr j "value"))
  | "app" => pure (.app id (← getStr j "opcode") (← (← getArr j "args").toList.mapM decodeExpr))
  | "lambda" =>
    let params ← (← getArr j "params").toList.mapM fun p => do pure (← getNat p "id", ← getStr p "name")
    pure (.lambda id params (← getStr j "qualifier") (← decodeExpr (← getField j "expr")))
  | "let" =>
    let d ← getField j "opdef"
    pure (.letE id (← getNat d "id") (← getStr d "name") (← getStr d "qualifier")
      (← decodeExpr (← getField d "expr")) (← decodeExpr (← getField j "expr")))
  | k => throw s!"unknown expression kind {k}"

def decodeDecl (j : Json) : Except String (Option Decl) := do
  let id ← getNat j "id"
  match ← getStr j "kind" with
  | "var" => pure (some (.var id (← getStr j "name") (← decodeTy (← getField j "typeAnnotation"))))
  | "const" => pure (some (.const id (← getStr j "name") (← decodeTy (← getField j "typeAnnotation"))))
  | "def" =>
    let doc := (j.getObjValAs? String "doc").toOption
    pure (some (.def id (← getStr j "name") (← getStr j "qualifier") (← decodeExpr (← getField j "expr")) doc))
  | "assume" => pure (some (.assume id (← getStr j "name") (← decodeExpr (← getField j "assumption"))))
  | "typedef" =>
    let params := ((j.getObjValAs? (Array String) "params").toOption.getD #[]).toList
    let type ← match j.getObjVal? "type" with
      | .ok t => pure (some (← decodeTy t))
      | .error _ => pure none
    pure (some (.typedef id (← getStr j "name") params type))
  -- Imports, exports and instances: `table` resolves the names they bring in.
  | _ => pure none

def decodeModule (j : Json) : Except String Module := do
  let decls ← (← getArr j "declarations").toList.mapM decodeDecl
  pure { id := ← getNat j "id", name := ← getStr j "name", declarations := decls.filterMap id }

/-- An entry of the lookup table. A `def` deeper than the top level is what a `let` binds. -/
def decodeEntry (j : Json) : Except String Entry := do
  let kind ← getStr j "kind"
  let depth := (j.getObjValAs? Nat "depth").toOption.getD 0
  let isLocal := kind == "param" || (kind == "def" && depth > 0)
  let decl ← if isLocal then pure none else decodeDecl j
  let importedFrom ← match j.getObjVal? "importedFrom" with
    | .error _ => pure none
    | .ok i =>
      let overrides ← match i.getObjVal? "overrides" with
        | .error _ => pure []
        | .ok os => (← os.getArr?).toList.mapM fun o => do
          let pair ← o.getArr?
          let some param := pair[0]? | throw "an override without its name"
          let some value := pair[1]? | throw "an override without its value"
          pure (← getNat param "id", ← decodeExpr value)
      pure (some { kind := ← getStr i "kind", id := ← getNat i "id",
                   qualifiedName := (i.getObjValAs? String "qualifiedName").toOption,
                   protoName := ← getStr i "protoName", overrides })
  let namespaces := ((j.getObjValAs? (Array String) "namespaces").toOption.getD #[]).toList
  pure { decl, id := ← getNat j "id", name := ← getStr j "name", isLocal, importedFrom, namespaces }

def decodeOutput (j : Json) : Except String Output := do
  let modules ← (← getArr j "modules").toList.mapM decodeModule
  let mut types : Std.HashMap Nat Ty := {}
  match ← getField j "types" with
  | .obj kvs =>
    for (k, v) in kvs.toArray do
      let some id := k.toNat? | throw s!"type table key {k} is not an id"
      types := types.insert id (← decodeTy (← getField v "type"))
  | _ => throw "types is not an object"
  -- `--invariant a,b` is echoed as one comma-joined entry, so a name list arrives as a single string.
  let invariants := ((j.getObjValAs? (Array String) "invariants").toOption.getD #[]).toList.flatMap
    fun entry => (entry.splitOn ",").filter (· != "")
  -- Only a compiled spec names its main module.
  let main := (j.getObjValAs? String "main").toOption.getD ""
  let mut table : Std.HashMap Nat Entry := {}
  if let .ok (.obj kvs) := j.getObjVal? "table" then
    for (k, v) in kvs.toArray do
      let some id := k.toNat? | throw s!"lookup table key {k} is not an id"
      table := table.insert id (← decodeEntry v)
  pure { main, modules, types, invariants, table }

/-- Parse the text `quint compile --target json` printed. -/
def parse (text : String) : Except String Output := do
  decodeOutput (← Json.parse text)

end Quint.IR
