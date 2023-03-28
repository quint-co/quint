// -*- mode: Bluespec; -*-

/**
 * A specification of simple ERC20 that should be easy to use in other specs.
 *
 * The module erc20 closely follows the interface of IERC20 by OpenZeppelin.
 * However, since Quint is not Solidity, we have to adapt to the features of Quint.
 *
 * https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#IERC20
 *
 * Igor Konnov, Informal Systems, 2023
 */
module erc20 {
    // An address is simply is string. The particular format is not essential.
    type Address = str

    // We fix the pool of all addresses, as this make the specification easier to write.
    // To instantiate erc20 with a fixed set of addresses, use:
    // import erc20(AllAddresses = Set("", "a", "b", "c")) as myToken
    // val myTokenState = myToken::newErc20("b", 1000)
    const AllAddresses: Set[Address]

    // An EVM integer is 256 bits.
    // We are using big integers and check for overflows manually.
    type Uint = int
    pure def MAX_UINT = 2^256

    // A state of an ERC20 contract/token
    type Erc20State = {
        balanceOf: Address -> Uint,
        totalSupply: Uint,
        allowance: (Address, Address) -> Uint,
        owner: Address,
    }

    // The result of executing a ERC20 (error, nextState).
    // If error != "", error stores the error message.
    // In the future, we should use ADTs:
    // https://github.com/informalsystems/quint/issues/539
    type Erc20Result = (str, Erc20State)

    pure def returnError(msg: str, state: Erc20State): Erc20Result = {
        (msg, state)
    }

    pure def returnState(state: Erc20State): Erc20Result = {
        ("", state)
    }

    // An auxilliary definition similar to Solidity's require
    pure def require(cond: bool, msg: str): str = {
        if (cond) "" else msg
    }

    // an easy way to chain require calls
    pure def andRequire(prevErr: str, cond: bool, msg: str): str = {
        if (prevErr != "") prevErr else require(cond, msg)
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
        val err = require(fromAddr != "", "ERC20: transfer from the zero address")
            .andRequire(toAddr != "", "ERC20: transfer to the zero address")
            .andRequire(fromBalance >= amount, "ERC20: transfer amount exceeds balance")
        if (err != "") {
            returnError(err, state)
        } else {
            val newBalances =
                if (fromAddr == toAddr) {
                    state.balanceOf
                } else {
                    // Comment from ERC20.sol (see the above link): 
                    // Overflow not possible: the sum of all balances is capped
                    // by totalSupply, and the sum is preserved by
                    // decrementing then incrementing.
                    state.balanceOf
                      .set(fromAddr, fromBalance - amount)
                      .setBy(toAddr, old => old + amount)
                }
            returnState(state.with("balanceOf", newBalances))
        }
    }

    /**
     * ERC20: Moves amount tokens from the sender’s account to `toAddress`.
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Quint: also return an error code and the new state.
     * If the error != "", the new state should be applied.
     */
    pure def transfer(state: Erc20State, sender: Address,
            toAddr: Address, amount: Uint): (bool, Erc20Result) = {
        // `transfer` always returns true, but we should check Erc20Result.error
        (true, _transfer(state, sender, toAddr, amount))
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
            spender: Address, amount: Uint): (bool, Erc20Result) = {
         val err = require(sender != "", "ERC20: transfer from the zero address")
            .andRequire(spender != "", "ERC20: transfer to the zero address")
        if (err != "") {
            (true, returnError(err, state))
        } else {
            // the case of sender == spender seems to be allowed
            val newAllowance = state.allowance.set((sender, spender), amount)
            (true, returnState(state.with("allowance", newAllowance)))
        }
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
            fromAddr: Address, toAddr: Address, amount: Uint): (bool, Erc20Result) = {
        // _spendAllowance
        val currentAllowance = state.allowance(fromAddr, sender)
        val err =
            require(currentAllowance >= amount, "ERC20: insufficient allowance")
                .andRequire(fromAddr != "", "ERC20: approve from the zero address")
                .andRequire(toAddr != "", "ERC20: approve to the zero address")
        val updatedState =
            if (currentAllowance == MAX_UINT) {
                // allowance is not subtracted in this case
                state
            } else {
                // update allowances
                val newAllowance = state.allowance.setBy((fromAddr, sender), old => old - amount)
                state.with("allowance", newAllowance)
            }

        if (err != "") {
            (true, returnError(err, state))
        } else {
            // do the transfer
            (true, _transfer(updatedState, fromAddr, toAddr, amount))
        }
    }
}

// executing ERC20 transactions together with the mempool
module mempool {
    // We are using this module to test the contract,
    // so we fix the set of addresses right away.
    pure val ADDR = Set("alice", "bob", "eve", "")
    // We also restrict the amounts to restrict the search scope.
    pure val AMOUNTS = 0.to(100)
    // import all definitions from erc20 for the fixed addresses
    import erc20(AllAddresses = ADDR).*

    // What kind of transaction could be submitted to the mempool.
    // Currently, we are using a record to represent all kinds of transactions.
    // In the future, we should use ADTs:
    // https://github.com/informalsystems/quint/issues/539
    type Transaction = {
        kind: str,
        status: str,
        sender: Address,
        spender: Address,
        fromAddr: Address,
        toAddr: Address,
        amount: Uint
    }

    pure val NoneTx: Transaction = {
        kind: "none", status: "none", sender: "",
        spender: "", fromAddr: "", toAddr: "", amount: 0
    }

    pure def TransferTx(sender: Address, toAddr: Address, amount: Uint): Transaction = {
        kind: "transfer", status: "pending", sender: sender,
        toAddr: toAddr, amount: amount, fromAddr: "", spender: ""
    }

    pure def ApproveTx(sender: Address, spender: Address, amount: Uint): Transaction = {
        kind: "approve", status: "pending", sender: sender, spender: spender,
        fromAddr: "", toAddr: "", amount: amount
    }

    pure def TransferFromTx(sender: Address, fromAddr: Address, toAddr: Address, amount: Uint): Transaction = {
        kind: "transferFrom", status: "pending", sender: sender,
        fromAddr: fromAddr, toAddr: toAddr, amount: amount, spender: ""
    }

    // the state of the ERC20 contract (we have just one here)
    var erc20State: Erc20State
    // The state of the mempool. Recall that transactions are not ordered!
    // For simplicity, we do not count identical transactions twice.
    // If we needed that, we could add an id field to a transaction.
    var mempool: Set[Transaction]
    // The last submitted or executed transaction
    var lastTx: Transaction

    action init = all {
        nondet sender = oneOf(ADDR)
        nondet initialSupply = oneOf(AMOUNTS)
        erc20State' = newErc20(sender, initialSupply),
        mempool' = Set(),
        lastTx' = NoneTx,
    }

    // Submit a transaction to the memory pool.
    // This transaction is simply added to the pool, but not executed.
    action submit(tx: Transaction): bool = all {
        mempool' = mempool.union(Set(tx)),
        erc20State' = erc20State,
        lastTx' = tx,
    }

    // an auxilliary action that assigns variables from a method execution result
    action fromResult(tx: Transaction, r: (bool, Erc20Result)): bool = all {
        val status = if (r._1 and r._2._1 != "") r._2._1 else "success"
        lastTx' = tx.with("status", status),
        erc20State' = r._2._2,
    }

    // commit a transaction from the memory pool
    action commit(tx: Transaction): bool = all {
        mempool' = mempool.exclude(Set(tx)),
        any {
            all {
                tx.kind == "transfer",
                fromResult(tx, transfer(erc20State, tx.sender, tx.toAddr, tx.amount))
            },
            all {
                tx.kind == "approve",
                fromResult(tx, approve(erc20State, tx.sender, tx.spender, tx.amount))
            },
            all {
                tx.kind == "transferFrom",
                fromResult(tx, transferFrom(erc20State, tx.sender, tx.fromAddr, tx.toAddr, tx.amount))
            },
        }
    }
    // Possible behavior of the mempool and ERC20
    // (constrained by the above parameters)
    action step =
        any {
            // Post the contract transactions.
            nondet sender = oneOf(ADDR)
            nondet amount = oneOf(AMOUNTS)
            any {
                // transfer
                nondet toAddr = oneOf(ADDR)
                submit(TransferTx(sender, toAddr, amount)),
                // approve
                nondet spender = oneOf(ADDR)
                submit(ApproveTx(sender, spender, amount)),
                // transferFrom
                nondet fromAddr = oneOf(ADDR)
                nondet toAddr = oneOf(ADDR)
                submit(TransferFromTx(sender, fromAddr, toAddr, amount)),
            },
            // commit one of the contract transactions
            all {
                mempool != Set(),
                nondet tx = oneOf(mempool)
                commit(tx)
            }
        }

    /**
    * No transferFrom should be possible, while there is a pending approval
    * for a smaller amount. This invariant is violated, as explained in:
    *
    * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    *
    * We can check this invariant with the Quint simulator:
    *
    * quint run --max-samples=1000000 --max-steps=6 \
    *   --invariant=NoTransferFromWhileApproveInFlight --main=mempool erc20.qnt
    */
    val noTransferFromWhileApproveInFlight = {
        val badExample = all {
            lastTx.kind == "transferFrom",
            lastTx.amount > 0,
            lastTx.status == "success",
            mempool.exists(tx => all {
                tx.kind == "approve",
                tx.sender == lastTx.fromAddr,
                tx.spender == lastTx.sender,
                tx.amount < lastTx.amount,
                tx.amount > 0,
            })
        }
        not(badExample)
    }
    
    /**
     * A test that demonstrates that the above invariant may be violated.
     * Yes, we have copied it from the simulator output.
     */
    run transferFromWhileApproveInFlightTest = {
        all {
            erc20State' = newErc20("alice", 91),
            mempool' = Set(),
            lastTx' = NoneTx,
        }
        // alice set a high approval for bob
        .then(submit(ApproveTx("alice", "bob", 92)))
        // bob immediately initiates his transferFrom transaction
        .then(submit(TransferFromTx("bob", "alice", "eve", 54)))
        // alice changes her mind and lowers her approval to bob
        .then(submit(ApproveTx("alice", "bob", 9)))
        // but the previous approval arrives at the ledger
        .then(commit(ApproveTx("alice", "bob", 92)))
        // ...and bob manages to transfer more than alice wanted to
        .then(commit(TransferFromTx("bob", "alice", "eve", 54)))
    }
}