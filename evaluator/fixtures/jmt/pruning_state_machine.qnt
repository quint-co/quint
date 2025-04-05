// -*- mode: Bluespec; -*-

module pruning_state_machine {
  import tree.* from "tree"
  import apply_fancy as fancy from "apply_fancy"

  import apply_state_machine as base from "apply_state_machine"
  import apply_simple as simple from "apply_simple"
  import apply_fancy as fancy from "apply_fancy"

  var unpruned_tree: Tree

  action init = all {
    base::init,
    unpruned_tree' = { nodes: Map(), orphans: Set() },
  }

  action assign_result(ops, new_tree) = all {
    base::assign_result(ops, new_tree),
    unpruned_tree' = new_tree,
  }

  action prune_action = all {
    base::version > base::smallest_unpruned_version,
    nondet version_to_prune = base::smallest_unpruned_version.to(base::version - 1).oneOf()
    all {
      base::tree' = base::tree.prune(version_to_prune),
      base::version' = base::version,
      base::smallest_unpruned_version' = version_to_prune + 1,
      base::ops_history' = base::ops_history,
      unpruned_tree' = unpruned_tree,
    }
  }

  action step_fancy = any {
    prune_action,
    base::step_parametrized(fancy::apply, assign_result)
  }

  action step_simple = any {
    prune_action,
    base::step_parametrized(simple::apply, assign_result)
  }

  def pruningDoesNotAffectActiveTreesInv =
    base::activeTreeVersions.forall(v =>
      base::tree.treeAtVersion(v) == unpruned_tree.treeAtVersion(v)
    )

  val allInvariants = all {
    base::allInvariants,
    if(pruningDoesNotAffectActiveTreesInv) true else q::debug("pruningDoesNotAffectActiveTreesInv", false),
  }
}
