# Summary of TNT

*TNT is not TLA+*

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

Types are optional. If you want just to run TLC, it might be enough to leave
the types unspecified. If you want to use Apalache or other advanced tools,
you will need types.


### Untyped signatures

It should be always possible to omit the type of a constant or a state variable
`x` by writing the type annotation `x : _`. In this case, neither the parser,
nor the type checker should complain about the type of `x`. The transpiler will
translate the expressions over `x` to TLA+ as is, possibly producing ill-typed
expressions.

Similar to TLA+, when you define a higher-order operator, you have to specify the
signature. For example:

```
def pick3(pick2, x, y z): (((_, _) => _), _, _, _) => _ = {
    pick2(pick2(x, y), z)
}
```

That looks a bit confusing, right? If you really want to ignore types at all,
that's what you do. Alternatively, you could write a parametric type in Type
System 1.2 (below). For comparison, we give an example right here:

```
def pick3(pick2, x, y z): (((a, a) => b), a, a, a) => b = {
    pick2(pick2(x, y), z)
}
```

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
assume _ = Proc.cardinality > 0
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
private def my_lte(x, y) = {
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
instead of `+` and thus write `add(1, 3)` or `1.add(3)`. A small number of
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
| `i > j`, `i < j`, `i >= j`, `i <= j`, `i != j`, `i == j`, `i = j`, `i := j`, `S in T`, `S notin T`, `S subseteq T`  | Integer comparisons, equality, assignment, and set relations |
| `p and q`                    | Boolean 'and' (conjunction)                |
| `p or q`                     | Boolean 'or' (disjunction)                 |
| `p iff q`                    | Boolean equivalence (if and only if)       |
| `p implies q`                | Boolean implication: `not(p) or q`         |
| all forms with `(..)`, `{..}`, and `[..]` |  the lowest priority          |

## Boolean operators and equality

The following are the standard Boolean operators (higher priority first).

```scala
// equality: e1 = e2 in TLA+
e1 = e2
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

*The use of the operator `x := e` in the above operators is strongly discouraged.*

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
The first occurence of `|` right after `{` is optional, it's up to you.

*We encourage you to use the operator `x := e` in a multiline disjunction.*

This operator has the normal form too! It is written as `orBlock(p_1, ...,
p_n)`. Most likely, you will never use it, but the tools can.

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
The first occurence of `&` right after `{` is optional, it's up to you.

*We encourage you to use the operator `x := e` in a multiline conjunction.*

This operator has the normal form too! It is written as `andBlock(p_1, ...,
p_n)`. Most likely, you will never use it, but the tools can.

## Flow operators

### Branching

```scala
  if (p) e1 else e2
```

Compare it to TLA+:

```tla
  IF p THEN e1 ELSE e2
```

*The use of the operator `x := e` in if-else is strongly discouraged.*

The normal form of this operator is `ite(p, e1, e2)`.

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

The first occurence of `|` right after `{` is optional, it's up to you.

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

*The use of the operator `x := e` in case is strongly discouraged.*

The normal form of the case operators with the default option is:

```
caseBlock(p_1, e_1, ..., p_n, e_n, e)
```

Note that this operator simply has `2*n + 1` arguments. We do not group the
guards and effect expressions into pairs. The normal form is meant for the
tools.

## Sets

### Set constructor

One way to construct a set is by enumerating its elements:

```scala
// you can use either the special notation
'{ e_1, ..., e_n }
// or you can use the python-style constructor
set(e_1, ..., e_n)
```

This is exactly as `{ e_1, ..., e_n }` in TLA+. However, we prefer not to
sacrifice `{...}` for this only operator. That is why a set is constructed with
`'{...}` or `set(...)` in TNT. In practice, this operator does not appear too
often, so our notation would not distract you too much.

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
to scope the side effects in `guess`, e.g., as `x := e` and `next(x)`, whereas
reasoning about the next state should not happen in `exists`.*

Hence, the difference between `guess` and `choose` is purely syntactic, not
semantic.

### Other set operators

The other operators are introduced and explained in code directly. *The use
of `x := e` in the following operators is strongly discouraged.*

```scala
// \A x \in S: P
S forall { x -> P }
S.forall( x -> P )
forall(S, { x -> P })
// CHOOSE x \in S: P
S choose { x -> P }
S.choose( x -> P )
choose(S, { x -> P })
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

## Functions

```scala
// function application: f[e]
f[e]
f.of(e)
of(f, e)
// function domain: DOMAIN f
f domain
f.domain
domain(f)
// function constructor: [ x \in S |-> e ]
S mkFun { x -> e }
S.mkFun(x -> e)
mkFun(S, { x -> e })
// Define a recursive function. This is equivalent to the following TLA+ code
// LET f[x \in S] == e IN f
S mkRecFun { x -> e }
S.mkRecFun(x -> e)
mkRecFun(S, { x -> e })
// a set of functions: [ S -> T ]
S mkFunSet T
S.mkFunSet(T)
mkFunSet(S, T)
// [f EXCEPT ![e1] = e2]
f except e1, e2
f.except(e1, e2)
except(f, e1, e2)
// [f EXCEPT ![e1] = e2, ![e3] = e4]
(f except e1, e2) except e3, e4
// [f EXCEPT ![e1] = @ + y]
f exceptAt e1, { old -> old + y }
f.exceptAt(e1, { old -> old + y })
exceptAt(f, e1, { old -> old + y })
```

*The use of the operator `x := e` in the above operators is strongly discouraged.*

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
// the set of record keys: DOMAIN r
r.keys
r keys
keys(r)
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

*The use of the operator `x := e` in the above operators is strongly discouraged.*

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

*The use of the operator `x := e` in the above operators is strongly discouraged.*

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

*The use of the operator `x := e` in the above operators is strongly discouraged.*

## Integers

In contrast to TLA+, there is no special module for integers. They are built in
the kernel of TNT. The module `Naturals` does not exist either. A parser can
compute, whether integer operators are used in the spec.

Moreover, there is no module `Reals`. If you really need `Reals`, most likely,
you should switch directly to TLA+.

```scala
// like m + n in TLA+
m + n
m.add(n)
add(m, n)
// like m - n in TLA+
m - n
m.sub(n)
sub(m, n)
// like -m in TLA+
-m
uminus(m)
m.uminus
// like m * n in TLA+
m * n
m.mul(n)
mul(m, n)
// integer division, lik m \div n in TLA+
m / n
m.div(n)
div(m, n)
// like m % n in TLA+
m % n
m.mod(n)
mod(m, n)
// like m^n in TLA+
m^n
m.pow(n)
pow(m, n)
// like m < n in TLA+
m < n
m.lt(n)
lt(m, n)
// like m > n in TLA+
m > n
m.gt(n)
gt(m, n)
// like m <= n in TLA+
m <= n
m.lte(n)
lte(m, n)
// like m >= n in TLA+
m >= n
m.gte(n)
gte(m, n)
// like Int and Nat in TLA+
Int
Nat
// like m..n in TLA+
m to n
m.to(n)
to(m, n)
```

*The use of the operator `x := e` in the above operators is strongly discouraged.*

## Nested operators

There is not much to say here. They are almost identical to the top-level
operators, except that they are always private.

*Examples:*

```scala
def double(x) =
  // a nested operator
  def plus(a, b) = a + b

  plus(x, x)

def plus_inductive(x, y) =
  // a nested recursive operator. You don't have to add numbers like this though.
  def rec nat_plus(a, b) =
    if (b <= 0) a else 1 + nat_plus(a, b - 1)

  nat_plus(x, y)

def pow4(x) =
  // a nested
  val x2 = x * x

  x2 * x2

temporal my_prop =
  temporal A = eventually(x > 3)
  temporal B = always(eventually(y = 0))

  A implies B
```

*Grammar:*

```
(val | def | def rec | pred | action | temporal)
  <identifier>[(<identifier>, ..., <identifier>)] [':' <type>] = <expr>
<expr>
```

## Action operators

### Single static assignment

This operator is carefully avoided in TLA+. TNT allows you to assign a value to
the state variable `x` in a next state.

```scala
x := e
assign(x, e)
x.assign(e)
```

This operator is equivalent to `x' = e` of TLA+ under specific conditions.

*Every state variable `x` must be assigned exactly once in every step:
Either via `x := e`, or via `unchanged(x)` (see below).*

### Unchanged

For a state variable `x`, the following expression is like `UNCHANGED x`:

```scala
unchanged(x)
x.unchanged
```

In a more general case, you can write `unchanged(t)` for a tuple `t` that
contains names of state variables; tuples can be nested.

### Stutter and nostutter

The following operator is similar to `[A]_x`:

```scala
stutter(A, x)
A.stutter(x)
```

The following operator is similar to `<A>_x`:

```scala
nostutter(A, x)
A.nostutter(x)
```

As in case of `unchanged`, you can pass a tuple of names.

### Primes

Explicit use of primes in actions is discouraged in TNT. You should use `:=`
and `unchanged`, wherever possible. However, we have added primes to the
language for completeness. Otherwise, we would not be able to translate TLA+ to
TNT and back. The operator prime is written as follows:

```scala
next(e)
e.next
```

It is equivalent to `e'` of TLA+. More precisely, if `f` is the translation of
a TNT expression `e` to TLA+, then `f'` is the translation of `e'` to TLA+.

### Enabled

Explicit use of `enabled` in actions is discouraged in TNT. However, we have added
this operator to the language for completeness. Otherwise, we would not be able to
translate TLA+ to TNT. This operator is written as follows:

```scala
enabled(A)
A.enabled
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
A.always
```

### Eventually

This is equivalent to `<>A` of TLA+:

```scala
eventually(A)
A.eventually
```

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

### Other temporal operators

We omit `A \leadsto B`, as it can be written as:

```scala
always(A implies eventually(B))
```

TLA+ contains an interesting operator "guarantees", that is written as `A -+-> B`.
For completeness, we introduce its syntactic version in TNT:

```
guarantees(A, B)
A.guarantees(B)
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

