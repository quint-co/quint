/**
 * This is a minimized protocol specification of the bank module
 * that is tuned for an efficient presentation. For a more detailed version,
 * see bank.qnt.
 *
 * Igor Konnov, Informal Systems, 2023
 */
module bank {
  // namespace bits {
    type Addr = str
    type Int64 = int
    type Int256 = int
    /// the maximum amount value in the SDK (note 256 instead of 255!)
    val MAX_INT256 = 2^256 - 1
    // the range of 256-bit integers in the SDK
    pure def isInt256(i: int): bool = -2^256 <= i and i < 2^256
    // a coin with denominations attached
    type Coin = { denom: str, amount: Int256 }
    // Cosmos SDK coins are sorted arrays. We simply use Quint maps.
    type Coins = str -> Int256
  // }

  // Account balances
  type Balance = { address: Addr, coins: Coins }

  /// Parameters of the bank module
  type Params = {
    // whether coin send is enabled for specific denominations
    sendEnabled: Set[{ denom: str, enabled: bool }],
    // whether coin send is enabled by default
    defaultSendEnabled: bool,
  }

  /// All possible addresses, a small set for testing.
  /// In Q1, it will be a parameter!
  val ADDR = Set("alice", "bob", "charlie", "eve", "null")
  /// Blocked addresses, a small set for testing (a parameter in a full spec).
  /// In Q1, it will be a parameter!
  val BLOCKED = Set("eve")

  // The part of the key-value store read by the bank or written by the bank.
  // In contrast to the Cosmos SDK in Go, we encapsulate the view of the
  // context available to the bank in this special record.
  type BankCtx = {
    // accessed via AccountKeeper
    accounts: Set[Addr],
    // the balances are the essential part of the bank module
    balances: Addr -> Coins,
    // module parameters
    params: Params,
  }

  // An output produced by Keeper computations
  type BankOut = {
    isError: bool,
    ctx: BankCtx,
  }

  // FUNCTIONAL LAYER

  // ViewKeeper {
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
      coins.keys().forall(denom => coins.get(denom) > 0),
      // SKIPPED: logic of vesting accounts that are initialized in genesis
    }
  // } // ViewKeeper

  // SendKeeper {
    /// `SendCoins` transfers amt coins from a sending account to a receiving account.
    /// An error is returned upon failure.
    ///
    /// In our specification, `sendCoins` does not update the context in place,
    /// but it returns a new context. `isError == true` on error or panic.
    /// SDK `SendCoins(ctx sdk.Context, fromAddr sdk.AccAddress, toAddr sdk.AccAddress, amt sdk.Coins) error`
    pure def sendCoins(ctx: BankCtx,
        fromAddr: Addr, toAddr: Addr, amt: Coins): BankOut = {
      // NOTE on SDK: if Coins are constructed with NewCoins, they must be positive.
      // However, if they are constructed another way, there is no precondition.
      // Safely subtract the coins from `fromAddr` and add them to `toAddr`.
      val fromCoins = getAllBalances(ctx, fromAddr)
      if (amt.keys().exists(d =>
          not(d.in(fromCoins.keys())) or fromCoins.get(d) < amt.get(d))) {
        // some denominations do not exist on `fromAddr`, or there is not enough funds
        { isError: true, ctx: ctx }
      } else {
        // x/bank invariants prohibit persistence of zero balances
        // clean zero balances
        pure def getOr0(coins: Coins, d: str): int = {
          if (d.in(coins.keys())) coins.get(d) else 0
        }
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
          // return the result
          {
            isError: false,
            ctx: ctx.with("balances", newBalances).with("accounts", newAccounts),
          }
        }
      }
    }

    /// IsSendEnabledCoin returns the current SendEnabled status of the provided coin's denom
    /// SDK: `IsSendEnabledCoin(ctx sdk.Context, coin sdk.Coin) bool`
    pure def isSendEnabledCoin(ctx: BankCtx, coin: Coin): bool = {
      val found = ctx.params.sendEnabled.filter(p => coin.denom == p.denom)
      if (found != Set()) {
        found.exists(p => p.enabled)
      } else {
        ctx.params.defaultSendEnabled
      }
    }

    /// `IsSendEnabledCoins` checks the coins provide and returns an `ErrSendDisabled` if
    /// any of the coins are not configured for sending. Returns `nil` if sending is enabled
    /// for all provided coin.
    /// SDK: `IsSendEnabledCoins(ctx sdk.Context, coins ...sdk.Coin) error`
    pure def isSendEnabledCoins(ctx: BankCtx, coins: Set[Coin]): str = {
      if (coins.forall(c => isSendEnabledCoin(ctx, c))) {
        ""
      } else {
        "ErrSendDisabled"
      }
    }
  // } // SendKeeper

  // END OF THE FUNCTIONAL LAYER

  // STATE MACHINE
  // ---> init (balances, accounts) [-- send -->] (balances', accounts') [-- send -->] ...

    // managed by the account keeper
    var accounts: Set[Addr]
    // managed by the bank keeper
    var balances: Addr -> Coins

    // A helper function: It indicates the user's intent to write a precondition,
    // which should hold true, whenever an action is called. 
    def require(cond) = cond

    // Tests instantiate parameters with fixed values (later, parameterized).
    val PARAMS = {
      sendEnabled: Set(
        { denom: "atom", enabled: true },
        { denom: "proton", enabled: true }
      ),
      defaultSendEnabled: false
    }

    // Tests instantiate denominations with fixed values (later, parameterized).
    val DENOMS = Set("atom", "proton", "photon", "foocoin")

    // Initialize the state machine. Atm, the initializer is a mock.
    action init = {
      val accs = ADDR.exclude(Set("null"))
      val bals = Map(
        "alice" -> Map("atom" -> 30, "proton" -> 20, "photon" -> 2000),
        "bob" -> Map("atom" -> 1)
      )
      // validate the balances at the genesis time
      val bankIn = { accounts: accs, balances: bals, params: PARAMS }
      all {
        require(accs.forall(a => validateBalance(bankIn, a))),
        // initialize the state
        accounts' = accs,
        balances' = bals,
      }
    }

    // handler of MsgSend of x/bank
    // https://docs.cosmos.network/v0.45/modules/bank/03_messages.html
    action send(fromAddr: Addr, toAddr: Addr, coins: Coins): bool = {
      val oldCtx = {
        accounts: accounts, balances: balances, params: PARAMS
      }
      // Send the coins via the keeper.
      // The message handler does validation and fails a transaction,
      // if it does not pass validation. For the moment, we simply require
      // the parameters to pass validation, for the action to succeed.
      // In the future, we may want to save failed transactions.
      all {
        require(coins.keys().forall(d => coins.get(d) > 0)),
        require(isSendEnabledCoins(oldCtx,
          coins.keys().map(d => { denom: d, amount: coins.get(d) })) == ""),
        require(not(BLOCKED.contains(toAddr))),
        val result = sendCoins(oldCtx, fromAddr, toAddr, coins)
        all {
          require(not(result.isError)),
          balances' = result.ctx.balances,
          accounts' = result.ctx.accounts,
        }
      }
    }

    action step = {
      // at the moment, we execute only one action, so no "any" is used
      // TODO: make a case for more than one denomination
      nondet denom = oneOf(DENOMS)
      // Note that the probability of randomly picking an amount that
      // will not fail in `send` is quite small.
      // Hence, we need more targeted tests (see below).
      nondet amount = (-(2^256)).to(2^256 - 1).oneOf()
      nondet fromAddr = oneOf(ADDR)
      nondet toAddr = oneOf(ADDR)
      send(fromAddr, toAddr, Map(denom -> amount))
    }

  // END OF THE STATE MACHINE

  // UNIT TESTS + PBT TESTS

  // all addresses but "null" have an associated account in the key/value store
  val ACCOUNTS = ADDR.exclude(Set("null"))

  // a simple context for testing
  val CONTEXT = {
    accounts: ACCOUNTS,
    balances: Map(
        "alice" -> Map("atom" -> 17, "nonatom" -> 2),
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

  // An auxilliary action that keeps all variables unchanged.
  // In the future, such a change would be computed automatically.
  action keepVars = all {
    balances' = balances,
    accounts' = accounts,
  }

  // test that validateBalance is working as expected
  run validateBalanceTest = {
    init
      .then(all {
        assert(validateBalance(CONTEXT, "alice")),
        assert(not(validateBalance(CONTEXT, "null"))),
        keepVars,
      })
  }

  // test that a simple `send` goes through
  run sendOkTest = {
    init
      .then(send("alice", "bob", Map("atom" -> 3)))
      .then(all {
        assert(balances.get("alice").get("atom") == 27),
        assert(balances.get("bob").get("atom") == 4),
        keepVars,
      })
  }

  // test that `send` fails when sending a token with send disabled
  run sendNotEnabledErrTest = {
    init
      .then(send("alice", "bob", Map("photon" -> 3)))
      .fail()
  }

  // test that multiple denominations can be sent at once
  run sendTwoOkTest = {
    init
      .then(send("alice", "bob", Map("atom" -> 3, "proton" -> 11)))
      .then(all {
        assert(balances.get("alice").get("atom") == 27),
        assert(balances.get("alice").get("proton") == 9),
        assert(balances.get("bob").get("atom") == 4),
        assert(balances.get("bob").get("proton") == 11),
        keepVars,
      })
  }

  // a test similar to property-based testing that randomly probes send
  // custom initializer that picks some balances for several denominations
  action initBoxed = all {
    nondet amts1 = Set("atom").setOfMaps(to(0, 15)).oneOf()
    nondet amts2 = Set("proton").setOfMaps(to(0, 15)).oneOf()
    nondet amts3 = Set("atom", "proton").setOfMaps(to(0, 15)).oneOf()
    nondet amts4 = Set("atom", "photon").setOfMaps(to(0, 15)).oneOf()
    nondet bals = ADDR.setOfMaps(Set(amts1, amts2, amts3, amts4)).oneOf()
    all {
      balances' = bals,
      accounts' = bals.keys().exclude(Set("null")),
    }
  }
  // custom send that picks some randomly picks some tokens to transfer
  action sendBoxed = {
    // pick some denominations
    // FIXME: Sometimes, denoms is still empty:
    // https://github.com/informalsystems/quint/issues/545
    nondet denoms = DENOMS.powerset().exclude(Set()).oneOf()
    all {
      denoms.size() > 0,
      // pick some amounts
      nondet coins = denoms.setOfMaps(to(-5, 5)).oneOf()
      // pick the addresses
      nondet addrFrom = ADDR.oneOf()
      nondet addrTo = ADDR.oneOf()
      send(addrFrom, addrTo, coins)
    }
  }

  // this is one of the basic invariants of the bank module
  val nonNegativeSupplyInv =
    balances.keys().forall(a =>
      val coins = balances.get(a)
      coins.keys().forall(d => coins.get(d) >= 0)
    )

  // a single point random test
  run sendRandomTest = {
    initBoxed
      .then(sendBoxed)
      .then(all {
        assert(nonNegativeSupplyInv),
        keepVars
      })
  }

  // The test sendNotEnoughBalanceTest from:
  // https://github.com/cosmos/cosmos-sdk/blob/497dc2cb78bb8df597fd63555f97b2f98cc7f2d0/x/bank/app_test.go#LL135
  run sendNotEnoughBalanceTest = {
    val addrs = Set("addr1")
    action myInit = all {
      accounts' = addrs,
      balances' = addrs.mapBy(a => Map("foocoin" -> 67)),
    }

    init
      .then(send("addr1", "addr2", Map("foocoin" -> 100)))
      .fail()
  }

  // If you'd like to run this test for multiple data points,
  // you can do it in REPL as follows:
  // .load bank-mini.qnt::bank
  // _test(10000, 3, "initBoxed", "sendBoxed", "nonNegativeSupplyInv")
}
