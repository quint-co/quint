// -*- mode: Bluespec; -*-

/**
 *
 * This is a fragment of https://github.com/informalsystems/quint/tree/main/examples/solidity/ERC20/erc20.qnt
 * adapted to illustrate the proposed sum-type syntax.
 *
 */
module erc20 {
    // An address is simply is string. The particular format is not essential.
    type Address = str
    // the special zero address, which corresponds to the address 0 in EVM
    pure val ZERO_ADDRESS = "0"

    // We fix the pool of all addresses, as this make the specification easier to write.
    // To instantiate erc20 with a fixed set of addresses, use:
    // import erc20(AllAddresses = Set(ZERO_ADDRESS, "a", "b", "c")) as myToken
    // val myTokenState = myToken::newErc20("b", 1000)
    const AllAddresses: Set[Address]

    // An EVM integer is 256 bits.
    // We are using big integers and check for overflows manually.
    type Uint = int
    pure val MAX_UINT = 2^256 - 1
    pure def isUint(i: int): bool = 0 <= i and i <= MAX_UINT

    // A state of an ERC20 contract/token
    type Erc20State = {
        balanceOf: Address -> Uint,
        totalSupply: Uint,
        allowance: (Address, Address) -> Uint,
        owner: Address,
    }

    // Example of a sum type representing a
    // NOTE: Once we support parametric sum-types we can generalize this alias and the map operators
    type Erc20Result =
         | Ok(Erc20State)
         | Error(str)

    pure def mapState(r:Erc20Result, f:Erc20State => Erc20State): Erc20Result =
         match r {
            | Ok(s)    => Ok(f(s))
            | Error(_) => r
        }

    pure def flatMap(r:Erc20Result, f:Erc20State => Erc20Result): Erc20Result =
         match r {
            | Ok(s)    => f(s)
            | Error(_) => r
        }

    // An auxiliary definition similar to Solidity's require
    pure def require(r: Erc20Result, cond: bool, msg: str): Erc20Result =
        match r {
            | Error(_) => r
            | _        => if (cond) r else Error(msg)
        }

    // contract initialization
    pure def newErc20(sender: Address, initialSupply: Uint): Erc20State = {
        balanceOf: AllAddresses.mapBy(a => if (a != sender) 0 else initialSupply),
        totalSupply: initialSupply,
        allowance: tuples(AllAddresses, AllAddresses).mapBy(p => 0),
        owner: sender,
    }

    /**
     * Returns the amount of tokens in existence.
     */
    pure def totalSupply(state: Erc20State): Uint = {
        state.totalSupply
    }

    /**
     * Returns the amount of tokens owned by account.
     */
    pure def balanceOf(state: Erc20State, account: Address): Uint = {
        state.balanceOf.get(account)
    }

    // An internal implementation, similar to OpenZeppelin's
    // https://github.com/OpenZeppelin/openzeppelin-contracts/blob/ca822213f2275a14c26167bd387ac3522da67fe9/contracts/token/ERC20/ERC20.sol#L222
    pure def _transfer(state: Erc20State,
            fromAddr: Address, toAddr: Address, amount: Uint): Erc20Result = {
        val fromBalance = state.balanceOf.get(fromAddr)
        Ok(state)
            .require(fromAddr != ZERO_ADDRESS, "ERC20: transfer from the zero address")
            .require(toAddr != ZERO_ADDRESS, "ERC20: transfer to the zero address")
            .require(fromBalance >= amount, "ERC20: transfer amount exceeds balance")
            .mapState(s => {
                val newBalances =
                    if (fromAddr == toAddr) {
                        s.balanceOf
                    } else {
                        // Comment from ERC20.sol (see the above link):
                        // Overflow not possible: the sum of all balances is capped
                        // by totalSupply, and the sum is preserved by
                        // decrementing then incrementing.
                        s.balanceOf
                        .set(fromAddr, fromBalance - amount)
                        .setBy(toAddr, old => old + amount)
                    }
                {...s, balanceOf: newBalances}
            })
    }

    /**
     * ERC20: Moves amount tokens from the sender’s account to `toAddress`.
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Quint: also return an error code and the new state.
     * If the error != "", the new state should be applied.
     */
    pure def transfer(state: Erc20State, sender: Address,
            toAddr: Address, amount: Uint): Erc20Result = {
        // `transfer` always returns true, but we should check Erc20Result.error
        _transfer(state, sender, toAddr, amount)
    }

    /**
     * ERC20: Returns the remaining number of tokens that spender will be allowed to
     * spend on behalf of owner through transferFrom. This is zero by default.
     *
     * This value may change when approve or transferFrom are called.
     *
     * Quint: the actual allowance is set up to 0 in newErc20.
     */
    pure def allowance(state: Erc20State, owner: Address, spender: Address): Uint = {
        state.allowance.get((owner, spender))
    }

    /**
     * ERC20: Sets amount as the allowance of spender over the caller’s tokens.
     *
     * Returns a boolean value (and the new state) indicating whether the
     * operation succeeded.
     *
     * Quint: also return an error code and the new state.
     * If the error != "", the new state should be applied.
     */
    pure def approve(state: Erc20State, sender: Address,
            spender: Address, amount: Uint): Erc20Result = {
        Ok(state)
            .require(sender != ZERO_ADDRESS, "ERC20: transfer from the zero address")
            .require(spender != ZERO_ADDRESS, "ERC20: transfer to the zero address")
            .mapState(s => {
                // the case of sender == spender seems to be allowed
                val newAllowance = state.allowance.set((sender, spender), amount)
                {...s, allowance: newAllowance}
            })
    }

    /**
     * Moves amount tokens from `fromAddr` to `toAddr` using the allowance mechanism.
     * amount is then deducted from the caller’s allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Quint: also return an error code and the new state.
     * If the error != "", the new state should be applied.
     */
    pure def transferFrom(state: Erc20State, sender: Address,
            fromAddr: Address, toAddr: Address, amount: Uint): Erc20Result = {
        // _spendAllowance
        val currentAllowance = state.allowance(fromAddr, sender)
        Ok(state)
            .require(currentAllowance >= amount, "ERC20: insufficient allowance")
            .require(fromAddr != ZERO_ADDRESS, "ERC20: approve from the zero address")
            .require(toAddr != ZERO_ADDRESS, "ERC20: approve to the zero address")
            .mapState(s => {
                if (currentAllowance == MAX_UINT) {
                    // allowance is not subtracted in this case
                    s
                } else {
                    // update allowances
                    val newAllowance = s.allowance.setBy((fromAddr, sender), old => old - amount)
                    {...s, allowance: newAllowance}
                }})
            // do the transfer
            .flatMap(s => s._transfer(fromAddr, toAddr, amount))
    }

    // Properties that do not belong to the original EIP20 spec,
    // but they should hold true.

    pure def sumOverBalances(balances: Address -> int): int = {
        balances.keys().fold(0, (sum, a) => sum + balances.get(a))
    }

    // The total supply, as stored in the state,
    // is equal to the sum of amounts over all balances.
    pure def isTotalSupplyCorrect(state: Erc20State): bool = {
      state.balanceOf.sumOverBalances() == state.totalSupply
    }

    // Zero address should not carry coins.
    pure def isZeroAddressEmpty(state: Erc20State): bool = {
        state.balanceOf.get(ZERO_ADDRESS) == 0
    }

    // There are no overflows in totalSupply, balanceOf, and approve.
    pure def isNoOverflows(state: Erc20State): bool = and {
        isUint(state.totalSupply),
        state.balanceOf.keys().forall(a => isUint(state.balanceOf.get(a))),
        state.allowance.keys().forall(a => isUint(state.allowance.get(a))),
    }
}
