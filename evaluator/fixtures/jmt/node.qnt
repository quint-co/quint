// -*- mode: Bluespec; -*-

module node {
  import hashes.* from "./hashes"
  import basicSpells.* from "./spells/basicSpells"

  type Child = {
    version: int,
    hash: Term,
  }

  type InternalNode = {
    left_child: Option[Child],
    right_child: Option[Child],
  }

  type LeafNode = {
    // In the implementation it is a hash of a key but in the Radix tree it is
    // just used as a key, so we use a list of bit and we treat it here just as
    // bytes
    key_hash: Bytes,
    value_hash: Bytes,
  }

  type Node =
    | Internal(InternalNode)
    | Leaf(LeafNode)

  type Outcome =
    | Unchanged(Option[Node])
    | Updated(Node)
    | Deleted

  type Operation =
    | Insert(Bytes)
    | Delete

  pure def is_leaf(n: Node) : bool =
    match n {
      | Leaf(n) => true
      | Internal(n) => false
    }

  val InternalNodeIdentifier: Bytes = [0]
  val LeafNodeIdentifier: Bytes = [1]
  val InternalNodeHashPrefix: Term = raw(InternalNodeIdentifier)
  val LeafNodeHashPrefix: Term = raw(LeafNodeIdentifier)

  pure def hashLeafNode(l: LeafNode): Term =
    termHash(LeafNodeHashPrefix
                  .termConcat(raw(l.key_hash))
                  .termConcat(raw(l.value_hash)))

  pure def hashOfChild(oc: Option[Child]) : Term =
    match oc {
      | None => Hash256_ZERO
      | Some(c) => c.hash
    }

  pure def hashInternalNode(l: InternalNode): Term =
    termHash(InternalNodeHashPrefix
                  .termConcat(l.left_child.hashOfChild())
                  .termConcat(l.right_child.hashOfChild()))

  pure def hash(n: Node) : Term = {
    match n {
      | Leaf(n) => hashLeafNode(n)
      | Internal(n) => hashInternalNode(n)
    }
  }
  pure def getLeafOrEmpty(n: Node) : LeafNode ={
    match n {
      | Leaf(l) => l
      | Internal(internal) => { key_hash: [], value_hash: [] }
    }
  }
}
