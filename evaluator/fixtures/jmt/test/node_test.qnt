// -*- mode: Bluespec; -*-

module node_test {
  import node.* from "../node"
  import hashes.* from "../hashes"
  import basicSpells.* from "../spells/basicSpells"
  import tree.* from "../tree"

  run hash::InternalTest= {
    nondet left_child_key = all_key_hashes.oneOf()
    nondet left_child_value = 0.to(16).oneOf()
    val left_leaf = {
        key_hash: left_child_key,
        value_hash:  [left_child_value]
    }

    nondet right_child_key =all_key_hashes.oneOf()
    nondet right_child_value = 0.to(16).oneOf()
    val right_leaf = {
        key_hash: right_child_key,
        value_hash: [right_child_value]
    }

    val left_leaf_hash = hashLeafNode(left_leaf)
    val right_leaf_hash = hashLeafNode(right_leaf)

    val expected_left_hash =  Map([0] -> Hash, 
                                  [0,0] -> Raw(LeafNodeIdentifier.concat(left_child_key).append(left_child_value)))
    val expected_right_hash = Map([0] -> Hash,
                                  [0,0] -> Raw(LeafNodeIdentifier.concat(right_child_key).append(right_child_value)))
                            
    val internal_node = {
        left_child: Some({version: 1, hash: left_leaf_hash}),
        right_child: Some({version: 1, hash: right_leaf_hash})
    }
    val hashed_internal_node = hash(Internal(internal_node))
    val expected_internal_node_hash =  Map( [0] -> Hash,
                                            [0, 0] -> Raw(InternalNodeIdentifier), 
                                            [0, 1, 0] -> Raw(LeafNodeIdentifier.concat(left_child_key).append(left_child_value)), 
                                            [0, 1] -> Hash, 
                                            [0, 2, 0] -> Raw(LeafNodeIdentifier.concat(right_child_key).append(right_child_value)), 
                                            [0, 2] -> Hash
                                          )
   assert(all{
        expected_left_hash == left_leaf_hash,
        expected_right_hash  == right_leaf_hash,
        expected_internal_node_hash == hashed_internal_node
    })
  }

  run hash::LeafTest = {
    nondet child_key = all_key_hashes.oneOf()
    nondet child_value = 0.to(16).oneOf()
    val leaf = {
        key_hash: child_key,
        value_hash:  [child_value]
    }
    val leaf_hash = hash(Leaf(leaf))
    val expected_left_hash =  Map([0,0] -> Raw(LeafNodeIdentifier.concat(child_key).append(child_value)),
                            [0] -> Hash)
    assert(expected_left_hash == leaf_hash)
  }

  run LeafCheckIsLeafTest = {
    nondet key = all_key_hashes.oneOf()
    nondet value = 0.to(16).oneOf()
    val l = {
        key_hash: key,
        value_hash:  [value]
    }
    assert(is_leaf(Leaf(l)) == true)
  }

  run InternalNodeCheckIsLeafTest = {
    nondet left_child_key = all_key_hashes.oneOf()
    nondet left_child_value = 0.to(16).oneOf()
    val left_leaf = {
        key_hash: left_child_key,
        value_hash:  [left_child_value]
    }

    nondet right_child_key = all_key_hashes.oneOf()
    nondet right_child_value = 0.to(16).oneOf()
    val right_leaf = {
        key_hash: right_child_key,
        value_hash:  [right_child_value]
    }

    val left_leaf_hash = hashLeafNode(left_leaf)
    val right_leaf_hash = hashLeafNode(right_leaf)

    val internal_node = {
        left_child: Some({version: 0, hash: left_leaf_hash}),
        right_child: Some({version: 0, hash: right_leaf_hash})
    }

    assert(is_leaf(Internal(internal_node)) == false)
  }

  run IncompleteInternalNodeCheckIsLeafTest = {
    nondet left_child_key = all_key_hashes.oneOf()
    nondet left_child_value = 0.to(16).oneOf()
    val left_leaf = {
        key_hash: left_child_key,
        value_hash: [left_child_value]
    }
    val left_leaf_hash = hashLeafNode(left_leaf)

    val inner_node = {
        left_child: Some({version: 0, hash: left_leaf_hash}),
        right_child: None
    }

    assert(is_leaf(Internal(inner_node)) == false)
  }

  run NoneHashOfChildTest = {
    val hash_of_none = hashOfChild(None)
    val expected_hash = Map([0] -> Raw([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]))

    assert(expected_hash == hash_of_none)
  }
}
