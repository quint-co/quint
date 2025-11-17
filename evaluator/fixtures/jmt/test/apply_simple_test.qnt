// -*- mode: Bluespec; -*-

module apply_simple_test {
  import basicSpells.* from "../spells/basicSpells"
  import tree.* from "../tree"
  import node.* from "../node"

  import apply_simple.* from "../apply_simple"
  import apply_fancy as fancy from "../apply_fancy"

  pure val empty_tree = { nodes: Map(), orphans: Set() }

  run twoEmptyLeftNodesTest = {
     //           root
     //         ┌──┴──┐
     //        (0)    1
     //            ┌──┴──┐
     //          null   (11)
     //               ┌──┴──┐
     //             null  (111)
     //                  ┌──┴──┐
     //                1110   1111

    pure val small_tree = empty_tree.apply(0, 1, Set({ key_hash: [0, 1, 1, 1], op: Insert([5]) },
                                                     { key_hash: [1, 1, 1, 1], op: Insert([6]) }))

    pure val result = apply(small_tree, 1, 2, Set({ key_hash: [1, 1, 1, 0], op: Insert([7]) }))
    pure val leaf_for_0 = Leaf({ key_hash: [0, 1, 1, 1], value_hash: [5] })
    pure val expected_leaf_1 = Leaf({ key_hash: [1, 1, 1, 0], value_hash: [7] })
    pure val expected_leaf_2 = Leaf({ key_hash: [1, 1, 1, 1], value_hash: [6] })

    pure val internal_height_3 = Internal({
      left_child: Some({ version: 2, hash: expected_leaf_1.hash() }),
      right_child: Some({ version: 2, hash: expected_leaf_2.hash() })})
    
    pure val internal_height_2 = Internal({
      left_child: None,
      right_child: Some({ version: 2, hash: internal_height_3.hash() })
      })
    pure val internal_height_1 = Internal({
      left_child: None,
      right_child: Some({ version: 2, hash: internal_height_2.hash() })
      })
    pure val expected_root = Internal({
      left_child: Some({ version: 1, hash: leaf_for_0.hash() }),
      right_child: Some({ version: 2, hash: internal_height_1.hash() })
      })

    assert(
      result.treeAtVersion(2)
      == Map(
        { key_hash: [], version: 2 } -> expected_root,
        { key_hash: [0], version: 1 } -> leaf_for_0,
        { key_hash: [1], version: 2 } -> internal_height_1,
        { key_hash: [1, 1], version: 2 } -> internal_height_2,
        { key_hash: [1, 1, 1], version: 2 } -> internal_height_3,
        { key_hash: [1, 1, 1, 0], version: 2 } -> expected_leaf_1,
        { key_hash: [1, 1, 1, 1], version: 2 } -> expected_leaf_2
      )
     )
   }

  run singleInsertOnEmptyTreeTest =
    assert(
      empty_tree.apply( 0, 1, Set({ key_hash: [0, 1, 1], op:Insert([1, 1, 1, 1]) }))
      == { nodes: Map({ key_hash: [], version: 1 } -> Leaf({ key_hash: [0, 1, 1], value_hash: [1, 1, 1, 1] })),
           orphans: Set() }
    )

  run bigInsertionTest=
    pure val result = empty_tree
          .apply(0, 1, Set({ key_hash: [0, 1, 1], op:Insert([5])},
                           { key_hash: [1,0,1], op:Insert([77])},
                           { key_hash: [0, 1, 0], op:Insert([33]) },
                           {key_hash: [1,1,1], op:Insert([42])}))
    pure val result_nodes = Map(
      { key_hash: [], version: 1 } ->
        Internal({
          left_child:
            Some({
              hash:
                Map(
                  [0, 0] -> Raw([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                  [0, 1, 0] -> Raw([0]),
                  [0, 1, 1, 0] -> Raw([1, 0, 1, 0, 33]),
                  [0, 1, 1] -> Hash,
                  [0, 1, 2, 0] -> Raw([1, 0, 1, 1, 5]),
                  [0, 1, 2] -> Hash,
                  [0, 1] -> Hash,
                  [0] -> Hash
                ),
              version: 1
            }),
          right_child:
            Some({
              hash: Map([0, 0] -> Raw([0]), [0, 1, 0] -> Raw([1, 1, 0, 1, 77]), [0, 1] -> Hash, [0, 2, 0] -> Raw([1, 1, 1, 1, 42]), [0, 2] -> Hash, [0] -> Hash),
              version: 1
            })
        }),
      { key_hash: [0, 1, 0], version: 1 } -> Leaf({ key_hash: [0, 1, 0], value_hash: [33] }),
      { key_hash: [0, 1, 1], version: 1 } -> Leaf({ key_hash: [0, 1, 1], value_hash: [5] }),
      { key_hash: [0, 1], version: 1 } ->
        Internal({
          left_child: Some({ hash: Map([0, 0] -> Raw([1, 0, 1, 0, 33]), [0] -> Hash), version: 1 }),
          right_child: Some({ hash: Map([0, 0] -> Raw([1, 0, 1, 1, 5]), [0] -> Hash), version: 1 })
        }),
      { key_hash: [0], version: 1 } ->
        Internal({
          left_child: None,
          right_child:
            Some({
              hash: Map([0, 0] -> Raw([0]), [0, 1, 0] -> Raw([1, 0, 1, 0, 33]), [0, 1] -> Hash, [0, 2, 0] -> Raw([1, 0, 1, 1, 5]), [0, 2] -> Hash, [0] -> Hash),
              version: 1
            })
        }),
      { key_hash: [1, 0], version: 1 } -> Leaf({ key_hash: [1, 0, 1], value_hash: [77] }),
      { key_hash: [1, 1], version: 1 } -> Leaf({ key_hash: [1, 1, 1], value_hash: [42] }),
      { key_hash: [1], version: 1 } ->
        Internal({
          left_child: Some({ hash: Map([0, 0] -> Raw([1, 1, 0, 1, 77]), [0] -> Hash), version: 1 }),
          right_child: Some({ hash: Map([0, 0] -> Raw([1, 1, 1, 1, 42]), [0] -> Hash), version: 1 })
        })
    )
    assert(result_nodes == result.nodes)

  run bigInsertionUpdateTest =
    pure val result = empty_tree
          .apply(0, 1, Set({ key_hash: [0, 1, 1], op:Insert([5])},
                           { key_hash: [1,0,1], op:Insert([77])},
                           { key_hash: [0, 1, 0], op:Insert([33]) },
                           {key_hash: [1,1,1], op:Insert([42])}))

    val update = result.apply(1, 2,  Set({key_hash: [1,1,1], op:Insert([333])}))
    val update1 = update.apply(2, 3, Set({ key_hash: [0,1,1], op:Insert([662]) }))
    val result_nodes = Map(
      { key_hash: [], version: 1 } ->
        Internal({
          left_child:
            Some({
              hash:
                Map(
                  [0, 0] -> Raw([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                  [0, 1, 0] -> Raw([0]),
                  [0, 1, 1, 0] -> Raw([1, 0, 1, 0, 33]),
                  [0, 1, 1] -> Hash,
                  [0, 1, 2, 0] -> Raw([1, 0, 1, 1, 5]),
                  [0, 1, 2] -> Hash,
                  [0, 1] -> Hash,
                  [0] -> Hash
                ),
              version: 1
            }),
          right_child:
            Some({
              hash: Map([0, 0] -> Raw([0]), [0, 1, 0] -> Raw([1, 1, 0, 1, 77]), [0, 1] -> Hash, [0, 2, 0] -> Raw([1, 1, 1, 1, 42]), [0, 2] -> Hash, [0] -> Hash),
              version: 1
            })
        }),
      { key_hash: [0, 1, 0], version: 1 } -> Leaf({ key_hash: [0, 1, 0], value_hash: [33] }),
      { key_hash: [0, 1, 1], version: 1 } -> Leaf({ key_hash: [0, 1, 1], value_hash: [5] }),
      { key_hash: [0, 1], version: 1 } ->
        Internal({
          left_child: Some({ hash: Map([0, 0] -> Raw([1, 0, 1, 0, 33]), [0] -> Hash), version: 1 }),
          right_child: Some({ hash: Map([0, 0] -> Raw([1, 0, 1, 1, 5]), [0] -> Hash), version: 1 })
        }),
      { key_hash: [0], version: 1 } ->
        Internal({
          left_child: None,
          right_child:
            Some({
              hash: Map([0, 0] -> Raw([0]), [0, 1, 0] -> Raw([1, 0, 1, 0, 33]), [0, 1] -> Hash, [0, 2, 0] -> Raw([1, 0, 1, 1, 5]), [0, 2] -> Hash, [0] -> Hash),
              version: 1
            })
        }),
      { key_hash: [1, 0], version: 1 } -> Leaf({ key_hash: [1, 0, 1], value_hash: [77] }),
      { key_hash: [1, 1], version: 1 } -> Leaf({ key_hash: [1, 1, 1], value_hash: [42] }),
      { key_hash: [1], version: 1 } ->
        Internal({
          left_child: Some({ hash: Map([0, 0] -> Raw([1, 1, 0, 1, 77]), [0] -> Hash), version: 1 }),
          right_child: Some({ hash: Map([0, 0] -> Raw([1, 1, 1, 1, 42]), [0] -> Hash), version: 1 })
        })
    )
    val updated_nodes = Map(
      { key_hash: [], version: 1 } ->
        Internal({
          left_child:
            Some({
              hash:
                Map(
                  [0, 0] -> Raw([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                  [0, 1, 0] -> Raw([0]),
                  [0, 1, 1, 0] -> Raw([1, 0, 1, 0, 33]),
                  [0, 1, 1] -> Hash,
                  [0, 1, 2, 0] -> Raw([1, 0, 1, 1, 5]),
                  [0, 1, 2] -> Hash,
                  [0, 1] -> Hash,
                  [0] -> Hash
                ),
              version: 1
            }),
          right_child:
            Some({
              hash: Map([0, 0] -> Raw([0]), [0, 1, 0] -> Raw([1, 1, 0, 1, 77]), [0, 1] -> Hash, [0, 2, 0] -> Raw([1, 1, 1, 1, 42]), [0, 2] -> Hash, [0] -> Hash),
              version: 1
            })
        }),
      { key_hash: [], version: 2 } ->
        Internal({
          left_child:
            Some({
              hash:
                Map(
                  [0, 0] -> Raw([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                  [0, 1, 0] -> Raw([0]),
                  [0, 1, 1, 0] -> Raw([1, 0, 1, 0, 33]),
                  [0, 1, 1] -> Hash,
                  [0, 1, 2, 0] -> Raw([1, 0, 1, 1, 5]),
                  [0, 1, 2] -> Hash,
                  [0, 1] -> Hash,
                  [0] -> Hash
                ),
              version: 1
            }),
          right_child:
            Some({
              hash: Map([0, 0] -> Raw([0]), [0, 1, 0] -> Raw([1, 1, 0, 1, 77]), [0, 1] -> Hash, [0, 2, 0] -> Raw([1, 1, 1, 1, 333]), [0, 2] -> Hash, [0] -> Hash),
              version: 2
            })
        }),
      { key_hash: [0, 1, 0], version: 1 } -> Leaf({ key_hash: [0, 1, 0], value_hash: [33] }),
      { key_hash: [0, 1, 1], version: 1 } -> Leaf({ key_hash: [0, 1, 1], value_hash: [5] }),
      { key_hash: [0, 1], version: 1 } ->
        Internal({
          left_child: Some({ hash: Map([0, 0] -> Raw([1, 0, 1, 0, 33]), [0] -> Hash), version: 1 }),
          right_child: Some({ hash: Map([0, 0] -> Raw([1, 0, 1, 1, 5]), [0] -> Hash), version: 1 })
        }),
      { key_hash: [0], version: 1 } ->
        Internal({
          left_child: None,
          right_child:
            Some({
              hash: Map([0, 0] -> Raw([0]), [0, 1, 0] -> Raw([1, 0, 1, 0, 33]), [0, 1] -> Hash, [0, 2, 0] -> Raw([1, 0, 1, 1, 5]), [0, 2] -> Hash, [0] -> Hash),
              version: 1
            })
        }),
      { key_hash: [1, 0], version: 1 } -> Leaf({ key_hash: [1, 0, 1], value_hash: [77] }),
      { key_hash: [1, 1], version: 1 } -> Leaf({ key_hash: [1, 1, 1], value_hash: [42] }),
      { key_hash: [1, 1], version: 2 } -> Leaf({ key_hash: [1, 1, 1], value_hash: [333] }),
      { key_hash: [1], version: 1 } ->
        Internal({
          left_child: Some({ hash: Map([0, 0] -> Raw([1, 1, 0, 1, 77]), [0] -> Hash), version: 1 }),
          right_child: Some({ hash: Map([0, 0] -> Raw([1, 1, 1, 1, 42]), [0] -> Hash), version: 1 })
        }),
      { key_hash: [1], version: 2 } ->
        Internal({
          left_child: Some({ hash: Map([0, 0] -> Raw([1, 1, 0, 1, 77]), [0] -> Hash), version: 1 }),
          right_child: Some({ hash: Map([0, 0] -> Raw([1, 1, 1, 1, 333]), [0] -> Hash), version: 2 })
        })
    )
    val updated_nodes1 = Map(
      { key_hash: [], version: 1 } ->
        Internal({
          left_child:
            Some({
              hash:
                Map(
                  [0, 0] -> Raw([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                  [0, 1, 0] -> Raw([0]),
                  [0, 1, 1, 0] -> Raw([1, 0, 1, 0, 33]),
                  [0, 1, 1] -> Hash,
                  [0, 1, 2, 0] -> Raw([1, 0, 1, 1, 5]),
                  [0, 1, 2] -> Hash,
                  [0, 1] -> Hash,
                  [0] -> Hash
                ),
              version: 1
            }),
          right_child:
            Some({
              hash: Map([0, 0] -> Raw([0]), [0, 1, 0] -> Raw([1, 1, 0, 1, 77]), [0, 1] -> Hash, [0, 2, 0] -> Raw([1, 1, 1, 1, 42]), [0, 2] -> Hash, [0] -> Hash),
              version: 1
            })
        }),
      { key_hash: [], version: 2 } ->
        Internal({
          left_child:
            Some({
              hash:
                Map(
                  [0, 0] -> Raw([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                  [0, 1, 0] -> Raw([0]),
                  [0, 1, 1, 0] -> Raw([1, 0, 1, 0, 33]),
                  [0, 1, 1] -> Hash,
                  [0, 1, 2, 0] -> Raw([1, 0, 1, 1, 5]),
                  [0, 1, 2] -> Hash,
                  [0, 1] -> Hash,
                  [0] -> Hash
                ),
              version: 1
            }),
          right_child:
            Some({
              hash: Map([0, 0] -> Raw([0]), [0, 1, 0] -> Raw([1, 1, 0, 1, 77]), [0, 1] -> Hash, [0, 2, 0] -> Raw([1, 1, 1, 1, 333]), [0, 2] -> Hash, [0] -> Hash),
              version: 2
            })
        }),
      { key_hash: [], version: 3 } ->
        Internal({
          left_child:
            Some({
              hash:
                Map(
                  [0, 0] -> Raw([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                  [0, 1, 0] -> Raw([0]),
                  [0, 1, 1, 0] -> Raw([1, 0, 1, 0, 33]),
                  [0, 1, 1] -> Hash,
                  [0, 1, 2, 0] -> Raw([1, 0, 1, 1, 662]),
                  [0, 1, 2] -> Hash,
                  [0, 1] -> Hash,
                  [0] -> Hash
                ),
              version: 3
            }),
          right_child:
            Some({
              hash: Map([0, 0] -> Raw([0]), [0, 1, 0] -> Raw([1, 1, 0, 1, 77]), [0, 1] -> Hash, [0, 2, 0] -> Raw([1, 1, 1, 1, 333]), [0, 2] -> Hash, [0] -> Hash),
              version: 2
            })
        }),
      { key_hash: [0, 1, 0], version: 1 } -> Leaf({ key_hash: [0, 1, 0], value_hash: [33] }),
      { key_hash: [0, 1, 1], version: 1 } -> Leaf({ key_hash: [0, 1, 1], value_hash: [5] }),
      { key_hash: [0, 1, 1], version: 3 } -> Leaf({ key_hash: [0, 1, 1], value_hash: [662] }),
      { key_hash: [0, 1], version: 1 } ->
        Internal({
          left_child: Some({ hash: Map([0, 0] -> Raw([1, 0, 1, 0, 33]), [0] -> Hash), version: 1 }),
          right_child: Some({ hash: Map([0, 0] -> Raw([1, 0, 1, 1, 5]), [0] -> Hash), version: 1 })
        }),
      { key_hash: [0, 1], version: 3 } ->
        Internal({
          left_child: Some({ hash: Map([0, 0] -> Raw([1, 0, 1, 0, 33]), [0] -> Hash), version: 1 }),
          right_child: Some({ hash: Map([0, 0] -> Raw([1, 0, 1, 1, 662]), [0] -> Hash), version: 3 })
        }),
      { key_hash: [0], version: 1 } ->
        Internal({
          left_child: None,
          right_child:
            Some({
              hash: Map([0, 0] -> Raw([0]), [0, 1, 0] -> Raw([1, 0, 1, 0, 33]), [0, 1] -> Hash, [0, 2, 0] -> Raw([1, 0, 1, 1, 5]), [0, 2] -> Hash, [0] -> Hash),
              version: 1
            })
        }),
      { key_hash: [0], version: 3 } ->
        Internal({
          left_child: None,
          right_child:
            Some({
              hash: Map([0, 0] -> Raw([0]), [0, 1, 0] -> Raw([1, 0, 1, 0, 33]), [0, 1] -> Hash, [0, 2, 0] -> Raw([1, 0, 1, 1, 662]), [0, 2] -> Hash, [0] -> Hash),
              version: 3
            })
        }),
      { key_hash: [1, 0], version: 1 } -> Leaf({ key_hash: [1, 0, 1], value_hash: [77] }),
      { key_hash: [1, 1], version: 1 } -> Leaf({ key_hash: [1, 1, 1], value_hash: [42] }),
      { key_hash: [1, 1], version: 2 } -> Leaf({ key_hash: [1, 1, 1], value_hash: [333] }),
      { key_hash: [1], version: 1 } ->
        Internal({
          left_child: Some({ hash: Map([0, 0] -> Raw([1, 1, 0, 1, 77]), [0] -> Hash), version: 1 }),
          right_child: Some({ hash: Map([0, 0] -> Raw([1, 1, 1, 1, 42]), [0] -> Hash), version: 1 })
        }),
      { key_hash: [1], version: 2 } ->
        Internal({
          left_child: Some({ hash: Map([0, 0] -> Raw([1, 1, 0, 1, 77]), [0] -> Hash), version: 1 }),
          right_child: Some({ hash: Map([0, 0] -> Raw([1, 1, 1, 1, 333]), [0] -> Hash), version: 2 })
        })
    )
    assert(all{
      result.nodes == result_nodes,
      update.nodes == updated_nodes,
      update1.nodes == updated_nodes1,
    })

  run bigInsertionUpdateDeleteTest =
    pure val result = empty_tree.apply(0, 1, Set({ key_hash: [0, 1, 1], op:Insert([5])},
                                                { key_hash: [1,0,1], op:Insert([77])},
                                                { key_hash: [0, 1, 0], op:Insert([33]) },
                                                {key_hash: [1,1,1], op:Insert([42])},
                                                {key_hash: [1,1,1], op:Insert([333])},
                                                { key_hash: [0,1,1], op:Insert([662]) }))

    pure val delete_node_from_tree = result.apply(1, 2, Set({ key_hash: [0, 1, 0], op:Delete }))
    val result_nodes = Map(
      { key_hash: [], version: 1 } ->
        Internal({
          left_child:
            Some({
              hash:
                Map(
                  [0, 0] -> Raw([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                  [0, 1, 0] -> Raw([0]),
                  [0, 1, 1, 0] -> Raw([1, 0, 1, 0, 33]),
                  [0, 1, 1] -> Hash,
                  [0, 1, 2, 0] -> Raw([1, 0, 1, 1, 662]),
                  [0, 1, 2] -> Hash,
                  [0, 1] -> Hash,
                  [0] -> Hash
                ),
              version: 1
            }),
          right_child:
            Some({
              hash: Map([0, 0] -> Raw([0]), [0, 1, 0] -> Raw([1, 1, 0, 1, 77]), [0, 1] -> Hash, [0, 2, 0] -> Raw([1, 1, 1, 1, 333]), [0, 2] -> Hash, [0] -> Hash),
              version: 1
            })
        }),
      { key_hash: [0, 1, 0], version: 1 } -> Leaf({ key_hash: [0, 1, 0], value_hash: [33] }),
      { key_hash: [0, 1, 1], version: 1 } -> Leaf({ key_hash: [0, 1, 1], value_hash: [662] }),
      { key_hash: [0, 1], version: 1 } ->
        Internal({
          left_child: Some({ hash: Map([0, 0] -> Raw([1, 0, 1, 0, 33]), [0] -> Hash), version: 1 }),
          right_child: Some({ hash: Map([0, 0] -> Raw([1, 0, 1, 1, 662]), [0] -> Hash), version: 1 })
        }),
      { key_hash: [0], version: 1 } ->
        Internal({
          left_child: None,
          right_child:
            Some({
              hash: Map([0, 0] -> Raw([0]), [0, 1, 0] -> Raw([1, 0, 1, 0, 33]), [0, 1] -> Hash, [0, 2, 0] -> Raw([1, 0, 1, 1, 662]), [0, 2] -> Hash, [0] -> Hash),
              version: 1
            })
        }),
      { key_hash: [1, 0], version: 1 } -> Leaf({ key_hash: [1, 0, 1], value_hash: [77] }),
      { key_hash: [1, 1], version: 1 } -> Leaf({ key_hash: [1, 1, 1], value_hash: [333] }),
      { key_hash: [1], version: 1 } ->
        Internal({
          left_child: Some({ hash: Map([0, 0] -> Raw([1, 1, 0, 1, 77]), [0] -> Hash), version: 1 }),
          right_child: Some({ hash: Map([0, 0] -> Raw([1, 1, 1, 1, 333]), [0] -> Hash), version: 1 })
        })
    )
    val result_delete_nodes = Map(
      { key_hash: [], version: 1 } ->
        Internal({
          left_child:
            Some({
              hash:
                Map(
                  [0, 0] -> Raw([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                  [0, 1, 0] -> Raw([0]),
                  [0, 1, 1, 0] -> Raw([1, 0, 1, 0, 33]),
                  [0, 1, 1] -> Hash,
                  [0, 1, 2, 0] -> Raw([1, 0, 1, 1, 662]),
                  [0, 1, 2] -> Hash,
                  [0, 1] -> Hash,
                  [0] -> Hash
                ),
              version: 1
            }),
          right_child:
            Some({
              hash: Map([0, 0] -> Raw([0]), [0, 1, 0] -> Raw([1, 1, 0, 1, 77]), [0, 1] -> Hash, [0, 2, 0] -> Raw([1, 1, 1, 1, 333]), [0, 2] -> Hash, [0] -> Hash),
              version: 1
            })
        }),
      { key_hash: [], version: 2 } ->
        Internal({
          left_child: Some({ hash: Map([0, 0] -> Raw([1, 0, 1, 1, 662]), [0] -> Hash), version: 2 }),
          right_child:
            Some({
              hash: Map([0, 0] -> Raw([0]), [0, 1, 0] -> Raw([1, 1, 0, 1, 77]), [0, 1] -> Hash, [0, 2, 0] -> Raw([1, 1, 1, 1, 333]), [0, 2] -> Hash, [0] -> Hash),
              version: 1
            })
        }),
      { key_hash: [0, 1, 0], version: 1 } -> Leaf({ key_hash: [0, 1, 0], value_hash: [33] }),
      { key_hash: [0, 1, 1], version: 1 } -> Leaf({ key_hash: [0, 1, 1], value_hash: [662] }),
      { key_hash: [0, 1], version: 1 } ->
        Internal({
          left_child: Some({ hash: Map([0, 0] -> Raw([1, 0, 1, 0, 33]), [0] -> Hash), version: 1 }),
          right_child: Some({ hash: Map([0, 0] -> Raw([1, 0, 1, 1, 662]), [0] -> Hash), version: 1 })
        }),
      { key_hash: [0], version: 1 } ->
        Internal({
          left_child: None,
          right_child:
            Some({
              hash: Map([0, 0] -> Raw([0]), [0, 1, 0] -> Raw([1, 0, 1, 0, 33]), [0, 1] -> Hash, [0, 2, 0] -> Raw([1, 0, 1, 1, 662]), [0, 2] -> Hash, [0] -> Hash),
              version: 1
            })
        }),
      { key_hash: [0], version: 2 } -> Leaf({ key_hash: [0, 1, 1], value_hash: [662] }),
      { key_hash: [1, 0], version: 1 } -> Leaf({ key_hash: [1, 0, 1], value_hash: [77] }),
      { key_hash: [1, 1], version: 1 } -> Leaf({ key_hash: [1, 1, 1], value_hash: [333] }),
      { key_hash: [1], version: 1 } ->
        Internal({
          left_child: Some({ hash: Map([0, 0] -> Raw([1, 1, 0, 1, 77]), [0] -> Hash), version: 1 }),
          right_child: Some({ hash: Map([0, 0] -> Raw([1, 1, 1, 1, 333]), [0] -> Hash), version: 1 })
        })
    )
    assert(all{
      result.nodes == result_nodes,
      delete_node_from_tree.nodes == result_delete_nodes
    })
  run singleInsertOnLeafTest =
    // At first, we have a tree with only "L"
    pure val tree_with_leaf = empty_tree.apply(0, 1, Set({ key_hash: [0, 1, 1, 1], op:Insert([1, 1, 0, 0]) }))
    // Then we insert "a"
    pure val result = tree_with_leaf.apply(1, 2, Set({ key_hash: [1, 1, 0, 0], op:Insert([1, 1, 1, 1]) }))

    pure val expected_left_2 = Leaf({ key_hash: [0, 1, 1, 1], value_hash: [1, 1, 0, 0] }) // L
    pure val expected_right_2 = Leaf({ key_hash: [1, 1, 0, 0], value_hash: [1, 1, 1, 1] }) // a
    pure val expected_root_2 = Internal({
      left_child: Some({ version: 2, hash: expected_left_2.hash() }),
      right_child: Some({ version: 2, hash: expected_right_2.hash() })
    })

    assert(
      result.nodes == Map(
           // Old leaf is still here under version 0
           { key_hash: [], version: 1 } -> Leaf({ key_hash: [0, 1, 1, 1], value_hash: [1, 1, 0, 0] }),
           // New tree under version 1
           { key_hash: [], version: 2 } -> expected_root_2,
           { key_hash: [0], version: 2 } -> expected_left_2,
           { key_hash: [1], version: 2 } -> expected_right_2
         )
    )

  run singleInsertOnLeafThenUpdateTest =
    // At first, we have a tree with only "L"
    // Then we insert "a"
    pure val tree_with_leaf = empty_tree.apply(0, 1, Set({ key_hash: [0, 1, 1, 1], op:Insert([1, 1, 0, 0] )}))
    pure val result = tree_with_leaf.apply(1, 2, Set({ key_hash: [1, 1, 0, 0], op:Insert([1, 1, 1, 1]) }))
    // Then we update "a" with new value
    pure val updated_tree_result = result.apply(2, 3, Set({ key_hash: [1, 1, 0, 0], op:Insert([0, 0, 0, 0]) }))

    pure val expected_left_2 = Leaf({ key_hash: [0, 1, 1, 1], value_hash: [1, 1, 0, 0] }) // L
    pure val expected_right_2 = Leaf({ key_hash: [1, 1, 0, 0], value_hash: [1, 1, 1, 1] }) // a
    pure val expected_root_2 = Internal({
      left_child: Some({ version: 2, hash: expected_left_2.hash() }),
      right_child: Some({ version: 2, hash: expected_right_2.hash() })
    })
    pure val expected_right_3 = Leaf({ key_hash: [1, 1, 0, 0], value_hash: [0, 0, 0, 0] }) // a
    pure val expected_root_3 = Internal({
      left_child: Some({ version: 2, hash: expected_left_2.hash() }),
      right_child: Some({ version: 3, hash: expected_right_3.hash() })
    })
    assert(
      updated_tree_result.nodes == Map(
           // Old leaf is still here under version 1
           { key_hash: [], version: 1 } -> Leaf({ key_hash: [0, 1, 1, 1], value_hash: [1, 1, 0, 0] }),
           // New tree under version 1
           { key_hash: [], version: 2 } -> expected_root_2,
           { key_hash: [0], version: 2 } -> expected_left_2,
           { key_hash: [1], version: 2 } -> expected_right_2,
           // version 3 after updating "a"
           { key_hash: [], version: 3 } -> expected_root_3,
           { key_hash: [0], version: 2 } -> expected_left_2,
           { key_hash: [1], version: 3 } -> expected_right_3
         )
    )
  run singleInsertOnLeafThenUpdateThenDeleteTest =
    // At first, we have a tree with only "L"
    pure val tree_with_leaf = empty_tree.apply(0, 1, Set({ key_hash: [0, 1, 1, 1], op:Insert([1, 1, 0, 0]) }))
    // Then we insert "a"
    pure val result = tree_with_leaf.apply(1, 2, Set({ key_hash: [1, 1, 0, 0], op:Insert([1, 1, 1, 1]) }))
    // Then we update "a" with new value
    pure val updated_tree_result = result.apply(2, 3, Set({ key_hash: [1, 1, 0, 0], op:Insert([0, 0, 0, 0]) }))

    pure val updated_tree_delete = updated_tree_result.apply(3, 4, Set({ key_hash: [0, 1, 1, 1], op:Delete}))

    pure val expected_left_2 = Leaf({ key_hash: [0, 1, 1, 1], value_hash: [1, 1, 0, 0] }) // L
    pure val expected_right_2 = Leaf({ key_hash: [1, 1, 0, 0], value_hash: [1, 1, 1, 1] }) // a
    pure val expected_root_2 = Internal({
      left_child: Some({ version: 2, hash: expected_left_2.hash() }),
      right_child: Some({ version: 2, hash: expected_right_2.hash() })
    })
    pure val expected_right_3 = Leaf({ key_hash: [1, 1, 0, 0], value_hash: [0, 0, 0, 0] }) // a
    pure val expected_root_3 = Internal({
      left_child: Some({ version: 2, hash: expected_left_2.hash() }),
      right_child: Some({ version: 3, hash: expected_right_3.hash() })
    })
    assert(
      updated_tree_delete.nodes == Map(
           // Old leaf is still here under version 1
           { key_hash: [], version: 1 } -> Leaf({ key_hash: [0, 1, 1, 1], value_hash: [1, 1, 0, 0] }),
           // New tree under version 1
           { key_hash: [], version: 2 } -> expected_root_2,
           { key_hash: [0], version: 2 } -> expected_left_2,
           { key_hash: [1], version: 2 } -> expected_right_2,
           // version 3 after updating "a"
           { key_hash: [], version: 3 } -> expected_root_3,
           { key_hash: [0], version: 2 } -> expected_left_2,
           { key_hash: [1], version: 3 } -> expected_right_3,
          // version 4 after deleting "a"
           { key_hash: [], version: 4 } -> Leaf({ key_hash: [1, 1, 0, 0], value_hash: [0, 0, 0, 0] })
         )
    )
  run fancyAndSuperSimpleTest =
    val op1 = Set({ key_hash: [0, 0, 1, 0], op: Delete },
                              { key_hash: [0, 1, 1, 0], op: Delete },
                              { key_hash: [1, 0, 0, 0], op: Insert([13]) },
                              { key_hash: [1, 0, 0, 1], op: Delete },
                              { key_hash: [1, 0, 1, 1], op: Delete })
    val op2 = Set({ key_hash: [0, 0, 0, 0], op: Delete },
                              { key_hash: [0, 0, 1, 1], op: Delete },
                              { key_hash: [1, 0, 1, 0], op: Delete },
                              { key_hash: [1, 1, 0, 0], op: Delete },
                              { key_hash: [1, 1, 0, 1], op: Delete })
    val t1 = empty_tree.apply(0,1,op1)
    val t2 = t1.apply(1,2, op2)

    val super_simple =  { nodes: 
                            Map({ key_hash: [], version: 1 } -> Leaf({ key_hash: [1, 0, 0, 0], value_hash: [13] })),
                          orphans: Set({ key_hash: [], orphaned_since_version: 2, version: 1 })
                        }
    val fancy = { nodes: 
                    Map(
                        { key_hash: [], version: 1 } -> Leaf({ key_hash: [1, 0, 0, 0], value_hash: [13] }),
                        { key_hash: [], version: 2 } -> Leaf({ key_hash: [1, 0, 0, 0], value_hash: [13] })),
                orphans: Set({ key_hash: [], orphaned_since_version: 2, version: 1 })
  }
  assert(t2==fancy)
}
