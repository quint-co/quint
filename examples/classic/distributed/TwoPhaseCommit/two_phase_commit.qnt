// -*- mode: Bluespec; -*-

/* This specification stems from the specification of the two phase protocol
   by Leslie Lamport:

   https://github.com/tlaplus/Examples/blob/master/specifications/transaction_commit/TwoPhase.tla */

module two_phase_commit {
  const resourceManagers: Set[str]

  type ResourceManagerState = Working | Prepared | Committed | Aborted
  type TransactionManagerState = Init | TMCommitted | TMAborted
  type Message =
    | Abort
    | Commit
    | RMPrepared(str)

  var RM::states: str -> ResourceManagerState
  var TM::state: TransactionManagerState
  /// The set of resource managers from which the transaction manager has
  /// received RMPrepared messages
  var TM::preparedRMs: Set[str]
  var messages: Set[Message]

  action init = all {
    RM::states' = resourceManagers.mapBy(r => Working),
    TM::state' = Init,
    TM::preparedRMs' = Set(),
    messages' = Set(),
  }

  /* Transaction Manager (TM) actions */

  /// The transaction manager receives a RMPrepared(rm) message from the resource manager rm
  action TM::addPreparedResourceManager(resourceManager: str): bool = all {
    TM::state == Init,
    messages.contains(RMPrepared(resourceManager)),
    TM::preparedRMs' = TM::preparedRMs.union(Set(resourceManager))
  }

  /// The transaction manager commits the transaction; enabled iff the
  /// transaction manager is in its initial state and every resource manager has
  /// sent an RMPrepared message.
  action TM::decideOnCommit = all {
    TM::state == Init,
    TM::preparedRMs == resourceManagers,
    TM::state' = TMCommitted,
    messages' = messages.union(Set(Commit))
  }

  /// The transaction manager spontaneously aborts the transaction
  action TM::decideOnAbort = all {
    TM::state == Init,
    TM::state' = TMAborted,
    messages' = messages.union(Set(Abort))
  }

  /* Resource Manager (RM) actions */

  /// A resource manager prepares
  action RM::prepare(resourceManager: str): bool = all {
    RM::states.get(resourceManager) == Working,
    RM::states' = RM::states.set(resourceManager, Prepared),
    messages' = messages.union(Set(RMPrepared(resourceManager)))
  }

  /// A resource manager aborts, either spontaneously or because of an Abort message
  action RM::abort(resourceManager: str): bool = all {
    or {
      // Resource manager chooses to abort
      RM::states.get(resourceManager) == Working,
      // Resource manager receives an abort message from the transaction manager
      messages.contains(Abort),
    },
    RM::states' = RM::states.set(resourceManager, Aborted),
    // There is no need to let others know that this resource manager aborted
    messages' = messages
  }

  // A resource manager commits due to a Commit message
  action RM::commit(resourceManager: str): bool = all {
    messages.contains(Commit),
    RM::states' = RM::states.set(resourceManager, Committed),
    messages' = messages
  }

  action step = any {
    // Resource manager actions
    all {
      nondet rm = resourceManagers.oneOf()
      any { RM::prepare(rm), RM::abort(rm), RM::commit(rm) },
      TM::state' = TM::state,
      TM::preparedRMs' = TM::preparedRMs,
    },
    // Transaction manager decisions (commit or abort)
    all {
      any { TM::decideOnCommit, TM::decideOnAbort },
      TM::preparedRMs' = TM::preparedRMs,
      RM::states' = RM::states,
    },
    // Transaction managers message consumption
    all {
      nondet rm = resourceManagers.oneOf()
      TM::addPreparedResourceManager(rm),
      TM::state' = TM::state,
      RM::states' = RM::states,
      messages' = messages,
    }
  }

  /// Two resource managers have not arrived at conflicting decisions
  val consistencyInv = tuples(resourceManagers, resourceManagers).forall(((r1, r2)) =>
    not(RM::states.get(r1) == Committed and RM::states.get(r2) == Aborted)
  )
}

module two_phase_commit_3 {
  import two_phase_commit(resourceManagers = Set("rm1", "rm2", "rm3")).*

  /// Compose two actions: send an RMPrepare message and consume it in the
  /// transaction manager
  run preparation(rm) = (all {
    RM::prepare(rm),
    TM::state' = TM::state,
    TM::preparedRMs' = TM::preparedRMs,
  }).then(all {
    TM::addPreparedResourceManager(rm),
    TM::state' = TM::state,
    RM::states' = RM::states,
    messages' = messages,
  })

  /// Compose several actions: The transaction manager decides to commit and
  /// each resource manager consumes its Commit message
  run commitment = (all {
    TM::decideOnCommit,
    TM::preparedRMs' = TM::preparedRMs,
    RM::states' = RM::states,
  }).then(all {
    RM::commit("rm1"),
    TM::state' = TM::state,
    TM::preparedRMs' = TM::preparedRMs,
  }).then(all {
    RM::commit("rm2"),
    TM::state' = TM::state,
    TM::preparedRMs' = TM::preparedRMs,
  }).then(all {
    RM::commit("rm3"),
    TM::state' = TM::state,
    TM::preparedRMs' = TM::preparedRMs,
  })

  run successTest = init
    .then(preparation("rm1"))
    .then(preparation("rm2"))
    .then(preparation("rm3"))
    .then(commitment)
}
