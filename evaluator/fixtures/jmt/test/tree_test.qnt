// -*- mode: Bluespec; -*-

module tree_test {
  import tree.* from "../tree"
  import node.* from "../node"
  import utils.* from "../utils"
  import basicSpells.* from "../spells/basicSpells"
  import apply_state_machine.* from "../apply_state_machine"
  import apply_fancy as fancy from "../apply_fancy"
  import apply_simple as simple from "../apply_simple"

  run simpleVsFancyTest =
    pure val empty_tree = { nodes: Map(), orphans: Set() }
    nondet kms_with_value = all_key_hashes.setOfMaps(VALUES).oneOf()
    pure val ops = kms_with_value.to_operations()

    pure val reference = simple::apply(empty_tree, 0, 1, ops)
    pure val result = fancy::apply(empty_tree, 0, 1, ops)
    assert(reference == result)

  run simpleVsFancyMultipleRepsTest = init.then(3.reps(_ => {
    nondet kms_with_value = all_key_hashes.setOfMaps(VALUES).oneOf()
    pure val ops = kms_with_value.to_operations()

    val reference = simple::apply(tree, version - 1, version, ops)
    val result = fancy::apply(tree, version - 1, version, ops)
    val failure = reference != result
    all {
      tree' = result,
      version' = version + 1,
      ops_history' = if (failure) q::debug("ops_history", ops_history.append(ops)) else ops_history.append(ops),
      smallest_unpruned_version' = smallest_unpruned_version,
      if (failure) assert(q::debug("simple", reference) == q::debug("fancy", result)) else true,
    }
  }))
}
