module two_phase_commit {
  type ResourceManagerState = Working | Prepared | Committed | Aborted
  var resourceManagerStates: str -> ResourceManagerState

  type TransactionManagerState = Init | Done
  var transactionManagerState: TransactionManagerState

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

  action addPreparedResourceManager(resourceManager: str): bool = all {
    transactionManagerState == Init,
    messages.contains(RMPrepared(resourceManager)),
    preparedResourceManagers' = preparedResourceManagers.union(Set(resourceManager))
  }

  action decideOnCommit = all {
    transactionManagerState == Init,
    preparedResourceManagers == resourceManagers,
    transactionManagerState' = Done,
    messages' = messages.union(Set(Commit))
  }

  action decideOnAbort = all {
    transactionManagerState == Init,
    transactionManagerState' = Done,
    messages' = messages.union(Set(Abort))
  }

  /* Resource Manager actions */

  action prepare(resourceManager: str): bool = all {
    resourceManagerStates.get(resourceManager) == Working,
    resourceManagerStates' = resourceManagerStates.set(resourceManager, Prepared),
    messages' = messages.union(Set(RMPrepared(resourceManager)))
  }

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

  action commit(resourceManager: str): bool = all {
    messages.contains(Commit),
    resourceManagerStates' = resourceManagerStates.set(resourceManager, Committed),
    messages' = messages.union(Set(RMCommitted(resourceManager)))
  }

  action step = any {
    all {
      nondet rm = resourceManagers.oneOf()
      any { prepare(rm), abort(rm), commit(rm) },
      transactionManagerState' = transactionManagerState,
      preparedResourceManagers' = preparedResourceManagers,
    },
    all {
      any { decideOnCommit, decideOnAbort },
      preparedResourceManagers' = preparedResourceManagers,
      resourceManagerStates' = resourceManagerStates,
    },
    all {
      nondet rm = resourceManagers.oneOf()
      addPreparedResourceManager(rm),
      transactionManagerState' = transactionManagerState,
      resourceManagerStates' = resourceManagerStates,
      messages' = messages,
    }
  }

  action consistencyInv = tuples(resourceManagers, resourceManagers).forall(((r1, r2)) =>
    not(resourceManagerStates.get(r1) == Committed and resourceManagerStates.get(r2) == Aborted)
  )
}

module two_phase_commit_3 {
  import two_phase_commit(resourceManagers = Set("rm1", "rm2", "rm3")).*

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
