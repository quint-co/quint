This is a script for running examples with `tntc`.

This script requires [`txm`](https://www.npmjs.com/package/txm) to be
installed:

```sh
npm install -g txm
```

### OK on parse Paxos

This command parses the Paxos example.

<!-- !test program
tntc parse ../examples/Paxos/Paxos.tnt
-->

```sh
tntc parse ../examples/Paxos/Paxos.tnt
```

<!-- !test check Paxos -->
    expect exit code 0

### OK on parse Voting

This command parses the Voting example.

<!-- !test program
tntc parse ../examples/Paxos/Voting.tnt
-->

```sh
tntc parse ../examples/Paxos/Voting.tnt
```

<!-- !test check Voting -->
    expect exit code 0

### OK on parse ReadersWriters

This command parses the ReadersWriters example.

<!-- !test program
tntc parse ../examples/ReadersWriters/ReadersWriters.tnt
-->

```sh
tntc parse ../examples/ReadersWriters/ReadersWriters.tnt
```

<!-- !test check ReadersWriters -->
    expect exit code 0
    
### OK on typecheck ReadersWriters

This command typechecks the ReadersWriters example.

<!-- !test program
tntc typecheck ../examples/ReadersWriters/ReadersWriters.tnt
-->

```sh
tntc typecheck ../examples/ReadersWriters/ReadersWriters.tnt
```

<!-- !test check ReadersWriters - Types & Effects -->
    expect exit code 0
    

### OK on parse ewd840

This command parses the ewd840 example.

<!-- !test program
tntc parse ../examples/ewd840/ewd840.tnt
-->

```sh
tntc parse ../examples/ewd840/ewd840.tnt
```

<!-- !test check ewd840 -->
    expect exit code 0

### OK on parse Tendermint

This command parses the Tendermint example.

<!-- !test program
tntc parse ../examples/tendermint/TendermintAcc_004.tnt
-->

```sh
tntc parse ../examples/tendermint/TendermintAcc_004_draft.tnt
```

<!-- !test check Tendermint -->
    expect exit code 0

### OK on parse imports

This command parses the imports example.

<!-- !test program
tntc parse ../examples/imports.tnt
-->

```sh
tntc parse ../examples/imports.tnt
```

<!-- !test check imports -->
    expect exit code 0

### OK on parse instances

This command parses the instances example.

<!-- !test program
tntc parse ../examples/instances.tnt
-->

```sh
tntc parse ../examples/instances.tnt
```

<!-- !test check instances -->
    expect exit code 0

### OK on parse option

This command parses the option example.

<!-- !test program
tntc parse ../examples/option.tnt
-->

```sh
tntc parse ../examples/option.tnt
```

<!-- !test check option -->
    expect exit code 0

### OK on parse BinSearch

This command parses the BinSearch example.

<!-- !test program
tntc parse ../examples/BinSearch/BinSearch.tnt
-->

```sh
tntc parse ../examples/BinSearch/BinSearch.tnt
```

<!-- !test check BinSearch -->
    expect exit code 0

### OK on typecheck BinSearch

This command typechecks the BinSearch example.

<!-- !test program
tntc typecheck ../examples/BinSearch/BinSearch.tnt
-->

```sh
tntc typecheck ../examples/BinSearch/BinSearch.tnt
```

<!-- !test check BinSearch - Types & Effects -->
    expect exit code 0
    
### OK on parse TicTacToe

This command parses the TicTacToe example.

<!-- !test program
tntc parse ../examples/tictactoe/tictactoe.tnt
-->

```sh
tntc parse ../examples/tictactoe/tictactoe.tnt
```

<!-- !test check TicTacToe -->
    expect exit code 0
 
### OK on typecheck TicTacToe

This command typechecks the TicTacToe example.

<!-- !test program
tntc typecheck ../examples/tictactoe/tictactoe.tnt
-->

```sh
tntc typecheck ../examples/tictactoe/tictactoe.tnt
```

<!-- !test check TicTacToe - Types & Effects -->
    expect exit code 0

### OK on parse ics23

This command parses the ics23 example.

<!-- !test program
tntc parse ../examples/ics23/ics23.tnt
-->

```sh
tntc parse ../examples/ics23/ics23.tnt
```

<!-- !test check ics23 -->
    expect exit code 0
 
### OK on typecheck ics23

This command typechecks the ics23 example.

<!-- !test program
tntc typecheck ../examples/ics23/ics23.tnt
-->

```sh
tntc typecheck ../examples/ics23/ics23.tnt
```

<!-- !test check ics23 - Types & Effects -->
    expect exit code 0

### OK on parse ERC20

This command parses the ERC20 example.

<!-- !test program
tntc parse ../examples/ERC20/erc20.tnt
-->

```sh
tntc parse ../examples/ERC20/erc20.tnt
```

<!-- !test check ERC20 -->
    expect exit code 0
