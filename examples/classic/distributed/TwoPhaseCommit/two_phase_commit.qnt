// -*- mode: Bluespec; -*-

/* Two-phase commit: a coordinator and a set of participants agree to commit a transaction or to abort
   it. The participants are a constant, so the spec describes every number of them.

   This specification stems from the specification of the two-phase protocol by Leslie Lamport:

   https://github.com/tlaplus/Examples/blob/master/specifications/transaction_commit/TwoPhase.tla */

module two_phase_commit {
  const participants: Set[str]

  type Stage = Working | Prepared | Committed | Aborted
  type Message =
    | CoordinatorAbort
    | CoordinatorCommit
    | ParticipantPrepared(str)

  /// The stage of each participant
  var stages: str -> Stage
  /// The stage of the coordinator, which is never Prepared
  var coordinatorStage: Stage
  /// The participants whose ParticipantPrepared message the coordinator has received
  var votes: Set[str]
  var messages: Set[Message]

  action init = all {
    stages' = participants.mapBy(p => Working),
    coordinatorStage' = Working,
    votes' = Set(),
    messages' = Set(),
  }

  /* Coordinator actions */

  /// The coordinator receives the ParticipantPrepared message of participant p
  action receivesVote(p: str): bool = all {
    coordinatorStage == Working,
    messages.contains(ParticipantPrepared(p)),
    votes' = votes.union(Set(p))
  }

  /// The coordinator commits the transaction, once every participant has prepared
  action decidesOnCommit = all {
    coordinatorStage == Working,
    votes == participants,
    coordinatorStage' = Committed,
    messages' = messages.union(Set(CoordinatorCommit))
  }

  /// The coordinator aborts the transaction, which it may do at any time before it decides
  action decidesOnAbort = all {
    coordinatorStage == Working,
    coordinatorStage' = Aborted,
    messages' = messages.union(Set(CoordinatorAbort))
  }

  /* Participant actions */

  /// Participant p prepares, and tells the coordinator
  action prepares(p: str): bool = all {
    stages.get(p) == Working,
    stages' = stages.put(p, Prepared),
    messages' = messages.union(Set(ParticipantPrepared(p)))
  }

  /// Participant p aborts, either on its own while it is working or because the coordinator aborted
  action aborts(p: str): bool = all {
    or {
      stages.get(p) == Working,
      messages.contains(CoordinatorAbort),
    },
    stages' = stages.put(p, Aborted),
    // The other participants need not know that p aborted
    messages' = messages
  }

  /// Participant p commits, because the coordinator committed
  action commits(p: str): bool = all {
    messages.contains(CoordinatorCommit),
    stages' = stages.put(p, Committed),
    messages' = messages
  }

  action step = any {
    all {
      nondet p = participants.oneOf()
      any { prepares(p), aborts(p), commits(p) },
      coordinatorStage' = coordinatorStage,
      votes' = votes,
    },
    all {
      any { decidesOnCommit, decidesOnAbort },
      votes' = votes,
      stages' = stages,
    },
    all {
      nondet p = participants.oneOf()
      receivesVote(p),
      coordinatorStage' = coordinatorStage,
      stages' = stages,
      messages' = messages,
    }
  }

  /// No participant commits while another aborts
  invariant consistency = tuples(participants, participants).forall(((p1, p2)) =>
    not(stages.get(p1) == Committed and stages.get(p2) == Aborted)
  )

  // Together with `consistency`, these are inductive: each step that starts in a state satisfying all of
  // them ends in one.

  val stageDomain = stages.keys() == participants
  val votesSubset = votes.subseteq(participants)
  val votesSent = votes.forall(p => messages.contains(ParticipantPrepared(p)))
  val sentNotWorking = participants.forall(p =>
    messages.contains(ParticipantPrepared(p)) implies stages.get(p) != Working
  )
  val commitMsg = messages.contains(CoordinatorCommit) iff coordinatorStage == Committed
  val abortMsg = messages.contains(CoordinatorAbort) iff coordinatorStage == Aborted
  val commitHasAllVotes = coordinatorStage == Committed implies votes == participants
  val committedNeedsMsg = participants.forall(p =>
    stages.get(p) == Committed implies messages.contains(CoordinatorCommit)
  )
  val abortedPrepared = participants.forall(p =>
    (stages.get(p) == Aborted and messages.contains(ParticipantPrepared(p))) implies
      messages.contains(CoordinatorAbort)
  )
  /// `consistency` with the invariants that make it inductive
  invariant agreement = and {
    consistency, stageDomain, votesSubset, votesSent, sentNotWorking, commitMsg, abortMsg,
    commitHasAllVotes, committedNeedsMsg, abortedPrepared,
  }

  /// Once the coordinator commits, it never changes its decision
  temporal commitStays = always(coordinatorStage == Committed implies always(coordinatorStage == Committed))

  /// Every participant has committed
  observation allCommitted = participants.forall(p => stages.get(p) == Committed)

  /// Every participant has aborted
  observation allAborted = participants.forall(p => stages.get(p) == Aborted)
}

module two_phase_commit_3 {
  import two_phase_commit(participants = Set("p1", "p2", "p3")).*

  /// Participant p prepares, and the coordinator receives its vote
  run preparation(p) = (all {
    prepares(p),
    coordinatorStage' = coordinatorStage,
    votes' = votes,
  }).then(all {
    receivesVote(p),
    coordinatorStage' = coordinatorStage,
    stages' = stages,
    messages' = messages,
  })

  /// The coordinator commits, and each participant receives the decision
  run commitment = (all {
    decidesOnCommit,
    votes' = votes,
    stages' = stages,
  }).then(all {
    commits("p1"),
    coordinatorStage' = coordinatorStage,
    votes' = votes,
  }).then(all {
    commits("p2"),
    coordinatorStage' = coordinatorStage,
    votes' = votes,
  }).then(all {
    commits("p3"),
    coordinatorStage' = coordinatorStage,
    votes' = votes,
  })

  run successTest = init
    .then(preparation("p1"))
    .then(preparation("p2"))
    .then(preparation("p3"))
    .then(commitment)
}

module two_phase_commit_7 {
  import two_phase_commit(participants = Set("p1", "p2", "p3", "p4", "p5", "p6", "p7")).*
}
