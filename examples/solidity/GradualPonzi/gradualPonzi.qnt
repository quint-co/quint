// -*- mode: Bluespec; -*-
/**
 * A more elaborate example of a Ponzi scheme, inspired by the Solidity contract [2].
 * Do not use it in production! The purpose of this example is to show how to
 * specify and check interesting safety and liveness properties with Quint.
 *
 * [1]: https://github.com/djokicx/sol-simple-ponzi/blob/12474f468f4823a39276cac5ef7185b349f5c907/contracts/GradualPonzi.sol
 *
 * Igor Konnov, Informal Systems, 2023
 */
module gradualPonzi {
  pure val MINIMUM_INVESTMENT = 10^15

  // addresses are string literals
  type Addr = str

  // the set of addresses is not fixed, see gradualPonziTest below
  const ADDR: Set[Addr]

  // a state of the EVM that is observed/modified by the contract
  type EvmState = {
    // the account balances for every address
    balances: Addr -> int
  }

  // a state of the contract
  type PonziState = {
    // the address of the contract
    contract: Addr,
    // the address of all previous investors, potentially, with duplicates
    investors: List[Addr],
    // rewards distributed so far
    rewards: Addr -> int,
  }

  // create a new instance of the contract
  pure def newPonzi(sender: Addr, contract: Addr): PonziState = {
    contract: contract,
    investors: [ sender ],
    rewards: ADDR.mapBy(a => 0),
  }

  // The result of applying a method.
  // If error != "", then the states are not modified,
  // and error contains the error message.
  // Otherwise, evm and ponzi contain the new states.
  type Result = {
    error: str,
    evm: EvmState,
    ponzi: PonziState,
  }

  // Receive an investment and save the rewards (to the previous investors).
  pure def receive(evm: EvmState,
      ponzi: PonziState, investor: Addr, amount: int): Result = {
    if (amount > evm.balances.get(investor)) {
      error: "Insufficient funds",
      evm: evm,
      ponzi: ponzi,
     } else if (amount < MINIMUM_INVESTMENT) {
      error: "Investment below minimum",
      evm: evm,
      ponzi: ponzi,
    } else {
      pure val investorCut = amount / length(ponzi.investors)
      // Solidity:
      // for(uint i = 0; i < investors.length; i++) {
      //   balances[investors[i]] += investorCut;
      // }
      pure val newRewards =
        ponzi.investors.foldl(ponzi.rewards,
          (rewrds, a) => rewrds.setBy(a, oldAmount => oldAmount + investorCut)
        )
      pure val newBalances =
        evm.balances
          .setBy(investor, old => old - amount)
          .setBy(ponzi.contract, old => old + amount)
      {
        evm: { balances: newBalances },
        ponzi: {
          ...ponzi,
          investors: ponzi.investors.append(investor),
          rewards: newRewards,
        },
        error: "",
      }
    }
  }

  // an invester may withdraw their rewards
  pure def withdraw(evm: EvmState, ponzi: PonziState, sender: Addr): Result = {
    pure val reward = ponzi.rewards.get(sender)
    pure val newBalances =
      evm.balances
        .setBy(sender, old => old + reward)
        .setBy(ponzi.contract, old => old - reward)
    // the Solidity contract uses: msg.sender.transfer(payout)
    {
      evm: { balances: newBalances },
      ponzi: { ...ponzi, rewards: ponzi.rewards.set(sender, 0) },
      error: "",
    }
  }
}

// An instance of gradualPonzi intended for testing.
// In this module, we wire our system and test a state machine.
module gradualPonziTest {
  // user addresses
  pure val userAddr = Set("alice", "bob", "charlie", "eve")
  // all addresses, including the contracts
  pure val addr = userAddr.union(Set("contract"))

  import gradualPonzi(ADDR = addr).*

  var evmState: EvmState
  var ponziState: PonziState

  // initialize the state machine
  action init = all {
    // every account has 100 units of MINIMUM_INVESTMENT
    evmState' = {
      balances: addr.mapBy(a =>
        if (not(a.in(userAddr))) 0 else 100 * MINIMUM_INVESTMENT
      )
    },
    // alice creates a single Ponzi contract
    ponziState' = newPonzi("alice", "contract"),
  }

  // When investor is sending amount tokens.
  // This action succeeds and updates the state of the state machine,
  // only if no error is returned.
  action onReceive(investor: Addr, amount: int): bool = {
    val result = receive(evmState, ponziState, investor, amount)
    val { error, evm, ponzi } = result
    all {
      error == "",
      evmState' = evm,
      ponziState' = ponzi,
    }
  }

  // An investor may withdraw the rewards any time.
  action onWithdraw(investor: Addr): bool = {
    val result = withdraw(evmState, ponziState, investor)
    val { error, evm, ponzi } = result
    all {
      error == "",
      evmState' = evm,
      ponziState' = ponzi,
    }
  }

  // Make a single step by the state machine.
  // We have two actions: onReceive and onWithdraw.
  action step = {
    nondet investor = oneOf(addr.exclude(Set("contract")))
    any {
      // choose the amount, picking some deltas for corner cases
      nondet amount = (-10).to(evmState.balances.get(investor) + 10).oneOf()
      onReceive(investor, amount),
      // or simply withdraw
      onWithdraw(investor),
    }
 }

  // A simple test to confirm our intuition.
  // Run in by hand in REPL, or with `quint test`:
  //
  // $ quint test --main=gradualPonziTest gradualPonzi.qnt
  run happyPathTest = {
    init
      .then(onReceive("bob", 10 * MINIMUM_INVESTMENT))
      .then(onReceive("eve", 2 * MINIMUM_INVESTMENT))
      .then(onReceive("alice", 3 * MINIMUM_INVESTMENT))
      .then(all {
        assert(ponziState.investors == [ "alice", "bob", "eve", "alice" ]),
        assert(ponziState.rewards.get("alice") == 12 * MINIMUM_INVESTMENT),
        evmState' = evmState,
        ponziState' = ponziState,
      })
      .then(onWithdraw("alice"))
      .then(all {
        assert(evmState.balances.get("alice") == (100 - 3 + 12) * MINIMUM_INVESTMENT),
        evmState' = evmState,
        ponziState' = ponziState,
      })
   }

  // a simple test to see that smaller investments are not allowed
  run unhappyPathTest = {
    init
      .then(onReceive("bob", MINIMUM_INVESTMENT))
      .then(onReceive("eve", MINIMUM_INVESTMENT - 1))
      .fail()
  }

  // Check this invariant to make sure that no account goes negative:
  //
  // $ quint run --invariant=noNegativeInv --main=gradualPonziTest gradualPonzi.qnt
  //
  // By looking at the code, do you think noNegativeInv holds true?
  val noNegativeInv = {
    addr.forall(a => evmState.balances.get(a) >= 0)
  }

  // Nobody goes broke in this scheme. Is not that what every Ponzi schemer believes?
  val noBrokeInv = {
    userAddr.forall(a => evmState.balances.get(a) + ponziState.rewards.get(a) > 0)
  }

  // It's hard to find a counterexample to noBrokeInv with the simulator,
  // though the model checker should trivially find it.
  // Set MINIMUM_INVESTMENT to 1 and run the simulator again. It should find an example.
  // Here is a manually constructed example.
  run brokeTest = {
    init
      .then(onReceive("bob", evmState.balances.get("bob")))
      .then(all {
        assert(not(noBrokeInv)),
        evmState' = evmState,
        ponziState' = ponziState,
      })
  }

  // The property every Ponzi schemer believes should hold true:
  // There will be always another person who invests more into the game.
  //
  // Check this invariant and inspect an example execution:
  //
  // $ quint run --invariant=progressInv --main=gradualPonziTest gradualPonzi.qnt
  //
  // If quint has not reported a violation, try:
  //
  // $ quint run --invariant=progressInv --main=gradualPonziTest --max-steps=50 --seed=0x8272b36d6a57f gradualPonzi.qnt
  //
  // It is quite hard for `quint run` to find a violation to this property.
  // In contrast, `quint verify` finds it in a few seconds.
  val progressInv = {
    userAddr.exists(someone =>
      receive(evmState, ponziState, someone, MINIMUM_INVESTMENT).error == ""
    )
  }

  /* EXERCISE: add gas fees on every action.
     Think about progressInv. Does it still hold true? */


  // There should be no left over tokens on the contract balance.
  //
  // This invariant is violated due to rounding errors:
  // $ quint run --invariant=noLeftoversInv --main=gradualPonziTest gradualPonzi.qnt
  val noLeftoversInv = {
    val sumRewards = addr.fold(0, (s, a) => s + ponziState.rewards.get(a))
    sumRewards == evmState.balances.get("contract")
  }
}
