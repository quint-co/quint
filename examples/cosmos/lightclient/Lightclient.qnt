/**
 * A state-machine specification of the lite client verification,
 * following the English spec:
 *
 * https://github.com/cometbft/cometbft/blob/main/spec/light-client/verification/verification_003_draft.md
 */ 
module Lightclient {

    import typedefs.* from "./typedefs"

    // the parameters of Light Client
    
    // an index of the block header that the light client trusts by social consensus
    const TRUSTED_HEIGHT: int
    // an index of the block header that the light client tries to verify
    const TARGET_HEIGHT: int
    // the period within which the validators are trusted
    const TRUSTING_PERIOD: int
    // the assumed precision of the clock
    const CLOCK_DRIFT: int
    // the actual clock drift, which under normal circumstances should not
    // be larger than CLOCK_DRIFT (otherwise, there will be a bug)
    const REAL_CLOCK_DRIFT: int
    // Flag that determines whether primary is correct. Modifies the behavior of FetchLightBlockInto, and invariants.
    const IS_PRIMARY_CORRECT: bool
    // a pair (a, b) that limits that ratio of faulty validator in the blockchain
    // from above (exclusive). Tendermint security model prescribes 1 / 3.
    const FAULTY_RATIO: (int, int)

    // the current state of the light client
    var state: str
    // the next height to explore by the light client
    var nextHeight: int
    // the light client iteration, or the number of block tests
    var nprobes: int
  
    /* the light store */

    // a function from heights to LightBlocks
    var fetchedLightBlocks: LightBlockMap
    // a function from heights to block statuses
    var lightBlockStatus: LightBlockStatus
    // the latest verified block
    var latestVerified: LightBlock

    /* the light client previous state components, used for monitoring */
    var prevVerified: LightBlock
    var prevCurrent: LightBlock
    var prevLocalClock: int 
    var prevVerdict: str


    // This can be used both as initialization, and as a generic action
    action MonitorTransition(verified: LightBlock, current: LightBlock, pLocalClock: int, verdict: str): bool = all {
        prevVerified' = verified,
        prevCurrent' = current,
        prevLocalClock' = pLocalClock,
        prevVerdict' = verdict
    }

    /******************* Blockchain instance ***********************************/

    // A set of all nodes that can act as validators (correct and faulty)
    const AllNodes: Set[str]

    pure def ULTIMATE_HEIGHT = TARGET_HEIGHT + 1 

    /* Create an instance of Blockchain. */ 
    import Blockchain(
        AllNodes = AllNodes, 
        ULTIMATE_HEIGHT = ULTIMATE_HEIGHT, 
        TRUSTING_PERIOD = TRUSTING_PERIOD
        ) as BC from "./Blockchain"

    /************************** Lite client ************************************/

    /* the heights on which the light client is working */  
    pure def HEIGHTS = TRUSTED_HEIGHT.to(TARGET_HEIGHT)

    /* the control states of the lite client */ 
    pure def States = Set( "working", "finishedSuccess", "finishedFailure" )

    // The verification functions are implemented in the API
    import LCVerificationApi(
        TRUSTING_PERIOD = TRUSTING_PERIOD, 
        CLOCK_DRIFT = CLOCK_DRIFT,
        REAL_CLOCK_DRIFT = REAL_CLOCK_DRIFT,
        FAULTY_RATIO = FAULTY_RATIO
        ) as API from "./LCVerificationApi"


    /*
    Initial states of the light client.
    Initially, only the trusted light block is present.
    */
    action LCInit: bool = all {
        nondet tm = oneOf(Nat)
        all {
            tm >= 0,
            API::IsLocalClockWithinDrift(tm, BC::refClock),
            API::SetLocalClock(tm)
        },
        state' = "working",
        nextHeight' = TARGET_HEIGHT,
        nprobes' = 0, // no tests have been done so far
        val trustedBlock = BC::blockchain.get(TRUSTED_HEIGHT)
        val trustedLightBlock = {header: trustedBlock, Commits: AllNodes}
        all {
            // initially, fetchedLightBlocks is a function of one element, i.e., TRUSTED_HEIGHT
            fetchedLightBlocks' = Map(TRUSTED_HEIGHT -> trustedLightBlock),
            // initially, lightBlockStatus is a function of one element, i.e., TRUSTED_HEIGHT
            lightBlockStatus' = Map(TRUSTED_HEIGHT -> "StateVerified"),
            // the latest verified block the the trusted block
            latestVerified' = trustedLightBlock,
            MonitorTransition(trustedLightBlock, trustedLightBlock, API::localClock, "SUCCESS")
        }
    }

    /*
    Block should contain a copy of the block from the reference chain,
    with a matching commit.
    */
    def CopyLightBlockFromChain(block: LightBlock, height: int): bool = {
        val ref = BC::blockchain.get(height)
        val lastCommit = 
            if(height < ULTIMATE_HEIGHT) BC::blockchain.get(height + 1).lastCommit 
            // for the ultimate block, which we never use, since ULTIMATE_HEIGHT = TARGET_HEIGHT + 1
            else  BC::blockchain.get(height).VS 
        block == {header: ref, Commits: lastCommit}
    }   

    // If the primary is correct, the block comes from the reference chain.
    // If the primary is faulty, then the only constraint on block is enforced 
    // via IsLightBlockAllowedByDigitalSignatures
    //
    // [LCV-FUNC-FETCH.1::TLA.1]
    def FetchLightBlockInto(block: LightBlock, height: int): bool =
        if (IS_PRIMARY_CORRECT) CopyLightBlockFromChain(block, height)
        else BC::IsLightBlockAllowedByDigitalSignatures(height, block)

    // add a block into the light store    
    //
    // [LCV-FUNC-UPDATE.1::TLA.1]
    pure def LightStoreUpdateBlocks(lightBlocks: LightBlockMap, block: LightBlock): LightBlockMap = 
        lightBlocks.put(block.header.height, block)

    // update the state of a light block      
    //
    // [LCV-FUNC-UPDATE.1::TLA.1]
    pure def LightStoreUpdateStates(statuses: LightBlockStatus, ht: int, blockState: str): LightBlockStatus =
        statuses.put(ht, blockState)

    // Check, whether newHeight is a possible next height for the light client.
    //
    // [LCV-FUNC-SCHEDULE.1::TLA.1]
    pure def CanScheduleTo(newHeight: int, pLatestVerified: LightBlock, pNextHeight: int, pTargetHeight: int): bool = {
        val ht = pLatestVerified.header.height
        or {
            and{
                ht == pNextHeight,
                pNextHeight < newHeight,
                newHeight <= pTargetHeight
            },
            and {
                ht < pNextHeight,
                ht < pTargetHeight,
                ht < newHeight,
                newHeight < pNextHeight
            },
            and {
                ht == pTargetHeight,
                newHeight == pTargetHeight
            }
        }
    }

    // The loop of VerifyToTarget.
    //
    // [LCV-FUNC-MAIN.1::TLA-LOOP.1]
    action VerifyToTargetLoop: bool = all {
        // the loop condition is true
        latestVerified.header.height < TARGET_HEIGHT,
        // pick a light block, which will be constrained later
        nondet current = oneOf(BC::LightBlocks)
        all {
            // Get next LightBlock for verification
            if (nextHeight.in(fetchedLightBlocks.keys()))
                // copy the block from the light store
                all {
                    current == fetchedLightBlocks.get(nextHeight),
                    fetchedLightBlocks' = fetchedLightBlocks
                }
            else 
                // retrieve a light block and save it in the light store
                all {
                    FetchLightBlockInto(current, nextHeight),
                    fetchedLightBlocks' = LightStoreUpdateBlocks(fetchedLightBlocks, current)
                },  
            // Record that one more probe has been done (for complexity and model checking)
            nprobes' = nprobes + 1,
            // Verify the current block
            val verdict = API::ValidAndVerified(latestVerified, current, true)
            all {
                MonitorTransition(latestVerified, current, API::localClock, verdict),
                // Decide whether/how to continue
                if (verdict == "SUCCESS")
                    all {
                        lightBlockStatus' = LightStoreUpdateStates(lightBlockStatus, nextHeight, "StateVerified"),
                        latestVerified' = current,
                        state' =
                            if (current.header.height < TARGET_HEIGHT) "working"
                            else "finishedSuccess",
                        nondet newHeight = oneOf(HEIGHTS)
                        all {
                            CanScheduleTo(newHeight, current, nextHeight, TARGET_HEIGHT),
                            nextHeight' = newHeight
                        }
                    }
                else if (verdict == "NOT_ENOUGH_TRUST")
                    /*
                    do nothing: the light block current passed validation, but the validator
                    set is too different to verify it. We keep the state of
                    current at StateUnverified. For a later iteration, Schedule
                    might decide to try verification of that light block again.
                    */
                    all {
                        lightBlockStatus' = LightStoreUpdateStates(lightBlockStatus, nextHeight, "StateUnverified"),
                        latestVerified' = latestVerified,
                        state' = state,
                        nondet newHeight = oneOf(HEIGHTS)
                        all {
                            CanScheduleTo(newHeight, latestVerified, nextHeight, TARGET_HEIGHT),
                            nextHeight' = newHeight 
                        }
                    }
                else
                    // verdict is some error code
                    all {
                        lightBlockStatus' = LightStoreUpdateStates(lightBlockStatus, nextHeight, "StateFailed"),
                        state' = "finishedFailure",
                        latestVerified' = latestVerified,
                        nextHeight' = nextHeight
                    }
            }   
        }
    }

    // The terminating condition of VerifyToTarget.
    //
    // [LCV-FUNC-MAIN.1::TLA-LOOPCOND.1]
    action VerifyToTargetDone: bool = all {
        latestVerified.header.height >= TARGET_HEIGHT,
        state' = "finishedSuccess",
        nextHeight' = nextHeight,
        nprobes' = nprobes,
        fetchedLightBlocks' = fetchedLightBlocks,
        lightBlockStatus' = lightBlockStatus,
        latestVerified' = latestVerified,
        prevVerified' = prevVerified,
        prevCurrent' = prevCurrent,
        prevLocalClock' = prevLocalClock,
        prevVerdict' = prevVerdict
    }
        

    /*
    The local and global clocks can be updated. They can also drift from each other.
    Note that the local clock can actually go backwards in time.
    However, it still stays in the drift envelope
    of [refClock - REAL_CLOCK_DRIFT, refClock + REAL_CLOCK_DRIFT].
    */
    action AdvanceClocks: bool = {
        nondet refClockTm = oneOf(Nat)
        nondet tm = oneOf(Nat)
        all {
            BC::AdvanceTimeTo(refClockTm),
            tm >= 0,
            // if you want the clock to always grow monotonically, uncomment the next line:
            // tm > localClock,
            API::IsLocalClockWithinDrift(tm, refClockTm),
            API::SetLocalClock(tm)
        }
    }
            
    /********************* Lite client + Blockchain *******************/
    action Init: bool = all {
        // the blockchain is initialized immediately to the ULTIMATE_HEIGHT
        BC::InitToHeight(FAULTY_RATIO),
        // the light client starts
        LCInit
    }

    /*
    The system step is very simple.
    The light client is either executing VerifyToTarget, or it has terminated.
    (In the latter case, a model checker reports a deadlock.)
    Simultaneously, the global clock may advance.
    */
    action Next: bool = all {
        state == "working",
        any { VerifyToTargetLoop, VerifyToTargetDone },
        AdvanceClocks
    }

// /************************* Properties ******************************************/

    /* The properties to check */
    // this invariant candidate is false    
    def NeverFinish: bool = state == "working"

    // this invariant candidate is false    
    def NeverFinishNegative: bool = state != "finishedFailure"

    // This invariant holds true, when the primary is correct. 
    // This invariant candidate is false when the primary is faulty.    
    def NeverFinishNegativeWhenTrusted: bool =
        BC::InTrustingPeriod(BC::blockchain.get(TRUSTED_HEIGHT)) implies state != "finishedFailure"     

    // this invariant candidate is false    
    def NeverFinishPositive: bool = state != "finishedSuccess"

    /**
    Check that the target height has been reached upon successful termination.
    */
    def TargetHeightOnSuccessInv: bool =
        state == "finishedSuccess" implies and {
            TARGET_HEIGHT.in(fetchedLightBlocks.keys()),
            lightBlockStatus.get(TARGET_HEIGHT) == "StateVerified"
        }

    /**
    Correctness states that all the obtained headers are exactly like in the blockchain.
 
    It is always the case that every verified header in LightStore was generated by
    an instance of Tendermint consensus.
  
    [LCV-DIST-SAFE.1::CORRECTNESS-INV.1]
    */  
    def CorrectnessInv: bool =
        fetchedLightBlocks.keys().forall( h => 
            lightBlockStatus.get(h) == "StateVerified" implies
                fetchedLightBlocks.get(h).header == BC::blockchain.get(h)
        )
            
    /**
    No faulty block was used to construct a proof. This invariant holds,
    only if FAULTY_RATIO < 1/3.
    */
    def NoTrustOnFaultyBlockInv: bool = and {
        state == "finishedSuccess",
        fetchedLightBlocks.get(TARGET_HEIGHT).header == BC::blockchain.get(TARGET_HEIGHT)
    } implies CorrectnessInv

    /**
    Check that the sequence of the headers in storedLightBlocks satisfies ValidAndVerified = "SUCCESS" pairwise
    This property is easily violated, whenever a header cannot be trusted anymore.
    */
    def StoredHeadersAreVerifiedInv: bool =
        state == "finishedSuccess" implies {
            val dom = fetchedLightBlocks.keys()
            tuples(dom,dom).forall( ((lh, rh)) =>  or { // for every pair of different stored headers
                lh >= rh,
                // either there is a header between them
                dom.exists(mh => lh < mh and mh < rh),
                // or we can verify the right one using the left one
                API::ValidAndVerified(
                    fetchedLightBlocks.get(lh),
                    fetchedLightBlocks.get(rh), 
                    false
                ) == "SUCCESS"
            })
        }

    // An improved version of StoredHeadersAreVerifiedInv,
    // assuming that a header may be not trusted.
    // This invariant candidate is also violated,
    // as there may be some unverified blocks left in the middle.
    // This property is violated under two conditions:
    // (1) the primary is faulty and there are at least 4 blocks,
    // (2) the primary is correct and there are at least 5 blocks.
    def StoredHeadersAreVerifiedOrNotTrustedInv: bool =
        state == "finishedSuccess" implies {
            val dom = fetchedLightBlocks.keys()
            tuples(dom,dom).forall( ((lh, rh)) =>  or { // for every pair of different stored headers
                lh >= rh,
                // either there is a header between them
                dom.exists(mh => lh < mh and mh < rh),
                // or we can verify the right one using the left one
                API::ValidAndVerified(
                    fetchedLightBlocks.get(lh),
                    fetchedLightBlocks.get(rh), 
                    false
                ) == "SUCCESS",
                // or the left header is outside the trusting period, so no guarantees
                not(API::InTrustingPeriodLocal(fetchedLightBlocks.get(lh).header))
            })
        }

    /**
    * An improved version of StoredHeadersAreSoundOrNotTrusted,
    * checking the property only for the verified headers.
    * This invariant holds true if CLOCK_DRIFT <= REAL_CLOCK_DRIFT.
    */
    def ProofOfChainOfTrustInv: bool =
        state == "finishedSuccess" implies {
            val dom = fetchedLightBlocks.keys()
            tuples(dom,dom).forall( ((lh, rh)) => or { // for every pair of stored headers that have been verified
                lh >= rh,
                lightBlockStatus.get(lh) == "StateUnverified",
                lightBlockStatus.get(rh) == "StateUnverified",
                // either there is a header between them
                dom.exists(mh => and {
                    lh < mh,
                    mh < rh,
                    lightBlockStatus.get(mh) == "StateVerified"
                }),
                // or the left header is outside the trusting period, so no guarantees
                not(API::InTrustingPeriodLocal(fetchedLightBlocks.get(lh).header)),
                // or we can verify the right one using the left one
                API::ValidAndVerified(
                    fetchedLightBlocks.get(lh),
                    fetchedLightBlocks.get(rh),
                    false
                ) == "SUCCESS"
            })
        }
                

    /**
    * When the light client terminates, there are no failed blocks. (Otherwise, someone lied to us.) 
    */            
    def NoFailedBlocksOnSuccessInv: bool=
        state == "finishedSuccess" implies
            fetchedLightBlocks.keys().forall(h => lightBlockStatus.get(h) != "StateFailed")
                            

    // This property states that whenever the light client finishes with a positive outcome,
    // the trusted header is still within the trusting period.
    // We expect this property to be violated. And Apalache shows us a counterexample.
    def PositiveBeforeTrustedHeaderExpires: bool =
        state == "finishedSuccess" implies
            BC::InTrustingPeriod(BC::blockchain.get(TRUSTED_HEIGHT))
    
    // If the primary is correct and the initial trusted block has not expired,
    // then whenever the algorithm terminates, it reports "success".
    // This property fails.
    def CorrectPrimaryAndTimeliness: bool = and {
        BC::InTrustingPeriod(BC::blockchain.get(TRUSTED_HEIGHT)),
        state != "working",
        IS_PRIMARY_CORRECT
    } implies state == "finishedSuccess"

    /**
    If the primary is correct and there is a trusted block that has not expired,
    then whenever the algorithm terminates, it reports "success".
    This property only holds true, if the local clock is always growing monotonically.
    If the local clock can go backwards in the envelope
    [refClock - CLOCK_DRIFT, refClock + CLOCK_DRIFT], then the property fails.

    [LCV-DIST-LIVE.1::SUCCESS-CORR-PRIMARY-CHAIN-OF-TRUST.1]
    */
    def SuccessOnCorrectPrimaryAndChainOfTrustLocal: bool = all {
        fetchedLightBlocks.keys().exists( h => all {
            lightBlockStatus.get(h) == "StateVerified",
            API::InTrustingPeriodLocal(BC::blockchain.get(h))
        }),
        state != "working",
        IS_PRIMARY_CORRECT
    } implies state == "finishedSuccess"

    /**
    Similar to SuccessOnCorrectPrimaryAndChainOfTrust, but using the blockchain clock.
    It fails because the local clock of the client drifted away, so it rejects a block
    that has not expired yet (according to the local clock).
    */
    def SuccessOnCorrectPrimaryAndChainOfTrustGlobal: bool = all {
        fetchedLightBlocks.keys().exists( h => all {
            lightBlockStatus.get(h) == "StateVerified",
            BC::InTrustingPeriod(BC::blockchain.get(h))
        }),
        state != "working",
        IS_PRIMARY_CORRECT
    } implies state == "finishedSuccess"   

    // Lite Client Completeness: If header h was correctly generated by an instance
    // of Tendermint consensus (and its age is less than the trusting period),
    // then the lite client should eventually set trust(h) to true.
    //
    // Note that Completeness assumes that the lite client communicates with a correct full node.
    //
    // We decompose completeness into Termination (liveness) and Precision (safety).
    // Once again, Precision is an inverse version of the safety property in Completeness,
    // as A => B is logically equivalent to ~B => ~A. 
    //
    // This property holds only when CLOCK_DRIFT = 0 and REAL_CLOCK_DRIFT = 0.
    def PrecisionInv: bool =
        state == "finishedFailure" implies or {
            not(BC::InTrustingPeriod(BC::blockchain.get(TRUSTED_HEIGHT))), // outside of the trusting period
            fetchedLightBlocks.keys().exists( h => {
                val lightBlock = fetchedLightBlocks.get(h)
                or {
                    // the full node lied to the lite client about the block header
                    lightBlock.header != BC::blockchain.get(h),
                    // the full node lied to the lite client about the commits
                    lightBlock.Commits != lightBlock.header.VS
                }
            })
        }
                   
    // the old invariant that was found to be buggy by TLC
    def PrecisionBuggyInv: bool =
        state == "finishedFailure" implies or {
            not(BC::InTrustingPeriod(BC::blockchain.get(TRUSTED_HEIGHT))), // outside of the trusting period
            fetchedLightBlocks.keys().exists( h => 
                // the full node lied to the lite client about the block header
                fetchedLightBlocks.get(h).header != BC::blockchain.get(h)
            )
        }

    // the worst complexity
    def Complexity: bool = {
        def N = TARGET_HEIGHT - TRUSTED_HEIGHT + 1
        state != "working" implies (2 * nprobes <= N * (N - 1))
    }

    /**
    If the light client has terminated, then the expected postcondition holds true.
    */
    def ApiPostInv: bool =
        state != "working" implies
            API::VerifyToTargetPost(
                BC::blockchain, 
                IS_PRIMARY_CORRECT,
                fetchedLightBlocks, 
                lightBlockStatus,
                TRUSTED_HEIGHT, 
                TARGET_HEIGHT, 
                state
            )

    /*
    We omit termination, as the algorithm deadlocks in the end.
    So termination can be demonstrated by finding a deadlock.
    Of course, one has to analyze the deadlocked state and see that
    the algorithm has indeed terminated there.
    */
}

module Lightclient_4_3_correct {
    import Lightclient(
        AllNodes = Set("n1", "n2", "n3", "n4"),
        TRUSTED_HEIGHT = 1,
        TARGET_HEIGHT = 3,
        TRUSTING_PERIOD = 1400,   // two weeks, one day is 100 time units :-)
        CLOCK_DRIFT = 10,         // how much we assume the local clock is drifting
        REAL_CLOCK_DRIFT = 3,     // how much the local clock is actually drifting
        IS_PRIMARY_CORRECT = true,
        FAULTY_RATIO = (1, 3)     // < 1/3 faulty validators
    ).*
}
