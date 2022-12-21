module TendermintAcc_004 {
/*
 A Quint specification of a simplified Tendermint consensus, tuned for
 fork accountability. The simplifications are as follows:

 - the protocol runs for one height, that is, it is one-shot consensus

 - this specification focuses on safety, so timeouts are modelled
   with non-determinism

 - the proposer function is non-determinstic, no fairness is assumed

 - the messages by the faulty processes are injected right in the initial states

 - every process has the voting power of 1

 - hashes are modelled as identity

 Having the above assumptions in mind, the specification follows the pseudo-code
 of the Tendermint paper: https://arxiv.org/abs/1807.04938

 Byzantine processes can demonstrate arbitrary behavior, including
 no communication. We show that if agreement is violated, then the Byzantine
 processes demonstrate one of the two behaviours:

   - Equivocation: a Byzantine process may send two different values
     in the same round.

   - Amnesia: a Byzantine process may lock a value without unlocking
     the previous value that it has locked in the past.

 * Version 4. Remove defective processes, fix bugs, collect global evidence.
 * Version 3. Modular and parameterized definitions.
 * Version 2. Bugfixes in the spec and an inductive invariant.
 * Version 1. A preliminary specification.

 Zarko Milosevic, Igor Konnov, Informal Systems, 2019-2020.
 */

//********************* PROTOCOL PARAMETERS **********************************

// a process name is just a string in our specification
type proc_t = str
// a value is also a string
type value_t = str
// a state is also a string
type state_t = str
// a round is an integer
type round_t = int

// the set of correct processes
const Corr: Set[proc_t]

// the set of Byzantine processes, may be empty
const Faulty: Set[proc_t]

// the total number of processes: correct, defective, and Byzantine
const N: int

// an upper bound on the number of Byzantine processes
const T: int

// the set of valid values, proposed both by correct and faulty
const ValidValues: Set[value_t]

// the set of invalid values, never proposed by the correct ones
const InvalidValues: Set[value_t]

// the maximal round number
const MaxRound: round_t

// the proposer function from 0..NRounds to 1..N
const Proposer: round_t -> int

assume Corr_and_faulty_make_N =
    N == size(Corr.union(Faulty))

//*************************** DEFINITIONS ***********************************
// the set of all processes
val AllProcs = Corr.union(Faulty)
// the set of potential rounds
val Rounds = 0.to(MaxRound)
// a special value to denote a nil round, outside of Rounds
val NilRound = -1
val RoundsOrNil = Set(NilRound).union(Rounds)
// the set of all values
val Values = ValidValues.union(InvalidValues)
// a special value for a nil round, outside of Values
val NilValue = "None"
val ValuesOrNil = Set(NilValue).union(Values)

// a value hash is modeled as identity
def Id(v) = v

// The validity predicate
pure def IsValid(v) = ValidValues.contains(v)

// the two thresholds that are used in the algorithm
val THRESHOLD1 = T + 1      // at least one process is not faulty
val THRESHOLD2 = 2 * T + 1  // a quorum when having N > 3 * T

//********************* PROTOCOL STATE ******************************
// a process round number: Corr -> Rounds
var round: proc_t -> round_t
// a process step: Corr -> { "PROPOSE", "PREVOTE", "PRECOMMIT", "DECIDED" }
var step: proc_t -> state_t
// process decision: Corr -> ValuesOrNil
var decision: proc_t -> value_t
// a locked value: Corr -> ValuesOrNil
var lockedValue: proc_t -> value_t
// a locked round: Corr -> RoundsOrNil
var lockedRound: proc_t -> round_t
// a valid value: Corr -> ValuesOrNil
var validValue: proc_t -> value_t
// a valid round: Corr -> RoundsOrNil
var validRound: proc_t -> round_t

// book-keeping variables
type message_t =
    | { tag: "PROPOSE", src: proc_t,
        round: round_t, proposal: value_t, validRound: round_t }
    | { tag: "PREVOTE", src: proc_t, round: round_t, id: value_t }
    | { tag: "PRECOMMIT", src: proc_t, round: round_t, id: value_t }

// PROPOSE messages broadcast in the system
var msgsPropose: round_t -> message_t
// PREVOTE messages broadcast in the system
var msgsPrevote: round_t -> message_t
// PRECOMMIT messages broadcast in the system
var msgsPrecommit: round_t -> message_t
// the messages that were used by the correct processes to make transitions
var evidence: Set[message_t]

// we use this variable to see which action was taken
var fired_action: str

// a handy definition used in unchanged
val vars = (round, step, decision, lockedValue,
            lockedRound, validValue, validRound,
            evidence, msgsPropose, msgsPrevote, msgsPrecommit)

//********************* PROTOCOL INITIALIZATION ******************************
def FaultyProposals(r) =
    tuples(Faulty, Values, RoundsOrNil)
      .map((p, v, vr) =>
        { tag: "PROPOSE", src: p, round: r, proposal: v, validRound: vr })

val AllFaultyProposals =
    tuples(Faulty, Rounds, Values, RoundsOrNil)
      .map((p, r, v, vr) =>
        { tag: "PROPOSE", src: p, round: r, proposal: v, validRound: vr })

def FaultyPrevotes(r) =
    tuples(Faulty, Values)
      .map((p, v) =>
        { tag: "PREVOTE", src: p, round: r, id: v })

val AllFaultyPrevotes =
    tuples(Faulty, Rounds, Values)
      .map((p, r, v) =>
        { tag: "PREVOTE", src: p, round: r, id: v })

def FaultyPrecommits(r) =
    tuples(Faulty, Values)
      .map((p, v) =>
        { tag: "PRECOMMIT", src: p, round: r, id: v })

val AllFaultyPrecommits =
    tuples(Faulty, Rounds, Values)
      .map((p, r, v) =>
        { tag: "PRECOMMIT", src: p, round: r, id: v })


// the message function never contains a message for a wrong round
pure def BenignRoundsInMessages(msgfun) =
    Rounds.forall( r =>
      msgfun.get(r).forall( m =>
        r == m.round
      )
    )

// The initial states of the protocol. Some faults can be in the system already.
action Init = all {
  round          ' = Corr.mapBy( _ => 0 ),
  step           ' = Corr.mapBy( _ => Proposer ),
  decision       ' = Corr.mapBy( _ => NilValue ),
  lockedValue    ' = Corr.mapBy( _ => NilValue ),
  lockedRound    ' = Corr.mapBy( _ => NilRound ),
  validValue     ' = Corr.mapBy( _ => NilValue ),
  validRound     ' = Corr.mapBy( _ => NilRound ),
  nondet faultyProposals =
    setOfMaps(Rounds, AllFaultyProposals.powerset()).oneOf()
  all {
    BenignRoundsInMessages(faultyProposals),
    msgsPropose' = faultyProposals,
  },
  nondet faultyPrevotes =
    setOfMaps(Rounds, AllFaultyPrevotes.powerset()).oneOf()
  all {
    BenignRoundsInMessages(faultyPrevotes),
    msgsPrevote' = faultyPrevotes,
  },
  nondet faultyPrecommits =
    setOfMaps(Rounds, AllFaultyPrecommits.powerset()).oneOf()
  all {
    BenignRoundsInMessages(faultyPrecommits),
    msgsPrecommit' = faultyPrecommits,
  },
  evidence       ' = Set(),
  fired_action   ' = "Init",
}

//************************ MESSAGE PASSING *******************************
action BroadcastProposal(pSrc, pRound, pProposal, pValidRound) = {
  val newMsg = { tag: "PROPOSE", src: pSrc, round: pRound,
                 proposal: pProposal, validRound: pValidRound }
  msgsPropose' = msgsPropose.setBy(pRound, (old => old.union(Set(newMsg))))
}

action BroadcastPrevote(pSrc, pRound, pId) = {
  val newMsg = { tag: "PREVOTE", src: pSrc, round: pRound, id: pId }
  msgsPrevote' = msgsPrevote.setBy(pRound, (old => old.union(Set(newMsg))))
}

action BroadcastPrecommit(pSrc, pRound, pId) = {
  val newMsg = { tag: "PRECOMMIT", src: pSrc, round: pRound, id: pId }
  msgsPrecommit' = msgsPrecommit.setBy(pRound, (old => old.union(Set(newMsg))))
}

//********************* PROTOCOL TRANSITIONS ******************************
// lines 12-13
action StartRound(p, r) = all {
   step.get(p) != "decided", // a decided process does not participate in consensus
   round ' = round.set(p, r),
   step  ' = step.set(p, "propose"),
}

// lines 14-19, a proposal may be sent later
action InsertProposal(p) = {
  val r = round.get(p)
  all {
    p == Proposer.get(r),
    step.get(p) == "propose",
    // if the proposer is sending a proposal, then there are no other proposals
    // by the correct processes for the same round
    msgsPropose.get(r).forall(m => m.src != p),
    {
      nondet v = ValidValues.oneOf()
      val proposal = if (validValue.get(p) != NilValue) validValue.get(p) else v
      BroadcastProposal(p, round.get(p), proposal, validRound.get(p))
    },
    fired_action' = "InsertProposal",
  }
}

// lines 22-27
action UponProposalInPropose(p) =
  nondet v = Values.oneOf()
  val msg = { tag: "PROPOSE", src: Proposer.get(round.get(p)),
              round: round.get(p), proposal: v, validRound: NilRound }
  val mid = // line 23
       if (IsValid(v) and (lockedRound.get(p) == NilRound or lockedValue.get(p) == v))
       Id(v)
       else NilValue
  all {
    step.get(p) == "propose",                 // line 22
    msg.in(msgsPropose.get(round.get(p))),         // line 22
    evidence' = Set(msg).union(evidence),
    BroadcastPrevote(p, round.get(p), mid),   // lines 24-26
    step' = step.set(p, "prevote"),
    fired_action' = "UponProposalInPropose",
  }

// lines 28-33
action UponProposalInProposeAndPrevote(p) =
  nondet v = Values.oneOf()
  nondet vr = Rounds.oneOf()
  val msg = { tag: "PROPOSE", src: Proposer.get(round.get(p)),
              round: round.get(p), proposal: v, validRound: vr }
  val PV = msgsPrevote.get(vr).filter(m => m.id == Id(v))
  val mid = // line 29
    if (IsValid(v) and (lockedRound.get(p) <= vr or lockedValue.get(p) == v))
    Id(v)
    else NilValue
  all {
    step.get(p) == "propose",
    0 <= vr and vr < round.get(p), // line 28, the while part
    msg.in(msgsPropose.get(round.get(p))), // line 28
    size(PV) >= THRESHOLD2, // line 28
    evidence' = PV.union(Set(msg)).union(evidence),
    BroadcastPrevote(p, round.get(p), mid), // lines 24-26
    step' = step.set(p, "prevote"),
    fired_action' = "UponProposalInProposeAndPrevote",
  }

// lines 34-35 + lines 61-64 (onTimeoutPrevote)
action UponQuorumOfPrevotesAny(p) =
  nondet MyEvidence = powerset(msgsPrevote.get(round.get(p))).oneOf()
  // find the unique voters in the evidence
  val Voters = MyEvidence.map(m => m.src)

  // compare the number of the unique voters against the threshold
  all {
    step.get(p) == "prevote", // line 34 and 61
    size(Voters) >= THRESHOLD2, // line 34
    evidence' = MyEvidence.union(evidence),
    BroadcastPrecommit(p, round.get(p), NilValue),
    step' = step.set(p, "precommit"),
    fired_action' = "UponQuorumOfPrevotesAny",
  }

// lines 36-46
action UponProposalInPrevoteOrCommitAndPrevote(p) =
  nondet v = ValidValues.oneOf()
  nondet vr = RoundsOrNil.oneOf()
  val msg = { tag: "PROPOSE", src: Proposer.get(round.get(p)),
              round: round.get(p), proposal: v, validRound: vr }
  val PV = msgsPrevote.get(round.get(p)).filter(m => m.id == Id(v))
  all {
    step.get(p).in(Set("prevote", "precommit")), // line 36
    msg.in(msgsPropose.get(round.get(p))), // line 36
    size(PV) >= THRESHOLD2, // line 36
    evidence' = PV.union(Set(msg)).union(evidence),
    if (step.get(p) == "prevote") all {
      // lines 38-41:
      lockedValue' = lockedValue.set(p, v),
      lockedRound' = lockedRound.set(p, round.get(p)),
      BroadcastPrecommit(p, round.get(p), Id(v)),
      step' = step.set(p, "precommit"),
    } else all {
      lockedValue' = lockedValue,
      lockedRound' = lockedRound,
      msgsPrecommit' = msgsPrecommit,
      step' = step,
    },
      // lines 42-43
    validValue' = validValue.set(p, v),
    validRound' = validRound.set(p, round.get(p)),
    fired_action' = "UponProposalInPrevoteOrCommitAndPrevote",
  }

// lines 47-48 + 65-67 (onTimeoutPrecommit)
action UponQuorumOfPrecommitsAny(p) =
  nondet MyEvidence =
    powerset(msgsPrecommit.get(round.get(p))).oneOf()
  // find the unique committers in the evidence
  val Committers =  MyEvidence.map( m => m.src )
  // compare the number of the unique committers against the threshold
  all {
    size(Committers) >= THRESHOLD2,  // line 47
    evidence' = MyEvidence.union(evidence),
    (round.get(p) + 1).in(Rounds),
    StartRound(p, round.get(p) + 1),
    fired_action' = "UponQuorumOfPrecommitsAny",
  }

// lines 49-54
action UponProposalInPrecommitNoDecision(p) =
  // line 50
  nondet v = ValidValues.oneOf()
  nondet r = Rounds.oneOf()
  nondet vr = RoundsOrNil.oneOf()
  val msg = { tag: "PROPOSE", src: Proposer.get(r),
              round: r, proposal: v, validRound: vr }
  val PV = msgsPrecommit.get(r).filter(m => m.id == Id(v))
  all {
    decision.get(p) == NilValue,         // line 49
    msg.in(msgsPropose.get(r)),           // line 49
    size(PV) >= THRESHOLD2,   // line 49
    evidence' = PV.union(Set(msg)).union(evidence),
    decision' = decision.set(p, v), // update the decision, line 51
    // The original algorithm does not have 'DECIDED', but it increments the height.
    // We introduced 'DECIDED' here to prevent the process from changing its decision.
    step' = step.set(p, "decided"),
    fired_action' = "UponProposalInPrecommitNoDecision",
  }

// the actions below are not essential for safety, but added for completeness
// lines 20-21 + 57-60
action OnTimeoutPropose(p) = all {
  step.get(p) == "propose",
  p != Proposer.get(round.get(p)),
  BroadcastPrevote(p, round.get(p), NilValue),
  step' = step.set(p, "prevote"),
  fired_action' = "OnTimeoutPropose",
}

// lines 44-46
action OnQuorumOfNilPrevotes(p) =
  val PV = msgsPrevote.get(round.get(p)).filter(m => m.id == Id(NilValue))
  all {
    step.get(p) == "prevote",
    size(PV) >= THRESHOLD2, // line 36
    evidence' = PV.union(evidence),
    BroadcastPrecommit(p, round.get(p), Id(NilValue)),
    step' = step.set(p, "precommit"),
    fired_action' = "OnQuorumOfNilPrevotes",
  }

// lines 55-56
action OnRoundCatchup(p) = {
  nondet r = Rounds.filter(rr => rr > round.get(p)).oneOf()
  val RoundMsgs =
    msgsPropose.get(r).union(msgsPrevote.get(r)).union(msgsPrecommit.get(r))

  nondet MyEvidence = powerset(RoundMsgs).oneOf()
  val Faster = MyEvidence.map(m => m.src)
  all {
    size(Faster) >= THRESHOLD1,
    evidence' = MyEvidence.union(evidence),
    StartRound(p, r),
    fired_action' = "OnRoundCatchup",
  }
}

/*
 * A system transition. In this specificatiom, the system may eventually deadlock,
 * e.g., when all processes decide. This is expected behavior, as we focus on safety.
 */
action Next =
  nondet p = oneOf(Corr)
  any {
    InsertProposal(p),
    UponProposalInPropose(p),
    UponProposalInProposeAndPrevote(p),
    UponQuorumOfPrevotesAny(p),
    UponProposalInPrevoteOrCommitAndPrevote(p),
    UponQuorumOfPrecommitsAny(p),
    UponProposalInPrecommitNoDecision(p),
    // the actions below are not essential for safety, but added for completeness
    OnTimeoutPropose(p),
    OnQuorumOfNilPrevotes(p),
    OnRoundCatchup(p),
  }

//**************************** FORK SCENARIOS  ***************************

// equivocation by a process p
def EquivocationBy(p) =
  tuples(evidence, evidence).exists((m1, m2) =>
    and {
      m1 != m2,
      m1.src == p,
      m2.src == p,
      m1.round == m2.round,
      m1.tag == m2.tag
    }
  )

// amnesic behavior by a process p
def AmnesiaBy(p) =
    tuples(Rounds, Rounds).exists((r1, r2) =>
        and {
          r1 < r2,
          tuples(ValidValues, ValidValues).exists((v1, v2) =>
            and {
              v1 != v2,
              evidence.contains({ tag: "PRECOMMIT", src: p,
                                  round: r1, id: Id(v1) }),
              evidence.contains({ tag: "PREVOTE", src: p,
                                  round: r2, id: Id(v2)}),
              Rounds.filter(rnd => (r1 <= rnd and rnd < r2)).forall(r =>
                val prevotes = evidence.filter(m => m.tag == "PREVOTE")
                                       .filter(m => m.round == r and m.id == Id(v2))
                size(prevotes) < THRESHOLD2
              )
            }
          )
        }
     )

//******************************** PROPERTIES  ***************************************

// the safety property -- agreement
val Agreement =
  tuples(Corr, Corr).forall((p, q) => or {
    decision.get(p) == NilValue,
    decision.get(q) == NilValue,
    decision.get(p) == decision.get(q)
  })

// the protocol validity
val Validity =
  Corr.forall(p =>
    decision.get(p).in((ValidValues.union(Set(NilValue))))
  )

/*
  The protocol safety. Two cases are possible:
     1. There is no fork, that is, Agreement holds true.
     2. A subset of faulty processes demonstrates equivocation or amnesia.
 */
val Accountability = or {
    Agreement,
    powerset(Faulty).exists(Detectable => and {
        size(Detectable) >= THRESHOLD1,
        Detectable.forall(p => EquivocationBy(p) or AmnesiaBy(p))
    })
}

//****************** FALSE INVARIANTS TO PRODUCE EXAMPLES ***********************

// This property is violated. You can check it to see how amnesic behavior
// appears in the evidence variable.
val NoAmnesia =
    Faulty.forall(p => not(AmnesiaBy(p)))

// This property is violated. You can check it to see an example of equivocation.
val NoEquivocation =
    Faulty.forall(p => not(EquivocationBy(p)))

// This property is violated. You can check it to see an example of agreement.
// It is not exactly ~Agreement, as we do not want to see the states where
// decision.get(p) = NilValue
val NoAgreement =
  tuples(Corr, Corr).forall((p, q) =>
        and {
          p != q,
          decision.get(p) != NilValue,
          decision.get(q) != NilValue
        } implies (decision.get(p) != decision.get(q))
  )
// Either agreement holds, or the faulty processes indeed demonstrate amnesia.
// This property is violated. A counterexample should demonstrate equivocation.
val AgreementOrAmnesia =
    Agreement or Faulty.forall(p => AmnesiaBy(p))

// We expect this property to be violated. It shows us a protocol run,
// where one faulty process demonstrates amnesia without equivocation.
// However, the absence of amnesia
// is a tough constraint for Apalache. It has not reported a counterexample
// for n=4,f=2, length <= 5.
val ShowMeAmnesiaWithoutEquivocation =
    (not(Agreement) and Faulty.exists(p => not(EquivocationBy(p))))
        implies Faulty.forall(p => not(AmnesiaBy(p)))

// This property is violated on n=4,f=2, length=4 in less than 10 min.
// Two faulty processes may demonstrate amnesia without equivocation.
val AmnesiaImpliesEquivocation =
    (Faulty.exists(p => AmnesiaBy(p)))
      implies (Faulty.exists(q => EquivocationBy(q)))

/*
  This property is violated. You can check it to see that all correct processes
  may reach MaxRound without making a decision.
 */
val NeverUndecidedInMaxRound = (
    val AllInMax   = Corr.forall(p => round.get(p) == MaxRound)
    val AllDecided = Corr.forall(p => decision.get(p) != NilValue)
    AllInMax implies AllDecided
)

}
