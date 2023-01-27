---------------------- MODULE ics23trees --------------------------------------
\* Proving invariants with model checking.
\* This is a hand-written translation of the module trees in ics23.qnt
\*
\* To check the basic invariants of ICS23, run Apalache as follows:
\*
\* apalache-mc check --inv=MemInv ics23trees.tla
\* apalache-mc check --inv=NonMemInv ics23trees.tla
EXTENDS Integers, Sequences, Apalache, ics23

(*
 @typeAlias: tree = {
   leafs: Int -> { key: $word, value: $word },
   left: Int -> Int,
   right: Int -> Int
 };
 *)
ics23trees_alises == TRUE

\* the maximum tree height
Height == 4

VARIABLE
  \* @type: $tree;
  tree,
  \* @type: Int -> $word;
  nodeHashes,
  \* @type: Int;
  leftKey,
  \* @type: Int;
  rightKey,
  \* @type: Int;
  inputKey

\* We limit the letters to a very small set,
\* including '32' for checksums.
Byte == 0..7 \union { 32 }

\* @type: (Int -> Int) => $word;
ToWord(m) ==
  LET Add(l, i) == Append(l, m[i]) IN
  ApaFoldSet(Add, <<>>, DOMAIN m)

Range(start, end) ==
  MkSeq(end - start, LAMBDA i: start + i)

\* @type: Seq({ prefix: $word, suffix: $word });
EmptyPath == <<>>

\* @type: $word;
EmptyWord == <<>>

\* @type: Int => $word;
Single(k) == <<k>>

\* Compute all parents from the binary representation of the index.
\* To simplify random generation of the trees, we are using
\* the binary encoding. For example, if a leaf has the index 4,
\* that is, 100b, then it has the parents 3 = 10b and 1 = 1b.
Parents(key) ==
  { key \div (2^h): h \in 1..Height } \ { 0 }

\* Is a given key a node (inner or leaf) of a tree.
\* @type: ($tree, Int) => Bool;
IsNode(t, key) ==
  \/ key = 1
  \/ key \in DOMAIN t.leafs
  \/ key \in DOMAIN t.left
  \/ key \in DOMAIN t.right

\* Compute nodeHashes of all nodes into a map.
\* @type: $tree => (Int -> $word);
ComputeHashes(t) ==
  \* compute the hash of a single node, assuming that the children's
  \* nodeHashes have been computed
  LET \* @type: (Int -> $word, Int) => (Int -> $word);
    PutNodeHash(hashMap, key) ==
    LET h ==
      IF key \in DOMAIN t.leafs
        \* a leaf
      THEN LET leaf == t.leafs[key] IN
        \* Hash the leaf as in ics23.existsCalculate.
        \* In our trees, prefixes are always 0.
        Hash(Append(Append(Single(0), Len(leaf.key)) \o Hash(leaf.key),
             Len(leaf.value))
             \o Hash(leaf.value))
      ELSE
        \* an inner node, assuming that the children nodeHashes were computed
        LET \* @type: (Int -> Int) => $word;
          HashOrEmpty(childMap) ==
          IF key \in DOMAIN childMap
          THEN hashMap[childMap[key]]
          ELSE EmptyChild
        IN
        \* hash the prefix ([0]) and the hash of the children
        Hash(Single(0) \o HashOrEmpty(t.left) \o HashOrEmpty(t.right))
    IN
    \* store the hash
    [ k \in (DOMAIN hashMap) \union { key} |->
      IF k = key THEN h ELSE hashMap[k] ]
  IN
  \* go over the nodes from 2^Height to 1
  LET seq == MkSeq(2^Height, LAMBDA h: 2^Height - h + 1) IN
  LET emptyMap == [ h \in {} |-> Single(0) ] IN
  LET Add(m, key) ==
    IF IsNode(t, key)
    THEN PutNodeHash(m, key)
    ELSE m
  IN
  ApaFoldSeqLeft(Add, emptyMap, seq)

\* It's very easy to produce binary trees by picking an arbitrary graph and
\* restricting it with the predicate isTree. However, this approach produces
\* very sparse sets of states, to be explored by random search. Hence, we
\* use a more algorithmic approach that represents trees with binary words.
Init ==
  \* produce an arbitrary tree with leafs in e.g. [2, 8)
  \E idx \in SUBSET (2..(2^Height - 1)):
    \* remove those numbers that should serve as intermediate nodes
    LET leafKeys == { i \in idx: \A j \in idx: i \notin Parents(j) } IN
    \* compute all parents
    LET allParents == UNION { Parents(i): i \in leafKeys } IN
    \* all intermediate nodes that have a left successor
    LET leftKeys == {
      i \in allParents:
        \E j \in allParents \union leafKeys:
          2 * i = j
    } IN
    \* all intermediate nodes that have a right successor
    LET rightKeys == {
      i \in allParents:
        \E j \in allParents \union leafKeys:
          2 * i + 1 = j
    } IN
    \* left mapping
    LET left == [ i \in leftKeys |-> 2 * i ] IN
    \* right mapping
    LET right == [ i \in rightKeys |-> 2 * i + 1 ] IN
    \* assign values to the keys
    /\ \E vs \in [ leafKeys -> Byte ]:
      LET leafs == [ k \in DOMAIN vs |->
        [ key |-> Single(k), value |-> Single(vs[k]) ] ] IN
      LET t == [ leafs |-> leafs, left |-> left, right |-> right ] IN
      /\ tree' = t
      /\ nodeHashes = ComputeHashes(t)
    \* pick arbitrary left and right keys for non-membership proofs
    /\ leftKey' \in leafKeys
    /\ rightKey' \in leafKeys
    \* pick an arbitrary input key
    /\ inputKey \in Byte

\* convert a tree leaf to an exists proof
LeafToExistsProof(key) ==
  LET value == tree.leafs[key].value IN
  \* encode all intermediate nodes upwards
  LET \* @type: (Seq($inner), Int) => Seq($inner);
    Add(path, h) ==
    IF key < 2^h
    THEN path
    ELSE
      LET parent == key \div (2^h) IN
      LET \* @type: (Int -> Int) => $word;
        HashOrChild(childMap) ==
        IF parent \in DOMAIN childMap
        THEN nodeHashes[childMap[parent]]
        ELSE EmptyChild
      IN
      \* depending on whether the node is going to left or right,
      \* push the hashes in the prefix and the suffix
      IF key = 2 * parent
      THEN LET right == HashOrChild(tree.right) IN
        Append(path, [ prefix |-> Single(0), suffix |-> right ])
      ELSE LET left == HashOrChild(tree.left) IN
        Append(path, [ prefix |-> Single(0) \o left, suffix |-> EmptyWord])
  IN
  LET path == ApaFoldSeqLeft(Add, EmptyPath, Range(1, Height + 1)) IN
  \* return the exists proof, where the key is the index itself
  [
    key |-> Single(key),
    value |-> tree.leafs[key].value,
    leaf |-> [ prefix |-> Single(0) ],
    path |-> path
  ]

\* The transition does nothing. The state was computed in Init.
Next ==
  UNCHANGED <<tree, nodeHashes, leftKey, rightKey, inputKey>>

\* make sure that the proofs are the same for all the leafs
TreeProofInv ==
  (leftKey \in DOMAIN tree.leafs /\ rightKey \in DOMAIN tree.leafs)
    =>
  LET lroot == ExistsCalculate(LeafToExistsProof(leftKey)) IN
  LET rroot == ExistsCalculate(LeafToExistsProof(rightKey)) IN
  lroot = rroot

\* The invariant of membership verification:
\* If the input key belongs to the leafs,
\* we should be able to prove its membership.
MemInv ==
  \/ inputKey \notin DOMAIN tree.leafs
  \/ LET proof == LeafToExistsProof(inputKey) IN
     LET root == ExistsCalculate(proof) IN
     VerifyMembership(root, proof, Single(inputKey), proof.value)

\* check this property to produce an example of where MemInv is violated
MemExample ==
  ~MemInv

\* A few lemmas for NonMemInv:
\* MemberShouldFalsify, NonMemberInTheMiddle, NonMemberLeft, NonMemberRight

MemberShouldFalsify(lproof, rproof) ==
  \* if the input key belongs to the leafs,
  \* we should not be able to disprove its membership
  /\ inputKey \in DOMAIN tree.leafs
  /\ LET nproof ==
      [ key |-> Single(inputKey), left |-> lproof, right |-> rproof ]
     IN
     LET root == ExistsCalculate(lproof) IN
     ~VerifyNonMembership(root, nproof, Single(inputKey))

NonMemberInTheMiddle(lproof, rproof) ==
  \* we should be able to prove its non-membership,
  \* unless the choice of the keys is bad
  /\ inputKey \notin DOMAIN tree.leafs
  /\ LET nproof ==
       [ key |-> Single(inputKey), left |-> lproof, right |-> rproof ]
     IN
     LET root == ExistsCalculate(lproof) IN
     LET noKeyInTheMiddle ==
       \* there is no leaf between leftKey and rightKey
       /\ \A k \in DOMAIN tree.leafs:
            k <= leftKey \/ k >= rightKey
       \* the keys are not misplaced
       /\ leftKey < inputKey
       /\ inputKey < rightKey
     IN
     noKeyInTheMiddle <=> VerifyNonMembership(root, nproof, Single(inputKey))

NonMemberLeft(lproof, rproof) ==
  \* the input key is to the left
  /\ IsNil(lproof.key)
  \* non-membership is true when the right key is left-most
  /\ (inputKey < rightKey /\ \A k \in DOMAIN tree.leafs: rightKey <= k)
       <=>
     \* or there is a proof
     LET root == ExistsCalculate(rproof) IN
     LET nproof ==
       [ key |-> Single(inputKey), left |-> lproof, right |-> rproof ] IN
     VerifyNonMembership(root, nproof, Single(inputKey))

NonMemberRight(lproof, rproof) ==
  \* the input key is to the right
  /\ IsNil(rproof.key)
  \* non-membership is true when the left key is the right-most
  /\ (inputKey > leftKey /\ \A k \in DOMAIN tree.leafs: k <= leftKey)
       <=>
     \* or there is a proof
     LET root == ExistsCalculate(lproof) IN
     LET nproof ==
       [ key |-> Single(inputKey), left |-> lproof, right |-> rproof ]
     IN
     VerifyNonMembership(root, nproof, Single(inputKey))

\* The invariant of non-membership verification.
\* Consider all possible positions of the input key and the left/right keys.
NonMemInv ==
  LET ProofOrNil(key) ==
    IF key \in DOMAIN tree.leafs
    THEN LeafToExistsProof(key)
    ELSE [ key |-> EmptyWord, value |-> EmptyWord,
           leaf |-> [ prefix |-> EmptyWord ], path |-> EmptyPath ]
  IN
  LET lproof == ProofOrNil(leftKey) IN
  LET rproof == ProofOrNil(rightKey) IN
  \/ MemberShouldFalsify(lproof, rproof)
  \/ NonMemberInTheMiddle(lproof, rproof)
  \/ NonMemberLeft(lproof, rproof)
  \/ NonMemberRight(lproof, rproof)
  \* trivial cases:
  \/ inputKey < rightKey /\ ~IsNil(lproof.key)
  \/ inputKey > leftKey /\ ~IsNil(rproof.key)

===============================================================================
