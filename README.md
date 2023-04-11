# Quint

[![build
badge](https://github.com/informalsystems/quint/actions/workflows/main.yml/badge.svg)](https://github.com/informalsystems/quint/actions)
[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/informal.quint-vscode?color=10b0f2&label=VSCode)](https://marketplace.visualstudio.com/items?itemName=informal.quint-vscode)
[![npm (scoped)](https://img.shields.io/npm/v/@informalsystems/quint)](https://www.npmjs.com/package/@informalsystems/quint)

Quint is a modern specification language that is a particularly good fit for
distributed systems and blockchain protocols. It combines the robust theoretical
basis of the [Temporal Logic of Actions][TLA] (TLA) with state-of-the-art static
analysis and development tooling.

This is how typical Quint code looks:

```scala
  // `validateBalance` should only be called upon genesis state.
  pure def validateBalance(ctx: BankCtx, addr: Addr): bool = and {
    ctx.accounts.contains(addr),
    val coins = getAllBalances(ctx, addr)
    coins.keys().forall(denom => coins.get(denom) > 0),
  }
```

If you would like to see the same code in TLA<sup>+</sup>, here is how it looks:

```tla
\* `validateBalance` should only be called upon genesis state.
validateBalance(ctx, addr) ==
  /\ addr \in ctx.accounts
  /\ LET coins == getAllBalances(ctx, addr) IN
     \A denom \in DOMAIN coins:
       coins[denom] > 0
```

Want a preview of the tools before reading any further? Check [Quick
previews](./doc/previews.md).

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
TLA and it is aligned with TLA+: it will soon be supported in the [Apalache][]
model checker.

## Name origin

Quint is short for Quintessence, from alchemy, which refers to the fifth
element. A lot of alchemy is about transmutation and energy, and Quint makes it
possible to transmute specifications into executable assets and empower ideas to
become referenced artifacts.

## Documentation

### Tutorials :teacher:

Visit the [Tutorials][] page.

### Syntax :abcd:

- [Cheatsheet](./doc/quint-cheatsheet.pdf)
- [Reference API documentation for built-in operators](./doc/builtin.md)
- [Syntax documentation](./doc/lang.md)

### Examples :musical_score:

We have written [examples](./examples) of several specifications in Quint.
Some of them accompany a TLA+ version for comparison and learning purposes.
To simplify reading, use [syntax highlighting](./editor-plugins) for your
editor (currently, VSCode, Emacs and Vim are supported).

## Community and help

- Join the chat in the [Quint zulip stream][] :telephone:
- Join the [Quint discussions][] :bulb:
- [Contribute](./CONTRIBUTING.md) to the development of Quint :construction_worker:

### Tools :space_invader:

[Quick previews](./doc/previews.md) of the tools.

 - Quint's core tool `quint`:

   - [Installation](./quint/README.md)

   - [Manual](./doc/quint.md)

   - [REPL](./tutorials/repl/repl.md)

 - VSCode plugin:

   We strongly encourage you to use the VSCode plugin for Quint. It provides
   the quickest feedback loop for your specifications, reporting informative
   errors as you type. Install the plugin from [Visual Studio Code
   Marketplace][].

 - VSCode plugin for [ITF traces][] by @hvanz:

   This a plugin that visualizes traces that are produced by Quint and
   [Apalache][]. Install the [ITF Trace Viewer][] from Visual Studio Code
   Marketplace.

## Development

### Developer docs :guitar:

 - [ADR001: Transpiler architecture](./doc/adr001-transpiler-architecture.md)
 - [ADR002: Error codes](./doc/adr002-errors.md)
 - [ADR003: Interface to visit Internal Representation
   components](./doc/adr003-visiting-ir-components.md)
 - [ADR004: An Effect System for Quint](./doc/adr004-effect-system.md)
 - [ADR005: A Type System for Quint](./doc/adr005-type-system.md)
 - [ADR006: Design of modules and lookup tables](./doc/adr006-modules.lit.md)

### Source code :hash:

 - [quint](./quint) is the package for the `quint` transpiler
 - [vscode](./vscode) vscode plugin

### Roadmap :white_check_mark:

In the spirit of [Lessons from Writing a Compiler][], we have a roadmap, where
we are implementing various transpiler passes feature-by-feature, instead of
completely implementing every pass.

- :white_check_mark: Completed
- :green_circle: Won't get in your way, but there's still work to be done
- :x: Not implemented yet

| Language feature                  | Parser             | Name resolution    | Effects            | Type checker       | Simulator          | To-Apalache        | Tutorials          |
|:----------------------------------|:------------------:|:------------------:|:------------------:|:------------------:|:------------------:|:------------------:|:------------------:|
| [Booleans][]                      | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :white_check_mark: |
| [Integers][]                      | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :white_check_mark: |
| [if-then-else][]                  | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :white_check_mark: |
| [Operator definitions][]          | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :white_check_mark: |
| [Modes][]                         | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :white_check_mark: |
| [Sets][]                          | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :white_check_mark: |
| [nondet][]                        | :white_check_mark: | :white_check_mark: | :green_circle:     | :white_check_mark: | :white_check_mark: | :x:                | :white_check_mark: |
| [Maps][]                          | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :x:                |
| [Lists][]                         | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                |
| [Records][]                       | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :x:                |
| [Discriminated unions][]          | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: [244][]        | :x: [233][]        | :x:                | :x:                |
| [Tuples][]                        | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :white_check_mark: |
| [Imports][]                       | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :white_check_mark: |
| [Module definitions][]            | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :white_check_mark: |
| [Module instances][]              | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :x:                |
| [Multiple files][]                | :x: [8][]          | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :x:                | :x:                |
| [Constant declarations][]         | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: [236][]        | :x:                | :x:                |
| [Variable definitions][]          | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :white_check_mark: |
| [Assumptions][]                   | :white_check_mark: | :white_check_mark: | :white_check_mark: | :green_circle:     | :x: [235][]        | :x:                | :x:                |
| [Lambdas][]                       | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :white_check_mark: |
| [Multiline disjunctions][]        | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :white_check_mark: |
| [Multiline conjunctions][]        | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :white_check_mark: |
| [Delayed assignment][]            | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :white_check_mark: |
| Invariant checking                | -                  | -                  | -                  | -                  | :white_check_mark: | :x:                | :white_check_mark: |
| [Higher-order definitions][]      | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: [221][]        | :x:                | :x:                |
| [Runs][]                          | :white_check_mark: | :white_check_mark: | :green_circle:     | :white_check_mark: | :white_check_mark: | :x:                | :white_check_mark: |
| [Temporal operators][]            | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | *non-goal*         | :x:                | :x:                |
| [Fairness][]                      | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | *non-goal*         | :x:                | :x:                |
| [Unbounded quantifiers][]         | :white_check_mark: | :white_check_mark: | :x:                | :x:                | *non-goal*         | :x:                | :x:                |
| [String literals][], see #118     | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :white_check_mark: |
| ~~uninterpreted types~~, see #118 | :white_check_mark: | :white_check_mark: | :x:                | :x:                | :x:                | :x:                | :x:                |


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
[Discriminated unions]: ./doc/lang.md#discriminated-unions
[Tuples]: ./doc/lang.md#tuples
[Delayed assignment]: ./doc/lang.md#delayed-assignment
[Runs]: ./doc/lang.md#runs
[Temporal operators]: ./doc/lang.md#temporal-operators
[Fairness]: ./doc/lang.md#fairness
[Unbounded quantifiers]: ./doc/lang.md#unbounded-quantifiers
[Modes]: ./doc/lang.md#modes
[233]: https://github.com/informalsystems/quint/issues/233
[221]: https://github.com/informalsystems/quint/issues/221
[235]: https://github.com/informalsystems/quint/issues/235
[8]: https://github.com/informalsystems/quint/issues/8
[236]: https://github.com/informalsystems/quint/issues/236
[244]: https://github.com/informalsystems/quint/issues/244
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