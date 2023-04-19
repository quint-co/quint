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

  pure def sendFungibleTokens(moduleState: ModuleState, inFlightPackets: Set[Packet], // this could be an `sendPacket` operator when higher-order operators are supported
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
        destChannel: "A1"
      }

      { moduleState: moduleState.with("bank", bankResult.accounts),
        inFlightPackets: inFlightPackets.union(Set(packet)) }
    } else {
      { moduleState: moduleState, inFlightPackets: inFlightPackets }
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
    Set("A1", "A2", "A3")
  }

  action init = all {
    moduleStates' = modules.mapBy(_ => {
      bank: addresses.mapBy(_ => Map()).set("alice", Map(toDenom("denomA") -> 100, toDenom("denomB") -> 100)),
      channelEscrowAddresses: Map(),
    }),
    inFlightPackets' = Set()
  }

  action sendSomeTransfer(mod) = {
    nondet amount = Int.oneOf()
    nondet sender = addresses.oneOf()
    // Some denom that the sender has
    nondet denom = moduleStates.get(mod).bank.get(sender).keys().oneOf()
    nondet receiver = addresses.oneOf()
    pure val sourcePort = "transfer"
    nondet sourceChannel = channelsForModule(mod).oneOf()
    val result = sendFungibleTokens(moduleStates.get(mod), inFlightPackets, denom, amount, sender, receiver, sourcePort, sourceChannel, 0, 0)
    all {
      moduleStates' = moduleStates.set(mod, result.moduleState),
      inFlightPackets' = result.inFlightPackets
    }
  }

  action step = {
    nondet mod = modules.oneOf()
    any {
      nondet packet = inFlightPackets.filter(p => p.destPort == "transfer" and p.destChannel.in(channelsForModule(mod))).oneOf()
      val result = onRecvPacket(moduleStates.get(mod), packet)
      all {
        moduleStates' = moduleStates.set(mod, result.moduleState),
        inFlightPackets' = inFlightPackets.exclude(Set(packet))
      },
      sendSomeTransfer(mod),
    }
  }
}
