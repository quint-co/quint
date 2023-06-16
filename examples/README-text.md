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
