// -*- mode: Bluespec; -*-

module tree {
  import basicSpells.* from "./spells/basicSpells"
  import rareSpells.* from "./spells/rareSpells"
  import node.* from "./node"
  export node.*
  import hashes.* from "./hashes"
  export hashes.*
  import utils.* from "./utils"

  pure val MAX_HASH_LENGTH = 4

  // For types like -> batch: Vec<(Hash256, Op<Hash256>)>,
  type OperationOnKey = { key_hash: BitArray, op: Operation }
  // For types like -> batch: Vec<(Hash256, Hash256)>
  type KeyWithValue = { key_hash: BitArray, value_hash: Bytes }

  type BitArray = List[int]
  type Version = int
  // TODO: rename key_hash to key_hash_prefix
  type NodeId = { version: Version, key_hash: BitArray }
  type OrphanId = {
    orphaned_since_version: Version,
    version: Version,
    key_hash: BitArray
  }

  type TreeMap = NodeId -> Node

  type Tree = {
    nodes: TreeMap,
    orphans: Set[OrphanId]
  }

  pure val ROOT_BITS: BitArray = []

  pure def mark_node_as_orphaned(tree: Tree, orphaned_since_version: Version, version: Version, key_hash: BitArray): Tree = {
    pure val orphan = {
      orphaned_since_version: orphaned_since_version,
      version: version,
      key_hash: key_hash,
    }
    { ...tree, orphans: tree.orphans.union(Set(orphan)) }
  }

  pure def is_node_orphaned(nodeId: NodeId, orphans: Set[OrphanId]): bool = {
    orphans.exists(el => (el.version == nodeId.version and el.key_hash == nodeId.key_hash))
  }
  
  pure def isRoot(key: NodeId) : bool = key.key_hash == ROOT_BITS

  pure def prune(tree: Tree, up_to_version: Version): Tree = {
    pure val orphans_to_be_removed = tree.orphans.filter(orphan =>
      orphan.orphaned_since_version <= up_to_version
    )
    pure val prunned_orphans = tree.orphans.filter(orphan =>
      orphan.orphaned_since_version > up_to_version
    )

    pure val keys_of_non_orphanes = tree.nodes.keys().filter(nodeId =>
      not(is_node_orphaned(nodeId, orphans_to_be_removed))
    )
    pure val updated_nodes = keys_of_non_orphanes.mapBy(x => tree.nodes.get(x))
    { nodes: updated_nodes, orphans: prunned_orphans }
  }

  pure def allLeafs(t: TreeMap): Set[LeafNode] = {
    val allNodes = t.keys().fold(Set(), (s, x) => s.union(Set(t.get(x))))
    allNodes.fold(Set(), (s, x) => match x {
      | Internal(_) => s
      | Leaf(x) => s.union(Set(x))
    })
  }
  
  pure def allInternals(t: TreeMap): NodeId -> InternalNode = 
    t.keys().fold(Map(), (internals, key) => 
      match t.get(key) {
      | Internal(x) => internals.put(key, x)
      | Leaf(_) => internals
    })
  
  pure def treeVersion(t: Tree): int =
    t.nodes.keys()
     .filter(nId => nId.key_hash == [])
     .fold(-1, (s, x) => {
       if (x.version > s)
         x.version
       else
         s
     })

  /// return the prefixes of all children from nodes at the given version
  pure def childrenPrefixes(nodes: TreeMap): Set[BitArray] = {
    val allChildren = nodes.keys().fold(Set(), (s, x) =>
      match nodes.get(x) {
        | Internal(n) =>
          val lc = if (n.left_child != None)
            Set(x.key_hash.append(0))
          else
            Set()
          val rc = if (n.right_child != None)
            Set(x.key_hash.append(1))
          else
            Set()
          s.union(lc).union(rc)
        | Leaf(_) => s
      }
    )
    allChildren.exclude(nodes.keys().map(nId => nId.key_hash))
  }

  /// return the NodeId for the given prefix with the largest version
  pure def mostRecentNodeId(nodes: TreeMap, key: BitArray): Option[NodeId] = {
    val default = { version: -1, key_hash: key }
    val result = nodes.keys()
      .filter(nId => nId.key_hash == key)
      .fold(default, (acc, e) =>
        if (e.version > acc.version) e else acc)

    if (result == default)
      None
    else
      Some(result)
  }

  pure def nodesAtVersion(t: TreeMap, version: int): TreeMap =
    t.keys()
     .filter(nId => nId.version == version)
     .mapBy(nId => t.get(nId))

  pure def nodesUpToVersion(t: TreeMap, version: int): TreeMap =
    t.keys()
     .filter(nId => nId.version <= version)
     .mapBy(nId => t.get(nId))

  pure def addDirectChildren(t: TreeMap, pool: TreeMap): TreeMap =
    childrenPrefixes(t).fold(t, (treeNodes, prefix) => {
      match mostRecentNodeId(pool, prefix) {
        | Some(nodeId) => treeNodes.put(nodeId, pool.get(nodeId))
        | None => treeNodes
      }
    })

  /// compute the tree at the given version
  /// TODO: check/re-check/double check. write tests
  pure def treeAtVersion(t: Tree, version: int): TreeMap = {
    // take the nodes for the current version...
    val startingNodes = nodesAtVersion(t.nodes, version)
    // ... and grow the tree by adding direct children
    val nodePool = nodesUpToVersion(t.nodes, version)
    0.to(MAX_HASH_LENGTH).fold(startingNodes, (treeNodes, _) => {
      addDirectChildren(treeNodes, nodePool)
    })
  }

  pure def findNode(t: TreeMap, key_hash: BitArray): Node = {
    pure val nodeId = t.keys().filter(n => n.key_hash == key_hash).getOnlyElement()
    t.get(nodeId)
  }

  /// Is the node an internal node?
  pure def isInternal(n: Node): bool =
    match n {
      | Internal(_) => true
      | Leaf(_) => false
    }

  /// Is the node a leaf node?
  pure def isLeaf(n) = (not(isInternal(n)))

  pure val all_key_hashes = {
    pure val kms = (0.to(MAX_HASH_LENGTH - 1).setOfMaps(Set(0, 1)))
    kms.map(km => range(0, MAX_HASH_LENGTH).foldl([], (acc, i) => acc.append(km.get(i))))
  }

  pure val all_value_hashes = Set([0], [1])
  
  pure def add_nodes(nodes: NodeId -> Node, new_nodes: Set[(NodeId, Node)]): NodeId -> Node = {
    new_nodes.fold(nodes, (nodes, new_node) => nodes.put(new_node._1, new_node._2))
  }

  pure def into_child(version: Version, outcome: Outcome): Option[Child] = {
    match outcome {
      | Updated(node) => Some({
        version: version,
        hash: node.hash(),
      })
      | Unchanged(_) => None // Unreachable if _ is not None
      | Deleted => None // Unreachable
    }
  }
}
