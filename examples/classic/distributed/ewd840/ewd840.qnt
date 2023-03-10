// -*- mode: Bluespec; -*-
module EWD840 {

/***************************************************************************)
(* TLA+ specification of an algorithm for distributed termination          *)
(* detection on a ring, due to Dijkstra, published as EWD 840:             *)
(* Derivation of a termination detection algorithm for distributed         *)
(* computations (with W.H.J.Feijen and A.J.M. van Gasteren).               *)
(***************************************************************************/

const N: int
assume NAssumption = N.in((Nat.exclude(Set(0))))

type NODE = int

var active: NODE -> bool
var color: NODE -> str
var tpos: NODE
var tcolor: str

val Node = 0.to(N - 1)
val Color = Set("white", "black")

val TypeOK = and {
  active.in(setOfMaps(Node, Bool)),    // status of nodes (active or passive)
  color.in(setOfMaps(Node, Color)),    // color of nodes
  tpos.in(Node),                       // token position
  tcolor.in(Color)                     // token color
}

/***************************************************************************)
(* Initially the token is black. The other variables may take any          *)
(* "type-correct" values.                                                  *)
(***************************************************************************/
action Init = all {
  nondet a = setOfMaps(Node, Bool).oneOf()
  active' = a,
  nondet c = setOfMaps(Node, Color).oneOf()
  color'  = c,
  nondet n = Node.oneOf()
  tpos'   = n,
  tcolor' = "black"
}

/***************************************************************************)
(* Node 0 may initiate a probe when it has the token and when either it is *)
(* black or the token is black. It passes a white token to node N-1 and    *)
(* paints itself white.                                                    *)
(***************************************************************************/
action InitiateProbe = all {
  tpos == 0,
  tcolor == "black" or color.get(0) == "black",
  tpos'   = N - 1,
  tcolor' = "white",
  color'  = color.set(0, "white"),
  active' = active,
}

/***************************************************************************)
(* A node i different from 0 that possesses the token may pass it to node  *)
(* i-1 under the following circumstances:                                  *)
(*   - node i is inactive or                                               *)
(*   - node i is colored black or                                          *)
(*   - the token is black.                                                 *)
(* Note that the last two conditions will result in an inconclusive round, *)
(* since the token will be black. The token will be stained if node i is   *)
(* black, otherwise its color is unchanged. Node i will be made white.     *)
(***************************************************************************/
action PassToken(i) = all {
  tpos == i,
  or {
    not(active.get(i)),
    color.get(i) == "black",
    tcolor == "black"
  },
  tpos'   = i - 1,
  tcolor' = if (color.get(i) == "black") "black" else tcolor,
  color'  = color.set(i, "white"),
  active' = active,
}

/***************************************************************************)
(* token passing actions controlled by the termination detection algorithm *)
(***************************************************************************/
action System = any {
  InitiateProbe,
  nondet i = Node.exclude(Set(0)).oneOf()
  PassToken(i),
}

/***************************************************************************)
(* An active node i may activate another node j by sending it a message.   *)
(* If j>i (hence activation goes against the direction of the token being  *)
(* passed), then node i becomes black.                                     *)
(***************************************************************************/
action SendMsg(i) = all {
  active.get(i),
  nondet j = Node.exclude(Set(i)).oneOf()
  all {
    active' = active.set(j, true),
    color'  = color.setBy(i, (old => if (j > i) "black" else old)),
    tpos'   = tpos,
    tcolor'    = tcolor,
  }
}

/***************************************************************************)
(* Any active node may become inactive at any moment.                      *)
(***************************************************************************/
action Deactivate(i) = all {
  active.get(i),
  active' = active.set(i, false),
  color'  = color,
  tpos'   = tpos,
  tcolor'    = tcolor,
}

/***************************************************************************)
(* actions performed by the underlying algorithm                           *)
(***************************************************************************/
action Environment =
  val i = oneOf(Node)
  any {
    SendMsg(i),
    Deactivate(i),
  }

/***************************************************************************)
(* next-state relation: disjunction of above actions                       *)
(***************************************************************************/
action Next = any {
  System,
  Environment,
}

val vars = (active, color, tpos, tcolor)

// temporal Spec = Init and always(Next.orKeep(vars) and System.weakFair(vars))

//-----------------------------------------------------------------------------

/***************************************************************************)
(* Non-properties, useful for validating the specification with TLC.       *)
(***************************************************************************/
val TokenAlwaysBlack = tcolor == "black"

temporal NeverChangeColor = always((color' = color).orKeep(vars))

/***************************************************************************)
(* Main safety property: if there is a white token at node 0 then every    *)
(* node is inactive.                                                       *)
(***************************************************************************/
val terminationDetected = and {
  tpos == 0 and tcolor == "white",
  color.get(0) == "white" and not(active.get(0))
}

val TerminationDetection =
  terminationDetected implies Node.forall(i => not(active.get(i)))

/***************************************************************************)
(* Liveness property: termination is eventually detected.                  *)
(***************************************************************************/
temporal Liveness =
  always(Node.forall(i => not(active.get(i))) implies eventually(terminationDetected))

/***************************************************************************)
(* The following property asserts that when every process always           *)
(* eventually terminates then eventually termination will be detected.     *)
(* It does not hold since processes can wake up each other.                *)
(***************************************************************************/
temporal FalseLiveness =
  always(Node.forall(i => always(eventually(not(active.get(i)))))
         implies eventually(terminationDetected))

/***************************************************************************)
(* The following property says that eventually all nodes will terminate    *)
(* assuming that from some point onwards no messages are sent. It is       *)
(* not supposed to hold: any node may indefinitely perform local           *)
(* computations. However, this property is verified if the fairness        *)
(* condition WF_vars(Next) is used instead of only WF_vars(System) that    *)
(* requires fairness of the actions controlled by termination detection.   *)
(***************************************************************************/
temporal SpecWFNext = Init and always(Next.orKeep(vars) and Next.weakFair(vars))

temporal AllNodesTerminateIfNoMessages = (
  eventually(always(
      Node.forall(i => not(SendMsg(i))).orKeep(vars)
  )) implies eventually(Node.forall(i => not(active.get(i))))
)

/***************************************************************************)
(* Dijkstra's inductive invariant                                          *)
(***************************************************************************/
val Inv = or {
  Node.forall(i => tpos < i implies not(active.get(i))),
  0.to(tpos).exists(j => color.get(j) == "black"),
  tcolor == "black"
}

/***************************************************************************)
(* Use the following specification to let TLC check that the predicate     *)
(* TypeOK /\ Inv is inductive for EWD 840: verify that it is an            *)
(* (ordinary) invariant of a specification obtained by replacing the       *)
(* initial condition by that conjunction.                                  *)
(***************************************************************************/
temporal CheckInductiveSpec = and {
  TypeOK,
  Inv,
  always(Next.orKeep(vars))
}

/***************************************************************************)
(* The algorithm implements the high-level specification of termination    *)
(* detection in a ring with synchronous communication between nodes.       *)
(* Note that the parameters of the module SyncTerminationDetection are     *)
(* instantiated by the symbols of the same name in the present module.     *)
(***************************************************************************/
// module TD = SyncTerminationDetection(*)

//THEOREM Spec => TD!Spec

}
