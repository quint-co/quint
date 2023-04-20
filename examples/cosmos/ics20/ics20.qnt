// -*- mode: Bluespec; -*-

module ics20 {
  import base.* from "./base"
  import denomTrace.* from "./denomTrace"
  import bank.* from "./bank"

  /* ***************************************************************************
   * TYPES
   * **************************************************************************/

  // Fundamental types
  type Channel = str
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

  // State of the IBC module
  type ModuleState = {
    bank: Accounts,
    channelEscrowAddresses: Channel -> Address,
  }

  type SendFungibleTokensResult = {
    moduleState: ModuleState,
    inFlightPackets: Set[Packet]
  }

  pure def getCounterparty(moduleName: str, sourceChannel: Channel): Channel = {
    pure val channels = Map(
      "A" -> "channelToA",
      "B" -> "channelToB",
      "C" -> "channelToC"
    )

    channels.get(moduleName)
  }

  pure def sendFungibleTokens(moduleName: str, moduleState: ModuleState, packets: Set[Packet], // this could be an `sendPacket` operator when higher-order operators are supported
                              denomination: DenomTrace, amount: UINT256,
                              sender: Address, receiver: Address,
                              sourcePort: str, sourceChannel: Channel,
                              timeoutHeight: Height,
                              timeoutTimestamp: uint64): SendFungibleTokensResult = {
    val bankResult = if (movingBackAlongTrace({port: sourcePort, channel: sourceChannel}, denomination)) {
      // burn vouchers
      (moduleState.bank).BurnCoins(sender, denomination, amount)
    } else {
      // escrow tokens
      val escrowAccount = moduleState.channelEscrowAddresses.get(sourceChannel)
      moduleState.bank.TransferCoins(sender, escrowAccount, denomination, amount)
    }

    if (bankResult.success) {
      val data = { denom: denomination, amount: amount, sender: sender, receiver: receiver, memo: "" }

      // handler.sendPacket
      val packet = {
        data: data,
        sourcePort: sourcePort,
        sourceChannel: sourceChannel,
        destPort: "transfer",
        destChannel: getCounterparty(moduleName, sourceChannel)
      }

      { moduleState: moduleState.with("bank", bankResult.accounts),
        inFlightPackets: packets.union(Set(packet)) }
    } else {
      { moduleState: moduleState, inFlightPackets: packets }
    }
  }

  type ReceiveTokenPacketResult = {
    moduleState: ModuleState,
    acknowledgement: FungibleTokenPacketAcknowledgement
  }

  pure def onRecvPacket(moduleState: ModuleState,
                        packet: Packet): ReceiveTokenPacketResult = {
    val data = packet.data
    if (movingBackAlongTrace({port: packet.sourcePort, channel: packet.sourceChannel}, data.denom)) {
      // unescrow tokens to receiver
      val escrowAccount = moduleState.channelEscrowAddresses.get(packet.destChannel)
      val receiverDenom = updateTrace(data.denom, packet.sourcePort, packet.sourceChannel, packet.destPort, packet.destChannel)

      val bankResult = moduleState.bank.TransferCoins(escrowAccount, data.receiver, receiverDenom, data.amount)

      val newModuleState = moduleState.with("bank", bankResult.accounts)
      val ack = if (bankResult.success) {
        { success: true, errorMessage: "" }
      } else {
        { success: false, errorMessage: "transfer coins failed" }
      }

      { moduleState: newModuleState, acknowledgement: ack }
    } else {
      // mint vouchers to receiver
      val prefix = [packet.destPort, packet.destChannel]
      val newDenom = updateTrace(data.denom, packet.sourcePort, packet.sourceChannel, packet.destPort, packet.destChannel)

      val bankResult = moduleState.bank.MintCoins(data.receiver, newDenom, data.amount)

      val newModuleState = moduleState.with("bank", bankResult.accounts)
      val ack = if (bankResult.success) {
        { success: true, errorMessage: "" }
      } else {
        { success: false, errorMessage: "mint coins failed" }
      }

      { moduleState: newModuleState, acknowledgement: ack }
    }
  }
}

module ics20Test {
  import base.* from "./base"
  import ics20.*

  val modules = Set("A", "B", "C")
  val addresses = Set("alice", "bob", "charlie")

  var moduleStates: str -> ModuleState
  var inFlightPackets: Set[Packet]

  pure def channelsForModule(mod: str): Set[Channel] = {
    pure val channels = Map(
      "A" -> Set("channelToB", "channelToC"),
      "B" -> Set("channelToA", "channelToC"),
      "C" -> Set("channelToA", "channelToB")
    )

    channels.get(mod)
  }

  action init = all {
    moduleStates' = modules.mapBy(_ => {
      bank: Map(),
      channelEscrowAddresses: Set("channelToA", "channelToB", "channelToC").mapBy(_ => "escrow_account"),
    }).setBy("A", st => st.with("bank", Map("alice" -> Map(toDenom("atom") -> 100)))),
    inFlightPackets' = Set()
  }

  val bankEntriesAsRecords = modules.map(m =>
    moduleStates.get(m).bank.keys().map(acc =>
      moduleStates.get(m).bank.get(acc).keys().map(denom =>
        val amount = moduleStates.get(m).bank.get(acc).get(denom)
        { mod: m, account: acc, denom: denom, amount: amount }
      )
    ).flatten()
  ).flatten().filter(r => r.amount > 0)

  action sendSomeTransfer = {
    // Find some existing ammount, sender and denom
    // pure val modulesWithTokens = modules.filter(m =>
    // moduleStates.get(mod).bank.keys().exists(k => ))
    nondet bankEntry = bankEntriesAsRecords.oneOf()
    pure val sourcePort = "transfer"
    nondet receiver = addresses.oneOf()
    nondet sourceChannel = channelsForModule(bankEntry.mod).oneOf()
    val result = sendFungibleTokens(bankEntry.mod, moduleStates.get(bankEntry.mod), inFlightPackets, bankEntry.denom, bankEntry.amount,
                                    bankEntry.account, receiver, sourcePort, sourceChannel, 0, 0)
    all {
      moduleStates' = moduleStates.set(bankEntry.mod, result.moduleState),
      inFlightPackets' = result.inFlightPackets
    }
  }

  val packetsToReceiveAsRecords = inFlightPackets.filter(p => p.destPort == "transfer").map(p =>
    modules.filter(mod => p.sourceChannel == getCounterparty(mod, p.destChannel) and p.destChannel.in(channelsForModule(mod))).map(mod =>
      { mod: mod, packet: p }
    )
  ).flatten()

  action receivePacket = {
    nondet packetEntry = packetsToReceiveAsRecords.oneOf()
    val mod = packetEntry.mod
    val packet = packetEntry.packet
    val result = onRecvPacket(moduleStates.get(mod), packet)
    all {
      moduleStates' = moduleStates.set(mod, result.moduleState),
      inFlightPackets' = inFlightPackets.exclude(Set(packet))
    }
  }

  action step = {
    any {
      sendSomeTransfer,
      receivePacket,
    }
  }

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


  run sendTransfer(denom: DenomTrace, sourceChain: str, destChain: str, sender: Address, receiver: Address): bool = (
    pure val channels = getChannelsForTransfer(sourceChain, destChain)
    val result = sendFungibleTokens(sourceChain, moduleStates.get(sourceChain), inFlightPackets, denom, 1, sender, receiver, "transfer", channels.sourceChannel, 0, 0)
    all {
      moduleStates' = moduleStates.set(sourceChain, result.moduleState),
      inFlightPackets' = result.inFlightPackets
    }).then(
      receivePacket
    )

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
      assert(moduleStates.get("A").bank.get("alice").get(toDenom("atom")) == 99),
      assert(moduleStates.get("A").bank.get("darwin").get(toDenom("atom")) == 1),

      moduleStates' = moduleStates,
      inFlightPackets' = inFlightPackets,
    }
  )
}
