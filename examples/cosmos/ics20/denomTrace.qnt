// -*- mode: Bluespec; -*-

/**
 * A specification for the denomination trace manipulation in the ICS20 fungible
 * token transfer protocol.
 *
 * Gabriela Moreira, Informal Systems, 2023
 */
module denomTrace {
  import base.* from "./base"

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
    pure val chainNames = Set("A", "B", "C") // should be setup.keys(), but that's breaking the effect checker somehow (see issue #808)
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
  import base.* from "./base"
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
