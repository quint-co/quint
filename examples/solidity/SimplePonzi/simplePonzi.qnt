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

// an instance of simplePonzi intended for testing
module simplePonziTest {
  pure val addr = Set("alice", "bob", "charlie", "eve")
  pure val genesis_coins = addr.mapBy(a => if (a == "alice") 10000 else 0)

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

  // make a single step by the state machine
  action step = {
    nondet investor = addr.oneOf()
    // choose the amount, picking some deltas for corner cases
    nondet amount = (-10).to(evmState.balances.get(investor) + 10).oneOf()
    val result = receive(evmState, ponziState, investor, amount)
    all {
      result.error == "",
      evmState' = result.evm,
      ponziState' = result.ponzi,
    }
  }

  // Check this invariant to make sure that no account goes negative.
  // By looking at the code, do you think noNegativeInv holds true?
  val noNegativeInv = {
    addr.forall(a => evmState.balances.get(a) >= 0)
  }
}