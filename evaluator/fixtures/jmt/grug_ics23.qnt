// -*- mode: Bluespec; -*-

// This is a protocol specification of ICS23, tuned towards the Grug JMT
// (The original spec was for the IAVL case.)
//
// For details of ICS23, see:
// https://github.com/cosmos/ibc/tree/main/spec/core/ics-023-vector-commitments
//
// For the implementation of ICS23, see:
// https://github.com/cosmos/ics23
//
// We still have to parameterize the spec with the data structure parameters
// such as min_prefix_length, max_prefix_length, child_size, and hash.
//
// Igor Konnov, Informal Systems, 2022-2023
// Josef Widder, Informal Systems, 2024
// Aleksandar Ignjatijevic, Informal Systems, 2024
// Gabriela Moreira, Informal Systems, 2024

module grug_ics23 {
  import basicSpells.* from "./spells/basicSpells"
  import rareSpells.* from "./spells/rareSpells"
  import hashes.* from "./hashes"
  import node.* from "./node"
  import proof_types.* from "./proof_types"
  import utils.* from "./utils"

  type InnerSpec = {
    min_prefix_length: int, 
    max_prefix_length: int,
    child_size: int,
    empty_child: Term,
    child_order: List[int],
  }

  pure val ics23::InnerSpec: InnerSpec = {
    min_prefix_length: 1,
    max_prefix_length: 1,
    child_size: 32,
    empty_child: Hash256_ZERO,
    child_order: [0, 1]
  }

  type Padding = {
    min_prefix: int,
    max_prefix: int,
    suffix: int,
  }

  /// VerifyMembership returns true iff
  /// proof is an ExistenceProof for the given key and value AND
  /// calculating the root for the ExistenceProof matches
  /// the provided CommitmentRoot
  pure def verifyMembership(root: Term, proof: ExistenceProof, key: Bytes, value: Bytes): bool = {
    // TODO: specify Decompress
    // TODO: specify the case of CommitmentProof_Batch
    // TODO: CheckAgainstSpec ensures that the proof can be verified
    //       by the spec checker
    verify_existence(proof, root, key, value)
  }

  /// verify_existence that a proof matches a root
  pure def verify_existence(proof, root, key, value) = and {
    key == proof.key,
    value == proof.value,
    root == exists_calculate(proof)
  }

  /// calculate a hash from an exists proof
  pure def exists_calculate(p: ExistenceProof): Term =
    val leafHash = hashLeafNode({ key_hash: p.key, value_hash: p.value})    
    // the inner node nodeHashes are concatenated and hashed upwards
    p.path.foldl(leafHash,
      (child, inner) =>
        termHash(inner.prefix.termConcat(child).termConcat(inner.suffix)))

  /// VerifyNonMembership returns true iff
  /// proof is (contains) a NonExistenceProof,
  /// both left and right sub-proofs are valid existence proofs (see above) or None,
  /// left and right proofs are neighbors (or left/right most if one is None),
  /// provided key is between the keys of the two proofs
  pure def verifyNonMembership(root: Term, np: NonExistenceProof, key: Bytes): bool = {
    // TODO: specify Decompress
    // TODO: specify the case of CommitmentProof_Batch
    // TODO: CheckAgainstSpec ensures that the proof can be verified
    //       by the spec checker
    verify_non_existence(np, ics23::InnerSpec, root, key)
  }

  /// verify_non_existence verifies NonExistenceProof
  pure def verify_non_existence(proof: NonExistenceProof, spec: InnerSpec, root: Term, key: Bytes): bool = and{
    proof.left != None or proof.right != None,
    proof.left != None implies {
      pure val left = proof.left.unwrap()
      and {
        verify_existence(left, root, left.key, left.value), 
        key.greater_than(left.key),
      }
    },
    proof.right != None implies {
      pure val right = proof.right.unwrap()
      and {
        verify_existence(right, root, right.key, right.value),
        key.less_than(right.key),
      }
    },
    if (proof.left == None) {
      is_left_most(spec, proof.right.unwrap().path)
    } else if (proof.right == None) {
      is_right_most(spec, proof.left.unwrap().path)
    } else {
      is_left_neighbor(spec, proof.left.unwrap().path, proof.right.unwrap().path)
    }
  }

  pure def get_padding(spec: InnerSpec, branch: int): Option[Padding] = {
    match spec.child_order.findFirst(x => x == branch) {
      | Some(idx) => {
        pure val prefix = idx * spec.child_size
        pure val suffix = spec.child_size * (spec.child_order.length() - 1 - idx)
        Some({
          min_prefix: prefix + spec.min_prefix_length,
          max_prefix: prefix + spec.max_prefix_length,
          suffix: suffix,
        })
      }
      | None => None
    }
  }

  /// is_left_most returns true if this is the left-most path in the tree,
  /// excluding placeholder (empty child) nodes
  pure def is_left_most(spec: InnerSpec, path: List[InnerOp]): bool = {
    match get_padding(spec, 0) {
      | Some(pad) => {
        path.indices().forall(i =>
          val step = path[i]
          or {
            // the path goes left
            has_padding(step, pad),
            // the path goes right, but the left child is empty (a gap)
            left_branches_are_empty(spec, step)
          }
        )
      }
      | None => false
    }
  }

  /// is_right_most returns true if this is the left-most path in the tree,
  /// excluding placeholder (empty child) nodes
  pure def is_right_most(spec: InnerSpec, path: List[InnerOp]): bool = {
    pure val idx = spec.child_order.length() - 1
    match get_padding(spec, idx) {
      | Some(pad) => {
        path.indices().forall(i =>
          val step = path[i]
          or {
            // the path goes right
            has_padding(step, pad),
            // the path goes left, but the right child is empty (a gap)
            right_branches_are_empty(spec, step)
          }
        )
      }
      | None => false
    }
  }

  /// checks if an op has the expected padding
  pure def has_padding(op: InnerOp, pad: Padding): bool = and {
    op.prefix.termLen() >= pad.min_prefix,
    op.prefix.termLen() <= pad.max_prefix,
    // When inner turns left, suffixLen == child_size,
    // that is, we store the hash of the right child in the suffix.
    // When inner turns right, suffixLen == 0,
    // that is, we store the hash of the left child in the prefix.
    op.suffix.termLen() == pad.suffix,
  }

  /// This will look at the proof and determine which order it is.
  /// So we can see if it is branch 0, 1, 2 etc... to determine neighbors
  pure def order_from_padding(spec: InnerSpec, op: InnerOp): Option[int] = {
    pure val len = spec.child_order.length()
    range(0, len).find_first(branch => {
      match get_padding(spec, branch) {
        | Some(padding) => has_padding(op, padding)
        | None => false // This should actually early return but this is impossible for our InnerSpec
      }
    })
  }

  /// left_branches_are_empty returns true if the padding bytes correspond to all
  /// empty siblings on the left side of a branch, ie. it's a valid placeholder
  /// on a leftmost path
  pure def left_branches_are_empty(spec: InnerSpec, op: InnerOp): bool = and {
    pure val idx = order_from_padding(spec, op)
    pure val left_branches = idx.unwrap()
    if (left_branches == 0) {
      false
    }
    else {
      pure val child_size = spec.child_size
      match op.prefix.termLen().checked_sub(left_branches * child_size) {
        | Some(actual_prefix) => {
            0.to(left_branches - 1).forall(i => {
              pure val idx = spec.child_order.findFirst(x => x == i).unwrap()
              val from_index = actual_prefix + idx * child_size
              spec.empty_child == op.prefix.termSlice(from_index, from_index + child_size)
            })
          }
        | None => false
      }
    }
  }

  /// right_branches_are_empty returns true if the padding bytes correspond
  /// to all empty siblings on the right side of a branch,
  /// i.e. it's a valid placeholder on a rightmost path
  pure def right_branches_are_empty(spec: InnerSpec, op: InnerOp): bool = {
    pure val idx = order_from_padding(spec, op)
    and {
      idx != None,
      // count branches to right of this one
      pure val right_branches = spec.child_order.length() - 1 - idx.unwrap()
      // compare suffix with the expected number of empty branches
      if (right_branches == 0) {
        false
      } else if (op.suffix.termLen() != spec.child_size) {
        false
      } else {
        0.to(right_branches - 1).forall(i => {
          pure val idx = spec.child_order.findFirst(x => x == i).unwrap()
          val from_index = idx * spec.child_size
          spec.empty_child == op.suffix.termSlice(from_index, from_index + spec.child_size)
        })
      }
    }
  }

  /// is_left_step assumes left and right have common parents
  /// checks if left is exactly one slot to the left of right
  pure def is_left_step(spec: InnerSpec, left: InnerOp, right: InnerOp): bool = {
    // 'left' turns left, and 'right' turns right
    val left_idx = order_from_padding(spec, left)
    val right_idx = order_from_padding(spec, right)
    and {
      left_idx != None,
      right_idx != None,
      left_idx.unwrap() + 1 == right_idx.unwrap()
    }
  }

  /// is_left_neighbor returns true if `right` is the next possible path
  /// right of `left`
  ///
  /// Find the common suffix from the Left.Path and Right.Path and remove it.
  /// We have LPath and RPath now, which must be neighbors.
  /// Validate that LPath[len-1] is the left neighbor of RPath[len-1].
  /// For step in LPath[0..len-1], validate step is right-most node.
  /// For step in RPath[0..len-1], validate step is left-most node.
  pure def is_left_neighbor(spec: InnerSpec, left: List[InnerOp], right: List[InnerOp]): bool = {
    // count common tail (from end, near root)
    // cut the left and right paths
    left.indices().exists(li =>
      right.indices().exists(ri => and {
        // they are equidistant from the root
        length(left) - li == length(right) - ri,
        // The distance to the root (the indices are 0-based).
        // dist == 0 holds for the root.
        val dist = length(left) - 1 - li
        // the prefixes and suffixes match just above the cut points
        1.to(dist).forall(k =>
          val lnode = left[li + k]
          val rnode = right[ri + k]
          and {
            lnode.prefix == rnode.prefix,
            lnode.suffix == rnode.suffix
          }
        ),
        // Now topleft and topright are the first divergent nodes
        // make sure they are left and right of each other.
        // Actually, left[li] and right[ri] are an abstraction
        // of the same tree node:
        //  the left one stores the hash of the right one, whereas
        //  the right one stores the hash of the left one.
        is_left_step(spec, left[li], right[ri]),
        // left and right are remaining children below the split,
        // ensure left child is the rightmost path, and visa versa
        is_right_most(spec, left.slice(0, li)),
        is_left_most(spec, right.slice(0, ri)),
      })
    )
  }
}
