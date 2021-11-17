# TNT is not TLA+

![build badge](https://github.com/informalsystems/tnt/actions/workflows/main.yml/badge.svg)

This is a surface syntax that uses the same background logic as TLA+ but does
not try to mimic general mathematics. Instead it mimics functional languages,
e.g., Scala and OCaml.

## Syntax

Check the [preliminary syntax](./doc/lang.md). For each construct, we give
an equivalent TLA+ expression and thus define the language semantics by
this simple translation to TLA+.

## Examples

We have written [examples](./examples) of several TLA+ specifications in TNT.
To simplify reading, use [syntax highlighting](./editor-plugins) for your
editor (currently, only vim is supported).

## User manuals

 - TNT transpiler:
   - [tntc manpage](./doc/tntc.md)
   - [Installation](./src/README.md)

## Developer docs

 - [ADR001: Transpiler architecture](./doc/adr001-transpiler-architecture.md)
 - [ADR002: Error codes](./doc/adr002-errors.md)

## Source code

 - [tntc](./tntc) is the package for the `tntc` transpiler (work-in-progress)
 - [vscode](./vscode) vscode plugin (outdated)

## Design principles

 - *TNT should not annoy us*:

   If a language concept has "standard" syntax in the mainstream languages,
   we adopt the mainstream syntax.

 - *TNT should be easy to read*:
    - In contrast to TLA+, it keeps the set of ASCII control characters to minimum.
    - It eliminates ambiguity in several operators (of tuples, records, sequences).
    - It allows the user to specify types, if needed.

 - *TNT should be easy to write*:
    - It uses a small set of syntactic rules.
    - Most of the operators are mnemonic.
    - Rarely used operators (e.g. temporal operators) are mnemonic.
    - Constants, variables, and operators may be annotated with types,
      to get quick feedback from the type checker.
    - Well-known operators are written like in the most programming languages.
      Several examples:
        * `==` instead of just `=`,
        * `!=` instead of `/=` and `#`,
        * `&` and `and` instead of `/\`,
        * `|` and `or` instead of `\/`,
        * `not` instead of `~`,
        * `implies` instead of `=>`,
        * `/` instead of `\div`,
        * `.` instead of `!` when accessing a name in an instance.

 - *TNT should be easy to parse*: 
    - It uses a small set of syntactic rules (its ANTLR4 grammar is 120 SLOC).
    - It borrows the best practices from the programming languages.
    - It eliminates ambiguity in several operators (of tuples, records, sequences).

 - *TNT should be easy to pretty print*: 
    - Indentation is encouraged but not required.

 - *TNT should be compatible with TLA+*:
    - We keep one-to-one correspondence with the most of TLA+ operators.
    - There will be a transpiler to TLA+, so you can always jump back to TLA+.

 - *TNT minimizes pain points of TLA+*:
    - There is a clean separation between expressions of different modes:
        stateless, state, action, and temporal.
    - Updates to state variables are labelled as assignments: `x <- e`.
    - Recursive operators and functions are removed in favor of
      well-known concepts such as `filter`, `map`, and `fold`.
    - Module imports and instances in TNT look similar to state-of-the-art
      programming languages.

 - *TNT is CLI-first*:
    - The users should be able to parse and transpile TNT in the command-line.
    - The intermediate transpiler outputs are avaiable in JSON.
    - IDE support (such as a VSCode plugin) is a beatiful opt-in, not a requirement.

