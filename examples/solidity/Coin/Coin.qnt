/**
 * Coin contract from the Solidity examples [1]. It is a nice starting
 * example for Solidity. It is a nice starting example for Quint too.
 *
 * This contract introduces a custom token. Although Solidity contracts
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
module Coin {
    // TYPE DEFINITIONS

    // encode addresses as string literals
    type Addr = str
    // We declare a Solidity uint (256 bit) as an alias of Quint int.
    // Note that these UInt values are still unboundedly big integers,
    // so we have to take care of overflows.
    // In the future, Quint will have a standard library for that.
    type UInt = int

    // FUNCTIONAL LAYER:
    // Values and functions that are state-independent

    // the maximal value Solidity UInt can carry
    pure val MAX_UINT = 2^256 - 1

    // does a big integer represent Solidity uint?
    pure def isUInt(i: int): bool = 0 <= i and i <= MAX_UINT

    // Currently, we fix the set of all addresses to a small set.
    // In the future, we will be using the commented-out constant declaration.
    // For now, we are using simple aliases instead of actual Ethereum addresses.
    //const ADDR: Set[Addr]
    pure val ADDR = Set("null", "alice", "bob", "charlie", "eve")

    // STATE MACHINE:
    // State-dependent definitions and actions

    // the minter's address
    var minter: Addr
    // the balances in the subcurrency tokens
    var balances: Addr -> UInt
    // a handy definition to query the whole state in REPL at once
    def state = { minter: minter, balances: balances }
    
    // a helper function to make preconditions similar to Solidity
    def require(cond: bool): bool = cond

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
    // which is accessed via implicit `msg.sender` in Solidity.
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
    // Note that random simulation produces valid inputs to
    // this action with a low probability, since amount are chosen at random.
    // A symbolic model checker such as Apalache does not have any problem
    // with this. Random simulation requires a more restricted version of step.
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
    val balancesRangeInv = ADDR.forall(a =>
        val b = balances.get(a)
        (0 <= b) and (b <= MAX_UINT)
    )

    // UNIT TESTS

    // since `init` is completely non-deterministic,
    // we fix the values for simple unit tests
    action initFixed = all {
        minter' = "alice",
        balances' = ADDR.mapBy(a => 0)
    }

    // mint, then send
    run mintSendTest = {
        initFixed
            .then(mint("alice", "bob", 10))
            .then(send("bob", "eve", 4))
            .then(all {
                assert(balances.get("bob") == 6),
                assert(balances.get("eve") == 4),
                minter' = minter,
                balances' = balances,
            })
    }

    // send should not work without minting
    run sendWithoutMintTest = {
        initFixed
            .then(send("alice", "bob", 5))
            .fail()
    }

    // A random simulation test, similar to property-based testing.
    // We scope the inputs to a small set of values to increase
    // the probability of finding interesting examples.
    action stepScoped = {
        nondet sender = oneOf(ADDR)
        nondet receiver = oneOf(ADDR)
        // values from 0 to 10 and a few corner-case values
        nondet amount = 0.to(10).union(Set(MAX_UINT, -1, -10)).oneOf()
        // execute one of the available actions/methods
        any {
            mint(sender, receiver, amount),
            send(sender, receiver, amount),
        }
    }

    // to run the random simulator for 10000 executions, each up to 10 actions,
    // execute the following in REPL:
    // _test(10000, 10, "init", "stepScoped", "balancesRangeInv")
}