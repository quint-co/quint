// -*- mode: Bluespec; -*-

module proofs_test {
  import proofs.* from "../proofs"
  import basicSpells.* from "../spells/basicSpells"
  import apply_simple.* from "../apply_simple"
  import rareSpells.* from "../spells/rareSpells"
  import node.* from "../node"
  import tree.* from "../tree"
  import proof_types.* from "../proof_types"
  import grug_ics23.* from "../grug_ics23"
  import utils.* from "../utils"

  import instantiatable_tree(fancy=false) as T1 from "instantiatable_tree"
  import instantiatable_tree(fancy=false) as T2 from "instantiatable_tree"

  val empty_tree: Tree = { nodes: Map(), orphans: Set() }

  pure def assert_proof_on_different_trees(t1: Tree, t2: Tree, leaf: LeafNode, version: Version): bool = {
    val proof = ics23_prove(t1, leaf.key_hash, version).unwrap()

    val root1_hash = hash(t1.nodes.get({ key_hash: ROOT_BITS, version: version }))
    val root2_hash = hash(t2.nodes.get({ key_hash: ROOT_BITS, version: version }))

    match proof {
      | Exist(ep) => all {
        // It should be verified on tree1 but not on tree2
        assert(verifyMembership(root1_hash, ep, leaf.key_hash, leaf.value_hash)),
        assert(not(verifyMembership(root2_hash, ep, leaf.key_hash, leaf.value_hash))),
      }
      | NonExist(nep) => true
    }
  }

  pure def assert_proof_on_equivalent_trees(t1: Tree, t2: Tree, leaf: LeafNode, version: Version): bool = {
    val proof1 = ics23_prove(t1, leaf.key_hash, version).unwrap()
    val proof2 = ics23_prove(t2, leaf.key_hash, version).unwrap()

    val root1_hash = hash(t1.nodes.get({ key_hash: ROOT_BITS, version: version }))
    val root2_hash = hash(t2.nodes.get({ key_hash: ROOT_BITS, version: version }))

    and {
      match proof1 {
        | Exist(ep) => all {
          // It should be verified on both trees
          assert(verifyMembership(root1_hash, ep, leaf.key_hash, leaf.value_hash)),
          assert(verifyMembership(root2_hash, ep, leaf.key_hash, leaf.value_hash)),
        }
        | NonExist(nep) => assert(false)
      },
      match proof2 {
        | Exist(ep) => all {
          // It should be verified on both trees
          assert(verifyMembership(root1_hash, ep, leaf.key_hash, leaf.value_hash)),
          assert(verifyMembership(root2_hash, ep, leaf.key_hash, leaf.value_hash)),
        }
        | NonExist(nep) => assert(false)
      }
    }
  }

  run generate_one_tree = ({
    T1::init
  }).then(3.reps(_ => {
    T1::step
  }))

  run generate_two_trees = (all {
    T1::init,
    T2::init,
  }).then(3.reps(_ => all {
    T1::step,
    T2::step,
  }))

  // Some values to make tests easier to read
  val tree1 = T1::tree
  val tree2 = T2::tree
  val max_version = T1::version - 1

  /// If t1 and t2 are different, verifying proofs from t1 against t2 root should fail.
  run twoDifferentTreesTest = generate_two_trees.expect({
    nondet version = 1.to(max_version).oneOf()

    val leafs1 = tree1.treeAtVersion(version).allLeafs()
    val leafs2 = tree2.treeAtVersion(version).allLeafs()

    and {
      not(leafs1.empty()),
      not(leafs2.empty()),
      leafs1 != leafs2
    } implies
      // TODO: This should hold for non-existence proofs as well, but we only check existence
      nondet leaf = leafs1.oneOf()

      assert_proof_on_different_trees(tree1, tree2, leaf, version)
  })

  /// If t1 and t2 have the same keys but different values, verifying proofs
  /// from t1 against t2 root should fail.
  run twoDifferentTreesByOnlyValuesTest = generate_one_tree.expect({
    nondet version = 1.to(max_version).oneOf()
    val leafs1 = tree1.treeAtVersion(version).allLeafs()

    not(leafs1.empty()) implies
      val ops_with_different_values = leafs1.map(kv => { key_hash: kv.key_hash, op: Insert([kv.value_hash[0] + 1]) })
      val tree_with_different_values = empty_tree.apply(0, version, ops_with_different_values)

      nondet leaf = leafs1.oneOf()
      assert_proof_on_different_trees(tree1, tree_with_different_values, leaf, version)
  })

  /// If t1 and t2 are different but have one leaf in common, verifying a proof
  /// from t1 for that leaf against t2 root should fail.
  run twoDifferentTreesSameByOnlyOneKVTest = generate_two_trees.expect({
    val leafs1 = tree1.treeAtVersion(max_version).allLeafs()
    val leafs2 = tree2.treeAtVersion(max_version).allLeafs()

    and {
      not(leafs1.empty()),
      not(leafs2.empty()),
      leafs1 != leafs2
    } implies
      nondet leaf = leafs1.oneOf()
      val op = { key_hash: leaf.key_hash, op: Insert(leaf.value_hash) }

      val t1 = tree1.apply(max_version, max_version + 1, Set())
      val t2 = tree2.apply(max_version, max_version + 1, Set(op))

      assert_proof_on_different_trees(t1, t2, leaf, max_version + 1)
  })

  /// If t1 and t2 have the same keys but a single leaf with a different value,
  /// verifying proofs from t1 against t2 root should fail.
  run twoDifferentTreesByOnlyOneValueTest = generate_one_tree.expect({
    nondet version = 1.to(max_version).oneOf()
    val leafs1 = tree1.treeAtVersion(version).allLeafs()

    not(leafs1.empty()) implies
      nondet leaf_to_change = leafs1.oneOf()
      val ops_with_different_values = leafs1.map(kv => {
        key_hash: kv.key_hash,
        op: if (kv == leaf_to_change) Insert([kv.value_hash[0] + 1]) else Insert(kv.value_hash)
      })
      val tree_with_different_values = empty_tree.apply(0, version, ops_with_different_values)

      nondet leaf = leafs1.oneOf()
      assert_proof_on_different_trees(tree1, tree_with_different_values, leaf, version)
  })

  /// An existence proof for a tree should work on that tree after prunning, as
  /// long as the leaf is not prunned.
  run verificationOnPrunnedTreeTest = generate_one_tree.expect({
    nondet version = 1.to(max_version - 1).oneOf()
    val prunned_tree = tree1.prune(version)
    val active_leafs = prunned_tree.treeAtVersion(version).allLeafs()

    not(active_leafs.empty()) implies
      nondet leaf = active_leafs.oneOf()
      assert_proof_on_equivalent_trees(tree1, prunned_tree, leaf, version)
  })

  /// If we have a non-existence proof for a leaf and then we add it to the
  /// tree, the proof should not be verified anymore.
  run leafNotExistsThenExistsTest = generate_one_tree.expect({
    val leafs1 = tree1.treeAtVersion(max_version).allLeafs()
    leafs1.size() < all_key_hashes.size() implies
      nondet non_existent_key_hash = all_key_hashes.exclude(leafs1.map(leaf => leaf.key_hash)).oneOf()

      val proof = ics23_prove(tree1, non_existent_key_hash, max_version).unwrap()

      match proof {
        | NonExist(nep) => {
          val updated_tree = tree1.apply(max_version, max_version + 1, Set({ key_hash: non_existent_key_hash, op: Insert([1]) }))
          val updated_tree_hash = hash(updated_tree.nodes.get({ key_hash: ROOT_BITS, version: max_version + 1 }))
          // We added the leaf, so the non-existence proof should not be verified anymore
          assert(not(verifyNonMembership(updated_tree_hash, nep, non_existent_key_hash)))
        }
        | _ => assert(false)
      }
  })

  /// If we have an existence proof for a leaf and then we delete it from the
  /// tree, the proof should not be verified anymore.
  run leafExistsThenNotExistsTest = generate_one_tree.expect({
    val leafs1 = tree1.treeAtVersion(max_version).allLeafs()
    not(leafs1.empty()) implies {
      nondet leaf = leafs1.oneOf()
      val proof = ics23_prove(tree1, leaf.key_hash, max_version).unwrap()
      match proof {
        | Exist(ep) => {
          val updated_tree = tree1.apply(max_version, max_version + 1, Set({ key_hash: leaf.key_hash, op: Delete }))
          updated_tree.nodes.has({ key_hash: ROOT_BITS, version: max_version + 1 }) implies {
            val updated_tree_hash = hash(updated_tree.nodes.get({ key_hash: ROOT_BITS, version: max_version + 1 }))
            // We deleted the leaf, so the existence proof should not be verified anymore
            assert(not(verifyMembership(updated_tree_hash, ep, leaf.key_hash, leaf.value_hash)))
          }
        }
        | _ => assert(false)
      }
    }
  })
}
