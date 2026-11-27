module

public meta import Quint.IR

/-! A spec as `quint compile --flatten=false` prints it, as the one module the embedding translates: the
main module's declarations and every definition they reach through the lookup table.

A definition is reached in the context of the instances it is reached through, as the Rust evaluator
resolves names (`compile_under_context` in `crates/evaluator/src/evaluator.rs`): a name that an
`instance` brought in enters that instance, any other stays in the context it is read in. The module gets
a definition that reads the state once per context, so each instance has state variables of its own,
under the name the spec writes for it where it is first reached: a name read inside an instance `as I`
takes the prefix `I::`, as the module that declares the instance writes it. A constant an instance gives a
value is there a `pure val` of that value.

A definition of another module that reads no state variable, itself or through what it reads, is shared:
the module gets it once, as `M::f` for the module `M` that declares it, whatever instances it is reached
through. The constants it reads, of its module or of an instance its module declares without giving them
a value, come first among its parameters, and each use passes the values they have where it is. So
whatever holds of `M::f` holds in every instance of `M`.

The embedding tells a local from a definition of the module by its name, so a lambda parameter or a `let`
whose name is taken, by a definition or an enclosing local, is renamed `name_id`, as Quint's unshadower
(`quint/src/names/unshadower.ts`) names it. Type aliases are replaced by the types they name. -/

public meta section

namespace Quint.IR

/-- A definition in the context of the instances it is reached through, outermost first. A shared
definition has the empty context. -/
private structure Key where
  id : Nat
  ctx : List Nat
  deriving BEq, Hashable

/-- A constant a shared definition takes as a parameter: the constant, and the instances it is read through,
from the definition's module, outermost first. -/
private structure Param where
  const : Nat
  path : List Nat
  deriving BEq, Hashable

/-- What resolving a spec reads: its lookup table, the definitions and the instances it holds, by id, and
which definitions are shared. For a library (`Output.resolve`), the main module's own are named as it
declares them. -/
private structure Spec where
  table : Std.HashMap Nat Entry
  decls : Std.HashMap Nat Decl
  instances : Std.HashMap Nat ImportedFrom
  shared : Std.HashSet Nat
  main : String
  library : Bool

private structure RState where
  /-- The name of each definition reached. -/
  names : Std.HashMap Key String := {}
  /-- The definition each name was given to. -/
  owners : Std.HashMap String Key := {}
  /-- The definitions reached, as the table holds them, in the order they were reached. -/
  reached : Array (Key × Decl) := #[]
  /-- The module each definition reached is declared in. -/
  modules : Std.HashMap Key String := {}
  /-- The module each instance entered is declared in, by its id: where its constants' values are read. -/
  declaredIn : Std.HashMap Nat String := {}
  /-- What qualifies the state variables of each context entered, innermost first: the instance names
  and the modules around them, as the Rust evaluator names its variables. -/
  namespaces : Std.HashMap (List Nat) (List String) := {}
  /-- The constants each shared definition takes, in the order of its parameters, by its id. -/
  params : Std.HashMap Nat (Array Param) := {}
  /-- Whether every name is given, so that a reference only reads its name. -/
  named : Bool := false

private abbrev R := StateT RState (Except String)

/-- The ids of the names `e` reads, the keys of the lookup table: an operator's is its application's. -/
private partial def refIds : Expr → List Nat
  | .name id _ => [id]
  | .app id _ args => id :: args.flatMap refIds
  | .lambda _ _ _ body => refIds body
  | .letE _ _ _ _ value body => refIds value ++ refIds body
  | _ => []

/-- The definitions that are shared: those of a module other than `main`, or of any module for a library,
that read no state variable and no assumption, themselves or through a definition, that apply no constant,
and that the embedding does not inline at each use (`needsInstance`). -/
private def sharedDefs (o : Output) (main : Module) (decls : Std.HashMap Nat Decl) (library : Bool) :
    Std.HashSet Nat := Id.run do
  let ofMain := if library then {} else Std.HashSet.ofList (main.declarations.map (·.id))
  let inlined (id : Nat) := ((o.types.get? id).map needsInstance).getD false
  let mut shared : Std.HashSet Nat := decls.fold (init := {}) fun acc id d => match d with
    | .def _ _ q _ _ =>
      if !ofMain.contains id && ["puredef", "pureval", "def", "val"].contains q && !inlined id then acc.insert id
      else acc
    | _ => acc
  let mut changed := true
  while changed do
    changed := false
    for id in shared.toList do
      let some (.def _ _ _ e _) := decls.get? id | continue
      let readsOnlyShared := (refIds e).all fun r => match o.table.get? r with
        | none => true
        | some entry => entry.isLocal || match entry.decl with
          | some (.def ..) => shared.contains entry.id
          | some (.const _ _ t) => !(t matches .oper ..)
          | some (.typedef ..) => true
          | _ => false
      if !readsOnlyShared then
        shared := shared.erase id
        changed := true
  shared

/-- The value the last instance of `path` gives the constant `c`. -/
private def overrideOf (s : Spec) (c : Nat) (path : List Nat) : Option Expr :=
  path.getLast? >>= s.instances.get? >>= fun i =>
    (i.overrides.find? fun (p, _) => ((s.table.get? p).map (·.id)) == some c).map (·.2)

mutual
  /-- The constants `e` reads, written in the module of a shared definition inside its instances `path`. -/
  private partial def needs (s : Spec) (path : List Nat) (e : Expr) : R (Array Param) := do
    let mut out := #[]
    for r in refIds e do
      let some entry := s.table.get? r | continue
      if entry.isLocal then continue
      let target := match entry.importedFrom with
        | some i => if i.kind == "instance" then path ++ [i.id] else path
        | none => path
      match entry.decl with
      | some (.const c _ _) => out := out ++ (← constNeeds s c target)
      | some (.def g _ _ _ _) =>
        if s.shared.contains g then
          for p in ← paramsOf s g do
            out := out ++ (← constNeeds s p.const (target ++ p.path))
      | _ => pure ()
    pure out

  /-- The constants the constant `c`, read through the instances `path`, stands for: what the value an
  instance there gives it reads, or itself. -/
  private partial def constNeeds (s : Spec) (c : Nat) (path : List Nat) : R (Array Param) := do
    match overrideOf s c path with
    | some v => needs s path.dropLast v
    | none => pure #[{ const := c, path }]

  /-- The constants the shared definition `g` takes, in order of first use. -/
  private partial def paramsOf (s : Spec) (g : Nat) : R (Array Param) := do
    if let some ps := (← get).params.get? g then return ps
    let some (.def _ _ _ e _) := s.decls.get? g | return #[]
    let ps := (← needs s [] e).foldl (init := #[]) fun acc p => if acc.contains p then acc else acc.push p
    modify fun st => { st with params := st.params.insert g ps }
    pure ps
end

/-- The prefix of the names read in context `ctx`: `I::` for each instance `as I`. -/
private def prefixOf (s : Spec) (ctx : List Nat) : String :=
  String.join (ctx.filterMap fun i => ((s.instances.get? i).bind (·.qualifiedName)).map (· ++ "::"))

/-- The name of `key`, giving it `name` when it has none, or `name_id` when another definition has `name`. -/
private def nameOf (key : Key) (name : String) : R String := do
  let st ← get
  if let some n := st.names.get? key then return n
  let mut n := name
  let mut i := 0
  while st.owners.contains n do
    n := if i == 0 then s!"{name}_{key.id}" else s!"{name}_{key.id}_{i}"
    i := i + 1
  set { st with names := st.names.insert key n, owners := st.owners.insert n key }
  pure n

/-- What locals are renamed to, by the id of their definition, and the names of those in scope. -/
private structure Scope where
  locals : Std.HashMap Nat String := {}
  inScope : Std.HashSet String := {}

/-- The local `name`, defined as `defId` by the binder `binderId`, renamed when its name is taken. -/
private def bindLocal (scope : Scope) (defId binderId : Nat) (name : String) : R (String × Scope) := do
  let taken := scope.inScope.contains name || (← get).owners.contains name
  let n := if taken then s!"{name}_{binderId}" else name
  pure (n, { locals := scope.locals.insert defId n, inScope := scope.inScope.insert name })

/-- Where an expression is read: the instances around it, outermost first, from the main module or, inside
a shared definition, from that definition's module; the module it is written in; and, inside a shared
definition, the names of the constants it takes. -/
private structure Site where
  ctx : List Nat
  module : String
  params : Option (Std.HashMap Param String) := none

/-- The context and the module of what `entry` refers to, read at `site`: an instance it came through is
entered. -/
private def enter (site : Site) (entry : Entry) : R (List Nat × String) := do
  let some i := entry.importedFrom | return (site.ctx, site.module)
  let module := if i.protoName.isEmpty then site.module else i.protoName
  if i.kind != "instance" then return (site.ctx, module)
  let target := site.ctx ++ [i.id]
  modify fun st => { st with declaredIn := if st.declaredIn.contains i.id then st.declaredIn
                                           else st.declaredIn.insert i.id site.module }
  if site.params.isNone && !(← get).namespaces.contains target then
    -- The table qualifies a name by the module that declares the instance last, which the context around
    -- that module qualifies in turn.
    let outer := (← get).namespaces.getD site.ctx []
    let ns := if outer.isEmpty then entry.namespaces else entry.namespaces.dropLast ++ outer
    modify fun st => { st with namespaces := st.namespaces.insert target ns }
  pure (target, module)

mutual
  /-- `e`, read at `site`, with each name renamed to the one the module gives what it refers to. -/
  private partial def resolveExpr (s : Spec) (site : Site) (scope : Scope) (e : Expr) : R Expr := do
    match e with
    | .name id n =>
      match ← resolveRef s site scope id n with
      | .inl e => pure e
      | .inr (n, []) => pure (.name id n)
      | .inr (n, first) => pure (.app id n first)
    | .app id op args =>
      let args ← args.mapM (resolveExpr s site scope)
      match ← resolveRef s site scope id op with
      | .inl _ => throw s!"{op}, a constant applied as an operator inside a shared definition"
      | .inr (op, first) => pure (.app id op (first ++ args))
    | .lambda id params q body =>
      let mut scope' := scope
      let mut params' := #[]
      for (pid, pn) in params do
        let (n, s') ← bindLocal scope' pid id pn
        scope' := s'
        params' := params'.push (pid, n)
      pure (.lambda id params'.toList q (← resolveExpr s site scope' body))
    | .letE id defId n q value body =>
      let (n', scope') ← bindLocal scope defId id n
      -- A `let` cannot refer to itself, so its value reads the scope outside it.
      pure (.letE id defId n' q (← resolveExpr s site scope value) (← resolveExpr s site scope' body))
    | e => pure e

  /-- What the reference `refId`, written `written` at `site`, stands for: the name the module gives what
  it refers to, with the arguments a use passes first, which are a shared definition's constants; or,
  inside a shared definition, the parameter a constant is or the value an instance there gives it. A
  builtin has no entry in the lookup table and keeps its name. -/
  private partial def resolveRef (s : Spec) (site : Site) (scope : Scope) (refId : Nat) (written : String) :
      R (Expr ⊕ (String × List Expr)) := do
    let some entry := s.table.get? refId | return .inr (written, [])
    if entry.isLocal then return .inr ((scope.locals.get? entry.id).getD written, [])
    let some decl := entry.decl | return .inr (written, [])
    let (target, module) ← enter site entry
    if s.shared.contains entry.id then
      let name := if s.library && module == s.main then decl.name else s!"{module}::{decl.name}"
      let n ← reach s { id := entry.id, ctx := [] } name decl module
      let first ← (← paramsOf s entry.id).toList.mapM fun p => constArg s site p.const (target ++ p.path)
      return .inr (n, first)
    if site.params.isSome then
      match decl with
      | .const .. => return .inl (← constArg s site entry.id target)
      | _ => throw s!"{written}, which a shared definition reads, is not shared"
    return .inr (← reach s { id := entry.id, ctx := target } (prefixOf s site.ctx ++ written) decl module, [])

  /-- The constant `c`, read through the instances `path` at `site`. -/
  private partial def constArg (s : Spec) (site : Site) (c : Nat) (path : List Nat) : R Expr := do
    let some decl := s.decls.get? c | throw s!"no constant {c} in the lookup table"
    let some params := site.params
      | pure (.name c (← reach s { id := c, ctx := path } (prefixOf s path ++ decl.name) decl site.module))
    match overrideOf s c path with
    | some v =>
      let declaredIn := (← get).declaredIn
      let module := (path.getLast?.bind declaredIn.get?).getD site.module
      resolveExpr s { site with ctx := path.dropLast, module } {} v
    | none =>
      match params.get? { const := c, path } with
      | some n => pure (.name c n)
      | none => throw s!"the constant {decl.name} is not a parameter of the shared definition that reads it"

  /-- The name of `key`, a definition `decl` of `module`, which is first reached as `name`. -/
  private partial def reach (s : Spec) (key : Key) (name : String) (decl : Decl) (module : String) :
      R String := do
    if (← get).named then return ((← get).names.get? key).getD name
    let known := (← get).names.contains key
    let n ← nameOf key name
    if !known then
      modify fun st => { st with reached := st.reached.push (key, decl), modules := st.modules.insert key module }
      discard (resolveDecl s key n decl)
    pure n

  /-- `decl`, reached as `key` and named `n`, with what it reads resolved in its context. A constant of an
  instance's module is the value the instance gives it, read where the instance is declared. A shared
  definition takes its constants first, named after them. -/
  private partial def resolveDecl (s : Spec) (key : Key) (n : String) (decl : Decl) : R Decl := do
    let module := ((← get).modules.get? key).getD ""
    let site : Site := { ctx := key.ctx, module }
    match decl with
    | .def id _ q e doc =>
      if !s.shared.contains id then return .def id n q (← resolveExpr s site {} e) doc
      let ps ← paramsOf s id
      let mut names : Std.HashMap Param String := {}
      let mut taken : Std.HashSet String := {}
      for p in ps do
        let base := prefixOf s p.path ++ ((s.decls.get? p.const).map (·.name)).getD "c"
        let x := if taken.contains base || (← get).owners.contains base then s!"{base}_{p.const}" else base
        names := names.insert p x
        taken := taken.insert x
      let site := { site with params := some names }
      let scope : Scope := { inScope := taken }
      let first := ps.toList.map fun p => (p.const, names.getD p "")
      let e ← match e with
        | .lambda lid params q' body =>
          match ← resolveExpr s site scope (.lambda lid params q' body) with
          | .lambda lid params q' body => pure (.lambda lid (first ++ params) q' body)
          | e => pure e
        | e =>
          let e ← resolveExpr s site scope e
          pure (if first.isEmpty then e else .lambda id first q e)
      -- With its constants as parameters, a value is an operator.
      let q := if first.isEmpty then q else match q with | "pureval" => "puredef" | "val" => "def" | q => q
      pure (.def id n q e doc)
    | .assume id _ e => pure (.assume id n (← resolveExpr s site {} e))
    | .var id _ t => pure (.var id n t)
    | .typedef id _ ps t => pure (.typedef id n ps t)
    | .const id _ t =>
      match overrideOf s id key.ctx with
      | some v =>
        let declaredIn := (← get).declaredIn
        let module := (key.ctx.getLast?.bind declaredIn.get?).getD module
        pure (.def id n "pureval" (← resolveExpr s { ctx := key.ctx.dropLast, module } {} v) none)
      | none => pure (.const id n t)
end

/-! ## Type aliases -/

/-- The alias a type name refers to: one another module declares is written with that module's
qualifier, `B::Reading`. -/
private def findAlias (aliases : Std.HashMap String (List String × Ty)) (n : String) :
    Option (List String × Ty) :=
  match aliases.get? n with
  | some a => some a
  | none => (n.splitOn "::").getLast?.bind aliases.get?

/-- `t` with every alias, applied or not, replaced by the type it names. -/
private partial def inlineAliases (aliases : Std.HashMap String (List String × Ty)) : Ty → Ty
  | .const n =>
    match findAlias aliases n with
    | some ([], t) => inlineAliases aliases t
    | _ => .const n
  | .app c as =>
    let as := as.map (inlineAliases aliases)
    match findAlias aliases c with
    | some (ps, t) => inlineAliases aliases (substTy { tys := Std.HashMap.ofList (ps.zip as) } t)
    | none => .app c as
  | .set t => .set (inlineAliases aliases t)
  | .list t => .list (inlineAliases aliases t)
  | .fn a r => .fn (inlineAliases aliases a) (inlineAliases aliases r)
  | .oper as r => .oper (as.map (inlineAliases aliases)) (inlineAliases aliases r)
  | .tup r => .tup (row r)
  | .record r => .record (row r)
  | .sum r => .sum (row r)
  | t => t
where
  row : Row → Row
    | .row fs other => .row (fs.map fun (l, t) => (l, inlineAliases aliases t)) (row other)
    | r => r

private def inlineDeclAliases (aliases : Std.HashMap String (List String × Ty)) : Decl → Decl
  | .var id n t => .var id n (inlineAliases aliases t)
  | .const id n t => .const id n (inlineAliases aliases t)
  | .typedef id n ps t => .typedef id n ps (t.map (inlineAliases aliases))
  | d => d

private def Key.lt (a b : Key) : Bool :=
  let rec lex : List Nat → List Nat → Bool
    | [], [] => false
    | [], _ :: _ => true
    | _ :: _, [] => false
    | x :: xs, y :: ys => x < y || (x == y && lex xs ys)
  lex a.ctx b.ctx || (a.ctx == b.ctx && a.id < b.id)

/-- The spec as one module, named after the main module, of its declarations and the definitions they
reach, each module's in its own order, after the main module's. For a `library`, the module has the main
module's shared definitions and what they reach, the main module's named as it declares them. -/
def Output.resolve (o : Output) (library : Bool := false) : Except String Output := do
  let main ← o.mainModule
  let decls : Std.HashMap Nat Decl := o.table.fold (init := {}) fun acc _ entry =>
    match entry.decl with
    | some d => if entry.isLocal then acc else acc.insert entry.id d
    | none => acc
  let decls := main.declarations.foldl (init := decls) fun acc d => acc.insert d.id d
  let instances : Std.HashMap Nat ImportedFrom := o.table.fold (init := {}) fun acc _ entry =>
    match entry.importedFrom with
    | some i => if i.kind == "instance" then acc.insert i.id i else acc
    | none => acc
  let shared := sharedDefs o main decls library
  let s : Spec := { table := o.table, decls, instances, shared, main := main.name, library }
  let main := if !library then main else
    { main with declarations := main.declarations.filter fun d => shared.contains d.id || d matches .typedef .. }
  -- The main module's names come first, so that nothing it reaches takes one of them.
  let st : RState := main.declarations.foldl (init := {}) fun st d =>
    let key : Key := { id := d.id, ctx := [] }
    { st with names := st.names.insert key d.name, owners := st.owners.insert d.name key,
              modules := st.modules.insert key main.name }
  let own (d : Decl) : R Decl := resolveDecl s { id := d.id, ctx := [] } d.name d
  let ((), st) ← (main.declarations.forM fun d => discard (own d)).run st
  let resolveAll : R (List Decl × List Decl) := do
    let own ← main.declarations.mapM own
    let reached ← (st.reached.qsort fun a b => a.1.lt b.1).toList.mapM fun (key, d) =>
      resolveDecl s key ((st.names.get? key).getD d.name) d
    pure (own, reached)
  let ((own, reached), _) ← resolveAll.run { st with named := true }
  -- The table holds the typedef of every type a name refers to, wherever it is declared.
  let typedefs := (own ++ reached ++ o.table.toList.filterMap (·.2.decl)).filter (· matches .typedef ..)
  let aliases : Std.HashMap String (List String × Ty) := Std.HashMap.ofList (typedefs.filterMap fun d =>
    match d with
    | .typedef _ n ps (some t) => some (n, (ps, t))
    | _ => none)
  let typedefs := typedefs.foldl (init := (#[] : Array Decl)) fun acc d =>
    if acc.any (·.name == d.name) then acc else acc.push d
  let others := (own ++ reached).filter fun d => !(d matches .typedef ..)
  let declarations := (typedefs.toList ++ others).map (inlineDeclAliases aliases)
  let types := o.types.fold (init := {}) fun acc id t => acc.insert id (inlineAliases aliases t)
  -- A shared definition takes its constants first.
  let types := st.params.fold (init := types) fun acc id ps =>
    if ps.isEmpty then acc else
    let first := ps.toList.map fun p => acc.getD p.const (.tup .empty)
    match acc.get? id with
    | some (.oper args r) => acc.insert id (.oper (first ++ args) r)
    | some t => acc.insert id (.oper first t)
    | none => acc
  let itfNames := st.reached.foldl (init := {}) fun acc (key, d) =>
    match d, st.names.get? key with
    | .var _ n _, some name =>
      let itf := "::".intercalate ((st.namespaces.getD key.ctx []).reverse ++ [n])
      if itf == name then acc else acc.insert name itf
    | _, _ => acc
  let origins := st.reached.foldl (init := {}) fun acc (key, d) =>
    match st.names.get? key, st.modules.get? key with
    | some name, some m => if s.shared.contains key.id then acc.insert name (m, d.name) else acc
    | _, _ => acc
  pure { o with modules := [{ main with declarations }], types, itfNames, origins }

end Quint.IR
