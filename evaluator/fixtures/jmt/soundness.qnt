// -*- mode: Bluespec; -*-

module soundness {
  import grug_ics23.* from "./grug_ics23"
  import tree.* from "./tree"
  import proofs.* from "./proofs"
  import basicSpells.* from "./spells/basicSpells"

  /// For each keyhash (among all possible ones) where, ics23_prove returns
  /// an existence proof, the key is actually in the tree
  pure def membershipSoundness(tree: Tree, v: Version): bool =
    pure val nodes = treeAtVersion(tree, v).values()
    all_key_hashes.forall(k =>
      match ics23_prove(tree, k, v) {
        | Some(cp) => match cp {
            | Exist(ep) =>
                nodes.filter(n => match n {
                  | Leaf(n) => n.key_hash == k
                  | Internal(_) => false
                }).size() > 0
            | NonExist(_) => true
          }
        | None => true
      }
    )

  /// For each keyhash (among all possible ones) where, ics23_prove returns
  /// an non-existence proof, the key is not in the tree
  pure def nonMembershipSoundness(tree: Tree, v: Version): bool =
    pure val nodes = treeAtVersion(tree, v).values()
    all_key_hashes.forall(k =>
      match ics23_prove(tree, k, v) {
        | Some(cp) => match cp {
            | NonExist(nep) =>
                nodes.filter(n => match n {
                  | Leaf(n) => n.key_hash == k
                  | Internal(_) => false
                }).size() == 0
            | Exist(_) => true
          }
        | None => true
      }
    )
}
