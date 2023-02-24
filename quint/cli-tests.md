This is a script for running examples with `quint`.

This script requires [`txm`](https://www.npmjs.com/package/txm) to be
installed:

```sh
npm install -g txm
```

*NOTE*: these tests only check that particular invocations succeed or fail. For
tests that examine particular output, use
[./io-cli-tests.md](./io-cli-tests.md).

All tests in the following cases are run as commands to `bash`.

<!-- !test program
bash -
-->

### OK on repl input

<!-- !test check repl 1 + 1 -->
    echo "1 + 1" | quint

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
See [#581](https://github.com/informalsystems/quint/issues/581).

Temporarily disabled.

<!-- test check EWD840 - Types & Effects -->
    quint typecheck ../examples/classic/distributed/ewd840/ewd840.qnt

### OK on parse Tendermint

<!-- !test check Tendermint -->
    quint parse ../examples/cosmos/tendermint/TendermintAcc_004.qnt

### OK on typecheck Tendermint

<!-- !test check Tendermint - Types & Effects -->
    quint typecheck ../examples/cosmos/tendermint/TendermintAcc_004.qnt

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

### OK on parse option

<!-- !test check option -->
    quint parse ../examples/language-features/option.qnt

### OK on typecheck option

<!-- !test check option - Types & Effects -->
    quint typecheck ../examples/language-features/option.qnt

### OK on parse BinSearch

<!-- !test check BinSearch -->
    quint parse ../examples/classic/sequential/BinSearch/BinSearch.qnt

### OK on typecheck BinSearch

<!-- !test check BinSearch - Types & Effects -->
    quint typecheck ../examples/classic/sequential/BinSearch/BinSearch.qnt

### OK on parse TicTacToe

<!-- !test check TicTacToe -->
    quint parse ../examples/puzzles/tictactoe/tictactoe.qnt

### OK on typecheck TicTacToe

<!-- !test check TicTacToe - Types & Effects -->
    quint typecheck ../examples/puzzles/tictactoe/tictactoe.qnt

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

### OK on parse counters

<!-- !test check counters -->
    quint parse ../examples/language-features/counters.qnt

### OK on parse records

<!-- !test check records -->
    quint parse ../examples/language-features/records.qnt

### OK on typecheck records

<!-- !test check records - Types & Effects-->
    quint typecheck ../examples/language-features/records.qnt

### OK on parse tuples

<!-- !test check tuples -->
    quint parse ../examples/language-features/tuples.qnt

### OK on typecheck tuples

<!-- !test check tuples - Types & Effects-->
    quint typecheck ../examples/language-features/tuples.qnt

### OK on typecheck clockSync3

<!-- !test check typecheck clockSync3.qnt -->
    quint typecheck ../examples/classic/distributed/ClockSync/clockSync3.qnt

### OK on typecheck counters

<!-- !test check counters - Types & Effects-->
    quint typecheck ../examples/language-features/counters.qnt

### OK on typecheck booleans

<!-- !test check booleans - Types & Effects-->
    quint typecheck ../examples/language-features/booleans.qnt

### OK on typecheck coin

<!-- !test check coin - Types & Effects-->
    quint typecheck ../examples/solidity/Coin/coin.qnt

### OK on typecheck SimpleAuctionNonComposable.qnt

<!-- !test check SimpleAuctionNonComposable - Types & Effects-->
    quint typecheck ../examples/solidity/SimpleAuction/SimpleAuctionNonComposable.qnt

### OK on typecheck SuperSpec.qnt

<!-- !test check SuperSpec - Types & Effects-->
    quint typecheck testFixture/SuperSpec.qnt
