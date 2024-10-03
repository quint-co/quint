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

<!-- !test check EWD840 - Types & Effects -->
    quint typecheck ../examples/classic/distributed/ewd840/ewd840.qnt

### OK on parse Tendermint

<!-- !test check Tendermint -->
    quint parse ../examples/cosmos/tendermint/Tendermint.qnt

### OK on typecheck Tendermint

<!-- !test check Tendermint - Types & Effects -->
    quint typecheck ../examples/cosmos/tendermint/Tendermint.qnt

### OK on test Tendermint

<!-- !test check Tendermint - Test -->
    quint test --max-samples=100 --main TendermintModels ../examples/cosmos/tendermint/TendermintModels.qnt

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

### OK on run instances

<!-- !test check instances - Run -->
    quint run ../examples/language-features/instances.qnt --invariant=inv

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

### OK on test SimpleAuction.qnt

<!-- !test check SimpleAuction - Syntax/Types & Effects/Unit tests -->
    quint test ../examples/solidity/SimpleAuction/SimpleAuction.qnt

### OK on test lottery.qnt

<!-- TODO: Spec test is erroneous https://github.com/informalsystems/quint/issues/775 -->
<!-- check lottery - Syntax/Types & Effects/Unit tests -->
<!--     quint test --main=lotteryTests ../examples/solidity/icse23-fig7/lottery.qnt -->

### OK on test erc20.qnt::mempool

<!-- !test check erc20::mempool - Syntax/Types & Effects/Unit tests -->
    quint test --main=mempool ../examples/solidity/ERC20/erc20.qnt

### OK on test erc20.qnt::erc20Tests

<!-- !test check erc20::erc20Tests - Syntax/Types & Effects/Unit tests -->
    quint test --main=erc20Tests ../examples/solidity/ERC20/erc20.qnt

### OK on test ics20 bank

<!-- !test check ics20 bank - Syntax/Types & Effects/Unit tests -->
    quint test --main bankTests ../examples/cosmos/ics20/bank.qnt

### OK on test ics20 denomTrace
<!-- !test check ics20 denomTrace - Syntax/Types & Effects/Unit tests -->
    quint test --main=properChannelsTests ../examples/cosmos/ics20/denomTrace.qnt

### OK on test ics20
<!-- !test check ics20 - Syntax/Types & Effects/Unit tests -->
    quint test --main ics20Test ../examples/cosmos/ics20/ics20.qnt

### OK on test importFrom

<!-- !test check importFrom - Syntax/Types & Effects/Unit tests -->
    quint test ../examples/language-features/importFrom.qnt

### OK on run prisoners

<!-- !test check prisoners - Syntax/Types & Effects/Invariants -->
    quint run --main=prisoners3 --invariant='countInv and safetyInv' \
    ../examples/puzzles/prisoners/prisoners.qnt

### OK on typecheck SuperSpec.qnt

<!-- !test check SuperSpec - Types & Effects-->
    quint typecheck testFixture/SuperSpec.qnt

### OK REPL tutorial

The REPL tutorial is reproducible in REPL.

<!-- !test check REPL tutorial -->
```
if [ "$UNAME" == "Linux" -o "$UNAME" == "Darwin" ]; then
  quint -q -r ../tutorials/repl/kettle.qnt::kettle <../tutorials/repl/replTestIn.txt \
    | diff - ../tutorials/repl/replTestOut.txt
fi
# else diff does not work as expected on windows
```

### OK on test basicSpells

<!-- !test check basicSpells - Syntax/Types & Effects/Unit tests -->
    quint test ../examples/spells/basicSpells.qnt

### OK on test commonSpells

<!-- !test check commonSpells - Syntax/Types & Effects/Unit tests -->
    quint test ../examples/spells/commonSpells.qnt

### OK on test rareSpells

<!-- !test check rareSpells - Syntax/Types & Effects/Unit tests -->
    quint test ../examples/spells/rareSpells.qnt

### OK on test BoundedUint8

<!-- !test check BoundedUint8 - Syntax/Types & Effects/Unit tests -->
    quint test --main=BoundedUInt8Test ../examples/spells/BoundedUInt.qnt

### OK on test bug843pureValCache

<!-- !test check bug843pureValCache - Syntax/Types & Effects/Unit tests -->
    quint test ./testFixture/bug843pureValCache.qnt

### FAIL on run lottery

<!-- !test exit 1 -->
<!-- !test check lottery - Run -->
    quint run --max-samples=10000 --max-steps=10 --seed=0x29f8e808de5ed \
      --invariant=noBuyInDrawingInv --main=lotteryMempool \
      ../examples/solidity/icse23-fig7/lottery.qnt

### OK on run BinSearch

<!-- !test exit 0 -->
<!-- !test check BinSearch - Run -->
    quint run --max-samples=10000 --max-steps=10 \
      --invariant=Postcondition --main=BinSearch10 \
      ../examples/classic/sequential/BinSearch/BinSearch.qnt

### OK on test simplePonzi

<!-- !test exit 0 -->
<!-- !test check simplePonzi - Test -->
    quint test \
      --main=simplePonziTest \
      ../examples/solidity/SimplePonzi/simplePonzi.qnt

### OK on run simplePonzi::noNegativeInv

<!-- !test exit 0 -->
<!-- !test check simplePonzi - Run noNegativeInv -->
    quint run --max-samples=10000 \
      --invariant=noNegativeInv --main=simplePonziTest \
      ../examples/solidity/SimplePonzi/simplePonzi.qnt

### FAIL on run simplePonzi::progressInv

<!-- !test exit 1 -->
<!-- !test check simplePonzi - Run progressInv -->
    quint run \
      --invariant=progressInv --main=simplePonziTest \
      --seed=0x1f035d45bcece7 \
      ../examples/solidity/SimplePonzi/simplePonzi.qnt

### OK on run gradualPonzi::noNegativeInv

<!-- !test exit 0 -->
<!-- !test check gradualPonzi - Run noNegativeInv -->
    quint run --max-samples=1000 \
      --invariant=noNegativeInv --main=gradualPonziTest \
      ../examples/solidity/GradualPonzi/gradualPonzi.qnt

### FAIL on run gradualPonzi::progressInv

<!-- !test exit 1 -->
<!-- !test check gradualPonzi - Run progressInv -->
    quint run --invariant=progressInv --main=gradualPonziTest \
      --max-samples=1000 --max-steps=50 \
      --seed=0xa7bf730b93981 \
      ../examples/solidity/GradualPonzi/gradualPonzi.qnt

### FAIL on run gradualPonzi::noLeftoversInv

<!-- !test exit 1 -->
<!-- !test check gradualPonzi - Run noLeftoversInv -->
    quint run --invariant=noLeftoversInv --main=gradualPonziTest \
      --seed=0x405df8f62fcd7 \
      ../examples/solidity/GradualPonzi/gradualPonzi.qnt

### OK on test gradualPonzi

<!-- !test exit 0 -->
<!-- !test check gradualPonzi - Test -->
    quint test \
      --main=gradualPonziTest \
      ../examples/solidity/GradualPonzi/gradualPonzi.qnt

### FAIL on run river::noSolution

<!-- !test exit 1 -->
<!-- !test check river - Run noSolution -->
    quint run --invariant=noSolution --seed=0x2fa6b93d1eef3 \
      ../examples/puzzles/river/river.qnt

### OK on run river::safety

<!-- !test exit 0 -->
<!-- !test check river - Run safety -->
    quint run --invariant=safety ../examples/puzzles/river/river.qnt

### OK on run with the default module

See [#1195](https://github.com/informalsystems/quint/issues/1195).

<!-- !test exit 0 -->
<!-- !test check run the default module -->
    quint run ./testFixture/_1050diffName.qnt

### OK on test with the default module

See [#1195](https://github.com/informalsystems/quint/issues/1195).

<!-- !test exit 0 -->
<!-- !test check test the default module -->
    quint test ./testFixture/_1050diffName.qnt

### OK on parse 1108

Regression test for [#1108](https://github.com/informalsystems/quint/issues/1108).

<!-- !test check 1108 -->
    quint parse testFixture/_1052one.qnt

### OK on typecheck SuperSpec via Unix hashbang

See [#1500](https://github.com/informalsystems/quint/issues/1500).

<!-- !test exit 0 -->
<!-- !test check typecheck SuperSpec via Unix hashbang -->
```
if [ `uname -s` == 'Linux' -o `uname -s` == 'Darwin' ]; then
    ./testFixture/SuperSpec.qnt
fi
```