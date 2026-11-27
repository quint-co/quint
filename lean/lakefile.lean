import Lake
open Lake DSL

-- Pinned to the Veil 2.0 commit the embedding was developed against. Veil fetches its own
-- dependencies (Loom, lean-smt, cvc5, ...) through this requirement.
require veil from git "https://github.com/verse-lab/veil" @ "57447722e7f25f06c75cff8735d10d41697afc14"

package «quint-lean» where
  -- Veil's SMT-backed commands run cvc5; its native library is only found by `lake build`.
  moreLeanArgs := #[]

@[default_target]
lean_lib Quint where
  globs := #[`Quint, .submodules `Quint]

lean_lib Tests where
  globs := #[.submodules `Tests]
