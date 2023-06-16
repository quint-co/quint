<!-- DO NOT EDIT: THIS FILE IS GENERATED FROM examples/README-text.md VIA 'make examples' -->
This directory contains examples of protocol specifications written in Quint.

Note that some examples were written long time ago. All of our examples pass
the parser and the type checker, but some of them are not runnable and testable
yet. To set your expectations right, check the dashboard below first.

# Categories

 - [solidity](./solidity). The most recent examples of Solidity smart contracts
   modeled in Quint. This is probably the easiest entry point, as we have been
   collecting relatively simple contracts so far.

 - [cosmos](./cosmos). The examples from the [Cosmos ecosystem][], which we are
   most excited about. They may be a bit harder to understand though, as we
   have not polished them yet.

 - [classic](./classic). These are examples of sequential and distributed
   algorithms, which stem from the [TLA+ examples][]. These are probably the
   oldest examples in the repository, so they may use outdated features.

 - [puzzles](./puzzles). These are logical puzzles. Some people find them nice
   for learning new languages. If you are one of these people, check the
   puzzles.

 - [spells](./spells). These are nice small definitions that make specification
   writing easier. We collect them here. One day some of them will become the
   standard library. If you think you have invented a nice spell that would
   help others, [contribute your spell](./spells/contribute-your-spell.md).
 
 - [language-features](./language-features). These are examples that
   demonstrate some language features in isolation. They are mostly used for
   testing the tool.

# Dashboard

This dashboard shows, how far we have checked the examples in the
Quint-Apalache pipeline.

| Example          | Syntax           | Types            | Unit tests       | Apalache    |
| ---------------- |:----------------:|:----------------:|:----------------:|:-----------:|
| [classic/distributed/ClockSync/clockSync3.qnt](./classic/distributed/ClockSync/clockSync3.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [classic/distributed/ewd840/ewd840.qnt](./classic/distributed/ewd840/ewd840.qnt) | :white_check_mark: | :x: | :x: | :x: |
| [classic/distributed/LamportMutex/LamportMutex.qnt](./classic/distributed/LamportMutex/LamportMutex.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [classic/distributed/Paxos/Paxos.qnt](./classic/distributed/Paxos/Paxos.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [classic/distributed/Paxos/Voting.qnt](./classic/distributed/Paxos/Voting.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [classic/distributed/ReadersWriters/ReadersWriters.qnt](./classic/distributed/ReadersWriters/ReadersWriters.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [classic/sequential/BinSearch/BinSearch.qnt](./classic/sequential/BinSearch/BinSearch.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [classic/sequential/BinSearch/BinSearch10.qnt](./classic/sequential/BinSearch/BinSearch10.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [cosmos/ics20/bank.qnt](./cosmos/ics20/bank.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [cosmos/ics20/base.qnt](./cosmos/ics20/base.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [cosmos/ics20/denomTrace.qnt](./cosmos/ics20/denomTrace.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [cosmos/ics20/ics20.qnt](./cosmos/ics20/ics20.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [cosmos/ics23/ics23.qnt](./cosmos/ics23/ics23.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [cosmos/lightclient/Blockchain.qnt](./cosmos/lightclient/Blockchain.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [cosmos/lightclient/typedefs.qnt](./cosmos/lightclient/typedefs.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [cosmos/tendermint/TendermintAcc005.qnt](./cosmos/tendermint/TendermintAcc005.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [language-features/booleans.qnt](./language-features/booleans.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [language-features/counters.qnt](./language-features/counters.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [language-features/importFrom.qnt](./language-features/importFrom.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [language-features/imports.qnt](./language-features/imports.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [language-features/instances.qnt](./language-features/instances.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [language-features/instancesFrom.qnt](./language-features/instancesFrom.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [language-features/integers.qnt](./language-features/integers.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [language-features/lists.qnt](./language-features/lists.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [language-features/maps.qnt](./language-features/maps.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [language-features/nondet.qnt](./language-features/nondet.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [language-features/option.qnt](./language-features/option.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [language-features/records.qnt](./language-features/records.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [language-features/sets.qnt](./language-features/sets.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [language-features/tuples.qnt](./language-features/tuples.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [puzzles/prisoners/prisoners.qnt](./puzzles/prisoners/prisoners.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [puzzles/tictactoe/tictactoe.qnt](./puzzles/tictactoe/tictactoe.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [solidity/Coin/coin.qnt](./solidity/Coin/coin.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [solidity/ERC20/erc20.qnt](./solidity/ERC20/erc20.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [solidity/GradualPonzi/gradualPonzi.qnt](./solidity/GradualPonzi/gradualPonzi.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [solidity/icse23-fig7/lottery.qnt](./solidity/icse23-fig7/lottery.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [solidity/SimpleAuction/SimpleAuctionNonComposable.qnt](./solidity/SimpleAuction/SimpleAuctionNonComposable.qnt) | :white_check_mark: | :white_check_mark: | :x: | :x: |
| [solidity/SimplePonzi/simplePonzi.qnt](./solidity/SimplePonzi/simplePonzi.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [spells/basicSpells.qnt](./spells/basicSpells.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [spells/commonSpells.qnt](./spells/commonSpells.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [spells/rareSpells.qnt](./spells/rareSpells.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: |
| [verification/defaultOpNames.qnt](./verification/defaultOpNames.qnt) | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
