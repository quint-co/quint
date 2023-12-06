// -*- mode: Bluespec; -*-
module Voting {
/***************************************************************************)
(* This is a high-level algorithm in which a set of processes              *)
(* cooperatively choose a value.                                           *)
(***************************************************************************/
//-----------------------------------------------------------------------------
const Value: Set[int]       // The set of choosable values.
const Acceptor: Set[str]    // A set of processes that will choose a value.
const Quorum: Set[Set[str]] // The set of "quorums", where a quorum" is a
                            // "large enough" set of acceptors

/***************************************************************************)
(* Here are the assumptions we make about quorums.                         *)
(***************************************************************************/
assume QuorumAssumption = and {
    Quorum.forall(Q => Q.subseteq(Acceptor)),
    tuples(Quorum, Quorum).forall( ((Q1, Q2)) => (Q1.intersect(Q2)) != Set())
}

// theorems are not supported by Quint, use TLA+ syntax
//THEOREM QuorumNonEmpty == \A Q \in Quorum : Q # {}
//-----------------------------------------------------------------------------
/***************************************************************************)
(* Ballot is a set of "ballot numbers".  For simplicity, we let it be the  *)
(* set of natural numbers.  However, we write Ballot for that set to       *)
(* distinguish ballots from natural numbers used for other purposes.       *)
(***************************************************************************/
val Ballot = Nat
//---------------------------------------------------------------------------
/***************************************************************************)
(* In the algorithm, each acceptor can cast one or more votes, where each  *)
(* vote cast by an acceptor has the form <<b, v>> indicating that the      *)
(* acceptor has voted for value v in ballot b.  A value is chosen if a     *)
(* quorum of acceptors have voted for it in the same ballot.               *)
(***************************************************************************/

/***************************************************************************)
(* The algorithm's variables.                                              *)
(***************************************************************************/
var votes: str -> Set[(int, int)]
    // votes[a] is the set of votes cast by acceptor a
var maxBal: str -> int
    // maxBal[a] is a ballot number.  Acceptor a will cast
    // further votes only in ballots numbered \geq maxBal[a]

/***************************************************************************)
(* The type-correctness invariant.                                         *)
(***************************************************************************/
val TypeOK = and {
    votes.in(Acceptor.setOfMaps(powerset(tuples(Ballot, Value)))),
    maxBal.in(Acceptor.setOfMaps(Ballot.union(Set(-1))))
}

//-----------------------------------------------------------------------------
/***************************************************************************)
(* We now make a series of definitions an assert some simple theorems      *)
(* about those definitions that lead to the algorithm.                     *)
(***************************************************************************/
def VotedFor(a, b, v) = (b, v).in(votes.get(a))
  /*************************************************************************)
  (* True iff acceptor a has voted for v in ballot b.                      *)
  (*************************************************************************/

def ChosenAt(b, v) = Quorum.exists( Q =>
                        Q.forall( a => VotedFor(a, b, v) )
                      )
  /*************************************************************************)
  (* True iff a quorum of acceptors have all voted for v in ballot b.      *)
  (*************************************************************************/

val chosen = Value.filter( v => Ballot.exists( b => ChosenAt(b, v) ) )
  /*************************************************************************)
  (* The set of values that have been chosen.                              *)
  (*************************************************************************/

def DidNotVoteAt(a, b) = Value.forall( v => not(VotedFor(a, b, v)) )

def CannotVoteAt(a, b) = and {
  maxBal.get(a) > b,
  DidNotVoteAt(a, b)
}

  /*************************************************************************)
  (* Because acceptor a will not cast any more votes in a ballot numbered  *)
  (* < maxBal[a], this implies that a has not and will never cast a vote   *)
  (* in ballot b.                                                          *)
  (*************************************************************************/

def NoneOtherChoosableAt(b, v) =
  Quorum.exists( Q =>
     Q.forall( a => VotedFor(a, b, v) or CannotVoteAt(a, b) )
  )
  /*************************************************************************)
  (* If this is true, then ChosenAt(b, w) is not and can never become true *)
  (* for any w # v.                                                        *)
  (*************************************************************************/

def SafeAt(b, v) = 0.to(b - 1).forall( c => NoneOtherChoosableAt(c, v) )
  /*************************************************************************)
  (* If this is true, then no value other than v has been or can ever be   *)
  (* chosen in any ballot numbered less than b.                            *)
  (*************************************************************************/
//-----------------------------------------------------------------------------
//THEOREM AllSafeAtZero == \A v \in Value : SafeAt(0, v)
//-----------------------------------------------------------------------------
/*
THEOREM ChoosableThm ==
          \A b \in Ballot, v \in Value :
             ChosenAt(b, v) => NoneOtherChoosableAt(b, v)
 */
//-----------------------------------------------------------------------------
val VotesSafe =
    tuples(Acceptor, Ballot, Value).forall( ((a, b, v)) =>
                 VotedFor(a, b, v) implies SafeAt(b, v)
    )

val OneVote =
    tuples(Acceptor, Ballot, Value, Value).forall( ((a, b, v, w)) =>
              VotedFor(a, b, v) and VotedFor(a, b, w) implies (v == w)
    )

val OneValuePerBallot =
    tuples(Acceptor, Acceptor, Ballot, Value, Value)
       .forall( ((a1, a2, b, v1, v2)) =>
         VotedFor(a1, b, v1) and VotedFor(a2, b, v2) implies (v1 == v2)
       )
//-----------------------------------------------------------------------------
//THEOREM OneValuePerBallot => OneVote
//-----------------------------------------------------------------------------
/*
THEOREM VotesSafeImpliesConsistency ==
          /\ TypeOK
          /\ VotesSafe
          /\ OneVote
          => \/ chosen = {}
             \/ \E v \in Value : chosen = {v}
 */
//-----------------------------------------------------------------------------
def ShowsSafeAt(Q, b, v) = and {
  Q.forall(a => maxBal.get(a) >= b),
  (-1).to(b - 1).exists(c => and {
        (c != -1) implies Q.exists(a => VotedFor(a, c, v)),
        (c + 1).to(b - 1).forall(d => Q.forall(a => DidNotVoteAt(a, d)))
    }
  )
}

val ShowsSafety =
    all { TypeOK, VotesSafe, OneValuePerBallot } implies
    tuples(Quorum, Ballot, Value).forall( ((Q, b, v)) =>
        ShowsSafeAt(Q, b, v) implies SafeAt(b, v)
    )

//-----------------------------------------------------------------------------
/*
THEOREM ShowsSafety ==
          TypeOK /\ VotesSafe /\ OneValuePerBallot =>
             \A Q \in Quorum, b \in Ballot, v \in Value :
               ShowsSafeAt(Q, b, v) => SafeAt(b, v)
*/
//-----------------------------------------------------------------------------
/***************************************************************************)
(* We now write the specification.  The initial condition is               *)
(* straightforward.                                                        *)
(***************************************************************************/
action Init = all {
  votes'  = Acceptor.mapBy(_ => Set()),
  maxBal' = Acceptor.mapBy(_ => -1),
}


/***************************************************************************)
(* Next are the actions that make up the next-state action.                *)
(*                                                                         *)
(* An acceptor a is allowed to increase maxBal[a] to a ballot number b at  *)
(* any time.                                                               *)
(***************************************************************************/
action IncreaseMaxBal(a, b) = all {
  b > maxBal.get(a),
  maxBal' = maxBal.set(a, b),
  votes'  = votes,
}

/***************************************************************************)
(* Next is the action in which acceptor a votes for v in ballot b.  The    *)
(* first four conjuncts re enabling conditions.  The first maintains the   *)
(* requirement that the acceptor cannot cast a vote in a ballot less than  *)
(* maxBal[a].  The next two conjuncts maintain the invariance of           *)
(* OneValuePerBallot.  The fourth conjunct maintains the invariance of     *)
(* VotesSafe.                                                              *)
(***************************************************************************/
action VoteFor(a, b, v) = all {
    maxBal.get(a) <= b,
    votes.get(a).forall( vt => vt._1 != b ),
    Acceptor.exclude(Set(a)).forall( c =>
         votes.get(c).forall( vt => (vt._1 == b) implies (vt._2 == v) )
    ),
    Quorum.exists( Q => ShowsSafeAt(Q, b, v) ),
    votes'  = votes.setBy(a, old => old.union(Set((b, v))) ),
    maxBal' = maxBal.set(a, b),
}


/***************************************************************************)
(* The next-state action and the invariant.                                *)
(***************************************************************************/
action Next = {
    nondet a = oneOf(Acceptor)
    nondet b = oneOf(Ballot)
    any {
      IncreaseMaxBal(a, b),
      nondet v = oneOf(Value)
      VoteFor(a, b, v),
    }
}

val Inv = TypeOK and VotesSafe and OneValuePerBallot

//-----------------------------------------------------------------------------
//THEOREM Invariance == Spec => []Inv
//-----------------------------------------------------------------------------
/***************************************************************************)
(* The following statement instantiates module Consensus with the constant *)
(* Value of this module substituted for the constant Value of module       *)
(* Consensus, and the state function `chosen' defined in this module       *)
(* substituted for the variable `chosen' of module Value.  More precisely, *)
(* for each defined identifier id of module Value, this statement defines  *)
(* C!id to equal the value of id under these substitutions.                *)
(***************************************************************************/
// module C = Consensus(*)

/*
THEOREM Spec => C!Spec
<1>1. Inv /\ Init => C!Init
<1>2. Inv /\ [Next]_<<votes, maxBal>> => [C!Next]_chosen
<1>3. QED
  <2>1. []Inv /\ [][Next]_<<votes, maxBal>> => [][C!Next]_chosen
    BY <1>2 \* and temporal reasoning
  <2>2. []Inv /\ Spec => C!Spec
    BY <2>1, <1>1
  <2>3. QED
    BY <2>2, Invariance
 */

}
