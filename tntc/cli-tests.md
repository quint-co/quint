This is a script for running examples with `tntc`.

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

### OK on parse Paxos

<!-- !test check Paxos -->
    tntc parse ../examples/Paxos/Paxos.tnt

### OK on parse Voting

<!-- !test check Voting -->
    tntc parse ../examples/Paxos/Voting.tnt

### OK on parse ReadersWriters

<!-- !test check ReadersWriters -->
    tntc parse ../examples/ReadersWriters/ReadersWriters.tnt
    
### OK on typecheck ReadersWriters

<!-- !test check ReadersWriters - Types & Effects -->
    tntc typecheck ../examples/ReadersWriters/ReadersWriters.tnt
    
### OK on parse ewd840

<!-- !test check ewd840 -->
    tntc parse ../examples/ewd840/ewd840.tnt


### OK on parse Tendermint

<!-- !test check Tendermint -->
    tntc parse ../examples/tendermint/TendermintAcc_004.tnt

### OK on parse imports

<!-- !test check imports -->
    tntc parse ../examples/imports.tnt

### OK on typecheck imports

<!-- !test check imports - Types & Effects -->
    tntc typecheck ../examples/imports.tnt

### OK on parse instances

<!-- !test check instances -->
    tntc parse ../examples/instances.tnt

### OK on typecheck instances

<!-- !test check instances - Types & Effects -->
    tntc typecheck ../examples/instances.tnt


### OK on parse option

<!-- !test check option -->
    tntc parse ../examples/option.tnt

### OK on parse BinSearch

<!-- !test check BinSearch -->
    tntc parse ../examples/BinSearch/BinSearch.tnt

### OK on typecheck BinSearch

<!-- !test check BinSearch - Types & Effects -->
    tntc typecheck ../examples/BinSearch/BinSearch.tnt
    
### OK on parse TicTacToe

<!-- !test check TicTacToe -->
    tntc parse ../examples/tictactoe/tictactoe.tnt
 
### OK on typecheck TicTacToe

<!-- !test check TicTacToe - Types & Effects -->
    tntc typecheck ../examples/tictactoe/tictactoe.tnt

### OK on parse ics23

<!-- !test check ics23 -->
    tntc parse ../examples/ics23/ics23.tnt
 
### OK on typecheck ics23

<!-- !test check ics23 - Types & Effects -->
    tntc typecheck ../examples/ics23/ics23.tnt

### OK on parse ERC20

<!-- !test check ERC20 -->
    tntc parse ../examples/ERC20/erc20.tnt


### OK on parse Lamport Mutex

<!-- !test check LamportMutex -->
    tntc parse ../examples/LamportMutex/LamportMutex.tnt

### OK on parse records

<!-- !test check records -->
    tntc parse ../examples/records.tnt
 
### OK on typecheck records

<!-- !test check records - Types & Effects-->
    tntc typecheck ../examples/records.tnt

### OK on parse tuples

<!-- !test check tuples -->
    tntc parse ../examples/tuples.tnt
 
### OK on typecheck tuples

<!-- !test check tuples - Types & Effects-->
    tntc typecheck ../examples/tuples.tnt
