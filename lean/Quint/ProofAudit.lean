import Lean

/-! A small, trusted executable used by `quint verify --backend veil --proofs`.

It loads already elaborated proof and obligation modules, then inspects their constants directly. In
particular, it does not elaborate commands in the proof's environment and does not derive results from
anything the proof printed. The obligation module imports only the compiled specification and Quint.
-/

open Lean Meta

private def audit (env : Environment) (proof expected : Name) : CoreM String := do
  let some proofInfo := env.find? proof | return "missing"
  let some expectedInfo := env.find? expected | return "missing-obligation"
  let sameType ← MetaM.run' <| isDefEq proofInfo.type expectedInfo.type
  let axioms ← collectAxioms proof
  let names := axioms.toList.map toString |>.mergeSort
  return s!"{if sameType then "same" else "different"}\t{String.intercalate "," names}"

unsafe def main (args : List String) : IO Unit := do
  let output :: proofModule :: obligationModule :: declarations := args
    | throw <| IO.userError
        "usage: ProofAudit.lean OUTPUT PROOF_MODULE OBLIGATION_MODULE PROOF EXPECTED ..."
  unless declarations.length % 2 == 0 do
    throw <| IO.userError "the proof audit needs pairs of proof and obligation declaration names"
  initSearchPath (← findSysroot)
  let env ← importModules
    #[{ module := proofModule.toName }, { module := obligationModule.toName }] {}
  let ctx : Core.Context := { fileName := "", fileMap := default }
  let state : Core.State := { env }
  let action : CoreM (List String) := do
    let rec go : List String → CoreM (List String)
      | [] => pure []
      | proof :: expected :: rest => do
          return (← audit env proof.toName expected.toName) :: (← go rest)
      | _ => unreachable!
    go declarations
  let result : List String × Core.State ←
    EIO.toIO (fun (_ : Exception) => IO.userError "proof audit failed") <| action.run ctx state
  let rows := result.1
  IO.FS.writeFile output (String.intercalate "\n" rows ++ "\n")
