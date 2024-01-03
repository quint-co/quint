# Specifying the ERC20 interface in Quint

This directory contains a Quint specification [erc20.qnt][] of an [ERC20
token][]. It contains three modules:

 - `erc20` is an exemplary specification of IERC20. It is designed to be
   reusable in other specifications. This module is pure: It does not define
   a state machine.

 - `erc20Tests` defines a state machine that we use to show that:

   - ERC20 preserves its initial total supply, see `totalSupplyInv`,
   - ERC20 does not transfer to the address `0x0`, see `zeroAddressInv`,
   - ERC20 does not overflow the account balances, see `noOverflowInv`.
   - Method `transfer` satisfies the intuitive post-condition,
     see `transferTest`.

 - `mempool` defines a state machine that runs a single ERC20 token via
   mempool, that is, when the methods are called by external
   users. We use this state machine to demonstrate how to detect the well-known
   issue with the order of `transferFrom` and `approve`, see the [issue #20][].

   To reproduce the out-of-order scenario, run the test:

   ```sh
   quint test --main=mempool  erc20.qnt
   ```

   To automatically find more scenarios like the one above, run the random
   simulator:

   ```sh
   quint run --max-samples=1000000 --max-steps=7 --main=mempool \
     --invariant=noTransferFromWhileApproveInFlight --verbosity=3 erc20.qnt
   ```

## Comparison to TLA+

If you would like to see how this Quint specification could be written in the
syntax of TLA+, check [ERC20 in TLA+][].

[erc20.qnt]: ./erc20.qnt
[ERC20 token]: https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#IERC20
[issue #20]: https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
[ERC20 in TLA+]: https://github.com/informalsystems/tla-apalache-workshop/tree/main/examples/erc20
