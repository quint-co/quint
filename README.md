<div align="center">

<!-- Title -->
<img src="./logos/quint-logo.png" alt="Quint Lang Logo" width="120"/>
<h1>Quint Lang</h1>

<!-- Menu -->
<p>
    <a href="#installation">Installation</a> •
    <a href="#documentation">Documentation</a> •
    <a href="#community">Community</a>
</p>

<!-- Badges -->
<p>
    <a href="https://github.com/informalsystems/quint/actions">
        <img 
            src="https://github.com/informalsystems/quint/actions/workflows/main.yml/badge.svg"
            alt="build badge">
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=informal.quint-vscode">
        <img 
            src="https://img.shields.io/visual-studio-marketplace/v/informal.quint-vscode?color=10b0f2&label=VSCode" 
            alt="Visual Studio Marketplace Version">
    </a>
    <a href="https://www.npmjs.com/package/@informalsystems/quint">
        <img 
            src="https://img.shields.io/npm/v/@informalsystems/quint" 
            alt="npm (scoped)">
    </a>
</p>
</div>


## Overview

Quint is a modern specification language that is a particularly good fit for
distributed systems, such as blockchain protocols, distributed databases, and
p2p protocols. Quint combines the robust theoretical basis of the [Temporal
Logic of Actions (TLA)][TLA] with state-of-the-art static analysis and
development tooling.

Here's some example code in Quint:

``` bluespec
module tictactoe {
  type Player = X | O
  type Square = Occupied(Player) | Empty

  /// A 3x3 tic-tac-toe board
  var board: int -> (int -> Square)

  /// Coordinates for board corners
  pure val corners = Set((1,1), (3,1), (1,3), (3,3))

  def square(coordinate: (int, int)): Square =
    board.get(coordinate._1).get(coordinate._2)

  def isEmpty(coordinate) = match square(coordinate) {
    | Empty  => true
    | _      => false
  }

  /// A player makes a move on a board coordinate, if it is empty
  action Move(player, coordinate) = all {
    isEmpty(coordinate),
    board' = board.setBy(
      coordinate._1,
      row => row.set(coordinate._2, Occupied(player))
    ),
  }

  /// Nondeterministically pick a corner, and player X makes a move on that corner
  action StartInCorner =
    nondet corner = oneOf(corners)
    Move(X, corner)
}
```


### Features
<dl>
  <dt>A simple and familiar <b>syntax</b></dt>
  <dd>to support engineers reading and writing specifications</dd>

  <dt>An expressive <b>type systems</b></dt>
  <dd>to ensure the domain model is coherent</dd>

  <dt>A novel <b>effect system</b></dt>
  <dd>to ensure state updates are coherent</dd>

  <dt><b>IDE support</b> via LSP</dt>
  <dd>giving real time feedback when writing specifications</dd>

  <dt>A <b>REPL</b></dt>
  <dd>enabling interactive exploration of specifications</dd>

  <dt>A <b>simulator</b></dt>
  <dd>enabling tests, trace generation, and exploration of your system</dd>

  <dt><b>Symbolic model checking</b></dt>
  <dd>to verify your specifications via [Apalache][apalache]</dd>
</dl>

### Motivation

Quint is inspired by [TLA+][] (the language) but provides an alternative surface
syntax for specifying systems in TLA (the logic). The most important feature of
our syntax is that it is minimal and regular, making Quint an easy target for
advanced developer tooling and static analysis (see our [design principles][]
and [previews](./doc/previews.md) of the tooling).

The syntax also aims to be familiar to engineers:

- At the lexical level, it borrows many principles from C-like languages.
- At the syntax level, it follows many principles found in functional languages.
- At the semantic level, Quint extends the standard programming paradigm with
  non-determinism and temporal formulas, which allow concise specification of
  protocol environments such as networks, faults, and time.

Thanks to its foundation in TLA and its alignment with TLA+, Quint comes with
formal semantics built-in.

<details>
<summary>A comparisson between Quint and TLA<sup>+</sup> code</summary>

Quint:
```bluespec
type Status = Working | Prepared | Committed | Aborted

const ResourceManagers: Set[str]
var statuses: str -> Status

action init = {
  statuses' = ResourceManagers.mapBy(_ => Working)
}

val canCommit: bool = ResourceManagers.forall(rm => statuses.get(rm).in(Set(Prepared, Committed)))
val notCommitted: bool = ResourceManagers.forall(rm => statuses.get(rm) != Committed)

action prepare(rm) = all {
  statuses.get(rm) == Working,
  statuses' = statuses.set(rm, Prepared)
}
```

TLA<sup>+</sup>:
```tla
CONSTANT ResourceManagers
VARIABLE statuses

TCTypeOK == statuses \in [ResourceManagers -> {"working", "prepared", "committed", "aborted"}]

TCInit == statuses = [rm \in ResourceManagers |-> "working"]

canCommit == \A rm \in ResourceManagers : statuses[rm] \in {"prepared", "committed"}

notCommitted == \A rm \in ResourceManagers : statuses[rm] # "committed" 

Prepare(rm) == /\ statuses[rm] = "working"
               /\ statuses' = [statuses EXCEPT ![rm] = "prepared"]
```

</details>

To learn more about Quint's motivation and design philosophy, watch this [15
minute presentation](https://youtu.be/OZIX8rs-kOA), delivered at Gateway to
Cosmos in 2023.

## Installation

1. Install the [latest published version from npm](https://www.npmjs.com/package/@informalsystems/quint):

    ``` sh
    npm i @informalsystems/quint -g
    ```

2. Install IDE support for your editor:

    - [VSCode](https://marketplace.visualstudio.com/items?itemName=informal.quint-vscode)
    - [Emacs](./editor-plugins/emacs/README.md)
    - [Vim](./editor-plugins/vim/README.md)

3. _Optionally_, you may also install the [VSCode plugin for visualizing
   traces](https://marketplace.visualstudio.com/items?itemName=informal.itf-trace-viewer).

## Documentation

- [Frequently asked questions](./doc/faq.md)

- Quint by example:
  - [Cheatsheet](./doc/quint-cheatsheet.pdf)
  - [Language tutorials](./tutorials/README.md)
  - [REPL tutorial](./tutorials/repl/repl.md)
  - [Example specifications](./examples)

- Language reference:
  - [Syntax documentation](./doc/lang.md)
  - [Reference API documentation for built-in operators](./doc/builtin.md)

- Tooling manuals
  - [CLI manual](./doc/quint.md)
  - [Literate executable specifications](./doc/literate.md)

- [Design Principles][]


## Community

- Join the chat in the [Quint zulip stream][]
- Join the [Quint discussions][]
- [Contribute your spell][] to the collection of Quint spells
- [Contribute](./CONTRIBUTING.md) to the development of Quint

## On "Quint"

Quint is short for 'quintessence', from alchemy, which refers to the fifth
element. A lot of alchemy is about transmutation and energy, and Quint makes it
possible to transmute specifications into executable assets and empower ideas to
become referenced artifacts.

---

Quint is developed at [Informal Systems](https://informal.systems/).

Supported by the Vienna Business Agency.<br />[<img alt="Vienna Business Agency" src="./logos/vienna-business-agency.png" width="100">](https://viennabusinessagency.at/)

<!-- TODO rm unused links -->
[Design Principles]: ./doc/design-principles.md
[Apalache]: https://github.com/informalsystems/apalache
[Lessons from Writing a Compiler]: https://borretti.me/article/lessons-writing-compiler
[Imports]: ./doc/lang.md#imports-1
[Module definitions]: ./doc/lang.md#module-definition
[Constant declarations]: ./doc/lang.md#constant-declarations
[Assumptions]: ./doc/lang.md#assumptions
[Variable definitions]: ./doc/lang.md#variable-definitions
[Operator definitions]: ./doc/lang.md#variable-definitions
[Module instances]: ./doc/lang.md#module-instances
[Lambdas]: ./doc/lang.md#lambdas-aka-anonymous-operators
[Booleans]: ./doc/lang.md#boolean-operators-and-equality
[Integers]: ./doc/lang.md#integers
[Sets]: ./doc/lang.md#sets
[Lists]: ./doc/lang.md#lists-aka-sequences
[Multiline disjunctions]: ./doc/lang.md#multiline-disjunctions
[Multiline conjunctions]: ./doc/lang.md#multiline-conjunctions
[if-then-else]: ./doc/lang.md#condition
[nondet]: ./doc/lang.md#existential-quantifier-and-non-deterministic-choice
[Maps]: ./doc/lang.md#maps-aka-functions
[Records]: ./doc/lang.md#records
[Tuples]: ./doc/lang.md#tuples
[Sum types]: ./doc/lang.md#sum-types
[Delayed assignment]: ./doc/lang.md#delayed-assignment
[Runs]: ./doc/lang.md#runs
[Temporal operators]: ./doc/lang.md#temporal-operators
[Fairness]: ./doc/lang.md#fairness
[Unbounded quantifiers]: ./doc/lang.md#unbounded-quantifiers
[Modes]: ./doc/lang.md#modes
[Spells]: ./examples/spells/README.md
[Contribute your spell]: ./examples/spells/contribute-your-spell.md
[539]: https://github.com/informalsystems/quint/issues/539
[221]: https://github.com/informalsystems/quint/issues/221
[235]: https://github.com/informalsystems/quint/issues/235
[8]: https://github.com/informalsystems/quint/issues/8
[1034]: https://github.com/informalsystems/quint/issues/1034
[Higher-order definitions]: https://github.com/informalsystems/quint/blob/main/doc/lang.md#operator-definitions
[String literals]: https://github.com/informalsystems/quint/blob/main/doc/lang.md#identifiers-and-strings
[TLA+]: https://lamport.azurewebsites.net/tla/tla.html
[TLA]: https://en.wikipedia.org/wiki/Temporal_logic_of_actions
[Visual Studio Code Marketplace]: https://marketplace.visualstudio.com/items?itemName=informal.quint-vscode
[Tutorials]: ./tutorials/README.md
[Quint zulip stream]: https://informal-systems.zulipchat.com/#narrow/stream/378959-quint
[Quint discussions]: https://github.com/informalsystems/quint/discussions
[ITF traces]: https://apalache.informal.systems/docs/adr/015adr-trace.html
