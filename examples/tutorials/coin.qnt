/**
 * Coin contract from the Solidity examples [1]. It is a nice starting
 * example for Solidity. It is a nice starting example for Quint too.
 *
 * This contract introduces a custom coin. Although Solidity contracts
 * may easily call other contracts, our protocol specification is
 * not easily composable with other protocol specifications. It is possible to
 * make it composable, but it would introduce additional code (following simple
 * idioms), which we want to avoid in this introductory example.
 *
 * As we focus on the protocol idea (in Quint), not the implementation (in Solidity),
 * we omit events and error codes.
 *
 * [1]: https://docs.soliditylang.org/en/v0.8.17/introduction-to-smart-contracts.html#subcurrency-example
 *
 * Igor Konnov, Informal Systems, 2023
 */
module coin {

    // TYPE DEFINITIONS

    // encode addresses as string literals
    type Addr = str

    // We declare a Solidity uint (256 bit) as an alias of Quint int.
    // Note that these UInt values are still integers, which can get
    // arbitrarily large. Hence, we have to take care of overflows.
    // In the future, Quint will have a standard library for that.
    type UInt = int

    // FUNCTIONAL LAYER:
    // Values and functions that are state-independent

    // the maximal value a Solidity UInt can carry
    pure val MAX_UINT = 2^256 - 1

    // does a big integer represent a Solidity UInt?
    pure def isUInt(i: int): bool = (0 <= i and i <= MAX_UINT)

    // STATE MACHINE:
    // State-dependent definitions and actions

    // Currently, we fix the set of all addresses to a small set.
    // In the future, we will be using the commented-out constant declaration.
    // For now, we are using simple aliases instead of actual Ethereum addresses.
    //const ADDR: Set[Addr]
    pure val ADDR = Set("null", "alice", "bob", "charlie", "eve")

    // the minter's address
    var minter: Addr
    // the balances in the subcurrency tokens
    var balances: Addr -> UInt
    // a handy definition to query the whole state in REPL at once
    val state = { minter: minter, balances: balances }
    
    // a helper function to make preconditions similar to Solidity
    def require(cond: bool): bool = cond

    // compute the total supply of coins over all balances
    val totalSupply = ADDR.fold(0, (sum, a) => sum + balances.get(a))

    // state initialization
    action init: bool = {
        // since the contract can be initialized by an arbitrary message sender,
        // we choose the sender from the set of all addresses non-deterministically.
        nondet sender = oneOf(ADDR)
        all {
            minter' = sender,
            balances' = ADDR.mapBy(a => 0)
        }
    }

    // Sends an amount of newly created coins to an address.
    // Can only be called by the minter, that is, the contract creator.
    // Note that we have to add `sender` as an action parameter,
    // which is accessed implicitly via `msg.sender` in Solidity.
    action mint(sender: Addr, receiver: Addr, amount: UInt): bool = all {
        require(sender == minter),
        val newBal = balances.get(receiver) + amount
        all {
            // Solidity does the overflow check under the hood.
            // We have to add it ourselves.
            require(isUInt(newBal)),
            // update the balances and keep the minter address
            balances' = balances.set(receiver, newBal),
            minter' = minter,
        }
    }

    // Sends an amount of existing coins from any caller (sender)
    // to a receiver's address.
    // Note that we have to add `sender` as an action parameter,
    // which is accessed via implicit `msg.sender` in Solidity.
    action send(sender: Addr, receiver: Addr, amount: UInt): bool = all {
        require(not(amount > balances.get(sender))),
        if (sender == receiver) {
            balances' = balances
        } else {
            val newSenderBal = balances.get(sender) - amount
            val newReceiverBal = balances.get(receiver) + amount
            all {
                // Again, Solidity does an automatic overflow test.
                // We do it ourselves.
                require(isUInt(newSenderBal)),
                require(isUInt(newReceiverBal)),
                balances' =
                    balances
                    .set(sender, newSenderBal)
                    .set(receiver, newReceiverBal)
            }
        },
        // keep the minter unchanged
        minter' = minter,
    }

    // All possible behaviors of the protocol in one action.
    action step: bool = {
        nondet sender = oneOf(ADDR)
        nondet receiver = oneOf(ADDR)
        nondet amount = 0.to(MAX_UINT).oneOf()
        // execute one of the available actions/methods
        any {
            mint(sender, receiver, amount),
            send(sender, receiver, amount),
        }
    }

    // INVARIANTS AND TEMPORAL PROPERTIES

    // One of the simplest properties is that all balances are within the uint range.
    // While it is automatically guaranteed by Solidity, our specification is using
    // big integers. Hence, it makes sense to check the range.
    val balancesRangeInv: bool = 
        ADDR.forall(a => isUInt(balances.get(a)))

    // It is desirable that the total supply of tokens fits into UInt.
    // Otherwise, a blockchain implementation or the user interface
    // may run into an unexpected overflow when adding up the balances.
    val totalSupplyDoesNotOverflowInv: bool = {
        isUInt(totalSupply)
    }

    // The temporal property that says the following:
    // Assume that we want to check the temporal property `NoSupplyOverflow`
    // for every initial state. Then we have to check for every initial state
    // that it never produces a computation that ends in a state violating
    // `totalSupplyDoesNotOverflowInv`. In general, temporal properties may be
    // checked against any kinds of states, not only initial ones.
    temporal NoSupplyOverflow: bool = always(totalSupplyDoesNotOverflowInv)

    // TESTS

    // send should not work without minting
    run sendWithoutMintTest = {
        init.then(send(minter, "bob", 5))
            .fail()
    }

    // `mint`, then `send`
    run mintSendTest = {
        init.then(mint(minter, "bob", 10))
            .then(send("bob", "eve", 4))
            .then(all {
                assert(balances.get("bob") == 6),
                assert(balances.get("eve") == 4),
                minter' = minter,
                balances' = balances,
            })
    }

    // Mint some coins for Eve and Bob.
    // Test that Eve can always send coins to Bob,
    // if she has enough on her balance.
    // This test may fail sometimes. Do you see why?
    // If not, execute it multiple times in REPL, until it fails.
    run mintTwiceThenSendError = {
        // non-deterministically pick some amounts to mint and send
        nondet mintEve = 0.to(MAX_UINT).oneOf()
        nondet mintBob = 0.to(MAX_UINT).oneOf()
        nondet eveToBob = 0.to(MAX_UINT).oneOf()
        // execute a fixed sequence `init`, `mint`, `mint`, `send`
        init.then(mint(minter, "eve", mintEve))
            .then(mint(minter, "bob", mintBob))
            .then(
                if (eveToBob <= balances.get("eve")) {
                    // if Eve has enough tokens, send to Bob should pass
                    send("eve", "bob", eveToBob)
                } else {
                    // otherwise, just ignore the test
                    all { minter' = minter, balances' = balances }
                }
            )
    }

    // to run the random simulator for 10000 executions, each up to 10 actions,
    // execute the following in the command line:
    //
    // $ quint run --invariant totalSupplyDoesNotOverflowInv coin.qnt



}
