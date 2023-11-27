// -*- mode: Bluespec; -*-
// This is a protocol specification of ICS23, tuned towards the IAVL case.
//
// For details of ICS23, see:
// https://github.com/cosmos/ibc/tree/main/spec/core/ics-023-vector-commitments
//
// For the implementation of ICS23, see:
// https://github.com/confio/ics23/
//
// We still have to parameterize the spec with the data structure parameters
// such as MinPrefixLen, MaxPrefixLen, ChildSize, and hash.
// For the moment, the main goal of this spec is to understand the algorithm
// and test it with the simulator.
//
// 1. To execute the unit tests in REPL, type the following:
// $ quint repl
// >>> .load ics23.qnt
// >>> import ics23test.*
// >>> allTests
//
// REPL should display 'true'.
//
// 2. To execute simple PBT-like tests for 1000 runs of length up to 10 steps
// in REPL, type the following:
// $ quint repl
// >>> .load ics23.qnt
// >>> import ics23pbt.*
// >>> _test(1000, 10, "Init", "Next", "TestVerify")
// >>> _test(1000, 10, "Init", "Next", "TestNonMem")
//
// If REPL displays 'false', it has found an example,
// which can be inspected with q::lastTrace.
//
// 3. To execute advanced PBT-like tests for 1000 runs in REPL,
// type the following:
// $ quint repl
// >>> .load ics23.qnt
// >>> import trees.*
// >>> _test(1000, 1, "Init", "Next", "NonMemInv")
// >>> _test(1000, 1, "Init", "Next", "MemInv")
//
// If REPL displays 'false', it has found an example,
// which can be inspected with q::lastTrace. We expect these tests to
// always return 'true'. Otherwise, this indicates an invariant violation.
//
// Igor Konnov, Informal Systems, 2022

module basics {
  /// We represent byte sequences as lists of integers
  type WORD_T = List[int]

  /// we interpret the empty word as nil
  def isNil(word) = length(word) == 0

  /// compare two integer words lexicographically
  def lessThan(w1, w2) = {
    val len1 = length(w1)
    val len2 = length(w2)
    or {
      len1 < len2 and w1.indices().forall(i => w1[i] == w2[i]),
      and {
        len1 == len2,
        w1.indices().exists(i => and {
          w1[i] < w2[i],
          w1.indices().forall(j => j < i implies w1[i] == w2[j])
        })
      }
    }
  }
}

// This is a specification of the membership and non-membership proofs
// of ICS23 for IAVL trees:
//
// https://github.com/confio/ics23/blob/master/go/proof.go
module ics23 {
  import basics.*

  // ICS23 proof checking for IavlSpec.
  // In contrast to the ICS32 implementation, we specialize it to binary trees:
  // https://github.com/confio/ics23/tree/master/go

  // type aliases for readability
  type KEY_T = WORD_T
  type VALUE_T = WORD_T
  type CommitmentRoot_T = WORD_T
  type CommitmentProof_T = WORD_T

  // ICS23 IavlSpec has:
  // MinPrefixLength = 4
  // MaxPrefixLength = 12
  // ChildSize = 33
  //
  // To ease spec testing, we set:
  val MinPrefixLen = 1
  val MaxPrefixLen = 2
  // It is crucial to make sure that ChildSize > MaxPrefixLen
  val ChildSize = 3 // with length byte
  // Empty child is a predefined sequence that fills an absent child.
  val EmptyChild = [ 0, 0, 0 ]

  /// We need a hash that returns ChildSize elements,
  /// with 32 being in the head.
  /// For simulation, we are just summing up the word elements modulo 8.
  /// For verification, we should use an injective function as a perfect hash.
  def hash(word) = [ 32, 0, word.foldl(0, (i, j) => i + j) % 8 ]

  type LEAF_T = {
    // The implementation additionally stores hashing and length functions:
    // hash, prehashKey, prehashValue, len. Since we fix the spec to IAVL,
    // we do not have to carry them around.
    prefix: WORD_T
  }

  type INNER_T = {
    // The implementation additionally stores the hashing function.
    // Since we fix the spec to IAVL, we do not have to carry it around.
    prefix: WORD_T,
    suffix: WORD_T
  }

  /// a proof of existence of (key, value)
  type ExistsProof_T = {
    key: KEY_T, value: VALUE_T, leaf: LEAF_T, path: List[INNER_T]
  }

  /// a proof of non-existence of a key
  type NonExistsProof_T = {
    key: KEY_T, left: ExistsProof_T, right: ExistsProof_T
  }

  /// calculate a hash from an exists proof
  def existsCalculate(p):
      (ExistsProof_T) => CommitmentProof_T = {
    // this is how the leaf hash is computed
    val leafHash =
      hash(p.leaf.prefix
        .append(length(p.key))
        .concat(hash(p.key))
        .append(length(p.value))
        .concat(hash(p.value)))

    // the inner node nodeHashes are concatenated and hashed upwards
    p.path.foldl(leafHash,
      (child, inner) => hash(inner.prefix.concat(child).concat(inner.suffix)))
  }

  /// verify that a proof matches a root
  def verify(proof, root, key, value) = and {
    key == proof.key,
    value == proof.value,
    root == existsCalculate(proof)
  }

  /// VerifyMembership returns true iff
  /// proof is an ExistenceProof for the given key and value AND
  /// calculating the root for the ExistenceProof matches
  /// the provided CommitmentRoot
  def verifyMembership(root, proof, key, value):
      (CommitmentRoot_T, ExistsProof_T, KEY_T, VALUE_T) => bool = {
    // TODO: specify Decompress
    // TODO: specify the case of CommitmentProof_Batch
    // TODO: CheckAgainstSpec ensures that the proof can be verified
    //       by the spec checker
    verify(proof, root, key, value)
  }

  /// checks if an op has the expected padding
  def hasPadding(inner, minPrefixLen, maxPrefixLen, suffixLen) = and {
    length(inner.prefix) >= minPrefixLen,
    length(inner.prefix) <= maxPrefixLen,
    // When inner turns left, suffixLen == ChildSize,
    // that is, we store the hash of the right child in the suffix.
    // When inner turns right, suffixLen == 0,
    // that is, we store the hash of the left child in the prefix.
    length(inner.suffix) == suffixLen
  }

  /// This will look at the proof and determine which order it is...
  /// So we can see if it is branch 0, 1, 2 etc... to determine neighbors
  /// https://github.com/confio/ics23/blob/a4daeb4c24ce1be827829c0841446abc690c4f11/go/proof.go#L400-L411
  def orderFromPadding(inner) = {
    // Specialize orderFromPadding to IavlSpec:
    // ChildOrder = { 0, 1 }
    // branch = 0: minp, maxp, suffix = MinPrefixLen, MaxPrefixLen, ChildSize
    // branch = 1: minp, maxp, suffix =
    //             ChildSize + MinPrefixLen, ChildSize + MaxPrefixLen, 0
    if (hasPadding(inner, MinPrefixLen, MaxPrefixLen, ChildSize)) {
      // the node turns left
      (0, true)
    } else if (hasPadding(inner, ChildSize + MinPrefixLen,
                          ChildSize + MaxPrefixLen, 0)) {
      // the node turns right
      (1, true)
    } else {
      // error
      (0, false)
    }
  }

  /// leftBranchesAreEmpty returns true if the padding bytes correspond to all
  /// empty siblings on the left side of a branch, ie. it's a valid placeholder
  /// on a leftmost path
  def leftBranchesAreEmpty(inner) = and {
    // the case of leftBranches == 0 returns false
    val order = orderFromPadding(inner)
    order._2 and order._1 != 0,
    // the remaining case is leftBranches == 1, see orderFromPadding
    // actualPrefix = len(inner.prefix) - 33
    length(inner.prefix) >= ChildSize,
    // getPosition(0) returns 0
    val fromIndex = length(inner.prefix) - ChildSize
    inner.prefix.slice(fromIndex, fromIndex + ChildSize) == EmptyChild
  }

  /// IsLeftMost returns true if this is the left-most path in the tree,
  /// excluding placeholder (empty child) nodes
  def isLeftMost(path) = {
    // Calls getPadding(0) => idx = 0, prefix = 0.
    // We specialize the constants to IavlSpec.
    path.indices().forall(i =>
      val step = path[i]
      or {
        // the path goes left
        hasPadding(step, MinPrefixLen, MaxPrefixLen, ChildSize),
        // the path goes right, but the left child is empty (a gap)
        leftBranchesAreEmpty(step)
      }
    )
  }

  /// rightBranchesAreEmpty returns true if the padding bytes correspond
  /// to all empty siblings on the right side of a branch,
  /// i.e. it's a valid placeholder on a rightmost path
  def rightBranchesAreEmpty(inner) = and {
    // the case of rightBranches == 0 returns false
    val order = orderFromPadding(inner)
    order._2 and order._1 != 1,
    // the remaining case is rightBranches == 1, see orderFromPadding
    length(inner.suffix) == ChildSize,
    // getPosition(0) returns 0, hence, from == 0
    inner.suffix == EmptyChild
  }

  /// IsRightMost returns true if this is the left-most path in the tree,
  /// excluding placeholder (empty child) nodes
  def isRightMost(path) = {
    // Specialize to IavlSpec
    // Calls getPadding(1) => minPrefix, maxPrefix,
    //   suffix = ChildSize + MinPrefixLen, ChildSize + MaxPrefixLen, 0
    path.indices().forall(i =>
      val step = path[i]
      or {
        // the path goes right
        hasPadding(step, ChildSize + MinPrefixLen, ChildSize + MaxPrefixLen, 0),
        // the path goes left, but the right child is empty (a gap)
        rightBranchesAreEmpty(step)
      }
    )
  }

  /// isLeftStep assumes left and right have common parents
  /// checks if left is exactly one slot to the left of right
  def isLeftStep(left, right) = {
    // 'left' turns left, and 'right' turns right
    val lorder = orderFromPadding(left)
    val rorder = orderFromPadding(right)
    and {
      lorder._2,
      rorder._2,
      rorder._1 == lorder._1 + 1
    }
  }

  /// IsLeftNeighbor returns true if `right` is the next possible path
  /// right of `left`
  ///
  /// Find the common suffix from the Left.Path and Right.Path and remove it.
  /// We have LPath and RPath now, which must be neighbors.
  /// Validate that LPath[len-1] is the left neighbor of RPath[len-1].
  /// For step in LPath[0..len-1], validate step is right-most node.
  /// For step in RPath[0..len-1], validate step is left-most node.
  def isLeftNeighbor(lpath, rpath) = {
    // count common tail (from end, near root)
    // cut the left and right paths
    lpath.indices().exists(li =>
      rpath.indices().exists(ri => and {
        // they are equidistant from the root
        length(lpath) - li == length(rpath) - ri,
        // The distance to the root (the indices are 0-based).
        // dist == 0 holds for the root.
        val dist = length(lpath) - 1 - li
        // the prefixes and suffixes match just above the cut points
        1.to(dist).forall(k =>
          val lnode = lpath[li + k]
          val rnode = rpath[ri + k]
          and {
            lnode.prefix == rnode.prefix,
            lnode.suffix == rnode.suffix
          }
        ),
        // Now topleft and topright are the first divergent nodes
        // make sure they are left and right of each other.
        // Actually, lpath[li] and rpath[ri] are an abstraction
        // of the same tree node:
        //  the left one stores the hash of the right one, whereas
        //  the right one stores the hash of the left one.
        isLeftStep(lpath[li], rpath[ri]),
        // left and right are remaining children below the split,
        // ensure left child is the rightmost path, and visa versa
        isRightMost(lpath.slice(0, li)),
        isLeftMost(rpath.slice(0, ri)),
      })
    )
  }

  /// VerifyNonMembership returns true iff
  /// proof is (contains) a NonExistenceProof
  /// both left and right sub-proofs are valid existence proofs (see above) or nil
  /// left and right proofs are neighbors (or left/right most if one is nil)
  /// provided key is between the keys of the two proofs
  def verifyNonMembership(root, np, key):
        (CommitmentRoot_T, NonExistsProof_T, KEY_T) => bool = and {
    // getNonExistProofForKey
    isNil(np.left.key) or lessThan(np.left.key, key),
    isNil(np.right.key) or lessThan(key, np.right.key),
    // implicit assumption, missing in the code:
    // https://github.com/informalsystems/ics23-audit/issues/14
    np.key == key,
    // Verify
    not(isNil(np.left.key)) or not(isNil(np.right.key)),
    isNil(np.left.key) or and {
      verify(np.left, root, np.left.key, np.left.value),
      lessThan(np.left.key, key),
    },
    isNil(np.right.key) or and {
      verify(np.right, root, np.right.key, np.right.value),
      lessThan(key, np.right.key),
    },
    if (isNil(np.left.key)) {
      isLeftMost(np.right.path)
    } else if (isNil(np.right.key)) {
      isRightMost(np.left.path)
    } else {
      isLeftNeighbor(np.left.path, np.right.path)
    }
  }
}

// a few unit tests to improve our understanding of the specification
module ics23test {
  import ics23.*

  // test data
  val a = [5]
  val b = [6]
  val c = [7]
  val d = [8]
  val ab = [5, 6]
  val ba = [6, 5]
  val abc = [5, 6, 7]
  val abcd = [5, 6, 7, 8]

  val allStrings = Set([], a, ab, ba, abc, abcd, [1], [2], [3], [4])

  val test1 = {
    existsCalculate({
      key: [5],
      value: [5, 6],
      leaf: { prefix: [5, 6, 7] },
      path: [
        { prefix: [5, 6], suffix: [8] },
        { prefix: [5], suffix: [7] }
      ]
    }) == [32, 0, 4]
  }

  val test2 =
    isLeftMost([
      { prefix: [1], suffix: [3, 4, 5] },
      { prefix: [2], suffix: [3, 4, 5] },
      { prefix: [3], suffix: [3, 4, 5] }
    ])

  val test3 =
    isLeftMost([
      { prefix: [1, 0, 0, 0], suffix: [] },
      { prefix: [2], suffix: [3, 4, 5] },
      { prefix: [3], suffix: [3, 4, 5] }
    ])

  val test4 =
    isLeftMost([
      { prefix: [1], suffix: [3, 4, 5 ] },
      { prefix: [2, 0, 0, 0], suffix: [] },
      { prefix: [3], suffix: [3, 4, 5] }
    ])

  val test5 =
    isRightMost([
      { prefix: [1, 4, 5, 6], suffix: [] },
      { prefix: [2, 4, 5, 6], suffix: [] },
      { prefix: [3, 3, 4, 5], suffix: [] }
    ])

  val test6 =
    isRightMost([
      { prefix: [1, 4, 5, 6], suffix: [] },
      { prefix: [2], suffix: [0, 0, 0] },
      { prefix: [3, 3, 4, 5], suffix: [] }
    ])

  val test7 =
    isLeftStep(
      { prefix: [1], suffix: [4, 5, 6] },
      { prefix: [2, 7, 8, 9], suffix: [] }
    )

  val test8 =
    isLeftNeighbor(
      [
        { prefix: [1], suffix: [4, 5, 6] },
        { prefix: [2, 7, 8, 9], suffix: [] }
      ],
      [
        { prefix: [1, 4, 5, 6], suffix: [] },
        { prefix: [2, 7, 8, 9], suffix: [] }
      ]
    )

  val test9 =
    //    *
    //   / \
    // 2,3 4,5
    val lhash = existsCalculate({
      key:[2], value: [3], leaf: { prefix: [ 0 ] }, path: []
    })
    val rhash = existsCalculate({
      key:[4], value: [5], leaf: { prefix: [ 0 ] }, path: []
    })
    val left = {
      key: [ 2 ],
      value: [ 3 ],
      leaf: { prefix: [ 0 ] },
      path: [{ prefix: [0], suffix: rhash }]
    }
    val right = {
      key: [ 4 ],
      value: [ 5 ],
      leaf: { prefix: [ 0 ] },
      path: [{ prefix: [0].concat(lhash), suffix: [] }]
    }
    val root = [32, 0, 2]
    val nilProof = { key: [], value: [], leaf: { prefix: [] }, path: [] }
    and {
      val np1 = { key: [1], left: nilProof, right: left }
      verifyNonMembership(root, np1, [ 1 ]),
      val np2 = { key: [2], left: left, right: right }
      not(verifyNonMembership(root, np2, [ 2 ])),
      val np3 = { key: [3], left: left, right: right }
      verifyNonMembership(root, np3, [ 3 ]),
      val np4 = { key: [2], left: left, right: right }
      not(verifyNonMembership(root, np4, [ 4 ])),
      val np5 = { key: [5], left: right, right: nilProof }
      verifyNonMembership(root, np5, [ 5 ]),
    }

  val allTests = and {
    test1, test2, test3, test4, test5, test6, test7, test8, test9
  }
}

// Simple property-based tests for ics23. They happened to be not very useful,
// as random simulation alone cannot produce even simple examples of sound
// non-membership proofs. For more advanced property-based testing, see the
// module 'trees' below.
module ics23pbt {
  import basics.*
  import ics23.*

  // an non-membership proof
  var nonMemProof: NonExistsProof_T
  // a key to test
  var inputKey: WORD_T

  // We limit the letters to a very small set,
  // including '32' for hash headers.
  val Byte = 0.to(3).union(Set(32))

  def toWord(m) =
    m.keys().fold([], (l, i) => l.append(m.get(i)))

  action genKey =
    nondet i = Byte.oneOf()
    inputKey' = [i]

  action Init = all {
    genKey,
    // we start with leafs in the initial state
    nondet lk = Byte.oneOf()
    nondet lv = Byte.oneOf()
    nondet lp = Byte.oneOf()
    nondet rk = Byte.oneOf()
    nondet rv = Byte.oneOf()
    nondet rp = Byte.oneOf()
    nondet pk = Byte.oneOf()
    val lproof = {
      key: [ lk ], value: [ lv ],
      leaf: { prefix: [ lp ] }, path: []
    }
    val rproof = {
      key: [ rk ], value: [ rv ], leaf: { prefix: [ rp ] }, path: []
    }
    nonMemProof' = { key: [ pk ], left: lproof, right: rproof }
  }

  def extend(proof, dir, word) =
    val node =
      if (dir == "turnLeft") {
        prefix: word,
        suffix: []
      } else {
        prefix: word.slice(0, MaxPrefixLen),
        suffix: word.slice(MaxPrefixLen, MaxPrefixLen + ChildSize)
      }
    proof.with("path", proof.path.append(node))

  /// grow the proof on the left
  action growLeft =
    nondet dir = Set("turnLeft", "turnRight").oneOf()
    nondet m = 1.to(MaxPrefixLen + ChildSize).setOfMaps(Byte).oneOf()
    nonMemProof' =
      nonMemProof.with("left", nonMemProof.left.extend(dir, toWord(m)))

  /// grow the proof on the right
  action growRight =
    nondet dir = Set("turnLeft", "turnRight").oneOf()
    nondet m = 1.to(MaxPrefixLen + ChildSize).setOfMaps(Byte).oneOf()
    nonMemProof' =
      nonMemProof.with("right", nonMemProof.right.extend(dir, toWord(m)))

  action Next = all {
    genKey,
    any {
      growLeft,
      growRight
    },
  }

  /// by checking this invariant, we may produce an example of when
  /// verifyMembership succeeds
  val TestVerify = {
    val root = existsCalculate(nonMemProof.left)
    not(verifyMembership(root,
      nonMemProof.left, inputKey, nonMemProof.left.value))
  }

  /// by checking this invariant, we may produce an example of when
  /// verifyNonMembership succeeds
  val TestNonMem = or {
    lessThan(inputKey, nonMemProof.left.key),
    lessThan(nonMemProof.right.key, inputKey),
    val root = existsCalculate(nonMemProof.left)
    not(verifyNonMembership(root, nonMemProof, inputKey))
  }
}

// Advanced randomized simulation (a la PBT) by generating
// random sorted binary trees of small heights over a small set of keys.
//
// We specify arbitrary binary trees, whose keys (in the leafs) are sorted.
// We do not have to specify IAVL+ trees to produce test data for ICS23.
// Note that this module is needed only for testing of ICS23,
// not for the operation of ICS23.
module trees {
  import basics.*
  import ics23.*

  /// We represent a binary tree as a collection of maps,
  /// whose keys are simply integer values 1..n, with 1 being the root.
  /// Similar to pointer-based representations of trees (e.g., in C),
  /// this data structure requires additional invariants to make sure
  /// that it actually defines a binary tree.
  /// This is in contrast to the typical data structures in
  /// programming languages.
  type TREE_T = {
    // every leaf has a key and value assigned
    leafs: int -> { key: WORD_T, value: WORD_T },
    // intermediate nodes have left and/or right children
    left: int -> int,
    right: int -> int
  }

  /// the tree generated so far
  var tree: TREE_T
  /// the node nodeHashes
  var nodeHashes: int -> WORD_T
  /// the keys to use for non-membership proofs
  var leftKey: int
  var rightKey: int
  /// the key whose non-membership or membership we want to prove
  var inputKey: int

  /// limit values to a small set
  val Byte = 0.to(7).union(Set(32))

  /// the maximum tree height
  val height = 3

  /// Compute all parents from the binary representation of the index.
  /// To simplify random generation of the trees, we are using
  /// the binary encoding. For example, if a leaf has the index 4,
  /// that is, 100b, then it has the parents 3 = 10b and 1 = 1b.
  def parents(i) = 1.to(height).map(h => i / (2^h)).exclude(Set(0))

  /// is a given key a node (inner or leaf) of a tree
  def isNode(t, key) = or {
    key == 1,
    t.leafs.keys().contains(key),
    t.left.keys().contains(key),
    t.right.keys().contains(key),
  }

  /// Compute nodeHashes of all nodes into a map.
  def computeHashes(t) = {
    // compute the hash of a single node, assuming that the children's
    // nodeHashes have been computed
    def putNodeHash(hashMap, key): (int -> List[int], int) => (int -> List[int]) = {
      val h =
        if (t.leafs.keys().contains(key)) {
          // a leaf
          val leaf = t.leafs.get(key)
          // Hash the leaf as in ics23.existsCalculate.
          // In our trees, prefixes are always 0.
          hash([0].append(length(leaf.key))
          .concat(hash(leaf.key))
          .append(length(leaf.value))
          .concat(hash(leaf.value)))
        } else {
          // an inner node, assuming that the children nodeHashes were computed
          def hashOrEmpty(childMap) =
            if (childMap.keys().contains(key)) {
              hashMap.get(childMap.get(key))
            } else {
              EmptyChild
            }
          // hash the prefix ([0]) and the hash of the children
          hash([0].concat(hashOrEmpty(t.left)).concat(hashOrEmpty(t.right)))
        }
      // store the hash
      hashMap.put(key, h)
    }
    // go over the nodes from max to min
    val maxNode = 2^height
    0.range(2^height)
      .foldl(Map(),
        (m, key) =>
          if (isNode(t, maxNode - key)) putNodeHash(m, maxNode - key) else m
    )
  }

  /// It's very easy to produce binary trees by picking an arbitrary graph and
  /// restricting it with the predicate isTree. However, this approach produces
  /// very sparse sets of states, to be explored by random search. Hence, we
  /// use a more algorithmic approach that represents trees with binary words.
  action Init = {
    // produce an arbitrary tree with leafs in e.g. [2, 8)
    nondet idx = 2.to(2^height - 1).powerset().oneOf()
    // remove those numbers that should serve as intermediate nodes
    val leafKeys = idx.filter(i => idx.forall(j => not(i.in(parents(j)))))
    // compute all parents
    val allParents = leafKeys.map(i => parents(i)).flatten()
    // all intermediate nodes that have a left successor
    val leftKeys = allParents.filter(i =>
      allParents.union(leafKeys).exists(j => 2 * i == j))
    // all intermediate nodes that have a right successor
    val rightKeys = allParents.filter(i =>
      allParents.union(leafKeys).exists(j => 2 * i + 1 == j))
    // left mapping
    val left = leftKeys.mapBy(i => 2 * i)
    // right mapping
    val right = rightKeys.mapBy(i => 2 * i + 1)
    all {
      // assign values to the keys
      nondet vs = leafKeys.setOfMaps(Byte).oneOf()
      val leafs = vs.keys().mapBy(k => { key: [k], value: [vs.get(k)] })
      // the resulting tree
      val t = { leafs: leafs, left: left, right: right }
      all {
        tree' = t,
        nodeHashes' = computeHashes(t),
      },
      // pick arbitrary left and right keys for non-membership proofs
      nondet i = leafKeys.oneOf()
      leftKey' = i,
      nondet i = leafKeys.oneOf()
      rightKey' = i,
      // pick an arbitrary input key
      nondet i = Byte.oneOf()
      inputKey' = i
    }
  }

  /// convert a tree leaf to an exists proof
  def leafToExistsProof(key) =
    val value = tree.leafs.get(key).value
    // encode all intermediate nodes upwards
    val path = range(1, height + 1)
      .foldl([],
      (p, h) =>
        if (key < 2^h) {
          p
        } else {
          val parent = key / (2^h)
          def hashOrChild(childMap) =
            if (childMap.keys().contains(parent)) {
              nodeHashes.get(childMap.get(parent))
            } else {
              EmptyChild
            }
          // depending on whether the node is going to left or right,
          // push the hashes in the prefix and the suffix
          if (key == 2 * parent) {
            val right = hashOrChild(tree.right)
            p.append({ prefix: [0], suffix: right })
          } else {
            val left = hashOrChild(tree.left)
            p.append({ prefix: [0].concat(left), suffix: [] })
          }
        }
    )
    // return the exists proof, where the key is the index itself
    {
      key: [key],
      value: tree.leafs.get(key).value,
      leaf: { prefix: [0] },
      path: path,
    }

  /// The transition does nothing. The state was computed in Init.
  action Next = all {
    // nothing changes
    tree' = tree,
    nodeHashes' = nodeHashes,
    leftKey' = leftKey,
    rightKey' = rightKey,
    inputKey' = inputKey,
  }

  /// make sure that the proofs are the same for all the leafs
  val TreeProofInv =
    and {
      leftKey.in(tree.leafs.keys()),
      rightKey.in(tree.leafs.keys())
    } implies {
      val lroot = existsCalculate(leafToExistsProof(leftKey))
      val rroot = existsCalculate(leafToExistsProof(rightKey))
      lroot == rroot
    }

  /// The invariant of membership verification:
  /// If the input key belongs to the leafs,
  /// we should be able to prove its membership.
  val MemInv = or {
    not(inputKey.in(tree.leafs.keys())),
    val proof = leafToExistsProof(inputKey)
    val root = existsCalculate(proof)
    verifyMembership(root, proof, [inputKey], proof.value)
  }

  /// check this property to produce an example of where MemInv is violated
  val MemExample =
    not(MemInv)

  // A few lemmas for NonMemInv:
  // MemberShouldFalsify, NonMemberInTheMiddle, NonMemberLeft, NonMemberRight

  def MemberShouldFalsify(lproof, rproof) = and {
    // if the input key belongs to the leafs,
    // we should not be able to disprove its membership
    inputKey.in(tree.leafs.keys()),
    val nproof = { key: [inputKey], left: lproof, right: rproof }
    val root = existsCalculate(lproof)
    not(verifyNonMembership(root, nproof, [inputKey]))
  }

  def NonMemberInTheMiddle(lproof, rproof) = and {
    // we should be able to prove its non-membership,
    // unless the choice of the keys is bad
    not(inputKey.in(tree.leafs.keys())),
    val nproof = { key: [inputKey], left: lproof, right: rproof }
    val root = existsCalculate(lproof)
    val noKeyInTheMiddle = and {
      // there is no leaf between leftKey and rightKey
      tree.leafs.keys().forall(k => k <= leftKey or k >= rightKey),
      // the keys are not misplaced
      leftKey < inputKey,
      inputKey < rightKey,
    }
    noKeyInTheMiddle iff verifyNonMembership(root, nproof, [inputKey])
  }

  def NonMemberLeft(lproof, rproof) = and {
    // the input key is to the left
    isNil(lproof.key),
    // non-membership is true when the right key is left-most
    and {
      tree.leafs.keys().forall(k => rightKey <= k),
      inputKey < rightKey,
    } iff and {
      // or there is a proof
      val root = existsCalculate(rproof)
      val nproof = { key: [inputKey], left: lproof, right: rproof }
      verifyNonMembership(root, nproof, [inputKey])
    }
  }

  def NonMemberRight(lproof, rproof) = and {
    // the input key is to the right
    isNil(rproof.key),
    // non-membership is true when the left key is the right-most
    and {
      tree.leafs.keys().forall(k => (k <= leftKey)),
      inputKey > leftKey,
    } iff and {
      // or there is a proof
      val root = existsCalculate(lproof)
      val nproof = { key: [inputKey], left: lproof, right: rproof }
      verifyNonMembership(root, nproof, [inputKey])
    }
  }

  // The invariant of non-membership verification.
  // Consider all possible positions of the input key and the left/right keys.
  val NonMemInv =
    def proofOrNil(key) = {
      if (tree.leafs.keys().contains(key))
        leafToExistsProof(key)
      else
        { key: [], value: [], leaf: { prefix: [] }, path: [] }
    }
    val lproof = proofOrNil(leftKey)
    val rproof = proofOrNil(rightKey)
    or {
      MemberShouldFalsify(lproof, rproof),
      NonMemberInTheMiddle(lproof, rproof),
      NonMemberLeft(lproof, rproof),
      NonMemberRight(lproof, rproof),
      // trivial cases:
      inputKey < rightKey and not(isNil(lproof.key)),
      inputKey > leftKey and not(isNil(rproof.key)),
    }

  /// check this property to produce an example of where NonMemInv is violated
  val NonMemExample =
    not(NonMemInv)

  /// Predicate isTree(t) is true iff t defines an ordered binary tree starting
  /// with 1. It's probably hard to read. However, it is what one has to specify
  /// to express that an arbitrary graph is an ordered tree.
  def isTree(t: TREE_T): bool = and {
    t.leafs.keys().intersect(t.left.keys()) == Set(),
    t.leafs.keys().intersect(t.right.keys()) == Set(),
    1.in(t.leafs.keys().union(t.left.keys().union(t.right.keys()))),
    // we impose an order on the keys, to break cycles and DAGs
    t.left.keys().forall(k => t.left.get(k) > k),
    t.right.keys().forall(k => t.right.get(k) > k),
    t.left.keys().intersect(t.right.keys())
      .forall(k => t.left.get(k) < t.right.get(k)),
    // the leafs are ordered w.r.t. their keys
    val leafKeys = t.leafs.keys()
    tuples(leafKeys, leafKeys).forall(kk =>
      kk._1 < kk._2 implies lessThan(t.leafs.get(kk._1).key, t.leafs.get(kk._2).key)
    ),
    // all nodes have a parent
    (t.leafs.keys().union(t.left.keys()).union(t.right.keys()))
      .forall(k => or {
      // the root
      k == 1,
      // there is a left parent
      t.left.keys().exists(p => t.left.get(p) == k),
      // there is a right parent
      t.right.keys().exists(p => t.right.get(p) == k),
    }),
  }
}
