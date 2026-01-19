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
  /// have to check those sides of the hop because channels are unique per
  /// chain.
  ///
  /// The `hopSource` is the identifier for channel end in the source chain for
  /// a hop.
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
  pure def movingBackAlongTrace(denomTrace: DenomTrace, hopSource: HopElement): bool =
    denomTrace.path.length() >= 1 and
    denomTrace.path.head() == hopSource

  /// `updateTrace` updates a denomTrace's path either by removing or adding a
  /// hop. It removes a hop if the token is moving backwards along the trace,
  /// and adds a hop if the token is moving somewhere else.
  pure def updateTrace(movingBack: bool, denomTrace: DenomTrace, hopDestination: HopElement): DenomTrace = {
    if (movingBack) {
      // Sender is sink (receiver is source). Token is moving back in timeline.
      // Remove prefix from trace, since we already used that information to
      // find that the token just undid a previous hop.
      { baseDenom: denomTrace.baseDenom, path: denomTrace.path.tail() }
    } else {
      // Sender is source (receiver is sink). Token is moving forward in timeline.
      // Add prefix to trace, in order to know that if the token ever returns
      // from the destination chain, it is undoing this hop.
      { baseDenom: denomTrace.baseDenom, path: [hopDestination].concat(denomTrace.path) }
    }
  }

  /// `channelNamesUniquePerChain` is true iff channel names are unique by chain
  pure def channelNamesUniquePerChain(topology: ChannelTopology): bool =
    pure val chainNames = topology.keys()
    and {
      // Check the domain for the second level of chains
      chainNames.forall(chain => topology.get(chain).keys() == chainNames),
      tuples(chainNames, chainNames).forall( ((fromChain, toChain)) =>
        fromChain != toChain implies // we dont care about channels from chain to itself
          chainNames.forall((thirdChain) =>
            thirdChain != toChain implies
              topology.get(fromChain).get(toChain) != topology.get(fromChain).get(thirdChain)
          )
      )
    }
}

// Tests for denom trace manipulation
module denomTraceTest {
  import base.* from "./base"
  import denomTrace.*

  // For testing, imagine the following topology between channels in chains A, B and C.
  // PS: There should be similar channels between A and C, those are omitted in the diagram for simplicity
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
    baseDenom: "denom",
    path: [],
  }

  /// Map from chain identifiers to their IBC channels, which are maps from
  /// counterparty chain identifiers to channel identifiers. For example, chain
  /// A connects to chain B through channel "channelToB".
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

  action Transfer(sourceChain, destChain) =
    val movingBack = movingBackAlongTrace(trace, { port: "transfer", channel: channelTopology.get(sourceChain).get(destChain) })
    trace' = updateTrace(movingBack, trace, { port: "transfer", channel: channelTopology.get(destChain).get(sourceChain) })

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

    Transfer("A", "B")
  })).then((all {
    assert(trace.path == [
      { port: "transfer", channel: "channelToA" }
    ]),

    Transfer("B", "C")
  })).then((all {
    assert(trace.path == [
      { port: "transfer", channel: "channelToB" },
      { port: "transfer", channel: "channelToA" }
    ]),

    Transfer("C", "A")
  })).then((all {
    assert(trace.path == [
      { port: "transfer", channel: "channelToC" },
      { port: "transfer", channel: "channelToB" },
      { port: "transfer", channel: "channelToA" }
    ]),

    Transfer("A", "C")
  })).then((all {
    assert(trace.path == [
      { port: "transfer", channel: "channelToB" },
      { port: "transfer", channel: "channelToA" }
    ]),

    Transfer("C", "B")
  })).then((all {
    assert(trace.path == [
      { port: "transfer", channel: "channelToA" }
    ]),

    Transfer("B", "A")
  })).then((all {
    assert(trace.path == []),
    trace' = trace,
  }))
}

// This simulation model defines a simulation scenario where a token hops from A
// -> B -> C -> A -> C -> B -> A. At the end, the denom trace should have an empty
// path, as it is back in its original chain. This module is parametrized over the
// channel topology, with the intention of testing which properties of channel topology
// are important for the denom trace algorithm to work.
// There are two modules instantiating this simulation. `properChannelsTest` should pass:
//   quint test --main=properChannelsTests denomTrace.qnt
// and `randomChannelsTest` should fail:
//   quint test --main=randomChannelsTests denomTrace.qnt
module denomTraceSimulation {
  import base.* from "./base"
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

  pure val channelNames = Set("channel-1", "channel-2", "channel-3", "channel-4")

  // The parametrization of this module should be over a predicate, but operator
  // constants are broken (see #851)
  // const channelTopologyPredicate: (str -> str -> Channel) => bool
  //
  /// All possible combination of channels by chain satisfying `channelTopologyPredicate`
  // pure val possibleChannelTopologies = chains.setOfMaps(chains.setOfMaps(channelNames)).filter(channelTopologyPredicate)
  // Instead, we make the parametrization over the set of all possible channel topologies
  const possibleChannelTopologies: Set[ChannelTopology]

  var trace: DenomTrace
  var channelTopology: ChannelTopology
  var counter: int

  action init =
    nondet someMap = possibleChannelTopologies.oneOf()
    all {
      trace' = {
        baseDenom: "denom",
        path: [],
      },
      channelTopology' = someMap,
      counter' = 0,
    }

  action step =
    val (sourceChain, destChain) = transferSequence[counter]
    val movingBack = movingBackAlongTrace(trace, { port: "transfer", channel: channelTopology.get(sourceChain).get(destChain) })
    all {
      trace' = updateTrace(movingBack, trace, { port: "transfer", channel: channelTopology.get(destChain).get(sourceChain) }),
      counter' = counter + 1,
      channelTopology' = channelTopology,
    }

  action unchanged = all {
    trace' = trace,
    counter' = counter,
    channelTopology' = channelTopology,
  }

  run simulationTest = init.then(6.reps(_ => step)).then((all {
    def show(a) = true { show(channelTopology) },
    assert(trace.path == []),
    unchanged,
  }))
}

// Fails because the channel topology is not proper
// The aim is to show that it is, in fact, necessary to enforce `channelNamesUniquePerChain`
module randomChannelsTests {
  pure val myChains = Set("A", "B", "C")
  pure val myChannelNames = Set("channelToA", "channelToB", "channelToC")

  import denomTraceSimulation(
    possibleChannelTopologies = myChains.setOfMaps(myChains.setOfMaps(myChannelNames))
  ).*
}

// Passes because the channel topology is proper
module properChannelsTests {
  pure val myChains = Set("A", "B", "C")
  pure val myChannelNames = Set("channelToA", "channelToB", "channelToC")

  import base.* from "./base"
  import denomTrace.channelNamesUniquePerChain

  import denomTraceSimulation(
    possibleChannelTopologies = myChains.setOfMaps(myChains.setOfMaps(myChannelNames)).filter(channelNamesUniquePerChain)
  ).*
}
