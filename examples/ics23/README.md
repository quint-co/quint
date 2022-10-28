This is a formal specification and invariants of [ICS23 Spec][] in TNT and TLA+:

## TNT specification

 Specification [ics23.tnt](./ics23.tnt) is the TNT specification that contains
 four modules:
  
  - Module `basics` contains basic type definitions and auxiliary definitions.

  - Module `ics23` contains membership and non-membership proofs.

  - Module `ics23pbt` contains definitions for randomized tests similar to PBT.

  - Module `trees` contains advanced randomized tests that use tree generation.

**Unit tests.** You can use TNT REPL to run basic unit tests as follows:

```sh
$ tntc repl
>>> .load ics23.tnt
>>> import ics23test.*
>>> allTests
```

**Randomized generation of examples.** You can run randomized tests to produce
examples of successful membership and non-membership verification as follows:

```sh
$ tntc repl
>>> .load ics23.tnt
>>> import ics23pbt.*
>>> _test(1000, 10, "Init", "Next", "TestVerify")
>>> _test(1000, 10, "Init", "Next", "TestNonMem")
```

**Randomized invariant checking.** Finally, you can check membership and
non-membership invariants with the random simulator:

```sh
$ tntc repl
>>> .load ics23.tnt
>>> import trees.*
>>> _test(1000, 1, "Init", "Next", "NonMemInv")
>>> _test(1000, 1, "Init", "Next", "MemInv")
```

## TLA+ specification

Specifications [ics23.tla](./ics23.tla) and [ics23trees.tla](./ics23trees.tla)
is the manual translation from TNT to TLA+. The main value of this
specification is the ability to check the invariants with Apalache:

```sh
$ apalache-mc check --inv=MemInv ics23trees.tla
$ apalache-mc check --inv=NonMemInv ics23trees.tla
```


[ICS23 Spec]: https://github.com/cosmos/ibc/tree/main/spec/core/ics-023-vector-commitments
[ICS23]: https://github.com/confio/ics23/
