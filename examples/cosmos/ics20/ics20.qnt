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

  type FungibleTokenPacket = {
    denom: DenomTrace,
    amount: UINT256,
    sender: Address,
    receiver: Address,
    memo: str
  }

  type Packet = {
    data: FungibleTokenPacket,
    sourcePort: str,
    sourceChannel: Channel,
    destPort: str,
    destChannel: Channel,
  }

  // State of the IBC module
  type ModuleState = {
    bank: Accounts,
    channelEscrowAddresses: Channel -> Address,
    inFlightPackets: Set[FungibleTokenPacket]
  }

  pure def sendFungibleTokens(moduleState: ModuleState,
                              denomination: DenomTrace, amount: UINT256,
                              sender: Address, receiver: Address,
                              sourcePort: str, sourceChannel: Channel,
                              timeoutHeight: Height,
                              timeoutTimestamp: uint64): ModuleState = {
    val bankResult = if (movingBackAlongTrace({port: sourcePort, channel: sourceChannel}, denomination)) {
      // burn vouchers
      (moduleState.bank).BurnCoins(sender, denomination, amount)
    } else {
      // escrow tokens
      val escrowAccount = moduleState.channelEscrowAddresses.get(sourceChannel)
      moduleState.bank.TransferCoins(sender, escrowAccount, denomination, amount)
    }

    if (bankResult.success) {
      val packet = { denom: denomination, amount: amount, sender: sender, receiver: receiver, memo: "" }

      // handler.sendPacket
      moduleState.with("inFlightPackets", moduleState.inFlightPackets.union(Set(packet)))
    } else {
      moduleState
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
