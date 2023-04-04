// -*- mode: Bluespec; -*-

/**
 * A specification ICS20 fungible token transfer protocol.
 *
 * For now, this only models the denomination trace changes between transfers.
 *
 * Gabriela Moreira, Informal Systems, 2023
 */
module ics20 {
  type Uint = int

  type State = {
    trace: List[str],
    denom: str,
  }

  type FungibleTokenPacketData = {
    trace: List[str],
    denom: str,
    amount: Uint,
    sender: str,
    receiver: str,
  }

  type Packet = {
    data: FungibleTokenPacketData,
    sourcePort: str,
    sourceChannel: str,
    destPort: str,
    destChannel: str,
  }

  pure def onRecvPacket(packet: Packet): State =
    pure val trace = packet.data.trace
    pure val sourcePrefix = [packet.sourcePort, packet.sourceChannel]
    if (trace.length() >= 2 and trace.slice(0, 2) == sourcePrefix) {
      // Sender is source
      // Remove prefix from trace
      pure val newTrace = if (trace.length() == 2) [] else trace.slice(2, trace.length())
      { trace: newTrace, denom: packet.data.denom }
    } else {
      // Sender is sink
      // Add prefix to trace
      pure val sinkPrefix = [packet.destPort, packet.destChannel]
      { trace: sinkPrefix.concat(trace), denom: packet.data.denom }
    }

  var state: State

  action init =
    nondet denom = Set("denom1", "denom2", "denom3").oneOf()
    state' = {
      trace: [],
      denom: denom,
    }

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
  pure def buildPacket(currentState: State, source: str, dest: str): Packet =
    pure val channels = Map(
      "A" -> "channelToA",
      "B" -> "channelToB",
      "C" -> "channelToC"
    )
    ({
      data: {
        trace: currentState.trace,
        denom: currentState.denom,
        amount: 100,
        sender: source,
        receiver: dest,
      },
      sourcePort: "transfer",
      // If this is a transfer from A -> B, then the source channel is `channelToB`
      sourceChannel: channels.get(dest),
      destPort: "transfer",
      // If this is a transfer from A -> B, then the dest channel is `channelToA`
      destChannel: channels.get(source),
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
    assert(state.trace == []),
    state' = onRecvPacket(buildPacket(state, "A", "B")),
  })).then((all {
    assert(state.trace == ["transfer", "channelToA"]),
    state' = onRecvPacket(buildPacket(state, "B", "C")),
  })).then((all {
    assert(state.trace == ["transfer", "channelToB", "transfer", "channelToA"]),
    state' = onRecvPacket(buildPacket(state, "C", "A")),
  })).then((all {
    assert(state.trace == ["transfer", "channelToC", "transfer", "channelToB", "transfer", "channelToA"]),
    state' = onRecvPacket(buildPacket(state, "A", "C")),
  })).then((all {
    assert(state.trace == ["transfer", "channelToB", "transfer", "channelToA"]),
    state' = onRecvPacket(buildPacket(state, "C", "B")),
  })).then((all {
    assert(state.trace == ["transfer", "channelToA"]),
    state' = onRecvPacket(buildPacket(state, "B", "A")),
  })).then((all {
    assert(state.trace == []),
    state' = state,
  }))
}
