// -*- mode: Bluespec; -*-
// An executable specification of the bank module
module bank {
  //----------------------- type declarations -------------------------
  // Addresses are simply strings
  type Addr = str
  // Denominations are simply strings too
  type Denom = str
  // 64-bit and 256-bit integers are a special case of big integers.
  // We have to take care of the bit width where it matters.
  type Int64 = int
  type Int256 = int

  // the maximum value for Int256 in Golang
  pure val MAX_INT256 = 2^256 - 1

  // the range of 256-bit integers in the SDK
  pure def isInt256(i: int): bool = -2^256 < i and i < 2^256
   
  // A coin is a record that contains a denomination and an amount
  type Coin = { denom: Denom, amount: Int256 }
  // Coins is a map from denominations to amounts
  type Coins = Denom -> Int256
  // Account balances
  type Balance = { address: Addr, coins: Coins }

  // A result that is produced by the functions that update the context
  type BankResult =
    | BankErr(str)
    | BankOk(BankCtx)

  // A result that is produced by the functions that return a coin or panic
  type CoinResult =
    | CoinErr(str)
    | CoinOk(Coin)

  // A result that is produced by the functions that return a Boolean or panic
  type BoolResult =
    | BoolErr(str)
    | BoolOk(bool)

  // An input of a multiparty transfer
  type Input = {
    address: str,
    coins: Coins,
  }
  // An output of a multiparty transfer
  type Output = {
    address: str,
    coins: Coins,
  }
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

  //------- the module logic, that is, the logic of keepers -----------

  /// `GetAllBalances` returns all the account balances for the given account address.
  /// https://github.com/cosmos/cosmos-sdk/blob/06406f6a70f228bbb6d09b45a4e343477f1ef7e9/x/bank/keeper/view.go#L61
  pure def ViewKeeper::GetAllBalances(ctx: BankCtx, addr: Addr): Coins = {
    if (ctx.balances.keys().contains(addr)) {
      ctx.balances.get(addr)
    } else {
      Map()
    }
  }

  /// `ValidateBalance` should only be called upon genesis state.
  /// https://github.com/cosmos/cosmos-sdk/blob/06406f6a70f228bbb6d09b45a4e343477f1ef7e9/x/bank/keeper/view.go#L202
  pure def ViewKeeper::ValidateBalance(ctx: BankCtx, addr: Addr): bool = and {
    ctx.accounts.contains(addr),
    val coins = ViewKeeper::GetAllBalances(ctx, addr)
    // Implementation: Coins.IsValid also validates denominations
    coins.keys().forall(denom => coins.get(denom) > 0),
    // TODO: add validation logic for the vesting accounts
  }

  /// GetBalance returns the balance of a specific denomination for a given account by address.
  /// https://github.com/cosmos/cosmos-sdk/blob/06406f6a70f228bbb6d09b45a4e343477f1ef7e9/x/bank/keeper/view.go#L98
  pure def ViewKeeper::GetBalance(ctx: BankCtx, addr: Addr, denom: str): CoinResult = {
    if (ctx.balances.keys().contains(addr)) {
      val accountBal = ctx.balances.get(addr)
      if (accountBal.keys().contains(denom)) {
        CoinOk({ denom: denom, amount: accountBal.get(denom) })
      } else {
        CoinErr("Unmarshal error")
      }
    } else {
      CoinErr("Unmarshal error")
    }
  }

  /// HasBalance returns whether or not an account has at least amt balance.\
  /// https://github.com/cosmos/cosmos-sdk/blob/06406f6a70f228bbb6d09b45a4e343477f1ef7e9/x/bank/keeper/view.go#L56
  pure def ViewKeeper::HasBalance(ctx: BankCtx, addr: Addr, coin: Coin): BoolResult = {
    // Implementation: panic if the address or denomination are not stored?
    match ViewKeeper::GetBalance(ctx, addr, coin.denom) {
    | CoinOk(c) => BoolOk(c.amount >= coin.amount)
    | CoinErr(msg) => BoolErr(msg)
    } 
  }

  /// GetAccountsBalances returns all the accounts balances from the store.
  /// https://github.com/cosmos/cosmos-sdk/blob/06406f6a70f228bbb6d09b45a4e343477f1ef7e9/x/bank/keeper/view.go#L72
  pure def ViewKeeper::GetAccountsBalances(ctx: BankCtx): Set[Balance] = {
    // The implementation may panic due to unmarshalling errors.
    // Since these errors are not related to the parameters, we do not propagate them.
    ctx.balances.keys().map(a => { address: a, coins: ctx.balances.get(a) })
  }

  /// SendCoins transfers amt coins from a sending account to a receiving account.
  /// An error is returned upon failure.
  /// https://github.com/cosmos/cosmos-sdk/blob/06406f6a70f228bbb6d09b45a4e343477f1ef7e9/x/bank/keeper/send.go#L135
  pure def SendKeeper::SendCoins(ctx: BankCtx,
      fromAddr: Addr, toAddr: Addr, amt: Coins): BankResult = {
    // Implementation: if Coins are constructed with NewCoins, they must be positive.
    // However, if they are constructed another way, there is no precondition.
    // TODO: checking LockedCoins that deal with vested coins.
    // Safely subtract the coins from fromAddr and add them to toAddr.
    val fromCoins = ViewKeeper::GetAllBalances(ctx, fromAddr)
    if (amt.keys().exists(d =>
        not(d.in(fromCoins.keys())) or fromCoins.get(d) < amt.get(d))) {
      // some denominations do not exist on fromAddr, or there is not enough funds
      BankErr("invalid coins or insufficient funds")
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
        BankErr("overflow")
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
        BankOk({ ...ctx, balances: newBalances, accounts: newAccounts })
      }
    }
  }

  /// GetParams returns the total set of bank parameters.
  /// https://github.com/cosmos/cosmos-sdk/blob/06406f6a70f228bbb6d09b45a4e343477f1ef7e9/x/bank/keeper/send.go#L61
  pure def SendKeeper::GetParams(ctx: BankCtx): Params = ctx.params

  /// SetParams sets the total set of bank parameters.
  /// https://github.com/cosmos/cosmos-sdk/blob/06406f6a70f228bbb6d09b45a4e343477f1ef7e9/x/bank/keeper/send.go#L67
  pure def SendKeeper::SetParams(ctx: BankCtx, params: Params): BankCtx = {
    { ...ctx, params: params }
  }

  /// IsSendEnabledCoin returns the current SendEnabled status of the provided coin's denom.
  /// https://github.com/cosmos/cosmos-sdk/blob/06406f6a70f228bbb6d09b45a4e343477f1ef7e9/x/bank/keeper/send.go#L315
  pure def SendKeeper::IsSendEnabledCoin(ctx: BankCtx, coin: Coin): bool = {
    val found = ctx.params.sendEnabled.filter(p => coin.denom == p.denom)
    if (found != Set()) {
      found.exists(p => p.enabled)
    } else {
      ctx.params.defaultSendEnabled
    }
  }

  /// IsSendEnabledCoins checks the coins provide and returns an ErrSendDisabled if
  /// any of the coins are not configured for sending.  Returns nil if sending is enabled
  /// for all provided coin.
  /// https://github.com/cosmos/cosmos-sdk/blob/06406f6a70f228bbb6d09b45a4e343477f1ef7e9/x/bank/keeper/send.go#L306C28-L306C28
  pure def SendKeeper::IsSendEnabledCoins(ctx: BankCtx, coins: Set[Coin]): bool = {
    // Implementation: return the error ErrSendDisabled on false
    coins.forall(c => SendKeeper::IsSendEnabledCoin(ctx, c))
  }
}
