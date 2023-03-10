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
 
 - [language-features](./language-features). These are examples that
   demonstrate some language features in isolation. They are mostly used for
   testing the tool.

# Dashboard

This dashboard shows, how far we have checked the examples in the
Quint-Apalache pipeline.

| Example          | Syntax           | Types            | Unit tests       | Apalache    |
| ---------------- |:----------------:|:----------------:|:----------------:|:-----------:|
|                    **Solidity**                                                         |
| [Coin][]         |:white_check_mark:|:white_check_mark:|:white_check_mark:| :x:         |
| [SimpleAuction][]|:white_check_mark:|:white_check_mark:|:white_check_mark:| :x:         |
| [ERC20][]        |:white_check_mark:|:white_check_mark:|:x:               | :x:         |
|                    **Cosmos**                                                           |
| [ICS23][]        |:white_check_mark:|:white_check_mark:|:x:               | :x:         |
| [Tendermint][]   |:white_check_mark:|:white_check_mark:|:x:               | :x:         |
|                    **Classic**                                                          |
| [ClockSync][]    |:white_check_mark:|:white_check_mark:|:x:               | :x:         |
| [LamportMutex][] |:white_check_mark:|:white_check_mark:|:x:               | :x:         |
| [Paxos][]        |:white_check_mark:|:white_check_mark:|:x:               | :x:         |
| [ReadersWriters][]|:white_check_mark:|:white_check_mark:|:x:              | :x:         |
| [EWD840][]       |:white_check_mark:|:white_check_mark:|:x:               | :x:         |
| [BinSearch][]    |:white_check_mark:|:white_check_mark:|:x:               | :x:         |
|                    **Puzzles**                                                          |
| [Prisoners][]    |:white_check_mark:|:white_check_mark:|:x:               | :x:         |
| [tictactoe][]    |:white_check_mark:|:white_check_mark:|:x:               | :x:         |
|                    **Language features**                                                |
| [booleans][]     |:white_check_mark:|:white_check_mark:|:white_check_mark:|:white_check_mark:|
| [counters][]     |:white_check_mark:|:white_check_mark:|:white_check_mark:| :x:         |
| TBD                                                                                     |


[Cosmos ecosystem]: https://cosmos.network
[TLA+ examples]: https://github.com/tlaplus/Examples/
[Coin]: https://github.com/informalsystems/quint/tree/main/examples/solidity/Coin
[counters]: https://github.com/informalsystems/quint/blob/main/examples/language-features/counters.qnt
[SimpleAuction]: https://github.com/informalsystems/quint/blob/main/examples/solidity/SimpleAuction/SimpleAuctionNonComposable.qnt
[ERC20]: https://github.com/informalsystems/quint/blob/main/examples/solidity/ERC20/erc20.qnt
[ICS23]: https://github.com/informalsystems/quint/blob/main/examples/cosmos/ics23/ics23.qnt
[Tendermint]: https://github.com/informalsystems/quint/blob/main/examples/cosmos/tendermint/TendermintAcc_004.qnt
[ClockSync]: https://github.com/informalsystems/quint/blob/main/examples/classic/distributed/ClockSync/clockSync3.qnt
[LamportMutex]: https://github.com/informalsystems/quint/blob/main/examples/classic/distributed/LamportMutex/LamportMutex.qnt
[Paxos]: https://github.com/informalsystems/quint/blob/main/examples/classic/distributed/Paxos/Paxos.qnt
[ReadersWriters]: https://github.com/informalsystems/quint/blob/main/examples/classic/distributed/ReadersWriters/ReadersWriters.qnt
[EWD840]: https://github.com/informalsystems/quint/blob/main/examples/classic/distributed/ewd840/ewd840.qnt
[BinSearch]: https://github.com/informalsystems/quint/blob/main/examples/classic/sequential/BinSearch/BinSearch.qnt
[Prisoners]: https://github.com/informalsystems/quint/blob/main/examples/puzzles/prisoners/prisoners.qnt
[tictactoe]: https://github.com/informalsystems/quint/blob/main/examples/puzzles/tictactoe/tictactoe.qnt
[booleans]: https://github.com/informalsystems/quint/blob/main/examples/language-features/booleans.qnt
