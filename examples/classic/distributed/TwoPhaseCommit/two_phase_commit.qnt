// -*- mode: Bluespec; -*-

/* This specification stems from the specification of the two phase protocol
   by Leslie Lamport:

   https://github.com/tlaplus/Examples/blob/master/specifications/transaction_commit/TwoPhase.tla */

module two_phase_commit {
  type ResourceManagerState = Working | Prepared | Committed | Aborted
  var resourceManagerStates: str -> ResourceManagerState

  type TransactionManagerState = Init | Done
  var transactionManagerState: TransactionManagerState

  /// The set of resource managers from which the transaction manager has
  /// received RMPrepared messages
  var preparedResourceManagers: Set[str]

  type Message =
    | Abort
    | Commit
    | RMPrepared(str)
    | RMCommitted(str)

  var messages: Set[Message]

  const resourceManagers: Set[str]

  action init = all {
    resourceManagerStates' = resourceManagers.mapBy(r => Working),
    transactionManagerState' = Init,
    preparedResourceManagers' = Set(),
    messages' = Set(),
  }

  /* Transaction Manager actions */

  /// The transaction manager receives a RMPrepared(rm) message from the resource manager rm
  action addPreparedResourceManager(resourceManager: str): bool = all {
    transactionManagerState == Init,
    messages.contains(RMPrepared(resourceManager)),
    preparedResourceManagers' = preparedResourceManagers.union(Set(resourceManager))
  }

  /// The transaction manager commits the transaction; enabled iff the
  /// transaction manager is in its initial state and every resource manager has
  /// sent an RMPrepared message.
  action decideOnCommit = all {
    transactionManagerState == Init,
    preparedResourceManagers == resourceManagers,
    transactionManagerState' = Done,
    messages' = messages.union(Set(Commit))
  }

  /// The transaction manager spontaneously aborts the transaction
  action decideOnAbort = all {
    transactionManagerState == Init,
    transactionManagerState' = Done,
    messages' = messages.union(Set(Abort))
  }

  /* Resource Manager actions */

  /// A resource manager prepares
  action prepare(resourceManager: str): bool = all {
    resourceManagerStates.get(resourceManager) == Working,
    resourceManagerStates' = resourceManagerStates.set(resourceManager, Prepared),
    messages' = messages.union(Set(RMPrepared(resourceManager)))
  }

  /// A resource manager aborts, either spontaneously or because of an Abort message
  action abort(resourceManager: str): bool = all {
    or {
      // Resource manager chooses to abort
      resourceManagerStates.get(resourceManager) == Working,
      // Resource manager receives an abort message from the transaction manager
      messages.contains(Abort),
    },
    resourceManagerStates' = resourceManagerStates.set(resourceManager, Aborted),
    // There is no need to let others know that this resource manager aborted
    messages' = messages
  }

  // A resource manager commits due to a Commit message
  action commit(resourceManager: str): bool = all {
    messages.contains(Commit),
    resourceManagerStates' = resourceManagerStates.set(resourceManager, Committed),
    messages' = messages.union(Set(RMCommitted(resourceManager)))
  }

  action step = any {
    // Resource manager actions
    all {
      nondet rm = resourceManagers.oneOf()
      any { prepare(rm), abort(rm), commit(rm) },
      transactionManagerState' = transactionManagerState,
      preparedResourceManagers' = preparedResourceManagers,
    },
    // Transaction manager decisions (commit or abort)
    all {
      any { decideOnCommit, decideOnAbort },
      preparedResourceManagers' = preparedResourceManagers,
      resourceManagerStates' = resourceManagerStates,
    },
    // Transaction managers message consumption
    all {
      nondet rm = resourceManagers.oneOf()
      addPreparedResourceManager(rm),
      transactionManagerState' = transactionManagerState,
      resourceManagerStates' = resourceManagerStates,
      messages' = messages,
    }
  }

  /// Two resource managers have not arrived at conflicting decisions
  val consistencyInv = tuples(resourceManagers, resourceManagers).forall(((r1, r2)) =>
    not(resourceManagerStates.get(r1) == Committed and resourceManagerStates.get(r2) == Aborted)
  )
}

module two_phase_commit_3 {
  import two_phase_commit(resourceManagers = Set("rm1", "rm2", "rm3")).*

  /// Compose two actions: send an RMPrepare message and consume it in the
  /// transaction manager
  run preparation(rm) = (all {
    prepare(rm),
    transactionManagerState' = transactionManagerState,
    preparedResourceManagers' = preparedResourceManagers,
  }).then(all {
    addPreparedResourceManager(rm),
    transactionManagerState' = transactionManagerState,
    resourceManagerStates' = resourceManagerStates,
    messages' = messages,
  })

  /// Compose several actions: The transaction manager decides to commit and
  /// each resource manager consumes its Commit message
  run commitment = (all {
    decideOnCommit,
    preparedResourceManagers' = preparedResourceManagers,
    resourceManagerStates' = resourceManagerStates,
  }).then(all {
    commit("rm1"),
    transactionManagerState' = transactionManagerState,
    preparedResourceManagers' = preparedResourceManagers,
  }).then(all {
    commit("rm2"),
    transactionManagerState' = transactionManagerState,
    preparedResourceManagers' = preparedResourceManagers,
  }).then(all {
    commit("rm3"),
    transactionManagerState' = transactionManagerState,
    preparedResourceManagers' = preparedResourceManagers,
  })

  run successTest = init
    .then(preparation("rm1"))
    .then(preparation("rm2"))
    .then(preparation("rm3"))
    .then(commitment)
}
