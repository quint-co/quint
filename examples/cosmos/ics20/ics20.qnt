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
      { success: true, errorMessage: "" }
    } else {
      { success: false, errorMessage: errorMessage }
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
      if (movingBackAlongTrace(source, data.denom)) {
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

  pure val ATOM = toDenom("atom")
  pure val ESCROW_ACCOUNT = "escrow_account"

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
      bank: if (chain == "A") Map("alice" -> Map(ATOM -> 100)) else Map(),
      channels: channelCounterparties.get(chain),
      channelEscrowAddresses: channelCounterparties.get(chain).keys().mapBy(_ => ESCROW_ACCOUNT),
      outPackets: Set()
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
                                                 "transfer", channelTopology.get(sourceChain).get(destChain),
                                                 0, 0)

    // (3) Quint state transition:
    chainStates' = chainStates.set(sourceChain, newSourceChainState)
  }

  /// Receives a packet sent from `sourceChain` to `destChain`, and delivers
  /// the acknowledgement back to `sourceChain`.
  action receiveAndAckPacket(sourceChain: str, destChain: str): bool = all {
    // (1) Pre-condition:
    // ICS 4: "a channel is a pipeline for exactly-once packet delivery between specific modules on **separate** blockchains"
    sourceChain != destChain,

    // (2) Compute updated chain states:
    val sourceChainState = chainStates.get(sourceChain)
    // non-deterministically pick a packet from `sourceChain` to receive on `destChain`
    nondet packet = sourceChainState.outPackets.oneOf()
    // call the `onRecvPacket` callback
    val recvResult = onRecvPacket(chainStates.get(destChain), packet)
    val newDestChainState = recvResult._1
    val acknowledgement   = recvResult._2
    // deliver the acknowledgement on `sourceChain`, clean up the sent packet
    // TODO(thpani): split this into a separate action
    val newSourceChainPackets = sourceChainState.outPackets.exclude(Set(packet))
    val newSourceChainState   = onAcknowledgePacket(sourceChainState, packet, acknowledgement)
                                      .with("outPackets", newSourceChainPackets)

    // (3) Quint state transition:
    chainStates' = chainStates
                      .set(destChain, newDestChainState)
                      .set(sourceChain, newSourceChainState)
  }

  /// Send `amount`-many `denom` tokens from `sender` in `sourceChain` to
  /// `receiver` in `destChain`.
  ///
  /// This is a composition of two actions: one that sends the packet from
  /// `sourceChain` and another that receives the packet in `destChain` and
  /// returns an acknowldgement to `sourceChain`.
  run sendTransfer(denom: DenomTrace, amount: UINT256, sourceChain: str, destChain: str, sender: Address, receiver: Address): bool = (
    all {
      sendPacket(sourceChain, destChain, denom, amount, sender, receiver)
    }).then(
      receiveAndAckPacket(sourceChain, destChain)
    )

  /****************************************************************************
   * TESTS
   ***************************************************************************/

  // Transfer a single token across these chains: A -> B -> C -> A -> C -> B -> A
  // All transfers are acknowledged as successful.
  run ABCACBATest = init.then(all {
    assert(chainStates.get("A").bank.get("alice").get(ATOM) == 100),
    sendTransfer(ATOM, 1, "A", "B", "alice", "bob")
  }).then(
    pure val denom: DenomTrace = { baseDenom: "atom", path: [{ port: "transfer", channel: "channelToA" }] }
    sendTransfer(denom, 1,  "B", "C", "bob", "charlie")
  ).then(
    pure val denom: DenomTrace = { baseDenom: "atom", path: [
      { port: "transfer", channel: "channelToB" },
      { port: "transfer", channel: "channelToA" }
    ] }

    sendTransfer(denom, 1, "C", "A", "charlie", "alice")
  ).then(
    pure val denom: DenomTrace = { baseDenom: "atom", path: [
      { port: "transfer", channel: "channelToC" },
      { port: "transfer", channel: "channelToB" },
      { port: "transfer", channel: "channelToA" }
    ] }

    sendTransfer(denom, 1, "A", "C", "alice", "bob")
  ).then(
    pure val denom: DenomTrace = { baseDenom: "atom", path: [
      { port: "transfer", channel: "channelToB" },
      { port: "transfer", channel: "channelToA" }
    ] }

    sendTransfer(denom, 1, "C", "B", "bob", "charlie")
  ).then(
    pure val denom: DenomTrace = { baseDenom: "atom", path: [
      { port: "transfer", channel: "channelToA" }
    ] }

    sendTransfer(denom, 1, "B", "A", "charlie", "darwin")
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
  // 3. Transfer the 50 tokens back from Bob to Alice.
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
    sendTransfer(ATOM, 50, "A", "B", "alice", "bob")
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

      // 3. Transfer the 50 tokens back from Bob to Alice.
      sendTransfer(voucherDenom, 50, "B", "A", "bob", "alice")
  }).then(
    pure val voucherDenom: DenomTrace = { baseDenom: "atom", path: [{ port: "transfer", channel: "channelToA" }] }
    all {
      // Assert that the vouchers have been minted back
      assert(chainStates.get("A").bank.getBalances("alice").getBalance(ATOM) == 50),
      assert(chainStates.get("A").bank.getBalances(ESCROW_ACCOUNT).getBalance(ATOM) == 49),
      assert(chainStates.get("B").bank.getBalances("bob").getBalance(voucherDenom) == 50),

      // noop
      chainStates' = chainStates
  })

  // TODO(thpani): add a test for packet timeout
}
