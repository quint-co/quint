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

  /// From a module `M` and one of its channels `C`, the counterparty for `C` is
  /// the channel name for `C` in the chain it connects to. Handling channels
  /// should be extracted to a new spec.
  pure def getCounterparty(moduleName: str, sourceChannel: Channel): Channel = {
    pure val channels = Map(
      "A" -> "channelToA",
      "B" -> "channelToB",
      "C" -> "channelToC"
    )

    channels.get(moduleName)
  }

  /// `sendFugibleTokens` returns the updated module state and the updated set
  /// of in flight packets. This is the type for its returned value.
  type SendFungibleTokensResult = {
    moduleState: ModuleState,
    inFlightPackets: Set[Packet]
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

  /// `onRecvPacket` should return an acknowledgment, but it also has to update
  /// the module state, so the return type is the updated value for the module
  /// state and the acknowledgment
  type ReceiveTokenPacketResult = {
    moduleState: ModuleState,
    acknowledgement: FungibleTokenPacketAcknowledgement
  }

  pure def onRecvPacket(moduleState: ModuleState, packet: Packet): ReceiveTokenPacketResult = {
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

  /// Set o addresses for random simulation
  val addresses = Set("alice", "bob", "charlie")

  var moduleStates: str -> ModuleState
  var inFlightPackets: Set[Packet]

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

  /// A channel for a transfer from one module to another. Should be extracted
  /// to a channels quint module.
  pure def getChannelsForTransfer(sourceModule: str, destModule: str): { sourceChannel: str, destChannel: str } =
    pure val channels = Map(
      "A" -> "channelToA",
      "B" -> "channelToB",
      "C" -> "channelToC"
    )
    ({
      // If this is a transfer from A -> B, then the source channel is `channelToB`
      sourceChannel: channels.get(destModule),
      // If this is a transfer from A -> B, then the dest channel is `channelToA`
      destChannel: channels.get(sourceModule),
    })


  action init = all {
    moduleStates' = modules.mapBy(_ => {
      bank: Map(),
      channelEscrowAddresses: Set("channelToA", "channelToB", "channelToC").mapBy(_ => "escrow_account"),
    }).setBy("A", st => st.with("bank", Map("alice" -> Map(toDenom("atom") -> 100)))),
    inFlightPackets' = Set()
  }

  /// A set of all possible combinations of module, account and denom with
  /// ammount greater than 0, to be used to send a valid transfer. If we just
  /// pick these values at random, it is most likely that the bank module will
  /// refuse the transfer for lack of funds, and we won't be able to find a
  // valid example in the random simulator.
  val bankEntriesAsRecords = modules.map(m =>
    moduleStates.get(m).bank.keys().map(acc =>
      moduleStates.get(m).bank.get(acc).keys().map(denom =>
        val amount = moduleStates.get(m).bank.get(acc).get(denom)
        { mod: m, account: acc, denom: denom, amount: amount }
      )
    ).flatten()
  ).flatten().filter(r => r.amount > 0)

  /// Sends random valid transfer. Used for simulation.
  action sendSomeTransfer = {
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

  /// A set of all possible combinations of module and packet such that the
  /// packet is being sent to that module. This has to check for both
  /// `sourceChannel` and `destChannel` of the packet since channel names are
  /// not globally unique.
  val packetsToReceiveAsRecords = inFlightPackets.filter(p => p.destPort == "transfer").map(p =>
    modules.filter(mod => p.sourceChannel == getCounterparty(mod, p.destChannel) and p.destChannel.in(channelsForModule(mod))).map(mod =>
      { mod: mod, packet: p }
    )
  ).flatten()

  /// Receives some packet from `inFlightPacket` in its proper module. This is
  /// used for both simulation and tests.
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

  /// Sends 1 `denom` token from `sender` in `sourceModule` to `receiver` in
  /// `destModule`. This is a composition of two actions: one that sends the
  /// packet from `sourceModule` and other that receives the packet in `destModule`
  run sendTransfer(denom: DenomTrace, sourceModule: str, destModule: str, sender: Address, receiver: Address): bool = (
    pure val channels = getChannelsForTransfer(sourceModule, destModule)
    val result = sendFungibleTokens(sourceModule, moduleStates.get(sourceModule), inFlightPackets, denom, 1, sender, receiver, "transfer", channels.sourceChannel, 0, 0)
    all {
      moduleStates' = moduleStates.set(sourceModule, result.moduleState),
      inFlightPackets' = result.inFlightPackets
    }).then(
      receivePacket
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
      assert(moduleStates.get("A").bank.get("alice").get(toDenom("atom")) == 99),
      assert(moduleStates.get("A").bank.get("darwin").get(toDenom("atom")) == 1),

      moduleStates' = moduleStates,
      inFlightPackets' = inFlightPackets,
    }
  )
}
