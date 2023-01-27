--------------------------- MODULE LamportMutexTyped ------------------------
\* This is a typed version of LamportMutex, which can be found at:
\* https://github.com/tlaplus/Examples/blob/master/specifications/lamport_mutex/LamportMutex.tla

(***************************************************************************)
(* TLA+ specification of Lamport's distributed mutual-exclusion algorithm  *)
(* that appeared as an example in                                          *)
(* L. Lamport:  Time, Clocks and the Ordering of Events in a Distributed   *)
(* System. CACM 21(7):558-565, 1978.                                       *)
(***************************************************************************)
EXTENDS Naturals, Sequences

(***************************************************************************)
(* The parameter N represents the number of processes.                     *)
(* The parameter maxClock is used only for model checking in order to      *)
(* keep the state space finite.                                            *)
(***************************************************************************)
\* ANCHOR: constants
CONSTANT
    \* @type: Int;
    N,
    \* @type: Int;
    maxClock
\* ANCHOR_END: constants

\* ANCHOR: assumes
ASSUME NType == N \in Nat
ASSUME maxClockType == maxClock \in Nat
\* ANCHOR_END: assumes

\* ANCHOR: ProcAndClock
Proc == 1 .. N
Clock == Nat \ {0}
\* ANCHOR_END: ProcAndClock
(***************************************************************************)
(* For model checking, add ClockConstraint as a state constraint to ensure *)
(* a finite state space and override the definition of Clock by            *)
(* 1 .. maxClock+1 so that TLC can evaluate the definition of Message.     *)
(***************************************************************************)

\* ANCHOR: vars1
VARIABLES
  \* @type: Int -> Int;
  clock,    \* local clock of each process
  \* @type: Int -> (Int -> Int);
  req,      \* requests received from processes (clock transmitted with request)
  \* @type: Int -> Set(Int);
  ack,      \* acknowledgements received from processes
  \* @type: Set(Int);
  crit,     \* set of processes in critical section
\* ANCHOR_END: vars1
\* ANCHOR: vars2
  \* @typeAlias: message = {
  \*     type: Str,
  \*     clock: Int
  \* };
  \* @type: Int -> (Int -> Seq($message));
  network   \* messages sent but not yet received
\* ANCHOR_END: vars2

(***************************************************************************)
(* Messages used in the algorithm.                                         *)
(***************************************************************************)
\* ANCHOR: Message
ReqMessage(c) == [type |-> "req", clock |-> c]
AckMessage == [type |-> "ack", clock |-> 0]
RelMessage == [type |-> "rel", clock |-> 0]

Message == {AckMessage, RelMessage} \union {ReqMessage(c) : c \in Clock}
\* ANCHOR_END: Message

(***************************************************************************)
(* The type correctness predicate.                                         *)
(***************************************************************************)  
\* ANCHOR: TypeOK
TypeOK ==
     (* clock[p] is the local clock of process p *)
  /\ clock \in [Proc -> Clock]
     (* req[p][q] stores the clock associated with request from q received by p, 0 if none *)
  /\ req \in [Proc -> [Proc -> Nat]]
     (* ack[p] stores the processes that have ack'ed p's request *)
  /\ ack \in [Proc -> SUBSET Proc]
     (* network[p][q]: queue of messages from p to q -- pairwise FIFO communication *)
  /\ network \in [Proc -> [Proc -> Seq(Message)]]
     (* set of processes in critical section: should be empty or singleton *)
  /\ crit \in SUBSET Proc
\* ANCHOR_END: TypeOK


(***************************************************************************)
(* The initial state predicate.                                            *)
(***************************************************************************) 
Init ==
  /\ clock = [p \in Proc |-> 1]
  /\ req = [p \in Proc |-> [q \in Proc |-> 0]]
  /\ ack = [p \in Proc |-> {}]
  /\ network = [p \in Proc |-> [q \in Proc |-> <<>> ]]
  /\ crit = {}

(***************************************************************************)
(* beats(p,q) is true if process p believes that its request has higher    *)
(* priority than q's request. This is true if either p has not received a  *)
(* request from q or p's request has a smaller clock value than q's.       *)
(* If there is a tie, the numerical process ID decides.                    *)
(***************************************************************************)
beats(p,q) ==
  \/ req[p][q] = 0
  \/ req[p][p] < req[p][q]
  \/ req[p][p] = req[p][q] /\ p < q
  
(***************************************************************************)
(* Broadcast a message: send it to all processes except the sender.        *)
(***************************************************************************)
Broadcast(s, m) ==
  [r \in Proc |-> IF s=r THEN network[s][r] ELSE Append(network[s][r], m)]

(***************************************************************************)
(* Process p requests access to critical section.                          *)
(***************************************************************************)
Request(p) ==
  /\ req[p][p] = 0
  /\ req'= [req EXCEPT ![p][p] = clock[p]]
  /\ network' = [network EXCEPT ![p] = Broadcast(p, ReqMessage(clock[p]))]
  /\ ack' = [ack EXCEPT ![p] = {p}]
  /\ UNCHANGED <<clock, crit>>

(***************************************************************************)
(* Process p receives a request from q and acknowledges it.                *)
(***************************************************************************)
ReceiveRequest(p,q) ==
  /\ network[q][p] # << >>
  /\ LET m == Head(network[q][p])
         c == m.clock
     IN  /\ m.type = "req"
         /\ req' = [req EXCEPT ![p][q] = c]
         /\ clock' = [clock EXCEPT ![p] = IF c > clock[p] THEN c + 1 ELSE @ + 1]
         /\ network' = [network EXCEPT ![q][p] = Tail(@),
                                       ![p][q] = Append(@, AckMessage)]
         /\ UNCHANGED <<ack, crit>>

(***************************************************************************)
(* Process p receives an acknowledgement from q.                           *)
(***************************************************************************)      
ReceiveAck(p,q) ==
  /\ network[q][p] # << >>
  /\ LET m == Head(network[q][p])
     IN  /\ m.type = "ack"
         /\ ack' = [ack EXCEPT ![p] = @ \union {q}]
         /\ network' = [network EXCEPT ![q][p] = Tail(@)]
         /\ UNCHANGED <<clock, req, crit>>

(**************************************************************************)
(* Process p enters the critical section.                                 *)
(**************************************************************************)
Enter(p) == 
  /\ ack[p] = Proc
  /\ \A q \in Proc \ {p} : beats(p,q)
  /\ crit' = crit \union {p}
  /\ UNCHANGED <<clock, req, ack, network>>
  
(***************************************************************************)
(* Process p exits the critical section and notifies other processes.      *)
(***************************************************************************)
Exit(p) ==
  /\ p \in crit
  /\ crit' = crit \ {p}
  /\ network' = [network EXCEPT ![p] = Broadcast(p, RelMessage)]
  /\ req' = [req EXCEPT ![p][p] = 0]
  /\ ack' = [ack EXCEPT ![p] = {}]
  /\ UNCHANGED clock
 
(***************************************************************************)
(* Process p receives a release notification from q.                       *)
(***************************************************************************)
ReceiveRelease(p,q) ==
  /\ network[q][p] # << >>
  /\ LET m == Head(network[q][p])
     IN  /\ m.type = "rel"
         /\ req' = [req EXCEPT ![p][q] = 0]
         /\ network' = [network EXCEPT ![q][p] = Tail(@)]
         /\ UNCHANGED <<clock, ack, crit>>

(***************************************************************************)
(* Next-state relation.                                                    *)
(***************************************************************************)

Next ==
  \/ \E p \in Proc : Request(p) \/ Enter(p) \/ Exit(p)
  \/ \E p \in Proc : \E q \in Proc \ {p} : 
        ReceiveRequest(p,q) \/ ReceiveAck(p,q) \/ ReceiveRelease(p,q)

vars == <<req, network, clock, ack, crit>>

Spec == Init /\ [][Next]_vars

-----------------------------------------------------------------------------
(***************************************************************************)
(* A state constraint that is useful for validating the specification      *)
(* using finite-state model checking.                                      *)
(***************************************************************************)
ClockConstraint == \A p \in Proc : clock[p] <= maxClock

(***************************************************************************)
(* No channel ever contains more than three messages. In fact, no channel  *)
(* ever contains more than one message of the same type, as proved below.  *)
(***************************************************************************)
BoundedNetwork == \A p,q \in Proc : Len(network[p][q]) <= 3

(***************************************************************************)
(* The main safety property of mutual exclusion.                           *)
(***************************************************************************)
Mutex == \A p,q \in crit : p = q

==============================================================================