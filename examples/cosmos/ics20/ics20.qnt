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

  /// State of the IBC module in a chain
  type ChainState = {
    bank: Accounts,
    channels: ChannelCounterparties,
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

    pure val newChainState = chainState.with("bank", result._1.accounts)
    pure val ack = if (result._1.success) {
      { success: true, errorMessage: "" }
    } else {
      { success: false, errorMessage: result._2 }
    }

    (newChainState, ack)
  }
}

module ics20Test {
  import base.* from "./base"
  import ics20.*

  /// Map from chain identifiers to their state
  var chainStates: str -> ChainState

  /// Map from chain identifiers to a map of the chain identifiers it can
  /// communicate with and the channel to be used to send packets. For example,
  /// chain A connects to chain B through channel "channelToB".
  pure val channelTopology = Map(
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

  /// For each chain, a map from channel to their channel counterparties,
  /// derived from `channelTopology`. For example, in chain A, channel "channelToB"
  /// has the counterparty "channelToA".
  pure val channelCounterparties: str -> Channel -> Channel = channelTopology.keys().mapBy(chain => {
    pure val connectedChains = channelTopology.get(chain).keys()
    connectedChains.map(counterpartyChain => {
      pure val localChannel = channelTopology.get(chain).get(counterpartyChain)
      pure val counterpartyChannel = channelTopology.get(counterpartyChain).get(chain)
      (localChannel, counterpartyChannel)
    }).setToMap()
  })

  action init = {
    chainStates' = channelTopology.keys().mapBy(chain => {
      // All accounts are empty, except for Alice in chain A who has 100 atoms
      bank: if (chain == "A") Map("alice" -> Map(toDenom("atom") -> 100)) else Map(),
      channels: channelCounterparties.get(chain),
      channelEscrowAddresses: channelCounterparties.get(chain).keys().mapBy(_ => "escrow_account"),
      outPackets: Set()
    })
  }

  /// Receives a packet sent from `sourceChain` to `destChain`
  action receivePacket(sourceChain: str, destChain: str): bool = {
    val sourceChainState = chainStates.get(sourceChain)
    nondet packet = sourceChainState.outPackets.oneOf()
    val result = onRecvPacket(chainStates.get(destChain), packet)
    all {
      chainStates' = chainStates
        .set(destChain, result._1)
        .set(sourceChain, sourceChainState.with("outPackets", sourceChainState.outPackets.exclude(Set(packet))))
    }
  }

  /// Sends 1 `denom` token from `sender` in `sourceChain` to `receiver` in
  /// `destChain`. This is a composition of two actions: one that sends the
  /// packet from `sourceChain` and other that receives the packet in `destChain`
  run sendTransfer(denom: DenomTrace, sourceChain: str, destChain: str, sender: Address, receiver: Address): bool = (
    all {
      val result = sendFungibleTokens(chainStates.get(sourceChain), denom, 1, sender, receiver, "transfer", channelTopology.get(sourceChain).get(destChain), 0, 0)
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
