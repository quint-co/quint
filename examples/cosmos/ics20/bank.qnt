// -*- mode: Bluespec; -*-

/**
 * A bank module for ICS-020 (Fungible Token Transfer).
 *
 * ICS-020 assumes a high-level "bank module" capable of minting, burning, and
 * transferring tokens. This specification is held as general as possible,
 * providing only the assumptions required by ICS-020.
 *
 * For a possible implementation, consider the Cosmos SDK bank module:
 * https://docs.cosmos.network/v0.47/modules/bank/
 *
 * Thomas Pani, Informal Systems, 2023
 */

module bank {
  import basicSpells.* from "../../spells/basicSpells"
  import base.* from "./base"

  /* ***************************************************************************
   * TYPES
   * **************************************************************************/

  type Amount = int
  type Denomination = DenomTrace

  type TokenBalances = Denomination -> Amount
  type Accounts = Address -> TokenBalances

  /* Result type of bank operations.
   *
   * Iff the operation failed, `success` is false.
   * Otherwise, `accounts` holds the updated accounts.
   *
   * TODO(#539): Use ADTs, when supported.
   */
  type BankResult = {
    success: bool,
    accounts: Accounts
  }

  /* ***************************************************************************
   * FUNCTIONAL LAYER
   * **************************************************************************/

  /****************************/
  /*     helper functions     */
  /****************************/

  // Get balances of all denominations in the given account `addr`.
  pure def getBalances(accounts: Accounts, addr: Address) : TokenBalances = {
    if (accounts.has(addr)) {
      accounts.get(addr)
    } else {
      Map()
    }
  }

  // Get the amount of tokens of denomination `denom` in `balances`.
  pure def getBalance(balances: TokenBalances, denom: Denomination): Amount = {
    if (balances.has(denom)) balances.get(denom) else 0
  }

  /* Return `accounts`, where `address` is updated to hold
   * `currentAmount + amount` tokens of denomination `denom`.
   *
   * `currentAmount` refers to the number of tokens of denomination `denom` held
   * by `address` in `accounts`.
   *
   * If there currently is no account under `address`, return accounts including
   * `address` with exactly `amount`-many `denom` tokens.
   */
  pure def addToBalance(accounts: Accounts, address: Address,
                        denom: Denomination, amount: Amount) : Accounts = {
    val accountCoins = accounts.getBalances(address)
    val newCoins = accountCoins.put(denom, accountCoins.getBalance(denom) + amount)
    accounts.put(address, newCoins)
  }

  /****************************/
  /*     public interface     */
  /****************************/

  /* Return `accounts`, where `amount`-many tokens of denomination `denom`
   * vanished out of `sender`'s account into thin air.
   *
   * Fails iff `amount` is greater than `sender`'s balance.
   */
  pure def BurnCoins(accounts: Accounts, sender: Address,
                     denom: Denomination, amount: Amount): BankResult = {
    if (accounts.getBalances(sender).getBalance(denom) >= amount) {
      val newAccounts = addToBalance(accounts, sender, denom, -amount)
      { success: true, accounts: newAccounts }
    } else {
      { success: false, accounts: accounts }
    }
  }

  /* Return `accounts`, where `amount`-many tokens of denomination `denom` were
   * added to `sender`'s account out of thin air.
   *
   * Fails iff `amount < 0`.
   */
  pure def MintCoins(accounts: Accounts, receiver: Address,
                     denom: Denomination, amount: Amount): BankResult = {
    if (amount >= 0) {
      val newAccounts = addToBalance(accounts, receiver, denom, amount)
      { success: true, accounts: newAccounts }
    } else {
      { success: false, accounts: accounts }
    }
  }

  /* Return `state`, where `amount`-many tokens of denomination `denom` were
   * moved from `sender`'s account into `receiver`'s account.
   *
   * Fails iff `amount` is either negative or greater than `sender`'s balance.
   */
  pure def TransferCoins(accounts: Accounts, sender: Address, receiver: Address,
                         denom: Denomination, amount: Amount): BankResult = {
    if (amount >= 0 and accounts.getBalances(sender).getBalance(denom) >= amount) {
      val newAccounts = accounts
                          .addToBalance(sender, denom, -amount)
                          .addToBalance(receiver, denom, amount)
      { success: true, accounts: newAccounts}
    } else {
      { success: false, accounts: accounts}
    }
  }
}

module bankTests {
  import base.* from "./base"
  import bank.*

  /* ***************************************************************************
   * STATE MACHINE
   * **************************************************************************/

  var state: Accounts
  var error: bool  // true iff a previous bank operation has been unsuccessful

  pure val Addresses : Set[Address] = Set("alice", "bob", "charlie")

  pure val ATOM = toDenom("atom")
  pure val ETH  = toDenom("eth")
  pure val OSMO = toDenom("osmo")
  pure val Denoms : Set[Denomination] = Set(ATOM, ETH, OSMO)

  // Trivial action defs for the bank module operations
  action burn(sender: Address, denom: Denomination, amount: Amount): bool =
    val result = state.BurnCoins(sender, denom, amount)
    all {
      state' = result.accounts,
      error' = (error or not(result.success))
    }

  action mint(receiver: Address, denom: Denomination, amount: Amount): bool =
    val result = state.MintCoins(receiver, denom, amount)
    all {
      state' = result.accounts,
      error' = (error or not(result.success))
    }

  action transfer(sender: Address, receiver: Address,
                  denom: Denomination, amount: Amount): bool =
    val result = state.TransferCoins(sender, receiver, denom, amount)
    all {
      state' = result.accounts,
      error' = (error or not(result.success))
    }

  /* Initialize accounts.
   *
   * Alice, Bob and Charlie initially hold 10 ATOMs, and no other coins.
   */
  action init = all {
    state' = Addresses.mapBy(_ => Map(ATOM -> 10)),
    error' = false
  }

  /* Nondeterministically burn, mint, or transfer tokens of arbitrary
   * denomination and amount to/from arbitrary accounts.
   */
  action step = {
    nondet addrA = Addresses.oneOf()
    nondet addrB = Addresses.oneOf()
    nondet denom = Denoms.oneOf()
    // since there are no assumptions about the range of amounts, this can be an arbitrary integer!
    nondet amount = Int.oneOf()
    any {
      burn(addrA, denom, amount),
      mint(addrA, denom, amount),
      transfer(addrA, addrB, denom, amount)
    }
  }

  /* ***************************************************************************
   * TESTS
   * **************************************************************************/

  // To run tests in the random simulator:
  // $ quint test --main=bankTests bank.qnt

  // A predicate that holds after `init`
  def initialState = all {
    // last operation successful
    assert(not(error)),
    // everybody holds 10 ATOM
    assert(state.getBalances("alice").getBalance(ATOM) == 10),
    assert(state.getBalances("bob").getBalance(ATOM) == 10),
    assert(state.getBalances("charlie").getBalance(ATOM) == 10),
    // nobody holds ETH
    assert(state.getBalances("alice").getBalance(ETH) == 0),
    assert(state.getBalances("bob").getBalance(ETH) == 0),
    assert(state.getBalances("charlie").getBalance(ETH) == 0),
    // "noAccount" holds nothing
    assert(state.getBalances("noAccount").getBalance(ATOM) == 0),
    assert(state.getBalances("noAccount").getBalance(ETH) == 0),
  }

  // Do some mint, burn, transfer steps and check that account balances are correct.
  run mintTransferBurnAtomsTest = {
    init
      .then(all {
        initialState,
        // now mint alice 15 ATOMs
        mint("alice", ATOM, 15)
      })
      .then(all {
        // last operation successful
        assert(not(error)),
        // alice received her 15 ATOM
        assert(state.getBalances("alice").getBalance(ATOM) == 25),
        assert(state.getBalances("bob").getBalance(ATOM) == 10),
        assert(state.getBalances("charlie").getBalance(ATOM) == 10),
        // still nobody holds ETH
        assert(state.getBalances("alice").getBalance(ETH) == 0),
        assert(state.getBalances("bob").getBalance(ETH) == 0),
        assert(state.getBalances("charlie").getBalance(ETH) == 0),
        // "noAccount" holds nothing
        assert(state.getBalances("noAccount").getBalance(ATOM) == 0),
        assert(state.getBalances("noAccount").getBalance(ETH) == 0),

        // now burn bob 6 ATOMs
        burn("bob", ATOM, 6)
      })
      .then(all {
        // last operation successful
        assert(not(error)),
        // bob lost 42 ATOM
        assert(state.getBalances("alice").getBalance(ATOM) == 25),
        assert(state.getBalances("bob").getBalance(ATOM) == 4),
        assert(state.getBalances("charlie").getBalance(ATOM) == 10),
        // still nobody holds ETH
        assert(state.getBalances("alice").getBalance(ETH) == 0),
        assert(state.getBalances("bob").getBalance(ETH) == 0),
        assert(state.getBalances("charlie").getBalance(ETH) == 0),
        // "noAccount" holds nothing
        assert(state.getBalances("noAccount").getBalance(ATOM) == 0),
        assert(state.getBalances("noAccount").getBalance(ETH) == 0),

        // now mint charlie 6 ETH
        mint("charlie", ETH, 6)
      })
      .then(all {
        // last operation successful
        assert(not(error)),
        // ATOM balances remain the same
        assert(state.getBalances("alice").getBalance(ATOM) == 25),
        assert(state.getBalances("bob").getBalance(ATOM) == 4),
        assert(state.getBalances("charlie").getBalance(ATOM) == 10),
        // now charlie holds 6 ETH
        assert(state.getBalances("alice").getBalance(ETH) == 0),
        assert(state.getBalances("bob").getBalance(ETH) == 0),
        assert(state.getBalances("charlie").getBalance(ETH) == 6),
        // "noAccount" holds nothing
        assert(state.getBalances("noAccount").getBalance(ATOM) == 0),
        assert(state.getBalances("noAccount").getBalance(ETH) == 0),

        // now transfer 4 of charlie's ETH to bob
        transfer("charlie", "bob", ETH, 4)
      })
      .then(all {
        // last operation successful
        assert(not(error)),
        // ATOM balances remain the same
        assert(state.getBalances("alice").getBalance(ATOM) == 25),
        assert(state.getBalances("bob").getBalance(ATOM) == 4),
        assert(state.getBalances("charlie").getBalance(ATOM) == 10),
        // bob got 4 of charlie's ETH
        assert(state.getBalances("alice").getBalance(ETH) == 0),
        assert(state.getBalances("bob").getBalance(ETH) == 4),
        assert(state.getBalances("charlie").getBalance(ETH) == 2),
        // "noAccount" holds nothing
        assert(state.getBalances("noAccount").getBalance(ATOM) == 0),
        assert(state.getBalances("noAccount").getBalance(ETH) == 0),

        // nothing changes
        state' = state,
        error' = error
      })
  }

  // Burn more coins than in account.
  run burnOverBalanceTest = {
    init
      .then(all {
        initialState,

        // now burn alice 10 ATOMs
        burn("alice", ATOM, 10)
      })
      .then(all {
        // last operation successful
        assert(not(error)),
        // alice lost 10 ATOM
        assert(state.getBalances("alice").getBalance(ATOM) == 0),
        assert(state.getBalances("bob").getBalance(ATOM) == 10),
        assert(state.getBalances("charlie").getBalance(ATOM) == 10),

        // now burn bob 11 ATOMs
        burn("bob", ATOM, 11)
      })
      .then(all{
        // burning over balance failed
        assert(error),

        // nothing changes
        state' = state,
        error' = error
      })
  }

  // Transfer more coins than in account.
  run transferOverBalanceTest = {
    init
      .then(all {
        initialState,

        // now transfer 10 ATOMs from alice to bob
        transfer("alice", "bob", ATOM, 10)
      })
      .then(all {
        // last operation successful
        assert(not(error)),
        // alice -- 10 ATOM --> bob
        assert(state.getBalances("alice").getBalance(ATOM) == 0),
        assert(state.getBalances("bob").getBalance(ATOM) == 20),
        assert(state.getBalances("charlie").getBalance(ATOM) == 10),

        // now transfer 21 ATOMs from bob to charlie
        transfer("bob", "charlie", ATOM, 21)
      })
      .then(all{
        // transfer over balance failed
        assert(error),

        // nothing changes
        state' = state,
        error' = error
      })
  }

  // Mint negative amount.
  run mintNegativeTest = {
    init
      .then(all {
        initialState,

        // now mint alice 0 ATOMs
        mint("alice", ATOM, 0)
      })
      .then(all {
        // last operation successful
        assert(not(error)),
        // balances remain
        assert(state.getBalances("alice").getBalance(ATOM) == 10),
        assert(state.getBalances("bob").getBalance(ATOM) == 10),
        assert(state.getBalances("charlie").getBalance(ATOM) == 10),

        // now mint alice -1 ATOMs
        mint("alice", ATOM, -1)
      })
      .then(all{
        // negative minting failed
        assert(error),

        // nothing changes
        state' = state,
        error' = error
      })
  }

  /* ***************************************************************************
   * INVARIANTS
   * **************************************************************************/

  // To check in random simulator:
  // $ quint run --main=bankTests --invariant=BalanceNonNegative bank.qnt
  // $ quint run --main=bankTests --invariant=NonExistantAccountsOrCoinsAreZero bank.qnt
  //
  // To verify in model-checker:
  // $ quint verify --max-steps=3 --main=bankTests --invariant=BalanceNonNegative,NonExistantAccountsOrCoinsAreZero bank.qnt

  // An invariant for `getBalances` and `getBalance`:
  //   - Unknown accounts report 0 tokens of each denomination.
  //   - Accounts not holding a denomination report 0 tokens.
  val NonExistantAccountsOrCoinsAreZero =
    Addresses.forall(addr =>
      Denoms.forall(denom =>
        val addrNotInAccounts = not(addr.in(state.keys()))
        val denomNotInAccount = not(denom.in(state.get(addr).keys()))
        (addrNotInAccounts or denomNotInAccount) implies
          state.getBalances(addr).getBalance(denom) == 0
      )
    )

  // The balance of all denominations in all accounts is always non-negative.
  val BalanceNonNegative = not(error) implies
    Addresses.forall(addr =>
      Denoms.forall(denom =>
        state.getBalances(addr).getBalance(denom) >= 0
      )
    )
}
