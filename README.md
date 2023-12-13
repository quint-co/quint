<div align="center">

<!-- Title -->
<img src="./logos/quint-logo.png" alt="Quint Lang Logo" width="120"/>
<h1>Quint Lang</h1>

<!-- Menu -->
<p>
    <a href="#installation">Installation</a> •
    <a href="#documentation">Documentation</a> •
    <a href="#communty">Community</a> •
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

```bluespec
type Status = Working | Prepared | Committed | Aborted

const ResourceManagers: Set[str]
var statuses: str -> Status

action init = ResourceManagers.mapBy(_ => Working)

val canCommit: bool = ResourceManagers.forall(rm => statuses.get(rm).in(Set(Prepared, Committed)))
val notCommitted: bool = ResourceManagers.forall(rm => statuses.get(rm) != Committed)

action prepare(rm) = all {
  statuses.get(rm) == Working,
  statuses' = statuses.set(rm, Prepared)
}
```

<details>
<summary>The equivalent TLA<sup>+</sup> code</summary>

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

### Features

- A simple and familiar **syntax** to support engineers reading and writing specifications
- An expressive **type systems** to ensure the domain model is coherent
- A novel **effect system** to ensure state updates are coherent
- **IDE support** via LSP, giving real time feedback when writing specifications
- A **REPL** enabling interactive exploration of specifications
- A **simulator** enabling tests, trace generation, and exploration of your system
- **Symbolic model checking** to verify your specifications via [Apalache][apalache]

### Motivation

Quint is inspired by [TLA+][] but provides an alternative surface syntax for
specifying systems in TLA. The most important feature of our syntax is that it
is minimal and regular, making Quint an easy target for advanced developer
tooling and static analysis (see our [Design Principles][]).

The syntax also aims to be familiar to engineers:

- At the lexical level, it borrows many principles from C-like languages.
- At the syntax level, it follows a few (but not all) principles that are
  usually found in functional languages.
- At the semantic level, Quint extends the standard programming paradigm with
  non-determinism and temporal formulas, which allow designers to specify
  protocol environments such as networks, faults, and time concisely and
  clearly.

Notably, Quint comes with formal semantics built-in, thanks to its foundation in
TLA and it is aligned with TLA+

- it is supported in the [Apalache][] model checker.

<!-- TODO Find gallery sub-Section? -->
- [15 minute intro to Quint at Gateway to Cosmos 2023][] .
- [preview of the tools](./doc/previews.md).

## Installation

Install the [latest published version from npm](https://www.npmjs.com/package/@informalsystems/quint):

``` sh
npm i @informalsystems/quint -g
```

Install IDE support for your editor:

- [VSCode](https://marketplace.visualstudio.com/items?itemName=informal.quint-vscode)
- [Emacs](./editor-plugins/emacs/README.md)
- [Vim](./editor-plugins/vim/README.md)

## Documentation

<!-- TODO -->

### Tutorials :teacher:

Visit the [Tutorials][] page.

### Syntax :abcd:

- [Cheatsheet](./doc/quint-cheatsheet.pdf)
- [Reference API documentation for built-in operators](./doc/builtin.md)
- [Syntax documentation](./doc/lang.md)
- [Frequently asked questions](./doc/faq.md)

### Examples :musical_score:

We have written [examples](./examples) of several specifications in Quint.
Some of them accompany a TLA+ version for comparison and learning purposes.
To simplify reading, use [syntax highlighting](./editor-plugins) for your
editor (currently, VSCode, Emacs and Vim are supported).

### Tools :space_invader:

[Quick previews](./doc/previews.md) of the tools.

 - Quint's core tool `quint`:

   - [Installation](./quint/README.md)

   - [Manual](./doc/quint.md)

   - [REPL](./tutorials/repl/repl.md)

- Editor support:

  We strongly encourage you to configure your editor for Quint. Our language
  server provides the quickest feedback loop for your specifications, reporting
  informative errors as you type. These are instuctions for the currently
  supported editors:

  - VSCode: Install the plugin from [Visual Studio Code
    Marketplace][].
  - Emacs: Setup two custom packages from the [emacs folder](./editor-plugins/emacs).
  - Vim/Neovim: Follow configuration instructions from the [vim folder](./editor-plugins/vim)

 - VSCode plugin for [ITF traces][] by @hvanz:

   This a plugin that visualizes traces that are produced by Quint and
   [Apalache][]. Install the [ITF Trace Viewer][] from Visual Studio Code
   Marketplace.

 - Writing [literate executable specifications](./doc/literate.md)

   This is a technique for embedding formal quint formal specifications inside
   of markdown files.


## Communty


- Join the chat in the [Quint zulip stream][] :telephone:
- Join the [Quint discussions][] :bulb:
- [Contribute your spell][] to the collection of Quint spells :scroll:
- [Contribute](./CONTRIBUTING.md) to the development of Quint :construction_worker:

## On "Quint"

Quint is short for 'quintessence', from alchemy, which refers to the fifth
element. A lot of alchemy is about transmutation and energy, and Quint makes it
possible to transmute specifications into executable assets and empower ideas to
become referenced artifacts.

---

Quint is developed at [Informal Systems](https://informal.systems/).

<!-- TODO: Use English logo -->
Supported by the Vienna Business Agency<br />[<img alt="the Vienna Business Agency" src="./Wirtschaftsagentur_Wien_logo.jpg" width="200">](https://viennabusinessagency.at/).

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
[ITF Trace Viewer]: https://marketplace.visualstudio.com/items?itemName=informal.itf-trace-viewer
[15 minute intro to Quint]: https://youtu.be/OZIX8rs-kOA
