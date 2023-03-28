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
| [icse23-fig7][]  |:white_check_mark:|:white_check_mark:|:white_check_mark:| :x:         |
| [ERC20][]        |:white_check_mark:|:white_check_mark:|:white_check_mark:| :x:         |
|                    **Cosmos**                                                           |
| [ICS23][]        |:white_check_mark:|:white_check_mark:|:x:               | :x:         |
| [Tendermint][]   |:white_check_mark:|:white_check_mark:|:white_check_mark:| :x:         |
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
[Coin]: ./examples/solidity/Coin
[counters]: ./language-features/counters.qnt
[SimpleAuction]: ./solidity/SimpleAuction/SimpleAuctionNonComposable.qnt
[ERC20]: ./solidity/ERC20/erc20.qnt
[ICS23]: ./cosmos/ics23/ics23.qnt
[Tendermint]: ./cosmos/tendermint/TendermintAcc_004.qnt
[ClockSync]: ./classic/distributed/ClockSync/clockSync3.qnt
[LamportMutex]: ./classic/distributed/LamportMutex/LamportMutex.qnt
[Paxos]: ./classic/distributed/Paxos/Paxos.qnt
[ReadersWriters]: ./classic/distributed/ReadersWriters/ReadersWriters.qnt
[EWD840]: ./classic/distributed/ewd840/ewd840.qnt
[BinSearch]: ./classic/sequential/BinSearch/BinSearch.qnt
[Prisoners]: ./puzzles/prisoners/prisoners.qnt
[tictactoe]: ./puzzles/tictactoe/tictactoe.qnt
[booleans]: ./language-features/booleans.qnt
[icse23-fig7]: ./solidity/icse23-fig7/lottery.qnt