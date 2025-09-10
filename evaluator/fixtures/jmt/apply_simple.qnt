// -*- mode: Bluespec; -*-

module apply_simple {
  import basicSpells.* from "./spells/basicSpells"
  import node.* from "./node"
  import tree.* from "./tree"
  import hashes.* from "./hashes"
  import utils.* from "./utils"

  pure def apply(tree: Tree, old_version: Version, new_version: Version, batch: Set[OperationOnKey]): Tree = 
    simple_apply(tree, old_version, new_version, batch)
  
  pure def extractOrphansFromNewVersion(oldTree: Tree, updatedTree: Tree, old_version: Version, new_version: Version) : Set[OrphanId] = 
    pure val nodes_at_old = updatedTree.treeAtVersion(old_version).keys()
    pure val nodes_at_new = updatedTree.treeAtVersion(new_version).keys()
    pure val orphaned_nodes = nodes_at_old.exclude(nodes_at_new)
    pure val new_orphans = orphaned_nodes.map(node => {
      orphaned_since_version: new_version,
      version: node.version,
      key_hash: node.key_hash,
    })
    oldTree.orphans.union(new_orphans)


  pure def unpackChild(child: Option[Child]) : Child = 
    pure val EMPTY_MAP = Map()
    match child {
      | Some(c) => { version: c.version, hash: c.hash }
      | None => { version: -1, hash: EMPTY_MAP }
    }
  pure def unpackInternalNode(internal: InternalNode) : { left: Child, right: Child } =
    { left: internal.left_child.unpackChild(), 
      right: internal.right_child.unpackChild() }

  pure def cmpInternalAndNode(internal : InternalNode, internalOldVersion: InternalNode) : bool = 
    pure val unpackedNew = internal.unpackInternalNode()
    pure val unpackedOld = internalOldVersion.unpackInternalNode()
    unpackedNew.left.hash == unpackedOld.left.hash and unpackedNew.right.hash == unpackedOld.right.hash
  
  pure def updateChildVersions(nodes: NodeId->Node, old_version_nodes: TreeMap, new_version: Version) : NodeId->Node = 
    val internalNodes = allInternals(nodes)
    val internalNodesOld = allInternals(old_version_nodes)
    
    internalNodesOld.keys().fold(nodes, (nodes, key) =>
        if (new_version > key.version and internalNodes.has({...key, version: new_version}))
          val internalOld = internalNodes.get(key)
          val internalNew = internalNodes.get({ ...key, version: new_version })
          val unpackedOld = internalOld.unpackInternalNode()
          val unpackedNew = internalNew.unpackInternalNode()
          // At most one children will have the same hash because, if they both had same hashes
          // we would have removed the new_node in `removeDuplicateEntries`
          // !!!!!!! THE COMMENT ABOVE IS INCORRECT
          // because we don't call removeDuplicateEntries for the root
          // therefore, the following condition can be true for the root node :O
          // This was found by heavy simulation, NICE
          if(
              (unpackedNew.left.hash == unpackedOld.left.hash and unpackedNew.left.version != unpackedOld.left.version)
              and (unpackedNew.right.hash == unpackedOld.right.hash and unpackedNew.right.version != unpackedOld.right.version)
            )
            nodes.set({ ...key, version: new_version }, Internal({ left_child: Some(unpackedOld.left), right_child: Some(unpackedOld.right) }))
          else if( unpackedNew.left.hash == unpackedOld.left.hash and  unpackedNew.left.version != unpackedOld.left.version )
            nodes.set({ ...key, version: new_version }, Internal({ ...internalNew, left_child: Some( unpackedOld.left ) }))
          else if ( unpackedNew.right.hash == unpackedOld.right.hash and unpackedNew.right.version != unpackedOld.right.version )
            nodes.set({ ...key, version: new_version }, Internal({ ...internalNew, right_child: Some( unpackedOld.right) }))
          else nodes
        else 
        nodes
      )


  pure def removeDuplicateEntries(nodes: TreeMap, old_version_nodes: TreeMap, current_version: Version) : NodeId->Node = 
    old_version_nodes.keys().fold(nodes, (nodes, key) => 
      if(current_version > key.version and nodes.keys().contains({...key, version: current_version}))
        val nodeForKey = nodes.get(key)
        val nodeForKeyWithNewVersion = nodes.get({...key, version: current_version})
        if (nodeForKey == nodeForKeyWithNewVersion and not(key.isRoot()))
          nodes.mapRemove({...key, version: current_version})
        else
            match nodeForKeyWithNewVersion {
             | Internal(internalNewVersion) 
                => match nodeForKey {
                  | Internal(internalOldVersion) =>  
                    if(cmpInternalAndNode(internalNewVersion, internalOldVersion)
                        and not(key.isRoot()))
                      nodes.mapRemove({...key, version: current_version})
                    else nodes
                  | Leaf(_) => nodes
                }
             | Leaf(_) => nodes
           }
      else 
        nodes
    )

  pure def simple_apply(tree: Tree, old_version: Version, new_version: Version, batch: Set[OperationOnKey]): Tree =
      val treeForVersion = tree.treeAtVersion(old_version)
      val treeRoot = { key_hash: ROOT_BITS, version: new_version }
      pure val existing_keys_with_values = treeForVersion.keys().fold(Set(), (acc, k) => {
          match tree.nodes.get(k) {
            | Leaf(leaf) => acc.union(Set(leaf))
            | _ => acc
          }
      })

      pure val keys_with_values_without_new =  existing_keys_with_values
                                  .filter(x => not(batch.map(op => op.key_hash).contains(x.key_hash)))
      
      val keys_and_values_and_op = batch.fold(keys_with_values_without_new, (kv_set, op) => 
          match op.op {
            | Insert(value_hash) => kv_set.union(Set({key_hash: op.key_hash, value_hash: value_hash}))
            | Delete => kv_set
          })
    // We will construct the three from the leafs up until the root
    // Say we want to construct a tree with nodes: 0000, 0001, 1111
    // We start from MAX_HASH_LENGTH - 1, which is 3 (i = 3)
    // We then find all prefixes of length 3 in the current nodes: 000 and 111
    // For each prefix, we do something.
    // For prefix 000: try to find both 000.append(0) and 000.append(1) in the current nodes
    //   - If both exist, then push 000 as an internal node both of them as children to the queue
    //   - If only one of them exist, push 000 as that node to the queue
    //   - If none exist, don't push nothing from the queue
    // In the example, we'll match the first case and push an internal node to the queue, which will now be: 000, 0000, 0001, 1111
    // For prefix 111:
    //   we will match the second case and push the node 1111 as 111 to the queue. In this case, we actually pop the old 1111.
    //   The resulting queue will be 000, 0000, 0001, 111
    // Next iteration, i = 2
    // The prefixes are: 00, 11
    // For prefix 00:
    //  - second case, pop 000 and push 00
    // For prefix 11:
    //   - second case, pop 111, push 11
    // Resulting queue: 00, 0000, 0001, 11
    // Next iteration, i = 1
    // The prefixes are: 0, 1
    // For prefix 0:
    //   - second case, pop 00 and push 0
    // For prefix 1:
    //   - second case, pop 11 and push 1
    // Resulting queue: 0, 0000, 0001, 1
    // Next iteration, i = 0
    // The prefixes are: _
    // For prefix: _
    //   - first case push _ as an internal node with 0 and 1 as children. Don't pop.
    // Resulting queue: 0, 0000, 0001, 1, _
    pure val result = range(0, MAX_HASH_LENGTH).foldr((Set(), keys_and_values_and_op.map(kv => { key_hash: kv.key_hash, node: Leaf(kv) })), (i, acc) => {
      // acc._1 is the overall set of nodes
      // acc._2 is a queue-like structure. It is a subset of acc._1
      pure val prefixes_of_length_i = acc._2.map(kv => kv.key_hash.slice(0, i))
      prefixes_of_length_i.fold(acc, (acc, prefix) => {
        pure val left = acc._2.find(k => k.key_hash == prefix.append(0))
        pure val right = acc._2.find(k => k.key_hash == prefix.append(1))

        // queue with popped items, to return when we want to pop
        pure val popped_queue = acc._2.filter(k => k.key_hash != prefix.append(0) and k.key_hash != prefix.append(1))
        // original queue, to return when we *don't* want to pop
        pure val unpopped_queue = acc._2

        pure val queue_2 = if (left != None and right != None) {
          pure val internal_node = Internal({
            left_child: Some({ version: new_version, hash: left.unwrap().node.hash() }),
            right_child: Some({ version: new_version, hash: right.unwrap().node.hash() })
          })

          // DON'T POP
          unpopped_queue.union(Set({ key_hash: prefix, node: internal_node }))

        } else if (left != None) {
          match left.unwrap().node {
            | Internal(_) => {
               pure val internal_node = Internal({
                 left_child: Some({ version: new_version, hash: left.unwrap().node.hash() }),
                 right_child: None,
               })
               // DON'T POP
               unpopped_queue.union(Set({ key_hash: prefix, node: internal_node }))
            }
            | Leaf(leaf) =>
              // POP
              popped_queue.union(Set({ key_hash: prefix, node: left.unwrap().node }))
          }
        } else if (right != None) {
          match right.unwrap().node {
            | Internal(_) => {
               pure val internal_node = Internal({
                 left_child: None,
                 right_child: Some({ version: new_version, hash: right.unwrap().node.hash() })
               })
               // DON'T POP
               unpopped_queue.union(Set({ key_hash: prefix, node: internal_node }))
            }
            | Leaf(leaf) =>
              // POP
              popped_queue.union(Set({ key_hash: prefix, node: right.unwrap().node }))
          }
        } else if (i == 0) {
          pure val root = popped_queue.getOnlyElement()
          // DON'T POP
          unpopped_queue.union(Set({ key_hash: prefix, node: root.node }))
        } else {
          // DON'T POP
          unpopped_queue
        }

        (acc._1.union(queue_2), queue_2)
      })
    })
    
    val nodes = result._2.map(kv => ({version: new_version, key_hash: kv.key_hash}, kv.node))
                      .fold(tree.nodes, (nodes, kv) => nodes.put(kv._1, kv._2))
                      .removeDuplicateEntries(treeAtVersion(tree, old_version), new_version)
                      .updateChildVersions(treeAtVersion(tree, old_version), new_version)
    
    val orphans = extractOrphansFromNewVersion(tree, { nodes: nodes, orphans: Set() },
                                               old_version, new_version)
      
    { nodes: nodes, orphans: orphans }
}
