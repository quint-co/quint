# Summary of TNT

*TNT is not TLA+*

This document presents language constructs in the same order as the [summary of
TLA+](https://lamport.azurewebsites.net/tla/summary.pdf).

## Identifiers

Identifiers are exactly like in TLA+:

```
identifier ::=
    <string matching regex [a-zA-Z_]([a-zA-Z0-9_])*>
```

## Comments

Single-line comments:

```scala
// this is a comment
some code // this is also a comment
```

Multi-line comments:

```scala
/*
 This is a multi-line comment.
 Please forgive me, for I am writing comments like in:
 C, C++, Java, Scala, Rust, JavaScript, CSS, what else?
 */
```

## Types

This needs an explanation, but these are basically apalache types.

### Untyped signatures

It should be always possible to omit the type of a constant or a state variable
`x` by writing the type annotation `x : _`. In this case, neither the parser,
nor the type checker should complain about the type of `x`. The transpiler will
translate the expressions over `x` to TLA+ as is, possibly producing ill-typed
expressions.

### Type System 1

TODO

## Module-level constructs

### Module definition

A module definition is introduced like follows:

```
module Foo extends Bar
    // place your definitions here
    module Baz
        // definitions in a nested module
    end
end
```

A single file may contain multiple modules, which may be nested.

*Grammar:*

```
module <identifier> [extends <identifier> (',' <identifier>)*]
  <definitions>
end
```

### Constant declaration

Introduce a single constant parameter (rigid variable in TLA+)

```
  const N: Int
  const Proc: Set(Str)
  // constant X is untyped
  const X: _
```

*Grammar:*

```
  const <identifier> : <type>
```

### Assumptions

Given a constant predicate `P` and a name, we can write an assumption `P` over the
constants that is associated with this name. For example:

*Example*:

```
assume AtLeast4 = N >= 4
```

This is exactly the same as the following assumption in TLA+:

```tla
ASSUME AtLeast4 == N >= 4
```

*Grammar:*

```
assume <identifier> = <expr>
```

Similar to TLA+, you can have an anonymous assumption, by simply using `_` for
the name:

```tla
assume _ = Proc.card > 0
```

### Variable definition

Introduce a single variable (flexible variable in TLA+)

```
  var name: Str
  var timer: Int
  var is_armed: Bool
  // variable foo is untyped
  var foo: _
```

*Grammar:*

```
  var <identifier> : <type>
```

### Operator definition

Introduce a user-defined operator. The order of definitions is not important.
The operator names should not clash with the names of other definitions in the
module scope. Operators may be recursive.

```
// a constant operator
val Nodes: Set(Int) = 1 to 10

// a two-argument operator that returns its first argument
def fst(x, y): (a, b) => a = x

// the maximum operator
def max(x, y) =
    if (x > y) x else y

// a recursive operator
def rec fact(n) = {
    if (n <= 1) n else n * fact(n - 1)
}

// a higher-order operator that accepts another operator as its first argument
def F(G, x): (a => b, a) => b = G(x)

// an operator that is invisible outside the module
private def lte(x, y) = {
    x <= y
}
```


*Grammar:*

```
[private] (val | def | def rec | pred | action | temporal)
    <identifier>[(<identifier>, ..., <identifier>)] [':' <type>] = <expr>
```

### Recursive functions

There is no special syntax for top-level definitions of recursive functions.
However, you can introduce a recursive function with the set operator `recFun`.

### Module instances

In the initial version, we keep instances as in TLA+. In the future, we may
change this operator.


A named instance is defined as:

```scala
instance <identifier> = <identifier>
  [with <identifier> "<-" <identifier> ("," <identifier> "<-" <identifier>)*]
```

*Example:*

```scala
// an instance of Voting that has the name "V"
instance V = Voting with Values <- set(0, 1)

// the names in V are accessed via "."
val MyValues = V.Values
```

An anonymous instance is defined as:

```scala
[private] instance _ = <identifier>
  [with <identifier> "<-" <identifier> ("," <identifier> "<-" <identifier>)*]
```

*Example:*

```scala
// an instance of Voting whose definitions are added in the module namespace
instance _ = Voting with Values <- set(0, 1)
```

An anonymous instance may be private, which corresponds to `LOCAL INSTANCE` in
TLA+.

We do not allow for instances with parameters. They are rarely used. They are
mainly needed for proofs of refinement. In this case, you would be better off
with TLA+ and TLAPS.

### Theorems

There are no theorems. You can write them in TLA+ and prove them with TLAPS.

## Literals

Boolean literals are written as follows:

```
// FALSE in TLA+
false
// TRUE in TLA+
true
// BOOLEAN = { FALSE, TRUE } in TLA+
Bool
```

Integers literals are written as follows:

```
0
1
-1
2
-2
...
```

The set of all integers is written as `Int` and the set of all naturals is
written as `Nat`.

String literals are written as follows:

```
"hello, world!"
'hello, world!'
```

## Basics

Every expression can be wrapped with `{` and `}`. For instance:

```
  { 1 }
```

The braces `{` and `}` **do not introduce a set**. For the set notation,
see `set(...)`.

Similar to `{` and `}`, you can always wrap an expression with `(` and `)`,
e.g., `(1 + 3)`.  It is up to you.

A user-defined operator `foo(p_1, ..., p_n)` is applied to arguments `a_1, ...,
a_n` as follows:

```
  foo(a_1, ..., a_n)
```

(It is no different from TLA+.)

An anonymous operator of one argument is defined as:

```
{ x -> e }
```

Compare this to the TLA+2 syntax:

```tla
LAMBDA x: e
```

An anonymous operator of `n` arguments is defined as:

```
{ (x_1, ..., x_n) -> e }
```

Compare this to the TLA+2 syntax:

```tla
LAMBDA x_1, ..., x_n: e
```

As is common, we can skip parameter names, if we don't need them:

```
{ _ -> e }
{ (_, ..., _) -> e }
```

## Boolean operators and equality

These are the standard Boolean operators (higher priority first):

```scala
// equality: e1 = e2 in TLA+
e1 = e2
e1 == e2
// inequality (same priority as '='): e1 /= e2, e1 # e2 in TLA+
e1 <> e2
e1 != e2
// logical not: ~p in TLA+
not p
// logical and: p /\ q in TLA+
p and q
p.and(q)
// logical or: p \/ q in TLA+
p or q
p.or(q)
// logical equivalence: p <=> q in TLA+
p iff q
p.iff(q)
// implication: p => q in TLA+
p implies q
p.implies(q)
```

### Multiline disjunctions

```scala
{ 
  | p_1
  | p_2
  ...
  | p_n
}
```

This is equivalent to `p_1.or(p_2).or( ... or(p_n)...)`. The indentation is not
important.  However, you can produce nice indentation by hand, if you like.

### Multiline conjunctions

```scala
{
  & p_1
  & p_2
  ...
  & p_n
}
```

This is equivalent to `p_1.and(p_2.and( ... and(p_n)...)`. The indentation is not
important.  However, you can produce nice indentation by hand, if you like.

## Flow operators

### Branching

```scala
  if (p) e1 else e2
```

Compare it to TLA+:

```tla
  IF p THEN e1 ELSE e2
```

### Cases

Case enumeration without the default case:

```scala
case {
  | p_1 -> e_1
  | p_2 -> e_2
  ...
  | p_n -> e_n
}
```

Compare it to TLA+:

```tla
CASE
     p_1 -> e_1
  [] p_2 -> e_2
  ...
  [] p_n -> e_n
```

Case enumeration with the default case:

```scala
case {
  | p_1 -> e_1
  | p_2 -> e_2
  ...
  | p_n -> e_n
  | _   -> e
}
```

Compare it to TLA+:

```tla
CASE
     p_1 -> e_1
  [] p_2 -> e_2
  ...
  [] p_n -> e_n
  OTHER -> e
```

## Sets

### Set constructor

One way to construct a set is by enumerating its elements:

```scala
`{ e_1, ..., e_n }
```

This is exactly as `{ e_1, ..., e_n }` in TLA+. However, we prefer not to
sacrifice `{...}` for this only operator. That is why a set is constructed with
`` `{...}`` in TNT. In practice, this operator does not appear too often, so our
notation would not distract you too much.

### Other set operators

The other operators are introduced and explained in code directly:

```scala
// set membership: e \in S
e in S
e.in(S)
S contains e
S.contains(e)
// set non-membership: e \notin S
e notin S
e.notin(S)
// union: S \union T
S union T
S.union(T)
// intersection: S \intersect T
S intersect T
S.intersect(T)
// difference: S \ T
S minus T
S.minus(T)
// S is a subset of T (proper or not): S \subseteq T
S subseteq T
S.subseteq(T)
// set comprehension (map): { e: x \in S }
S map { x -> e }
S.map( x -> e )
// set comprehension (filter): { x \in S: P }
S filter { x -> P }
S.filter( x -> P )
// set folding: you can write such a recursive operator in TLA+
S fold init, { (v, x) -> e }
S.fold(init, { (v, x) -> e })
// \E x \in S: P
S exists { x -> P }
S.exists( x -> P )
// \A x \in S: P
S forall { x -> P }
S.forall( x -> P )
// CHOOSE x \in S: P
S some { x -> P }
S.some( x -> P )
// SUBSET S
S powerset
S.powerset
// UNION S
S flatten
S.flatten
// Seq(S) of the module Sequences
S seqs
S.seqs
```

These operators are defined in the module `FiniteSets` in TLA+. TNT has these
two operators in the kernel:

```scala
// IsFiniteSet(S)
S isFinite
S.isFinite
// Cardinality(S)
S cardinality
S.cardinality
```

## Functions

```scala
// function application: f[e]
f[e]
// function domain: DOMAIN f
f domain
f.domain
// function constructor: [ x \in S |-> e ]
S fun { x -> e }
S.fun(x -> e)
// Define a recursive function. This is equivalent to the following TLA+ code
// LET f[x \in S] == e IN f
S recFun { x -> e }
S.recFun(x -> e)
// a set of functions: [ S -> T ]
S funsTo T
S.funsTo(T)
// [f EXCEPT ![e1] = e2]
f except e1, { _ -> e2 }
f.except(e1, { _ -> e2 })
// [f EXCEPT ![e1] = e2, ![e3] = e4]
(f except e1, { _ -> e2 }) except e3, { _ -> e4 }
// [f EXCEPT ![e1] = @ + y]
f except e1, { old -> old + y }
f.except(e1, { old -> old + y })
```

## Records

```scala
// record constructor: [ f_1 |-> e_1, ..., f_n |-> e_n ]
// Warning: n >= 1
[ f_1 -> e_1, ..., f_n -> e_n ]
// set of records: [ f_1: S_1, ..., f_n: S_n ]
[ f_1: S_1, ..., f_n: S_n ]
// access a record field: r.h
r.h
r h
// the set of record keys: DOMAIN r
r.keys
r keys
// record update: [r EXCEPT !.f = e]
r with f, e
r.with(f, e)
```

## Tuples

In contrast to TLA+, TNT tuples have length at least of 2.
If you need sequences, use sequences.

```scala
// Tuple constructor: << e_1, ..., e_n >>
// Warning: n >= 2
(e_1, ..., e_n)
// t[1], t[2], t[3], t[4], ... , t[50]
t._1
t._2
t._3
t._4
...
t._50
// Cartesian products
// S_1 \X S_2
S_1 X S_2
// S_1 \X S_2 \X ... \X S_n
(S_1, S_2, ..., S_n).prod
```

What about `DOMAIN t` on tuples? We don't think it makes sense to have it.

What about `[ t EXCEPT ![i] = e ]`? Just define a new tuple that contains
the new field.

## Sequences

In contrast to TLA+, there is no special module for sequences. They are built
in the kernel of TNT. A parser can compute, whether operators on sequences are
used in the spec.

```scala
// sequence constructor: <<e_1, ..., e_n>> (which is also a tuple in TLA+)
[ e_1, ..., e_n ]
// append at the sequence tail: Append(s, e)
s append e
s.append(e)
// concatenate sequences: s \circ t
s concat t
s.concat(t)
// sequence head: Head(s)
s head
s.head
// sequence tail: Tail(s)
s tail
s.tail
// sequence length: Len(s)
s length
s.length
// sequence element at nth position (starting with 1): equivalent to s[i] in TLA+
s nth i
s.nth(i)
// the set of sequence indices (starting with 1): DOMAIN s
s indices
s.indices
// SubSeq(s, j, k)
s slice j k
s.slice(j, k)
// SelectSeq(s, Test)
s select Test
// in particular, we can use anonymous operators
s select { e -> P }
// Left fold. There is no standard operator for that in TLA+,
// but you can define it with a recursive operator.
s foldl init { (i, v) -> e }
s.foldl(init, { (i, v) -> e })
// Right fold. There is no standard operator for that in TLA+,
// but you can define it with a recursive operator.
s foldr init { (i, v) -> e }
s.foldr(init, { (i, v) -> e })
```

## Integers

In contrast to TLA+, there is no special module for integers. They are built in
the kernel of TNT. The module `Naturals` does not exist either. A parser can
compute, whether integer operators are used in the spec.

Moreover, there is no module `Reals`. If you really need `Reals`, most likely,
you should switch directly to TLA+.

```scala
m + n
m - n
m * n
// integer division, as \div in TLA+
m / n
m % n
m ^ n
m < n
m > n
m <= n
m >= n
Int
Nat
// as m..n in TLA+
m to n
m.to(n)
```

## Nested operators

There is not much to say here. They are almost identical to the top-level
operators, except that they are always private.

*Examples:*

```scala
def double(x) =
    // a nested operator
    def plus(a, b) = a + b
    in
    plus(x, x)

def plus_inductive(x, y) =
    // a nested recursive operator. You don't have to add numbers like this though.
    def rec nat_plus(a, b) =
        if (b <= 0) a else 1 + nat_plus(a, b - 1)
    in
    nat_plus(x, y)

def pow4(x) =
    // a nested
    val x2 = x * x
    in
    x2 * x2

temporal my_prop =
    temporal A = eventually(x > 3)
    in
    temporal B = always(eventually(y = 0))
    in
    A implies B
```

*Grammar:*

```
(val | def | def rec | pred | action | temporal)
  <identifier>[(<identifier>, ..., <identifier>)] [':' <type>] = <expr>
in
<expr>
```

## Action operators

### Single static assignment

This operator is carefully avoided in TLA+. TNT allows you to assign a value to
the state variable `x` in a next state.

```scala
x := e
```

This operator is equivalent to `x' = e` of TLA+ under specific conditions.

*Every state variable `x` must be assigned exactly once in every step:
Either via `x := e`, or via `unchanged(x)` (see below).*

### Unchanged

For a state variable `x`, the following expression is like `UNCHANGED x`:

```scala
unchanged(x)
```

In a more general case, you can write `unchanged(t)` for a tuple `t` that
contains names of state variables; tuples can be nested.

### Stutter and nostutter

The following operator is similar to `[A]_x`:

```scala
stutter(A, x)
```

The following operator is similar to `<A>_x`:

```scala
nostutter(A, x)
```

As in case of `unchanged`, you can pass a tuple of names.

### Primes

Explicit use of primes in actions is discouraged in TNT. You should use `:=`
and `unchanged`, wherever possible. However, we have added primes to the
language for completeness. Otherwise, we would not be able to translate TLA+ to
TNT and back. The operator prime is written as follows:

```scala
  next(e)
```

It is equivalent to `e'` of TLA+. More precisely, if `f` is the translation of
a TNT expression `e` to TLA+, then `f'` is the translation of `e'` to TLA+.

### Enabled

Explicit use of `enabled` in actions is discouraged in TNT. However, we have added
this operator to the language for completeness. Otherwise, we would not be able to
translate TLA+ to TNT. This operator is written as follows:

```scala
  enabled(A)
```

It is equivalent to `ENABLED A` of TLA+. More precisely, if `B` is the
translation of a TNT expression `A` to TLA+, then `ENABLED B` is the
translation of `enabled(A)` to TLA+.

### Other action operators

There is no equivalent of the composition operators `A \cdot B`. It is no
supported by TLC, so the chance that you will needed is very low. We can add
it later, if you have a use-case for it.

## Temporal operators

### Always

This is equivalent to `[]A` of TLA+:

```scala
always(A)
```

### Eventually

This is equivalent to `<>A` of TLA+:

```scala
eventually(A)
```

### Fairness

This is equivalent to `WF_e(A)` of TLA+:

```scala
wfair(A, e)
```

This is equivalent to `SF_e(A)` of TLA+:

```scala
sfair(A, e)
```

The second argument `e` is either a name, or a tuple of names, as in
`unchanged`.

### Other temporal operators

We omit `A \leadsto B`, as it can be written as:

```scala
always(A implies eventually(B))
```

TLA+ contains an interesting operator "guarantees", that is written as `A -+-> B`.
For completeness, we introduce its syntactic version in TNT:

```
guarantees(A, B)
```

The operators `\EE` and `\AA` are almost never used, so there are no
equivalents in TNT. If you have reached this level, you should (automatically)
translate your TNT spec into TLA+ and use your tools, e.g., TLAPS.

