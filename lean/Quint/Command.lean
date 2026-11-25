module

public meta import Lean
public meta import Veil
public meta import Quint.IR
public meta import Quint.Resolve
public meta import Quint.Embed
public meta import Quint.Temporal
public meta import Quint.Smt

/-! The `quint_module` command: its options, compiling the spec with `quint`, and the module it emits
(`Quint.Embed.emitModule`, then the temporal properties of `Quint.Temporal`). -/

public meta section

namespace Quint.Embed

open Lean Elab Command Term
open IR (Ty Row Output)

/-- Type alias names by the structural key of their type, and those with parameters of a record or sum
by its `labelKey`, which names the generic type. -/
private def aliasesOf (m : IR.Module) : Std.HashMap String String := Id.run do
  let mut aliases : Std.HashMap String String := {}
  for d in m.declarations do
    match d with
    | .typedef _ n [] (some t) => aliases := aliases.insert (tyKey t) n
    | .typedef _ n _ (some t@(.record _)) | .typedef _ n _ (some t@(.sum _)) =>
      aliases := aliases.insert (labelKey t) n
    | _ => pure ()
  aliases

/-- `quint` as the environment names it: `QUINT_BIN`, else `quint` on `PATH`. -/
private def quintCommand : IO (String × Array String) := do
  match ← IO.getEnv "QUINT_BIN" with
  | some bin =>
    match (bin.splitOn " ").filter (· != "") with
    | cmd :: args => pure (cmd, args.toArray)
    | [] => pure ("quint", #[])
  | none => pure ("quint", #[])

private def shellQuote (s : String) : String := "'" ++ s.replace "'" "'\\''" ++ "'"

/-- Run `quint` with its stdout redirected to a file, and read the file.
Reading the pipe instead loses everything past 64 KiB, which a spec of any size exceeds. -/
private def runQuintStdout (args : Array String) : IO String := do
  let (cmd, pre) ← quintCommand
  IO.FS.withTempFile fun _ out => do
    let line := " ".intercalate ((#[cmd] ++ pre ++ args).toList.map shellQuote) ++ " > " ++
      shellQuote out.toString
    let r ← IO.Process.output { cmd := "sh", args := #["-c", line] }
    if r.exitCode != 0 then
      throw (IO.userError s!"{line} failed:\n{r.stdout}\n{r.stderr}")
    IO.FS.readFile out

structure Options where
  main : Option String := none
  init : Option String := none
  step : Option String := none
  invariants : List String := []
  /-- Temporal properties to state as Veil `temporal` declarations, for `#temporal_check`. -/
  temporalProps : List String := []
  /-- Definitions of the main module to state as Veil state constraints (`Ctx.stateConstraints`). -/
  stateConstraints : List String := []
  /-- Write the generated module to this file, taken relative to the Lean file. -/
  out : Option System.FilePath := none
  /-- Write the state variables to this file, taken relative to the Lean file (`variablesJson`). -/
  variables : Option System.FilePath := none
  /-- Log every generated declaration. -/
  showCode : Bool := false
  /-- Whether the definitions the spec declares with `invariant` are stated as invariants, besides the
  ones the compiled spec names. Off, only the named ones are, as `quint verify` checks only its
  `--invariant`. -/
  declared : Bool := true
  /-- Whether every value is scalarized, stored as the scalars SMT reasons about (`Quint.Smt`). For proofs
  only: over a map keyed by integers, for one, a model checker has nothing to enumerate. -/
  smt : Bool := false
  /-- In the SMT encoding, whether the initializer's assignments are equations the state satisfies
  (`Ctx.smtEquations`). -/
  initEquations : Bool := false

/-- The compiled spec as one module (`IR.Output.resolve`). -/
private def load (path : System.FilePath) (opts : Options) (library : Bool := false) : IO Output := do
  let (text, source) ← if path.extension == some "json" then
      pure (← IO.FS.readFile path, path.toString)
    else
      -- Without flattening, `quint compile` adds `q::init` and `q::step` only when asked to, which a
      -- library, with no state, is not.
      let entries := if library then #[] else #["--init", opts.init.getD "init", "--step", opts.step.getD "step"]
      let flags := (opts.main.map fun m => #["--main", m]).getD #[] ++ entries ++
        (if opts.invariants.isEmpty then #[] else #["--invariant", ",".intercalate opts.invariants]) ++
        (if opts.temporalProps.isEmpty then #[] else #["--temporal", ",".intercalate opts.temporalProps])
      pure (← runQuintStdout (#["compile", "--target", "json", "--flatten=false"] ++ flags ++
        #[path.toString]), "quint compile output")
  match IR.parse text >>= (·.resolve library) with
  | .ok o => pure o
  | .error e => throw (IO.userError s!"{source}: {e}")

/-- The file `path` names, taken relative to the Lean file. -/
private def specFile (path : String) : CommandElabM System.FilePath := do
  let file : System.FilePath := path
  if file.isAbsolute then return file
  pure (match (← getFileName : System.FilePath).parent with
    | some dir => dir / file
    | none => file)

/-- What the elaboration of the module `main` of `output` needs to know about it. -/
private def specCtx (output : Output) (main : IR.Module) : Ctx := {
  output, main
  decls := Std.HashMap.ofList (main.declarations.map fun d => (d.name, d))
  stateReaders := stateReaders main
  constReaders := constReaders main
  defReads := defReadsOf main
  generalized := generalizedTyVars main output.types
  generic := genericLabels main output.types
  aliases := aliasesOf main
  vars := main.declarations.filterMap fun d => match d with | .var _ n _ => some n | _ => none }

/-- The state variables, for the Veil backend of `quint verify` to read a counterexample back: each one's
name in an ITF trace, the id of its declaration, and its field, which in the SMT encoding starts the names of
its components and names it in `#quint_check_induction`'s report. -/
private def variablesJson : M Json := do
  let ctx ← read
  let vars ← ctx.main.declarations.filterMapM fun d => do
    let .var id n _ := d | pure none
    pure (some (Json.mkObj [("name", ctx.output.itfNames.getD n n), ("id", toJson id), ("field", ← fieldName n)]))
  pure (Json.arr vars.toArray)

syntax quintOption := "(" ident ":=" (ident <|> str <|> ("[" ident,* "]")) ")"

/-- `quint_module "spec.qnt" (main := M) (init := i) (step := s) (invariants := [a, b]) (temporalProps := [c])
(stateConstraints := [d])`, or a `.json` compiled by `quint compile --target json`. A name in a list may be
quoted, as `«I::d»`. The module stays open: close it with `end M`. -/
syntax (name := quintModule) "quint_module " str quintOption* : command

private def parseOptions (stx : Array (TSyntax ``quintOption)) : CommandElabM Options := do
  let mut opts : Options := {}
  for o in stx do
    match o with
    | `(quintOption| ($k:ident := $v:ident)) =>
      match k.getId.toString, v.getId.toString with
      | "code", "true" => opts := { opts with showCode := true }
      | "code", "false" => opts := { opts with showCode := false }
      | "declared", "true" => opts := { opts with declared := true }
      | "declared", "false" => opts := { opts with declared := false }
      | "smt", "true" => opts := { opts with smt := true }
      | "smt", "false" => opts := { opts with smt := false }
      | "initEquations", "true" => opts := { opts with initEquations := true }
      | "initEquations", "false" => opts := { opts with initEquations := false }
      | "main", s => opts := { opts with main := some s }
      | "init", s => opts := { opts with init := some s }
      | "step", s => opts := { opts with step := some s }
      | k, _ => throwErrorAt o "unknown option {k}"
    | `(quintOption| ($k:ident := $v:str)) =>
      match k.getId.toString with
      | "out" => opts := { opts with out := some v.getString }
      | "variables" => opts := { opts with variables := some v.getString }
      | "main" => opts := { opts with main := some v.getString }
      | "init" => opts := { opts with init := some v.getString }
      | "step" => opts := { opts with step := some v.getString }
      | k => throwErrorAt o "unknown option {k}"
    | `(quintOption| ($k:ident := [$vs:ident,*])) =>
      let names := vs.getElems.toList.map (·.getId.toString (escape := false))
      match k.getId.toString with
      | "invariants" => opts := { opts with invariants := names }
      | "temporalProps" => opts := { opts with temporalProps := names }
      | "stateConstraints" => opts := { opts with stateConstraints := names }
      | k => throwErrorAt o "unknown option {k}"
    | _ => throwErrorAt o "malformed option"
  pure opts

open Veil in
@[command_elab quintModule]
def elabQuintModule : CommandElab := fun stx => do
  match stx with
  | `(quint_module $path:str $opts*) =>
    let opts ← parseOptions opts
    let current : System.FilePath := ← getFileName
    let output ← load (← specFile path.getString) opts
    let main ← match output.mainModule with
      | .ok m => pure (withoutUnusedConstants m)
      | .error e => throwError "quint_module: {e}"
    let ctx := specCtx output main
    -- The same invariant can be named on the command line, named by `(invariants := …)`, and declared with the
    -- `invariant` qualifier.
    let declared := main.declarations.filterMap fun d => match d with
      | .def _ n "invariant" _ _ => some n
      | _ => none
    let named := output.invariants ++ opts.invariants ++ if opts.declared then declared else []
    let ctx := { ctx with
      inlined := Std.HashSet.ofList (named.filterMap fun n => (ctx.lookup n).map (·.name))
      stateConstraints := opts.stateConstraints }
    for n in opts.invariants do
      unless ctx.lookup n matches some (.def ..) do
        throwError "quint_module: the invariant {n} is not a definition of {main.name}"
    for n in opts.stateConstraints do
      unless ctx.lookup n matches some (.def ..) do
        throwError "quint_module: the state constraint {n} is not a definition of {main.name}"
    if opts.smt && !opts.stateConstraints.isEmpty then
      throwError "quint_module: a state constraint is not supported with (smt := true)"
    let besideFile (o : System.FilePath) :=
      if o.isAbsolute then o else (current.parent.getD "." : System.FilePath) / o
    let out := opts.out.map besideFile
    if let some o := out then IO.FS.writeFile o ""
    if opts.smt then
      let strConsts := Smt.strConstants ctx
      let ctx := { ctx with generic := {}, strConsts, smtEquations := opts.initEquations }
      let ctx := { ctx with enums := Smt.veilEnums ctx }
      let emitAll : M Unit := do
        Smt.emitModule
        emit (← `(command| #gen_spec))
        Smt.recordModule
        if let some v := opts.variables.map besideFile then IO.FS.writeFile v (← variablesJson).compress
      let ((), _) ← (emitAll.run ctx).run { showCode := opts.showCode, out }
    else
      let emitAll : M Unit := do
        emitModule
        emitTemporal
        emit (← `(command| #gen_spec))
        if let some v := opts.variables.map besideFile then IO.FS.writeFile v (← variablesJson).compress
      let ((), _) ← (emitAll.run ctx).run { showCode := opts.showCode, out }
    -- In Veil's registry, so that `veil module M` re-opens the module in a file that imports this one. The
    -- registry is a scoped extension, and only what `add` records reaches the olean.
    let mod ← getCurrentModule
    let genv ← globalEnv.get
    globalEnv.add { genv with modules := genv.modules.insert mod.name mod }
  | _ => throwUnsupportedSyntax

open Veil in
/-- `veil module M`, which re-opens a module that Veil's registry holds, such as one that an imported file
declared with `quint_module`. The verification conditions of a module live in the process that generated
them, so when the re-opened module's specification is closed, this generates those of its invariants
again, which `#gen_theorems` and `#check_invariants` discharge. -/
@[command_elab Veil.moduleDeclaration]
def elabReopenedModule : CommandElab := fun stx => do
  elabModuleDeclaration stx
  let mod ← getCurrentModule
  if mod.isSpecFinalized && !mod._vcGenerationDeferred then
    Verifier.runManager
    mod.generateInvariantVCs

/-- `quint_library "spells.qnt" (main := M)`: the types of `M` and its definitions that read no state, in
namespace `M`, each taking the constants of `M` it reads first: `M.f` for the definition `f`. A
`quint_module` that reads `f` through any instance of `M` uses `M.f` when its own would have the same type
and value, so what is proved of `M.f` holds there. -/
syntax (name := quintLibrary) "quint_library " str quintOption* : command

@[command_elab quintLibrary]
def elabQuintLibrary : CommandElab := fun stx => do
  match stx with
  | `(quint_library $path:str $opts*) =>
    let opts ← parseOptions opts
    let output ← load (← specFile path.getString) opts (library := true)
    let main ← match output.mainModule with
      | .ok m => pure m
      | .error e => throwError "quint_library: {e}"
    let ctx := { specCtx output main with library := true }
    let ((), _) ← ((discard emitDefinitions).run ctx).run { showCode := opts.showCode }
  | _ => throwUnsupportedSyntax

end Quint.Embed
