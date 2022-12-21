# Quint

![build
badge](https://github.com/informalsystems/quint/actions/workflows/main.yml/badge.svg)

Quint is a modern specification language that is a particularly good fit for
distributed and blockchain protocols. It combines the theoretical basis of the
Temporal Logic of Actions (TLA) with state-of-the-art static analysis and
development tooling.

At the lexical level, it borrows many principles from C-like languages. At the
syntax level, it follows a few (but not all) principles that are usually found
in functional languages. Quint extends the standard programming paradigm with
non-determinism, which lets designers conveniently specify protocol environment
such as the network, faults, time, and other protocols. Notably, Quint comes
with formal semantics built-in, which is defined in terms of TLA.

Historically, the motivation for Quint was to provide an alternative surface
syntax for TLA+ specifications. This syntax aims at being both more familiar to
programmers and easier to parse and analyze. However, the most important feature
of our syntax is that it is relatively minimal and easy to parse, and is
therefore an easy target for advanced developer tooling - see our [Design
Principles][]. Quint is compatible with TLA+ and will soon be supported in
[Apalache][].

## Name origin

Quint is short for Quintessence, from alchemy, which refers to the fifth
element. A lot of alchemy is about transmutation and energy, and Quint makes it
possible to transmute specifications into executable assets and empower ideas to
become referenced artifacts.

## Documentation

### Syntax

Check the [syntax documentation](./doc/lang.md) and the [Reference API
documentation for built-in operators](./doc/builtin.md).

### Examples

We have written [examples](./examples) of several specifications in Quint.
Some of them accompany a TLA+ version for comparison and learning purposes.
To simplify reading, use [syntax highlighting](./editor-plugins) for your
editor (currently, VSCode, Emacs and Vim are supported).

### User manuals

 - Quint transpiler:
   - [quintc manual](./doc/quintc.md)

   - [Installation](./quintc/README.md)

 - VSCode plugin:

   We strongly encourage you to use the VSCode plugin for Quint. It provides the
   quickest feedback loop for your specifications, reporting informative errors
   as you type.

   - [Installation](./vscode/README.md)

 - Quint REPL:
   - [REPL](./doc/repl.md)

## Development

### Developer docs

 - [ADR001: Transpiler architecture](./doc/adr001-transpiler-architecture.md)
 - [ADR002: Error codes](./doc/adr002-errors.md)
 - [ADR003: Interface to visit Internal Representation
   components](./doc/adr003-visiting-ir-components.md)
 - [ADR004: An Effect System for Quint](./doc/adr004-effect-system.md)
 - [ADR005: A Type System for Quint](./doc/adr005-type-system.md)

### Source code

 - [quintc](./quintc) is the package for the `quintc` transpiler
 - [vscode](./vscode) vscode plugin

### Roadmap

In the spirit of [Lessons from Writing a Compiler][], we have a roadmap, where
we are implementing various transpiler passes feature-by-feature, instead of
completely implementing every pass.

| Language feature                  | Parser             | Name resolution    | Effects            | Type checker       | Simulator                      | To-Apalache | Tutorials |
| :---------------                  | :----:             | :-------------:    | :-----:            | :----------:       | :-------:                      | :---------: | :-------: |
| [Booleans][]                      | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:             | :x:         | :x:       |
| [Integers][]                      | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:             | :x:         | :x:       |
| [if-then-else][]                  | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:             | :x:         | :x:       |
| [Operator definitions][]          | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:             | :x:         | :x:       |
| [Modes][]                         | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: [234][]                    | :x:         | :x:       |
| [Sets][]                          | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:/:x: [238][] | :x:         | :x:       |
| [Guess][]                         | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:             | :x:         | :x:       |
| [Maps][]                          | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:             | :x:         | :x:       |
| [Lists][]                         | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:             | :x:         | :x:       |
| [Records][]                       | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:             | :x:         | :x:       |
| [Discriminated unions][]          | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: [244][]        | :x: [233][]                    | :x:         | :x:       |
| [Tuples][]                        | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:             | :x:         | :x:       |
| [Imports][]                       | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :question:                     | :x:         | :x:       |
| [Module definitions][]            | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:             | :x:         | :x:       |
| [Module instances][]              | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: [237][]                    | :x:         | :x:       |
| [Multiple files][]                | :x: [8][]          | :x:                | :x:                | :x:                | :x:                            | :x:         | :x:       |
| [Constant declarations][]         | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: [236][]                    | :x:         | :x:       |
| [Variable definitions][]          | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:             | :x:         | :x:       |
| [Assumptions][]                   | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x:                | :x: [235][]                    | :x:         | :x:       |
| [Lambdas][]                       | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:             | :x:         | :x:       |
| [Multiline disjunctions][]        | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:             | :x:         | :x:       |
| [Multiline conjunctions][]        | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:             | :x:         | :x:       |
| [Delayed assignment][]            | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:             | :x:         | :x:       |
| Invariant checking                | -                  | -                  |                    |                    | :white_check_mark:             | :x:         | :x:       |
| [Higher-order definitions][]      | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :x: [221][]                    | :x:         | :x:       |
| [Runs][]                          | :white_check_mark: | :white_check_mark: | :x:                | :x:                | :white_check_mark:             | :x:         | :x:       |
| [Temporal operators][]            | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | *non-goal*                     | :x:         | :x:       |
| [Fairness][]                      | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | *non-goal*                     | :x:         | :x:       |
| [Unbounded quantifiers][]         | :white_check_mark: | :white_check_mark: | :x:                | :x:                | *non-goal*                     | :x:         | :x:       |
| [String literals][], see #118     | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark:             | :x:         | :x:       |
| ~~uninterpreted types~~, see #118 | :white_check_mark: | :white_check_mark: | :x:                | :x:                | :x:                            | :x:         | :x:       |


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
[Guess]: ./doc/lang.md#existential-quantifier-and-non-deterministic-choice
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
[232]: https://github.com/informalsystems/quint/issues/232
[231]: https://github.com/informalsystems/quint/issues/231
[233]: https://github.com/informalsystems/quint/issues/233
[221]: https://github.com/informalsystems/quint/issues/221
[234]: https://github.com/informalsystems/quint/issues/234
[235]: https://github.com/informalsystems/quint/issues/235
[8]: https://github.com/informalsystems/quint/issues/8
[237]: https://github.com/informalsystems/quint/issues/237
[236]: https://github.com/informalsystems/quint/issues/236
[238]: https://github.com/informalsystems/quint/issues/238
[242]: https://github.com/informalsystems/quint/issues/242
[243]: https://github.com/informalsystems/quint/issues/243
[244]: https://github.com/informalsystems/quint/issues/244
[245]: https://github.com/informalsystems/quint/issues/245
[Higher-order definitions]: https://github.com/informalsystems/quint/blob/main/doc/lang.md#operator-definitions
[String literals]: https://github.com/informalsystems/quint/blob/main/doc/lang.md#identifiers-and-strings
