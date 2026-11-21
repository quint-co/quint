This is a formal specification and invariants of [ICS23 Spec][] in Quint and TLA+:

## Quint specification

 Specification [ics23.qnt](./ics23.qnt) is the Quint specification that contains
 four modules:

  - Module `basics` contains basic type definitions and auxiliary definitions.

  - Module `ics23` contains membership and non-membership proofs.

  - Module `ics23pbt` contains definitions for randomized tests similar to PBT.

  - Module `trees` contains advanced randomized tests that use tree generation.

**Unit tests.** You can use Quint REPL to run basic unit tests as follows:

```sh
$ quint repl -r ics23.qnt::ics23test
>>> allTests
```

**Randomized generation of examples.** You can run randomized tests to produce
examples of successful membership and non-membership verification as follows:

```sh
$ quint run ics23.qnt --main=ics23pbt --init=Init --step=Next --max-steps=10 --observation=MembershipVerified
$ quint run ics23.qnt --main=ics23pbt --init=Init --step=Next --max-steps=10 --observation=NonMembershipVerified
```

**Randomized invariant checking.** Finally, you can check membership and
non-membership invariants with the random simulator:

```sh
$ quint run ics23.qnt --main=trees --init=Init --step=Next --max-steps=1 --max-samples=1000
```

## TLA+ specification

Specifications [ics23.tla](./ics23.tla) and [ics23trees.tla](./ics23trees.tla)
is the manual translation from Quint to TLA+. The main value of this
specification is the ability to check the invariants with Apalache:

```sh
$ apalache-mc check --inv=MemInv ics23trees.tla
$ apalache-mc check --inv=NonMemInv ics23trees.tla
```


[ICS23 Spec]: https://github.com/cosmos/ibc/tree/main/spec/core/ics-023-vector-commitments
[ICS23]: https://github.com/confio/ics23/
