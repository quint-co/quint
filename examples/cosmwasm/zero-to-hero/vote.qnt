/// A Quint specification following Callum-A's cosmwasm-zero-to-hero tutorial:
/// https://github.com/Callum-A/cosmwasm-zero-to-hero/tree/03e33968f588b192c04fadb984ae853b7dc5e64e
///
/// We refer to the relevant tutorial chapters in comments below.

module vote {

  /*** TYPES ***/

  // 05 - Contract state
  // https://github.com/Callum-A/cosmwasm-zero-to-hero/tree/main/05%20-%20State

  type Addr = str
  type UUID = str
  type Uint64 = int  // FIXME: account for under/overflows

  pure val None: Addr = ""

  type Config = {
    admin: Addr,
  }

  type Poll = {
    creator: Addr,
    question: str,
    options: List[(str, Uint64)]
  }

  type Ballot = {
    option: str
  }

  type ContractState = {
    config: Config,
    polls: UUID -> Poll,
    ballots: (Addr, UUID) -> Ballot
  }

  // 06 - Instantiate
  // https://github.com/Callum-A/cosmwasm-zero-to-hero/tree/main/06%20-%20Instantiate

  type MessageInfo = {
    sender: str
  }

  type InstantiateMsg = {
    admin: str
  }

  // 08 - ExecuteMsg
  // https://github.com/Callum-A/cosmwasm-zero-to-hero/tree/main/08%20-%20ExecuteMsg

  type CreatePoll = {
    poll_id: UUID,
    question: str,
    options: List[str]
  }

  type Vote = {
    poll_id: UUID,
    vote: str,
  }

  // 09 - Execute 1
  // https://github.com/Callum-A/cosmwasm-zero-to-hero/tree/main/09%20-%20Execute%201

  type Result = {
    error: str,
    cs: ContractState
  }

  // 12 - QueryMsg
  // https://github.com/Callum-A/cosmwasm-zero-to-hero/tree/main/12%20-%20QueryMsg

  type QueryAllPolls = {}
  type QueryPoll = { poll_id: str }
  type QueryVote = { poll_id: str, address: Addr }

  // 13 - Query

  type AllPollsResponse = { polls: List[Poll] }
  type PollResponse = { poll: List[Poll] }
  type VoteResponse = { vote: List[Ballot] }

  /*** Functional layer ***/

  // 06 - Instantiate
  // https://github.com/Callum-A/cosmwasm-zero-to-hero/tree/main/06%20-%20Instantiate

  pure def instantiate(cs: ContractState, info: MessageInfo,
                  msg: InstantiateMsg): ContractState = {
    val admin = if (msg.admin != None) msg.admin else info.sender
    // TODO: deps.api.addr_validate(&admin)?
    { ...cs, config: { admin: admin } }
  }

  // 09 - Execute 1
  // https://github.com/Callum-A/cosmwasm-zero-to-hero/tree/main/09%20-%20Execute%201

  pure def execute_create_poll(cs: ContractState, info: MessageInfo, poll_id: UUID,
                          question: str, options: List[str]): Result = {
    if (options.length() > 10) {
      { cs: cs, error: "TooManyOptions" }
    } else {
      val opts = options.foldl([], (res, opt) => res.append((opt, 0)))

      val poll = {
        creator: info.sender,
        question: question,
        options: opts
      }
      
      // CosmWasm: POLLS.save(deps.storage, poll_id, &poll)?;
      { cs: { ...cs, polls: cs.polls.put(poll_id, poll) }, error: "" }
    }
  }

  // 10 - Execute 2
  // https://github.com/Callum-A/cosmwasm-zero-to-hero/tree/main/10%20-%20Execute%202

  pure def execute_vote(cs: ContractState, info: MessageInfo, poll_id: UUID,
                   vote: str): Result = {
    // CosmWasm: POLLS.may_load(deps.storage, poll_id.clone())?;
    if (not(cs.polls.keys().contains(poll_id))) {
      // no such poll
      { cs: cs, error: "Unauthorized" }
    } else {
      val poll = cs.polls.get(poll_id)
      val _key = (info.sender, poll_id)

      val updated = if (not(cs.ballots.keys().contains(_key))) {
        // sender hasn't voted on this poll; simply add the ballot
        (poll.options, cs.ballots.put(_key, { option: vote }))
      } else {
        // sender already voted on the poll; adjust vote count for removing their old vote
        val ballot = cs.ballots.get(_key)
        val optionsDecr = poll.options.foldl([], (res, opt) => {
          // FIXME: in the original, this only adjusts the _first_ option in the list
          if (opt._1 == ballot.option) res.append((opt._1, opt._2 - 1)) else res.append(opt)
        })
        // update the ballot
        (optionsDecr, cs.ballots.set(_key, { option: vote }))
      }

      val (updated_options, updated_ballots) = updated

      if (length(updated_options.select(opt => opt._1 == vote)) == 0) {
        { cs: cs, error: "Unauthorized" }
      } else {
        val optionsIncr = updated_options.foldl([], (res, opt) => {
          val (name, count) = opt
          // FIXME: in the original, this only adjusts the _first_ option in the list
          if (name == vote) res.append((name, count + 1)) else res.append((name, count))
        })
        { cs: { ...cs, ballots: updated_ballots, polls: cs.polls.set(poll_id, { ...poll, options: optionsIncr }) }, error: ""}
      }
    }
  }

  // 13 - Query
  // https://github.com/Callum-A/cosmwasm-zero-to-hero/tree/main/13%20-%20Query

  pure def query_all_polls(cs: ContractState): AllPollsResponse = {
    val polls = cs.polls.keys().fold([], (res, poll_id) =>
                                    res.append(cs.polls.get(poll_id)))
    { polls: polls }
  }

  pure def query_poll(cs: ContractState, poll_id: UUID): PollResponse = {
    val poll = cs.polls.keys().fold([], (res, pid) => {
      if (pid == poll_id) res.append(cs.polls.get(poll_id)) else res
    })
    { poll: poll }
  }

  pure def query_vote(cs: ContractState, address: Addr, poll_id: UUID): VoteResponse = {
    val _key = (address, poll_id)
    val vote = if (cs.ballots.keys().contains(_key)) {
      [ cs.ballots.get(_key) ]
    } else {
      []
    }
    { vote: vote }
  }
}

/*** Tests ***/

module tests {
  import vote.*

  // 07 - Instantiate Test
  // https://github.com/Callum-A/cosmwasm-zero-to-hero/tree/main/07%20-%20Instantiate%20Test

  pure val ADDR1: Addr = "addr1"
  pure val ADDR2: Addr = "addr2"

  // To run:
  // quint test --main=tests --match=test_ vote.qnt
  run test_instantiate = {
    val _cs_init = { config: { admin: "__UNINIT__" }, polls: Map(), ballots: Map() }
    val info = { sender: ADDR1 }
    val msg_inst = { admin: None }
    val res = instantiate(_cs_init, info, msg_inst)
    assert(res.config.admin == ADDR1)
  }

  // 11 - Execute Tests
  // https://github.com/Callum-A/cosmwasm-zero-to-hero/tree/main/11%20-%20Execute%20Tests

  run test_execute_create_poll_valid = {
    val _cs_init = { config: { admin: "__UNINIT__" }, polls: Map(), ballots: Map() }
    val info = { sender: ADDR1 }
    // Instantiate the contract
    val msg_inst = { admin: None }
    val _res_inst = instantiate(_cs_init, info, msg_inst)

    // New execute msg
    val msg_create = {
        poll_id: "some_id",
        question: "What's your favourite Cosmos coin?",
        options: [ "Cosmos Hub", "Juno", "Osmosis" ]
    }

    val _res_create = execute_create_poll(_res_inst, info, msg_create.poll_id,
                                          msg_create.question, msg_create.options)
    assert(_res_create.error == "")
  }

  run test_execute_create_poll_invalid = {
    val _cs_init = { config: { admin: "__UNINIT__" }, polls: Map(), ballots: Map() }
    val info = { sender: ADDR1 }
    // Instantiate the contract
    val msg_inst = { admin: None }
    val _res_inst = instantiate(_cs_init, info, msg_inst)

    val msg_create = {
        poll_id: "some_id",
        question: "What's your favourite Cosmos coin?",
        options: [ "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11" ]
    }
    val _res_create = execute_create_poll(_res_inst, info, msg_create.poll_id,
                                          msg_create.question, msg_create.options)
    assert(_res_create.error != "")
  }

  run test_execute_vote_valid = {
    val _cs_init = { config: { admin: "__UNINIT__" }, polls: Map(), ballots: Map() }
    val info = { sender: ADDR1 }
    // Instantiate the contract
    val msg_inst = { admin: None }
    val _res_inst = instantiate(_cs_init, info, msg_inst)

    // Create the poll
    val msg_create = {
        poll_id: "some_id",
        question: "What's your favourite Cosmos coin?",
        options: [ "Cosmos Hub", "Juno", "Osmosis" ]
    }
    val _res_create = execute_create_poll(_res_inst, info, msg_create.poll_id,
                                          msg_create.question, msg_create.options)

    // Create the vote, first time voting
    val msg1 = { poll_id: "some_id", vote: "Juno" }
    val _res_vote1 = execute_vote(_res_create.cs, info, msg1.poll_id, msg1.vote)

    // Change the vote
    val msg2 = { poll_id: "some_id", vote: "Osmosis" }
    val _res_vote2 = execute_vote(_res_vote1.cs, info, msg2.poll_id, msg2.vote)

    all {
      assert(_res_vote1.error == ""),
      assert(_res_vote2.error == "")
    }
  }

  run test_execute_vote_invalid = {
    val _cs_init = { config: { admin: "__UNINIT__" }, polls: Map(), ballots: Map() }
    val info = { sender: ADDR1 }
    // Instantiate the contract
    val msg_inst = { admin: None }
    val _res_inst = instantiate(_cs_init, info, msg_inst)

    // Create the poll
    val msg_create = {
        poll_id: "some_id",
        question: "What's your favourite Cosmos coin?",
        options: [ "Cosmos Hub", "Juno", "Osmosis" ]
    }
    val _res_create = execute_create_poll(_res_inst, info, msg_create.poll_id,
                                          msg_create.question, msg_create.options)


    // Vote on a now existing poll but the option "DVPN" does not exist
    val msg = { poll_id: "some_id", vote: "DVPN" }
    val _res = execute_vote(_res_create.cs, info, msg.poll_id, msg.vote)
    assert(_res.error != "")
  }

  // 14 - Query Tests
  // https://github.com/Callum-A/cosmwasm-zero-to-hero/tree/main/14%20-%20Query%20Tests

  run test_query_all_polls = {
    val _cs_init = { config: { admin: "__UNINIT__" }, polls: Map(), ballots: Map() }
    val info = { sender: ADDR1 }
    // Instantiate the contract
    val msg_inst = { admin: None }
    val _res_inst = instantiate(_cs_init, info, msg_inst)

    // Create a poll
    val msg_create = {
        poll_id: "some_id_1",
        question: "What's your favourite Cosmos coin?",
        options: [ "Cosmos Hub", "Juno", "Osmosis" ]
    }
    val _res_create = execute_create_poll(_res_inst, info, msg_create.poll_id,
                                          msg_create.question, msg_create.options)

    // Create a second poll
    val msg_create2 = {
      poll_id: "some_id_2",
      question: "What's your colour?",
      options: [ "Red", "Green", "Blue" ]
    }
    val _res_create2 = execute_create_poll(_res_create.cs, info, msg_create2.poll_id,
                                           msg_create2.question, msg_create2.options)

    // Query
    val res = query_all_polls(_res_create2.cs)
    assert(res.polls.length() == 2)
  }

  run test_query_poll = {
    val _cs_init = { config: { admin: "__UNINIT__" }, polls: Map(), ballots: Map() }
    val info = { sender: ADDR1 }
    // Instantiate the contract
    val msg_inst = { admin: None }
    val _res_inst = instantiate(_cs_init, info, msg_inst)

    // Create a poll
    val msg_create = {
        poll_id: "some_id_1",
        question: "What's your favourite Cosmos coin?",
        options: [ "Cosmos Hub", "Juno", "Osmosis" ]
    }
    val _res_create = execute_create_poll(_res_inst, info, msg_create.poll_id,
                                          msg_create.question, msg_create.options)

    // Query for the poll that exists
    val msg1 = { poll_id: "some_id_1" }
    val res1 = query_poll(_res_create.cs, msg1.poll_id)

    // Query for the poll that does not exists
    val msg2 = { poll_id: "some_id_not_exist" }
    val res2 = query_poll(_res_create.cs, msg2.poll_id)

    all {
      // Expect a poll
      assert(res1.poll.length() == 1),
      // Expect none
      assert(res2.poll.length() == 0)
    }
  }

  run test_query_vote = {
    val _cs_init = { config: { admin: "__UNINIT__" }, polls: Map(), ballots: Map() }
    val info = { sender: ADDR1 }
    val msg_inst = { admin: None }
    val _res_inst = instantiate(_cs_init, info, msg_inst)

    // Create a poll
    val msg_create = {
        poll_id: "some_id_1",
        question: "What's your favourite Cosmos coin?",
        options: [ "Cosmos Hub", "Juno", "Osmosis" ]
    }
    val _res_create = execute_create_poll(_res_inst, info, msg_create.poll_id,
                                          msg_create.question, msg_create.options)

    // Create a vote, first time voting
    val msg_vote = { poll_id: "some_id_1", vote: "Juno" }
    val _res_vote = execute_vote(_res_create.cs, info, msg_vote.poll_id, msg_vote.vote)

    // Query for a vote that exists
    val msg1 = { poll_id: "some_id_1", address: ADDR1 }
    val res1 = query_vote(_res_vote.cs, msg1.address, msg1.poll_id)

    // Query for a vote that does not exists
    val msg2 = { poll_id: "some_id_2", address: ADDR2 }
    val res2 = query_vote(_res_vote.cs, msg2.address, msg2.poll_id)

    all {
      // Expect the vote to exist
      assert(res1.vote.length() == 1),
      // Expect the vote to not exist
      assert(res2.vote.length() == 0)
    }
  }
}

/*** State machine ***/

module state {
  import vote.*

  var state: ContractState

  pure val ADMIN: Addr = "admin"
  pure val USER_ADDR = Set("alice", "bob", "charlie", "eve")
  pure val ALL_ADDR = USER_ADDR.union(Set(ADMIN))
  pure val OPTIONS = Set("o1", "o2", "o3")

  action init = {
    val pre_init_state = { config: { admin: None }, polls: Map(), ballots: Map() }
    val info = { sender: ADMIN }
    val msg_inst = { admin: ADMIN }
    state' = instantiate(pre_init_state, info, msg_inst)
  }

  action exec_create_poll(sender: Addr, poll_id: str, question: str, options: List[str]): bool = {
    val info = { sender: sender }
    val res = execute_create_poll(state, info, poll_id, question, options)
    all {
      res.error == "",
      state' = res.cs
    }
  }

  action exec_vote(sender: Addr, poll_id: UUID, vote: str): bool = {
    val info = { sender: sender }
    val res = execute_vote(state, info, poll_id, vote)
    all {
      res.error == "",
      state' = res.cs
    }
  }

  action step = {
    nondet sender = ALL_ADDR.oneOf()
    nondet poll_id = Set("p1", "p2", "p3", "p4").oneOf()
    any {
      nondet question = Set("q1", "q2", "q3", "q4").oneOf()
      nondet options = OPTIONS.powerset().oneOf()
      val optionsL = options.fold([], (s, o) => s.append(o))
      exec_create_poll(sender, poll_id, question, optionsL),

      nondet option = OPTIONS.oneOf()
      exec_vote(sender, poll_id, option)
    }
  }

  // Invariant: An admin is always set in the contract's config.
  //
  // To check:
  // quint run --main=state --invariant=alwaysAdmin vote.qnt
  val alwaysAdmin = state.config.admin != None

  // Return true iff `pred(e)` is true for all elements `e` of `list`.
  pure def listForall(list: List[a], pred: a => bool): bool = {
    list.foldl(true, (b, elem) => { if (pred(elem)) b else false })
  }

  // FIXME(#1042): work around binding issue
  pure def listForall2(list: List[a], pred: a => bool): bool = {
    list.foldl(true, (b, elem) => { if (pred(elem)) b else false })
  }

  // Invariant: The ballots in `ballots` sum up to the aggregated votes in
  //            `polls[id].options`.
  //
  // To check:
  // quint run --main=state --invariant=invBallotsMatchPolls vote.qnt
  //
  // Note: This invariant DOES NOT hold in the current implementation / spec.
  //       Can you guess why?
  //       [`execute_vote` allows to replace a poll in `polls` without nuking
  //        already submitted ballots in `ballots`.]
  val invBallotsMatchPolls = {
    state.polls.keys().forall(poll_id =>
      // sum the votes in `ballots` into a map `question -> num_votes`:
      val affected_ballot_keys = state.ballots.keys().filter(k => k._2 == poll_id)
      val summed_ballots = affected_ballot_keys.fold(Map(), (m, k) =>
        val option = state.ballots.get(k).option
        if(m.keys().contains(option)) {
          m.setBy(option, old => old + 1)
        } else {
          m.put(option, 1)
        }
      )
      // assert that aggregated sum in `polls[poll_id]` equals the sum from above
      val poll = state.polls.get(poll_id)
      poll.options.listForall(((optionKey, optionSum)) =>
        // `ballots` only contains entries if there are > 0 votes.
        optionSum > 0 implies and {
          summed_ballots.keys().contains(optionKey),
          summed_ballots.get(optionKey) == optionSum
        }
      )
    )
  }

  // Invariant: The aggregated votes for all options of all polls are greater 0.
  //
  // To check:
  // quint run --main=state --invariant=invAllBallotsPositive vote.qnt
  //
  // Note: This invariant DOES NOT hold in the current implementation / spec.
  //       Can you guess why?
  //       [`execute_vote` allows to replace a poll in `polls` without nuking
  //        already submitted ballots in `ballots`, but `execute_vote` adjusts
  //        the sum differently based on whether such a ballot is present.]
  val invAllBallotsPositive = query_all_polls(state).polls.listForall(poll =>
                                poll.options.listForall2(opt => opt._2 >= 0))
}
