---
author: Igor Konnov
date: 2023-04-05
title: "Design Space of Foreign Calls in Quint"
---

# RFC007: Design space of foreign calls in Quint

| Revision | Date       | Author           |
| :------- | :--------- | :--------------- |
| 1        | 2023-04-05 | Igor Konnov      |

## 1. Summary

In this RFC, we discuss potential solutions for integrating the Quint simulator
with other execution environments. This would enrich the simulator with
computations that cannot be expressed in Quint itself, e.g., rich string
manipulation and parsing. Additionally, it would give us another path for more
interactive integration of the Quint simulator with systems under test.

## 2. Context

Quint is a specification language with the following features that are important
in the context of this RFC:

 - Quint has a relatively small standard library, and
 - Quint has formal semantics, thanks to its transpilation to TLA+.

Thanks to these features, Quint is an easier target for static analysis and
verification tools than general-purpose programming languages. At the same time,
these nice features are somewhat in conflict with the expressivity and usability
of the language, from the systems engineer's point of view. Even though Quint is
obviously Turing-complete (for example, quantifiers over integers and integer
arithmetic make many properties undecidable), this does not mean that all of the
typical engineering tasks are easy to do in Quint.

In the following, we introduce several examples that motivate the need for this
RFC.

### Example 1: Strings

From the systems engineer's point of view, the most glaring omission in the
language is the absence of string manipulation. From the verification engineer's
point of view strings are nothing else but lists of constants, which are
normally represented with bytes or sequences of bytes in programming languages.
While this is true, it is simply hard for humans to read expressions in this
representation. Compare the two expressions:

```js
["I", " ", "a", "m", " ", "a" , " ", "s", "t", "r", "i", "n", "g"]
"I am a string"
```

Although, string operations are typically used to format the output and process
the input, they open a room for hard verification problems. We should not
introduce hard problems, if they are caused by non-functional features such as
the user interface.

Yet, it would be nice to have a nice user interface in REPL, while keeping the
specifications amenable for verification. This shows a need for a clear
boundary between the "essential" computations and "non-essential" computations.

One concrete example of this usability issue is the string representation of
[IBC denominations][]. For instance, IBC operates over strings such as
`transfer/channelToA/denom`. In a Quint specification, we would prefer to
operate over lists such as `["transfer", "channelToA", "denom"]`. How can we
make Quint consume and produce the human-readable form of denominations, while
operating over lists? This problem calls for a serialization solution, which
would be typically done via a standard interface such as `toString` and
`parseFrom` in programming languages. For instance, it would be quite easy to
write such functions in JavaScript.

*Desired state: We would to input and output strings in a human-readable
form without impairing the verification tools.*

### Example 2: Hashing and encryption

Related to Example 1, blockchain projects heavily rely on the standard hashing
and encryption functions such as [SHA-2][] and ed25519, see [Cosmos Accounts][].
Not only it would be hard to express these algorithms in Quint, it would also
introduce enormous complexity to the verification tasks. To perform functional
verification, we would usually need high-level properties of these algorithms.
Actually, assuming perfect hashing and perfect encryption is often sufficient to
reason about non-cryptographic properties of distributed algorithms.

Again, while this is mostly irrelevant for verification, systems engineers
would like to call the actual hashing and encryption functions at some point,
for instance, to generate realistic data.

*Desired state: We should be able to use the standard hashing/encryption
functions in the simulator. We do not have to verify these functions, assuming
that they are in the trusted core of our system.*

### Example 3: Testing

Testing is probably the most obvious example that would require an integration
between the simulator and the system under test. Our current approach to this
problem is to produce traces in the [ITF Format][]. For instance, the following
command would save a trace found by the simulator into `foo.itf.json`, see
the [Quint manual][] for details:

```sh
quint run --out-itf=foo.itf.json foo.qnt
```

This approach assumes that the simulator (or a verification tool) is called
once, and its output is consumed by the system under test. However, this makes
it hard to integrate the simulator/verifier and the system under test into a
feedback loop. For example, see [Issue 2453][].

*Desired state: We should be able to call a system under test from a Quint
specification, in order to get interactive feedback from the system under test.*

### Example 4: Interactive trace visualization

Visualization is another example of where we could benefit from an integration
with non-Quint code. Whereas it should be easy to visualize ITF traces, we could
go further and visualize interactive computations, e.g., in Quint REPL.  We have
discussed this approach once, and it was not clear to us, why should we call
foreign code from Quint to do that, see [Issue 143][]. So this is probably not
the strongest motivator for this RFC.

*Desired state: We should be able to inform an external visualization tool
about a change in the system state, while running the simulator, or doing
interactive exploration in REPL. Visualization should not compromise the
formal specification.*

## 3. Options

We are discussing the choice of a good technology, given the following
constraints:

 - Ideally, the simulator should be able to integration with codebases
   written in Rust and Golang, as these are the implementation languages
   of the Cosmos ecosystem.

 - We emphasize ease of use over performance.

### Option 1: Dynamic integration with JavaScript via eval

The most obvious solution that first came to my mind is to introduce a special
Quint operator such as `unsafe { ... }` and place JavaScript code inside.  We
could evaluate the JavaScript code with `eval`.

Although this solution is quite simple, it has a very bad security smell:

 - Many execution environments disable `eval`, see [eval][].
 
 - Security analysis tools may complain about Quint, if we place `eval` in its
 code.

 - Ironically, placing `eval` into a formal spec may lead to vulnerabilities.

It looks like poisoning formal specs with `eval` is a very bad idea.
Additionally, it limits the integration point to JavaScript.

### Option 2: Node vm sandbox

A slightly better option would be to use [NodeJS VM][].

Pros:

 - It would still interpret JavaScript code, but in a sandboxed environment.

Cons:

 - We would depend on NodeJS, so transferring REPL to the web will be harder.

 - It limits the integration point to JavaScript and NodeJS.
 
### Option 3: JSON-RPC

We would like to execute the non-Quint code outside of the Quint tooling itself.
[JSON-RPC][] would allow us to implement such a loosely-coupled integration.

Pros:

 - Quint is written in TypeScript and submitting JSON is no brainer, especially
   given that we are using [ITF Format][] for serialization.

 - Language agnostic. Non-Quint code may be writte in JavaScript, Golang, and
 Rust.

 - Relatively easy to implement in Quint.

 - Does not require `.proto` files, in contrast to gRPC.

Cons:

 - Not the best performance. If we aim at high-performance integration loops,
   e.g., when doing fuzzing, JSON-RPC may become a bottleneck.
 
### Option 4: Compile-time integration

Another option to explore is to link against dynamic libraries that are written
in other languages, e.g., Rust and Golang.

Pros:

 - This would probably give us the best performance.

 - This may give us bonus points from the people who like low-level languages.

Cons:

 - Serialization would be painful.

 - External libraries would have compilation-time dependencies. It would not
   pose serious problems to use, but it would make integration harder.

## 4. Solution

We have to figure out a good solution, or maybe several solutions.  The problem
space outlined by the four examples is quite large.


[IBC denominations]: https://github.com/cosmos/ibc/blob/main/spec/app/ics-020-fungible-token-transfer/README.md#data-structures
[SHA-2]: https://en.wikipedia.org/wiki/SHA-2
[Cosmos Accounts]: https://docs.cosmos.network/v0.45/basics/accounts.html#signatures
[ITF Format]: https://apalache.informal.systems/docs/adr/015adr-trace.html
[Quint manual]: /docs/quint
[Issue 2453]: https://github.com/apalache-mc/apalache/issues/2453
[Issue 143]: https://github.com/informalsystems/quint/issues/143
[eval]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval
[NodeJS VM]: https://nodejs.org/api/vm.html
[JSON-RPC]: https://en.wikipedia.org/wiki/JSON-RPC#Implementations
