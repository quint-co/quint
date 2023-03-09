// An executable specification of the bank module
module bank {
  // TYPES
  // Addresses are just strings.
  type Addr = str
  // Denominations are simply strings.
  type Denom = str
  // The module operates over 64-bit and 256-bit integers.
  type Int64 = int
  type Int256 = int

  // the maximum value for Int256 in Golang
  pure val MAX_INT256 = 2^256 - 1

  // A coin is a record that contains a denomination and an amount
  type Coin = { denom: Denom, amount: Int256 }
  // Coins is a map from denominations to amounts.
  type Coins = Denom -> Int256
  // Account balances
  type Balance = { address: Addr, coins: Coins }
  // An input of a multiparty transfer
  type Input = {
    address: str,
    coins: Coins,
  }
  // An input of a multiparty transfer
  type Output = Input
  // the portion of the context that is accessed by the bank module
  type BankCtx = {
    // block time (needed by vesting accounts)
    blockTime: Int64,
    // accessed via AccountKeeper
    accounts: Set[Addr],
    // the balances are the essential part of the bank module
    balances: Addr -> Coins,
    // module parameters
    params: Params,
  }

  // Parameters of the bank module
  type Params = {
    // whether coin send is enabled for specific denominations
    sendEnabled: Set[{ denom: str, enabled: bool }],
    // whether coin send is enabled by default
    defaultSendEnabled: bool,
  }

  // FUNCTIONAL LAYER, e.g., keepers
  pure def ViewKeeper::GetAllBalances(ctx: BankCtx, addr: Addr): Coins = {
    if (ctx.balances.keys().contains(addr)) {
      ctx.balances.get(addr)
    } else {
      Map()
    }
  }
  pure def ViewKeeper::ValidateBalance(ctx: BankCtx, addr: Addr): bool = and {
    ctx.accounts.contains(addr),
    val coins = ViewKeeper::GetAllBalances(ctx, addr)
    // Implementation: Coins.IsValid also validates denominations
    coins.keys().forall(denom => coins.get(denom) > 0),
    // TODO: add validation logic for the vesting accounts
  }
  pure def ViewKeeper::GetBalance(ctx: BankCtx, addr: Addr, denom: str): Coin = {
    if (ctx.balances.keys().contains(addr)) {
      val accountBal = ctx.balances.get(addr)
      if (accountBal.contains(denom)) {
        { denom: denom, amount: accountBal.get(denom) }
      } else {
        // Implementation: panic here?
        { denom: denom, amount: 0 }
      }
    } else {
      // Implementation: panic here?
      { denom: denom, amount: 0 }
    }
  }
  pure def ViewKeeper::HasBalance(ctx: BankCtx, addr: Addr, coin: Coin): bool = {
    // Implementation: panic if the address or denomination are not stored?
    ViewKeeper::GetBalance(ctx, addr, coin.denom).amount >= coin.amount
  }
  pure def ViewKeeper::GetAccountsBalances(ctx: BankCtx): Set[Balance] = {
    ctx.balances.keys().map(a => { address: a, coins: ctx.balances.get(a) })
  }

  pure def SendKeeper::SendCoins(ctx: BankCtx,
      fromAddr: Addr, toAddr: Addr, amt: Coins): (bool, BankCtx) = {
    // Implementation: if Coins are constructed with NewCoins, they must be positive.
    // However, if they are constructed some other way, there is no precondition.
    // TODO: checking LockedCoins that deal with vested coins.
    // Safely subtract the coins from fromAddr and add them to toAddr.
    val fromCoins = ViewKeeper::GetAllBalances(ctx, fromAddr)
    if (amt.keys().exists(d =>
        not(d.in(fromCoins.keys())) or fromCoins.get(d) < amt.get(d))) {
      // some denominations do not exist on fromAddr, or there is not enough funds
      (false, ctx)
    } else {
      // x/bank invariants prohibit persistence of zero balances
      // clean zero balances
      def getOr0(coins: Coins, d: str): int = if (d.in(coins.keys())) coins.get(d) else 0
      val positiveDenoms = fromCoins.keys().filter(d => fromCoins.get(d) > getOr0(amt, d))
      val subCoins = positiveDenoms.mapBy(d => fromCoins.get(d) - getOr0(amt, d))
      // add coins to toAddr: the tricky part is that the denominations may differ
      val toCoins = ViewKeeper::GetAllBalances(ctx, toAddr)
      // extend the toCoins and amt with zeroes over the joint denominations
      val jointDenoms = toCoins.keys().union(amt.keys())
      // since toCoins and amt held positive values, their sums must be positive too
      val addCoins = jointDenoms.mapBy(d => getOr0(toCoins, d) + getOr0(amt, d))
      if (addCoins.keys().exists(d => addCoins.get(d) > MAX_INT256)) {
        // Implementation: panic!
        (false, ctx)
      } else {
        // add toAddr to the accounts, if it did not exist
        val newAccounts = ctx.accounts.union(Set(toAddr))
        val newBalances =
          if (fromAddr == toAddr) {
            ctx.balances
          } else {
            // Update the balance of fromAddr with subCoins.
            val newBalancesSub = ctx.balances.set(fromAddr, subCoins)
            // Since toAddr may be a new account, extend the map, if needed
            newBalancesSub.put(toAddr, addCoins)
          }
        // succeed with a new balance
        (true, ctx.with("balances", newBalances).with("accounts", newAccounts))
      }
    }
  }
  pure def SendKeeper::GetParams(ctx: BankCtx): Params = ctx.params
  pure def SendKeeper::SetParams(ctx: BankCtx, params: Params): BankCtx = {
    ctx.with("params", params)
  }
  pure def SendKeeper::IsSendEnabledCoin(ctx: BankCtx, coin: Coin): bool = {
    val found = ctx.params.sendEnabled.filter(p => coin.denom == p.denom)
    if (found != Set()) {
      found.exists(p => p.enabled)
    } else {
      ctx.params.defaultSendEnabled
    }
  }
  pure def SendKeeper::IsSendEnabledCoins(ctx: BankCtx, coins: Set[Coin]): bool = {
    // Implementation: return the error ErrSendDisabled on false
    coins.forall(c => SendKeeper::IsSendEnabledCoin(ctx, c))
  }

  // STATE
  // Total supply of coins per denomination
  var Supply: Denom -> Int256
  // Balances for each address
  var Balances: Addr -> Coins

  // INVARIANTS
  // sum up amounts over all balances for a given denomination
  def SumForDenom(denom: Denom): Int256 = {
    Balances.keys().fold(0, (sum, addr) => {
      val coins = Balances.get(addr)
      if (denom.in(coins.keys()))
        sum + coins.get(denom)
      else
        sum
    })
  }

  // The total Supply of the network is equal to the sum of all coins from the account
  val TotalSupplyInv = {
    Supply.keys().forall(denom => (SumForDenom(denom) == Supply.get(denom)))
  }
}
