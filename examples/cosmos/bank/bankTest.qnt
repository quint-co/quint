module bankTest {
  import bank.* from "./bank"

  // the state of the machine that tests the logic
  // Total supply of coins per denomination
  var supply: Denom -> Int256
  // Balances for each address
  var balances: Addr -> Coins

  // state transitions of the machine
  // initialize the state machine
  action init = all {
    // limit the total supply of burgers and bananas to 10_000
    supply' = Set("banana", "burger").mapBy(d => 10_000),
    // the king has it all
    balances' = Set("king").mapBy(a => Set("banana", "burger").mapBy(d => 10_000))
  }

  // protocol invariants
  // sum up amounts over all balances for a given denomination
  def sumForDenom(denom: Denom): Int256 = {
    balances.keys().fold(0, (sum, addr) => {
      val coins = balances.get(addr)
      if (denom.in(coins.keys())) {
        sum + coins.get(denom)
      } else {
        sum
      }
    })
  }

  // The total Supply of the network is equal to the sum of all coins from the account
  val totalSupplyInv = {
    supply.keys().forall(denom => (sumForDenom(denom) == supply.get(denom)))
  }

  // tests
  run getAllBalancesTest = {
    init
      .then(
        val ctx = stateToCtx(0)
        val kings = ViewKeeper::GetAllBalances(ctx, "king")
        val donkeys = ViewKeeper::GetAllBalances(ctx, "donkeykong")
        all {
          assert(kings.keys() == Set("banana", "burger")),
          assert(kings.get("banana") == 10_000),
          assert(kings.get("burger") == 10_000),
          assert(donkeys.keys() == Set()),
          // do not change the state
          balances' = balances,
          supply' = supply,
        }
      )
  }

  // a helper operator that produces a context from a state
  def stateToCtx(time: int): BankCtx = {
    {
      blockTime: time,
      accounts: balances.keys(),
      balances: balances,
      params: {
        sendEnabled: Set(),
        defaultSendEnabled: true
      }
    }
  }
}
