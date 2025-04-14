// -*- mode: Bluespec; -*-

module completeness {
  import grug_ics23.* from "./grug_ics23"
  import tree.* from "./tree"
  import proofs.* from "./proofs"
  import basicSpells.* from "./spells/basicSpells"

  /// For each node in the version of the tree, ics23_prove returns
  /// an existence proof, and the proof can be verified against the root
  /// hash
  pure def membershipCompleteness(tree: Tree, v: Version): bool =
    // Tree needs to have a root at this version
    tree.nodes.has({ key_hash: ROOT_BITS, version: v }) implies
      treeAtVersion(tree, v).values().forall(node =>
        match node {
          | Leaf(n) =>
            match ics23_prove(tree, n.key_hash, v) {
              | Some(cp) => match cp {
                  | Exist(ep) =>
                    pure val root = hash(tree.nodes.get({ key_hash: ROOT_BITS, version: v }))
                    verifyMembership(root, ep, n.key_hash, n.value_hash)
                  | NonExist(_) => false
                }
              | None => false
            }
          | Internal(_) => true
        }
      )

  /// For each key_hash that is not in the version of the tree,
  /// ics23_prove returns a non-existence proof, and the proof 
  /// can be verified against the root hash
  pure def nonMembershipCompleteness(tree: Tree, v: Version): bool =
    // Tree needs to have a root at this version
    tree.nodes.has({ key_hash: ROOT_BITS, version: v }) implies
      pure val key_hashes_from_tree = treeAtVersion(tree, v).allLeafs().map(l => l.key_hash)
      pure val root = hash(tree.nodes.get({ key_hash: ROOT_BITS, version: v }))

      all_key_hashes.exclude(key_hashes_from_tree).forall(k =>
        match ics23_prove(tree, k, v) {
          | Some(cp) => match cp {
              | NonExist(nep) =>
                verifyNonMembership(root, nep, k)
              | Exist(_) => false
            }
          | None => false
        }
      )
}
