// -*- mode: Bluespec; -*-

module apply_state_machine {
  import basicSpells.* from "./spells/basicSpells"
  import rareSpells.* from "./spells/rareSpells"
  import hashes.* from "./hashes"
  import tree.* from "./tree"
  export tree.*
  import node.* from "./node"
  import utils.* from "./utils"

  import grug_ics23.* from "./grug_ics23"
  import proofs.* from "./proofs"

  import apply_simple as simple from "./apply_simple"
  import apply_fancy as fancy from "./apply_fancy"

  import completeness.* from "./completeness"
  import soundness.* from "./soundness"

  pure val VALUES = Set(Insert([1]), Insert([2]), Delete)

  var tree: Tree
  var version: int
  var smallest_unpruned_version: int
  var ops_history: List[Set[OperationOnKey]]

  action init = all {
    // For now, we always start with an empty tree
    tree' = { nodes: Map(), orphans: Set() },
    version' = 1,
    smallest_unpruned_version' = 1,
    ops_history' = [],
  }

  pure def to_operations(nondet_value: BitArray -> Operation): Set[OperationOnKey] = {
    nondet_value.mapToTuples().map(((key_hash, op)) => {
      { key_hash: key_hash, op: op }
    })
  }

  action step_parametrized(
    apply_op: (Tree, int, int, Set[OperationOnKey]) => Tree,
    assign_result: (Set[OperationOnKey], Tree) => bool
  ): bool = {
    nondet kms_with_value = all_key_hashes.setOfMaps(VALUES).oneOf()
    pure val all_ops = kms_with_value.to_operations().toList(fuzzy_compare)

    nondet threshold = 0.to(all_ops.length()).oneOf()
    pure val ops = all_ops.indices().filter(i => i < threshold).map(i => all_ops[i])
    pure val new_tree = apply_op(tree, version - 1, version, ops)

    assign_result(ops, new_tree)
  }

  action assign_result(ops: Set[OperationOnKey], new_tree: Tree): bool = all {
    tree' = new_tree,
    version' = version + 1,
    smallest_unpruned_version' = smallest_unpruned_version,
    ops_history' = ops_history.append(ops),
  }

  action step_fancy = step_parametrized(fancy::apply, assign_result)
  action step_simple = step_parametrized(simple::apply, assign_result)

  /********* INVARIANTS ***********/

  /// Which versions to check on the invariants
  /// This was checked both with Set(version) (better performance) and activeTreeVersions
  val versionsToCheck: Set[int] =
    Set(version)

  /// The set of unpruned tree versions that should be complete in the tree
  val activeTreeVersions: Set[int] =
    smallest_unpruned_version.to(tree.treeVersion())

  /// The set of tree maps to check
  val treesToCheck: Set[TreeMap] =
    versionsToCheck.map(v => treeAtVersion(tree, v))

  /// Make sure the tree encoded in the map forms a tree (everyone has a parent, except for the root)
  /// E.g., if a node has keyhash_prefix [1,0,0,1] then there must be a node with keyhash_prefix [1,0,0]
  val everyNodesParentIsInTheTreeInv: bool = {
    pure def everyNodesParentIsInTheTree(t: TreeMap): bool = {
      val prefixes = t.keys().map(p => p.key_hash)
      prefixes.filter(p => p != []).forall(p => {
        val parent = p.slice(0, p.length() - 1)
        prefixes.contains(parent)
      })
    }

    treesToCheck.forall(everyNodesParentIsInTheTree)
  }

  /// Invariant that checks that for any two leaf nodes, there is a nodeId in the
  /// tree that is the common prefix
  val nodeAtCommonPrefixInv: bool = {
    // Check whether there is a node with the given prefix
    pure def existsNode(t: TreeMap, b: Bytes): bool =
      t.keys().filter(nId => nId.key_hash == b).size() > 0

    // For any two leaf nodes, is there a nodeId in the tree that is the common prefix
    // of the nodes?
    pure def nodeAtCommonPrefix(t: TreeMap) : bool =
      t.allLeafs().forall(a =>
        t.allLeafs().forall(b =>
          (a.key_hash != b.key_hash) implies existsNode(t, commonPrefix(a, b))
      ))

    treesToCheck.forall(nodeAtCommonPrefix)
  }

  /// Make sure that the map encodes a tree. In particular, there is no internal node
  /// that has a leaf node as its prefix
  /// E.g., the map is not allowed to have: [0,0,1] -> internal node; [0,0] -> leaf node
  val noLeafInPrefixesInv: bool = {
    pure def noLeafInPrefixes(t: TreeMap): bool = {
      val nodes = t.keys().map(nId => nId.key_hash)
      val leafs = t.keys().filter(nId => t.get(nId).isLeaf()).map(nId => nId.key_hash)

      nodes.forall(node => {
        not(leafs.exists(leaf => node != leaf and leaf.prefix_of(node)))
      })
    }

    treesToCheck.forall(noLeafInPrefixes)
  }

  /// All nodes of type Internal have a child which is not None
  val allInternalNodesHaveAChildInv: bool = {
    pure def internalNodeHasAChild(n: InternalNode): bool = {
      n.left_child != None or n.right_child != None
    }

    pure def allInternalNodesHaveAChild(t: TreeMap): bool = {
      t.keys().forall(nId => {
        match t.get(nId) {
          | Internal(n) => internalNodeHasAChild(n)
          | Leaf(_) => true
        }
      })
    }

    treesToCheck.forall(allInternalNodesHaveAChild)
  }

  /// If a node has exactly one child, the child is an internal node
  /// (if it was a leaf, then the node itself would be the leaf)
  val densityInv: bool = {
    pure def isDense(t: TreeMap): bool =
      t.keys().forall(nId => {
        match t.get(nId) {
          | Internal(n) =>
            if (n.left_child == None and n.right_child != None) {
              // Only has right child, right child should be internal
              findNode(t, nId.key_hash.append(1)).isInternal()
            } else if (n.right_child == None and n.left_child != None) {
              // Only has left child, left child should be internal
              findNode(t, nId.key_hash.append(0)).isInternal()
            } else {
              // Has two children or none
              true
            }
          | Leaf(_) => true
        }
      })

    treesToCheck.forall(isDense)
  }

  /// Invariant: For every node has predecessors with higer (or equal) version
  /// (This could be rewritten to talk about direct predecessors only)
  val versionInv: bool = {
    pure def allPrefixes (l: List[a]): Set[List[a]] =
      0.to(l.length()).map(i => l.slice(0, i))

    // This invariant actually works on the whole tree rather than on a TreeMap
    tree.nodes.keys().forall(a =>
      allPrefixes(a.key_hash).forall(p =>
        tree.nodes.keys().exists(b =>
          p == b.key_hash and b.version >= a.version)))
  }

  /// Every internal node must have at least one child with the same version
  val denseVersionsInv: bool = {
    def denseVersions(t: TreeMap): bool = {
      t.keys().forall(nId => {
        match t.get(nId) {
          | Internal(n) =>
            val leftOK =
              match n.left_child {
                | Some(c) => t.keys().exists(a => a.key_hash == nId.key_hash.append(0) and a.version == nId.version)
                | None => false
              }
            val rightOK =
              match n.right_child {
                | Some(c) => t.keys().exists(a => a.key_hash == nId.key_hash.append(1) and a.version == nId.version)
                | None => false
              }
            or(leftOK, rightOK)
          | Leaf(_) => true
        }
      })
    }

    treesToCheck.forall(denseVersions)
  }

  /// Orphan should not be at one of the version trees after it gets orphaned
  val orphansInNoTreeInv: bool = {
    tree.orphans.forall(o =>
      val nodeId = { version: o.version, key_hash: o.key_hash }
      o.orphaned_since_version.to(tree.treeVersion()).forall(ver =>
        not(tree.treeAtVersion(ver).keys().contains(nodeId))))
  }

  /// Check that for all internal nodes, if they have a hash stored for a child,
  /// then the hash is the hash of the actualy the subtree for the child
  val hashInv: bool = {
    pure def properlyHashed(t: TreeMap): bool = {
      t.keys().forall(nID => {
        match t.get(nID) {
          | Leaf(_) => true
          | Internal(n) => {
            match n.left_child {
              | None => true
              | Some(c) => c.hash == hash(t.findNode(nID.key_hash.append(0)))
            }
            and
            match n.right_child {
              | None => true
              | Some(c) => c.hash == hash(t.findNode(nID.key_hash.append(1)))
            }
          }
        }
      })
    }

    treesToCheck.forall(properlyHashed)
  }

  /// All children in the tree should have different hashes
  val uniqueHashesInv: bool = {
    pure def uniqueHashes(t: TreeMap): bool = {
      pure val hashes = t.values().fold([], (acc, node) => {
        match node {
          | Internal(n) => {
            pure val acc_1 = match n.left_child {
              | None => acc
              | Some(c) => acc.append(c.hash)
            }
            match n.right_child {
              | None => acc_1
              | Some(c) => acc_1.append(c.hash)
            }
          }
         | _ => acc
        }
      })
      pure val uniqueHashes = hashes.foldl(Set(), (acc, hash) => {
        acc.union(Set(hash))
      })

      hashes.length() == uniqueHashes.size()
    }

    treesToCheck.forall(uniqueHashes)
  }

  /// The treemaps we use in the invariants should have unique key_hashes
  /// This is a sanity check for the treeAtVersion computation
  val goodTreeMapInv: bool = {
    pure def goodTreeMap(t: TreeMap): bool =
      t.keys().forall(a =>
        t.keys().forall(b => a.key_hash == b.key_hash implies a.version == b.version))

    treesToCheck.forall(goodTreeMap)
  }

  /// TreeMap is a bijection: we can map keys to values but also values to keys
  /// In other words, values are also unique
  /// Only works on tree map, as trees can have same nodes in different keys/versions
  val bijectiveTreeMapInv: bool = {
    pure def bijectiveTreeMap(t: TreeMap): bool =
      t.keys().size() == t.values().size()

    treesToCheck.forall(bijectiveTreeMap)
  }

  val operationSuccessInv: bool =
    pure def treeContainsKV(t: TreeMap, n: LeafNode): bool =
      t.values().contains(Leaf(n))

    pure def treeNotContainsKey(t: TreeMap, key: BitArray): bool =
      t.values()
        .filter(node =>
          match node {
            | Leaf(n) => n.key_hash == key
            | Internal(_) => false
        })
        .size() == 0

    val tm = tree.treeAtVersion(version - 1)
    ops_history.length() > 0 implies
      ops_history.last().forall(op => {
        match op.op {
          | Insert(value) => treeContainsKV(tm, { key_hash: op.key_hash, value_hash: value })
          | Delete => treeNotContainsKey(tm, op.key_hash)
        }
      })

  val membershipCompletenessInv = versionsToCheck.forall(v => membershipCompleteness(tree, v))
  val nonMembershipCompletenessInv = versionsToCheck.forall(v => nonMembershipCompleteness(tree, v))
  val membershipSoundnessInv = versionsToCheck.forall(v => membershipSoundness(tree, v))
  val nonMembershipSoundnessInv = versionsToCheck.forall(v => nonMembershipSoundness(tree, v))

  val verifyMembershipInv = {
    versionsToCheck.forall(version => {
      val leafs = tree.treeAtVersion(version).allLeafs()
      val root = hash(tree.nodes.get({ key_hash: ROOT_BITS, version: version }))

      tree.nodes.has({ key_hash: ROOT_BITS, version: version }) implies
        all_key_hashes.forall(key_hash => {
          val proof = ics23_prove(tree, key_hash, version)
          match proof {
            | Some(p) =>
              match p {
                | Exist(ep) => and {
                  leafs.exists(l => and {
                    // There should be a leaf with this key_hash
                    l.key_hash == key_hash,

                    // and verifying the proof with its value_hash should work,
                    verifyMembership(root, ep, l.key_hash, l.value_hash),

                    // while verifying with any other value_hash should fail
                    all_value_hashes.exclude(Set(l.value_hash)).forall(value_hash => {
                      not(verifyMembership(root, ep, key_hash, value_hash))
                    })
                  }),

                  // Verifying the proof against all other key_hashes and value_hashes should fail
                  all_key_hashes.exclude(Set(key_hash)).forall(key_hash => {
                    all_value_hashes.forall(value_hash => {
                      not(verifyMembership(root, ep, key_hash, value_hash))
                    })
                  }),
                }
                | NonExist(nep) => and {
                  // Verifying the proof against this key_hash should work
                  verifyNonMembership(root, nep, key_hash),
                  // Verifying the proof against all other key_hashes should fail
                  leafs.forall(l => {
                    not(verifyNonMembership(root, nep, l.key_hash))
                  }),
                }
              }
            | None => true  // corresponds to the panic in the rust code comment on the line 44 ics23.rs
          }
      })
    })
  }

  val treeInvariants = all {
    if (everyNodesParentIsInTheTreeInv) true else q::debug("everyNodesParentIsInTheTreeInv", false),
    if (nodeAtCommonPrefixInv) true else q::debug("nodeAtCommonPrefixInv", false),
    if (noLeafInPrefixesInv) true else q::debug("noLeafInPrefixesInv", false),
    if (allInternalNodesHaveAChildInv) true else q::debug("allInternalNodesHaveAChild", false),
    if (densityInv) true else q::debug("densityInv", false),
    if (versionInv) true else q::debug("versionInv", false),
    if (orphansInNoTreeInv) true else q::debug("orphansInNoTreeInv", false),
    if (hashInv) true else q::debug("hashInv", false),
    if (uniqueHashesInv) true else q::debug("uniqueHashesInv", false),
    if (goodTreeMapInv) true else q::debug("goodTreeMapInv", false),
    if (bijectiveTreeMapInv) true else q::debug("bijectiveTreeMapInv", false),
    if (operationSuccessInv) true else q::debug("operationSuccessInv", false),
  }

  val proofInvariants = all {
    if (membershipCompletenessInv) true else q::debug("membershipCompletenessInv", false),
    if (nonMembershipCompletenessInv) true else q::debug("nonMembershipCompletenessInv", false),
    if (membershipSoundnessInv) true else q::debug("membershipSoundnessInv", false),
    if (nonMembershipSoundnessInv) true else q::debug("nonMembershipSoundnessInv", false),
    if (verifyMembershipInv) true else q::debug("verifyMembershipInv", false),
  }

  val allInvariants = all {
    treeInvariants,
    proofInvariants,
  }
}
