# Quint spec of ICS 20 (Fungible Token Transfer)

## Context

This is a formal specification of [ICS 20][] (Fungible Token Transfer) in Quint.

ICS 20 is an [IBC][] application-layer protocol that enables transfer of fungible tokens between separate chains.

## Overview

The central data structure of ICS 20 is a [*denomination trace*][denomination trace] (DT). A DT extends the fungible token's *base denomination* with a list of *hops*. This list of hops records the chains (or, more accurately, the [IBC channels][IBC channel]) that the token has traveled across to arrive at its current location. We specify the DT data structure and its operations in [`denomTrace.qnt`](./denomTrace.qnt).

The ICS 20 protocol itself is made up of a function `sendFungibleTokens` that initiates a token transfer to another chain, and the IBC callback handlers `onRecvPacket`, `onAcknowledgePacket`, and `onTimeoutPacket`. We specify these in [`ics20.qnt`](./ics20.qnt).

Finally, ICS 20 assumes an abstract bank module that is used for minting, burning, and on-chain transfer of fungible tokens. We provide a specification in [`bank.qnt`](./bank.qnt).

## How to use

### Interactively

Quint allows you to interact with the ICS 20 specification, for example to inspect intermediate system states. To do so, start the Quint REPL and load the spec:

```sh
$ cd examples/cosmos/ics20
$ quint repl -r ics20.qnt::ics20Test
Quint REPL 0.10.0
Type ".exit" to exit, or ".help" for more information
true

>>>
```

`ics20Test` sets up three chains `"A"`, `"B"` and `"C"`, all connected to each other via a channel `"channelToX"`.


It also provides an action `init` that sets up the initial state of the protocol. This assigns 100 ATOM to account `"alice"` on chain `"A"`.
The state of each chain is available as `chainStates.get(`chain`)`, and can be inspected interactively:

```bluespec
>>> init
true
>>> chainStates.get("A")
{
  bank: Map("alice" -> Map({ baseDenom: "atom", path: [] } -> 100)),
  channelEscrowAddresses: Map("channelToB" -> "escrow_account", "channelToC" -> "escrow_account"),
  channels: Map("channelToB" -> "channelToA", "channelToC" -> "channelToA"),
  inAcknowledgements: Set(),
  inTimeouts: Set(),
  outPackets: Set(),
  receivedButUnacknowledgedPackets: Set()
}
```

We can now initiate a transfer of 1 ATOM from `"alice"` on chain `"A"` to `"bob"` on chain `"B"`:

```bluespec
>>> sendPacket("A", "B", ATOM, 1, "alice", "bob")
true
```

Following the ICS 20 protocol, 1 ATOM has been moved out of Alice's account, and into a module-specific escrow account:

```bluespec
>>> chainStates.get("A")
{
  bank: Map(
    "alice" -> Map({ baseDenom: "atom", path: [] } -> 99),
    "escrow_account" -> Map({ baseDenom: "atom", path: [] } -> 1)
  ),
  // ...
  outPackets:
    Set(
      {
        data: { amount: 1, denom: { baseDenom: "atom", path: [] }, memo: "", receiver: "bob", sender: "alice" },
        destChannel: "channelToA",
        destPort: "transfer",
        sourceChannel: "channelToB",
        sourcePort: "transfer"
      }
    ),
}
```

Also note that the outgoing IBC packet has been added to the chain state.

By executing the `sendPacket` action, the packet was only sent, but not yet relayed/received. We can convince ourselves by checking that the bank state on chain `"B"` has not yet changed:

```bluespec
>>> chainStates.get("B").bank
Map()
```

Let's now take action `receivePacket`, which triggers receival of the packet:

```bluespec
>>> receivePacket("A", "B")
true
>>> chainStates.get("B")
{
  bank: Map("bob" -> Map({ baseDenom: "atom", path: [{ channel: "channelToA", port: "transfer" }] } -> 1)),
  channelEscrowAddresses: Map("channelToA" -> "escrow_account", "channelToC" -> "escrow_account"),
  channels: Map("channelToA" -> "channelToB", "channelToC" -> "channelToB"),
  inAcknowledgements: Set(),
  inTimeouts: Set(),
  outPackets: Set(),
  receivedButUnacknowledgedPackets: Set()
}
```

Now Bob has been minted the sent token. We can also see that the token's base denomination has been extended with a trace of its origin (`{ channel: "channelToA", port: "transfer" }`).

Receival of the packet has created an IBC acknowledgement. Although receival of a successful acknowledgement has no effect, let's receive it on chain `"A"`:

```bluespec
>>> chainStates.get("A").inAcknowledgements
Set({ errorMessage: "", success: true })
>>> receiveAck("A")
true
```

To take the protocol through a complete transfer, in a single step, use the `sendTransfer` run:

```bluespec
>>> sendTransfer("A", "B", ATOM, 50, "alice", "charlie")
true
>>> chainStates.get("A").bank
Map(
  "alice" -> Map({ baseDenom: "atom", path: [] } -> 49),
  "escrow_account" -> Map({ baseDenom: "atom", path: [] } -> 51)
)
>>> chainStates.get("B").bank
Map(
  "bob" -> Map({ baseDenom: "atom", path: [{ channel: "channelToA", port: "transfer" }] } -> 1),
  "charlie" -> Map({ baseDenom: "atom", path: [{ channel: "channelToA", port: "transfer" }] } -> 50)
)
```

We also provide actions `timeoutPacket` and `receiveTimeout`, that can be called instead of `receivePacket` and `receiveAck` to simulate a timed out transfer.

### Tests

Instead of exploring the protocol interactively, we can encode longer protocol runs, together with assertions that assure correct behavior, as Quint tests. Use the Quint test runner to execute the tests in [`ics20.qnt`](./ics20.qnt):

```sh
$ quint test --main=ics20Test examples/cosmos/ics20/ics20.qnt

  ics20Test
    ok ABCACBATest passed 10000 test(s)
    ok TransferTest passed 10000 test(s)
    ok FailedAckTest passed 10000 test(s)
    ok TimeoutTest passed 10000 test(s)

  4 passing
```

## Assumptions

Where the [natural language spec][ICS 20] is imprecise or underspecified, we
make the following assumptions:

### `bank.qnt`

In general, the bank module is not specified in detail. We provide an abstract,
common-sense specification and make the following assumptions:

- Balances and operations over balances use mathematical (unbounded) integers.
  Thus, we assume that no overflows or underflows occur inside the bank module.

- Balances are always non-negative, and operations error if there is
  insufficient balance. This assumption [is documented in pseudo-code in the
  natural language spec][balancesNonNegative] for `TransferCoins`, but not explicitly stated for
  `BurnCoins`:

```typescript
if source {
  // determine escrow account
  escrowAccount = channelEscrowAddresses[sourceChannel]
  // escrow source tokens (assumed to fail if balance insufficient)
  bank.TransferCoins(sender, escrowAccount, denomination, amount)
} else {
  // receiver is source chain, burn vouchers
  bank.BurnCoins(sender, denomination, amount)
}
```

### `ics20.qnt`

- Amounts are typed `UINT256`, but for simplicity we model this type as `int`. Thus, the spec does not contain any overflow-related behavior.

[ICS 20]: https://github.com/cosmos/ibc/blob/main/spec/app/ics-020-fungible-token-transfer/
[IBC]: https://ibcprotocol.org/
[IBC channel]: https://github.com/cosmos/ibc/tree/main/spec/core/ics-004-channel-and-packet-semantics
[denomination trace]: https://github.com/cosmos/ibc/tree/main/spec/app/ics-020-fungible-token-transfer#data-structures
[balancesNonNegative]: https://github.com/cosmos/ibc/blob/ba9c4f82e0c706761e5b4be5a4fbc270357e09e1/spec/app/ics-020-fungible-token-transfer/README.md?plain=1#L227-L235
