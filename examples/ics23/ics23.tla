--------------------------- MODULE ics23 --------------------------------------
\* A hand-written translation of ics23.qnt
EXTENDS Integers, Sequences, Apalache

\* basics
\*
\* @typeAlias: word = Seq(Int);
\* @typeAlias: key = $word;
\* @typeAlias: value = $word;
\* @typeAlias: commitmentRoot = $word;
\* @typeAlias: commitmentProof = $word;
\* @typeAlias: leaf = { prefix: $word };
\* @typeAlias: inner = { prefix: $word, suffix: $word };
\* @typeAlias: existsProof = {
\*   key: $word, value: $word, leaf: $leaf, path: Seq($inner)
\* };
\* @typeAlias: nonExistsProof = {
\*   key: $word, left: $existsProof, right: $existsProof
\* };
ics23_aliases == TRUE

\* we interpret the empty word as nil
IsNil(word) == Len(word) = 0

\* compare two integer words lexicographically
\* @type: ($word, $word) => Bool;
LessThan(w1, w2) ==
  LET len1 == Len(w1) IN
  LET len2 == Len(w2) IN
  \//\ len1 < len2
    /\ \A i \in DOMAIN w1:
       w1[i] = w2[i]
  \//\ len1 = len2
    /\ \E i \in DOMAIN w1:
       /\ w1[i] < w2[i]
       /\ \A j \in DOMAIN w1:
          (j < i) => w1[i] = w2[i]


\* Golang slice lst[start:end] slices in the interval [start, end).
\* Golang indices start with 0.
\* We define this operator for compatibility with the Golang code.
GoSlice(lst, start, end) == SubSeq(lst, start + 1, end)

\* base spec

\* TODO: introduce CONSTANTS instead
MinPrefixLen == 1
MaxPrefixLen == 2
ChildSize == 3

\* @type: $word;
EmptyChild == <<0, 0, 0>>

\* We need a hash that returns ChildSize - 1 elements.
\* For simulation, we are just summing up the word elements modulo 8.
\* For verification, we should use an injective function as a perfect hash.
\*
\* TODO: introduce Hash as a CONSTANT
\*
\* @type: $word => $word;
Hash(word) ==
  <<32, 0, ApaFoldSeqLeft(LAMBDA i, j: i + j, 0, word) % 8>>

\* calculate a hash from an exists proof
\* @type: $existsProof => $commitmentProof;
ExistsCalculate(p) ==
  \* this is how the leaf hash is computed
  LET leafHash ==
    Hash(Append(Append(p.leaf.prefix, Len(p.key)) \o Hash(p.key),
                Len(p.value)) \o Hash(p.value))
  IN
  \* the inner node hashes are concatenated and hashed upwards
  LET \* @type: ($word, $inner) => $word;
    AddHash(child, inner) ==
    Hash(inner.prefix \o child \o inner.suffix)
  IN
  ApaFoldSeqLeft(AddHash, leafHash, p.path)


\* verify that a proof matches a root
\* @type: ($existsProof, $word, $key, $value) => Bool;
Verify(proof, root, key, value) ==
  /\ key = proof.key
  /\ value = proof.value
  /\ root = ExistsCalculate(proof)

\* VerifyMembership returns true iff
\* proof is an ExistenceProof for the given key and value AND
\* calculating the root for the ExistenceProof matches
\* the provided CommitmentRoot
\* @type: ($word, $existsProof, $key, $value) => Bool;
VerifyMembership(root, proof, key, value) ==
  \* TODO: specify Decompress
  \* TODO: specify the case of CommitmentProof_Batch
  \* TODO: CheckAgainstSpec ensures that the proof can be verified
  \*       by the spec checker
  Verify(proof, root, key, value)


\* checks if an op has the expected padding
\* @type: ($inner, Int, Int, Int) => Bool;
HasPadding(inner, minPrefixLen, maxPrefixLen, suffixLen) ==
  /\ Len(inner.prefix) >= minPrefixLen
  /\ Len(inner.prefix) <= maxPrefixLen
  \* When inner turns left, suffixLen == ChildSize,
  \* that is, we store the hash of the right child in the suffix.
  \* When inner turns right, suffixLen == 0,
  \* that is, we store the hash of the left child in the prefix.
  /\ Len(inner.suffix) = suffixLen

\* This will look at the proof and determine which order it is...
\* So we can see if it is branch 0, 1, 2 etc... to determine neighbors
\* https:\*github.com/confio/ics23/blob/a4daeb4c24ce1be827829c0841446abc690c4f11/go/proof.go#L400-L411
\* @type: $inner => <<Int, Bool>>;
OrderFromPadding(inner) ==
  \* Specialize orderFromPadding to IavlSpec:
  \* ChildOrder = { 0, 1 }
  \* branch = 0: minp, maxp, suffix = MinPrefixLen, MaxPrefixLen, ChildSize
  \* branch = 1: minp, maxp, suffix =
  \*             ChildSize + MinPrefixLen, ChildSize + MaxPrefixLen, 0
  IF HasPadding(inner, MinPrefixLen, MaxPrefixLen, ChildSize)
    \* the node turns left
  THEN <<0, TRUE>>
  ELSE IF HasPadding(inner, ChildSize + MinPrefixLen,
                     ChildSize + MaxPrefixLen, 0)
    \* the node turns right
  THEN <<1, TRUE>>
  ELSE
    \* error
    <<0, FALSE>>

\* leftBranchesAreEmpty returns true if the padding bytes correspond to all
\* empty siblings on the left side of a branch, ie. it's a valid placeholder
\* on a leftmost path
\* @type: $inner => Bool;
LeftBranchesAreEmpty(inner) ==
  \* the case of leftBranches == 0 returns false
  LET order == OrderFromPadding(inner) IN
  /\ order[2] /\ order[1] /= 0
  \* the remaining case is leftBranches == 1, see orderFromPadding
  \* actualPrefix = len(inner.prefix) - 33
  /\ Len(inner.prefix) >= ChildSize
  \* getPosition(0) returns 0
  /\ LET from == Len(inner.prefix) - ChildSize IN
     GoSlice(inner.prefix, from, from + ChildSize) = EmptyChild

\* IsLeftMost returns true if this is the left-most path in the tree,
\* excluding placeholder (empty child) nodes
\* @type: Seq($inner) => Bool;
IsLeftMost(path) ==
  \* Calls getPadding(0) => idx = 0, prefix = 0.
  \* We specialize the constants to IavlSpec.
  \A i \in DOMAIN path:
    LET step == path[i] IN
    \* the path goes left
    \/ HasPadding(step, MinPrefixLen, MaxPrefixLen, ChildSize)
    \* the path goes right, but the left child is empty (a gap)
    \/ LeftBranchesAreEmpty(step)

\* rightBranchesAreEmpty returns true if the padding bytes correspond
\* to all empty siblings on the right side of a branch,
\* i.e. it's a valid placeholder on a rightmost path
\* @type: $inner => Bool;
RightBranchesAreEmpty(inner) ==
  \* the case of rightBranches == 0 returns false
  LET order == OrderFromPadding(inner) IN
  /\ order[2] /\ order[1] /= 1
  \* the remaining case is rightBranches == 1, see orderFromPadding
  /\ Len(inner.suffix) = ChildSize
  \* getPosition(0) returns 0, hence, from == 0
  /\ inner.suffix = EmptyChild

\* IsRightMost returns true if this is the left-most path in the tree,
\* excluding placeholder (empty child) nodes
\* @type: Seq($inner) => Bool;
IsRightMost(path) ==
  \* Specialize to IavlSpec
  \* Calls getPadding(1) => minPrefix, maxPrefix,
  \*   suffix = ChildSize + MinPrefixLen, ChildSize + MaxPrefixLen, 0
  \A i \in DOMAIN path:
    LET step == path[i] IN
    \* the path goes right
    \/ HasPadding(step, ChildSize + MinPrefixLen, ChildSize + MaxPrefixLen, 0)
    \* the path goes left, but the right child is empty (a gap)
    \/ RightBranchesAreEmpty(step)

\* isLeftStep assumes left and right have common parents
\* checks if left is exactly one slot to the left of right
\* @type: ($inner, $inner) => Bool;
IsLeftStep(left, right) ==
  \* 'left' turns left, and 'right' turns right
  LET lorder == OrderFromPadding(left) IN
  LET rorder == OrderFromPadding(right) IN
  /\ lorder[2]
  /\ rorder[2]
  /\ rorder[1] = lorder[1] + 1

\* IsLeftNeighbor returns true if `right` is the next possible path
\* right of `left`
\*
\* Find the common suffix from the Left.Path and Right.Path and remove it.
\* We have LPath and RPath now, which must be neighbors.
\* Validate that LPath[len-1] is the left neighbor of RPath[len-1].
\* For step in LPath[0..len-1], validate step is right-most node.
\* For step in RPath[0..len-1], validate step is left-most node.
IsLeftNeighbor(lpath, rpath) ==
  \* count common tail (from end, near root)
  \* cut the left and right paths
  \E li \in DOMAIN lpath, ri \in DOMAIN rpath:
    \* they are equidistant from the root
    /\ Len(lpath) - li = Len(rpath) - ri
    \* The distance to the root (the indices are 0-based).
    \* dist == 0 holds for the root.
    \* Note: we are compensating for 1-based indices here.
    /\ LET dist == Len(lpath) (*- 1*) - li IN
    \* The prefixes and suffixes match just above the cut points.
    \* Note that we are using a filter over the domain of lpath,
    \* as Apalache needs a bounded set, instead of 1..dist.
      \A k \in { j \in DOMAIN lpath: j <= dist }:
        LET lnode == lpath[li + k] IN
        LET rnode == rpath[ri + k] IN
        /\ lnode.prefix = rnode.prefix
        /\ lnode.suffix = rnode.suffix
    \* Now topleft and topright are the first divergent nodes
    \* make sure they are left and right of each other.
    \* Actually, lpath.nth(li) and rpath.nth(ri) are an abstraction
    \* of the same tree node:
    \*  the left one stores the hash of the right one, whereas
    \*  the right one stores the hash of the left one.
    /\ IsLeftStep(lpath[li], rpath[ri])
    \* Left and right are remaining children below the split,
    \* ensure left child is the rightmost path, and visa versa.
    \* Note that we are writing `li - 1` and `ri - 1`,
    \* as `li` and `ri` are 1-based.
    /\ IsRightMost(GoSlice(lpath, 0, li - 1))
    /\ IsLeftMost(GoSlice(rpath, 0, ri - 1))

\* VerifyNonMembership returns true iff
\* proof is (contains) a NonExistenceProof
\* both left and right sub-proofs are valid existence proofs (see above) or nil
\* left and right proofs are neighbors (or left/right most if one is nil)
\* provided key is between the keys of the two proofs
\* @type: ($word, $nonExistsProof, $word) => Bool;
VerifyNonMembership(root, np, key) ==
  \* getNonExistProofForKey
  /\ IsNil(np.left.key) \/ LessThan(np.left.key, key)
  /\ IsNil(np.right.key) \/ LessThan(key, np.right.key)
  \* implicit assumption, missing in the code:
  \* https://github.com/informalsystems/ics23-audit/issues/14
  /\ np.key = key
  \* Verify
  /\ ~IsNil(np.left.key) \/ ~IsNil(np.right.key)
  /\ \/ IsNil(np.left.key)
     \/ /\ Verify(np.left, root, np.left.key, np.left.value)
        /\ LessThan(np.left.key, key)
  /\ \/ IsNil(np.right.key)
     \/ /\ Verify(np.right, root, np.right.key, np.right.value)
        /\ LessThan(key, np.right.key)
  /\ IF IsNil(np.left.key)
     THEN IsLeftMost(np.right.path)
     ELSE IF IsNil(np.right.key)
       THEN IsRightMost(np.left.path)
       ELSE IsLeftNeighbor(np.left.path, np.right.path)
===============================================================================
