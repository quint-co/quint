// -*- mode: Bluespec; -*-

/**
 * A bank module for ICS-020 (Fungible Token Transfer).
 *
 * ICS-020 assumes a high-level "bank module" capable of minting, burning, and
 * transfering tokens. This specification is held as general as possible,
 * providing only the assumptions required by ICS-020.
 *
 * For a possible implementation, consider the Cosmos SDK bank module:
 * https://docs.cosmos.network/v0.47/modules/bank/
 *
 * Thomas Pani, Informal Systems, 2023
 */

module bank {

  /* ***************************************************************************
   * TYPES
   * **************************************************************************/

  type Address = str
  type Denomination = str
  type Amount = int

  type TokenBalances = Denomination -> Amount
  type Accounts = Address -> TokenBalances

  /* ***************************************************************************
   * FUNCTIONAL LAYER, manipulating balances
   * **************************************************************************/

  // Get balances of all denominations in the given account `addr`.
  pure def getBalances(accounts: Accounts, addr: Address) : TokenBalances = {
    if (accounts.keys().contains(addr)) {
      accounts.get(addr)
    } else {
      Map()
    }
  }

  // Get the amount of tokens of denomination `denom` in `balances`.
  pure def getBalance(balances: TokenBalances, denom: Denomination): Amount = {
    if (balances.keys().contains(denom)) balances.get(denom) else 0
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

  /* Return `accounts`, where `amount`-many tokens of denomination `denom`
   * vanished out of `sender`'s account into thin air.
   *
   * This intentionally does NOT check whether `amount > 0`.
   */
  pure def BurnCoins(accounts: Accounts, sender: Address,
                     denom: Denomination, amount: Amount): Accounts = {
    addToBalance(accounts, sender, denom, -amount)
  }

  /* Return `accounts`, where `amount`-many tokens of denomination `denom` were
   * added to `sender`'s account out of thin air.
   *
   * This intentionally does NOT check whether `amount > 0`.
   */
  pure def MintCoins(accounts: Accounts, receiver: Address,
                     denom: Denomination, amount: Amount): Accounts = {
    addToBalance(accounts, receiver, denom, amount)
  }

  /* Return `state`, where `amount`-many tokens of denomination `denom` were
   * moved from `sender`'s account into `receiver`'s acount.
   *
   * This intentionally does NOT check whether `amount > 0`.
   */
  pure def TransferCoins(accounts: Accounts, sender: Address, receiver: Address,
                         denom: Denomination, amount: Amount): Accounts = {
    accounts
      .BurnCoins(sender, denom, amount)
      .MintCoins(receiver, denom, amount)
  }

  /* ***************************************************************************
   * STATE MACHINE
   * **************************************************************************/

  var state: Accounts
  pure val Addresses : Set[Address] = Set("alice", "bob", "charlie")
  pure val Denoms : Set[Denomination] = Set("atom", "eth", "osmo")

  // Trivial action defs for the bank module operations
  action burn(sender: Address, denom: Denomination, amount: Amount): bool =
    state' = state.BurnCoins(sender, denom, amount)

  action mint(receiver: Address, denom: Denomination, amount: Amount): bool =
    state' = state.MintCoins(receiver, denom, amount)

  action transfer(sender: Address, receiver: Address,
                  denom: Denomination, amount: Amount): bool =
    state' = state.TransferCoins(sender, receiver, denom, amount)

  /* Initialize accounts.
   *
   * Alice, Bob and Charlie initially hold 10 ATOMs, and no other coins.
   */
  action init = state' = Addresses.mapBy(_ => Map("atom" -> 10))

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

  // Do some mint, burn, transfer steps and check that account balances are correct.
  run mintTransferBurnAtomsTest = {
    init
      .then(all {
        // everybody holds 10 ATOM
        assert(state.getBalances("alice").getBalance("atom") == 10),
        assert(state.getBalances("bob").getBalance("atom") == 10),
        assert(state.getBalances("charlie").getBalance("atom") == 10),
        // nobody holds ETH
        assert(state.getBalances("alice").getBalance("eth") == 0),
        assert(state.getBalances("bob").getBalance("eth") == 0),
        assert(state.getBalances("charlie").getBalance("eth") == 0),
        // "noAccount" holds nothing
        assert(state.getBalances("noAccount").getBalance("atom") == 0),
        assert(state.getBalances("noAccount").getBalance("eth") == 0),
        
        // now mint alice 15 ATOMs
        mint("alice", "atom", 15)
      })
      .then(all {
        // alice received her 15 ATOM
        assert(state.getBalances("alice").getBalance("atom") == 25),
        assert(state.getBalances("bob").getBalance("atom") == 10),
        assert(state.getBalances("charlie").getBalance("atom") == 10),
        // still nobody holds ETH
        assert(state.getBalances("alice").getBalance("eth") == 0),
        assert(state.getBalances("bob").getBalance("eth") == 0),
        assert(state.getBalances("charlie").getBalance("eth") == 0),
        // "noAccount" holds nothing
        assert(state.getBalances("noAccount").getBalance("atom") == 0),
        assert(state.getBalances("noAccount").getBalance("eth") == 0),

        // now burn bob 42 ATOMs
        burn("bob", "atom", 42)
      })
      .then(all {
        // bob lost 42 ATOM
        assert(state.getBalances("alice").getBalance("atom") == 25),
        assert(state.getBalances("bob").getBalance("atom") == -32),
        assert(state.getBalances("charlie").getBalance("atom") == 10),
        // still nobody holds ETH
        assert(state.getBalances("alice").getBalance("eth") == 0),
        assert(state.getBalances("bob").getBalance("eth") == 0),
        assert(state.getBalances("charlie").getBalance("eth") == 0),
        // "noAccount" holds nothing
        assert(state.getBalances("noAccount").getBalance("atom") == 0),
        assert(state.getBalances("noAccount").getBalance("eth") == 0),

        // now mint charlie 6 ETH
        mint("charlie", "eth", 6)
      })
      .then(all {
        // ATOM balances remain the same
        assert(state.getBalances("alice").getBalance("atom") == 25),
        assert(state.getBalances("bob").getBalance("atom") == -32),
        assert(state.getBalances("charlie").getBalance("atom") == 10),
        // now charlie holds 6 ETH
        assert(state.getBalances("alice").getBalance("eth") == 0),
        assert(state.getBalances("bob").getBalance("eth") == 0),
        assert(state.getBalances("charlie").getBalance("eth") == 6),
        // "noAccount" holds nothing
        assert(state.getBalances("noAccount").getBalance("atom") == 0),
        assert(state.getBalances("noAccount").getBalance("eth") == 0),

        // now transfer 4 of charlie's ETH to bob
        transfer("charlie", "bob", "eth", 4)
      })
      .then(all {
        // ATOM balances remain the same
        assert(state.getBalances("alice").getBalance("atom") == 25),
        assert(state.getBalances("bob").getBalance("atom") == -32),
        assert(state.getBalances("charlie").getBalance("atom") == 10),
        // bob got 4 of charlie's ETH
        assert(state.getBalances("alice").getBalance("eth") == 0),
        assert(state.getBalances("bob").getBalance("eth") == 4),
        assert(state.getBalances("charlie").getBalance("eth") == 2),
        // "noAccount" holds nothing
        assert(state.getBalances("noAccount").getBalance("atom") == 0),
        assert(state.getBalances("noAccount").getBalance("eth") == 0),

        // nothing changes
        state' = state
      })
  }

  /* ***************************************************************************
   * INVARIANTS
   * **************************************************************************/

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
}
