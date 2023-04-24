// -*- mode: Bluespec; -*-

/**
 * A specification for the ICS20 fungible token transfer protocol.
 *
 * Gabriela Moreira and Thomas Pani, Informal Systems, 2023
 */
module ics20 {
  import base.* from "./base"
  import bank.* from "./bank"
  import denomTrace.* from "./denomTrace"

  /* ***************************************************************************
   * TYPES
   * **************************************************************************/

  // Fundamental types
  type Height = int

  // IBC packet types
  type FungibleTokenPacketAcknowledgement = {
    success: bool,
    errorMessage: str
  }

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

  // State of the IBC module in a chain
  type ChainState = {
    bank: Accounts,
    channels: Channels,
    outPackets: Set[Packet],
    channelEscrowAddresses: Channel -> Address,
  }

  /// The counterparty for a channel `C` in a chain is the channel identifier of
  /// the channel `C` connects to, in the other chain.
  pure def getCounterparty(chainState: ChainState, sourceChannel: Channel): Channel = {
    chainState.channels.get(sourceChannel)
  }

  pure def sendFungibleTokens(chainState: ChainState, denomination: DenomTrace, amount: UINT256,
                              sender: Address, receiver: Address, sourcePort: str, sourceChannel: Channel,
                              timeoutHeight: Height, timeoutTimestamp: uint64): ChainState = {
    val bankResult = if (movingBackAlongTrace({port: sourcePort, channel: sourceChannel}, denomination)) {
      // burn vouchers
      (chainState.bank).BurnCoins(sender, denomination, amount)
    } else {
      // escrow tokens
      val escrowAccount = chainState.channelEscrowAddresses.get(sourceChannel)
      chainState.bank.TransferCoins(sender, escrowAccount, denomination, amount)
    }

    if (bankResult.success) {
      val data = { denom: denomination, amount: amount, sender: sender, receiver: receiver, memo: "" }

      // handler.sendPacket
      val packet = {
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
  type ReceiveTokenPacketResult = {
    chainState: ChainState,
    acknowledgement: FungibleTokenPacketAcknowledgement
  }

  pure def onRecvPacket(chainState: ChainState, packet: Packet): ReceiveTokenPacketResult = {
    val data = packet.data
    if (movingBackAlongTrace({port: packet.sourcePort, channel: packet.sourceChannel}, data.denom)) {
      // unescrow tokens to receiver
      val escrowAccount = chainState.channelEscrowAddresses.get(packet.destChannel)
      val receiverDenom = updateTrace(data.denom, packet.sourcePort, packet.sourceChannel, packet.destPort, packet.destChannel)

      val bankResult = chainState.bank.TransferCoins(escrowAccount, data.receiver, receiverDenom, data.amount)

      val newChainState = chainState.with("bank", bankResult.accounts)
      val ack = if (bankResult.success) {
        { success: true, errorMessage: "" }
      } else {
        { success: false, errorMessage: "transfer coins failed" }
      }

      { chainState: newChainState, acknowledgement: ack }
    } else {
      // mint vouchers to receiver
      val prefix = [packet.destPort, packet.destChannel]
      val newDenom = updateTrace(data.denom, packet.sourcePort, packet.sourceChannel, packet.destPort, packet.destChannel)

      val bankResult = chainState.bank.MintCoins(data.receiver, newDenom, data.amount)

      val newChainState = chainState.with("bank", bankResult.accounts)
      val ack = if (bankResult.success) {
        { success: true, errorMessage: "" }
      } else {
        { success: false, errorMessage: "mint coins failed" }
      }

      { chainState: newChainState, acknowledgement: ack }
    }
  }
}

module ics20Test {
  import base.* from "./base"
  import ics20.*

  val modules = Set("A", "B", "C")

  /// Set of addresses for random simulation
  val addresses = Set("alice", "bob", "charlie")

  /// Map from chain identifiers to their state
  var chainStates: str -> ChainState

  /// All channels available in a module. Should be extracted to a channels
  /// quint module.
  pure def channelsForModule(mod: str): Set[Channel] = {
    pure val channels = Map(
      "A" -> Set("channelToB", "channelToC"),
      "B" -> Set("channelToA", "channelToC"),
      "C" -> Set("channelToA", "channelToB")
    )

    channels.get(mod)
  }

  /// A channel for a transfer from one chain to another
  pure def getChannelsForTransfer(sourceChain: str, destChain: str): { sourceChannel: str, destChannel: str } =
    pure val channels = Map(
      "A" -> "channelToA",
      "B" -> "channelToB",
      "C" -> "channelToC"
    )
    ({
      // If this is a transfer from A -> B, then the source channel is `channelToB`
      sourceChannel: channels.get(destChain),
      // If this is a transfer from A -> B, then the dest channel is `channelToA`
      destChannel: channels.get(sourceChain),
    })


  action init = {
    chainStates' = Map(
      "A" -> {
        bank: Map("alice" -> Map(toDenom("atom") -> 100)),
        channels: Map(
          "channelToB" -> "channelToA",
          "channelToC" -> "channelToA"
        ),
        channelEscrowAddresses: Set("channelToB", "channelToC").mapBy(_ => "escrow_account"),
        outPackets: Set()
      },
      "B" -> {
        bank: Map(),
        channels: Map(
          "channelToA" -> "channelToB",
          "channelToC" -> "channelToB"
        ),
        channelEscrowAddresses: Set("channelToA", "channelToC").mapBy(_ => "escrow_account"),
        outPackets: Set()
      },
      "C" -> {
        bank: Map(),
        channels: Map(
          "channelToA" -> "channelToC",
          "channelToB" -> "channelToC"
        ),
        channelEscrowAddresses: Set("channelToA", "channelToB").mapBy(_ => "escrow_account"),
        outPackets: Set()
      }
    )
  }

  /// Receives a packet sent from `sourceChain` to `destChain`
  action receivePacket(sourceChain: str, destChain: str): bool = {
    val sourceChainState = chainStates.get(sourceChain)
    nondet packet = sourceChainState.outPackets.oneOf()
    val result = onRecvPacket(chainStates.get(destChain), packet)
    all {
      chainStates' = chainStates
        .set(destChain, result.chainState)
        .set(sourceChain, sourceChainState.with("outPackets", sourceChainState.outPackets.exclude(Set(packet))))
    }
  }

  /// Sends 1 `denom` token from `sender` in `sourceChain` to `receiver` in
  /// `destChain`. This is a composition of two actions: one that sends the
  /// packet from `sourceChain` and other that receives the packet in `destChain`
  run sendTransfer(denom: DenomTrace, sourceChain: str, destChain: str, sender: Address, receiver: Address): bool = (
    val result = sendFungibleTokens(chainStates.get(sourceChain), denom, 1, sender, receiver, "transfer", getChannelsForTransfer(sourceChain, destChain).sourceChannel, 0, 0)
    all {
      chainStates' = chainStates.set(sourceChain, result),
    }).then(
      receivePacket(sourceChain, destChain)
    )

  // These steps of transfer occur: A -> B -> C -> A -> C -> B -> A
  run ABCACBATest = init.then(
    sendTransfer(toDenom("atom"), "A", "B", "alice", "bob")
  ).then(
    pure val denom: DenomTrace = { baseDenom: "atom", path: [{ port: "transfer", channel: "channelToA" }] }
    sendTransfer(denom, "B", "C", "bob", "charlie")
  ).then(
    pure val denom: DenomTrace = { baseDenom: "atom", path: [
      { port: "transfer", channel: "channelToB" },
      { port: "transfer", channel: "channelToA" }
    ] }

    sendTransfer(denom, "C", "A", "charlie", "alice")
  ).then(
    pure val denom: DenomTrace = { baseDenom: "atom", path: [
      { port: "transfer", channel: "channelToC" },
      { port: "transfer", channel: "channelToB" },
      { port: "transfer", channel: "channelToA" }
    ] }

    sendTransfer(denom, "A", "C", "alice", "bob")
  ).then(
    pure val denom: DenomTrace = { baseDenom: "atom", path: [
      { port: "transfer", channel: "channelToB" },
      { port: "transfer", channel: "channelToA" }
    ] }

    sendTransfer(denom, "C", "B", "bob", "charlie")
  ).then(
    pure val denom: DenomTrace = { baseDenom: "atom", path: [
      { port: "transfer", channel: "channelToA" }
    ] }

    sendTransfer(denom, "B", "A", "charlie", "darwin")
  ).then(all {
      assert(chainStates.get("A").bank.get("alice").get(toDenom("atom")) == 99),
      assert(chainStates.get("A").bank.get("darwin").get(toDenom("atom")) == 1),

      chainStates' = chainStates,
    }
  )
}
