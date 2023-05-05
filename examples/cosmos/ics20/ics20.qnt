// -*- mode: Bluespec; -*-

/**
 * A specification for the ICS20 fungible token transfer protocol:
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
    outPackets: Set[Packet],
    receivedButUnacknowledgedPackets: Set[Packet],
    inAcknowledgements: Set[FungibleTokenPacketAcknowledgement],
    channelEscrowAddresses: Channel -> Address,
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

    pure val bankResult = result._1
    pure val errorMessage = result._2

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
        pure val escrowAccount = chainState.channelEscrowAddresses.get(packet.srcChannel)
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

  pure val ATOM = toDenom("atom")
  pure val ESCROW_ACCOUNT = "escrow_account"

  /// For each chain, a map from channel to their channel counterparties,
  /// derived from `CHANNEL_TOPOLOGY`. For example, in chain A, channel "channelToB"
  /// has the counterparty "channelToA".
  pure val channelCounterparties: str -> Channel -> Channel = CHANNEL_TOPOLOGY.keys().mapBy(chain => {
    pure val connectedChains = CHANNEL_TOPOLOGY.get(chain).keys()
    connectedChains.map(counterpartyChain => {
      pure val localChannel = CHANNEL_TOPOLOGY.get(chain).get(counterpartyChain)
      pure val counterpartyChannel = CHANNEL_TOPOLOGY.get(counterpartyChain).get(chain)
      (localChannel, counterpartyChannel)
    }).setToMap()
  })

  action init = {
    chainStates' = CHANNEL_TOPOLOGY.keys().mapBy(chain => {
      // All accounts are empty, except for Alice in chain A who has 100 atoms
      bank: if (chain == "A") Map("alice" -> Map(ATOM -> 100)) else Map(),
      channels: channelCounterparties.get(chain),
      channelEscrowAddresses: channelCounterparties.get(chain).keys().mapBy(_ => ESCROW_ACCOUNT),
      outPackets: Set(),
      receivedButUnacknowledgedPackets: Set(),
      inAcknowledgements: Set()
    })
  }

  /// Send a packet from `sourceChain` to `destChain`, indicating a transfer
  /// of `amount`-many tokens of `denom` from `sender` to `receiver`.
  action sendPacket(sourceChain: str, destChain: str,
                    denom: DenomTrace, amount: UINT256,
                    sender: Address, receiver: Address): bool = all {
    // (1) Pre-condition:
    // ICS 4: "a channel is a pipeline [...] between specific modules on **separate** blockchains"
    sourceChain != destChain,

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
  /// - Pick an arbitrary, previously unreceived packet sent from `sourceChain`
  ///   to `destChain`.
  /// - Call the `onRecvPacket` callback on it.
  /// - Update the chain states to record the packet as received.
  /// - Record (but not receive) the acknowledgement produced by `onRecvPacket`
  ///   on `destChain`.
  action receivePacket(sourceChain: str, destChain: str): bool = all {
    // (1) Pre-condition:
    // ICS 4: "a channel is a pipeline [...] between specific modules on **separate** blockchains"
    sourceChain != destChain,

    // (2) Non-deterministically pick a packet from `sourceChain` to receive on `destChain`:
    val sourceChainState = chainStates.get(sourceChain)
    nondet packet = sourceChainState.outPackets.oneOf()

    // (3) Compute updated destination chain state: call `onRecvPacket` callback:
    val recvResult = onRecvPacket(chainStates.get(destChain), packet)
    val newDestChainState = recvResult._1
    val acknowledgement   = recvResult._2

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

  /// Receive an acknowledgement for `packet` on `chain`:
  /// - Pick an arbitrary, previously unreceived acknowledgement on `chain`.
  /// - Call the `onAcknowledgePacket` callback on it.
  /// - Update the chain state to record the acknowledgement as received.
  action receiveAck(chain: str): bool = all {
    // (1) Compute updated chain state:
    // non-deterministically pick an acknowledgement
    val chainState = chainStates.get(chain)
    nondet acknowledgement = chainState.inAcknowledgements.oneOf()
    // call the `onAcknowledgePacket` callback and
    val ackedChainState = onAcknowledgePacket(chainState, acknowledgement.packet, acknowledgement)
    // remove `ack` from incoming acknowledgements
    val newInAcknowledgements = chainState.inAcknowledgements.exclude(Set(acknowledgement))
    val newChainState = ackedChainState.with("inAcknowledgements", newInAcknowledgements)

    // (2) Quint state transition:
    chainStates' = chainStates.set(chain, newChainState)
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
    assert(chainStates.get("A").bank.get("alice").get(ATOM) == 100),
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
      assert(chainStates.get("A").bank.get("alice").get(ATOM) == 99),
      assert(chainStates.get("A").bank.get("darwin").get(ATOM) == 1),

      chainStates' = chainStates,
    }
  )

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
    assert(chainStates.get("A").bank.getBalances("alice").getBalance(ATOM) == 100),
    assert(chainStates.get("A").bank.getBalances(ESCROW_ACCOUNT).getBalance(ATOM) == 0),
    assert(chainStates.get("B").bank.getBalances("bob").getBalance(ATOM) == 0),

    // 1. Transfer 50 tokens from Alice on chain A to Bob on chain B.
    sendTransfer("A", "B", ATOM, 50, "alice", "bob")
  }).then(
    pure val voucherDenom: DenomTrace = { baseDenom: "atom", path: [{ port: "transfer", channel: "channelToA" }] }
    all {
      assert(chainStates.get("A").bank.getBalances("alice").getBalance(ATOM) == 50),
      assert(chainStates.get("A").bank.getBalances(ESCROW_ACCOUNT).getBalance(ATOM) == 50),
      assert(chainStates.get("B").bank.getBalances("bob").getBalance(voucherDenom) == 50),

      // 2. Manipulate the escrow account on chain A, to contain less than 50 tokens.
      val chainState = chainStates.get("A")
      val manipulatedEscrowAccount = chainState.bank.get(ESCROW_ACCOUNT).set(ATOM, 49)
      val manipulatedBank = chainState.bank.set(ESCROW_ACCOUNT, manipulatedEscrowAccount)
      chainStates' = chainStates.set("A", chainState.with("bank", manipulatedBank))
  }).then(
    pure val voucherDenom: DenomTrace = { baseDenom: "atom", path: [{ port: "transfer", channel: "channelToA" }] }
    all {
      assert(chainStates.get("A").bank.getBalances("alice").getBalance(ATOM) == 50),
      assert(chainStates.get("A").bank.getBalances(ESCROW_ACCOUNT).getBalance(ATOM) == 49),
      assert(chainStates.get("B").bank.getBalances("bob").getBalance(voucherDenom) == 50),

      // 3. Try to transfer the 50 tokens back from Bob to Alice.
      // Send and receive the ICS 20 packet; this triggers steps 3.1–3.5 above.
      sendPacket("B", "A", voucherDenom, 50, "bob", "alice").then(receivePacket("B", "A"))
  }).then(
    pure val voucherDenom: DenomTrace = { baseDenom: "atom", path: [{ port: "transfer", channel: "channelToA" }] }
    all {
      // Check that bob's vouchers were burned – nothing changed on chain A
      assert(chainStates.get("A").bank.getBalances("alice").getBalance(ATOM) == 50),
      assert(chainStates.get("A").bank.getBalances(ESCROW_ACCOUNT).getBalance(ATOM) == 49),
      assert(chainStates.get("B").bank.getBalances("bob").getBalance(voucherDenom) == 0),

      // Check that there is a single incoming acknowledgement on chain A,
      // that indicates failure.
      assert(chainStates.get("B").inAcknowledgements.size() == 1),
      val ack = chainStates.get("B").inAcknowledgements.oneOf()
      assert(ack.success == false and ack.errorMessage == "transfer coins failed"),

      // Process the acknowledgement on chain A; this triggers step 3.6 above.
      receiveAck("B")
  }).then(
    pure val voucherDenom: DenomTrace = { baseDenom: "atom", path: [{ port: "transfer", channel: "channelToA" }] }
    all {
      // Check that bob's vouchers were minted back – nothing changed on chain A
      assert(chainStates.get("A").bank.getBalances("alice").getBalance(ATOM) == 50),
      assert(chainStates.get("A").bank.getBalances(ESCROW_ACCOUNT).getBalance(ATOM) == 49),
      assert(chainStates.get("B").bank.getBalances("bob").getBalance(voucherDenom) == 50),

      // noop
      chainStates' = chainStates
  })

  // TODO(thpani): add a test for packet timeout
}
