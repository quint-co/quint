// -*- mode: Bluespec; -*-
module bankTest {
  import bank.* from "./bank"

  // the state of the machine that tests the logic
  // Total supply of coins per denomination
  var supply: Denom -> Int256
  // Balances for each address
  var balances: Addr -> Coins
  // if non-empty, then it stores the last error message
  var _lastError: str
  // all addresses we would like to work with
  pure val ADDR = Set("king", "donkeykong", "peaches", "mario")
  // all denominations
  pure val DENOM = Set("banana", "burger")

  // state transitions of the machine
  // initialize the state machine
  action init = all {
    // limit the total supply of burgers and bananas to 10_000
    supply' = Set("banana", "burger").mapBy(d => 10_000),
    // the king has it all
    balances' = Map("king" -> Set("banana", "burger").mapBy(d => 10_000)),
    _lastError' = "",
  }

  action send(fromAddr: Addr, toAddr: Addr, coins: Coins): bool = all {
    val ctx = stateToCtx(0)
    val result = SendKeeper::SendCoins(ctx, fromAddr, toAddr, coins)
    match result {
      | BankOk(newCtx) => all {
        balances' = newCtx.balances,
        supply' = supply,
        _lastError' = "",
      }
      | BankErr(msg) => all {
        // We could simply return 'false' here.
        // But we prefer to store the error message instead.
        _lastError' = msg,
        balances' = balances,
        supply' = supply,
      }
    }
  }

  action step = any {
    nondet fromAddr = oneOf(ADDR)
    nondet toAddr = oneOf(ADDR)
    nondet denom = oneOf(DENOM)
    nondet amt = (-10).to(supply.get(denom)).oneOf()
    send(fromAddr, toAddr, Set(denom).mapBy(d => amt))
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
      .expect(
        val ctx = stateToCtx(0)
        val kings = ViewKeeper::GetAllBalances(ctx, "king")
        val donkeys = ViewKeeper::GetAllBalances(ctx, "donkeykong")
        and {
          assert(kings.keys() == Set("banana", "burger")),
          assert(kings.get("banana") == 10_000),
          assert(kings.get("burger") == 10_000),
          assert(donkeys.keys() == Set()),
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

  run sendTest = {
    init
      // the King has bananas and he can send it
      .then(send("king",
                 "donkeykong",
                 Map("banana" -> 2_000)))
      .expect(and {
        balances.get("king").get("banana") == 8_000,
        balances.get("donkeykong").get("banana") == 2_000,
        balances.get("king").get("burger") == 10_000,
        balances.get("donkeykong").keys() == Set("banana"),
      })
      // Donkeykong does not have any burgers, so this action must fail
      .then(send("donkeykong", "peaches", Set("burger").mapBy(d => 1_000)))
      .expect(_lastError == "invalid coins or insufficient funds")
  }
}
