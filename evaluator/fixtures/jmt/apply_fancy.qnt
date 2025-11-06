// -*- mode: Bluespec; -*-

module apply_fancy {
  import hashes.* from "./hashes"
  import tree.* from "./tree"
  import node.* from "./node"
  import utils.* from "./utils"

  import basicSpells.* from "./spells/basicSpells"
  import commonSpells.* from "./spells/commonSpells"
  import rareSpells.* from "./spells/rareSpells"
  
  /// The return type of apply_* functions, as some of them modify the tree
  type ApplyResult = { outcome: Outcome, orphans_to_add: Set[OrphanId], nodes_to_add: Set[(NodeId, Node)] }

  /// Result of apply_at calls, for emulating recursion
  type ApplyAtMemo = (Version, Version, BitArray, Set[OperationOnKey]) -> ApplyResult

  pure def sorted_nodes(tree: Tree): List[NodeId] = {
    tree.nodes.keys().toList((a, b) => intCompare(a.key_hash.length(), b.key_hash.length()))
  }

  /// Pre computation of apply_at used to emulate recursion
  pure def pre_compute_apply_at(tree: Tree, new_version: Version, batch: Set[OperationOnKey]): ApplyAtMemo = {
    range(0, new_version).foldl(Map(), (memo, old_version) => {
      sorted_nodes(tree).foldr(memo, (node_id, memo) => {
        pure val bits = node_id.key_hash
        pure val batch_here = batch.filter(o => bits.prefix_of(o.key_hash))

        pure val memo_key = (new_version, old_version, bits, batch_here)
        pure val memo_value = tree.apply_at(memo, new_version, old_version, bits, batch_here)
        memo.put(memo_key, memo_value)
      })
    })
  }

  pure def apply(tree: Tree, old_version: Version, new_version: Version, batch: Set[OperationOnKey]): Tree = {
    pure val tree_1 =
      if (tree.nodes.has({ version: old_version, key_hash: ROOT_BITS })) {
        tree.mark_node_as_orphaned(new_version, old_version, ROOT_BITS)
      } else {
        tree
      }

    pure val memo = pre_compute_apply_at(tree_1, new_version, batch)
    pure val apply_result = tree_1.apply_at(memo, new_version, old_version, ROOT_BITS, batch)
    pure val new_tree = {
      nodes: tree_1.nodes.add_nodes(apply_result.nodes_to_add),
      orphans: tree_1.orphans.union(apply_result.orphans_to_add)
    }

    match apply_result.outcome {
      | Updated(new_root_node) => {
          ...new_tree,
          nodes: new_tree.nodes.put({ version: new_version, key_hash: ROOT_BITS }, new_root_node)
        }
      | Unchanged(optional) => {
          match optional {
            | Some(new_root_node) => {
                ...new_tree,
                nodes: new_tree.nodes.put({ version: new_version, key_hash: ROOT_BITS }, new_root_node)
              }
            | None => new_tree
          }
        }
      | _ => new_tree
    }
  }

  pure def apply_at(
    tree: Tree,
    memo: ApplyAtMemo,
    new_version: Version,
    old_version: Version,
    bits: BitArray,
    batch: Set[OperationOnKey]
  ): ApplyResult = {
    match (tree.nodes.safeGet({ version: old_version, key_hash: bits })) {
      | Some(node) => match node {
        | Leaf(leaf_node) => tree.apply_at_leaf(new_version, bits, leaf_node, batch)
        | Internal(internal_node) => tree.apply_at_internal(memo, new_version, bits, internal_node, batch)
      }
      | None => {
        pure val batchAndOp = prepare_batch_for_subtree(batch, None)
        tree.create_subtree(new_version, bits, batchAndOp._1, None)
      }
    }
  }

  pure def apply_at_internal(
    tree: Tree,
    memo: ApplyAtMemo,
    new_version: Version,
    bits: BitArray,
    internal_node: InternalNode,
    batch: Set[OperationOnKey]
  ): ApplyResult = {
    // Split the batch into two, one for left child, one for right.
    pure val partitioned_batch = partition_batch(batch, bits)
    pure val batch_for_left = partitioned_batch._1
    pure val batch_for_right = partitioned_batch._2

    // Apply the left batch at left child
    pure val left_bits = bits.append(0)
    pure val left_result = tree.apply_at_child(memo, new_version, left_bits, internal_node.left_child, batch_for_left)
    pure val left_outcome = left_result.outcome

    // Apply the right batch at right child
    pure val right_bits = bits.append(1)
    pure val right_result = tree.apply_at_child(memo, new_version, right_bits, internal_node.right_child, batch_for_right)
    pure val right_outcome = right_result.outcome

    // If the left child exists and have been updated or deleted, then the
    // old one needs to be marked as orphaned.
    pure val left_orphans = if (left_outcome.is_updated_or_deleted() and internal_node.left_child != None) {
      Set({
        orphaned_since_version: new_version,
        version: internal_node.left_child.unwrap().version,
        key_hash: left_bits,
      })
    } else Set()

    // If the right child exists and have been updated or deleted, then the
    // old one needs to be marked as orphaned.
    pure val right_orphans = if (right_outcome.is_updated_or_deleted() and internal_node.right_child != None) {
      Set({
        orphaned_since_version: new_version,
        version: internal_node.right_child.unwrap().version,
        key_hash: right_bits,
      })
    } else Set()

    pure val orphans_from_children =
      left_result.orphans_to_add
        .union(right_result.orphans_to_add)
        .union(left_orphans)
        .union(right_orphans)

    pure val nodes_from_children = left_result.nodes_to_add.union(right_result.nodes_to_add)

    pure val default_result = {
      outcome: Unchanged(None),
      orphans_to_add: orphans_from_children,
      nodes_to_add: nodes_from_children,
    }

    if (left_outcome.is_unchanged() and right_outcome.is_unchanged()) {
      // Neither children is changed. This node is unchanged as well.
      { ...default_result, outcome: Unchanged(Some(Internal(internal_node))) }

    } else if ((left_outcome == Deleted or left_outcome == Unchanged(None))
                and (right_outcome == Deleted or right_outcome == Unchanged(None))) {
      // Both children are deleted or never existed. Delete this node as well.
      { ...default_result, outcome: Deleted }

    } else if (left_outcome.updated_to_leaf() and (right_outcome == Deleted or right_outcome == Unchanged(None))) {
      // Left child is a leaf, right child is deleted.
      // Delete the current internal node and move left child up.
      // The child needs to marked as orphaned.
      { ...default_result, outcome: left_outcome }

    } else if (left_outcome.unchanged_leaf() and right_outcome == Deleted) {
      // Mark left child as orphaned
      match left_outcome {
        | Unchanged(left) => {
          pure val orphans = default_result.orphans_to_add.union(Set({
            orphaned_since_version: new_version,
            version: internal_node.left_child.unwrap().version,
            key_hash: left_bits,
          }))
          { ...default_result, outcome: Updated(left.unwrap()), orphans_to_add: orphans }
        }
        | _ => default_result // impossible
      }

    } else if ((left_outcome == Deleted or left_outcome == Unchanged(None)) and right_outcome.updated_to_leaf()) {
      // Left child is deleted, right child is a leaf.
      // Delete the current internal node and move right child up.
      // The child needs to marked as orphaned.
      { ...default_result, outcome: right_outcome }

    } else if (left_outcome == Deleted and right_outcome.unchanged_leaf()) {
      // Mark right child as orphaned
      match right_outcome {
        | Unchanged(right) => {
          pure val orphans = default_result.orphans_to_add.union(Set({
            orphaned_since_version: new_version,
            version: internal_node.right_child.unwrap().version,
            key_hash: right_bits,
          }))
          { ...default_result, outcome: Updated(right.unwrap()), orphans_to_add: orphans }
        }
        | _ => default_result // impossible
      }

    } else {
      // At least one child is updated and the path can't be collapsed.
      // Update the current node and return

      pure val new_left_child_and_tree = match left_outcome {
        | Updated(node) => {
          child: Some({ version: new_version, hash: node.hash() }),
          nodes_to_add: Set(({ version: new_version, key_hash: left_bits }, node))
        }
        | Deleted => {
          child: None,
          nodes_to_add: Set(),
        }
        | Unchanged(_) => {
          child: internal_node.left_child,
          nodes_to_add: Set(),
        }
      }

      pure val new_right_child_and_tree = match right_outcome {
        | Updated(node) => {
          child: Some({ version: new_version, hash: node.hash() }),
          nodes_to_add: Set(({ version: new_version, key_hash: right_bits }, node))
        }
        | Deleted => {
          child: None,
          nodes_to_add: Set(),
        }
        | Unchanged(_) => {
          child: internal_node.right_child,
          nodes_to_add: Set(),
        }
      }

      pure val new_internal_node = Internal({
        left_child: new_left_child_and_tree.child,
        right_child: new_right_child_and_tree.child
      })

      {
        ...default_result,
        outcome: Updated(new_internal_node),
        nodes_to_add: default_result.nodes_to_add
          .union(new_left_child_and_tree.nodes_to_add)
          .union(new_right_child_and_tree.nodes_to_add),
      }
    }
  }

  pure def apply_at_child(
    tree: Tree,
    memo: ApplyAtMemo,
    new_version: Version,
    child_bits: BitArray,
    child: Option[Child],
    batch: Set[OperationOnKey]
  ): ApplyResult = {
    if (batch == Set()) {
      match child {
        // Child doesn't exist, and there is no op to apply.
        | None => { outcome: Unchanged(None), orphans_to_add: Set(), nodes_to_add: Set() }
        // Child exists, but there is no op to apply.
        | Some(child) => {
          pure val child_node = tree.nodes.get({ version: child.version, key_hash: child_bits })
          { outcome: Unchanged(Some(child_node)), orphans_to_add: Set(), nodes_to_add: Set() }
        }
      }
    } else {
      match child {
        // Child doesn't exist, but there are ops to apply.
        | None => {
          pure val batchAndOp = prepare_batch_for_subtree(batch, None)
          tree.create_subtree(new_version, child_bits, batchAndOp._1, None)
        }
        // Child exists, and there are ops to apply.
        | Some(child) => {
          memo.get((new_version, child.version, child_bits, batch))
        }
      }
    }
  }

  pure def apply_at_leaf(
    tree: Tree,
    new_version: Version,
    bits: BitArray,
    leaf_node: LeafNode,
    batch: Set[OperationOnKey]
  ): ApplyResult = {
    pure val batchAndOp = prepare_batch_for_subtree(batch, Some(leaf_node))
    pure val batch = batchAndOp._1
    pure val operation = batchAndOp._2

    if (batch == Set()) {
      pure val outcome = match operation {
        | Some(op) => {
          match op.op {
            | Insert(value_hash) => {
              if (value_hash == leaf_node.value_hash) {
                // Overwriting with the same value hash, no-op.
                Unchanged(Some(Leaf(leaf_node)))
              } else {
                pure val updated_leaf_node = { ...leaf_node, value_hash: value_hash }
                Updated(Leaf(updated_leaf_node))
              }
            }
            | Delete => Deleted
          }
        }
        | None => Unchanged(Some(Leaf(leaf_node)))
      }

      { outcome: outcome, orphans_to_add: Set(), nodes_to_add: Set() }
    } else {
      match operation {
        | Some(op) => {
          match op.op {
            | Insert(value_hash) => {
                pure val updated_leaf_node = { ...leaf_node, value_hash: value_hash }
                tree.create_subtree(new_version, bits, batch, Some(updated_leaf_node))
            }
            | Delete => {
              tree.create_subtree(new_version, bits, batch, None)
            }
          }
        }
        | None => {
          tree.create_subtree(new_version, bits, batch, Some(leaf_node))
        }
      }
    }
  }

  pure def partition_batch(
    batch: Set[{ key_hash: BitArray | t }],
    bits: BitArray
  ): (Set[{ key_hash: BitArray | t }], Set[{ key_hash: BitArray | t }]) = {
    batch.fold((Set(), Set()), (acc, op) => {
      // 0 = left, 1 = right
      if (op.key_hash[bits.length()] == 0) {
        (acc._1.union(Set(op)), acc._2)
      } else {
        (acc._1, acc._2.union(Set(op)))
      }
    })
  }

  pure def partition_leaf(leaf: Option[LeafNode], bits: BitArray): (Option[LeafNode], Option[LeafNode]) = {
    match leaf {
      | Some(leaf) => {
        // 0 = left, 1 = right
        if (leaf.key_hash[bits.length()] == 0) {
          (Some(leaf), None)
        } else {
          (None, Some(leaf))
        }
      }
      | None => (None, None)
    }
  }

  pure def prepare_batch_for_subtree(
    batch: Set[OperationOnKey],
    existing_leaf: Option[LeafNode]
  ): (Set[KeyWithValue], Option[OperationOnKey]) = {
    pure val maybe_op = batch.fold(None, (acc, op) => {
      match existing_leaf {
        | Some(leaf) => {
            if (op.key_hash == leaf.key_hash) {
              Some(op)
            } else {
              acc
            }
          }
        | None => acc
      }
    })

    pure val filtered_batch = batch.filterMap(op => {
      if (maybe_op == Some(op)) {
        // early return
        None
      } else {
        match op.op {
          | Insert(value_hash) => Some({ key_hash: op.key_hash, value_hash: value_hash })
          | _ => None
        }
      }
    })

    (filtered_batch, maybe_op)
  }

  pure def create_subtree(
    tree: Tree,
    version: Version,
    bits: BitArray,
    batch: Set[KeyWithValue],
    existing_leaf: Option[LeafNode]
  ): ApplyResult = {
    pure val memo = pre_compute_create_subtree(tree, version, bits, batch, existing_leaf)

    pure val result = memo.get((version, bits, batch, existing_leaf))
    { outcome: result.outcome, orphans_to_add: Set(), nodes_to_add: result.nodes_to_add }
  }

  type CreateSubtreeMemo = (Version, BitArray, Set[KeyWithValue], Option[LeafNode]) -> { outcome: Outcome, nodes_to_add: Set[(NodeId, Node)] }

  pure def pre_compute_create_subtree(
    tree: Tree,
    version: Version,
    bits: BitArray,
    batch: Set[KeyWithValue],
    existing_leaf: Option[LeafNode]
  ): CreateSubtreeMemo = {
    pure val bits_to_compute = Set(0,1)
      .allListsUpTo(MAX_HASH_LENGTH)
      .filter(b => bits.isPrefixOf(b))
      .toList((a, b) => intCompare(a.length(), b.length()))

    bits_to_compute.foldr(Map(), (bits_now, memo) => {
      pure val batch_now = batch.filter(kv => bits_now.isPrefixOf(kv.key_hash))

      pure val existing_leaf_now = if (existing_leaf != None and bits_now.isPrefixOf(existing_leaf.unwrap().key_hash)) {
        existing_leaf
      } else {
        None
      }

      pure val memo_key = (version, bits_now, batch_now, existing_leaf_now)
      pure val memo_value = tree.create_subtree_with_memo(memo, version, bits_now, batch_now, existing_leaf_now)
      memo.put(memo_key, memo_value)
    })
  }
  pure def create_subtree_with_memo(
    tree: Tree,
    memo: CreateSubtreeMemo,
    version: Version,
    bits: BitArray,
    batch: Set[KeyWithValue],
    existing_leaf: Option[LeafNode]
  ): { outcome: Outcome, nodes_to_add: Set[(NodeId, Node)] } = {
     if (batch.size() == 0 and existing_leaf == None) {
       // The subtree to be created is empty: do nothing.
       { outcome: Unchanged(None), nodes_to_add: Set() }

     } else if (batch.size() == 0) {
       // The subtree to be created contains exactly one node, which is an
       // existing leaf node.
       pure val node = Leaf(existing_leaf.unwrap()) // existing_leaf_now is Some for sure, since we didn't match the first case
       { outcome: Updated(node), nodes_to_add: Set() }

     } else if (batch.size() == 1 and existing_leaf == None) {
       // The subtree to be created contains exactly one node, which is a
       // new leaf node.
       // This case requires special attention: we don't save the node yet,
       // because the path may be collapsed if it's sibling gets deleted.
       pure val node = Leaf(batch.getOnlyElement())
       { outcome: Updated(node), nodes_to_add: Set() }

    } else {
       // The subtree to be created contains more 2 or more nodes.
       // Recursively create the tree. Return the subtree's root, an
       // internal node.
       // Note that in this scenario, we certainly don't need to collapse the
       // path.
       pure val partitioned_batch = partition_batch(batch, bits)
       pure val batch_for_left = partitioned_batch._1
       pure val batch_for_right = partitioned_batch._2

       pure val partitioned_leaf = partition_leaf(existing_leaf, bits)
       pure val leaf_for_left = partitioned_leaf._1
       pure val leaf_for_right = partitioned_leaf._2

       pure val left_bits = bits.append(0)
       pure val left = memo.get((version, left_bits, batch_for_left, leaf_for_left))

       pure val right_bits = bits.append(1)
       pure val right = memo.get((version, right_bits, batch_for_right, leaf_for_right))

       pure val nodes_to_add =
         left.nodes_to_add
         .union(right.nodes_to_add)
         .union(match left.outcome {
           | Updated(node) => Set(({ version: version, key_hash: left_bits }, node))
           | Unchanged(option) => match option {
              | Some(node) => Set(({ version: version, key_hash: left_bits }, node))
              | _ => Set()
             }
          | _ => Set()
         })
         .union(match right.outcome {
           | Updated(node) => Set(({ version: version, key_hash: right_bits }, node))
           | Unchanged(option) => match option {
              | Some(node) => Set(({ version: version, key_hash: right_bits }, node))
              | _ => Set()
             }
          | _ => Set()
         })

       pure val node = Internal({
         left_child: into_child(version, left.outcome),
         right_child: into_child(version, right.outcome),
       })

       { outcome: Updated(node), nodes_to_add: nodes_to_add }
     }
  }

}
