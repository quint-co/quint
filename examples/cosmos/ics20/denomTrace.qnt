// -*- mode: Bluespec; -*-

/**
 * A specification for the denomination trace manipulation in the ICS20 fungible
 * token transfer protocol.
 *
 * Gabriela Moreira, Informal Systems, 2023
 */
module denomTrace {
  /// A hop is a step taken by a token sent from one chain to another. In this
  /// spec, we only care about one element of the hop (sometimes the source
  /// chain, sometimes the destination chain). A `HopElement` is a representation
  /// of either the source or the destination chain of a hop.
  type HopElement = {
    port: str,
    channel: str,
  }

  /// A denomination trace is a representation of the original denomination
  /// (also: base denomination) and all the hops it has done to get where it is.
  /// For every token transfer, ICS-020 either adds or removes one hop from the
  /// list. In the implementation, a `DenomTrace` is represented as a string of
  /// the form
  /// `{ics20Port_n}/{ics20Channel_n}/.../{ics20Port_1}/{ics20Channel_1}/{baseDenom}`,
  /// where `ics20Port_i` and `ics20Channel_i` are the destination port and
  /// channel of the i-th hop. A token transfer then means adding or dropping a
  /// prefix.
  type DenomTrace = {
    path: List[HopElement],
    baseDenom: str,
  }

  /// `movingBackAlongTrace` is true for a hop iff that hop is the reverse of the
  /// last hop done by the token. That is, if the source of this hop is equal to
  /// the destination of the last hop (which is saved in the trace). We only
  /// have to check those sides of the hop because channels are unique per chain.
  ///
  /// Nomeclature from the english spec/reference implementation: This is called
  /// `receiverIsSource`. A chain can act as either a source or a sink: "A way of
  /// thinking of source and sink zones is through the token's timeline. Each
  /// send to any chain other than the one it was previously received from is a
  /// movement forwards in the token's timeline. This causes trace to be added to
  /// the token's history and the destination port and destination channel to be
  /// prefixed to the denomination. In these instances the sender chain is acting
  /// as the source zone. When the token is sent back to the chain it previously
  /// received from, the prefix is removed. This is a backwards movement in the
  /// token's timeline and the sender chain is acting as the sink zone."
  pure def movingBackAlongTrace(hopSource: HopElement, denomTrace: DenomTrace): bool =
    denomTrace.path.length() >= 1 and
    denomTrace.path.head() == hopSource

  /// `updateTrace` updates a denomTrace's path either by removing or adding a
  /// hop. It removes a hop if the token is moving backwards along the trace,
  /// and adds a hop if the token is moving somewhere else.
  pure def updateTrace(denomTrace: DenomTrace, sourcePort: str, sourceChannel: str, destPort: str, destChannel: str): DenomTrace = {
    val hopSource = { port: sourcePort, channel: sourceChannel }
    val hopDestination = { port: destPort, channel: destChannel}
    if (movingBackAlongTrace(hopSource, denomTrace)) {
      // Sender is sink (receiver is source). Token is moving back in timeline.
      // Remove prefix from trace, since we already used that information to
      // find that the token just undid a previous hop.
      { path: denomTrace.path.tail(), baseDenom: denomTrace.baseDenom }
    } else {
      // Sender is source (receiver is sink). Token is moving forward in timeline.
      // Add prefix to trace, in order to know that if the token ever returns
      // from the destination chain, it is undoing this hop.
      { path: [hopDestination].concat(denomTrace.path), baseDenom: denomTrace.baseDenom }
    }
  }

  /// `isProperChannelSetup` is true iff channel names are unique by chain
  pure def isProperChannelSetup(setup: str -> str -> str): bool =
    pure val chainNames = Set("A", "B", "C") // should be channelSetup.keys(), but that's breaking the effect checker somehow (see issue #808)
    and {
      // Check the domain for the second level of chains
      chainNames.forall(chain => setup.get(chain).keys() == chainNames),
      tuples(chainNames, chainNames).forall((fromChain, toChain) =>
        fromChain != toChain implies // we dont care about channels from chain to itself
          chainNames.forall((thirdChain) =>
            thirdChain != toChain implies
              setup.get(fromChain).get(toChain) != setup.get(fromChain).get(thirdChain)
          )
      )
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

  /// Finds the correct channels for a transfer according to the chain setup
  /// described above
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
  // 1. A -> B : sender chain is source zone. Token is moving away from origin.
  //   Denom: transfer/channelToA/denom
  // 2. B -> C : sender chain is source zone. Token is moving away from origin.
  //   Denom: transfer/channelToB/transfer/channelToA/denom
  // 3. C -> A : sender chain is source zone. Token is moving away from origin.
  //   Denom: transfer/channelToC/transfer/channelToB/transfer/channelToA/denom
  // 4. A -> C : sender chain is sink zone. Token is returning to origin.
  //   Denom: transfer/channelToB/transfer/channelToA/denom
  // 5. C -> B : sender chain is sink zone. Token is returning to origin.
  //   Denom: transfer/channelToA/denom
  // 6. B -> A : sender chain is sink zone. Token is returning to origin.
  //   Denom: denom
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

module denomTraceSimulation {
  import denomTrace.*

  pure val chains = Set("A", "B", "C")
  pure val transferSequence = List(
    ("A", "B"),
    ("B", "C"),
    ("C", "A"),
    ("A", "C"),
    ("C", "B"),
    ("B", "A")
  )

  const channelPredicate: (str -> str -> str) => bool

  pure val channelNames = Set("channel-1", "channel-2", "channel-3")

  /// All possible combination of channels by chain satisfying `channelPredicate`
  pure val possibleChannelSetups = chains.setOfMaps(chains.setOfMaps(channelNames)).filter(channelPredicate)

  var trace: DenomTrace
  var channelSetup: str -> str -> str
  var counter: int

  def getChannelsForTransfer(transfer: (str, str)): { sourceChannel: str, destChannel: str } =
    ({
      sourceChannel: channelSetup.get(transfer._1).get(transfer._2),
      // The destination channel would be the source channel in the opposite
      // direction, so we only need to reverse the order of the chains
      destChannel: channelSetup.get(transfer._2).get(transfer._1),
    })

  action init =
    nondet someMap = possibleChannelSetups.oneOf()
    all {
      trace' = {
        path: [],
        baseDenom: "denom",
      },
      channelSetup' = someMap,
      counter' = 0,
    }

  action step =
    val channels = getChannelsForTransfer(transferSequence[counter])
    all {
      trace' = updateTrace(trace, "transfer", channels.sourceChannel, "transfer", channels.destChannel),
      counter' = counter + 1,
      channelSetup' = channelSetup,
    }

  action unchanged = all {
    trace' = trace,
    counter' = counter,
    channelSetup' = channelSetup,
  }

  run simulationTest = init.then(step.repeated(6)).then((all {
    def show(a) = true { show(channelSetup) },
    assert(trace.path == []),
    unchanged,
  }))
}

// Fails because the channel setup is not proper
// The aim is to show that it is, in fact, necessary to enforce `isProperChannelSetup`
module randomChannelsPBT {
  import denomTraceSimulation(
    channelPredicate = (_) => true
  ) as S
}

// Passes because the channel setup is proper
module properChannelsPBT {
  import denomTrace.isProperChannelSetup

  import denomTraceSimulation(
    channelPredicate = isProperChannelSetup
  ) as S
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
      if (movingBackAlongTrace({ port: packet.sourcePort, channel: packet.sourceChannel}, packet.data.ibcTrace))
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
