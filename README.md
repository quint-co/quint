# TNT: is not TLA+

Also: *TNT is TLA+ for baby programmers and their babies*

Also: *You can type TNT even if your CAPS LOCK is broken*

Also: *You can write it TNT, TnT, TzT, Tz⟘, or TИT. We don't care.* 

This is a surface syntax that uses the same background logic as TLA+ but does
not try to mimic general mathematics. Instead it mimics functional languages,
e.g., Scala and OCaml.

Check the [preliminary syntax](./doc/lang.md). For each construct, we give
an equivalent TLA+ expression and thus define the language semantics by
this simple translation to TLA+.

The design principles of TNT:

 - TNT should be easy to read:
    - In contrast to TLA+, it keeps the set of ASCII control characters to minimum.
    - It eliminates ambiguity in several operators (of tuples, records, sequences).
    - It allows the user to specify types, if needed.

 - TNT should be easy to write:
    - It uses a small set of syntactic rules.
    - Most of the operators are mnemonic.
    - Rarely used operators (e.g. temporal operators) are mnemonic.
    - Well-known operators are written like in the most programming languages.
      Several examples:
        * `=` and `==` instead of just `=`,
        * `<>` and `!=` instead of `/=` and `#`,
        * `&` and `and` instead of `/\`,
        * `|` and `or` instead of `\/`,
        * `not` instead of `~`,
        * `implies` instead of `=>`,
        * `/` instead of `\div`,
        * `.` instead of `!` when accessing a name in an instance.

 - TNT should be easy to parse: 
    - It uses a small set of syntactic rules.
    - It borrows the best practices from the programming languages.
    - It eliminates ambiguity in several operators (of tuples, records, sequences).

 - TNT should be easy to pretty print: 
    - Indendation is encouraged but not required.

 - TNT should be compatible with TLA+:
    - We keep one-to-one correspondence with the most of TLA+ operators.
    - There will be a transpiler to TLA+, so you can always jump back to TLA+.
    - If the user omits types, the transpiler will still produce TLA+ code.


