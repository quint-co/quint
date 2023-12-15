<div align="center">

<!-- Title -->
<img src="./logos/quint-logo.png" alt="Quint Lang Logo" width="120"/>
<h1>Quint Lang</h1>

<!-- Menu -->
<p>
    <a href="#installation">Installation</a> •
    <a href="./doc#readme">Documentation</a> •
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

### Example code in Quint :mrs_claus: :gift: :santa:

``` bluespec
module secret_santa {
  import basicSpells.* from "../../spells/basicSpells"
  import commonSpells.* from "../../spells/commonSpells"

  const participants: Set[str]

  /// get(recipient_for_santa, S) is the recipient for secret santa S
  var recipient_for_santa: str -> str

  /// the bowl of participants, containing a paper piece for each participant name
  var bowl: Set[str]

  val santas = recipient_for_santa.keys()
  val recipients = recipient_for_santa.mapValuesSet()

  /// The initial state
  action init = all {
    recipient_for_santa' = Map(), // No santas or recipients
    bowl' = participants,         // Every participant's name in the bowl
  }

  action draw_recipient(santa: str): bool = {
    nondet recipient = bowl.oneOf()
    all {
      recipient_for_santa' = put(recipient_for_santa, santa, recipient),
      bowl' = bowl.setRemove(recipient),
    }
  }

  action step = all {
    bowl.size() > 0,
    nondet next_santa = participants.filter(p => not(p.in(santas))).oneOf()
    draw_recipient(next_santa)
  }

  val everyone_gets_a_santa = (bowl.size() == 0).implies(participants == recipients)

  val no_person_is_self_santa = santas.forall(person =>
    get(recipient_for_santa, person) != person
  )

  val invariant = everyone_gets_a_santa and no_person_is_self_santa
}

module quint_team_secret_santa {
  import secret_santa(participants = Set("Gabriela", "Igor", "Jure", "Shon", "Thomas")).*
}
```

<details>
<summary>Checking if everyone gets a santa</summary>

Quint (with the help of [Apalache][apalache]) can check to ensure that after the bowl is
empty, every participant has a santa! No kids crying when the gifts are exchanged :gift:.

``` bluespec
quint verify secret_santa.qnt --invariant=everyone_gets_a_santa --main=quint_team_secret_santa --apalache-config=config.json
[ok] No violation found (2119ms).
You may increase --max-steps.
```

</details>

<details>
<summary>Checking if no one gets themself</summary>

This specification has no safeguards against people being their own santa! Quint
(with the help of [Apalache][apalache]) can easily find a minimal example where
this happens. Sorry kids, I hope you don't mind buying your own present :cry:!

``` bluespec
quint verify secret_santa.qnt --invariant=no_person_is_self_santa --main=quint_team_secret_santa
An example execution:

[State 0]
{
  quint_team_secret_santa::secret_santa::bowl: Set("Gabriela", "Igor", "Jure", "Shon", "Thomas"),
  quint_team_secret_santa::secret_santa::recipient_for_santa: Map()
}

[State 1]
{
  quint_team_secret_santa::secret_santa::bowl: Set("Igor", "Jure", "Shon", "Thomas"),
  quint_team_secret_santa::secret_santa::recipient_for_santa: Map("Gabriela" -> "Gabriela")
}

[violation] Found an issue (2047ms).
error: found a counterexample
```

</details>

[Apalache]: https://github.com/informalsystems/apalache
[TLA]: https://en.wikipedia.org/wiki/Temporal_logic_of_actions

### Features
<dl>
  <dt>A simple and familiar <strong>syntax</strong></dt>
  <dd>to support engineers reading and writing specifications</dd>

  <dt>An expressive <strong>type systems</strong></dt>
  <dd>to ensure the domain model is coherent</dd>

  <dt>A novel <strong>effect system</strong></dt>
  <dd>to ensure state updates are coherent</dd>

  <dt><strong>IDE support</strong> via LSP</dt>
  <dd>giving real time feedback when writing specifications</dd>

  <dt>A <strong>REPL</strong></dt>
  <dd>enabling interactive exploration of specifications</dd>

  <dt>A <strong>simulator</strong></dt>
  <dd>enabling tests, trace generation, and exploration of your system</dd>

  <dt><strong>Symbolic model checking</strong></dt>
  <dd>to verify your specifications via <a href="https://github.com/informalsystems/apalache">Apalache</a></dd>
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
<summary>A comparison between Quint and TLA<sup>+</sup> code</summary>

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

## Community

- Join the chat in the [Quint zulip stream](https://informal-systems.zulipchat.com/#narrow/stream/378959-quint)
- Join the [Quint discussions on GitHub](https://github.com/informalsystems/quint/discussions)
- [Contribute your spell](./examples/spells/contribute-your-spell.md) to the collection of Quint spells
- [Contribute](./CONTRIBUTING.md) to the development of Quint

## On "Quint"

Quint is short for 'quintessence', from alchemy, which refers to the fifth
element. A lot of alchemy is about transmutation and energy, and Quint makes it
possible to transmute specifications into executable assets and empower ideas to
become referenced artifacts.

## Acknowledgments

Quint has been designed and developed by the [Apalache][] team: [Gabriela
Moreira](https://github.com/bugarela), [Igor Konnov](https://konnov.github.io/),
[Jure Kukovec](https://github.com/Kukovec), [Shon Feder](http://shonfeder.net),
and [Thomas Pani](https://thpani.net/). :heart:

Thanks for notable contributions goes to [Romain Ruetschi](https://romac.me/),
[Philip Offtermatt](https://p-offtermatt.github.io/), [Ivan Gavran](https://ivan-gavran.github.io/),
and, [Ranadeep Biswas](https://ranadeep.in/).

---

Quint is developed at [Informal Systems](https://informal.systems/).

Supported by the Vienna Business Agency.<br />[<img alt="Vienna Business Agency" src="./logos/vienna-business-agency.png" width="100">](https://viennabusinessagency.at/)
