# Specifying the ERC20 interface in Quint

## The new specification

This directory contains a Quint specification [erc20.qnt][]
of an [ERC20 token][]. It contains two modules:

 - `erc20` is an exemplary specification of IERC20. It is designed to be
   reusable in other specifications. This module is pure: It does not define
   a state machine.

 - `mempool` is a Quint specification of a single ERC20 token executed in the
   mempool. This specification defines a state machine. It demonstrates how
   to specify and detect mempool-related out-of-order issues such as [this one][].

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

## The older specification

The older version of an ERC20 spec can be found in [./erc20-from-apalache.qnt][].
We keep it for a comparison with the TLA+ files, which can be found in [./tla](./tla/).

[erc20.qnt]: ./erc20.qnt
[ERC20 token]: https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#IERC20
[this one]: https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
[./erc20-from-apalache.qnt]: ./tla/erc20-from-apalache.qnt