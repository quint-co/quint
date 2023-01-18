/**
 * This is a work-in-progress protocol specification of the bank module
 * that includes:
 *
 *  1. External behavior (via messages), and
 *  2. Internal behavior (via Keeper calls).
 *
 * The main goal of this specification is to highlight the essential behavior
 * of the bank module, while keeping the specification faithful to the
 * implementation. Since it would not make a lot of sense to duplicate
 * the implementation in the specification language, we naturally omit
 * low-level implementation details:
 *
 *  - All errors are replaced with a Boolean value, e.g., `false` or `true`.
 *    The actual error code is less important for understanding the protocol.
 *
 *  - Low-level panics are ommitted, unless they are related to the logic
 *    of the bank module. In the latter case, they are replaced with Boolean
 *    error flags.
 *
 * WARNING: This spec is work in progress. It is by no means complete or correct.
 *
 * Igor Konnov, Informal Systems, 2023
 */
module bank {
  // TODO: these type definitions should be defined in a general Cosmos module
  type Addr = str
  // TODO: specify 64-bit and 256-bit integers later, in separate modules
  type Int64 = int
  type Int256 = int
  /// the maximum amount value in the SDK (note 256 instead of 255!)
  val MAX_INT256 = 2^256 - 1
  // the range of 256-bit integers in the SDK
  pure def isInt256(i: int): bool = -2^256 <= i and i < 2^256
  // a coin with denominations attached
  type Coin = { denom: str, amount: Int256 }
  // Cosmos SDK coins are bags that are implemented via sorted arrays.
  // We are simply using maps in Quint.
  type Coins = str -> Int256
  // Account balances
  type Balance = { address: Addr, coins: Coins }

  /// Parameters of the bank module
  type Params = {
    // whether coin send is enabled for specific denominations
    sendEnabled: Set[{ denom: str, enabled: bool }],
    // whether coin send is enabled by default
    defaultSendEnabled: bool,
  }

  // TODO: introduce constants, when #528 is done:
  // https://github.com/informalsystems/quint/issues/528
  // all possible addresses
  //const ADDR: Set[Addr]
  // blocked addresses
  //const BLOCKED: Set[Addr]

  /// All possible addresses.
  //  Fixed to a constant value for now, until #528 is closed.
  val ADDR = Set("alice", "bob", "charlie", "eve", "null")
  /// Blocked addresses, set directly in code.
  //  Fixed to a constant value for now, until #528 is closed.
  val BLOCKED = Set("eve")

  // The part of the key-value store read by the bank or wrote by the bank.
  // In contrast to the Golang version, we encapsulate the view of the context
  // available to the bank in this special record.
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

  // an output produced by stateful computations
  type BankOut = {
    isError: bool,
    ctx: BankCtx,
  }

  // TODO: introduce a separate module, when the modules are fixed:
  // https://github.com/informalsystems/quint/issues/523
  // we isolate the keeper interface in a separate namespace
  //module keeper {

  // module ViewKeeper {
    /// `GetAllBalances` returns all the account balances for the given account address.
    /// SDK: `func (k BaseViewKeeper) GetAllBalances(ctx sdk.Context, addr sdk.AccAddress) sdk.Coins`
    pure def getAllBalances(ctx: BankCtx, addr: Addr): Coins = {
      if (ctx.balances.keys().contains(addr)) {
        ctx.balances.get(addr)
      } else {
        Map()
      }
    }

    /// `ValidateBalance` should only be called upon genesis state.
    /// SDK `ValidateBalance(ctx sdk.Context, addr sdk.AccAddress) error`
    pure def validateBalance(ctx: BankCtx, addr: Addr): bool = and {
      ctx.accounts.contains(addr),
      val coins = getAllBalances(ctx, addr)
      // SKIPPED: Coins.IsValid does more tests, including the denominations format
      coins.keys().forall(denom => coins.get(denom) > 0),
      // SKIPPED: logic of vesting accounts that are initialized in genesis
    }

    /// `GetBalance` returns the balance of a specific denomination
    /// for a given account by address.
    /// SDK: `func (k BaseViewKeeper) GetBalance(ctx sdk.Context, addr sdk.AccAddress, denom string) sdk.Coin`
    pure def getBalance(ctx: BankCtx, addr: Addr, denom: str): Int256 = {
      if (ctx.balances.keys().contains(addr)
          and ctx.balances.get(addr).keys().contains(denom)) {
        ctx.balances.get(addr).get(denom)
      } else {
        0
      }
    }

    /// `HasBalance` returns whether or not an account has at least amt balance.
    /// SDK: `func (k BaseViewKeeper) HasBalance(ctx sdk.Context, addr sdk.AccAddress, amt sdk.Coin) bool`
    pure def hasBalance(ctx: BankCtx, addr: Addr, coin: Coin): bool = {
      getBalance(ctx, addr, coin.denom) >= coin.amount
    }

    /// `GetAccountsBalances` returns all the accounts balances from the store.
    /// SDK: `func (k BaseViewKeeper) GetAccountsBalances(ctx sdk.Context) []types.Balance`
    pure def getAccountsBalances(ctx: BankCtx): Set[Balance] = {
      ctx.balances.keys().map(a => { address: a, coins: ctx.balances.get(a) })
    }

    // SKIPPED: not dealing with vesting accounts
    // LockedCoins(ctx sdk.Context, addr sdk.AccAddress) sdk.Coins

    // SKIPPED: not dealing with vesting accounts
    // SpendableCoins(ctx sdk.Context, addr sdk.AccAddress) sdk.Coins

    // SKIPPED: It is simply another version of `getAllBalances` that uses an iterator.
    // SDK: func (k BaseViewKeeper)
    //   IterateAccountBalances(ctx sdk.Context, addr sdk.AccAddress, cb func(sdk.Coin) bool)

    // SKIPPED:  It is simply another version of `getAccountBalances` that uses an iterator.
    // IterateAllBalances iterates over all the balances of all accounts and
    // denominations that are provided to a callback. If true is returned from the
    // callback, iteration is halted.
  // } // ViewKeeper

  // module SendKeeper {
    /// `SendCoins` transfers amt coins from a sending account to a receiving account.
    /// An error is returned upon failure.
    ///
    /// In our specification,
    /// `sendCoins` does not update the context in place, but it returns a new context.
    /// The value `false` is returned in case of error or panic.
    /// SDK `SendCoins(ctx sdk.Context, fromAddr sdk.AccAddress, toAddr sdk.AccAddress, amt sdk.Coins) error`
    pure def sendCoins(ctx: BankCtx,
        fromAddr: Addr, toAddr: Addr, amt: Coins): BankOut = {
      // NOTE on SDK: if Coins are constructed with NewCoins, they must be positive.
      // However, if they are constructed some other way, there is no precondition.
      // SKIPPED: checking LockedCoins that deal with vested coins.
      // Safely subtract the coins from `fromAddr` and add them to `toAddr`.
      val fromCoins = getAllBalances(ctx, fromAddr)
      if (amt.keys().exists(d =>
          not(d.in(fromCoins.keys())) or fromCoins.get(d) < amt.get(d))) {
        // some denominations do not exist on `fromAddr`, or there is not enough funds
        { isError: true, ctx: ctx }
      } else {
        // x/bank invariants prohibit persistence of zero balances
        // clean zero balances
        def getOr0(coins: Coins, d: str): int = if (d.in(coins.keys())) coins.get(d) else 0
        val positiveDenoms = fromCoins.keys().filter(d => fromCoins.get(d) > getOr0(amt, d))
        val subCoins = positiveDenoms.mapBy(d => fromCoins.get(d) - getOr0(amt, d))
        // add coins to toAddr: the tricky part is that the denominations may differ
        val toCoins = getAllBalances(ctx, toAddr)
        // extend the toCoins and amt with zeroes over the joint denominations
        val jointDenoms = toCoins.keys().union(amt.keys())
        // since toCoins and amt held positive values, their sums must be positive too
        val addCoins = jointDenoms.mapBy(d => getOr0(toCoins, d) + getOr0(amt, d))
        if (addCoins.keys().exists(d => addCoins.get(d) > MAX_INT256)) {
          // overflow, SDK panics
          { isError: true, ctx: ctx }
        } else {
          // add `toAddr` to the accounts, if it did not exist
          val newAccounts = ctx.accounts.union(Set(toAddr))
          val newBalances =
            if (fromAddr == toAddr) {
              ctx.balances
            } else {
              // Update the balance of `fromAddr` with subCoins.
              val newBalancesSub = ctx.balances.set(fromAddr, subCoins)
              // Since `toAddr` may be a new account, extend the map, if needed
              newBalancesSub.put(toAddr, addCoins)
            }
          {
            isError: false,
            ctx: ctx.with("balances", newBalances).with("accounts", newAccounts),
          }
        }
      }
    }

    /// `GetParams` returns the total set of bank parameters.
    /// SDK: `GetParams(ctx sdk.Context) types.Params`
    pure def getParams(ctx: BankCtx): Params = ctx.params

    /// `SetParams` sets the total set of bank parameters.
    /// In our specification,
    /// `setParams` does not update the context in place, but returns a new context.
    /// SDK: SetParams(ctx sdk.Context, params types.Params)
    pure def setParams(ctx: BankCtx, params: Params): BankCtx = {
      ctx.with("params", params)
    }

    /// IsSendEnabledCoin returns the current SendEnabled status of the provided coin's denom
    /// SDK: `IsSendEnabledCoin(ctx sdk.Context, coin sdk.Coin) bool`
    pure def isSendEnabledCoin(ctx: BankCtx, coin: Coin): bool = {
      ctx.params.sendEnabled.exists(p => p.enabled and coin.denom == p.denom)
    }

    /// `IsSendEnabledCoins` checks the coins provide and returns an `ErrSendDisabled` if
    /// any of the coins are not configured for sending. Returns `nil` if sending is enabled
    /// for all provided coin.
    /// SDK: `IsSendEnabledCoins(ctx sdk.Context, coins ...sdk.Coin) error`
    pure def isSendEnabledCoins(ctx: BankCtx, coins: Coins): str = {
      val asRecords = coins.keys().map(d => { denom: d, amount: coins.get(d) })
      if (asRecords.forall(c => isSendEnabledCoin(ctx, c))) {
        ""
      } else {
        "ErrSendDisabled"
      }
    }

    /// `BlockedAddr` checks if a given address is restricted from receiving funds.
    /// SDK: `BlockedAddr(addr sdk.AccAddress) bool`
    pure def blockedAddr(addr: Addr): bool = {
      addr.in(BLOCKED)
    }

  // } // SendKeeper

  // module BankKeeper {
  // } // BankKeeper

  // TODO: types.QueryServer

  // THE STATE MACHINE
  // TODO: we should introduce the state machine in a separate module, maybe in a separate file
  // module machine {
    // An interesting point here. Although we specify the state machine
    // of the bank module here, we could enrich its behavior by having
    // more state variables. The minimal required state is encapsulated in BankCtx.
    //
    // managed by the account keeper
    var accounts: Set[Addr]
    // managed by the bank keeper
    var balances: Addr -> Coins

    // A helper function.
    // It indicates the user's intent to write a precondition,
    // which should hold true, whenever an action is called. 
    def require(cond) = cond

    // TODO: introduce constants for balances, accounts, and params
    // when #528 is done:
    // https://github.com/informalsystems/quint/issues/528
    val PARAMS = {
      sendEnabled: Set(
        { denom: "atom", enabled: true },
        { denom: "proton", enabled: true }
      ),
      defaultSendEnabled: false
    }

    // when #528 is done, this will be gone
    val DENOMS = Set("atom", "proton", "photon")

    // Until #528 is closed, this initializer is a mock.
    action init = {
      val accs = ADDR.exclude(Set("null"))
      val bals = Map(
        "alice" -> Map("atom" -> 30, "proton" -> 20, "photon" -> 2000),
        "bob" -> Map("atom" -> 1)
      )
      // validate the balances at the genesis time
      val bankIn = { blockTime: 0, accounts: accs, balances: bals, params: PARAMS }
      all {
        require(accs.forall(a => validateBalance(bankIn, a))),
        // set the initial state
        accounts' = accs,
        balances' = bals,
      }
    }

    action send(fromAddr: Addr, toAddr: Addr, coins: Coins): bool = {
      val oldCtx = {
        blockTime: 0, accounts: accounts, balances: balances, params: PARAMS
      }
      // Send the coins via the keeper.
      // The message handler does validation and fails a transaction,
      // if it does not pass validation. For the moment, we simply require
      // the parameters to pass validation, for the action to succeed.
      // In the future, we may want to save failed transactions.
      all {
        require(coins.keys().forall(d => coins.get(d) > 0)),
        require(isSendEnabledCoins(oldCtx, coins) == ""),
        require(blockedAddr(toAddr)),
        val result = sendCoins(oldCtx, fromAddr, toAddr, coins)
        all {
          require(not(result.isError)),
          balances' = result.ctx.balances,
          accounts' = result.ctx.accounts
        }
      }
    }

    action step = {
      // at the moment, we execute only one action, so no "any" is used
      // TODO: make a call for more than one denomination
      nondet denom = oneOf(DENOMS)
      nondet amount = oneOf((-(2^256)).to(2^256 - 1))
      nondet fromAddr = oneOf(ADDR)
      nondet toAddr = oneOf(ADDR)
      send(fromAddr, toAddr, Map(denom -> amount))
    }
  // }

  // UNIT TESTS
  // TODO: the tests should be done in a separate module, maybe in a separate file

  // all addresses but "null" have an associated account in the key/value store
  // TODO: this definition is used by tests and it should be used there
  val ACCOUNTS = ADDR.exclude(Set("null"))
  // a simple context for testing
  val CONTEXT = {
    blockTime: 10,
    accounts: ACCOUNTS,
    balances: Map(
        "alice" -> Map("atom" -> 1, "nonatom" -> 2),
        "bob" -> Map("atom" -> 0)
      ),
    params: {
      sendEnabled: Set(
        { denom: "atom", enabled: true },
        { denom: "proton", enabled: true }
      ),
      defaultSendEnabled: false
    }
  }

  // test that validateBalance is working as expected
  run validateBalanceTest = {
    assert(validateBalance(CONTEXT, "alice"))
      .then(assert(not(validateBalance(CONTEXT, "null"))))
  }

  // TODO: SDK does not contain test for GetBalance
}