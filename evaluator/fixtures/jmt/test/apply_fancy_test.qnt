// -*- mode: Bluespec; -*-

module apply_fancy_test {
  import basicSpells.* from "../spells/basicSpells"
  import tree.* from "../tree"
  import node.* from "../node"
  import apply_fancy.* from "../apply_fancy"

  pure val empty_tree = { nodes: Map(), orphans: Set() }

  run singleInsertOnEmptyTreeTest =
    assert(
      apply(empty_tree, 0, 1, Set({ key_hash: [0, 1, 1], op: Insert([1, 1, 1, 1]) }))
      == { nodes: Map({ key_hash: [], version: 1 } -> Leaf({ key_hash: [0, 1, 1], value_hash: [1, 1, 1, 1] })),
           orphans: Set() }
    )

  run twoInsertsOnEmptyTreeTest =
    pure val ops = Set(
      { key_hash: [1, 1, 0, 0], op: Insert([1, 1, 1, 1]) }, // a
      { key_hash: [0, 1, 0, 0], op: Insert([1, 1, 1, 0]) } // r
    )

    pure val expected_left = Leaf({ key_hash: [0, 1, 0, 0], value_hash: [1, 1, 1, 0] })
    pure val expected_right = Leaf({ key_hash: [1, 1, 0, 0], value_hash: [1, 1, 1, 1] })
    pure val expected_root = Internal({
      left_child: Some({ version: 1, hash: expected_left.hash() }),
      right_child: Some({ version: 1, hash: expected_right.hash() })
    })
    assert(
      apply(empty_tree, 0, 1, ops)
      == { nodes: Map(
           { key_hash: [], version: 1 } -> expected_root,
           { key_hash: [0], version: 1 } -> expected_left,
           { key_hash: [1], version: 1 } -> expected_right
         ), orphans: Set() }
    )

  run twoInsertsWihSharedPrefixOnEmptyTreeTest =
    pure val ops = Set(
      { key_hash: [0, 1, 1, 0], op: Insert([1, 1, 1, 1]) }, // m
      { key_hash: [0, 1, 1, 1], op: Insert([1, 1, 1, 0]) }  // L
    )

    pure val expected_leaf_1 = Leaf({ key_hash: [0, 1, 1, 0], value_hash: [1, 1, 1, 1] })
    pure val expected_leaf_2 = Leaf({ key_hash: [0, 1, 1, 1], value_hash: [1, 1, 1 ,0] })
    pure val internal_height_3 = Internal({
      left_child: Some({ version: 1, hash: expected_leaf_1.hash() }),
      right_child: Some({ version: 1, hash: expected_leaf_2.hash() })
    })
    pure val internal_height_2 = Internal({
      left_child: None,
      right_child: Some({ version: 1, hash: internal_height_3.hash() })
    })
    pure val internal_height_1 = Internal({
      left_child: None,
      right_child: Some({ version: 1, hash: internal_height_2.hash() })
    })
    pure val expected_root = Internal({
      left_child: Some({ version: 1, hash: internal_height_1.hash() }),
      right_child: None
    })

    assert(
      apply(empty_tree, 0, 1, ops)
      == { nodes: Map(
           { key_hash: [], version: 1 } -> expected_root,
           { key_hash: [0], version: 1 } -> internal_height_1,
           { key_hash: [0, 1], version: 1 } -> internal_height_2,
           { key_hash: [0, 1, 1], version: 1 } -> internal_height_3,
           { key_hash: [0, 1, 1, 0], version: 1 } -> expected_leaf_1,
           { key_hash: [0, 1, 1, 1], version: 1 } -> expected_leaf_2
         ), orphans: Set() }
    )

  run singleInsertOnLeafTest =
    // At first, we have a tree with only "L"
    pure val tree_with_leaf = apply(empty_tree, 0, 0, Set({ key_hash: [0, 1, 1, 1], op: Insert([1, 1, 0, 0]) }))

    // Then we insert "a"
    pure val result = apply(tree_with_leaf, 0, 1, Set({ key_hash: [1, 1, 0, 0], op: Insert([1, 1, 1, 1]) }))

    pure val expected_left = Leaf({ key_hash: [0, 1, 1, 1], value_hash: [1, 1, 0, 0] }) // L
    pure val expected_right = Leaf({ key_hash: [1, 1, 0, 0], value_hash: [1, 1, 1, 1] }) // a
    pure val expected_root = Internal({
      left_child: Some({ version: 1, hash: expected_left.hash() }),
      right_child: Some({ version: 1, hash: expected_right.hash() })
    })

    assert(
      result == { nodes: Map(
           // Old leaf is still here under version 0
           { key_hash: [], version: 0 } -> Leaf({ key_hash: [0, 1, 1, 1], value_hash: [1, 1, 0, 0] }),
           // New tree under version 1
           { key_hash: [], version: 1 } -> expected_root,
           { key_hash: [0], version: 1 } -> expected_left,
           { key_hash: [1], version: 1 } -> expected_right
         ), orphans: Set({ key_hash: [], orphaned_since_version: 1, version: 0 }) }
    )

  pure val test_case_tree = apply(empty_tree, 0, 0, Set(
      { key_hash: [1, 1, 0, 0], op: Insert([1, 1, 1, 1]) }, // a
      { key_hash: [0, 1, 0, 0], op: Insert([1, 1, 1, 0]) }, // r
      { key_hash: [0, 1, 1, 0], op: Insert([1, 1, 0, 1]) }, // m
      { key_hash: [0, 1, 1, 1], op: Insert([1, 1, 0, 0]) }  // L
  ))

  run collapsingPathTest = {
    // start with the test case tree:
    //           root
    //         ┌──┴──┐
    //        (0)    1(a)
    //      ┌──┴──┐
    //    null   (01)
    //         ┌──┴──┐
    //      010(r)  (011)
    //            ┌──┴──┐
    //        0110(m)  0111(L)

    // Remove "r" and "m"
    pure val ops = Set(
      { key_hash: [0, 1, 0, 0], op: Delete }, // r
      { key_hash: [0, 1, 1, 0], op: Delete }  // m
    )

    pure val result = apply(test_case_tree, 0, 1, ops)

    // Expectation is:
    //           root
    //         ┌──┴──┐
    //        0(L)   1(a)
    pure val expected_left = Leaf({ key_hash: [0, 1, 1, 1], value_hash: [1, 1, 0, 0] }) // L
    pure val expected_right = Leaf({ key_hash: [1, 1, 0, 0], value_hash: [1, 1, 1, 1] }) // a
    pure val expected_root = Internal({
      left_child: Some({ version: 1, hash: expected_left.hash() }),
      right_child: Some({ version: 0, hash: expected_right.hash() })
    })

    all {
      assert(
        result.nodes == test_case_tree.nodes
          .put({ key_hash: [], version: 1 }, expected_root)
          .put({ key_hash: [0], version: 1 }, expected_left)
          // We actually don't need this one because 1(a) stayed the same
          // .put({ key_hash: [1], version: 1 }), expected_right)
      ),
      assert(result.orphans.map(o => o.key_hash) == Set(
        [],
        [0],
        [0, 1],
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 1, 0],
        [0, 1, 1, 1]
      ))
    }
  }

  /// Try deleting every single node. The function should return None as the
  /// new root hash. See that nodes have been properly marked as orphaned.
  run deletingAllNodesTest = {
    // start with the test case tree

    // Remove all nodes
    pure val ops = Set(
      { key_hash: [1, 1, 0, 0], op: Delete }, // a
      { key_hash: [0, 1, 0, 0], op: Delete }, // r
      { key_hash: [0, 1, 1, 0], op: Delete }, // m
      { key_hash: [0, 1, 1, 1], op: Delete }  // L
    )

    pure val result = apply(test_case_tree, 0, 1, ops)

    // PS: we return a tree instead of the root hash, so no way to check for that now.
    // If this is important, we can return it alongside the tree.

    // Check that every node has been marked as orphaned.
    assert(result.nodes.keys().forall(node => all {
      node.version == 0,
      result.orphans.contains({ key_hash: node.key_hash, orphaned_since_version: 1, version: 0 })
    }))
  }

  /// No-op is when the batch contains entirely of overwrites of values by the
  /// same value, or deletes of non-existing keys. The version number shouldn't
  /// be incremented and root hash shouldn't be changed.
  run noOpsTest = {
    // start with the test case tree

    // Remove all nodes
    pure val ops = Set(
      // overwriting keys with the same keys
      { key_hash: [1, 1, 0, 0], op: Insert([1, 1, 1, 1]) }, // a
      { key_hash: [0, 1, 0, 0], op: Insert([1, 1, 1, 0]) }, // r
      { key_hash: [0, 1, 1, 0], op: Insert([1, 1, 0, 1]) }, // m
      { key_hash: [0, 1, 1, 1], op: Insert([1, 1, 0, 0]) }, // L

      // deleting non-existing keys
      { key_hash: [0, 0, 0, 0], op: Delete },
      { key_hash: [1, 0, 1, 0], op: Delete },
      { key_hash: [0, 0, 0, 1], op: Delete }
    )

    pure val result = apply(test_case_tree, 0, 1, ops)

    // PS: we return a tree instead of the root hash, so no way to check for that now.
    // If this is important, we can return it alongside the tree.

    all {
      // Make sure that no node has been marked as orphaned (other than the
      // old root node, which is always orphaned).
      assert(result.orphans.forall(o => and {
        o.orphaned_since_version == 1,
        o.version == 0,
        o.key_hash == ROOT_BITS
      })),

      // Make sure no node of version 1 has been written (other than the new
      // root node, which is always written).
      assert(result.nodes.keys().forall(node => {
        node.version == 0 or (node.version == 1 and node.key_hash == ROOT_BITS)
      }))
    }
  }

  run insertAndUpdateOnSameSubtreeTest = {
    // This is a regression test for a bug in prepare_batch_for_subtree
    pure val ops = [
      Set(
        { key_hash: [0, 0, 0, 1], op: Insert([6]) },
        { key_hash: [0, 0, 1, 0], op: Insert([5]) },
        { key_hash: [0, 1, 0, 1], op: Insert([6]) },
        { key_hash: [0, 1, 1, 0], op: Insert([11]) },
        { key_hash: [1, 0, 0, 1], op: Insert([12]) }
      ),
      Set(
        { key_hash: [0, 0, 0, 0], op: Insert([7]) },
        { key_hash: [0, 0, 0, 1], op: Insert([3]) },
        { key_hash: [0, 1, 0, 0], op: Insert([3]) },
        { key_hash: [1, 0, 0, 1], op: Insert([12]) },
        { key_hash: [1, 1, 0, 0], op: Insert([7]) }
      ),
    ]

    val t1 = apply(empty_tree, 0, 1, ops[0])
    val t2 = apply(t1, 1, 2, ops[1])

    // We inserted { key_hash: [1, 1, 0, 0], op: Insert([7]) }
    // so there must be a leaf with it
    assert(t2.nodes.values().exists(n => match n {
      | Leaf(l) => l.key_hash == [1, 1, 0, 0] and l.value_hash == [7]
      | _ => false
    }))
  }
}
