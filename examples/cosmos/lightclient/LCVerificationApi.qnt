//  The common interface of the light client verification and detection.
module LCVerificationApi {

    import typedefs.* from "./typedefs"

    // the parameters of Light Client

    // the period within which the validators are trusted
    const TRUSTING_PERIOD: int
    // the assumed precision of the clock
    const CLOCK_DRIFT: int
    // the actual clock drift, which under normal circumstances should not
    // be larger than CLOCK_DRIFT (otherwise, there will be a bug)
    const REAL_CLOCK_DRIFT: int
    // a pair (a, b) that limits that ratio of faulty validator in the blockchain
    // from above (exclusive). Tendermint security model prescribes 1 / 3.
    const FAULTY_RATIO: (int, int)

    // the local clock of the light client
    var localClock: int

    // Is the header within the trusting period?
    def InTrustingPeriodLocal(header: BlockHeader): bool =
        // note that the assumption about the drift reduces the period of trust
        localClock < header.time + TRUSTING_PERIOD - CLOCK_DRIFT

    // Is the header within the trusting period, even if the clock can go backwards?
    def InTrustingPeriodLocalSurely(header: BlockHeader): bool =
        // note that the assumption about the drift reduces the period of trust
        localClock < header.time + TRUSTING_PERIOD - 2 * CLOCK_DRIFT

    // Is the local clock not too far away from the global clock?
    pure def IsLocalClockWithinDrift(local: int, global:int): bool = and {
        global - REAL_CLOCK_DRIFT <= local,
        local <= global + REAL_CLOCK_DRIFT
    }

    // Check that the commits in an untrusted block form 1/3 of the next validators
    // in a trusted header.
    pure def SignedByOneThirdOfTrusted(trusted: LightBlock, untrusted: LightBlock): bool = {
        val TP = size(trusted.header.NextVS)
        val SP = size(untrusted.Commits.intersect(trusted.header.NextVS))
        3 * SP > TP     
    }

    // The first part of the precondition of ValidAndVerified, which does not take
    // the current time into account.
    //
    // [LCV-FUNC-VALID.1::TLA-PRE-UNTIMED.1]
    pure def ValidAndVerifiedPreUntimed(trusted: LightBlock, untrusted: LightBlock): bool = {
        val thdr = trusted.header
        val uhdr = untrusted.header
        val TP = size(uhdr.VS)
        val SP = size(untrusted.Commits)
        and {
            thdr.height < uhdr.height,
            // the trusted block has been created earlier
            thdr.time < uhdr.time,
            untrusted.Commits.subseteq(uhdr.VS),
            3 * SP > 2 * TP,
            (thdr.height + 1 == uhdr.height) implies (thdr.NextVS == uhdr.VS)
        }
    }
    // As we do not have explicit hashes we ignore these three checks of the English spec:
    //      1. "trusted.Commit is a commit is for the header trusted.Header,
    //       i.e. it contains the correct hash of the header".
    //      2. untrusted.Validators = hash(untrusted.Header.Validators)
    //      3. untrusted.NextValidators = hash(untrusted.Header.NextValidators)
    //

    //  Check the precondition of ValidAndVerified, including the time checks.     
    //  [LCV-FUNC-VALID.1::TLA-PRE.1]
    def ValidAndVerifiedPre(trusted: LightBlock, untrusted: LightBlock, checkFuture: bool): bool = {
        val thdr = trusted.header
        val uhdr = untrusted.header
        and {
            InTrustingPeriodLocal(thdr),
            // The untrusted block is not from the future (modulo clock drift).
            // Do the check, if it is required.
            checkFuture implies (uhdr.time < localClock + CLOCK_DRIFT),
            ValidAndVerifiedPreUntimed(trusted, untrusted)
        }
    }
    
     // Check, whether an untrusted block is valid and verifiable
     // w.r.t. a trusted header. This test does take current time into account,
     // but only looks at the block structure.
     //
     // [LCV-FUNC-VALID.1::TLA-UNTIMED.1]
    pure def ValidAndVerifiedUntimed(trusted: LightBlock, untrusted: LightBlock): str = 
        if (not(ValidAndVerifiedPreUntimed(trusted, untrusted)))
          "INVALID"
        else 
            if ((untrusted.header.height == trusted.header.height + 1)
              or SignedByOneThirdOfTrusted(trusted, untrusted)) "SUCCESS"
            else "NOT_ENOUGH_TRUST"

    // Check, whether an untrusted block is valid and verifiable
    // w.r.t. a trusted header.
    //
    // [LCV-FUNC-VALID.1::TLA.1]
    def ValidAndVerified(trusted: LightBlock, untrusted: LightBlock, checkFuture: bool): str =
        if (not(ValidAndVerifiedPre(trusted, untrusted, checkFuture))) "INVALID"
        else 
            if (not(InTrustingPeriodLocal(untrusted.header)))
              "FAILED_TRUSTING_PERIOD" 
            // We leave the following test for the documentation purposes.
            // The implementation should do this test, as signature verification may be slow.
            // In the TLA+ specification, ValidAndVerified happens in no time.
            else 
                if((untrusted.header.height == trusted.header.height + 1)
                  or SignedByOneThirdOfTrusted(trusted, untrusted)) "SUCCESS"
                else "NOT_ENOUGH_TRUST"

    // The invariant of the light store that is not related to the blockchain.
    // Plugin bug: see issue #808. action -> pure def once resloved
    pure def LightStoreInv(fetchedLightBlocks: LightBlockMap, lightBlockStatus: LightBlockStatus): bool = {
        val domain = fetchedLightBlocks.keys()
        tuples(domain, domain).forall( ((lh, rh)) => or {
            // for every pair of stored headers that have been verified
            lh >= rh,
            lightBlockStatus.get(lh) != "StateVerified",
            lightBlockStatus.get(rh) != "StateVerified",
            // either there is a header between them
            domain.exists(mh => and {
                lh < mh,
                mh < rh,
                lightBlockStatus.get(mh) == "StateVerified"
            }),
            // or the left header is outside the trusting period, so no guarantees
            ValidAndVerifiedUntimed(fetchedLightBlocks.get(lh), fetchedLightBlocks.get(rh)) == "SUCCESS"
        })
    }
    
    // Correctness states that all the obtained headers are exactly like in the blockchain.
    //
    // It is always the case that every verified header in LightStore was
    // generated by an instance of Tendermint consensus.
    //
    // [LCV-DIST-SAFE.1::CORRECTNESS-INV.1]
    pure def CorrectnessInv(blockchain: Blockchain,
      fetchedLightBlocks: LightBlockMap, lightBlockStatus: LightBlockStatus): bool =
        fetchedLightBlocks.keys().forall( h =>
            (lightBlockStatus.get(h) == "StateVerified")
              implies (fetchedLightBlocks.get(h).header == blockchain.get(h))
        )
                

    //
    // When the light client terminates, there are no failed blocks.
    // (Otherwise, someone lied to us.)        
    pure def NoFailedBlocksOnSuccessInv(fetchedLightBlocks: LightBlockMap,
      lightBlockStatus: LightBlockStatus): bool =
         fetchedLightBlocks.keys().forall( h =>
            lightBlockStatus.get(h) != "StateFailed"
         )
                        

    //
    // The expected post-condition of VerifyToTarget.
    //
    // @type: ($blockchain, Bool, $lightBlockMap, $lightBlockStatus, Int, Int, Str) => Bool;
    //
    def VerifyToTargetPost(blockchain: Blockchain, isPeerCorrect: bool,
                       fetchedLightBlocks: LightBlockMap, lightBlockStatus: LightBlockStatus,
                       trustedHeight: int, targetHeight: int, finalState: str): bool = {
                    
        val trustedHeader = fetchedLightBlocks.get(trustedHeight).header
        and {
            // The light client is not lying us on the trusted block.
            // It is straightforward to detect.
            lightBlockStatus.get(trustedHeight) == "StateVerified",
            trustedHeight.in(fetchedLightBlocks.keys()),
            trustedHeader == blockchain.get(trustedHeight),
            // the invariants we have found in the light client verification
            // there is a problem with trusting period
            isPeerCorrect implies CorrectnessInv(blockchain, fetchedLightBlocks, lightBlockStatus),
            // a correct peer should fail the light client,
            // if the trusted block is in the trusting period
            (isPeerCorrect and InTrustingPeriodLocalSurely(trustedHeader)) implies finalState == "finishedSuccess",
            finalState == "finishedSuccess" implies and {
                lightBlockStatus.get(targetHeight) == "StateVerified",
                targetHeight.in(fetchedLightBlocks.keys()),
                NoFailedBlocksOnSuccessInv(fetchedLightBlocks, lightBlockStatus)
            },
            LightStoreInv(fetchedLightBlocks, lightBlockStatus)
        }
    }

    action SetLocalClock(clock: int): bool = localClock' = clock

}