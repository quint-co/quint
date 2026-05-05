# Language integration tests (CLI)

Tests for parsing, typechecking, and compiling Quint specifications.
These tests only check that particular invocations succeed or fail (no output
comparison), so they are compatible with all platforms including Windows.

This script requires [`txm`](https://www.npmjs.com/package/txm):

```sh
npm install -g txm
```

<!-- !test program
bash -
-->

### OK on parse Paxos

<!-- !test check Paxos -->
    quint parse ../examples/classic/distributed/Paxos/Paxos.qnt

### OK on typecheck Paxos

<!-- !test check Paxos - Types & Effects -->
    quint typecheck ../examples/classic/distributed/Paxos/Paxos.qnt

### OK on parse Voting

<!-- !test check Voting -->
    quint parse ../examples/classic/distributed/Paxos/Voting.qnt

### OK on typecheck Voting

<!-- !test check Voting - Types & Effects -->
    quint typecheck ../examples/classic/distributed/Paxos/Voting.qnt

### OK on parse ReadersWriters

<!-- !test check ReadersWriters -->
    quint parse ../examples/classic/distributed/ReadersWriters/ReadersWriters.qnt

### OK on typecheck ReadersWriters

<!-- !test check ReadersWriters - Types & Effects -->
    quint typecheck ../examples/classic/distributed/ReadersWriters/ReadersWriters.qnt

### OK on parse EWD840

<!-- !test check EWD840 -->
    quint parse ../examples/classic/distributed/ewd840/ewd840.qnt

### OK on typecheck EWD840

This example was pointing to Paxos. Now it does not typecheck.

<!-- !test check EWD840 - Types & Effects -->
    quint typecheck ../examples/classic/distributed/ewd840/ewd840.qnt

### OK on parse Tendermint

<!-- !test check Tendermint -->
    quint parse ../examples/cosmos/tendermint/Tendermint.qnt

### OK on typecheck Tendermint

<!-- !test check Tendermint - Types & Effects -->
    quint typecheck ../examples/cosmos/tendermint/Tendermint.qnt

### OK on parse imports

<!-- !test check imports -->
    quint parse ../examples/language-features/imports.qnt

### OK on typecheck imports

<!-- !test check imports - Types & Effects -->
    quint typecheck ../examples/language-features/imports.qnt

### OK on parse instances

<!-- !test check instances -->
    quint parse ../examples/language-features/instances.qnt

### OK on typecheck instances

<!-- !test check instances - Types & Effects -->
    quint typecheck ../examples/language-features/instances.qnt

### OK on parse instancesFrom

<!-- !test check instancesFrom -->
    quint parse ../examples/language-features/instancesFrom.qnt

### OK on typecheck instancesFrom

<!-- !test check instancesFrom - Types & Effects -->
    quint typecheck ../examples/language-features/instancesFrom.qnt

### OK on parse option

<!-- !test check option -->
    quint parse ../examples/language-features/option.qnt

### OK on parse BinSearch

<!-- !test check BinSearch -->
    quint parse ../examples/classic/sequential/BinSearch/BinSearch.qnt

### OK on typecheck BinSearch

<!-- !test check BinSearch - Types & Effects -->
    quint typecheck ../examples/classic/sequential/BinSearch/BinSearch.qnt

### OK on parse TicTacToe

<!-- !test check TicTacToe -->
    quint parse ../examples/games/tictactoe/tictactoe.qnt

### OK on typecheck TicTacToe

<!-- !test check TicTacToe - Types & Effects -->
    quint typecheck ../examples/games/tictactoe/tictactoe.qnt

### OK on parse ics20 bank

<!-- !test check ics20 bank -->
    quint parse ../examples/cosmos/ics20/bank.qnt

### OK on typecheck ics20 bank

<!-- !test check ics20 bank - Types & Effects -->
    quint typecheck ../examples/cosmos/ics20/bank.qnt

### OK on parse ics23

<!-- !test check ics23 -->
    quint parse ../examples/cosmos/ics23/ics23.qnt

### OK on typecheck ics23

<!-- !test check ics23 - Types & Effects -->
    quint typecheck ../examples/cosmos/ics23/ics23.qnt

### OK on parse ERC20

<!-- !test check ERC20 -->
    quint parse ../examples/solidity/ERC20/erc20.qnt

### OK on typecheck ERC20

<!-- !test check ERC20 - Types & Effects -->
    quint typecheck ../examples/solidity/ERC20/erc20.qnt

### OK on parse Lamport Mutex

<!-- !test check LamportMutex -->
    quint parse ../examples/classic/distributed/LamportMutex/LamportMutex.qnt

### OK on typecheck Lamport Mutex

<!-- !test check LamportMutex - Types & Effects -->
    quint typecheck ../examples/classic/distributed/LamportMutex/LamportMutex.qnt

### OK on typecheck coin

<!-- !test check coin - Types & Effects-->
    quint typecheck ../examples/tutorials/coin.qnt

### OK on typecheck generate

<!-- !test check generate - Types & Effects -->
    quint typecheck ../examples/language-features/generate.qnt

### OK on typecheck SuperSpec.qnt

<!-- !test check SuperSpec - Types & Effects-->
    quint typecheck testFixture/SuperSpec.qnt

### OK on parse 1108

Regression test for [#1108](https://github.com/informalsystems/quint/issues/1108).

<!-- !test check 1108 -->
    quint parse testFixture/_1052one.qnt

