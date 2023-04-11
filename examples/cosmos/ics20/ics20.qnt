// -*- mode: Bluespec; -*-

/**
 * A specification ICS20 fungible token transfer protocol.
 *
 * For now, this only models the denomination trace changes between transfers.
 *
 * Gabriela Moreira, Informal Systems, 2023
 */
module denomTrace {
  type Hop = {
    port: str,
    channel: str,
  }

  type DenomTrace = {
    path: List[Hop],
    baseDenom: str,
  }

  pure def goingTowardsOrigin(sourcePort: str, sourceChannel: str, denomTrace: DenomTrace): bool =
    denomTrace.path.length() >= 1 and
    denomTrace.path.head() == { channel: sourceChannel, port: sourcePort }

  pure def updateTrace(denomTrace: DenomTrace, sourcePort: str, sourceChannel: str, destPort: str, destChannel: str): DenomTrace = {
    if (goingTowardsOrigin(sourcePort, sourceChannel, denomTrace)) {
      // Sender is sink (receiver is source)
      // Remove prefix from trace
      { path: denomTrace.path.tail(), baseDenom: denomTrace.baseDenom }
    } else {
      // Sender is source (receiver is sink)
      // Add prefix to trace
      { path: [{ port: destPort, channel: destChannel }].concat(denomTrace.path), baseDenom: denomTrace.baseDenom }
    }
  }
}

// Tests for denom trace manipulation
module denomTraceTest {
  import denomTrace.*

  // For testing, imagine the following channels in these chains setups
  // PS: There should be similar channels between A and C, those are ommited in the diagram for simplicity
  // ┌───────────────────┐           ┌────────────────────────────────────┐         ┌───────────────────┐
  // │      Chain A      │           │               Chain B              │         │      Chain C      │
  // │                   │           │                                    │         │                   │
  // │ ┌───────────────┐ │           │ ┌──────────────┐  ┌──────────────┐ │         │ ┌───────────────┐ │
  // │ │               │ │           │ │              │  │              │ │         │ │               │ │
  // │ │  channelToB   │◄├───────────┤►│  channelToA  │  │  channelToC  │◄├─────────┤►│  channelToB   │ │
  // │ │               │ │           │ │              │  │              │ │         │ │               │ │
  // │ └───────────────┘ │           │ └──────────────┘  └──────────────┘ │         │ └───────────────┘ │
  // │                   │           │                                    │         │                   │
  // └───────────────────┘           └────────────────────────────────────┘         └───────────────────┘

  var trace: DenomTrace

  action init = trace' = {
    path: [],
    baseDenom: "denom",
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

  // Example from https://github.com/cosmos/ibc-go/blob/457095517b7832c42ecf13571fee1e550fec02d0/modules/apps/transfer/keeper/relay.go#L18-L49
  // These steps of transfer occur: A -> B -> C -> A -> C -> B -> A
  //
  // 1. A -> B : sender chain is source zone. Denom upon receiving: 'B/denom'
  // Actual denom: transfer/channelToA/denom
  // 2. B -> C : sender chain is source zone. Denom upon receiving: 'C/B/denom'
  // Actual denom: transfer/channelToB/transfer/channelToA/denom
  // 3. C -> A : sender chain is source zone. Denom upon receiving: 'A/C/B/denom'
  // Actual denom: transfer/channelToC/transfer/channelToB/transfer/channelToA/denom
  // 4. A -> C : sender chain is sink zone. Denom upon receiving: 'C/B/denom'
  // Actual denom: transfer/channelToB/transfer/channelToA/denom
  // 5. C -> B : sender chain is sink zone. Denom upon receiving: 'B/denom'
  // Actual denom: transfer/channelToA/denom
  // 6. B -> A : sender chain is sink zone. Denom upon receiving: 'denom'
  // Actual denom: denom
  run transferTest = init.then((all {
    assert(trace.path == []),

    pure val channels = getChannelsForTransfer("A", "B")
    trace' = updateTrace(trace, "transfer", channels.sourceChannel, "transfer", channels.destChannel),
  })).then((all {
    assert(trace.path == [
      { port: "transfer", channel: "channelToA" }
    ]),

    pure val channels = getChannelsForTransfer("B", "C")
    trace' = updateTrace(trace, "transfer", channels.sourceChannel, "transfer", channels.destChannel),
  })).then((all {
    assert(trace.path == [
      { port: "transfer", channel: "channelToB" },
      { port: "transfer", channel: "channelToA" }
    ]),

    pure val channels = getChannelsForTransfer("C", "A")
    trace' = updateTrace(trace, "transfer", channels.sourceChannel, "transfer", channels.destChannel),
  })).then((all {
    assert(trace.path == [
      { port: "transfer", channel: "channelToC" },
      { port: "transfer", channel: "channelToB" },
      { port: "transfer", channel: "channelToA" }
    ]),

    pure val channels = getChannelsForTransfer("A", "C")
    trace' = updateTrace(trace, "transfer", channels.sourceChannel, "transfer", channels.destChannel),
  })).then((all {
    assert(trace.path == [
      { port: "transfer", channel: "channelToB" },
      { port: "transfer", channel: "channelToA" }
    ]),

    pure val channels = getChannelsForTransfer("C", "B")
    trace' = updateTrace(trace, "transfer", channels.sourceChannel, "transfer", channels.destChannel),
  })).then((all {
    assert(trace.path == [
      { port: "transfer", channel: "channelToA" }
    ]),

    pure val channels = getChannelsForTransfer("B", "A")
    trace' = updateTrace(trace, "transfer", channels.sourceChannel, "transfer", channels.destChannel),
  })).then((all {
    assert(trace.path == []),
    trace' = trace,
  }))
}

// For now, this module is just a setup to show how `denomTrace` can be used in the IBC context.
module ics20 {
  import denomTrace.*

  type Uint = int

  type FungibleTokenPacketData = {
    ibcTrace: DenomTrace,
    amount: Uint,
    sender: str,
    receiver: str,
    memo: str,
  }

  type Packet = {
    data: FungibleTokenPacketData,
    sourcePort: str,
    sourceChannel: str,
    destPort: str,
    destChannel: str,
  }

  type Result = { tokenOperation: str, ibcDenom: DenomTrace }

  pure def onRecvPacket(packet: Packet): Result =
    pure val tokenOperation =
      if (goingTowardsOrigin(packet.sourcePort, packet.sourceChannel, packet.data.ibcTrace))
        // This should interact with the bank module. For now, we just return
        // the token operation to enable visualization and testing the sequence
        // of operations.
        "transfer"
      else
        "mint"
    pure val ibcDenom = updateTrace(packet.data.ibcTrace, packet.sourcePort, packet.sourceChannel, packet.destPort, packet.destChannel)
    { tokenOperation: tokenOperation, ibcDenom: ibcDenom }
}

// An example run with some packets transferring tokens from
// A -> B -> C -> A -> C -> B -> A (the same example from denomTraceTest)
module ics20Example {
  import denomTrace.*
  import denomTraceTest.getChannelsForTransfer
  import ics20.*

  var log: List[Result]
  action init =
    log' = [{ tokenOperation: "transfer", ibcDenom: { path: [], baseDenom: "denom" } }]

  pure def buildPacket(ibcTrace: DenomTrace, sourceChain: str, destChain: str): Packet =
    pure val channels = getChannelsForTransfer(sourceChain, destChain)
    ({
      data: {
        ibcTrace: ibcTrace,
        amount: 100,
        sender: "todo",
        receiver: "todo",
        memo: "todo",
      },
      sourcePort: "transfer",
      sourceChannel: channels.sourceChannel,
      destPort: "transfer",
      destChannel: channels.destChannel,
    })

  run transferOperations = init.then((all {
    val lastTrace = log[log.length() - 1].ibcDenom
    log' = log.append(onRecvPacket(buildPacket(lastTrace, "A", "B")))
  })).then((all {
    val lastTrace = log[log.length() - 1].ibcDenom
    log' = log.append(onRecvPacket(buildPacket(lastTrace, "B", "C"))),
  })).then((all {
    val lastTrace = log[log.length() - 1].ibcDenom
    log' = log.append(onRecvPacket(buildPacket(lastTrace, "C", "A"))),
  })).then((all {
    val lastTrace = log[log.length() - 1].ibcDenom
    log' = log.append(onRecvPacket(buildPacket(lastTrace, "A", "C"))),
  })).then((all {
    val lastTrace = log[log.length() - 1].ibcDenom
    log' = log.append(onRecvPacket(buildPacket(lastTrace, "C", "B")))
  })).then((all {
    val lastTrace = log[log.length() - 1].ibcDenom
    log' = log.append(onRecvPacket(buildPacket(lastTrace, "B", "A"))),
  }))
}
