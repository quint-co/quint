module bankTest {
  import bank.* from "./bank"

  // the state of the machine that tests the logic
  // Total supply of coins per denomination
  var Supply: Denom -> Int256
  // Balances for each address
  var Balances: Addr -> Coins

  // protocol invariants
  // sum up amounts over all balances for a given denomination
  def SumForDenom(denom: Denom): Int256 = {
    Balances.keys().fold(0, (sum, addr) => {
      val coins = Balances.get(addr)
      if (denom.in(coins.keys())) {
        sum + coins.get(denom)
      } else {
        sum
      }
    })
  }

  // The total Supply of the network is equal to the sum of all coins from the account
  val TotalSupplyInv = {
    Supply.keys().forall(denom => (SumForDenom(denom) == Supply.get(denom)))
  }
}
