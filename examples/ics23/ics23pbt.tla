------------------------- MODULE ics23pbt --------------------------------------
\* property-based tests for ICS23       
\* This is a hand-written translation of the module ics23pbt in ics23.tnt
EXTENDS Integers, Sequences, Apalache, ics23

VARIABLE
  \* @type: $nonExistsProof;
  nproof,
  \* @type: $word;
  inputKey

\* We limit the letters to a very small set,
\* including '32' for checksums.
Byte == 0..7 \union { 32 }

\* @type: (Int -> Int) => $word;
ToWord(m) ==
  LET Add(l, i) == Append(l, m[i]) IN
  ApaFoldSet(Add, <<>>, DOMAIN m)

GenKey ==
  \E i \in Byte:
    inputKey' = <<i>>

\* @type: Seq({ prefix: $word, suffix: $word });
EmptyPath == <<>>

\* @type: $word;
EmptyWord == <<>>

\* @type: Int => $word;
Single(k) == <<k>>

Init ==
  /\ \E i \in Byte:
      inputKey = Single(i)
  /\ \E lk, lv, lp, rk, rv, rp, pk \in Byte:
      LET \* @type: $existsProof;
        lproof == [
          key |-> Single(lk),
          value |-> Single(lv),
          leaf |-> [ prefix |-> Single(lp) ],
          path |-> EmptyPath
        ]
      IN
      LET \* @type: $existsProof;
        rproof == [
          key |-> Single(rk),
          value |-> Single(rv),
          leaf |-> [ prefix |-> Single(rp) ],
          path |-> EmptyPath
        ]
      IN
      nproof = [ key |-> Single(pk), left |-> lproof, right |-> rproof ]

\* @type: ($existsProof, Str, $word) => $existsProof;
Extend(proof, dir, word) ==
  LET node ==
    IF dir = "turnLeft"
    THEN [ prefix |-> word, suffix |-> EmptyWord ]
    ELSE [
      prefix |-> GoSlice(word, 0, MaxPrefixLen),
      suffix |-> GoSlice(word, MaxPrefixLen, MaxPrefixLen + ChildSize)
    ]
  IN
  [ proof EXCEPT !.path = Append(@, node) ]

\* grow the proof on the left
GrowLeft ==
  \E dir \in { "turnLeft", "turnRight" }:
    \E m \in [ 1..(MaxPrefixLen + ChildSize) -> Byte ]:
      nproof' = [ nproof EXCEPT !.left = Extend(@, dir, ToWord(m)) ]

\* grow the proof on the right
GrowRight ==
  \E dir \in { "turnLeft", "turnRight" }:
    \E m \in [ 1..(MaxPrefixLen + ChildSize) -> Byte ]:
      nproof' = [ nproof EXCEPT !.right = Extend(@, dir, ToWord(m)) ]

Next ==
  /\ GenKey
  /\ \/ GrowLeft
     \/ GrowRight

\* By checking this invariant, we may produce an example of when
\* verifyNonMembership succeeds
NonMem ==
  \/ LessThan(inputKey, nproof.left.key)
  \/ LessThan(nproof.right.key, inputKey)
  \/ ~VerifyNonMembership(ExistsCalculate(nproof.left), nproof, inputKey)

\* The version of NonMem, where the left path has at least three nodes
NonMem3 ==
  \/ LessThan(inputKey, nproof.left.key)
  \/ LessThan(nproof.right.key, inputKey)
  \/ ~VerifyNonMembership(ExistsCalculate(nproof.left), nproof, inputKey)
  \/ Len(nproof.left.path) <= 3

View ==
  ExistsCalculate(nproof.left)

===============================================================================
