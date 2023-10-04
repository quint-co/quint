// -*- mode: Bluespec; -*-
//   This is a high-level specification of Tendermint blockchain
//   that is designed specifically for the light client.
//   Validators have the voting power of one. If you like to model various
//   voting powers, introduce multiple copies of the same validator
//   (do not forget to give them unique names though)

module Blockchain {

    pure def Min(a: int, b: int): int = if (a < b) a else b

    import typedefs.* from "./typedefs"

    // a set of all nodes that can act as validators (correct and faulty)
    const AllNodes: Set[str]
    // the maximal height that can be ever reached (modelling artifact)
    const ULTIMATE_HEIGHT: int
    // the period within which the validators are trusted
    const TRUSTING_PERIOD: int

    // possible heights
    pure def Heights = 1.to(ULTIMATE_HEIGHT)

    // A commit is just a set of nodes who have committed the block
    pure def Commits = powerset(AllNodes)

    // The set of all block headers that can be on the blockchain.
    // This is a simplified version of the Block data structure in the
    // actual implementation.
    pure def BlockHeaders = 
        tuples(Heights, Int, Commits, powerset(AllNodes), powerset(AllNodes)).map( ((
            // the block height
            height,
            // the block timestamp in some integer units
            time,
            // the nodes who have voted on the previous block, the set itself
            // instead of a hash in the implementation, only the hashes of
            // V and NextV are stored in a block, as V and NextV are stored
            // in the application state
            lastCommit,
            // the validators of this bloc. We store the validators instead of the hash
            VS,
            // the validators of the next block.
            // We store the next validators instead of the hash.
            NextVS)) => {
                height: height, 
                time: time,
                lastCommit: lastCommit,
                VS: VS,
                NextVS: NextVS
            }
        )

    // A signed header is just a header together with a set of commits 
    pure def LightBlocks = tuples(BlockHeaders, Commits).map( ((header, commits)) => {header: header, Commits: commits})

    // Current global time in integer units as perceived by the reference chain
    var refClock: int
    // A function of heights to BlockHeaders,
    // which gives us a bird view of the blockchain.
    var blockchain: Blockchain
    // A set of faulty nodes, which can act as validators.
    // We assume that the set of faulty processes is non-decreasing.
    // If a process has recovered, it should connect using a different id.
    var Faulty: Set[str]


    // The set of all correct nodes in a state
    def Corr = AllNodes.exclude(Faulty)


    // (****************************** BLOCKCHAIN ************************************)

    // the header is still within the trusting period
    def InTrustingPeriod(header: BlockHeader): bool = refClock < header.time + TRUSTING_PERIOD
    
    //  Test whether the set pNodes, a subset of AllNodes, has
    //  more than 2/3 of voting power among the nodes.
    pure def TwoThirds(pVS: Set[str], pNodes: Set[str]): bool = {
        val TP = size(pVS)
        val SP = size(pVS.intersect(pNodes))
        // when thinking in real numbers, not integers: SP > 2.0 / 3.0 * TP 
        3 * SP > 2 * TP 
    }

    //  Given a set of FaultyNodes, test whether the voting power of the correct nodes in D
    //  is more than 2/3 of the voting power of the faulty nodes in D.
    //  Parameters:
    //    - pFaultyNodes is a set of nodes that are considered faulty
    //    - pVS is a set of all validators, maybe including Faulty, intersecting with it, etc.
    //    - pMaxFaultRatio is a pair (a, b) that limits the ratio a / b of the faulty
    //      validators from above (exclusive)
    pure def FaultyValidatorsFewerThan(pFaultyNodes: Set[str], pVS: Set[str], maxRatio: (int, int)): bool = {
        val FN = pFaultyNodes.intersect(pVS)    // faulty nodes in pNodes
        val CN = pVS.exclude(pFaultyNodes)      // correct nodes in pNodes
        val CP = size(CN)                       // power of the correct nodes
        val FP = size(FN)                       // power of the faulty nodes
        // CP + FP = TP is the total voting power
        val TP = CP + FP
        FP * maxRatio._2 < TP * maxRatio._1
    }

    //   Can a block be produced by a correct peer, or an authenticated Byzantine peer?
    def IsLightBlockAllowedByDigitalSignatures(ht: int, block: LightBlock): bool = or {
        block.header == blockchain.get(ht), // signed by correct and faulty (maybe)
        and {
            block.Commits.subseteq(Faulty),
            block.header.height == ht,
            block.header.time >= 0 // signed only by faulty
        }
    }

    //  Initialize the blockchain to the ultimate height right in the initial states.
    //  We pick the faulty validators statically, but that should not affect the light client.
    //  Parameters:
    //     - pMaxFaultyRatioExclusive is a pair (a, b) that bound the number of
    //         faulty validators in each block by the ratio a / b (exclusive)
    action InitToHeight(pMaxFaultyRatioExclusive: (int, int)): bool = {
        // some nodes may fail
        nondet initFaulty = oneOf(powerset(AllNodes)) 
        // pick the validator sets and last commits
        nondet vs = oneOf(setOfMaps(Heights, powerset(AllNodes)))
        nondet lastCommit = oneOf(setOfMaps(Heights, powerset(AllNodes)))
        nondet timestamp = oneOf(setOfMaps(Heights, Int))
        nondet refClockInit = oneOf(Int)
        all {
            Faulty' = initFaulty,
            // refClock is at least as early as the timestamp in the last block 
            refClockInit >= timestamp.get(ULTIMATE_HEIGHT),
            refClock' = refClockInit,
            // the genesis starts on day 1     
            timestamp.get(1) == 1,
            vs.get(1) == AllNodes,
            lastCommit.get(1) == Set(),
            (Heights.exclude(Set(1))).forall( h => and {
                lastCommit.get(h).subseteq(vs.get(h-1)), // the non-validators cannot commit 
                TwoThirds(vs.get(h - 1), lastCommit.get(h)), // the commit has >2/3 of validator votes
                // the faulty validators have the power below the threshold
                FaultyValidatorsFewerThan(initFaulty, vs.get(h), pMaxFaultyRatioExclusive),
                timestamp.get(h) > timestamp.get(h-1),                  // the time grows monotonically
                timestamp.get(h) < timestamp.get(h-1) + TRUSTING_PERIOD // but not too fast
            }),
            // form the block chain out of validator sets and commits (this makes apalache faster)
            blockchain' = Heights.mapBy( h => {
                height: h,
                time: timestamp.get(h),
                VS: vs.get(h),
                NextVS: if (h < ULTIMATE_HEIGHT) vs.get(h+1) else AllNodes,
                lastCommit: lastCommit.get(h)

            })
        }
    }

    // (********************* BLOCKCHAIN ACTIONS ********************************)
    // Advance the `refClock` to `tm`. May not decrease refClock.
    action AdvanceTimeTo(tm: int): bool = all {
        tm >= refClock,
        refClock' = tm,
        blockchain' = blockchain,
        Faulty' = Faulty
    }
    
}
