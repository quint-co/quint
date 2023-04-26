# Quint spec of ICS 20 (Fungible Token Transfer)

This is a formal specification of [ICS 20][] (Fungible Token Transfer) in Quint:

## Overview

The specification is made up of the following modules:

- `bank` contains an abstract bank module that supports minting, burning, and
  transfer of fungible tokens.

## Assumptions

Where the [natural language spec][ICS 20] is imprecise or underspecified, we
make the following assumptions:

### Bank

In general, the bank module is underspecified. We provide an abstract,
common-sense specification and make the following assumptions:

- Balances and operations over balances use mathematical (unbounded) integers.
  Thus, we assume that no overflows or underflows occur inside the bank module.

- Balances are always non-negative, and operations error if there is
  insufficient balance. This assumption [is documented in pseudo-code in the
  natural language spec][balancesNonNegative] for `TransferCoins`, but not explicitely stated for
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

[ICS 20]: https://github.com/cosmos/ibc/blob/main/spec/app/ics-020-fungible-token-transfer/
[balancesNonNegative]: https://github.com/cosmos/ibc/blob/ba9c4f82e0c706761e5b4be5a4fbc270357e09e1/spec/app/ics-020-fungible-token-transfer/README.md?plain=1#L227-L235
