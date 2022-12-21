This is a script for running examples with `quintc`.

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
    echo "1 + 1" | quintc

### OK on parse Paxos

<!-- !test check Paxos -->
    quintc parse ../examples/Paxos/Paxos.qnt

### OK on parse Voting

<!-- !test check Voting -->
    quintc parse ../examples/Paxos/Voting.qnt

### OK on parse ReadersWriters

<!-- !test check ReadersWriters -->
    quintc parse ../examples/ReadersWriters/ReadersWriters.qnt

### OK on typecheck ReadersWriters

<!-- !test check ReadersWriters - Types & Effects -->
    quintc typecheck ../examples/ReadersWriters/ReadersWriters.qnt

### OK on parse ewd840

<!-- !test check ewd840 -->
    quintc parse ../examples/ewd840/ewd840.qnt


### OK on parse Tendermint

<!-- !test check Tendermint -->
    quintc parse ../examples/tendermint/TendermintAcc_004.qnt

### OK on parse imports

<!-- !test check imports -->
    quintc parse ../examples/imports.qnt

### OK on typecheck imports

<!-- !test check imports - Types & Effects -->
    quintc typecheck ../examples/imports.qnt

### OK on parse instances

<!-- !test check instances -->
    quintc parse ../examples/instances.qnt

### OK on typecheck instances

<!-- !test check instances - Types & Effects -->
    quintc typecheck ../examples/instances.qnt


### OK on parse option

<!-- !test check option -->
    quintc parse ../examples/option.qnt

### OK on parse BinSearch

<!-- !test check BinSearch -->
    quintc parse ../examples/BinSearch/BinSearch.qnt

### OK on typecheck BinSearch

<!-- !test check BinSearch - Types & Effects -->
    quintc typecheck ../examples/BinSearch/BinSearch.qnt

### OK on parse TicTacToe

<!-- !test check TicTacToe -->
    quintc parse ../examples/tictactoe/tictactoe.qnt

### OK on typecheck TicTacToe

<!-- !test check TicTacToe - Types & Effects -->
    quintc typecheck ../examples/tictactoe/tictactoe.qnt

### OK on parse ics23

<!-- !test check ics23 -->
    quintc parse ../examples/ics23/ics23.qnt

### OK on typecheck ics23

<!-- !test check ics23 - Types & Effects -->
    quintc typecheck ../examples/ics23/ics23.qnt

### OK on parse ERC20

<!-- !test check ERC20 -->
    quintc parse ../examples/ERC20/erc20.qnt


### OK on parse Lamport Mutex

<!-- !test check LamportMutex -->
    quintc parse ../examples/LamportMutex/LamportMutex.qnt

### OK on parse counters

<!-- !test check counters -->
    quintc parse ../examples/counters.qnt

### OK on parse records

<!-- !test check records -->
    quintc parse ../examples/records.qnt

### OK on typecheck records

<!-- !test check records - Types & Effects-->
    quintc typecheck ../examples/records.qnt

### OK on parse tuples

<!-- !test check tuples -->
    quintc parse ../examples/tuples.qnt

### OK on typecheck tuples

<!-- !test check tuples - Types & Effects-->
    quintc typecheck ../examples/tuples.qnt
