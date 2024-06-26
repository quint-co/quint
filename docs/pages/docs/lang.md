# Summary of Quint

| Revision | Date       | Author                                                  |
|:---------|:-----------|:--------------------------------------------------------|
| 36       | 26.06.2024 | Igor Konnov, Shon Feder, Jure Kukovec, Gabriela Moreira, Thomas Pani |

This document presents language constructs in the same order as the [summary of
TLA+](https://lamport.azurewebsites.net/tla/summary.pdf). Although we keep it
up-to-date, this document originated Quint and precedes it's implementation. It
includes a lot of references to TLA+, the language which served as the basis of
quint, semantically.

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
inequality, and they can be stored in sets, maps, lists, tuples, and
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

<a name="types"></a>

## Types

Quint is a typed language. All variables and constants must be assigned a type.
Other definitions may be annotated with types. If the type checker is able to
infer the type of a definition, then its type may be omitted.

**Discussion.** In the earlier versions of Quint, we allowed the user to omit
types altogether. In retrospect, we find this to be a bad idea. Hence, we
require that every definition is either type-annotated (variables and
constants), or can be assigned a type via type checking (operators and
expressions).

### Type System 1.2

This is the same type system as in Apalache:

A type is one of the following:

- Basic type: `bool`, `int`, `str`.

- Uninterpreted type or type name: `IDENTIFIER_IN_CAPS`.

- Type variable (parameter): `a`, ..., `z`.

- Set: `Set[T]` for a type `T`.

- List: `List[T]` for a type `T`.

- Tuple: `(T_1, T_2, ..., T_n)` for `n >= 2` types `T_1`, ..., `T_n`.

- Record: `{ name_1: T_1, name_2: T_2, ..., name_n: T_n }`
  for `n >= 1` types `T_1`, ..., `T_n`.

- Function: `T1 -> T2` for types `T1` and `T2`.

- Operator: `(T_1, ..., T_n) => R` for `n >= 0` argument types `T_1, ..., T_n`
  and result type `R`.

- Sum Types: `type T = L_1(T_1) | ... | L_n(T_n) ` for `n >= 1`, argument types
  `T_1`, ..., `T_n`, and a type alais `T`.

- Type in parentheses: `(T)` for a type `T`.

- An instance of a defined polymorphic type `T[T_1, ..., T_n]` for a defined type
  constructor with type parameters `T[p_1, ..., p_n]` and types `T_1, ...,
  T_n`.

It is often convenient to declare a type alias. You can use `type` to define
an alias inside a module definition. For instance:

```quint
type Temperature = int
```

A type alias specified with type parameters defines a polymorphic type
constructor for instances of the defined type. For instance, given

```quint
type Option[a] =
  | Some(a)
  | None
```

You can then construct concrete types such as `Option[int]` or
`Option[List[int]]`.

A type identifier can also introduce an uninterpreted type by defining a type without any constructors for values of that type:

```quint
type MY_TYPE
```

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
 1. Non-determinism mode.
 1. Action mode.
 1. Run mode.
 1. Temporal mode.

Every Quint expression and definition is assigned a mode. In the following, we
will specify which modes are supported by certain operators and definitions.
The following table defines the subsumption rules on modes (the partial order
`<m`).  As a general rule, if an operator or a definition accepts an argument
of mode `M`, then it can also accept an argument of a less general mode `K <m
M`.

| More general mode | Less general modes         |
| ----------------- | -------------------------- |
| Stateless         | n/a                        |
| State             | Stateless                  |
| Non-determinism   | Stateless, State                    |
| Action            | Stateless, State           |
| Run               | Stateless, State, Action   |
| Action            | Non-determinism, Stateless, State   |
| Temporal          | Stateless, State           |

As can be seen from the table, action mode and temporal mode are incomparable.
This is intentional: We do not want to mix actions with temporal formulas.

## Module-level constructs

### Module definition

A module definition is introduced like follows:

```quint
// module definition
module Foo {
  // declarations
}
```

*Grammar:*

```bnf
"module" <identifier> "{"
  <definitions>
"}"
```

A single file *should* contain one top-level module, though there is no limit on
the number of top-level modules that can be included in a file. Modules cannot
be nested.  To ease module lookup, the name of the top-level module *should*
match the file name. For example, a file `Orange.qnt` should contain `module
Orange { ... }`.  This is not a strict requirement. You have to follow it only,
if you are using multiple modules in a file.

There is a way to instantiate modules with different parameters, see
[Instances](#instances).

### Constant declarations

Introduce a single constant parameter (rigid variable in TLA+)

```
  const N: int
  const Proc: Set[str]
```

*Grammar:*

```bnf
  "const" <identifier> ":" <type>
```

*Mode:* Stateless

### Assumptions

Given a constant predicate `P` and a name, we can write an assumption `P` over the
constants that is associated with this name.

*Example*:

```
assume AtLeast4 = N >= 4
```

This is exactly the same as the following assumption in TLA+:

```tla
ASSUME AtLeast4 == N >= 4
```

*Grammar:*

```bnf
"assume" <identifier> "=" <expr>
```

Similar to TLA+, you can have an anonymous assumption, by simply using `_` for
the name:

```tla
assume _ = Proc.size() > 0
```

*Mode:* Stateless

### Variable definitions

Introduce a single variable (flexible variable in TLA+)

```
  var name: str
  var timer: int
  var isArmed: bool
```

*Grammar:*

```bnf
  "var" <identifier> ":" <type>
```

*Mode:* State

### Operator definitions

Introduce a user-defined operator. The order of definitions is not important.
The operator names should not clash with the names of other definitions in the
module scope. Importantly, there are **no recursive operators** (though you can
fold over a list or a set, see below).

```quint
// a static constant value, which is not changing over time
pure val Nodes: Set[int] = 1 to 10

// a two-argument operator that returns its first argument, independent of state
pure def fst(x: a, y: b): a =
    x

// the maximum operator
pure def max(x: int, y: int): int =
    if (x > y) x else y

// A definition over `x` that returns a Boolean result.
// In logic, such definition is usually called a predicate.
pure def isPositive(x: int): bool =
    x > 0

// a higher-order operator that accepts another operator as its first argument
pure def F(G: a => b, x: a): b = G(x)

// introduce a variable to define stateful definitions
var timer: int

// a value that depends on the state (the variable timer) and may change over time
val isTimerPositive =
    timer >= 0

// an operator definition that depends on the state and may change over time
def hasExpired(timestamp: int) =
    timer >= timestamp

// an initialization action that assigns initial values to the state variables
action init =
  timer' = 0

// an action that updates the value of the state variable timer
action advance(unit: int) =
    // a delayed assignment (see below in the manual)
    timer' = timer + unit

// a temporal formula that ensures that the timer variable never goes negative
temporal neverNegative =
    always(timer >= 0)
```


*Grammar:*

```bnf
("val" | "def" | "pure" "val" | "pure" "def" | "action" | "temporal")
    <identifier>["(" <identifier> [":" <type>] ("," ..."," <identifier> [":" <type>])* ")"] [":" <type>]
      "=" <expr> [";"]
```

*Mode:* The mode depends on the mode of the expression in the right-hand side.
The following table defines this precisely.

| Qualifier              | Mode of `expr`                       | Mode of definition |
| --------------------   | ------------------------------------ | ------------------ |
| `pure val`, `pure def` | Stateless                            | Stateless          |
| `val`, `def`           | State                                | State              |
| `action`               | Action                               | Action             |
| `temporal`             | Stateless, State, Temporal           | Temporal           |

### No recursive functions and operators

We've decided against having recursive operators and functions in the language.
The practical use cases can be expressed with `map`, `filter`, `fold`, and `foldl`.

### Module instances

Similar to `INSTANCE` in TLA+, we can define module instances.

*Example:*

```scala
// An instance of Voting:
//  - It copies all definitions of Voting into a new namespace V
//  - It replaces Value with Set(0, 1)
import Voting(Value = Set(0, 1)) as V

// the names of V are accessed via "::"
val MyValues = V::Value
```

*Grammar*:
```bnf
"import"
  <identifier> "("
    [<identifier> "=" <identifier> ("," <identifier> "=" <identifier>)*] ["," "*"] ["as" <identifier>] ["from" <string>]
  ")"
```

This is an advanced topic. For details, see [Instances](#instances).

*We do not allow for parameterized instances. They are only needed for reasoning
about variable hiding and refinement proofs. In this case, you would be better
off with TLA+ and TLAPS.*


### Type aliases

As discussed above, you can define a type alias, by following the grammar rule:

```bnf
"type" <IDENTIFIER_IN_CAPS> "=" <type>
```

**Discussion:** We could introduce type aliases at any level. Hence, we can
move them to the expression syntax.

### Theorems

There are no theorems. You can write them in TLA+ and prove them with TLAPS.


### Imports

See [Namespaces and imports](#namespaces).

<a name="namespaces"></a>

## Namespaces and imports

The topic of modules, namespaces, and instances is extremely obfuscated in
TLA+, for no obvious reason. In Quint, we follow a simple approach that should not
surprise anyone, who knows modern programming languages.

We are using Quint expressions in the examples in this section. It is probably a
good idea to skip this section on the first read and read about [Quint expression
syntax](#expressions) first.

### Namespaces

Every module has a namespace associated with it. Consider the example:

```scala
module Foo {
  const N: int
  var x: int

  action Init =
    x' = 0

  action Next =
    x' = x + N
}
```

In our example, module `Foo` has four names in its namespace: `N`, `x`,
`Init`, and `Next`.

Quint does not allow for nested modules. However, you can mimick nested
namespaces by using `::`. For example:

```quint
module Top {
  var x: int

  def xPlus(z) = x + z

  val Inner::x2 = x + x

  val inv = (Inner::x2 - x == x)
}
```

Note that in the above example, `Inner::x2` is treated as a qualified identifier, that is, it consists of the prefix `Inner` and the name `x2`.

Shadowing names is allowed. For example:

```quint
module OS {
  var clock: int

  def increase(clock: int) = clock + 1
}
```

PS: Let us know if you are bothered by this. We are considering making it a togglable feature.

*No order.* In contrast to TLA+, namespaces are not ordered. It is perfectly
fine to write out-of-order definitions, like in many programming languages:

```quint
module outOfOrder {
  def positive(x) = max(x, 0)

  def max(x, y) = if (x > y) x else y
}
```

As a specification author, you and your peers have to decide on your style,
whereas your text editor should help you in finding definitions.
Quint is not Fashion Police.

### Imports

Similar to mainstream programming languages, Quint supports name imports:

```quint
module Math {
  def sqr(x) = x * x
  def pow(x, y) = x^y
}

module Imports {
  // import 'pow' from Math
  import Math.pow

  def cube(x) = pow(x, 3)
}
```

In the above example, the name `pow` is imported in the scope of the module
`Imports`. As a result, definitions in `Imports` may refer to `pow`. As you
would expect, imports are not allowed to introduce name collisions.

To avoid writing too many import statements, you can use `*`. For example:

```quint
module Math {
  def sqr(x) = x * x
  def pow(x, y) = x^y
}

module ImportAll {
  // import all names from Math
  import Math.*

  // access 'pow' and 'sqr' of Math
  def poly(x) = pow(x, 3) + sqr(x) + x
}
```

*No re-export by default.* It is important to know that `import` does not automatically introduce any definitions in the module that uses `import`. Hence, the following example produces a lookup error:

```quint
module A {
  pure val greeting = "hello"
}

module B {
  import A.*
}

module C {
  import B.*

  def greet(name) = [ greeting, name ]
}
```

Quint reports an error on the above specification:

```
error: [QNT404] Name 'greeting' not found
12:   def greet(name) = [ greeting, name ]
                          ^^^^^^^^
```

Hence, `import A.*` in the module `B` is working similar to `LOCAL INSTANCE
English` of TLA+.

*Re-export.* Similar to TypeScript, we can re-export imported definitions via `export`. Here is the way to fix the above example:

```quint
module A {
  pure val greeting = "hello"
}

module B {
  import A.*
  export A.*
  // in the future, we will simply write:
  // export *
}

module C {
  import B.*

  def greet(name) = [ greeting, name ]
}
```

*No hiding.* TLA allows the user to add `LOCAL` in front of an operator
definition or an instance. Here is a TLA+ example:

```tla
------ MODULE Local ------
VARIABLE y
LOCAL F(x) == { x, y }
G(x) == { F(x) }
==========================
```

In the above example, the definition `F` is auxiliary to `G`. In Quint, we do
not hide definitions. However, if you really want to do that, `import ` allows
you to model this behavior via a proxy module:

```quint
module A::Impl {
  pure val secretNum = 123
}

module A {
  import A::Impl.*

  pure val publicNum = secretNum * secretNum + 1
}

module C {
  import A.*

  def compute(n) = publicNum * 2

  // the definition below would not work
  // def error(n) = secretNum * 2
}
```

As a specification writer, you can always import `secretNum` from `A::Impl`. The
only purpose of this pattern is to avoid copying unnecessary definitions, not to
keep secrets.

<a name="expressions"></a>

## Quint expression syntax

### Literals

Boolean literals are written as follows:

```
// FALSE in TLA+
false
// TRUE in TLA+
true
// BOOLEAN = { FALSE, TRUE } in TLA+
Bool
```

Integer literals are written as follows:

```
0
1
2
1024
// integer literals can be really big
340282366920938463463374607431768211456
// similar to Solidity, one can separate digits with '_'
100_000_000
// hexadecimal notation is also supported, including '_'
0xabcdef
0xAbCdEf
0xAB_CD_EF
...
```

The set of all integers is written as `Int` and the set of all naturals is
written as `Nat`.

### Names

Like in many programming languages, names are a basic building block of
expressions. To see this, consider the following example:

```scala
module names {
  const acceleration: int
  var clock: int

  pure def myMul(i, j) = i * j

  pure def sqr(i) = myMul(i, i)

  val distance = acceleration * sqr(clock)

  action init = {
    clock' = 0
  }

  action next = {
    clock' = clock + 1
  }
}
```


Here is the list of names that are normally used in expressions:

 - Names of the operators, for example `myMul` in the definition of `sqr`.

 - Names of the operator arguments, e.g., `i` and `j` in the definition of
   `myMul`, that also appear in anonymous operators (lambdas).

 - Names of constants, e.g., `acceleration` in the definition of `distance`.

 - Names of state variables, e.g., `clock` in the definitions of `distance`,
   `init`, and `next`.

<a name="braceAndParen"></a>

### Braces and parentheses

You can wrap an expression `e` in braces: `{ e }`. The expression `{ e }`
is always in the Action mode. Recall that applying an expression of the Action
mode in another mode is not allowed. If you wrap an expression `e` of a mode
that is less general than the Action mode, the parser *should* issue a warning.

Alternatively, you can wrap an expression `e` in parentheses: `(e)`.
In this case, `e` is not allowed to be in the Action-mode. If `e` is in the
Action mode, the parser *must* issue an error.

### Lambdas (aka Anonymous Operators)

As noted when we introduced [types](#types) and [operator
definitions](#operator-definitions), the type of operators is specified using
the syntax `(a_1, ..., a_n) => b`, for an operator that takes arguments of
types `a_1` to `a_n` to an expression of type `b`. _Anonymous operators
expressions_, known in TLA+ as "lambdas", can be constructed with the
corresponding syntax.

In Quint, `(x_1, ..., x_n) => e` is an anonymous operator which, when applied to
expressions `e_1` to `e_n`, reduces to the expression `e[e_1/x_1, ...,
e_n/x_n]` (that is, every parameter `x_i` is substituted with the expression
`e_i`, for `1 <= i <= n`). Two important comments are in order:

 1. When `n = 1`, we can write `x => e` instead of `(x) => e`.
 1. The case of `n = 0` is not allowed.

Compare this to the TLA+2 syntax:

```tla
LAMBDA x_1, ..., x_n: e
```

As is common, we can skip parameter names, if we don't need them:

```
_ => e
(_) => e
(_, ..., _) => e
```

Note that lambdas can be only passed as arguments to other operators. They
cannot be freely assigned to values or returned as a result of an operator.

**Note:** There is a difference between a lambda expression of the form
`(x, y) => e1` and a lambda expression of the form `((x, y)) => e2`.
The former is a two-argument lambda operator, whereas the latter is a
single-argument lambda operator that accepts a pair as its first argument.
The latter form `((x, y)) => e2` is equivalent to:

```quint
(t =>
  val x = t._1
  val y = t._2
  e2
)
```

As a result, the form `((x_1, ..., x_n)) => e_n` is syntax sugar for tuple
unpacking, as shown in the above example.

### Two forms of operator application

Quint is flexible with respect to operator applications. It supports two call
styles that are familiar from popular languages. Given an operator called `f`
and expressions `e_1`, ..., `e_n`, the operator `f` can be applied to the
expressions `e_1`, ..., `e_n` as follows:

 1. *Quint normal form*: `f(e_1, ..., e_n)`.
 1. [UFCS][]: `e_1.f(e_2, ..., e_n)`

These forms always require parentheses, even if the number of arguments in
parentheses is zero. That is, `f()` and `e_1.g()` are the right ways to apply
operators `f` and `g` in the normal form and UFCS, respectively. The form
without parentheses is reserved for field access of tuples and records as well
as accessing namespaces.

*The Quint normal form is especially convenient for programs, so they should
 communicate in this form. People may communicate in any form.*

A reserved class of built-in operators can only be called via infix form. These
operators have conventional names that stem from mathematics and thus are not written
as identifiers. For instance, you must write `1 + 3` in the infix form; You
cannot write `+(1, 3)` or `1.+(3)`. The normal form for these operators can be
achieved by using the mnemonic names, such as `iadd` instead of the infix
symbol. E.g., you may write `iadd(1, 3)` or `1.iadd(3)` in place of `1 + 3`. A
small number of operators are exceptional in this sense. We list the alternative
names when introducing operators. We don't expect humans to write expressions
like the ones above. This notation is more convenient for programs, so Quint
tooling should use the Quint normal form.

Like in every programming language, several operators are special
in the sense that they have non-standard priorities. The good news is that
we keep the number of such operators to the bare minimum, in contrast to TLA+.
If you are using the infix form, it is good to know the operator priorities.
Here is the table of operator priorities, the ones in the top have the higher
priority:

| Operators                                                                                 | Comments                                                     |
|-------------------------------------------------------------------------------------------|--------------------------------------------------------------|
| `e_1.F(e_2, ..., e_n)`                                                                    | Call via dot has the highest priority                        |
| `F(e_1, ..., e_n)`                                                                        | The normal form of operator application                      |
| `l[i]`                                                                        | List access via index                                         |
| `i^j`                                                                                     | Integer power (right associative)                            |
| `-i`                                                                                      | Unary minus                                                  |
| `i * j`, `i / j`, `i % j`                                                                 | Integer multiplication, division, modulo                     |
| `i + j`, `i - j`                                                                          | Integer addition and subtraction                             |
| `i > j`, `i < j`, `i >= j`, `i <= j`, `i == j`, `i != j`       | Integer comparisons, general equality/inequality  |
| `x' = e`                                                       | Delayed assignment |
| `and { ... }`                                                  | braced 'and'       |
| `p and q`                                                      | infix 'and'        |
| `or { ... }`                                                   | braced 'or'        |
| `p or q`                                                       | infix 'or'         |
| `p iff q`                                                      | Boolean equivalence (if and only if)                         |
| `p implies q`                                                  | Boolean implication: `not(p) or q`                           |
| all { ... }                                                    | braced action 'all' |
| any { ... }                                                    | braced action 'any' |
| k -> v                                                         | a pair              |
| all forms with `(..)`, `{..}`, and `[..]`                                                 | the lowest priority                                          |

### Boolean operators and equality

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
p.not()
// Logical "and".
// In TLA+: p /\ q
p and q
p.and(q)
and(p, q)
// The logical "and" is n-ary:
and(p1, p2, p3)
and(p1, p2, p3, p4)
// Logical "or".
// In TLA+: p \/ q
p or q
p.or(q)
or(p, q)
// The logical "or" is n-ary
or(p1, p2, p3)
or(p1, p2, p3, p4)
// logical equivalence: p <=> q in TLA+
p iff q
p.iff(q)
iff(p, q)
// implication: p => q in TLA+
p implies q
p.implies(q)
implies(p, q)
```

Note that the operator `not(p)` needs parentheses around its argument.
Actually, `not` is treated as a general operator. We keep the number of special
syntax forms to a minimum.

*Mode:* Stateless, State, Temporal.

### Block disjunctions

The following expression can be written in the action mode:

```scala
any {
  a_1,
  a_2,
  ...
  a_n,
}
```

*Mode:* Action.

The trailing comma next to `a_n` is optional, and `n` must be positive.

This operator is written as `actionAny(p_1, ..., p_n)` in its normal form.  It
evaluates the actions `a_1`, ..., `a_n` in isolation (that is, ignoring the
side effects introduced by assignments in the actions) and then
non-deterministically executes one of the enabled actions. The operator returns
`true`, if it has evaluated one of the actions to `true`. If no such action
exists, it returns `false`.

Since the syntax of the above operator is convenient, we have introduced a
similar syntax form in the non-action modes:

```scala
or {
  p_1,
  p_2,
  ...
  p_n,
}
```

This is simply the syntax sugar for `or(p_1, ..., p_n)`.

*Mode:* Non-action.

### Block conjunctions

The following expression can be written in the action mode:

```scala
all {
  p_1,
  p_2,
  ...
  p_n,
}
```

*Mode:* Action.

The trailing comma next to `a_n` is optional, and `n` must be positive.

This operator is written as `actionAll(p_1, ..., p_n)` in its normal form. It
evaluates the actions `a_1`, ..., `a_n` one-by-one lazily. As soon as one of
the actions `a_i` evaluates to `false`, it returns `false`. In this case, all
side effects (lazy assignments) produced by `a_1, ..., a_{i+1}` are erased, and
the operator returns `false`.  If all actions evaluate to `true`, all their
side effects are applied, and the operator returns `true`.

Since the syntax of the above operator is convenient, we have introduced a
similar syntax form in the non-action modes:

```scala
and {
  p_1,
  p_2,
  ...
  p_n,
}
```

This is simply the syntax sugar for `and(p_1, ..., p_n)`.

*Mode:* Non-action.

### Flow operators

#### Condition

```scala
  if (p) e1 else e2
```

This operator is translated to TLA+ as:

```tla
  IF p THEN e1 ELSE e2
```

The normal form of this operator is `ite(p, e1, e2)`.

*Mode:* Stateless, State, Action, Temporal.

#### Cases (removed)

*After discussing this language feature, we have decided to remove `case`.  The
action-mode semantics of `CASE` in TLA+ is redundant in the presence of
disjunctions. The expression-mode semantics of `CASE` in TLA+ does what the
users do not expect: If two branches are evaluated to `TRUE` in the same state,
then one of them is deterministically chosen with `CHOOSE` (there is no
predefined way of telling which one is chosen). For all these reasons, we do
not introduce `CASE` in Quint. Use series of `if-else if-else` expressions.*

Case enumeration with the default case:

```scala
case (
  | p_1 -> e_1
  | p_2 -> e_2
  ...
  | p_n -> e_n
  | _   -> e
)
```

Compare it to TLA+:

```tla
CASE
     p_1 -> e_1
  [] p_2 -> e_2
  ...
  [] p_n -> e_n
  OTHER -> e_def
```

The normal form of the case operator with the default option is:

```
caseBlock(p_1, e_1, ..., p_n, e_n, e_def)
```

Note that this operator simply has `2*n + 1` arguments. We do not group the
guards and effect expressions into pairs. The normal form is meant for the
tools.

*Mode:* Stateless, State. Other modes are not allowed.

**Discussion:** TLA+ allows for expressions `x' = e` inside `CASE`.  We have
found the use of this feature to be extremely rare and confusing.  It can be
easily rewritten with disjunctions and conjunctions, which should be preferred
to `case` in the Action mode.

TLA+ allows for `CASE` without the default option. This construct is
error-prone, as it easily leads to incomplete case enumeration. In contrast to
many programming languages, it does not suffice to perform a syntax test or a
type test, in order to see, whether all cases are covered. For this reason,
we do not support case expressions without the default arm.

### Sets

#### Set constructor

One way to construct a set is by enumerating its elements:

```scala
// the python-style constructor
Set(e_1, ..., e_n)
```

This is exactly as `{ e_1, ..., e_n }` in TLA+. However, we prefer not to
sacrifice `{...}` for this only operator. That is why a set is constructed with
`Set(...)` in Quint. In practice, this operator does not appear too often, so our
notation would not distract you too much.

*Mode:* Stateless, State. Other modes are not allowed.

**Discussion.** The earlier versions contained an alternative syntax `'{ e_1,
..., e_n }`. After receiving the feedback, we have left just one constructor.

<a name="nondeterministic"></a>

#### Non-deterministic choice

In contrast to TLA+, we introduce a special syntax form for non-deterministic
choice, which is normally written with `\E x \in S: P` in TLA+ actions.

The syntax form is as follows:

```scala
nondet name = oneOf(expr1)
expr2
```

The semantics of the above form is as follows. The operator `oneOf(expr1)`
non-deterministically picks one element of `expr1` (which should be a non-empty
set). The picked element is bound to the name `name`. This name can be used in
the nested action `expr2`.

**Example:**

```scala
val x: int

action nextSquare = {
  nondet i = oneOf(Int)
  all {
    Int.exists(j => i * i = j),
    i > x,
    x' = i,
  }
}
```

In the above example, `i` is a non-deterministically chosen integer.  The
further action below `nondet i = ...` requires the value of `i` to be a square
of an integer `j`. In addition to that, it requires `i` to increase in
comparison to `x`. Finally, the picked value of `i` is assigned to `x`.

*Mode:* The modes of `oneOf` and `nondet` are defined in the following table:

| Operator          | Argument mode                          | Output mode |
| ----------------- | -------------------------------------- | ----------- |
| `oneOf`           | Stateless, State                       | Non-determinism |
| `nondet x = e1; e2` | e1: Nondet, e2: Action               | Action      |

**Discussion.** Although according to the semantics of `oneOf`, a value is
chosen *non-deterministically*, practical implementations may prefer to
choose an element in a way that is not entirely non-deterministic. For
instance, a random simulator may implement the operator `oneOf(S)` as a random
choice of an element from the set `S`. Further, an interactive simulator may
ask the user to choose an element of `S`. Non-determinism is only important to
us when reasoning exhaustively about all executions, e.g., in a model checker
or a theorem prover.

#### Other set operators

The other operators are introduced and explained in code directly.

```scala
// \E x \in S: P
S.exists(x => P)
exists(S, (x => P))
// \A x \in S: P
S.forall(x => P)
forall(S, (x => P))
// set membership: e \in S
e.in(S)
in(e, S)
S.contains(e)
contains(S, e)
// union: S \union T
S.union(T)
union(S, T)
// intersection: S \intersect T
S.intersect(T)
intersect(S, T)
// difference: S \ T
S.exclude(T)
exclude(S, T)
// S is a subset of T (proper or not): S \subseteq T
S.subseteq(T)
subseteq(S, T)
// set comprehension (map): { e: x \in S }
S.map(x => e)
map(S, (x => e))
// set comprehension (filter): { x \in S: P }
S.filter(x => P)
filter(S, (x => P))
// set folding: you can write such a recursive operator in TLA+
S.fold(init, (v, x => e))
fold(S, init, (v, x => e))
// SUBSET S
S.powerset()
powerset(S)
// UNION S
S.flatten()
flatten(S)
// Seq(S): the set of all lists of elements in S.
// Cannot be used in simulation or verification. See `allListsUpTo`
S.allLists()
allLists(S)
// Limited version:
S.allListsUpTo(2)
// CHOOSE x \in S: TRUE
// The operator name is deliberately made long, so it would not be the user's default choice.
S.chooseSome()
// There is no special syntax for CHOOSE x \in S: P
// Instead, you can filter a set and then pick an element of it.
S.filter(x => P).chooseSome
```

These operators are defined in the module `FiniteSets` in TLA+. Quint has these
two operators in the kernel:

```scala
// Test a set for finiteness.
// TLA+ equivalent: IsFiniteSet(S)
S.isFinite()
isFinite(S)
// Set cardinality for finite sets.
// TLA+ equivalent: Cardinality(S)
S.size()
size(S)
```

*Mode:* Stateless, State. Other modes are not allowed.



### Maps (aka Functions)

```scala
// Map application.
// In TLA+: f[e]
f.get(e)
get(f, e)
// Map domain.
// In TLA+: DOMAIN f
f.keys()
keys(f)
// Map constructor via evaluation.
// In TLA+: [ x \in S |-> e ]
S.mapBy(x => e)
mapBy(S, (x => e))
// Map constructor via enumeration.
Map()
Map(k_1 -> v_1)
Map(k_1 -> v_1, k_2 -> v_2)
Map(k_1 -> v_1, k_2 -> v_2, k_3 -> v_3)
...
// Convert a set of pairs to a map.
// In TLA+: [ x \in { a: <<a, b>> \in S } |-> (CHOOSE p \in S: p[1] = x)[2]]
Set((1, true), (2, false)).setToMap()
setToMap(Set((1, true), (2, false)))
// A set of maps.
// In TLA+: [ S -> T ]
S.setOfMaps(T)
setOfMaps(S, T)
// Update a map at given key.
// In TLA+: [f EXCEPT ![e1] = e2]
f.set(e1, e2)
set(f, e1, e2)
// Multi-point update can be done via multiple applications.
// In TLA+: [f EXCEPT ![e1] = e2, ![e3] = e4]
f.set(e1, e2).set(e3, e4)
// Update by using the old value.
// In TLA+: [f EXCEPT ![e1] = @ + y]
f.setBy(e1, (old => old + y))
setBy(f, e1, (old => old + y))
//
// In TLA+ (when using TLC): (k :> v) @@ f
f.put(k, v)
put(f, k, v)
```

*Mode:* Stateless, State. Other modes are not allowed.

### Records

```scala
// record constructor: [ f_1 |-> e_1, ..., f_n |-> e_n ]
// Warning: n >= 1
{ f_1: e_1, ..., f_n: e_n }
Rec(f_1, e_1, ..., f_n, e_n)
// Set of records: [ f_1: S_1, ..., f_n: S_n ].
// No operator for it. Use a set comprehension:
tuples(S_1, ..., S_n).map((a_1, ..., a_n) => { f_1: a_1, ..., f_n: a_n })
// access a record field: r.fld
r.fld           // both r and fld are identifiers
field(r, "fld") // r is an identifier, "fld" is a string literal
// the set of field names: DOMAIN r
r.fieldNames()
fieldNames(r)
// record update: [r EXCEPT !.f = e]
r.with("f", e)
with(r, "f", e)
// special syntax for [r EXCEPT !.f1 = e1, !fN = eN], also works for n fields
{ f1: e1, fN: eN, ...r }
```

Note that we are using the syntax `{ name_1: value_1, ..., name_n: value_n }`
for records, similar to Python and JavaScript. We have removed the syntax for
sets of records: (1) It often confuses beginners, (2) It can be expressed with
`map` and a record constructor.

*Mode:* Stateless, State. Other modes are not allowed.

### Tuples

```scala
// Tuple constructor: << e_1, ..., e_n >>
(e_1, ..., e_n)
Tup(e_1, ..., e_n)
// The empty tuple is also the canonical unit type
// <<>>
()
Tup()
// t[1], t[2], t[3], t[4], ... , t[50]
t._1
t._2
t._3
t._4
...
t._50
item(t, idx)  // t is an identifier, idx is an integer literal
// Cartesian products
// S_1 \X S_2 \X ... \X S_n
tuples(S_1, S_2, ..., S_n)
```

What about `DOMAIN t` on tuples? We don't think it makes sense to have it.

What about `[ t EXCEPT ![i] = e ]`? Just define a new tuple that contains
the new field. It is not likely that you will have tuples that have a lot
of items.

*Mode:* Stateless, State. Other modes are not allowed.

### Sum Types

Exclusive disjunction of different possible data types is expressed via sum
types, also known as tagged unions, discriminated unions, or variants. TLA+,
being untyped, doesn't have a strict correlate, but it is common to use records
with a discriminator field for this purpose.

```scala
// Declaration
type T = L_1(T_1) | ... | L_n(T_n)
// variant constructor
// where
//  - 1 =< k <= n for the declared sum type's variants L_1(T_1) | ... | L_n(T_n)
//  - x : T_k
L_k(x)
variant("L_k", x)
// variant eliminator: "match expression"
// where 
//  - x_1 : T_1, ..., x_n : T_n
//  - e_1 : S, ..., e_n : S, and S will be the resulting type of the expression
match L_k(x) {
  | L_1(x_1) => e_1
  | ...
  | L_n(x_n) => e_n
}
matchVariant(L_k(x), "L_1", (x_1) => e_1, ..., (x_n) => e_n)
```

E.g., to form and operate on a heterogeneous set containing both integer and
string values, you might find:

```scala
type Elem = S(str) | I(int)
val mySet: Set[Elem] =  Set(S("Foo"), I(1), S("Bar"), I(2))
val transformMySet: Set[Str] = mySet.map(e => match e { S(s) => s | I(_) => "An int"})
```

*Mode:* Stateless, State. Other modes are not allowed.


### Lists (aka Sequences)

In contrast to TLA+, there is no special module for lists. They are built
in the kernel of Quint. A parser can compute, whether operators on lists are
used in the spec.

**Remember**: lists in Quint are 0-indexed, in contrast to TLA+, where sequences
are 1-indexed.

```scala
// List constructor.
// Equivalent to <<e_1, ..., e_n>> in TLA+.
[ e_1, ..., e_n ]
List(e_1, ..., e_n)
// List range: `start` is inclusive, whereas `end` is exclusive.
// Equivalent to [start, start + 1, ..., end - 1]
// There is no equivalent in TLA+,
// but it could be defined via a recursive operator.
range(start, end)
// Append e to the end of s.
// Equivalent to Append(s, e) in TLA+.
l.append(e)
append(l, e)
// Concatenate s and t.
// Equivalent to s \circ t in TLA+.
s.concat(t)
concat(s, t)
// List head.
// Equivalent to Head(s) in TLA+.
l.head()
head(l)
// List tail.
// Equivalent to Tail(s) in TLA+.
// It is up to the interpreter/analyzer to define the behavior of tail([]).
// The simulator shows an error message in this case.
l.tail()
tail(l)
// The length of a list.
// Equivalent to Len(s) in TLA.
l.length()
length(l)
// Sequence element at nth position (starting with 0).
// Equivalent to s[i + 1] in TLA+.
l[i]
l.nth(i)
nth(l, i)
// The set of list indices (starting with 0).
// Equivalent to { i \in DOMAIN s: i - 1 } in TLA+.
l.indices()
indices(l)
// Update the list at element i.
// Equivalent to [ s EXCEPT ![i + 1] = e ] in TLA+.
l.replaceAt(i, e)
replaceAt(l, start, end)
// Slice a list from `start` until `end`.
// Equivalent to SubSeq(lst, start + 1, end) in TLA+.
// Like in many PLs, `start` is inclusive, whereas `end` is exclusive.
// For the following cases, it is up to the interpreter/analyzer to define
// the behavior for the following cases:
//  - start < 0,
//  - start >= length(ls),
//  - end > length(ls),
//  - end < start.
// The simulator shows an error message in these cases.
l.slice(start, end)
slice(l, start, end)
// Filter a list.
// Equivalent to SelectSeq(s, Test) in TLA+.
select(l, Test)
// in particular, we can use anonymous operators
l.select(e => P)
// Left fold. There is no standard operator for that in TLA+,
// but you can define it with a recursive operator.
l.foldl(init, ((accumulator, v) => e))
foldl(l, init, ((accumulator, v) => e))
```

*Mode:* Stateless, State. Other modes are not allowed.

### Integers

In contrast to TLA+, there is no special module for integers. They are built in
the kernel of Quint. The module `Naturals` does not exist either. A parser can
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
m.uminus()
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
m.to(n)
to(m, n)
```

*Mode:* Stateless, State. Other modes are not allowed.

### Nested operator definitions

They are almost identical to the top-level operators, except that they are
visible only to the containing top-level operator. Nested operator definitions
may contain nested operator definitions too. There is one important addition
in nested definitions: non-deterministic values (`nondet` values).

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

def triple(x) =
  // if you want to write a definition and use it on the same line, use a semicolon
  def add(n) = n + x; add(x, add(x, x))

// a state variable to define "next"
var n: int

action next = {
  // non-deterministically choose i from the set 0.to(10)
  nondet i = oneOf(0.to(10))
  all {
    i > n,
    n' = i,
  }
}

temporal my_prop =
  // a nested temporal formula
  temporal A = eventually(x > 3)
  // a nested temporal formula
  temporal B = always(eventually(y = 0))

  A implies B
```

*Grammar:*

```
("pure" "val" | "val" | "def" | "pure" "def" | "nondet" | "action" | "temporal")
  <identifier>[ "(" <identifier> ("," ..."," <identifier>)* ")" ] [ ":" <type>]
    "=" <expr> [";"]
<expr>
```

It is nice to separate an operator definition from its application. Usually, we
use a line break or two to do this. If you want to define an operator and use
it on the same line, you can use a semicolon `;` as a separator. We do not
recommend using both a semicolon and a line break at the same time.

*Mode:* The modes are defined as in the case of the top-level operators. As
expected, the mode of an inner operator should not be more general then the
mode of the outer operator.

### Operators on actions

In comparison to TLA+, Quint has a tiny set of action operators. The other action
operators of TLA+ were moved to the temporal operators, because they are
required only in temporal reasoning.

#### Delayed assignment

This operator is carefully avoided in TLA+. Quint allows you to assign a value to
the state variable `x` in a next state:

```scala
x' = e
assign(x, e)
x.assign(e)
```

The operator `x' = e` is equivalent to `x' = e` of TLA+ under specific
conditions. In contrast to the assignments in programming languages, Quint
assignment is delayed by one step. It only becomes effective in a successor
state of the state that is being evaluated. The notation `x' = e` is meant to
warn the user that the value `e` is "sent" to `x`, and it will only arrive at
`x` in a next state. Hence, in the following expression, expression `x + 1` may
evaluate to a value that is different from 5:

```
all {
  x' = 4,
  x + 1 > 0
}
```


*Every state variable `x` must be assigned via `x' = e` at most once in every
step.*

**Discussion.** TLA+ does not have a notion of assignment. Instead, one simply
writes an equality `x' = e`. In general, one can write an arbitrary predicate
over `x'`. We find it hard to reason about such pure equalities, which may
occur in multiple places. Hence, we introduce assignments. However, our
assignments are slightly different from assignments in imperative (stack-based)
languages.

*Mode.* Action. Other modes are not allowed.

#### Non-deterministic choice

See the discussion in: [Non-deterministic choice](#nondeterministic).

#### Assert

The operator `assert` has the following syntax:

```scala
assert(condition)
```

This operator always evaluates to `condition`, and it does not change the state
variables. If `condition` evaluates to `false` in a state, then the user should
receive a message about a runtime error. How exactly this is reported depends
on the tool.

*Mode:* Action.

### Runs

A run represents a finite execution. In the simplest case, it represents
one _concrete_ execution that is allowed by the specification. In
general, it is a sequence of actions, which prescribe how to produce one or
more concrete executions, if such executions exist.

**Discussion.** We have found that TLA+ lacks a programmatic way of
describing examples of system executions. Indeed, TLA+ has the notion of a
behaviour (simply put, a sequence of states starting with `Init` and connected
via `Next`). However, it is relatively hard to present a sequence of steps in
TLA+ itself. For instance, counterexamples produced by TLC and Apalache are not
first-class TLA+ citizens. In theory, TLA+ has the operator `\cdot`, representing the sequential composition of two actions. However, we have never seen
this operator being used in practice.

#### Then

The operator `then` has the following syntax:

```scala
A.then(B)
then(A, B)
```

The semantics of this operator is as follows. When `A.then(B)` is applied to a
state `s_1`, the operator computes a next state `s_2` of `s_1` by applying
action `A`, if such a state exists. Depending on the result of `A`, two scenarios
are possible:

 - When `A` returns `true`, then the operator `A.then(B)` computes a next state
 `s_3` of `s_2` by applying action `B`, if such a state exists.
  If `B` returns true, then the operator `A.then(B)` returns
  `true`, the old state is equal to `s_1`, and the new state is equal to `s_3`.
  Otherwise, the operator `A.then(B)` returns `false`.
 
 - If `A` returns `false`, then it is impossible to continue. A runtime error
  should be reported.

This operator is equivalent to `A \cdot B` of TLA+ (except for the runtime errors).

**Example.** Consider the specification `counters`:

```scala
module counters {
  var n: int

  action Init = {
    n' = 1
  }

  action Even = all {
    n % 2 == 0,
    n' = n / 2,
  }

  action ByThree = all {
    n % 3 == 0,
    n' = 2 * n
  }

  action Positive = all {
    n > 0,
    n' = n + 1,
  }

  action Next = any {
    Even, ByThree, Positive
  }

  run run1 = (n' = 1).then(n' = 2).then(n' = 3).then(n' = 6).then(n' = 3)

  run run2 = (Init).then(Positive).then(Positive).then(ByThree).then(Even)

  run run3 = (Init).then(Next).then(Next).then(Next).then(Next)
}
```

The definition `run1` captures the execution that contains five states, in
which the variable `n` receives the values `1`, `2`, `3`, `6`, and `3`,
respectively. If we look carefully at the definition of `run2`, it produces
exactly the same sequence of states as `run1`, but it does via evaluation of
the actions `Init`, `Positive`, `Positive`, `ByThree`, and `Even`, in that
order.

Note that a run does not have to describe exactly one sequence of states: in general
a run describes a sequence of constraints over a sequence of states. For
example, `run3` captures all executions of the specification `counters`
that start with `Init` and evaluate `Next` four times in a row.

*Mode:* Run.

#### Reps

The expressions `n.reps(i => A(i))` or `n.reps(A)` repeats an action `A`, `n` times.
The iteration number, `i`, starts with 0 and is passed as an argument of `A`.
As actions are usually not parameterized by the iteration number,
the most common form looks like: `n.reps(_ => A)`.

The semantics of this operator is as follows:

 - When `n <= 0`, this operator does not change the state.
 - When `n = 1`, `n.reps(A)` is equivalent to `A(0)`.
 - When `n > 1`, `n.reps(A)`, is equivalent to
   `A(0).then((n - 1).reps(i => A(1 + i)))`.

##### Example
  
```quint
var x: int
run test = (x' = 0).then(3.reps(_ => x' = x + 1)).then(assert(x == 3))
```

*Mode:* Run.

#### Fail

The operator `fail` has the following syntax:

```scala
A.fail()
fail(A)
```

This operator returns `true` if and only if action `A` returns `false`.
The operator `fail` is useful for writing runs that expect an action
to be disabled.

*Mode:* Run.

#### Expect

The operator `expect` has the following syntax:

```scala
A.expect(P)
expect(A, P)
```

The left-hand side `A` must be an action or a run. The right-hand side `P` must
be a non-action Boolean expression.

The semantics of this operator is as follows:

- Evaluate action `A`:
  - When `A`'s result is `false`, emit a runtime error.
  - When `A`'s result is `true`:
    - Commit the variable updates.
    - Evaluate `P`:
      - If `P` evaluates to `false`, emit a runtime error (similar to `assert`).
      - If `P` evaluates to `true`, undo the updates back to the state where we
        were after `A` was applied.

##### Example

```quint
var n: int
run expectConditionOkTest = (n' = 0).then(n' = 3).expect(n == 3)
run expectConditionFailsTest = (n' = 0).then(n' = 3).expect(n == 4)
run expectRunFailsTest = (n' = 0).then(all { n == 2, n' = 3 }).expect(n == 4)
```

*Mode:* Run.

### Temporal operators

Temporal operators describe infinite executions.

#### Always

This is equivalent to `[] P` of TLA+:

```scala
always(P)
P.always
```

*Mode:* Temporal.

#### Eventually

This is equivalent to `<> P` of TLA+:

```scala
eventually(P)
P.eventually
```

*Mode:* Temporal.

#### Next

Similar to the operator "prime" (written as `'`) of TLA+, we introduce the
operator `next`:

```scala
next(e)
e.next
```

Expression `next(e)` is equivalent to `e'` of TLA+. More precisely, if `f` is
the translation of a Quint expression `e` to TLA+, then `f'` is the translation
of `e'` to TLA+. In contrast to TLA+, we restrict `next` to the Temporal mode.
Hence, we cannot use `next` in actions. In actions, we should only use `x' =
e`.

*Mode:* Temporal.

#### Unchanged (removed)

For a state variable `x`, the following expression is like `UNCHANGED x` of
TLA+:

```scala
unchanged(x)
x.unchanged
```

In a more general case, you can write `unchanged(e)` for an expression `e`.
However, you can also write `next(e) = e`, so there is no real reason for
keeping this operator.

**Discussion.** After introducing modes, we have realized that it became easy
to identify assignments in actions. We introduced `Unchanged` only in the
Temporal mode, which is needed for refinements.

#### OrKeep

The following operator is similar to `[A]_x` of TLA+:

```scala
orKeep(A, x)
A.orKeep(x)
```

The arguments to `orKeep` are as follows:

 - `A` is an expression in the Action mode,
 - `x` is a variable or a tuple of variables.

*Mode:* Temporal, Run. This operator converts an action (in the Action mode) to a
temporal property or a run.

#### MustChange

The following operator is similar to `<A>_x` of TLA+:

```scala
mustChange(A, x)
A.mustChange(x)
```

The arguments to `mustChange` are as follows:

 - `A` is an expression in the Action mode,
 - `x` is a variable or a tuple of variables.

*Mode:* Temporal. This operator converts an action (in the Action mode) to a
temporal property.

#### Enabled

This operator is written as follows:

```scala
enabled(A)
A.enabled
```

Similar to the operator `ENABLED` of TLA+, the operator `enabled` is a very special
operator. It accepts an expression `A` in the action mode, whereas `enabled(A)` is
an expression in the Temporal mode.

Expression `enabled(A)` is equivalent to `ENABLED A` of TLA+. More precisely,
if `B` is the translation of a Quint expression `A` to TLA+, then `ENABLED B` is
the translation of `enabled(A)` to TLA+.

*Mode:* Temporal. The argument `A` must be in the Action mode.

#### Fairness

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

#### Other temporal operators

We omit `P \leadsto Q`, as it can be written as:

```scala
always(P implies eventually(Q))
```

TLA+ contains an interesting operator "guarantees", that is written as `P -+-> Q`.
For completeness, we introduce its syntactic version in Quint:

```
guarantees(P, Q)
P.guarantees(Q)
```

The operators `\EE` and `\AA` are almost never used, so there are no
equivalents in Quint. If you have reached this level, you should (automatically)
translate your Quint spec into TLA+ and use your tools, e.g., TLAPS.

### Unbounded quantifiers

TLA+ has three operators that bind a variable without providing a set:

```tla
\E x: P
\A x: P
CHOOSE x: P
```

These operators are supported neither by TLC, nor by Apalache. So the chance
that you will use them is very low. However, for the sake of completeness we
introduce their counterparts in Quint:

```
existsConst(x => P)
forallConst(x => P)
chooseConst(x => P)
```

We add the suffix "const" to the operator names to stress the fact that these
operators quantify over the constants of the first-order universe.

*Mode:* Stateless, State, Temporal. No Action mode.

<a name="instances"></a>

## Instances

Given a stateful module `M`, we can turn `M` into another module `I` by
rewriting constants `M` and generating new, namespaced variables. In this case,
module `I` is called an instance of `M`.

### Common case

The most common example is shown below:

```quint
module Voting {
  const Value: Set[int]
  const Acceptor: Set[str]
  const Quorum: Set[Set[str]]
  // no const, no var below
  // ...
  val chosen = Value.filter(v => Ballot.exists(b => ChosenAt(b, v)))
  // ...
}

module MC {
  val Acceptor = Set("p1", "p2", "p3")
  val Quorum = Acceptor.powerset.filter(Q => Q.size > 1)

  // an new instance of Voting that has the name "V"
  import Voting(Value = Set(0, 1), Acceptor = Acceptor, Quorum = Quorum) as V
  // ...
}
```

In the above example, module `V` is produced from the module `Voting` by replacing
every occurrence of `Value`, `Acceptor`, and `Quorum` with `Set(0, 1)`, `Acceptor`,
and `Quorum`, respectively.

### Anonymous instances

TLA+ allows one to instantiate a module and inject its definitions directly in
the namespace of another module, e.g.:

```tla
------ MODULE Bar -------
VARIABLE x
A(y) == x + y
=========================

------- MODULE Foo ------
VARIABLE z
INSTANCE Bar WITH x = z
=========================
```

Quint has similar syntax sugar for doing that:

```quint
module Bar {
  const c: int
  def A(y) = c + y
}

module Foo {
  import Bar(c = 0).*
  
  // In the future, we would be able to
  // re-export all definitions from `FooBar` as if they belonged to `Foo`
  //
  // export *
}
```

### Discussion

There are two ways to load definitions in TLA+: by writing
`EXTENDS` and by writing `INSTANCE` (anonymous or named). See [Specifying
Systems][] (Ch. 11.1). Apparently, `EXTENDS` and anonymous instances are needed
to define fancy operators, e.g.:

```tla
---- MODULE Foo ----
x (+) y == { x, y }
====================

---- MODULE Bar ----
INSTANCE Foo

G == 1 (+) 2
====================
```

We could use a named instance:

```tla
---- MODULE Baz ----
F == INSTANCE Foo

G == F!(+)(1, 2)
====================
```

Obviously, the expression in `Baz!G` is not as visually appealing as the
expression in `Bar!G`. Another issue is that anonymous instance do not allow
for duplication of definitions, even if those definitions are equivalent. For
this reason, one has to use `LOCAL INSTANCE` or `EXTENDS`.

There is probably some history behind `EXTENDS`, anonymous `INSTANCE`, and
`LOCAL INSTANCE` in TLA+. A yet another use of `EXTENDS` in TLA+ is to define
the module `Integers` that extends the operators of the module `Naturals`.  Quint
does not have this issue, as integers are simply built-in in the language.  We
do not have the bearing of history in Quint and thus we can simplify namespaces
and instances.

[UFCS]: https://en.wikipedia.org/wiki/Uniform_Function_Call_Syntax
[Specifying Systems]: https://lamport.azurewebsites.net/tla/book.html
