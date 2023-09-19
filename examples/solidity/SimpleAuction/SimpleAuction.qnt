// -*- mode: Bluespec; -*-
// Simple Auction from the Solidity examples [1].
// We use this example to show how Quint could be used for explaining
// Solidity contracts.
//
// This is a work-in-progress example. We had to introduce workarounds
// for some language features that are not implemented yet. If you have any
// feedback on this example, please let us know in the discussions:
// https://github.com/informalsystems/quint/discussions
//
// This protocol spec is written for the case when this contract is not
// called by another contract. If you want to make SimpleAuction callable by
// other contracts, you have to define pure versions of `bid`, `withdraw`, and `auctionEnd`.
// Then you would have to use pure definitions in the spec of the calling contract.
//
// TODO: add more invariants and tests
//
// [1]: https://docs.soliditylang.org/en/v0.8.17/solidity-by-example.html#simple-open-auction
//
// Igor Konnov, Informal Systems, 2023
module SimpleAuction {
    // TYPE DEFINITIONS

    // encode addresses as string literals
    type Addr = str
    // We declare a Solidity uint (256 bit) as an alias of Quint int.
    // Note that UInt values are still unboundedly big integers,
    // so we have to take care of overflows.
    // In the future, Quint will have a standard library for that.
    type UInt = int

    // Encapsulate the state of the SimpleAuction contract in AuctionState.
    // This is essentially the private state of the contract.
    type AuctionState = {
        // The address assigned to the contract when it is instantiated.
        // This address is accessible via address(this) in Solidity.
        addressOfThis: Addr,
        // The address of the beneficiary who receives the tokens once the auction is closed.
        beneficiary: Addr,
        // A time period in seconds. Note that Quint has only big integers by default,
        // which we are using here instead of uint.
        auctionEndTime: UInt,
        // The address of the bidder who made the highest bid so far
        highestBidder: Addr,
        // ...and their bid
        highestBid: UInt,
        // Allowed withdrawals of previous bids
        pendingReturns: Addr -> UInt,
        // ended == true iff the auction is over
        ended: bool,
    }

    // Encapsulate the relevant part of the EVM state in EvmState.
    type EvmState = {
        // current block timestamp in seconds since Unix epoch
        blockTime: UInt,
        // tokens assigned to the addresses
        balances: Addr -> UInt,
        // error == true iff an error has occurred (we ignore the exact message)
        error: bool,
    }

    // FUNCTIONAL LAYER: The values and functions that are state-independent.

    // the maximal value Solidity UInt can carry
    pure val MAX_UINT = 2^256 - 1

    // does a big integer represent Solidity uint?
    pure def isUInt(i: int): bool = 0 <= i and i <= MAX_UINT

    // Currently, we fix the set of all addresses to a small set.
    // In the future, we will be using the commented-out constant declaration.
    // For now, we are using simple aliases instead of actual Ethereum addresses.
    // The names that in the set CONTRACT_ADDR belong to some contracts.
    //const ADDR: Set[Addr]
    pure val CONTRACT_ADDR = Set("hanSol", "jajaSol", "yodaSol")
    pure val ADDR = Set("null", "alice", "bob", "charlie", "eve").union(CONTRACT_ADDR)

    // Model the internal behavior of the EVM sending tokens from one address to another.
    // No gas fees are taken into account.
    pure def evmSend(es: EvmState,
                     fromAddr: Addr, toAddr: Addr, value: int): EvmState = {
        val bs = es.balances
        val fromBal = bs.get(fromAddr) - value
        val toBal = bs.get(toAddr) + value
        // compute the balances after `evmSend`
        val newBs =
            if (fromAddr == toAddr) {
                bs
            } else {
                bs.set(fromAddr, fromBal).set(toAddr, toBal)
            }
        if (not(isUInt(fromBal)) or not(isUInt(toBal)) or es.error) {
            // produce an error on overflow/underflow and do not update the balances
            es.with("error", true)
        } else {
            es.with("balances", newBs)
        }
    }

    // compute the total supply held by balances
    pure def totalSupply(balances: Addr -> UInt): UInt = {
        balances.keys().fold(0, ((sum, a) => sum + balances.get(a)))
    }

    // STATE MACHINE: state-dependent definitions and actions

    // The state of SimpleAuction
    var auctionState: AuctionState
    // The state of the standard EVM machine
    var evmState: EvmState

    // a convenient definition to evaluate the whole state in REPL
    def state = {
        auctionState: auctionState,
        evmState: evmState,
    }

    // Maximal balance per account in the initial states.
    // Use MAX_UINT, when #566 is fixed.
    // https://github.com/informalsystems/quint/issues/566
    pure val MAX_INIT_BALANCE = 2^10

    // Maximal block time in the initial states.
    // Use MAX_UINT, when #566 is fixed.
    // https://github.com/informalsystems/quint/issues/566
    pure val MAX_INIT_TIME = 2^10

    // Initialize the state machine.
    // If you want to see more realistic conditions for testing,
    // see the unit tests below.
    action init = {
        // The contract constructor may be called at various time.
        // Hence, non-deterministically select:
        // the initial balances, the block time, the contract address.
        nondet initialBalances = ADDR.setOfMaps(0.to(MAX_INIT_BALANCE)).oneOf()
        nondet initialBlockTime = 0.to(MAX_INIT_TIME).oneOf()
        nondet thisAddr = CONTRACT_ADDR.oneOf()
        // non-deterministically select the constructor parameters
        nondet auctionEndTime = (initialBlockTime + 1).to(MAX_INIT_TIME).oneOf()
        nondet beneficiaryAddr = ADDR.oneOf()
        all {
            evmState' = {
                blockTime: initialBlockTime,
                balances: initialBalances,
                error: false,
            },
            auctionState' = {
                addressOfThis: thisAddr,
                beneficiary: beneficiaryAddr,
                highestBid: 0,
                highestBidder: "null",
                auctionEndTime: auctionEndTime,
                pendingReturns: ADDR.mapBy(a => 0),
                ended: false
            }
        }
    }

    // Bid on the auction.
    // The address `sender` is doing the bid with `value` tokens.
    action bid(sender: Addr, value: int): bool = all {
        // the bidding period should not be over
        not(evmState.blockTime > auctionState.auctionEndTime),
        // the proposed bid should not be smaller than the highest bid
        not(value <= auctionState.highestBid),
        // introduce an alias for auctionState, to decrease verbosity
        val s = auctionState
        // compute the new pending return for the highest bidder
        val newReturn = s.pendingReturns.get(s.highestBidder) + s.highestBid
        all {
            // uint is 256-bit in Solidity, so an overflow would revert the transaction
            (s.highestBid != 0) implies (newReturn <= MAX_UINT),
            // compute the new pending returns
            val newPendingReturns = s.pendingReturns.set(s.highestBidder, newReturn)
            // update the auction state
            auctionState' =
                s.with("highestBid", value)
                  .with("highestBidder", sender)
                  .with("pendingReturns", newPendingReturns),
            // update the balances
            val nes = evmSend(evmState, sender, s.addressOfThis, value)
            all {
                not(nes.error),
                evmState' = nes
            }
        }
    }

    // Withdraw a bid that was overbid
    action withdraw(sender: Addr): bool = {
        val amount = auctionState.pendingReturns.get(sender)
        // In contrast to Solidity, Quint does not have in-place updates.
        // Hence, we have to model the effect of the subsequent calls.
        // We model two cases:
        //   1. The tokens are sent back to a user address.
        //   2. The tokens are sent back to another contract.
        if (amount > 0) {
            // a Solidity contract cannot distinguish between
            // a user address and a contract address. We can.
            if (not(CONTRACT_ADDR.contains(sender))) {
                all {
                    val nes = evmSend(evmState, auctionState.addressOfThis, sender, amount)
                    all {
                        not(nes.error),
                        evmState' = nes,
                        val npr = auctionState.pendingReturns.set(sender, 0)
                        auctionState' = auctionState.with("pendingReturns", npr),
                    },
                }
            } else {
                // This contract calls another contract. In general,
                // we cannot say much about its modifications to the balances.
                // Moreover, the other contract may call this contract again,
                // which may produce new `auctionState`. Yeah, this is Solidity.
                // For simplicity, we assume that a subsequent call to this contract
                // does not change `auctionState`.
                nondet newBalances = ADDR.setOfMaps(0.to(MAX_INIT_BALANCE)).oneOf()
                all {
                    // Whatever contract is called, it cannot mint new tokens.
                    // This condition will fail often in the random simulator.
                    // We need a model checker to produce good newBalances.
                    totalSupply(newBalances) == totalSupply(evmState.balances),
                    // Also, an external contract should not be able to decrease
                    // the balance of this contract, but it can increase the balance!
                    newBalances.get(auctionState.addressOfThis)
                        >= evmState.balances.get(auctionState.addressOfThis),
                    evmState' = evmState.with("balances", newBalances),
                    auctionState' = auctionState,
                }
            }
        } else {
            all { evmState' = evmState, auctionState' = auctionState }
        }
    }

    // End the auction and send the highest bid
    // to the beneficiary.
    action auctionEnd(): bool = all {
        not(evmState.blockTime < auctionState.auctionEndTime),
        not(auctionState.ended),
        auctionState' = auctionState.with("ended", true),
        // this contract transfers the highest bid to the bineficiary
        evmState' = evmSend(evmState, auctionState.addressOfThis,
            auctionState.beneficiary, auctionState.highestBid)
    }

    // this is not part of the contract but modeling of EVM
    action nextBlock(): bool = all {
        auctionState' = auctionState,
        nondet nextTime = (evmState.blockTime + 1).to(MAX_UINT).oneOf()
        evmState' = evmState.with("blockTime", nextTime)
    }

    // UNIT TESTS
    // TODO: add more tests

    // a simple deterministic initializer, to fix the initial states for simple tests
    action fixInit = {
        all {
            evmState' = {
                blockTime: 10,
                // every account has exactly 21 tokens
                balances: ADDR.mapBy(a => 21),
                error: false,
            },
            auctionState' = {
                addressOfThis: "hanSol",
                beneficiary: "eve",
                highestBid: 0,
                highestBidder: "null",
                auctionEndTime: 12,
                pendingReturns: ADDR.mapBy(a => 0),
                ended: false
            }
        }
    }

    // test that the bidder can withdraw their tokens, if they were overbid
    run bidWithdrawTest = {
        fixInit
            .then(bid("alice", 5))
            .then(bid("bob", 6))
            .then(withdraw("alice"))
            .then(all {
                // Alice got her tokens back
                assert(evmState.balances.get("alice") == 21),
                evmState' = evmState,
                auctionState' = auctionState,
            })
    }

    // test that the highest bidder cannot withdraw the tokens
    run bidNoWithdrawTest = {
        fixInit
            .then(bid("alice", 5))
            .then(withdraw("alice"))
            .then(all {
                // Alice did not get her tokens back
                assert(evmState.balances.get("alice") == 16),
                // she is still the highest bidder
                assert(auctionState.highestBidder == "alice"),
                evmState' = evmState,
                auctionState' = auctionState,
            })
    }

    // test that the action can be ended
    run bidAuctionEndTest = {
        fixInit
            .then(bid("alice", 5))
            .then(bid("bob", 6))
            .then(all {
                // manually move the block time beyond the auction end time
                evmState' = evmState.with("blockTime", auctionState.auctionEndTime + 5),
                auctionState' = auctionState,
            })
            .then(withdraw("alice"))
            .then(auctionEnd)
            .then(all {
                // the auction is over
                assert(auctionState.ended),
                assert(ADDR.forall(a => auctionState.pendingReturns.get(a) == 0)),
                // Alice got her tokens back
                assert(evmState.balances.get("alice") == 21),
                // Bob lost his tokens to the beneficiary (Eve)
                assert(evmState.balances.get("bob") == 21 - 6),
                assert(evmState.balances.get("eve") == 21 + 6),
                // keep the state
                evmState' = evmState,
                auctionState' = auctionState,
            })
    }

    // TODO: add PBT-like tests
}
