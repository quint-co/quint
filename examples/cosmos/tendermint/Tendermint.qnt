// -*- mode: Bluespec; -*-
module Tendermint {
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

   * Version 5. Refactor evidence, migrate to Apalache Type System 1.2.
   * Version 4. Remove defective processes, fix bugs, collect global evidence.
   * Version 3. Modular and parameterized definitions.
   * Version 2. Bugfixes in the spec and an inductive invariant.
   * Version 1. A preliminary specification.

   Zarko Milosevic, Igor Konnov, Josef Widder, Informal Systems, 2019-2023.
   */

  //********************* PROTOCOL PARAMETERS **********************************

  // a process name is just a string in our specification
  type Proc_t = str
  // a value is also a string
  type Value_t = str
  // a state is also a string
  type State_t = str
  // a round is an integer
  type Round_t = int

  // As constants are not supported by the simulator yet,
  // we use pure val as an interim solution:
  // https://github.com/informalsystems/quint/issues/236

  // the set of correct processes
  const Corr: Set[Proc_t]

  // The set of Byzantine processes, may be empty.
  const Faulty: Set[Proc_t]

  // the total number of processes: correct, defective, and Byzantine
  const N: int

  // an upper bound on the number of Byzantine processes
  const T: int

  // the set of valid values, proposed both by correct and faulty
  const ValidValues: Set[Value_t]

  // the set of invalid values, never proposed by the correct ones
  const InvalidValues: Set[Value_t]

  // the maximal round number
  const MaxRound: Round_t

  // the proposer function from 0..NRounds to the set of processes
  const Proposer: Round_t -> Proc_t

  assume Corr_and_faulty_are_disjoint =
      (Corr.intersect(Faulty) == Set())

  assume Corr_and_faulty_make_N =
      N == size(Corr.union(Faulty))

  //*************************** DEFINITIONS ***********************************
  // the set of all processes
  pure val AllProcs = Corr.union(Faulty)
  // the set of potential rounds
  pure val Rounds = 0.to(MaxRound)
  // a special value to denote a nil round, outside of Rounds
  pure val NilRound = -1
  pure val RoundsOrNil = Set(NilRound).union(Rounds)
  // the set of all values
  pure val Values = ValidValues.union(InvalidValues)
  // a special value for a nil round, outside of Values
  pure val NilValue = "None"
  pure val ValuesOrNil = Set(NilValue).union(Values)

  // a value hash is modeled as identity
  pure def Id(v) = v

  // The validity predicate
  pure def IsValid(v) = ValidValues.contains(v)

  // the two thresholds that are used in the algorithm
  pure val THRESHOLD1 = T + 1      // at least one process is not faulty
  pure val THRESHOLD2 = 2 * T + 1  // a quorum when having N > 3 * T

  //********************* PROTOCOL STATE ******************************
  // a process round number: Corr -> Rounds
  var round: Proc_t -> Round_t
  // a process step: Corr -> { "PROPOSE", "PREVOTE", "PRECOMMIT", "DECIDED" }
  var step: Proc_t -> State_t
  // process decision: Corr -> ValuesOrNil
  var decision: Proc_t -> Value_t
  // a locked value: Corr -> ValuesOrNil
  var lockedValue: Proc_t -> Value_t
  // a locked round: Corr -> RoundsOrNil
  var lockedRound: Proc_t -> Round_t
  // a valid value: Corr -> ValuesOrNil
  var validValue: Proc_t -> Value_t
  // a valid round: Corr -> RoundsOrNil
  var validRound: Proc_t -> Round_t

  // book-keeping variables

  // the type of propose messages
  type Propose_t = {
    src: Proc_t,
    round: Round_t,
    proposal: Value_t,
    validRound: Round_t
  }

  // the type of Prevote and Precommit messages
  type Pre_t = {
    src: Proc_t,
    round: Round_t,
    id: Value_t,
  }

  // PROPOSE messages broadcast in the system
  var msgsPropose: Round_t -> Set[Propose_t]
  // PREVOTE messages broadcast in the system
  var msgsPrevote: Round_t -> Set[Pre_t]
  // PRECOMMIT messages broadcast in the system
  var msgsPrecommit: Round_t -> Set[Pre_t]
  // the PROPOSE messages used by some correct processes to make transitions
  var evidencePropose: Set[Propose_t]
  // the PREVOTE messages used by some correct processes to make transitions
  var evidencePrevote: Set[Pre_t]
  // the PRECOMMIT messages used by some correct processes to make transitions
  var evidencePrecommit: Set[Pre_t]

  // we use this variable to see which action was taken
  var fired_action: str

  //********************* PROTOCOL INITIALIZATION ******************************
  def FaultyProposals(r) =
      tuples(Faulty, Values, RoundsOrNil)
        .map( ((p, v, vr)) =>
          { src: p, round: r, proposal: v, validRound: vr })

  val AllFaultyProposals =
      Rounds.map(r => FaultyProposals(r))
            .flatten()

  def FaultyPrevotes(r) =
      tuples(Faulty, Values)
        .map( ((p, v)) => { src: p, round: r, id: v })

  val AllFaultyPrevotes =
      Rounds.map(r => FaultyPrevotes(r))
            .flatten()

  def FaultyPrecommits(r) =
      tuples(Faulty, Values)
        .map( ((p, v)) => { src: p, round: r, id: v })

  val AllFaultyPrecommits =
      Rounds.map(r => FaultyPrecommits(r))
            .flatten()

  // The initial states of the protocol. Some faults can be in the system already.
  action Init = all {
    round' = Corr.mapBy( _ => 0 ),
    step' = Corr.mapBy( _ => "propose" ),
    decision' = Corr.mapBy( _ => NilValue ),
    lockedValue' = Corr.mapBy( _ => NilValue ),
    lockedRound' = Corr.mapBy( _ => NilRound ),
    validValue' = Corr.mapBy( _ => NilValue ),
    validRound' = Corr.mapBy( _ => NilRound ),
    nondet faultyProposals = AllFaultyProposals.powerset().oneOf()
    msgsPropose' = Rounds.mapBy(r => faultyProposals.filter(m => m.round == r)),
    nondet faultyPrevotes = AllFaultyPrevotes.powerset().oneOf()
    msgsPrevote' = Rounds.mapBy(r => faultyPrevotes.filter(m => m.round == r)),
    nondet faultyPrecommits = AllFaultyPrecommits.powerset().oneOf()
    msgsPrecommit' = Rounds.mapBy(r => faultyPrecommits.filter(m => m.round == r)),
    evidencePropose' = Set(),
    evidencePrevote' = Set(),
    evidencePrecommit' = Set(),
    fired_action' = "Init",
  }

  //************************ MESSAGE PASSING *******************************
  action BroadcastProposal(pSrc, pRound, pProposal, pValidRound) = {
    val newMsg = {
      src: pSrc, round: pRound,
      proposal: pProposal, validRound: pValidRound
    }
    msgsPropose' = msgsPropose.setBy(pRound, (old => old.union(Set(newMsg))))
  }

  action BroadcastPrevote(pSrc, pRound, pId) = {
    val newMsg = { src: pSrc, round: pRound, id: pId }
    msgsPrevote' = msgsPrevote.setBy(pRound, (old => old.union(Set(newMsg))))
  }

  action BroadcastPrecommit(pSrc, pRound, pId) = {
    val newMsg = { src: pSrc, round: pRound, id: pId }
    msgsPrecommit' = msgsPrecommit.setBy(pRound, (old => old.union(Set(newMsg))))
  }

  //********************* PROTOCOL TRANSITIONS ******************************
  // lines 12-13
  action StartRound(p, r) = all {
     // a decided process does not participate in consensus
     step.get(p) != "decided",
     round' = round.set(p, r),
     step' = step.set(p, "propose"),
  }

  // lines 14-19, a proposal may be sent later
  action InsertProposal(p, v) = {
    val r = round.get(p)
    all {
      p == Proposer.get(r),
      step.get(p) == "propose",
      // if the proposer is sending a proposal, then there are no other proposals
      // by the correct processes for the same round
      msgsPropose.get(r).forall(m => m.src != p),
      val proposal = if (validValue.get(p) == NilValue) v else validValue.get(p)
      BroadcastProposal(p, round.get(p), proposal, validRound.get(p)),
      fired_action' = "InsertProposal",
      round' = round,
      step' = step,
      evidencePropose' = evidencePropose,
      evidencePrevote' = evidencePrevote,
      evidencePrecommit' = evidencePrecommit,
      validValue' = validValue,
      validRound' = validRound,
      msgsPrecommit' = msgsPrecommit,
      msgsPrevote' = msgsPrevote,
      decision' = decision,
      lockedValue' = lockedValue,
      lockedRound' = lockedRound,
    }
  }

  // lines 22-27
  action UponProposalInPropose(p, v) =
    val msg = {
      src: Proposer.get(round.get(p)),
      round: round.get(p), proposal: v, validRound: NilRound
    }
    val mid = // line 23
         if (IsValid(v) and (lockedRound.get(p) == NilRound or lockedValue.get(p) == v))
         Id(v)
         else NilValue
    all {
      step.get(p) == "propose",                       // line 22
      msg.in(msgsPropose.get(round.get(p))),          // line 22
      evidencePropose' = Set(msg).union(evidencePropose),
      BroadcastPrevote(p, round.get(p), mid),         // lines 24-26
      step' = step.set(p, "prevote"),
      fired_action' = "UponProposalInPropose",
      round' = round,
      validValue' = validValue,
      validRound' = validRound,
      msgsPropose' = msgsPropose,
      msgsPrecommit' = msgsPrecommit,
      decision' = decision,
      lockedValue' = lockedValue,
      lockedRound' = lockedRound,
      evidencePrevote' = evidencePrevote,
      evidencePrecommit' = evidencePrecommit,
    }

  // lines 28-33
  action UponProposalInProposeAndPrevote(p, v, vr) =
    val msg = {
      src: Proposer.get(round.get(p)),
      round: round.get(p), proposal: v, validRound: vr
    }
    val PV = msgsPrevote.get(vr).filter(m => m.id == Id(v))
    val mid = // line 29
      if (IsValid(v) and (lockedRound.get(p) <= vr or lockedValue.get(p) == v)) {
        Id(v)
      } else {
        NilValue
      }
    all {
      step.get(p) == "propose",
      0 <= vr and vr < round.get(p), // line 28, the while part
      msg.in(msgsPropose.get(round.get(p))), // line 28
      size(PV) >= THRESHOLD2, // line 28
      evidencePrevote' = PV.union(evidencePrevote),
      evidencePropose' = Set(msg).union(evidencePropose),
      BroadcastPrevote(p, round.get(p), mid), // lines 24-26
      step' = step.set(p, "prevote"),
      fired_action' = "UponProposalInProposeAndPrevote",
      round' = round,
      validValue' = validValue,
      validRound' = validRound,
      msgsPrecommit' = msgsPrecommit,
      msgsPropose' = msgsPropose,
      decision' = decision,
      lockedValue' = lockedValue,
      lockedRound' = lockedRound,
      evidencePrecommit' = evidencePrecommit,
    }

  // lines 34-35 + lines 61-64 (onTimeoutPrevote)
  action UponQuorumOfPrevotesAny(p: str, Evidence: Set[{ id: Value_t, round: Round_t, src: Proc_t }]): bool =
    // find the unique voters in the evidence
    val Voters: Set[str] = Evidence.map(m => m.src)
    // compare the number of the unique voters against the threshold
    all {
      step.get(p) == "prevote", // line 34 and 61
      size(Voters) >= THRESHOLD2, // line 34
      evidencePrevote' = Evidence.union(evidencePrevote),
      BroadcastPrecommit(p, round.get(p), NilValue),
      step' = step.set(p, "precommit"),
      fired_action' = "UponQuorumOfPrevotesAny",
      round' = round,
      validValue' = validValue,
      validRound' = validRound,
      msgsPrevote' = msgsPrevote,
      msgsPropose' = msgsPropose,
      decision' = decision,
      lockedValue' = lockedValue,
      lockedRound' = lockedRound,
      evidencePropose' = evidencePropose,
      evidencePrecommit' = evidencePrecommit,
    }

  // lines 36-46
  action UponProposalInPrevoteOrCommitAndPrevote(p, v, vr) =
    val msg = {
      src: Proposer.get(round.get(p)),
      round: round.get(p), proposal: v, validRound: vr
    }
    val PV = msgsPrevote.get(round.get(p)).filter(m => m.id == Id(v))
    all {
      step.get(p).in(Set("prevote", "precommit")), // line 36
      msg.in(msgsPropose.get(round.get(p))), // line 36
      size(PV) >= THRESHOLD2, // line 36
      evidencePropose' = Set(msg).union(evidencePropose),
      evidencePrevote' = PV.union(evidencePrevote),
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
      round' = round,
      msgsPrevote' = msgsPrevote,
      msgsPropose' = msgsPropose,
      decision' = decision,
      evidencePrecommit' = evidencePrecommit,
    }

  // lines 47-48 + 65-67 (onTimeoutPrecommit)
  action UponQuorumOfPrecommitsAny(p: str, Evidence: Set[{ id: Value_t, round: Round_t, src: Proc_t }]): bool =
    // find the unique committers in the evidence
    val Committers: Set[str] = Evidence.map( m => m.src )
    // compare the number of the unique committers against the threshold
    all {
      size(Committers) >= THRESHOLD2,  // line 47
      evidencePrecommit' = Evidence.union(evidencePrecommit),
      (round.get(p) + 1).in(Rounds),
      StartRound(p, round.get(p) + 1),
      fired_action' = "UponQuorumOfPrecommitsAny",
      validValue' = validValue,
      validRound' = validRound,
      msgsPrecommit' = msgsPrecommit,
      msgsPrevote' = msgsPrevote,
      msgsPropose' = msgsPropose,
      decision' = decision,
      lockedValue' = lockedValue,
      lockedRound' = lockedRound,
      evidencePropose' = evidencePropose,
      evidencePrevote' = evidencePrevote,
    }

  // lines 49-54
  action UponProposalInPrecommitNoDecision(p, v, r, vr) =
    // line 50
    val msg = { src: Proposer.get(r), round: r, proposal: v, validRound: vr }
    val PV = msgsPrecommit.get(r).filter(m => m.id == Id(v))
    all {
      decision.get(p) == NilValue,         // line 49
      msg.in(msgsPropose.get(r)),           // line 49
      size(PV) >= THRESHOLD2,   // line 49
      evidencePropose' = Set(msg).union(evidencePropose),
      evidencePrecommit' = PV.union(evidencePrecommit),
      decision' = decision.set(p, v), // update the decision, line 51
      // The original algorithm does not have 'DECIDED', but it increments the height.
      // We introduced 'DECIDED' here to prevent the process from changing its decision.
      step' = step.set(p, "decided"),
      fired_action' = "UponProposalInPrecommitNoDecision",
      round' = round,
      validValue' = validValue,
      validRound' = validRound,
      msgsPrecommit' = msgsPrecommit,
      msgsPrevote' = msgsPrevote,
      msgsPropose' = msgsPropose,
      lockedValue' = lockedValue,
      lockedRound' = lockedRound,
      evidencePrevote' = evidencePrevote,
    }

  // the actions below are not essential for safety, but added for completeness
  // lines 20-21 + 57-60
  action OnTimeoutPropose(p) = all {
    step.get(p) == "propose",
    p != Proposer.get(round.get(p)),
    BroadcastPrevote(p, round.get(p), NilValue),
    step' = step.set(p, "prevote"),
    fired_action' = "OnTimeoutPropose",
    round' = round,
    evidencePropose' = evidencePropose,
    evidencePrevote' = evidencePrevote,
    evidencePrecommit' = evidencePrecommit,
    validValue' = validValue,
    validRound' = validRound,
    msgsPrecommit' = msgsPrecommit,
    msgsPropose' = msgsPropose,
    decision' = decision,
    lockedValue' = lockedValue,
    lockedRound' = lockedRound,
  }

  // lines 44-46
  action OnQuorumOfNilPrevotes(p) =
    val PV = msgsPrevote.get(round.get(p)).filter(m => m.id == Id(NilValue))
    all {
      step.get(p) == "prevote",
      size(PV) >= THRESHOLD2, // line 36
      evidencePrevote' = PV.union(evidencePrecommit),
      BroadcastPrecommit(p, round.get(p), Id(NilValue)),
      step' = step.set(p, "precommit"),
      fired_action' = "OnQuorumOfNilPrevotes",
      round' = round,
      validValue' = validValue,
      validRound' = validRound,
      msgsPrevote' = msgsPrevote,
      msgsPropose' = msgsPropose,
      decision' = decision,
      lockedValue' = lockedValue,
      lockedRound' = lockedRound,
      evidencePropose' = evidencePropose,
      evidencePrecommit' = evidencePrecommit,
    }

  // lines 55-56
  action OnRoundCatchup(p) = all {
    round.get(p) < MaxRound,
    nondet r = Rounds.filter(rr => rr > round.get(p)).oneOf()
    nondet EvPropose = msgsPropose.get(r).powerset().oneOf()
    nondet EvPrevote = msgsPrevote.get(r).powerset().oneOf()
    nondet EvPrecommit = msgsPrecommit.get(r).powerset().oneOf()
    def Src(E) = E.map(m => m.src)
    val Faster = Src(EvPropose).union(Src(EvPrevote)).union(Src(EvPrecommit))
    all {
      size(Faster) >= THRESHOLD1,
      evidencePropose' = EvPropose.union(evidencePropose),
      evidencePrevote' = EvPrevote.union(evidencePrevote),
      evidencePrecommit' = EvPrevote.union(evidencePrecommit),
      StartRound(p, r),
      fired_action' = "OnRoundCatchup",
      validValue' = validValue,
      validRound' = validRound,
      msgsPrecommit' = msgsPrecommit,
      msgsPrevote' = msgsPrevote,
      msgsPropose' = msgsPropose,
      decision' = decision,
      lockedValue' = lockedValue,
      lockedRound' = lockedRound,
    }
  }

  /*
   * A system transition. In this specificatiom, the system may eventually deadlock,
   * e.g., when all processes decide. This is expected behavior, as we focus on safety.
   */
  action Next =
    nondet p = oneOf(Corr)
    any {
      nondet v = oneOf(ValidValues)
      InsertProposal(p, v),
      nondet v = oneOf(Values)
      UponProposalInPropose(p, v),
      nondet v = oneOf(Values)
      nondet vr = oneOf(Rounds)
      UponProposalInProposeAndPrevote(p, v, vr),
      nondet Evidence = msgsPrevote.get(round.get(p)).powerset().oneOf()
      UponQuorumOfPrevotesAny(p, Evidence),
      nondet v = oneOf(ValidValues)
      nondet vr = oneOf(RoundsOrNil)
      UponProposalInPrevoteOrCommitAndPrevote(p, v, vr),
      nondet Evidence = msgsPrecommit.get(round.get(p)).powerset().oneOf()
      UponQuorumOfPrecommitsAny(p, Evidence),
      nondet v = oneOf(ValidValues)
      nondet r = oneOf(Rounds)
      nondet vr = oneOf(RoundsOrNil)
      UponProposalInPrecommitNoDecision(p, v, r, vr),
      // the actions below are not essential for safety, but added for completeness
      OnTimeoutPropose(p),
      OnQuorumOfNilPrevotes(p),
      OnRoundCatchup(p),
    }

  //**************************** FORK SCENARIOS  ***************************
  def EquivocationIn(p, S) =
    tuples(S, S).exists( ((m1, m2)) =>
      and {
        m1 != m2,
        m1.src == p,
        m2.src == p,
        m1.round == m2.round,
      }
    )

  // equivocation by a process p
  def EquivocationBy(p: str): bool =
    or {
      EquivocationIn(p, evidencePropose),
      EquivocationIn(p, evidencePrevote),
      EquivocationIn(p, evidencePrecommit),
    }

  // amnesic behavior by a process p
  def AmnesiaBy(p) =
      tuples(Rounds, Rounds).exists( ((r1, r2)) =>
          and {
            r1 < r2,
            tuples(ValidValues, ValidValues).exists(((v1, v2)) =>
              and {
                v1 != v2,
                evidencePrecommit.contains({
                  src: p, round: r1, id: Id(v1)
                }),
                evidencePrevote.contains({
                  src: p, round: r2, id: Id(v2)
                }),
                Rounds
                  .filter(rnd => (r1 <= rnd and rnd < r2))
                  .forall(r =>
                    val prevotes =
                      evidencePrevote
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
    tuples(Corr, Corr).forall( ((p, q)) =>
      or {
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
    tuples(Corr, Corr).forall( ((p, q)) =>
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
