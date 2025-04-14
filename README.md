<div align="center">

<!-- Title -->
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./logos/quint-logo-light.png">
  <img alt="Quint Lang" src="./logos/quint-logo-dark.png" width=700>
</picture>

<!-- Menu -->
<p>
    <a href="https://quint-lang.org/">Website</a> •
    <a href="https://quint-lang.org/docs/getting-started">Getting Started</a> •
    <a href="#documentation">Documentation</a> •
    <a href="#community">Community</a>
</p>

<!-- Badges -->
<p>
    <a href="https://github.com/informalsystems/quint/actions">
        <img
            src="https://github.com/informalsystems/quint/actions/workflows/quint.yml/badge.svg"
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
    <a href="https://t.me/quint_lang">
        <img
            src="https://img.shields.io/badge/chat-telegram-blue"
            alt="telegram group">
    </a>
</p>
</div>


# The Quint specification language

Quint is a modern specification language that is a particularly good fit for
distributed systems, such as blockchain protocols, distributed databases, and
p2p protocols. Quint combines the robust theoretical basis of the [Temporal
Logic of Actions (TLA)][TLA] with state-of-the-art type checking and
development tooling.

### Example code in Quint

Here is a small specification for a bank:
``` bluespec

module bank {
  /// A state variable to store the balance of each account
  var balances: str -> int

  pure val ADDRESSES = Set("alice", "bob", "charlie")

  action deposit(account, amount) = {
    // Increment balance of account by amount
    balances' = balances.setBy(account, curr => curr + amount)
  }

  action withdraw(account, amount) = {
    // Decrement balance of account by amount
    balances' = balances.setBy(account, curr => curr - amount)
  }

  action init = {
    // At the initial state, all balances are zero
    balances' = ADDRESSES.mapBy(_ => 0)
  }

  action step = {
    // Non-deterministically pick an address and an amount
    nondet account = ADDRESSES.oneOf()
    nondet amount = 1.to(100).oneOf()
    // Non-deterministically choose to either deposit or withdraw
    any {
      deposit(account, amount),
      withdraw(account, amount),
    }
  }

  /// An invariant stating that all accounts should have a non-negative balance
  val no_negatives = ADDRESSES.forall(addr => balances.get(addr) >= 0)
}
```


This design lacks some important checks, and we can use the Quint CLI to find a
violation to the `no_negatives` property, which ideally should hold:

```sh
$ quint run bank.qnt --invariant=no_negatives
```


And the result is a violation where address `"alice"` has balance `-79` in the second state.

``` bluespec
An example execution:

[State 0] { balances: Map("alice" -> 0, "bob" -> 0, "charlie" -> 0) }

[State 1] { balances: Map("alice" -> -79, "bob" -> 0, "charlie" -> 0) }

[violation] Found an issue (45ms).
Use --seed=0x1112de300ce425 to reproduce.
Use --verbosity=3 to show executions.
error: Invariant violated
```

Check the [Getting Started](https://quint-lang.org/docs/getting-started) guide
to see how we can fix this problem and formally verify the result.

[Apalache]: https://github.com/apalache-mc/apalache
[TLA]: https://en.wikipedia.org/wiki/Temporal_logic_of_actions

### Features
<dl>
  <dt>A simple and familiar <strong>syntax</strong></dt>
  <dd>to support engineers reading and writing specifications</dd>

  <dt>An expressive <strong>type system</strong></dt>
  <dd>to ensure the domain model is coherent</dd>

  <dt>A novel <strong>effect system</strong></dt>
  <dd>to ensure state updates are coherent</dd>

  <dt><strong>IDE support</strong> via LSP</dt>
  <dd>giving real time feedback when writing specifications</dd>

  <dt>A <strong>REPL</strong></dt>
  <dd>enabling interactive exploration of specifications</dd>

  <dt>A <strong>simulator</strong></dt>
  <dd>enabling tests, trace generation, and exploration of your system</dd>

  <dt><strong>A symbolic model checker</strong></dt>
  <dd>to verify your specifications via <a href="https://github.com/apalache-mc/apalache">Apalache</a></dd>
</dl>

### Motivation

Quint is inspired by [TLA+][] (the language) but provides an alternative surface
syntax for specifying systems in TLA (the logic). The most important feature of
our syntax is that it is minimal and regular, making Quint an easy target for
advanced developer tooling and static analysis (see our [design
principles](./docs/pages/docs/design-principles.md) and [previews](./docs/pages/docs/previews.md) of the
tooling).

The syntax also aims to be familiar to engineers:

- At the lexical level, it borrows many principles from C-like languages.
- At the syntax level, it follows many principles found in functional languages.
- At the semantic level, Quint extends the standard programming paradigm with
  non-determinism and temporal formulas, which allow concise specification of
  protocol environments such as networks, faults, and time.

Thanks to its foundation in TLA and its alignment with TLA+, Quint comes with
formal semantics built-in.

<details>
<summary>An example that highlights differences between Quint and TLA<sup>+</sup></summary>

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

[TLA+]: https://lamport.azurewebsites.net/tla/tla.html

## Community

- Join the chat in the [Telegram group](https://t.me/quint_lang) or in the [Zulip stream](https://informal-systems.zulipchat.com/#narrow/stream/378959-quint)
- Join the [Quint discussions on GitHub](https://github.com/informalsystems/quint/discussions)
- [Contribute your spell](./examples/spells/contribute-your-spell.md) to the collection of Quint spells
- [Contribute](./CONTRIBUTING.md) to the development of Quint
- Join or co-design meetings: We hold fortnightly meetings with users and those
  interested in contributing to the design and development of Quint. Contact us if
  you would like an invitation.


## Documentation

View the [Quint documentation](https://quint-lang.org/docs/getting-started).

We aspire to have great, comprehensive documentation. At present, we have a
good start, but still far to go. Please try what we have available and share
with us any needs we have not yet been able to meet.

## On "Quint"

Quint is short for 'quintessence', from alchemy, which refers to the fifth
element. A lot of alchemy is about transmutation and energy, and Quint makes it
possible to transmute specifications into executable assets and empower ideas to
become referenced artifacts.

## Acknowledgments

Quint has been designed and developed by the [Apalache][] team: [Gabriela
Moreira](https://bugarela.com), [Igor Konnov](https://konnov.github.io/),
[Jure Kukovec](https://github.com/Kukovec), [Shon Feder](http://shonfeder.net),
and [Thomas Pani](https://thpani.net/). :heart:

Thanks for notable contributions goes to [Romain Ruetschi](https://romac.me/),
[Philip Offtermatt](https://p-offtermatt.github.io/), [Ivan Gavran](https://ivan-gavran.github.io/),
and, [Ranadeep Biswas](https://ranadeep.in/).

---

Quint is developed at [Informal Systems](https://informal.systems/).

Supported by the Vienna Business Agency.<br />[<img alt="Vienna Business Agency" src="./logos/vienna-business-agency.png" width="100">](https://viennabusinessagency.at/)
