// -*- mode: Bluespec; -*-

module ics20 {
  import denomTrace.*

  /* ***************************************************************************
   * TYPES
   * **************************************************************************/

  // Fundamental types
  type Channel = str
  type Address = str
  type Height = int

  // IBC packet types
  type FungibleTokenPacketAcknowledgement = {
    success: bool,
    errorMessage: str
  }

  type FungibleTokenPacket = {
    denom: DenomTrace,
    amount: uint256,
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
    channelEscrowAddresses: Channel -> Address,
    inFlightPackets: Set[FungibleTokenPacket]
  }

  pure def sendFungibleTokens(moduleState: ModuleState,
                              denomination: DenomTrace, amount: uint256,
                              sender: Address, receiver: Address,
                              sourcePort: str, sourceChannel: Channel,
                              timeoutHeight: Height,
                              timeoutTimestamp: uint64): ModuleState = {
    val isSource = senderIsSource(sourcePort, sourceChannel, ModuleState)
    val bankResult = if (isSource) {
      // escrow tokens
      val escrowAccount = moduleState.channelEscrowAddresses.get(sourceChannel)
      bank.TransferCoins(sender, escrowAccount, denomination, amount)
    } else {
      // burn vouchers
      bank.BurnCoins(sender, denomination, amount)
    }

    if (bankResult.success) {
      val packet = { denom: denomination, amount: amount, sender: sender, receiver: receiver }

      // handler.sendPacket
      moduleState.with("inFlightPackets", moduleState.inFlightPackets.union(Set(packet)))
    } else {
      moduleState
    }
  }

  pure def onRecvPacket(moduleState: ModuleState,
                        packet: Packet): FungibleTokenPacketAcknowledgement = {
    val data = packet.data
    if (receiverIsSource(packet.sourcePort, packet.sourceChannel, data.denom)) {
      // unescrow tokens to receiver
      val escrowAccount = moduleState.channelEscrowAddresses.get(packet.destChannel)
      val receiverDenom = data.denom.tail()

      val bankResult = bank.TransferCoins(escrowAccount, data.receiver, receiverDenom, data.amount)

      if (bankResult.success) {
        { success: true, errorMessage: "" }
      } else {
        { success: true, errorMessage: "transfer coins failed" }
      }
    } else {
      // mint vouchers to receiver
      val prefix = [packet.destPort, packet.destChannel]
      val prefixedDenom = prefix.append(data.denom)

      val bankResult = bank.MintCoins(data.receiver, prefixedDenomination, data.amount)

      if (bankResult.success) {
        { success: true, errorMessage: "" }
      } else {
        { success: false, errorMessage: "mint coins failed" }
      }
    }
  }
}
