// -*- mode: Bluespec; -*-

/**
 * A specification of the ICS20 fungible token transfer protocol:
 * https://github.com/cosmos/ibc/tree/main/spec/app/ics-020-fungible-token-transfer
 *
 * Gabriela Moreira and Thomas Pani, Informal Systems, 2023
 */
module ics20 {
  import base.* from "./base"
  import bank.* from "./bank"
  import denomTrace.* from "./denomTrace"

  /****************************************************************************
   * TYPES
   ***************************************************************************/

  // Fundamental types
  type Height = int

  // IBC packet types
  type FungibleTokenData = {
    denom: DenomTrace,
    amount: UINT256,
    sender: Address,
    receiver: Address,
    memo: str
  }

  type Packet = {
    data: FungibleTokenData,
    sourcePort: str,
    sourceChannel: Channel,
    destPort: str,
    destChannel: Channel,
  }

  type FungibleTokenPacketAcknowledgement = {
    success: bool,
    errorMessage: str,
    packet: Packet  // the acknowledged packet
  }

  /// State of the IBC module in a chain
  type ChainState = {
    bank: Accounts,
    channels: ChannelCounterparties,
    channelEscrowAddresses: Channel -> Address,
    // IBC packet handling:
    outPackets: Set[Packet],                        // outgoing unreceived packets
    receivedButUnacknowledgedPackets: Set[Packet],  // received but unacknowledged packets
    inAcknowledgements: Set[FungibleTokenPacketAcknowledgement],  // incoming acknowledgements
    inTimeouts: Set[Packet],                                      // incoming timeouts
  }

  /****************************************************************************
   * FUNCTIONAL LAYER
   ***************************************************************************/

  /****************************/
  /*     helper functions     */
  /****************************/

  /// The counterparty for a channel `C` in a chain is the channel identifier of
  /// the channel `C` connects to, in the other chain.
  pure def getCounterparty(chainState: ChainState, sourceChannel: Channel): Channel = {
    chainState.channels.get(sourceChannel)
  }

  /****************************/
  /*     public interface     */
  /****************************/

  pure def sendFungibleTokens(chainState: ChainState, denomination: DenomTrace, amount: UINT256,
                              sender: Address, receiver: Address, sourcePort: str, sourceChannel: Channel,
                              timeoutHeight: Height, timeoutTimestamp: uint64): ChainState = {
    pure val bankResult = if (movingBackAlongTrace(denomination, { port: sourcePort, channel: sourceChannel })) {
      // burn vouchers
      (chainState.bank).BurnCoins(sender, denomination, amount)
    } else {
      // escrow tokens
      pure val escrowAccount = chainState.channelEscrowAddresses.get(sourceChannel)
      chainState.bank.TransferCoins(sender, escrowAccount, denomination, amount)
    }

    if (bankResult.success) {
      pure val data = { denom: denomination, amount: amount, sender: sender, receiver: receiver, memo: "" }

      // handler.sendPacket
      pure val packet = {
        data: data,
        sourcePort: sourcePort,
        sourceChannel: sourceChannel,
        destPort: "transfer",
        destChannel: getCounterparty(chainState, sourceChannel)
      }

      chainState
        .with("bank", bankResult.accounts)
        .with("outPackets", chainState.outPackets.union(Set(packet)))
    } else {
      chainState
    }
  }

  /// `onRecvPacket` should return an acknowledgment, but it also has to update
  /// the chain state, so the return type is the updated value for the chain
  /// state and the acknowledgment
  pure def onRecvPacket(chainState: ChainState, packet: Packet): (ChainState, FungibleTokenPacketAcknowledgement) = {
    pure val data = packet.data
    pure val movingBack = movingBackAlongTrace(data.denom, { port: packet.sourcePort, channel: packet.sourceChannel })
    pure val newDenom = updateTrace(movingBack, data.denom, { port: packet.destPort, channel: packet.destChannel })

    // result is a pair of 1. a BankResult and 2. an error message that is used in case BankResult.success = false
    pure val result = if (movingBack) {
      // unescrow tokens to receiver
      pure val escrowAccount = chainState.channelEscrowAddresses.get(packet.destChannel)
      pure val bankResult = chainState.bank.TransferCoins(escrowAccount, data.receiver, newDenom, data.amount)

      (bankResult, "transfer coins failed")
    } else {
      // mint vouchers to receiver
      pure val bankResult = chainState.bank.MintCoins(data.receiver, newDenom, data.amount)

      (bankResult, "mint coins failed")
    }

    pure val (bankResult, errorMessage) = result

    pure val newChainState = chainState.with("bank", bankResult.accounts)
    pure val ack = if (bankResult.success) {
      { success: true, errorMessage: "", packet: packet }
    } else {
      { success: false, errorMessage: errorMessage, packet: packet }
    }

    (newChainState, ack)
  }

  /// Refund tokens from a token transfer initiated by `packet`.
  ///
  /// Should be called if the token transfer fails on the receiver chain
  /// (due to a packet acknowledgement indicating failure, or due to a timeout).
  ///
  /// In particular, `refundTokens` is called by both `onAcknowledgePacket` (on
  /// failure) and by `onTimeoutPacket`, to refund burnt or escrowed tokens to
  /// the original sender.
  ///
  /// `packet`: The packet (originally sent from the local chain) that initiated the token transfer.
  ///           Packet `packet` should have resulted in a failed acknowledgement or timeout.
  pure def refundTokens(chainState: ChainState, packet: Packet): ChainState = {
    pure val data: FungibleTokenData = packet.data
    pure val source: HopElement = { port: packet.sourcePort, channel: packet.sourceChannel }
    pure val bankResult =
      if (movingBackAlongTrace(data.denom, source)) {
        // The (failed) transfer attempt was moving the token back along its denom trace.
        // For this, we originally burnt vouchers in `sendFungibleTokens`, so mint them back.
        chainState.bank.MintCoins(data.sender, data.denom, data.amount)
      } else {
        // The (failed) transfer attempt was moving the token further along its denom trace.
        // For this, we originally escrowed tokens in `sendFungibleTokens`, so unescrow them back.
        pure val escrowAccount = chainState.channelEscrowAddresses.get(packet.sourceChannel)
        chainState.bank.TransferCoins(escrowAccount, data.sender, data.denom, data.amount)
      }
    if (bankResult.success) {
      chainState.with("bank", bankResult.accounts)
    } else {
      // TODO: ICS 20 does not specify what happens if the bank modules return an error.
      //       We treat bank failure as a noop.
      chainState
    }
  }

  /// Called by the routing module when a packet sent by this module has been acknowledged.
  pure def onAcknowledgePacket(chainState: ChainState, packet: Packet,
                               acknowledgement: FungibleTokenPacketAcknowledgement) : ChainState = {
    if (acknowledgement.success) {
      chainState  // transfer successful, nothing to do
    } else {
      refundTokens(chainState, packet)
    }
  }

  /// Called by the routing module when a packet sent by this module has timed out
  /// (such that it will not be received on the destination chain).
  pure def onTimeoutPacket(chainState: ChainState, packet: Packet): ChainState = {
    // the packet timed out, so refund the tokens
    refundTokens(chainState, packet)
  }
}

module ics20Test {
  import basicSpells.* from "../../spells/basicSpells"
  import base.* from "./base"
  import bank.getBalance from "./bank"
  import bank.getBalances from "./bank"
  import ics20.*

  /****************************************************************************
   * STATE MACHINE
   ***************************************************************************/

  /// Map from chain identifiers to their state
  var chainStates: str -> ChainState

  /// Map from chain identifiers to a map of the chain identifiers it can
  /// communicate with and the channel to be used to send packets. For example,
  /// chain A connects to chain B through channel "channelToB".
  pure val CHANNEL_TOPOLOGY = Map(
    "A" -> Map(
      "B" -> "channelToB",
      "C" -> "channelToC"
    ),
    "B" -> Map(
      "A" -> "channelToA",
      "C" -> "channelToC"
    ),
    "C" -> Map(
      "A" -> "channelToA",
      "B" -> "channelToB"
    )
  )
  pure val CHAINS = CHANNEL_TOPOLOGY.keys()

  /// For each chain, a map from channel to their channel counterparties,
  /// derived from `CHANNEL_TOPOLOGY`. For example, in chain A, channel "channelToB"
  /// has the counterparty "channelToA".
  pure val channelCounterparties: str -> Channel -> Channel = CHAINS.mapBy(chain => {
    pure val connectedChains = CHANNEL_TOPOLOGY.get(chain).keys()
    connectedChains.map(counterpartyChain => {
      pure val localChannel = CHANNEL_TOPOLOGY.get(chain).get(counterpartyChain)
      pure val counterpartyChannel = CHANNEL_TOPOLOGY.get(counterpartyChain).get(chain)
      (localChannel, counterpartyChannel)
    }).setToMap()
  })

  /// Return true iff there is a channel from `sourceChain` to `destChain` defined in `CHANNEL_TOPOLOGY`.
  ///
  /// In particular, this returns false if `sourceChain == destChain`.
  pure def hasChannelBetween(sourceChain: str, destChain: str): bool = all {
    // ICS 4: "a channel is a pipeline [...] between specific modules on **separate** blockchains"
    sourceChain != destChain,
    // there is a channel between `sourceChain` and `destChain`
    CHANNEL_TOPOLOGY.has(sourceChain),
    CHANNEL_TOPOLOGY.get(sourceChain).has(destChain),
  }

  /// Return true iff there is a channel from `sourceChain` to `destChain` defined in `CHANNEL_TOPOLOGY`
  /// that corresponds to the channel endpoints of `packet`.
  pure def isTravelingBetween(packet: Packet, sourceChain: str, destChain: str): bool = all {
    // there is a channel between `sourceChain` and `destChain`
    hasChannelBetween(sourceChain, destChain),
    // packet endpoints correspond to channel ends
    channelCounterparties.get(sourceChain).has(packet.sourceChannel),
    channelCounterparties.get(sourceChain).get(packet.sourceChannel) == packet.destChannel
  }

  /* Helper operators to manipulate bank state */
  /// Sets the balance of `account` in `chain` to `amount` of `denom`.
  action setBalanceIn(chain, account, denom, amount) = {
    chainStates' = chainStates.setBy(chain, state =>
      state.with("bank", state.bank.setBy(account, balances => balances.set(denom, amount)))
    )
  }

  /// Gets the balance of `account` in `chain` of `denom`.
  def getBalanceIn(chain, account, denom) = {
    chainStates.get(chain).bank.getBalances(account).getBalance(denom)
  }

  /// Send a packet from `sourceChain` to `destChain`, indicating a transfer
  /// of `amount`-many tokens of `denom` from `sender` to `receiver`.
  action sendPacket(sourceChain: str, destChain: str,
                    denom: DenomTrace, amount: UINT256,
                    sender: Address, receiver: Address): bool = all {
    // (1) Pre-condition:
    // there is a channel between `sourceChain` and `destChain`
    hasChannelBetween(sourceChain, destChain),

    // (2) Send the packet using `sendFungibleTokens`:
    val sourceChainState = chainStates.get(sourceChain)
    val newSourceChainState = sendFungibleTokens(sourceChainState, denom, amount,
                                                 sender, receiver,
                                                 "transfer", CHANNEL_TOPOLOGY.get(sourceChain).get(destChain),
                                                 0, 0)

    // (3) Quint state transition:
    chainStates' = chainStates.set(sourceChain, newSourceChainState)
  }

  /// Receive a packet sent from `sourceChain` to `destChain`:
  /// - Pick an arbitrary, previously unreceived packet sent from `sourceChain` to `destChain`.
  /// - Call the `onRecvPacket` callback on it.
  /// - Update the chain states to record the packet as received.
  /// - Record (but not receive) the acknowledgement produced by `onRecvPacket` on `destChain`.
  action receivePacket(sourceChain: str, destChain: str): bool =
    val sourceChainState = chainStates.get(sourceChain)
    all {
      // (1) Pre-condition:
      // there is a channel between `sourceChain` and `destChain`
      hasChannelBetween(sourceChain, destChain),
      // there is an unreceived packet traveling from `sourceChain` to `destChain`
      sourceChainState.outPackets.exists(packet => packet.isTravelingBetween(sourceChain, destChain)),

      // (2) Non-deterministically pick a packet from `sourceChain` to receive on `destChain`:
      nondet packet = sourceChainState.outPackets
                                  .filter(p => p.isTravelingBetween(sourceChain, destChain))
                                  .oneOf()
      all {
        // (3) Compute updated destination chain state: call `onRecvPacket` callback:
        val recvResult = onRecvPacket(chainStates.get(destChain), packet)
        val (newDestChainState, acknowledgement) = recvResult

        // (4) Compute updated source chain state:
        // Update packet sets, moving `packet` from `outPackets` to `receivedButUnacknowledgedPackets`
        // (this simulates ICS 4 exactly-once packet delivery)
        val newSourceChainOutPackets = sourceChainState.outPackets.exclude(Set(packet))
        val newSourceChainUnackPackets = sourceChainState.receivedButUnacknowledgedPackets.union(Set(packet))
        // Update set `inAcknowledgements` to include the sent but (yet) unprocessed `acknowledgement`
        val newSourceChainInAcknowledgements = sourceChainState.inAcknowledgements.union(Set(acknowledgement))
        // Update source chain state with new packet/acknowledgement sets
        val newSourceChainState   = sourceChainState
                                          .with("outPackets", newSourceChainOutPackets)
                                          .with("receivedButUnacknowledgedPackets", newSourceChainUnackPackets)
                                          .with("inAcknowledgements", newSourceChainInAcknowledgements)

        // (5) Quint state transition:
        chainStates' = chainStates
                          .set(destChain, newDestChainState)
                          .set(sourceChain, newSourceChainState)
      }
    }

  /// Time out a packet sent from `sourceChain` to `destChain`.
  action timeoutPacket(sourceChain: str, destChain: str): bool =
    val sourceChainState = chainStates.get(sourceChain)
    all {
      // (1) Pre-condition:
      // there is a channel between `sourceChain` and `destChain`
      hasChannelBetween(sourceChain, destChain),
      // there is an unreceived packet traveling from `sourceChain` to `destChain`
      sourceChainState.outPackets.exists(packet => packet.isTravelingBetween(sourceChain, destChain)),

      // (2) Non-deterministically pick a packet from `sourceChain` to `destChain` to time out:
      nondet packet = sourceChainState.outPackets
                                  .filter(p => p.isTravelingBetween(sourceChain, destChain))
                                  .oneOf()

      // (3) Compute updated source chain state:
      // Update packet sets, moving `packet` from `outPackets` to `inTimeouts`
      val newSourceChainOutPackets = sourceChainState.outPackets.exclude(Set(packet))
      val newSourceChainInAcknowledgements = sourceChainState.inTimeouts.union(Set(packet))
      // Update source chain state with new packet/acknowledgement sets
      val newSourceChainState = sourceChainState
                                      .with("outPackets", newSourceChainOutPackets)
                                      .with("inTimeouts", newSourceChainInAcknowledgements)

      // (4) Quint state transition:
      chainStates' = chainStates.set(sourceChain, newSourceChainState)
    }

  /// Receive an acknowledgement on `chain`:
  /// - Pick an arbitrary, previously unreceived acknowledgement on `chain`.
  /// - Call the `onAcknowledgePacket` callback on it.
  /// - Update the chain state to record the acknowledgement as received.
  action receiveAck(chain: str): bool =
    val chainState = chainStates.get(chain)
    all {
      // (1) Pre-condition:
      // there is an incoming acknowledgement
      chainState.inAcknowledgements.setNonEmpty(),

      // (2) Compute updated chain state:
      // non-deterministically pic an acknowledgement
      nondet acknowledgement = chainState.inAcknowledgements.oneOf()
      // call the `onAcknowledgePacket` callback
      val ackedChainState = onAcknowledgePacket(chainState, acknowledgement.packet, acknowledgement)
      // remove `acknowledgement` from incoming acknowledgements
      val newInAcknowledgements = chainState.inAcknowledgements.exclude(Set(acknowledgement))
      val newChainState = ackedChainState.with("inAcknowledgements", newInAcknowledgements)

      // (3) Quint state transition:
      chainStates' = chainStates.set(chain, newChainState)
    }

  /// Receive a timeout on `chain`:
  /// - Pick an arbitrary, previously unreceived timeout on `chain`.
  /// - Call the `onTimeoutPacket` callback on it.
  /// - Update the chain state to record the timeout as received.
  action receiveTimeout(chain: str): bool =
    val chainState = chainStates.get(chain)
    all {
      // (1) Pre-condition:
      // there is a timed out packet
      chainState.inTimeouts.setNonEmpty(),

      // (2) Compute updated chain state:
      // non-deterministically pick a timed out packet
      nondet timedoutPacket = chainState.inTimeouts.oneOf()
      // call the `onTimeout` callback
      val timedoutChainState = onTimeoutPacket(chainState, timedoutPacket)
      // remove `timedoutPacket` from incoming timeouts
      val newInTimeouts = chainState.inTimeouts.exclude(Set(timedoutPacket))
      val newChainState = timedoutChainState.with("inTimeouts", newInTimeouts)

      // (3) Quint state transition:
      chainStates' = chainStates.set(chain, newChainState)
    }

  pure val ATOM = toDenom("atom")
  pure val USER_ACCOUNTS = Set("alice", "bob", "charlie")
  pure val ESCROW_ACCOUNT = "escrow_account"

  // Initialize the protocol
  action init = {
    chainStates' = CHAINS.mapBy(chain => {
      // All accounts are empty, except for Alice in chain A who has 100 atoms
      bank: if (chain == "A") Map("alice" -> Map(ATOM -> 100)) else Map(),
      channels: channelCounterparties.get(chain),
      channelEscrowAddresses: channelCounterparties.get(chain).keys().mapBy(_ => ESCROW_ACCOUNT),
      // Start without any unprocessed packets/acknowledgements/timeouts
      outPackets: Set(),
      receivedButUnacknowledgedPackets: Set(),
      inAcknowledgements: Set(),
      inTimeouts: Set()
    })
  }

  // Take a step in the protocol (non-deterministically chooses one action).
  action step = {
    nondet sourceChain = CHAINS.oneOf()
    nondet destChain = CHAINS.exclude(Set(sourceChain)).oneOf()
    any {
      nondet amount = oneOf(1.to(10))
      nondet sourceAddr = USER_ACCOUNTS.oneOf()
      nondet destAddr = USER_ACCOUNTS.exclude(Set(sourceAddr)).oneOf()
      sendPacket(sourceChain, destChain, ATOM, amount, sourceAddr, destAddr),
      receivePacket(sourceChain, destChain),
      timeoutPacket(sourceChain, destChain),
      receiveAck(sourceChain),
      receiveTimeout(sourceChain),
    }
  }

  /// Send `amount`-many `denom` tokens from `sender` on `sourceChain` to
  /// `receiver` on `destChain`.
  ///
  /// This is a composition of three actions:
  /// 1. sends the packet from `sourceChain` to `destChain`,
  /// 2. receives the packet on `destChain` and produces an acknowledgement, and
  /// 3. receives and processes the acknowledgement on `sourceChain`.
  run sendTransfer(sourceChain: str, destChain: str, denom: DenomTrace, amount: UINT256, sender: Address, receiver: Address): bool = (
      sendPacket(sourceChain, destChain, denom, amount, sender, receiver)
    ).then(
      receivePacket(sourceChain, destChain)
    ).then(
      receiveAck(sourceChain)
    )

  /****************************************************************************
   * TESTS
   ***************************************************************************/

  // Transfer a single token across these chains: A -> B -> C -> A -> C -> B -> A
  // All transfers are acknowledged as successful.
  run ABCACBATest = init.then(all {
    assert(getBalanceIn("A", "alice", ATOM) == 100),
    sendTransfer("A", "B", ATOM, 1, "alice", "bob")
  }).then(
    pure val denom: DenomTrace = { baseDenom: "atom", path: [{ port: "transfer", channel: "channelToA" }] }
    sendTransfer("B", "C", denom, 1, "bob", "charlie")
  ).then(
    pure val denom: DenomTrace = { baseDenom: "atom", path: [
      { port: "transfer", channel: "channelToB" },
      { port: "transfer", channel: "channelToA" }
    ] }

    sendTransfer("C", "A", denom, 1, "charlie", "alice")
  ).then(
    pure val denom: DenomTrace = { baseDenom: "atom", path: [
      { port: "transfer", channel: "channelToC" },
      { port: "transfer", channel: "channelToB" },
      { port: "transfer", channel: "channelToA" }
    ] }

    sendTransfer("A", "C", denom, 1, "alice", "bob")
  ).then(
    pure val denom: DenomTrace = { baseDenom: "atom", path: [
      { port: "transfer", channel: "channelToB" },
      { port: "transfer", channel: "channelToA" }
    ] }

    sendTransfer("C", "B", denom, 1, "bob", "charlie")
  ).then(
    pure val denom: DenomTrace = { baseDenom: "atom", path: [
      { port: "transfer", channel: "channelToA" }
    ] }

    sendTransfer("B", "A", denom, 1, "charlie", "darwin")
  ).then(all {
      assert(getBalanceIn("A", "alice", ATOM) == 99),
      assert(getBalanceIn("A", "darwin", ATOM) == 1),

      chainStates' = chainStates,
    }
  )

  // From
  // https://github.com/cosmos/ibc-go/blob/a25f0d421c32b3a2b7e8168c9f030849797ff2e8/modules/apps/transfer/transfer_test.go#L44
  run TransferTest = {
    pure val amount = 9223372036854775808

    // NOTE: fungible token is prefixed with the full trace in order to verify the packet commitment
    pure val denomInA = ATOM
    pure val denomSentFromAToB = denomInA.with("path", [{ port: "transfer", channel: "channelToA" }].concat(denomInA.path))
    pure val denomSentFromBToC = denomSentFromAToB.with("path", [{ port: "transfer", channel: "channelToB" }].concat(denomSentFromAToB.path))
    init.then(
      // Make sure that Alice has enough tokens on chain A. In the go test, this
      // is implicitly done somewhere in the test environment setup.
      setBalanceIn("A", "alice", ATOM, amount)
    ).then(
      sendTransfer("A", "B", ATOM, amount, "alice", "bob")
    ).then(all {
      // check that voucher exists on chain B
      val balanceB = getBalanceIn("B", "bob", denomSentFromAToB)
      assert(balanceB == amount),

      sendTransfer("B", "C", denomSentFromAToB, amount, "bob", "charlie")
    }).then(
      all {
        // check that the balance is updated on chainC
        val balanceC = getBalanceIn("C", "charlie", denomSentFromBToC)
        assert(balanceC == amount),

        // check that balance on chain B is empty
        val balanceB = getBalanceIn("B", "bob", denomSentFromAToB)
        assert(balanceB == 0),

        // send from chainC back to chainB
        sendTransfer("C", "B", denomSentFromBToC, amount, "charlie", "bob")
      }
    ).then(all {
      // check that the balance on chainA is zero
      val balanceA = getBalanceIn("A", "alice", denomInA)
      assert(balanceA == 0),

      // check that balance on chain B has the transferred amount
      val balanceB = getBalanceIn("B", "bob", denomSentFromAToB)
      assert(balanceB == amount),

      // check that module account escrow address is empty
      val balanceEscrow = getBalanceIn("B", ESCROW_ACCOUNT, denomSentFromAToB)
      assert(balanceEscrow == 0),

      // check that balance on chain C is empty
      val balanceC = getBalanceIn("C", "charlie", denomSentFromBToC)
      assert(balanceC == 0),

      // noop
      chainStates' = chainStates
    })
  }

  // Test producing a failed acknowledgement:
  //
  // 1. Transfer 50 tokens from Alice on chain A to Bob on chain B.
  // 2. Manipulate the escrow account on chain A, to contain less than 50 tokens.
  //    This will provoke the transfer below to produce a failed acknowledgement.
  // 3. Try to transfer the 50 tokens back from Bob to Alice.
  //    3.1 First, this burns Bob's 50 vouchers on chain B, and sends a packet to chain A.
  //    3.2 Receipt of the packet on chain A calls the `onRecvPacket` callback.
  //    3.3 `onRecvPacket` calls the bank module's `TransferCoins` to unescrow 50 tokens to Alice.
  //    3.4 `TransferCoins` returns an error, because -- after manipulating it in (2) -- the escrow account has insufficient funds.
  //    3.5 The bank module error causes `onRecvPacket` to return a failed acknowledgement.
  //    3.6 `onAcknowledgePacket` on chain "B" re-mints the burned vouchers to Bob.
  run FailedAckTest = init.then(all {
    assert(getBalanceIn("A", "alice", ATOM) == 100),
    assert(getBalanceIn("A", ESCROW_ACCOUNT, ATOM) == 0),
    assert(getBalanceIn("B", "bob", ATOM) == 0),

    // 1. Transfer 50 tokens from Alice on chain A to Bob on chain B.
    sendTransfer("A", "B", ATOM, 50, "alice", "bob")
  }).then(
    pure val voucherDenom: DenomTrace = { baseDenom: "atom", path: [{ port: "transfer", channel: "channelToA" }] }
    all {
      assert(getBalanceIn("A", "alice", ATOM) == 50),
      assert(getBalanceIn("A", ESCROW_ACCOUNT, ATOM) == 50),
      assert(getBalanceIn("B", "bob", voucherDenom) == 50),

      // 2. Manipulate the escrow account on chain A, to contain less than 50 tokens.
      setBalanceIn("A", ESCROW_ACCOUNT, ATOM, 49)
  }).then(
    pure val voucherDenom: DenomTrace = { baseDenom: "atom", path: [{ port: "transfer", channel: "channelToA" }] }
    all {
      assert(getBalanceIn("A", "alice", ATOM) == 50),
      assert(getBalanceIn("A", ESCROW_ACCOUNT, ATOM) == 49),
      assert(getBalanceIn("B", "bob", voucherDenom) == 50),

      // 3. Try to transfer the 50 tokens back from Bob to Alice.
      // Send and receive the ICS 20 packet; this triggers steps 3.1–3.5 above.
      sendPacket("B", "A", voucherDenom, 50, "bob", "alice").then(receivePacket("B", "A"))
  }).then(
    pure val voucherDenom: DenomTrace = { baseDenom: "atom", path: [{ port: "transfer", channel: "channelToA" }] }
    all {
      // Check that bob's vouchers were burned – nothing changed on chain A
      assert(getBalanceIn("A", "alice", ATOM) == 50),
      assert(getBalanceIn("A", ESCROW_ACCOUNT, ATOM) == 49),
      assert(getBalanceIn("B", "bob", voucherDenom) == 0),

      // Check that there is a single incoming acknowledgement on chain A,
      // that indicates failure.
      assert(chainStates.get("B").inAcknowledgements.size() == 1),
      nondet ack = chainStates.get("B").inAcknowledgements.oneOf()
      assert(ack.success == false and ack.errorMessage == "transfer coins failed"),

      // Process the acknowledgement on chain A; this triggers step 3.6 above.
      receiveAck("B")
  }).then(
    pure val voucherDenom: DenomTrace = { baseDenom: "atom", path: [{ port: "transfer", channel: "channelToA" }] }
    all {
      // Check that bob's vouchers were minted back – nothing changed on chain A
      assert(getBalanceIn("A", "alice", ATOM) == 50),
      assert(getBalanceIn("A", ESCROW_ACCOUNT, ATOM) == 49),
      assert(getBalanceIn("B", "bob", voucherDenom) == 50),

      // noop
      chainStates' = chainStates
  })

  // Test timeout handling:
  //
  // 1. Send a packet transferring 50 tokens from Alice on chain A to Bob on chain B.
  //    This should move 50 tokens into the escrow account.
  // 2. Timeout packet.
  // 3. Handle timeout on chain A.
  //    This should unescrow 50 tokens to Alice.
  run TimeoutTest = init.then(all {
    assert(chainStates.get("A").bank.getBalances("alice").getBalance(ATOM) == 100),
    assert(chainStates.get("A").bank.getBalances(ESCROW_ACCOUNT).getBalance(ATOM) == 0),

    // 1. Send packet transferring 50 tokens from Alice on chain A to Bob on chain B.
    sendPacket("A", "B", ATOM, 50, "alice", "bob")
  }).then(all {
    //    This should've moved 50 tokens into the escrow account.
    assert(chainStates.get("A").bank.getBalances("alice").getBalance(ATOM) == 50),
    assert(chainStates.get("A").bank.getBalances(ESCROW_ACCOUNT).getBalance(ATOM) == 50),

    // 2. Timeout packet.
    timeoutPacket("A", "B")
  }).then(all {
    assert(chainStates.get("A").bank.getBalances("alice").getBalance(ATOM) == 50),
    assert(chainStates.get("A").bank.getBalances(ESCROW_ACCOUNT).getBalance(ATOM) == 50),

    // 3. Handle timeout on chain A.
    receiveTimeout("A")
  }).then(all {
    //    This should've unescrowed 50 tokens to Alice.
    assert(chainStates.get("A").bank.getBalances("alice").getBalance(ATOM) == 100),
    assert(chainStates.get("A").bank.getBalances(ESCROW_ACCOUNT).getBalance(ATOM) == 0),

    // noop
    chainStates' = chainStates
  })

  /* ***************************************************************************
   * INVARIANTS
   * **************************************************************************/

  // To check in random simulator:
  // $ quint run --main=ics20Test --invariant=BalanceNonNegative ics20.qnt

  // The balance of all denominations in all accounts is always non-negative.
  val BalanceNonNegative = CHAINS.forall(chain =>
      USER_ACCOUNTS.forall(addr =>
        chainStates.get(chain).bank.getBalances(addr).getBalance(ATOM) >= 0
    )
  )
}
