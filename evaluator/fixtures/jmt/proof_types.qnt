// -*- mode: Bluespec; -*-

module proof_types {
  import basicSpells.* from "./spells/basicSpells"
  import hashes.* from "./hashes"

  type LeafOp = {
    prefix: Term
  }

  type InnerOp = {
    prefix: Term,
    suffix: Term
  }

  /// a proof of existence of (key, value)
  type ExistenceProof = {
    key: Bytes,
    value: Bytes,
    leaf: LeafOp,
    path: List[InnerOp]
  }

  /// a proof of non-existence of a key
  type NonExistenceProof = {
    key: Bytes,
    left: Option[ExistenceProof],
    right: Option[ExistenceProof]
  }

  type CommitmentProof =
    | Exist(ExistenceProof)
    | NonExist(NonExistenceProof)
}
