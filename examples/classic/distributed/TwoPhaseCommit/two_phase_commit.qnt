module two_phase_commit {
  /// "working", "prepared", "committed" or "aborted"
  type ResourceManagerState = str
  var resourceManagerStates: str -> ResourceManagerState

  /// "init" or "done"
  type TransactionManagerState = str
  var transactionManagerState: TransactionManagerState

  var preparedResourceManagers: Set[str]

  /// kind "commit", "abort" or "prepared"
  type Message = { kind: str, resourceManager: str }
  var messages: Set[Message]

  const resourceManagers: Set[str]

  action init = all {
    resourceManagerStates' = resourceManagers.mapBy(r => "working"),
    transactionManagerState' = "init",
    preparedResourceManagers' = Set(),
    messages' = Set(),
  }

  /* Transaction Manager actions */

  action addPreparedResourceManager(resourceManager: str): bool = all {
    transactionManagerState == "init",
    messages.contains({ kind: "prepared", resourceManager: resourceManager }),
    preparedResourceManagers' = preparedResourceManagers.union(Set(resourceManager))
  }

  action decideOnCommit = all {
    transactionManagerState == "init",
    preparedResourceManagers == resourceManagers,
    transactionManagerState' = "done",
    messages' = messages.union(Set({ kind: "commit", resourceManager: "" }))
  }

  action decideOnAbort = all {
    transactionManagerState == "init",
    transactionManagerState' = "done",
    messages' = messages.union(Set({ kind: "abort", resourceManager: "" }))
  }

  /* Resource Manager actions */

  action prepare(resourceManager: str): bool = all {
    resourceManagerStates.get(resourceManager) == "working",
    resourceManagerStates' = resourceManagerStates.set(resourceManager, "prepared"),
    messages' = messages.union(Set({ kind: "prepared", resourceManager: resourceManager }))
  }

  action abort(resourceManager: str): bool = all {
    or {
      // Resource manager chooses to abort
      resourceManagerStates.get(resourceManager) == "working",
      // Resource manager receives an abort message from the transaction manager
      messages.contains({ kind: "abort", resourceManager: "" }),
    },
    resourceManagerStates' = resourceManagerStates.set(resourceManager, "aborted"),
    // There is no need to let others know that this resource manager aborted
    messages' = messages
  }

  action commit(resourceManager: str): bool = all {
    messages.contains({ kind: "commit", resourceManager: "" }),
    resourceManagerStates' = resourceManagerStates.set(resourceManager, "commited"),
    messages' = messages.union(Set({ kind: "commited", resourceManager: resourceManager }))
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
    not(resourceManagerStates.get(r1) == "commited" and resourceManagerStates.get(r2) == "aborted")
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
