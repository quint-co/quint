// -*- mode: Bluespec; -*-

/* This specification is a variation on ./two_phase_commit.qnt that experiments with
   using modules to divides the state spaces to reflect possible state access in the
   system.
*/

module message {
  type T =
    | Abort
    | Commit
    | Prepared(str)

  var channel: Set[T]

  action init: bool = {
    channel' = Set()
  }

  action stutter = all {
    channel' = channel
  }

  action send(m: T): bool = {
    channel' = channel.union(Set(m))
  }

}

module resource_managers {
  import message as msg

  type Status = | Working | Prepared | Committed | Aborted
  var statuses : str -> Status

  action init(rms: Set[str]): bool = {
    statuses' = rms.mapBy(r => Working)
  }

  action stutter = all {
    statuses' = statuses
  }

  action prepare(resourceManager: str): bool = all {
    statuses.get(resourceManager) == Working,
    statuses' = statuses.set(resourceManager, Prepared),
    msg::send(msg::Prepared(resourceManager))
  }

  action abort(resourceManager: str): bool = all {
    or {
      // Resource manager is working, and chooses to abort spontaneously
      statuses.get(resourceManager) == Working,
      // Resource manager receives an abort message from the transaction manager
      msg::channel.contains(msg::Abort),
    },
    statuses' = statuses.set(resourceManager, Aborted),
    // There is no need to let others know that this resource manager aborted
    msg::stutter,
  }


  // A resource manager commits due to a Commit message
  action commit(resourceManager: str): bool = all {
    msg::channel.contains(msg::Commit),
    statuses' = statuses.set(resourceManager, Committed),
    msg::stutter,
  }


  def consistencyInv(resourceManagers) =
    tuples(resourceManagers, resourceManagers)
    .forall(((r1, r2)) =>
      not( statuses.get(r1) == Committed
           and
           statuses.get(r2) == Aborted))
}

module transaction_manager {
  import message as msg

  type Status = | TMInitiated | TMCommitted | TMAborted

  var status : Status
  /// The set of resource managers from which the transaction manager has
  /// received msg::Prepared messages
  var preparedRMs : Set[str]

  action init: bool = all {
    status' = TMInitiated,
    preparedRMs' = Set(),
  }

  action stutter = all {
    status' = status,
    preparedRMs' = preparedRMs,
  }

  /// The transaction manager receives a RMPrepared(rm) message from the resource manager rm
  action addPreparedResourceManager(resourceManager: str): bool = all {
    status == TMInitiated,
    msg::channel.contains(msg::Prepared(resourceManager)),
    preparedRMs' = preparedRMs.union(Set(resourceManager)),
    status' = status,
  }

  /// The transaction manager commits the transaction; enabled iff the
  /// transaction manager is in its initial state and every resource manager has
  /// sent an RMPrepared message.
  action decideOnCommit(resourceManagers) = all {
    status == TMInitiated,
    preparedRMs == resourceManagers,
    status' = TMCommitted,
    preparedRMs' = preparedRMs,
    msg::send(msg::Commit)
  }

  /// The transaction manager spontaneously aborts the transaction
  action decideOnAbort = all {
    status == TMInitiated,
    status' = TMAborted,
    preparedRMs' = preparedRMs,
    msg::send(msg::Abort)
  }
}

module two_phase_commit {
  const resourceManagers: Set[str]

  import resource_managers as RM
  import transaction_manager as TM
  import message as msg

  action step = any {
    // Resource manager actions
    all {
      nondet rm = resourceManagers.oneOf()
      any { RM::prepare(rm),
            RM::abort(rm),
            RM::commit(rm) },
      TM::stutter
    },
    // Transaction manager decisions (commit or abort)
    all {
      any { TM::decideOnCommit(resourceManagers),
            TM::decideOnAbort },
      RM::stutter,
    },
    // Transaction managers message consumption
    all {
      nondet rm = resourceManagers.oneOf()
      TM::addPreparedResourceManager(rm),
      RM::stutter,
      msg::stutter
    }
  }

  action init = all {
    msg::init,
    TM::init,
    RM::init(resourceManagers),
  }

  /// Two resource managers have not arrived at conflicting decisions
  val inv = RM::consistencyInv(resourceManagers)
}

module two_phase_commit_tests {
  import two_phase_commit(resourceManagers = Set("rm1", "rm2", "rm3")).*

  import resource_managers as RM
  import transaction_manager as TM
  import message as msg

  /// Compose two actions: send an RMPrepare message and consume it in the
  /// transaction manager
  run preparation(rm) = (all {
    RM::prepare(rm),
    TM::stutter,
  }).then(all {
    TM::addPreparedResourceManager(rm),
    RM::stutter,
    msg::stutter,
  })

  /// Compose several actions: The transaction manager decides to commit and
  /// each resource manager consumes its Commit message
  run commitment = (all {
    TM::decideOnCommit(resourceManagers),
    RM::stutter
  }).then(all {
    RM::commit("rm1"),
    TM::stutter
  }).then(all {
    RM::commit("rm2"),
    TM::stutter
  }).then(all {
    RM::commit("rm3"),
    TM::stutter
  })

  run successTest = init.then(step).then(step)
  // run successTest = init
  //   .then(preparation("rm1"))
  //   .then(preparation("rm2"))
  //   .then(preparation("rm3"))
  //   .then(commitment)
}
