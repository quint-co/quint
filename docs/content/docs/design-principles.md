# Design principles

- *Quint should not annoy us*:

  If a language concept has "standard" syntax in the mainstream languages,
  we adopt the mainstream syntax.

- *Quint should be easy to read*:

   - In contrast to TLA+, it keeps the set of ASCII control characters to minimum.
   - It eliminates ambiguity in several operators (of tuples, records, sequences).
   - It allows the user to specify types, if needed.

- *Quint should be easy to write*:

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

- *Quint should be easy to parse*:

   - It uses a small set of syntactic rules (its ANTLR4 grammar is 225 SLOC).
   - It borrows the best practices from the programming languages.
   - It should eliminate ambiguity in all operators and idioms.

- *Quint should be easy to pretty print*:

   - Indentation is encouraged but not required.

- *Quint should be compatible with TLA+*:

   - We keep one-to-one correspondence with the most of TLA+ operators.
   - There will be a transpiler to TLA+, so you can always jump back to TLA+.

- *Quint minimizes pain points of TLA+*:

   - There is a clean separation between expressions of different modes:
       stateless, state, action, and temporal.
   - Updates to state variables are labelled as assignments: `x' = e`.
   - Recursive operators and functions are removed in favor of
     well-known concepts such as `filter`, `map`, and `fold`.
   - Module imports and instances in Quint look similar to state-of-the-art
     programming languages.

- *Quint is CLI-first*:

   - The users should be able to parse and transpile Quint in the command-line.
   - The intermediate transpiler outputs are available in JSON.
   - IDE support (such as a VSCode plugin) is a beautiful opt-in, not a requirement.
