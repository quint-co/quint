// -*- mode: Bluespec; -*-
/**
 * A simple example of a Ponzi scheme, inspired by the Solidity contract [1].
 * Do not use it in production! The purpose of this example is to show how to
 * specify and check interesting safety and liveness properties with Quint.
 *
 * [1]: https://github.com/djokicx/sol-simple-ponzi/blob/12474f468f4823a39276cac5ef7185b349f5c907/contracts/SimplePonzi.sol
 *
 * Igor Konnov, Informal Systems, 2023
 */
module simplePonzi {
  // addresses are string literals
  type Addr = str

  // the set of addresses is not fixed, see simplePonziTest below
  const ADDR: Set[Addr]

  // a state of the EVM that is observed/modified by the contract
  type EvmState = {
    // the account balances for every address
    balances: Addr -> int
  }

  // a state of the contract
  type PonziState = {
   // the address of the last investor, initially of the contract owner
    currentInvestor: Addr,
    // the investment made by the current investor
    currentInvestment: int,
  }

  // create a new instance of the contract
  pure def newPonzi(owner: Addr): PonziState = {
    currentInvestor: owner, currentInvestment: 0
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

  // Receive an investment and distribute the rewards (to the previous investor).
  pure def receive(evm: EvmState,
      ponzi: PonziState, investor: Addr, amount: int): Result = {
    if (amount > evm.balances.get(investor)) {
      error: "Insufficient funds",
      evm: evm,
      ponzi: ponzi,
     } else if (amount < 11 * ponzi.currentInvestment / 10) {
      error: "New investment must be 110% of the last one",
      evm: evm,
      ponzi: ponzi,
    } else
      pure val newBalances =
        evm.balances
          .setBy(investor, old => old - amount)
          .setBy(ponzi.currentInvestor, old => old + amount)
      {
        evm: { balances: newBalances },
        ponzi: { currentInvestor: investor, currentInvestment: amount },
        error: "",
      }
  }
}

// An instance of simplePonzi intended for testing.
// In this module, we wire our system and test a state machine.
module simplePonziTest {
  pure val addr = Set("alice", "bob", "charlie", "eve")

  import simplePonzi(ADDR = addr) as I

  export I.*

  var evmState: EvmState
  var ponziState: PonziState

  // initialize the state machine
  action init = all {
    // every account has 10000 tokens initially
    evmState' = { balances: addr.mapBy(a => 10000) },
    // alice creates a single Ponzi contract
    ponziState' = newPonzi("alice"),
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

  // Make a single step by the state machine.
  // This specification is so simple that we have only one possible action.
  action step = {
    nondet investor = oneOf(addr)
    // choose the amount, picking some deltas for corner cases
    nondet amount = (-10).to(evmState.balances.get(investor) + 10).oneOf()
    onReceive(investor, amount)
  }

  // A simple test to confirm our intuition.
  // Run in by hand in REPL, or with `quint test`:
  //
  // $ quint test --main=simplePonziTest simplePonzi.qnt
  run happyPathTest = {
    init
      .then(onReceive("bob", 100))
      .then(onReceive("eve", 110))
      .then(onReceive("alice", 121))
      .then(all {
        assert(ponziState.currentInvestor == "alice"),
        assert(ponziState.currentInvestment == 121),
        assert(evmState.balances.get("alice") == 9979),
        assert(evmState.balances.get("eve") == 10011),
        evmState' = evmState,
        ponziState' = ponziState,
      })
  }

  // a simple test to see that smaller investments are not allowed
  run unhappyPathTest = {
    init
      .then(onReceive("bob", 100))
      .then(onReceive("eve", 105))
      .fail()
  }

  // Check this invariant to make sure that no account goes negative:
  //
  // $ quint run --invariant=noNegativeInv --main=simplePonziTest simplePonzi.qnt
  //
  // By looking at the code, do you think noNegativeInv holds true?
  val noNegativeInv = {
    addr.forall(a => evmState.balances.get(a) >= 0)
  }

  // The property every Ponzi schemer believes should hold true:
  // There will be always another person who invests more into the game.
  //
  // Check this invariant and read a counterexample:
  //
  // $ quint run --invariant=progressInv --main=simplePonziTest simplePonzi.qnt
  val progressInv = {
    addr.exists(someone =>
      val newAmount = (11 * ponziState.currentInvestment / 10) + 1
      receive(evmState, ponziState, someone, newAmount).error == ""
    )
  }
}