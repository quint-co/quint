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
    quint parse ../examples/Paxos/Paxos.qnt

### OK on typecheck Paxos

<!-- !test check Paxos - Types & Effects -->
    quint typecheck ../examples/Paxos/Paxos.qnt

### OK on parse Voting

<!-- !test check Voting -->
    quint parse ../examples/Paxos/Voting.qnt

### OK on typecheck Voting

<!-- !test check Voting - Types & Effects -->
    quint typecheck ../examples/Paxos/Voting.qnt

### OK on parse ReadersWriters

<!-- !test check ReadersWriters -->
    quint parse ../examples/ReadersWriters/ReadersWriters.qnt

### OK on typecheck ReadersWriters

<!-- !test check ReadersWriters - Types & Effects -->
    quint typecheck ../examples/ReadersWriters/ReadersWriters.qnt

### OK on parse EWD840

<!-- !test check EWD840 -->
    quint parse ../examples/ewd840/ewd840.qnt

### OK on typecheck EWD840

<!-- !test check EWD840 - Types & Effects -->
    quint typecheck ../examples/Paxos/Voting.qnt

### OK on parse Tendermint

<!-- !test check Tendermint -->
    quint parse ../examples/tendermint/TendermintAcc_004.qnt

### OK on typecheck Tendermint

<!-- !test check Tendermint - Types & Effects -->
    quint typecheck ../examples/tendermint/TendermintAcc_004.qnt

### OK on parse imports

<!-- !test check imports -->
    quint parse ../examples/imports.qnt

### OK on typecheck imports

<!-- !test check imports - Types & Effects -->
    quint typecheck ../examples/imports.qnt

### OK on parse instances

<!-- !test check instances -->
    quint parse ../examples/instances.qnt

### OK on typecheck instances

<!-- !test check instances - Types & Effects -->
    quint typecheck ../examples/instances.qnt

### OK on parse option

<!-- !test check option -->
    quint parse ../examples/option.qnt

### OK on typecheck option

<!-- !test check option - Types & Effects -->
    quint typecheck ../examples/option.qnt

### OK on parse BinSearch

<!-- !test check BinSearch -->
    quint parse ../examples/BinSearch/BinSearch.qnt

### OK on typecheck BinSearch

<!-- !test check BinSearch - Types & Effects -->
    quint typecheck ../examples/BinSearch/BinSearch.qnt

### OK on parse TicTacToe

<!-- !test check TicTacToe -->
    quint parse ../examples/tictactoe/tictactoe.qnt

### OK on typecheck TicTacToe

<!-- !test check TicTacToe - Types & Effects -->
    quint typecheck ../examples/tictactoe/tictactoe.qnt

### OK on parse ics23

<!-- !test check ics23 -->
    quint parse ../examples/ics23/ics23.qnt

### OK on typecheck ics23

<!-- !test check ics23 - Types & Effects -->
    quint typecheck ../examples/ics23/ics23.qnt

### OK on parse ERC20

<!-- !test check ERC20 -->
    quint parse ../examples/ERC20/erc20.qnt

### OK on typecheck ERC20

<!-- !test check ERC20 - Types & Effects -->
    quint typecheck ../examples/ERC20/erc20.qnt

### OK on parse Lamport Mutex

<!-- !test check LamportMutex -->
    quint parse ../examples/LamportMutex/LamportMutex.qnt

### OK on typecheck Lamport Mutex

<!-- !test check LamportMutex - Types & Effects -->
    quint typecheck ../examples/LamportMutex/LamportMutex.qnt

### OK on parse counters

<!-- !test check counters -->
    quint parse ../examples/counters.qnt

### OK on parse records

<!-- !test check records -->
    quint parse ../examples/records.qnt

### OK on typecheck records

<!-- !test check records - Types & Effects-->
    quint typecheck ../examples/records.qnt

### OK on parse tuples

<!-- !test check tuples -->
    quint parse ../examples/tuples.qnt

### OK on typecheck tuples

<!-- !test check tuples - Types & Effects-->
    quint typecheck ../examples/tuples.qnt

### OK on typecheck clockSync3

<!-- !test check typecheck clockSync3.qnt -->
    quint typecheck ../examples/ClockSync/clockSync3.qnt

### OK on typecheck counters

<!-- !test check counters - Types & Effects-->
    quint typecheck ../examples/counters.qnt

### OK on typecheck SimpleAuctionNonComposable.qnt

<!-- !test check SimpleAuctionNonComposable - Types & Effects-->
    quint typecheck ../examples/solidity/SimpleAuction/SimpleAuctionNonComposable.qnt

