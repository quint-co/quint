module

public meta import Lean

/-! What `quint_library` declares, which a `quint_module` that reaches the same definitions uses rather than
declaring its own: the datatypes, by the Quint type each stands for, and the test that a definition the
module would declare is the one the library declared. -/

public meta section

namespace Quint.Embed

open Lean Meta Elab Command

/-- The datatypes `quint_library` declared, by the structural key of their Quint type (`tyKey`): Quint's
types are structural, so one with the same key is the same type. -/
initialize libraryTypes : SimplePersistentEnvExtension (String × Name) (Std.HashMap String Name) ←
  registerSimplePersistentEnvExtension {
    addEntryFn := fun m (key, n) => m.insert key n
    addImportedFn := fun es => es.foldl (fun m e => e.foldl (fun m (key, n) => m.insert key n) m) {}
  }

/-- Whether the constants `a` and `b` have the same type and the same value, up to definitional equality. -/
def sameConstant (a b : Name) : CommandElabM Bool := do
  let env ← getEnv
  let (some ca, some cb) := (env.find? a, env.find? b) | return false
  let (some va, some vb) := (ca.value?, cb.value?) | return false
  if !ca.levelParams.isEmpty || !cb.levelParams.isEmpty then return false
  liftTermElabM do pure ((← isDefEq ca.type cb.type) && (← isDefEq va vb))

end Quint.Embed
