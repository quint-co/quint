# Summary of TNT

*TNT is not TLA+*

**Revision: 10.10.2021** 

This document presents language constructs in the same order as the [summary of
TLA+](https://lamport.azurewebsites.net/tla/summary.pdf).

## Identifiers and strings

Identifiers are defined exactly as in TLA+:

```
identifier ::=
    <string matching regex [a-zA-Z_]([a-zA-Z0-9_])*>
```

String literals are written as follows:

```
"hello, world!"
```

You cannot do much with strings. They can be compared for equality and
inequality, and they can be stored in sets, functions, sequences, tuples, and
records. In this sense, strings are just more liberal identifiers.

## Comments

Single-line comments:

```scala
// this is a one-line comment
some code // this is also a one-line comment
```

Multi-line comments:

```scala
/*
 This is a multi-line comment.
 We are writing comments like in:
 C, C++, Go, Java, Scala, Rust, JavaScript, CSS, etc.

 This is the principle of the least surprise.
 */
```

## Types

TNT is a typed language. All variables and constants must be assigned a type.
An operator may be annotated with types. However, if the type checker is able
to infer the type of an operator, then the operator type may be omitted.

**Discussion.** In the earlier version of TNT, we allowed the user to omit
types altogether. In retrospect, we find this to be a bad idea. Hence, we
require that every language object is either type-annotated (variables and
constants), or can be assigned a type via type checking (operators and
expressions).

### Type System 1.2

This is the same type system as in Apalache, except we have added discriminated
unions:

A type is one of the following:

 - Basic type: `bool`, `int`, `str`.

 - Uninterpreted type or type name: `IDENTIFIER_IN_CAPS`.

 - Type variable (parameter): `a`, ..., `z`.

 - Set: `set(T)` for a type `T`.

 - Sequence: `seq(T)` for a type `T`.

 - Tuple: `(T_1, T_2, ..., T_n)` for `n >= 2` types `T_1`, ..., `T_n`.

 - Record: `{ name_1: T_1, name_2: T_2, ..., name_n: T_n }`
    for `n >= 1` types `T_1`, ..., `T_n`.

 - Function: `T1 -> T2` for types `T1` and `T2`.

 - Operator: `(T_1, ..., T_n) => R` for `n >= 0` argument types `T_1, ..., T_n`
   and result type `R`.

 - Discriminated union:
    ```
       | { tag_name: string_1, <ident>: T_1_1, ..., <ident>: T_1_n_1}
       ...
       | { tag_name: string_k, <ident>: T_k_1, ..., <ident>: T_k_n_k}
    ```
    for `n >= 1` types `T_1_1`, ..., `T_k_n_k`.

 - Type in parentheses: `(T)` for a type `T`.


It is often convenient to declare a type alias. You can use `typedef` to define
an alias inside a module definition. For instance:

```
typedef STR_OPTION =
    | { type: "none" }
    | { type: "some", value: string }
```

Type aliases are written in CAPITAL LETTERS.

## Modes

*TLA+ does not make a clear distinction between constant expressions, state
expressions, actions, and temporal formulas. They are all written as logic
formulas. Such a distinction appears only in the discussion of TLA+ semantics,
when Leslie Lamport introduces levels of TLA+ formulas. We have found that the
lack of such a clear separation causes lots of confusion. To this end, we
introduce "modes", which are similar in spirit to TLA+ levels, but more
refined.*

We define the following modes:

 1. Stateless mode.
 1. State mode.
 1. Action mode.
 1. Property mode.
 1. Temporal mode.

Every TNT expression and definition is assigned a mode. In the following, we
will specify which modes are supported by certain operators and definitions.
The following table defines the subsumption rules on modes (the partial order
`<m`).  As a general rule, if an operator or a definition accepts an argument
of mode `M`, then it can also accept an argument of a less general mode `K <m
M`.

| More general mode | Less general modes         |
| ----------------- | -------------------------- |
| Stateless          | n/a                        |
| State             | Stateless                   |
| Action            | Stateless, State            |
| Property         | Stateless, State            |
| Temporal          | Stateless, State, Property |

As can be seen from the table, several modes cannot be compared via the order
`<m`: action mode cannot be compared to predicate mode and temporal mode. This
is intentional: We do not want to mix actions with predicates and temporal
properties.

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
  const N: int
  const Proc: Set(str)
```

*Grammar:*

```
  const <identifier> : <type>
```

*Mode:* Stateless

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
assume _ = Proc.cardinality > 0
```

*Mode:* Stateless

### Variable definition

Introduce a single variable (flexible variable in TLA+)

```
  var name: str
  var timer: int
  var is_armed: bool
```

*Grammar:*

```
  var <identifier> : <type>
```

*Mode:* State

### Operator definition

Introduce a user-defined operator. The order of definitions is not important.
The operator names should not clash with the names of other definitions in the
module scope. Importantly, there are **no recursive operators** (though you can
fold over a sequence or a set, see below).

```
// a constant operator
val Nodes: Set(int) = 1 to 10

// a two-argument operator that returns its first argument
def fst(x, y): (a, b) => a = x

// the maximum operator
def max(x, y) =
    if (x > y) x else y

// a higher-order operator that accepts another operator as its first argument
def F(G, x): (a => b, a) => b = G(x)

// an operator that is invisible outside the module
private def my_lte(x, y) = {
    x <= y
}
```


*Grammar:*

```
[private] (val | def | action | pred | temporal)
    <identifier>[(<identifier>, ..., <identifier>)] [':' <type>] = <expr>
```

*Mode:* The mode depends on the qualifier and the mode of the expression in the
right-hand side. The following table defines this precisely.

| Qualifier         | Mode of `expr`                       | Mode of definition |
| ----------------- | ------------------------------------ | ------------------ |
| `val` or `def`    | Stateless                             | Stateless           |
| `val` or `def`    | State                                | State              |
| `action`          | Action                               | Action             |
| `pred`            | Stateless, State, Property           | Property          |
| `temporal`        | Stateless, State, Property, Temporal | Temporal           |

### Recursive functions and operators

We've decided against having recursive operators and functions in the language.
The practical use cases can be expressed with `map`, `filter`, and `fold`.

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

### Type aliases

As discussed above, you can define a type alias, by following the grammar rule:

```
typedef <IDENTIFIER_IN_CAPS> = <type>
```

### Theorems

There are no theorems. You can write them in TLA+ and prove them with TLAPS.

# TNT expression syntax

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

## Braces and lambdas

Every expression can be wrapped with `{` and `}`. For instance:

```
  { 1 }
```

The braces `{` and `}` **do not introduce a set**. For the set notation,
see `set(...)` and `'{...}`.

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

## Three forms of operator applications

TNT is flexible with respect to operator applications. It mimics several call
styles that can be met in various languages. Given an operator called `f` and
expressions `e_1`, ..., `e_n`, the operator `f` can be applied to the
expressions `e_1`, ..., `e_n` as follows:

 - *TNT normal form*: `f(e_1, ..., e_n)`.
 - *Python-like dot form*: `e_1.f(e_2, ..., e_n)`
 - *Scala-like infix form*: `e_1 f e_2, ..., e_n`

Which form to choose? It's up to you. We prefer to combine all three, whatever
feels more natural in your circumstances. In the future, TNT will provide
automatic translation that will let you to freely switch between all three forms.

*The TNT normal form is especially convenient for programs, so they should
 communicate in this form. People may communicate in any form.*

For example, some people like to write Boolean expressions like this:

```
p or q and r
```

In the above case, you have to take care of operator priorities (see below).
When you use the dot form, you cannot get priorities wrong (calls via dot are
always left-associative if you wonder):

```
p.or(q.and(r))
```

Several operators have conventional names that stem from mathematics and thus
are not written as identifiers.  For instance, you can conveniently write `1 +
3` in the infix form.  But you cannot write `+(1, 3)` or `1.+(3)`, as that
would make the parser unnecessary complex. You can use the mnemonic name `add`
instead of `+` and thus write `iadd(1, 3)` or `1.iadd(3)`. A small number of
operators are exceptional in this sense. We list the alternative names when
introducing operators.  We don't expect humans to write expressions like the
ones above. This notation is more convenient for programs, so TNT tooling should
use the TNT normal form. 

Like in every programming language, several operators are special
in the sense that they have non-standard priorities. The good news is that
we keep the number of such operators to the bare minimum, in contrast to TLA+.
If you are using the infix form, it is good to know the operator priorities.
Here is the table of operator priorities, the ones in the top have the higher
priority:

| Operators                    | Comments                                   |
| ---------------------------- | ------------------------------------------ |
| `e_1.F(e_2, ..., e_n)`       | Call via dot has the highest priority      |
| `F(e_1, ..., e_n)`           | The normal form of operator application    |
| `f[e_1, ..., e_n]`           | Function application                       |
| `-i`                         | Unary minus                                |
| `i^j`                        | Integer power (right associative)          |
| `i * j`, `i / j`, `i % j`    | Integer multiplication, division, modulo   |
| `i + j`, `i - j`             | Integer addition and subtraction           |
| `e_1 F e_2, ..., e_n`        | General infix operator application         |
| `i > j`, `i < j`, `i >= j`, `i <= j`, `i != j`, `i == j`, `i = j`, `i <- j`, `S in T`, `S notin T`, `S subseteq T`  | Integer comparisons, equality, assignment, and set relations |
| `p and q`                    | Boolean 'and' (conjunction)                |
| `p or q`                     | Boolean 'or' (disjunction)                 |
| `p iff q`                    | Boolean equivalence (if and only if)       |
| `p implies q`                | Boolean implication: `not(p) or q`         |
| all forms with `(..)`, `{..}`, and `[..]` |  the lowest priority          |

## Boolean operators and equality

The following are the standard Boolean operators (higher priority first).

```scala
// equality: e1 = e2 in TLA+
e1 == e2
e1.eq(e2)
eq(e1, e2)
// inequality (same priority as '='): e1 /= e2, e1 # e2 in TLA+
e1 != e2
e1.neq(e2)
neq(e1, e2)
// logical not: ~p in TLA+
not(p)
p.not
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

Note that the operator `not(p)` needs parentheses around its argument.
Actually, `not` is treated as a general operator. We keep the number of special
syntax forms to minimum.

*Mode:* Stateless, State, Property, Temporal. 

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
The first occurrence of `|` right after `{` is optional, it's up to you.

This operator has the normal form too! It is written as `orBlock(p_1, ...,
p_n)`. Most likely, you will never use it, but the tools can.

*Mode:* Any.

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
The first occurrence of `&` right after `{` is optional, it's up to you.

This operator has the normal form too! It is written as `andBlock(p_1, ...,
p_n)`. Most likely, you will never use it, but the tools can.

*Mode:* Any.

## Flow operators

### IF-THEN-ELSE

We split `IF-THEN-ELSE` into two forms, each applicable in particular modes.
Note that we forbid `IF-THEN-ELSE` in the temporal mode. Instead, the users
should use logical connectives.

#### 1. Conditional

```scala
  p ? e1 : e2
```

This operator is translated to TLA+ as:

```tla
  IF p THEN e1 ELSE e2
```

The normal form of this operator is `cond(p, e1, e2)`.

*Mode:* Stateless, State, Property. Other modes are not allowed.

#### 2. Branching

```scala
  if (p) e1 else e2
```

This operator is translated to TLA+ as:

```tla
  IF p THEN e1 ELSE e2
```

The normal form of this operator is `ite(p, e1, e2)`.

*Mode:* Action.

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

The first occurrence of `|` right after `{` is optional, it's up to you.

Compare it to TLA+:

```tla
CASE
     p_1 -> e_1
  [] p_2 -> e_2
  ...
  [] p_n -> e_n
```

The normal form of the case operator without the default option is:

```
caseBlock(p_1, e_1, ..., p_n, e_n)
```

Note that this operator simply has `2*n` arguments. We do not group the guards
and effect expressions into pairs. The normal form is meant for the tools.

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

The normal form of the case operators with the default option is:

```
caseBlock(p_1, e_1, ..., p_n, e_n, e)
```

Note that this operator simply has `2*n + 1` arguments. We do not group the
guards and effect expressions into pairs. The normal form is meant for the
tools.

*Mode:* Stateless, State. Other modes are not allowed.

## Sets

### Set constructor

One way to construct a set is by enumerating its elements:

```scala
// or you can use the python-style constructor
set(e_1, ..., e_n)
```

This is exactly as `{ e_1, ..., e_n }` in TLA+. However, we prefer not to
sacrifice `{...}` for this only operator. That is why a set is constructed with
`set(...)` in TNT. In practice, this operator does not appear too often, so our
notation would not distract you too much.

*Mode:* Stateless, State. Other modes are not allowed.

**Discussion.** The earlier versions contained an alternative syntax `'{ e_1,
..., e_n }`. After receiving the feedback, we have left just one constructor.

### Existential quantifier and non-deterministic choice

We introduce two operators that are semantically equivalent to `\E x \in S: P`
of TLA+:

```scala
S exists { x -> P }
S.exists( x -> P )
exists(S, { x -> P } )
S guess  { x -> P }
S.guess( x -> P )
guess(S, { x -> P })
```

*The intended difference between `exists` and `guess` is that evaluation of
`exists` can be thought of as being deterministic, whereas `guess` can be
thought of as being evaluated non-deterministically. TNT encourages the users
to scope the side effects in `guess`, e.g., as `x <- e` and `next(x)`, whereas
reasoning about the next state should not happen in `exists`. This is why
we define the modes as below.*

*Mode:* The modes of `exists` and `guess` are defined in the following table:

| Operator          | Mode of `P`                            | Output mode |
| ----------------- | -------------------------------------- | ----------- |
| `exists`          | Stateless, State, Property, Temporal   | Mode of `P` |
| `guess`           | Action                                 | Action      |

### Other set operators

The other operators are introduced and explained in code directly.

```scala
// \A x \in S: P
S forall { x -> P }
S.forall( x -> P )
forall(S, { x -> P })
// set membership: e \in S
e in S
e.in(S)
in(e, S)
S contains e
S.contains(e)
contains(S, e)
// set non-membership: e \notin S
e notin S
e.notin(S)
notin(e, S)
// union: S \union T
S union T
S.union(T)
union(S, T)
// intersection: S \intersect T
S intersect T
S.intersect(T)
intersect(S, T)
// difference: S \ T
S difference T
S.difference(T)
difference(S, T)
// S is a subset of T (proper or not): S \subseteq T
S subseteq T
S.subseteq(T)
subseteq(S, T)
// set comprehension (map): { e: x \in S }
S map { x -> e }
S.map( x -> e )
map(S, { x -> e })
// set comprehension (filter): { x \in S: P }
S filter { x -> P }
S.filter( x -> P )
filter(S, { x -> P })
// set folding: you can write such a recursive operator in TLA+
S fold init, { (v, x) -> e }
S.fold(init, { (v, x) -> e })
fold(S, init, { (v, x) -> e })
// SUBSET S
S powerset
S.powerset
powerset(S)
// UNION S
S flatten
S.flatten
flatten(S)
// Seq(S) of the module Sequences
S seqs
S.seqs
seqs(S)
// CHOOSE x \in S: TRUE
// The operator name is deliberately made long, so it would not be the user's default choice.
S choose_some
S.choose_some
// There is no special syntax for CHOOSE x \in S: P
// Instead, you can filter a set and then pick an element of it.
S.filter(x -> P).choose_some
```

These operators are defined in the module `FiniteSets` in TLA+. TNT has these
two operators in the kernel:

```scala
// IsFiniteSet(S)
S isFinite
S.isFinite
isFinite(S)
// Cardinality(S)
S cardinality
S.cardinality
cardinality(S)
```

*Mode:* Stateless, State. Other modes are not allowed.

## Functions aka Maps

```scala
// function application: f[e]
f[e]
f.get(e)
get(f, e)
// function domain: DOMAIN f
f keys
f.keys
keys(f)
// function constructor: [ x \in S |-> e ]
S mapOf { x -> e }
S.mapOf(x -> e)
mapOf(S, { x -> e })
// a set of functions: [ S -> T ]
S setOfMaps T
S.setOfMaps(T)
setOfMaps(S, T)
// [f EXCEPT ![e1] = e2]
f update e1, e2
f.update(e1, e2)
update(f, e1, e2)
// [f EXCEPT ![e1] = e2, ![e3] = e4]
(f update e1, e2) update e3, e4
// [f EXCEPT ![e1] = @ + y]
f updateAs e1, { old -> old + y }
f.updateAs(e1, { old -> old + y })
updateAs(f, e1, { old -> old + y })
// an equivalent of (k :> v) @@ f when using the module TLC
f put e1, e2
f.put(e1, e2)
put(e1, e2)
```

*Mode:* Stateless, State. Other modes are not allowed.

## Records

```scala
// record constructor: [ f_1 |-> e_1, ..., f_n |-> e_n ]
// Warning: n >= 1
{ f_1: e_1, ..., f_n: e_n }
// set of records: [ f_1: S_1, ..., f_n: S_n ]
[ f_1 in S_1, ..., f_n in S_n ]
// access a record field: r.h
r.h
r h
// the set of record fields: DOMAIN r
r.fields
r fields
fields(r)
// record update: [r EXCEPT !.f = e]
r with f, e
r.with(f, e)
with(r, f, e)
```

Note that we are using the syntax `{ name_1: value_1, ..., name_n: value_n }`
for records, similar to Python and JavaScript, whereas we are using the syntax
`[ name_1 in set_1, ..., name_k in set_k ]` for sets of records. We make these two
kinds of expressions visually different, so the users do not confuse one
with another by mistake. Moreover, as sets of records are used less often than
records, typing a set of records requires a bit more effort.

*Mode:* Stateless, State. Other modes are not allowed.

## Tuples

In contrast to TLA+, TNT tuples have length of at least 2.
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
S_1 cross S_2
S_1.cross(S_2)
cross(S_1, S_2)
// S_1 \X S_2 \X ... \X S_n
(S_1, S_2, ..., S_n).ncross
ncross(S_1, S_2, ..., S_n)
```

*The use of the operator `x <- e` in the above operators is strongly discouraged.*

What about `DOMAIN t` on tuples? We don't think it makes sense to have it.

What about `[ t EXCEPT ![i] = e ]`? Just define a new tuple that contains
the new field.

*Mode:* Stateless, State. Other modes are not allowed.

## Sequences aka Lists

In contrast to TLA+, there is no special module for sequences. They are built
in the kernel of TNT. A parser can compute, whether operators on sequences are
used in the spec.

```scala
// sequence constructor: <<e_1, ..., e_n>> (which is also a tuple in TLA+)
[ e_1, ..., e_n ]
// append at the sequence tail: Append(s, e)
s append e
s.append(e)
append(s, e)
// concatenate sequences: s \circ t
s concat t
s.concat(t)
concat(s, t)
// sequence head: Head(s)
s head
s.head
head(s)
// sequence tail: Tail(s)
s tail
s.tail
tail(s)
// sequence length: Len(s)
s length
s.length
length(s)
// sequence element at nth position (starting with 1): equivalent to s[i] in TLA+
s nth i
s.nth(i)
nth(s, i)
// the set of sequence indices (starting with 1): DOMAIN s
s indices
s.indices
indices(s)
// SubSeq(s, j, k)
s slice j k
s.slice(j, k)
slice(s, j, k)
// SelectSeq(s, Test)
s select Test
select(s, Test)
// in particular, we can use anonymous operators
s select { e -> P }
// Left fold. There is no standard operator for that in TLA+,
// but you can define it with a recursive operator.
s foldl init { (i, v) -> e }
s.foldl(init, { (i, v) -> e })
foldl(s, init, { (i, v) -> e })
// Right fold. There is no standard operator for that in TLA+,
// but you can define it with a recursive operator.
s foldr init { (i, v) -> e }
s.foldr(init, { (i, v) -> e })
foldr(s, init, { (i, v) -> e })
```

*Mode:* Stateless, State. Other modes are not allowed.

## Integers

In contrast to TLA+, there is no special module for integers. They are built in
the kernel of TNT. The module `Naturals` does not exist either. A parser can
compute, whether integer operators are used in the spec.

Moreover, there is no module `Reals`. If you really need `Reals`, most likely,
you should switch directly to TLA+.

```scala
// like m + n in TLA+
m + n
m.iadd(n)
iadd(m, n)
// like m - n in TLA+
m - n
m.isub(n)
isub(m, n)
// like -m in TLA+
-m
iuminus(m)
m.uminus
// like m * n in TLA+
m * n
m.imul(n)
imul(m, n)
// integer division, lik m \div n in TLA+
m / n
m.idiv(n)
idiv(m, n)
// like m % n in TLA+
m % n
m.imod(n)
imod(m, n)
// like m^n in TLA+
m^n
m.ipow(n)
ipow(m, n)
// like m < n in TLA+
m < n
m.ilt(n)
ilt(m, n)
// like m > n in TLA+
m > n
m.igt(n)
igt(m, n)
// like m <= n in TLA+
m <= n
m.ilte(n)
ilte(m, n)
// like m >= n in TLA+
m >= n
m.igte(n)
igte(m, n)
// like Int and Nat in TLA+
Int
Nat
// like m..n in TLA+
m to n
m.to(n)
to(m, n)
```

*Mode:* Stateless, State. Other modes are not allowed.

## Nested operators

There is not much to say here. They are almost identical to the top-level
operators, except that they are always private.

*Examples:*

```scala
def double(x) =
  // a nested operator
  def plus(a, b) = a + b

  plus(x, x)

def pow4(x) =
  // a nested constant
  val x2 = x * x

  x2 * x2

temporal my_prop =
  // a nested temporal formula
  temporal A = eventually(x > 3)
  // a nested temporal formula
  temporal B = always(eventually(y = 0))

  A implies B
```

*Grammar:*

```
(val | def | pred | action | temporal)
  <identifier>[(<identifier>, ..., <identifier>)] [':' <type>] = <expr>
<expr>
```

*Mode:* The modes are defined as in the case of the top-level operators.  As
expected, the mode of an inner operator should not be more general then the
mode of the outer operator.

## Operators on actions

### Delayed assignment

This operator is carefully avoided in TLA+. TNT allows you to assign a value to
the state variable `x` in a next state:

```scala
x <- e
assign(x, e)
x.assign(e)
```

The operator `x <- e` is equivalent to `x' = e` of TLA+ under specific
conditions. In contrast to the assignments in programming languages, TNT
assignment is delayed by one step. It only becomes effective in a successor
state of the state that is being evaluated. The arrow notation `<-` is meant to
warn the user that the value `e` is "sent" to `x`, and it will only arrive at
`x` in a next state. Hence, in the following expression, expression `x + 1` may
evaluate to a value that is different from 5:

```
{ x <- 4 & x + 1 > 0 }
```


*Every state variable `x` must be assigned exactly once in every step:
Either via `x <- e`, or via `unchanged(x)` (see below).*

**Discussion.** TLA+ does not have a notion of assignment. Instead, one simply
writes an equality `x' = e`. In general, one can write an arbitrary predicate
over `x'`. We find it hard to reason about such pure equalities, which may
occur in multiple places. Hence, we introduce assignments. However, our
assignments are slightly different from assignments in imperative (stack-based)
languages. For this reason, we avoid the standard tokens such as `=` and `:=`
that usually denote an instantaneous update. (Though such updates are not
always instantaneous in modern architectures). Otherwise, it is too tempting to
use `x` in the hope of accessing `e`. Instead, we use notation `x <- e`,
similar to sending over a channel in Golang.

*Mode.* Action. Other modes are not allowed.

### Unchanged (removed)

For a state variable `x`, the following expression is like `UNCHANGED x` of
TLA+:

```scala
unchanged(x)
x.unchanged
```

In a more general case, you can write `unchanged(t)` for a tuple `t` that
contains names of state variables; tuples may be nested.

**Discussion.** After introducing modes, we have realized that it became
easy to identify assignments in actions. This allows us to remove `UNCHANGED`,
which causes much confusion among beginners.

### Stutter

The following operator is similar to `[A]_x` of TLA+:

```scala
stutter(A, x)
A.stutter(x)
```

The arguments to `stutter` are as follows:

 - `A` is an expression in the Action mode,
 - `x` is a variable or a tuple of variables.

*Mode:* Temporal. This operator converts an action (in the Action mode) to a
temporal property.

### Nostutter

The following operator is similar to `<A>_x` of TLA+:

```scala
nostutter(A, x)
A.nostutter(x)
```

The arguments to `nostutter` are as follows:

 - `A` is an expression in the Action mode,
 - `x` is a variable or a tuple of variables.

*Mode:* Temporal. This operator converts an action (in the Action mode) to a
temporal property.

### Next

Similar to the operator "prime" of TLA+, we introduce the operator `next`:

```scala
next(e)
e.next
```

Expression `next(e)` is equivalent to `e'` of TLA+. More precisely, if `f` is
the translation of a TNT expression `e` to TLA+, then `f'` is the translation
of `e'` to TLA+. In contrast to TLA+, we restrict `next` to the modes: Property
and Temporal. Hence, we cannot use `next` in actions.

*Mode:* Property, Temporal.

### Enabled

This operator is written as follows:

```scala
enabled(A)
A.enabled
```

Similar to the operator `ENABLED` of TLA+, the operator `enabled` is a very special
operator. It accepts an expression~`A` in the Action mode, and `enabled(A)` is
an expression in the Temporal mode.

Expression `enabled(A)` is equivalent to `ENABLED A` of TLA+. More precisely,
if `B` is the translation of a TNT expression `A` to TLA+, then `ENABLED B` is
the translation of `enabled(A)` to TLA+.

*Mode:* Temporal. The argument `A` must be in the Action mode.

### Fairness

This is equivalent to `WF_e(A)` of TLA+:

```scala
weakFair(A, e)
A.weakFair(e)
```

This is equivalent to `SF_e(A)` of TLA+:

```scala
strongFair(A, e)
A.strongFair(e)
```

The second argument `e` is either a name, or a tuple of names, as in
`unchanged`.

*Mode:* Temporal. The argument `A` must be in the Action mode.

### Other action operators of TLA+

There is no equivalent of the composition operators `A \cdot B`. It is no
supported by TLC, so the chance that you will needed is very low. We can add
it later, if you have a use-case for it.

## Temporal operators

### Always

This is equivalent to `[] P` of TLA+:

```scala
always(P)
P.always
```

*Mode:* Temporal.

### Eventually

This is equivalent to `<> P` of TLA+:

```scala
eventually(P)
P.eventually
```

*Mode:* Temporal.

### Other temporal operators

We omit `P \leadsto Q`, as it can be written as:

```scala
always(P implies eventually(Q))
```

TLA+ contains an interesting operator "guarantees", that is written as `P -+-> Q`.
For completeness, we introduce its syntactic version in TNT:

```
guarantees(P, Q)
P.guarantees(Q)
```

The operators `\EE` and `\AA` are almost never used, so there are no
equivalents in TNT. If you have reached this level, you should (automatically)
translate your TNT spec into TLA+ and use your tools, e.g., TLAPS.

## Unbounded quantifiers

TLA+ has three operators that bind a variable without providing a set:

```tla
\E x: P
\A x: P
CHOOSE x: P
```

These operators are supported neither by TLC, nor by Apalache. So the chance
that you will use them is very low. However, for the sake of completeness we
introduce their counterparts in TNT:

```
exists_const(x -> P)
forall_const(x -> P)
choose_const(x -> P)
```

We add the suffix "const" to the operator names to stress the fact that these
operators quantify over the constants of the first-order universe.

*Mode:* Stateless, State, Property, Temporal. No Action mode.

