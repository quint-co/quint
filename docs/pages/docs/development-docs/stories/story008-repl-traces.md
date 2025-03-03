---
author: Igor Konnov
date: 2023-05-05
title: "Simulator Traces in REPL"
---

# Story 008: Simulator Traces in REPL

| Revision | Date       | Author                  |
|---------:|:----------:|:------------------------|
|        1 | 2023-05-05 | Igor Konnov             |

This is a UX design document for the interaction with states and traces in REPL.
This document helps us to understand the user stories before implementing them.

Over the last months, we had several requests that could be unified under a
common theme that is related to state and trace inspection.

 - [#446][]
 - [#795][]
 - [#347][]
 - [#303][]
 - [#288][]

This document is using [kettle][] as a running example. We assume that
a Quint REPL session is run in the directory of the example:

```sh
$ cd ./tutorials/repl
$ quint
Quint REPL 0.9.1
Type ".exit" to exit, or ".help" for more information
>>> import kettle.* from "./kettle"

```

## Story 1: Inspect the current state

*As a protocol reader, I want to print the protocol state without remembering
the names of the state variables, so I can discover which state variables are
around and which values they carry.*

Assume that we have initialized the protocol state with `init`:

```quint
>>> init
true
```

**Current interface**. Currently, we can inspect the state, by evaluating
the variable names:

```quint
>>> temperature
20
>>> heatingOn
false
>>> beeping
false
```

However, it is often more convenient to see the value of all the state variables
at once, e.g., when we do not remember them. The issues [#446][] and [#795][]
highlight this idea.

A workaround is to introduce a definition like the following one:

```quint
// a handy definition that captures the state in a record
val kettleState = {
  heatingOn: heatingOn,
  beeping: beeping,
  temperature: temperature
}
```

**Proposed interface**. The simplest yet powerful interface is to introduce the
system state as a record that is accessible via a standard name. We decided to
use the name `q::state`. Here is an example:

```quint
>>> q::state
{
  beeping: false,
  heatingOn: false,
  temperature: 20,
}
```

Since `q::state` is simply a `val`, we would be do all kinds of programmatic things with it:

```quint
>>> q::state.fieldNames()
Set("beeping", "heatingOn", "temperature")

>>> q::state.temperature
20
```

**Shortcut.** Since typing `q::state` often may be tedious, we offer a shortcut
*`q::s` for `q::state`.

## Story 2: Inspect the trace

*As a protocol reader, I want to print the sequence of states that were visited
on the way to the current protocol state, so I can see how the system was
progressing.*

Assume that we have executed a few steps:

```quint
>>> init
true
>>> pressButton
true
>>> heat
true
>>> depressButton
true
```

**Current interface**. After executing a few steps, we can inspect the reached
state. However, we would not be able to inspect the intermediate states, e.g.,
the states reached by executing `init`, then `pressButton`, then `heat`.

As mentioned in [#446][], it would be great to observe the sequence of visited
states. Currently, the only way to do that is by replaying the actions from the
start and printing the intermediate states after executing every action.

**Proposed interface**. Similar to Story 1, we are proposing to use a standard
name such as `q::trace`.

For the sequence `init.then(pressButton).then(heat).then(depressButton)`, we
expect `q::trace` to evaluate as follows:

```quint
>>> q::trace
[
  // 0
  { beeping: false, heatingOn: false, temperature: 20 },
  // 1
  { beeping: false, heatingOn: true, temperature: 20 },
  // 2
  { beeping: false, heatingOn: true, temperature: 21 },
  // 3*
  { beeping: false, heatingOn: false, temperature: 21 },
]
```

As we can see, `q::trace` is simply a value, which is printed as a
syntactically correct Quint expression. We expect REPL to decorate it a bit with
helpful comments: It should print the state numbers and highlight the active
state (with a `*`). However, the fact that `q::trace` is a value, lets us to
access it programmatically:

```quint
>>> q::trace.length()
4
>>> q::trace[3].temperature - q::trace[0].temperature
1
```

**Shortcut.** Since typing `q::trace` may be tedious, we offer a shortcut
`q::t` for `q::trace`.

## Story 3: Navigate the trace

*As a protocol reader, I want to jump between the visited states in the trace,
so I can evaluate invariants against them and explore different paths.*

As in Story 2, assume that we have executed a few steps:

```quint
>>> init
true
>>> pressButton
true
>>> heat
true
>>> depressButton
true
```

**Current interface**. Assuming that `q::trace` from Story 2 is implemented,
we should be able to see the intermediate states that are produced by the above
sequence of actions. However, if we want to evaluate state invariants against
the intermediate states, we have to replay the actions from start, e.g., by
executing `init`, then `pressButton`, then `heat`.

**Proposed interface**. We introduce several actions for navigating the trace.

### 3.1. Jump

The following REPL session highlights the expected interface:

```quint
>>> init.then(pressButton).then(heat).then(depressButton)
true
>>> q::jump(2)
true
>>> q::state
{ beeping: false, heatingOn: true, temperature: 21 }
>>> // we can evaluate expressions against the state
>>> q::state.temperature > 20
true
>>> // the trace does not change
>>> // the star is pointing to the active state
>>> q::trace
[
  // 0
  { beeping: false, heatingOn: false, temperature: 20 },
  // 1
  { beeping: false, heatingOn: true, temperature: 20 },
  // 2*
  { beeping: false, heatingOn: true, temperature: 21 },
  // 3
  { beeping: false, heatingOn: false, temperature: 21 },
]
```

Importantly, `q::jump` does not modify the trace `q::trace`. Hence, we can jump
forth and back in the current trace, without recomputing it. This is especially
important, since some of the actions may be non-deterministic.

### 3.2. Continue trace from the active state

```quint
>>> // ...continue the above session
>>> heat
true
>>> // the trace continues from the active state
>>> q::hist
[
  // 0
  { beeping: false, heatingOn: false, temperature: 20 },
  // 1
  { beeping: false, heatingOn: true, temperature: 20 },
  // 2
  { beeping: false, heatingOn: true, temperature: 21 },
  // 3*
  { beeping: false, heatingOn: true, temperature: 22 },
]
```

Note that when an action is evaluated, the trace beyond the active state is
cleared, and the new state is added after the active state.

### 3.3. Clear the trace

The trace is accumulating the states, even when `init` is executed. Hence, at
some point, we have to clear the trace:

```quint
>>> // ...continue the above session
>>> q::reset
true
>>> q::trace
[]
```

<!-- References -->

[#446]: https://github.com/informalsystems/quint/issues/446
[#795]: https://github.com/informalsystems/quint/issues/795
[#347]: https://github.com/informalsystems/quint/issues/347
[#303]: https://github.com/informalsystems/quint/issues/303
[#288]: https://github.com/informalsystems/quint/issues/288
[kettle]: https://github.com/informalsystems/quint/blob/main/docs/repl/kettle.qnt
