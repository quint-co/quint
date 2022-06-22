# Summary of TNT

*TNT is not TLA+*

| Revision | Date       | Author                                                  |
|:---------|:-----------|:--------------------------------------------------------|
| 22       | 10.05.2022 | Igor Konnov, Shon Feder, Jure Kukovec, Gabriela Moreira |

This document presents language constructs in the same order as the [summary of
TLA+](https://lamport.azurewebsites.net/tla/summary.pdf).

<!-- markdown-toc start - Don't edit this section. Run M-x markdown-toc-refresh-toc -->
**Table of Contents**

- [Summary of TNT](#summary-of-tnt)
    - [Identifiers and strings](#identifiers-and-strings)
    - [Comments](#comments)
    - [Types](#types)
        - [Type System 1.2](#type-system-12)
    - [Modes](#modes)
    - [Module-level constructs](#module-level-constructs)
        - [Module definition](#module-definition)
        - [Constant declarations](#constant-declarations)
        - [Assumptions](#assumptions)
        - [Variable definitions](#variable-definitions)
        - [Operator definitions](#operator-definitions)
        - [No recursive functions and operators](#no-recursive-functions-and-operators)
        - [Module instances](#module-instances)
        - [Type aliases](#type-aliases)
        - [Theorems](#theorems)
        - [Imports](#imports)
    - [Namespaces and imports](#namespaces-and-imports)
        - [Stateless and stateful modules](#stateless-and-stateful-modules)
        - [Namespaces](#namespaces)
        - [Imports](#imports-1)
    - [TNT expression syntax](#tnt-expression-syntax)
        - [Literals](#literals)
        - [Braces and parentheses](#braces-and-parentheses)
        - [Lambdas (aka Anonymous Operators)](#lambdas-aka-anonymous-operators)
        - [Three forms of operator applications](#three-forms-of-operator-applications)
        - [Boolean operators and equality](#boolean-operators-and-equality)
        - [Multiline disjunctions](#multiline-disjunctions)
        - [Multiline conjunctions](#multiline-conjunctions)
        - [Flow operators](#flow-operators)
            - [Condition](#condition)
            - [Cases (removed)](#cases-removed)
        - [Sets](#sets)
            - [Set constructor](#set-constructor)
            - [Existential quantifier and non-deterministic choice](#existential-quantifier-and-non-deterministic-choice)
            - [Other set operators](#other-set-operators)
        - [Maps (aka Functions)](#maps-aka-functions)
        - [Records](#records)
        - [Discriminated unions](#discriminated-unions)
        - [Tuples](#tuples)
        - [Lists (aka Sequences)](#lists-aka-sequences)
        - [Integers](#integers)
        - [Nested operator definitions](#nested-operator-definitions)
        - [Operators on actions](#operators-on-actions)
            - [Delayed assignment](#delayed-assignment)
            - [Guess](#guess)
            - [Other action operators of TLA+](#other-action-operators-of-tla)
        - [Temporal operators](#temporal-operators)
            - [Always](#always)
            - [Eventually](#eventually)
            - [Next](#next)
            - [Unchanged (removed)](#unchanged-removed)
            - [Stutter](#stutter)
            - [Nostutter](#nostutter)
            - [Enabled](#enabled)
        - [Fairness](#fairness)
            - [Other temporal operators](#other-temporal-operators)
        - [Unbounded quantifiers](#unbounded-quantifiers)
    - [Instances](#instances)
        - [Common case 1](#common-case-1)
        - [Common case 2](#common-case-2)
        - [The general case](#the-general-case)
        - [No anonymous instances](#no-anonymous-instances)
        - [Discussion](#discussion)

<!-- markdown-toc end -->


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

<a name="types"/>

## Types

TNT is a typed language. All variables and constants must be assigned a type.
Other definitions may be annotated with types. If the type checker is able to
infer the type of a definition, then its type may be omitted.

**Discussion.** In the earlier versions of TNT, we allowed the user to omit
types altogether. In retrospect, we find this to be a bad idea. Hence, we
require that every definition is either type-annotated (variables and
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
       | { tag: string_1, <ident>: T_1_1, ..., <ident>: T_1_n_1}
       ...
       | { tag: string_k, <ident>: T_k_1, ..., <ident>: T_k_n_k}
    ```
    for `n >= 1` types `T_1_1`, ..., `T_k_n_k`.

 - Type in parentheses: `(T)` for a type `T`.


It is often convenient to declare a type alias. You can use `type` to define
an alias inside a module definition. For instance:

```
type STR_OPTION =
    | { tag: "none" }
    | { tag: "some", value: str }
```

A type identifier can also introduce an uninterpreted type by defining a type without any constructors for values of that type:

```
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
 1. Action mode.
 1. Temporal mode.

Every TNT expression and definition is assigned a mode. In the following, we
will specify which modes are supported by certain operators and definitions.
The following table defines the subsumption rules on modes (the partial order
`<m`).  As a general rule, if an operator or a definition accepts an argument
of mode `M`, then it can also accept an argument of a less general mode `K <m
M`.

| More general mode | Less general modes         |
| ----------------- | -------------------------- |
| Stateless         | n/a                        |
| State             | Stateless                  |
| Action            | Stateless, State           |
| Temporal          | Stateless, State           |

As can be seen from the table, action mode and temporal mode are incomparable.
This is intentional: We do not want to mix actions with temporal formulas.

## Module-level constructs

### Module definition

A module definition is introduced like follows:

```
module Foo {
  // module definitions

  module Bar {
    // definitions of the nested module

    module Baz {
      // Yet another level of nesting.
      // More definitions.
    }
  }
}
```

*Grammar:*

```bnf
"module" <identifier> "{"
  <definitions>
"}"
```

A single file *should* contain one top-level module, though there is no limit
on the number of nested modules and their depth of nesting. To ease module
lookup, the name of the top-level module *should* match the file name. For
example, a file `Orange.tla` should contain `module Orange { ... }`. This is
not a strict requirement. You have to follow it only, if you are using multiple
files.

There is another way to define a module, see [Instances](#instances).

### Constant declarations

Introduce a single constant parameter (rigid variable in TLA+)

```
  const N: int
  const Proc: set(str)
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
assume _ = Proc.cardinality > 0
```

*Mode:* Stateless

### Variable definitions

Introduce a single variable (flexible variable in TLA+)

```
  var name: str
  var timer: int
  var is_armed: bool
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
fold over a sequence or a set, see below).

```
// a constant operator
val Nodes: set(int) = 1 to 10

// a constant operator may access state variables too
val total: int = x + y

// a two-argument operator that returns its first argument
def fst(x, y): ((a, b) => a) = x

// the maximum operator
def max(x, y): (int, int) => int =
    if (x > y) x else y

// A predicate over `x`. We could use `def` instead of `pred`.
// However, we prefer writing `pred` for definitions that return a Boolean
pred is_positive(x): int => bool =
    x > 0

// a higher-order operator that accepts another operator as its first argument
def F(G, x): ((a => b, a) => b) = G(x)
```


*Grammar:*

```bnf
("val" | "def" | "pred" | "action" | "temporal")
    <identifier>["(" <identifier> ("," ..."," <identifier>)* ")"] [":" <type>] "=" <expr>
```

*Mode:* The mode depends on the mode of the expression in the right-hand side.
The following table defines this precisely.

| Qualifier            | Mode of `expr`                       | Mode of definition |
| -------------------- | ------------------------------------ | ------------------ |
| `val`, `def`, `pred` | Stateless                            | Stateless          |
| `val`, `def`, `pred` | State                                | State              |
| `action`             | Action                               | Action             |
| `temporal`           | Stateless, State, Temporal           | Temporal           |

### No recursive functions and operators

We've decided against having recursive operators and functions in the language.
The practical use cases can be expressed with `map`, `filter`, and `fold`.

### Module instances

Similar to `INSTANCE` in TLA+, we can define module instances.

*Example:*

```scala
// an instance of Voting that has the name "V"
module V = Voting(Value = set(0, 1))

// the names of V are accessed via "."
val MyValues = V.Value
```

*Grammar*:
```bnf
"module" <identifier> "="
  <identifier> "("
    [<identifier> "=" <identifier> ("," <identifier> "=" <identifier>)*] ["," "*"]
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

<a name="namespaces"/>

## Namespaces and imports

The topic of modules, namespaces, and instances is extremely obfuscated in
TLA+, for no obvious reason. In TNT, we follow a simple approach that would not
surprise anyone, who knows modern programming languages.

We are using TNT expressions in the examples in this section. It is probably a
good idea to skip this section on the first read and read about [TNT expression
syntax](#expressions) first.

### Stateless and stateful modules

We distinguish between stateless and stateful modules. A stateful module has at
least one constant or variable declaration.  All other modules are stateless.
This is an important distinction.  Definitions of stateless modules may be
accessed via the dot-notation and imported, whereas stateful modules must be
instantiated before they can be accessed.

### Namespaces

Every module has a namespace associated with it. Consider the example:

```scala
module Foo {
  const N: int
  var x: int

  pred Init = x == 0
  action Next = x <- x + N
}
```

In our example, module `Foo` has four names in its namespace: `N`, `x`,
`Init`, and `Next`.

A nested module defines its own namespace, which extends the namespace of the
outer module:

```scala
module Outer {
  var x: int

  def x_plus(z) = x + z

  module Inner {
    val x2 = x + x
  }

  pred inv = (Inner.x2 - x == x)
}
```

In the above example, the module `Outer` has the following names in its name
space: `x`, `x_plus`, `inv`, and `Inner`, whereas the module `Inner` contains
the names `x2` and the names defined in its parent modules: `x`, `x_plus`, and
`inv`. The module `Inner` is *stateless*, so the module `Outer` may access the
definitions of `Inner` via the dot-notation, e.g., `Inner.x2`.

*No collisions.* There must be no name collisions between child modules and parent
modules.  Shadowing of a name is not allowed. For example:

```scala
module OS {
  var clock: int

  module Process {
    var clock: int
    //  ^^^^^ error: 'clock' is already defined in 'OS'
  }
}
```

One solution to the above problem is to define both modules `OS` and `Process`
at the same level, either in separate files, or inside another module.

*No order.* In contrast to TLA+, namespaces are not ordered. It is perfectly
fine to write out-of-order definitions, like in many programming languages:

```scala
module out_of_order {
  def positive(x) = max(x, 0)

  def max(x, y) = x > y ? x : y
}
```

As a specification author, you and your peers have to decide on your style,
whereas your text editor should help you in finding definitions.
TNT is not Fashion Police.

### Imports

As it may be tedious to access definitions via the dot-notation, TNT supports
name imports:

```scala
module Imports {
  module Math {
    def sqr(x) = x * x
    def pow(x, y) = x^y
  }

  // import 'pow' from Math
  import Math.pow

  def cube(x) = pow(x, 3)
}
```

In the above example, the name `pow` is imported in the scope of the module
`Imports`. As a result, definitions in `Imports` may refer to `pow`, which is
just a short-hand for `Math.pow`. As you would expect, imports are not allowed
to introduce name collisions.

To avoid writing too many import statements, you can use `*`. For example:

```scala
module ImportAll {
  module Math {
    def sqr(x) = x * x
    def pow(x, y) = x^y
  }

  // import all names from Math
  import Math.*

  // access 'pow' and 'sqr' of Math
  def poly(x) = pow(x, 3) + sqr(x) + x
}
```

*No export.* It is important to know that `import` does not introduce any
definitions in the module that uses `import`. Hence, the following example
produces a lookup error:

```scala
module NoExport {
  module MiddleMan {
    module English {
      val greeting = "hello"
    }

    import English.*
  }

  def greet(name) = [ MiddleMan.greeting, name ]
  //                  ^^^^^^^^^^^^^^^^^^ error: 'MiddleMan.greeting' not found in 'NoExport'
}
```

Hence, `import English.*` is working similar to `LOCAL INSTANCE English` of
TLA+.

*No hiding.* TLA allows the user to add `LOCAL` in front of an operator
definition or an instance. Here is a TLA+ example:

```tla
------ MODULE Local ------
VARIABLE y
LOCAL F(x) == { x, y }
G(x) == { F(x) }
==========================
```

In the above example, the definition `F` is auxiliary to `G`. In TNT, we do not
hide definitions. If you want to indicate to the users of your module, if there
are any, that they should not access some private definitions, you may hide those
definitions in a nested module that start with the underscore:

```scala
module Local {
  var y: int
  def G(x) = set(_local.F(x))

  module _local {
    def F(x) = set(x, y)
  }
}
```

By convention, a module should not access a submodule of another module, if the
name of the submodule starts with an underscore. This is only a convention. If
you do that, a TNT parser may issue a warning, but it will not crash.


<a name="expressions"/>

## TNT expression syntax

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

<a name="braceAndParen"/>

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
the syntax `(a1, ..., an) => b`, for an operator that takes arguments of types
`a1` to `an` to an expression of type `b`. _Anonymous operators expressions_,
known in TLA+ as "lambdas", can be constructed with the corresponding syntax.
`(x1, ..., xn) => e` is an anonymous operator which, when applied to expressions
`x1` to `xn`, reduces to the expression `e`.

Depending on the mode, an anonymous operator of one argument is defined as:

- In the Action mode: `{ x => e }`
- In a mode different from the Action mode: `(x => e)`
- To avoid too many parentheses, `(x => e)` may be written as: `x => e`

Compare this to the TLA+2 syntax:

```tla
LAMBDA x: e
```

Similarly, an anonymous operator of `n` arguments is defined as:

- In the Action mode: `{ x_1, ..., x_n => e }`
- In a mode different from the Action mode:
    `(x_1, ..., x_n => e)` or `x_1, ..., x_n => e`

Compare this to the TLA+2 syntax:

```tla
LAMBDA x_1, ..., x_n: e
```

As is common, we can skip parameter names, if we don't need them:

```
{ _ => e }
(_ => e)
_ => e
{ _, ..., _ => e }
(_, ..., _ => e)
_, ..., _ => e
```

Note that lambdas can be only passed as arguments to other operators.  They
cannot be freely assigned to values or returned as a result of an operator.

### Three forms of operator applications

TNT is flexible with respect to operator applications. It mimics several call
styles that can be met in various languages. Given an operator called `f` and
expressions `e_1`, ..., `e_n`, the operator `f` can be applied to the
expressions `e_1`, ..., `e_n` as follows:

 1. *TNT normal form*: `f(e_1, ..., e_n)`.
 1. [UFCS][]: `e_1.f(e_2, ..., e_n)`
 1. *Infix form*: `e_1 f e_2, ..., e_n`

The forms 1-2 always require parentheses, even if the number of arguments in
parentheses is zero. That is, `f()` and `e_1.g()` is the right way to apply
operators `f` and `g` in the normal form and UFCS, respectively. The form
without parentheses is reserved for field access of tuples and records
as well as namespace access.

The form 3 requires at least two arguments, that is, `n >= 2`.

Which form to choose? It's up to you. We prefer to combine all three, whatever
feels more natural in your circumstances. In the future, TNT will provide
automatic translation that will let you to freely switch between all three
forms.

*The TNT normal form is especially convenient for programs, so they should
 communicate in this form. People may communicate in any form.*

For example, some people like to write Boolean expressions like this:

```
p or q and r
```

In the above case, you have to take care of operator priorities (see below).
When you use the UFCS form, you cannot get priorities wrong (calls via dot are
always left-associative if you wonder):

```
p.or(q.and(r))
```

Several operators have conventional names that stem from mathematics and thus
are not written as identifiers.  For instance, you can conveniently write `1 +
3` in the infix form.  But you cannot write `+(1, 3)` or `1.+(3)`, as that
would make the parser unnecessary complex. You can use the mnemonic name `iadd`
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
| `i > j`, `i < j`, `i >= j`, `i <= j`, `i != j`, `i == j`, `i <- j`, `S in T`, `S notin T`, `S subseteq T`  | Integer comparisons, equality, assignment, and set relations |
| `p and q`                    | Boolean 'and' (conjunction)                |
| `p or q`                     | Boolean 'or' (disjunction)                 |
| `p iff q`                    | Boolean equivalence (if and only if)       |
| `p implies q`                | Boolean implication: `not(p) or q`         |
| all forms with `(..)`, `{..}`, and `[..]` |  the lowest priority          |

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
// logical and: p /\ q in TLA+
p and q
p.and(q)
and(p, q)
// logical or: p \/ q in TLA+
p or q
p.or(q)
or(p, q)
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
syntax forms to minimum.

*Mode:* Stateless, State, Temporal. 

### Multiline disjunctions

In the Action mode:

```scala
{ 
  | p_1
  | p_2
  ...
  | p_n
}
```

In a mode different from Action:

```scala
( 
  | p_1
  | p_2
  ...
  | p_n
)
```

Note that we require that `n > 1`.

This is equivalent to `p_1.or(p_2).or( ... or(p_n)...)`. The indentation is not
important.  However, you can produce nice indentation by hand, if you like.
The first occurrence of `|` right after `{` or `(` is optional, it's up to you.

These operators have the normal form too! They are written as `orExpr(p_1, ...,
p_n)` and `orAction(p_1, ..., p_n)` for non-action modes and action mode,
respectively. Most likely, you will never use them, but the tools can.

*Mode:* Any.

### Multiline conjunctions

In the Action mode:

```scala
{
  & p_1
  & p_2
  ...
  & p_n
}
```

In a mode different from Action:

```scala
(
  & p_1
  & p_2
  ...
  & p_n
)
```

Note that we require that `n > 1`.

This is equivalent to `p_1.and(p_2.and( ... and(p_n)...)`. The indentation is not
important.  However, you can produce nice indentation by hand, if you like.
The first occurrence of `&` right after `{` is optional, it's up to you.

These operators have the normal form too! They are written as `andExpr(p_1, ...,
p_n)` in non-action mode and `andAction(p_1, ..., p_n)` in action mode,
respectively. Most likely, you will never use them, but the tools can.

*Mode:* Any.

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
not introduce `CASE` in TNT. Use series of `if-else if-else` expressions.*

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
set(e_1, ..., e_n)
```

This is exactly as `{ e_1, ..., e_n }` in TLA+. However, we prefer not to
sacrifice `{...}` for this only operator. That is why a set is constructed with
`set(...)` in TNT. In practice, this operator does not appear too often, so our
notation would not distract you too much.

*Mode:* Stateless, State. Other modes are not allowed.

**Discussion.** The earlier versions contained an alternative syntax `'{ e_1,
..., e_n }`. After receiving the feedback, we have left just one constructor.

<a name="existsAndGuess"/>

#### Existential quantifier and non-deterministic choice

We introduce two operators that are semantically equivalent to `\E x \in S: P`
of TLA+:

```scala
S exists { x => P }
S.exists( x => P )
exists(S, { x => P } )
S guess  { x => P }
S.guess( x => P )
guess(S, { x => P })
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
| `exists`          | Stateless, State, Temporal             | Mode of `P` |
| `guess`           | Action                                 | Action      |

#### Other set operators

The other operators are introduced and explained in code directly.

```scala
// \A x \in S: P
S forall (x => P)
S.forall(x => P)
forall(S, (x => P))
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
S exclude T
S.exclude(T)
exclude(S, T)
// S is a subset of T (proper or not): S \subseteq T
S subseteq T
S.subseteq(T)
subseteq(S, T)
// set comprehension (map): { e: x \in S }
S map (x => e)
S.map(x => e)
map(S, (x => e))
// set comprehension (filter): { x \in S: P }
S filter (x => P)
S.filter(x => P)
filter(S, (x => P))
// set folding: you can write such a recursive operator in TLA+
S fold init, (v, x => e)
S.fold(init, (v, x => e))
fold(S, init, (v, x => e))
// SUBSET S
S powerset
S.powerset()
powerset(S)
// UNION S
S flatten
S.flatten()
flatten(S)
// Seq(S) of the module Sequences
S seqs
S.seqs()
seqs(S)
// CHOOSE x \in S: TRUE
// The operator name is deliberately made long, so it would not be the user's default choice.
S choose_some
S.choose_some()
// There is no special syntax for CHOOSE x \in S: P
// Instead, you can filter a set and then pick an element of it.
S.filter(x => P).choose_some
```

These operators are defined in the module `FiniteSets` in TLA+. TNT has these
two operators in the kernel:

```scala
// IsFiniteSet(S)
S isFinite
S.isFinite()
isFinite(S)
// Cardinality(S)
S cardinality
S.cardinality()
cardinality(S)
```

*Mode:* Stateless, State. Other modes are not allowed.



### Maps (aka Functions)

```scala
// function application: f[e]
f[e]
f.get(e)
get(f, e)
// function domain: DOMAIN f
f keys
f.keys()
keys(f)
// function constructor: [ x \in S |-> e ]
S mapOf (x => e)
S.mapOf(x => e)
mapOf(S, (x => e))
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
f updateAs e1, (old => old + y)
f.updateAs(e1, (old => old + y))
updateAs(f, e1, (old => old + y))
// an equivalent of (k :> v) @@ f when using the module TLC
f put k, v
f.put(k, v)
put(k, v)
```

*Mode:* Stateless, State. Other modes are not allowed.

### Records

```scala
// record constructor: [ f_1 |-> e_1, ..., f_n |-> e_n ]
// Warning: n >= 1
{ f_1: e_1, ..., f_n: e_n }
rec(f_1, e_1, ..., f_n, e_n)
// Set of records: [ f_1: S_1, ..., f_n: S_n ].
// No operator for it. Use a set comprehension:
tuples(S_1, ..., S_n).map(a_1, ..., a_n => { f_1: a_1, ..., f_n: a_n })
// access a record field: r.fld
r.fld           // both r and fld are identifiers
field(r, "fld") // r is an identifier, "fld" is a string literal
// the set of field names: DOMAIN r
r fieldNames
r.fieldNames()
fieldNames(r)
// record update: [r EXCEPT !.f = e]
r with f, e
r.with(f, e)
with(r, f, e)
```

Note that we are using the syntax `{ name_1: value_1, ..., name_n: value_n }`
for records, similar to Python and JavaScript. We have removed the syntax for
sets of records: (1) It often confuses beginners, (2) It can be expressed with
`map` and a record constructor. Moreover, sets of records do not combine well
with discriminated unions.

*Mode:* Stateless, State. Other modes are not allowed.

### Discriminated unions

TNT has provides the user with special syntax for constructing and destructing
discriminated unions.  For the type syntax of discriminated unions, see
[Types](#types).

**Constructors.** Construct a tagged record by using the record syntax, e.g.:

```scala
  { tag: "Cat", name: "Ours", year: 2019 }
```

Note that the above record has the field `tag`. Hence, this record is assigned
a union type of one element:

```scala
type CAT_TYPE =
  | { tag: "Cat", name: str, year: int }
```

Records of different union types may be mixed in a single set. For example:

```scala
val Entries =
  set(
    { tag: "Cat", name: "Ours", year: 2019  },
    { tag: "Cat", name: "Murka", year: 1950 },
    { tag: "Date", day: 16, month: 11, year: 2021 },
  )
```

In the above example, the set elements have the following union type:

```scala
type ENTRY_TYPE =  
  | { tag: "Cat", name: str, year: int }
  | { tag: "Date", day: int, month: int, year: int }
```

When we construct the individual records, they still have singleton union
types.  For instance, the entry  `{ tag: "Date", day: 16, month: 11, year: 2021
}` has the type:

```scala
type DATE_TYPE = 
  { tag: "Date", day: int, month: int, year: int }
```

**Set filters.** The most common pattern over discriminated union is to filter
set elements by their tag. Using the above definition of `Entries`, we can
filter it as follows:

```scala
Entries.filter(e => e.tag == "Cat")
```

As expected from the semantics of `filter`, the above set is equal to:

```
set(
  { tag: "Cat", name: "Ours", year: 2019  },
  { tag: "Cat", name: "Murka", year: 1950 }
)
```

Importantly, its elements have the type:

```scala
type CAT_TYPE =
  | { tag: "Cat", name: str, year: int }
```

**Destructors.** Sometimes, we have a value of a union type that is not stored
in a set. For this case, TNT has the union destructor syntax.  For example,
given an entry from `Entries`, we can compute the predicate `isValid` by case
distinction over tags:

```scala
pred isValid(entry): ENTRY_TYPE => bool =
  entry match
     | "Cat": cat =>
       name != "" and cat.year > 0
     | "Date": date =>
       date.day in (1 to 31) and date.month in (1 to 12) and date.year > 0
```

In the above example, the names `cat` and `date` have the singleton union types
of `CAT_TYPE` and `DATE_TYPE`, respectively. Note that the expressions after
the tag name (e.g., `"Cat":` and `"Date":`) follow the syntax of
single-argument lambda expressions. As a result, we can use `_` as a name,
which means that the name is omitted.

Match expressions require all possible values of `tag` to be enumerated. This is
ensured by the type checker.

We do not introduce parentheses in the syntax of `match`. If you feel uncomfortable
about it, wrap the whole match-expression with `(...)`.

*Grammar*:

```bnf
  expr "match" ("|" string ":" (identifier | "_") "=>" expr)+
```

*Normal form*: Consider the match operator:

```scala
  ex match
    | tag_1: x_1 => ex_1
    ...
    | tag_n: x_n => ex_n
```

Its normal form is `union_match(ex, tag_1, (x_1 => ex_1), ..., (x_n => ex_n))`.

*Mode:* Stateless, State. Other modes are not allowed.

**Discussion.** In TLA+, there is no separation between discriminated unions
and records. It is common to use tagged records to distinguish between different
cases of records. TNT makes this pattern explicit.

### Tuples

In contrast to TLA+, TNT tuples have length of at least 2.
If you need sequences, use sequences.

```scala
// Tuple constructor: << e_1, ..., e_n >>
// Warning: n >= 2
(e_1, ..., e_n)
tup(e_1, ..., e_n)
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

### Lists (aka Sequences)

In contrast to TLA+, there is no special module for sequences. They are built
in the kernel of TNT. A parser can compute, whether operators on sequences are
used in the spec.

```scala
// sequence constructor: <<e_1, ..., e_n>> (which is also a tuple in TLA+)
[ e_1, ..., e_n ]
seq(e_1, ..., e_n)
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
s.head()
head(s)
// sequence tail: Tail(s)
s tail
s.tail()
tail(s)
// sequence length: Len(s)
s length
s.length()
length(s)
// sequence element at nth position (starting with 1): equivalent to s[i] in TLA+
s nth i
s.nth(i)
nth(s, i)
// the set of sequence indices (starting with 1): DOMAIN s
s indices
s.indices()
indices(s)
// [ seq EXCEPT ![i] = e ]
s replaceAt i, e
s.replaceAt(i, e)
replaceAt(s, i, e)
// SubSeq(s, j, k)
s slice j k
s.slice(j, k)
slice(s, j, k)
// SelectSeq(s, Test)
s select Test
select(s, Test)
// in particular, we can use anonymous operators
s select (e => P)
// Left fold. There is no standard operator for that in TLA+,
// but you can define it with a recursive operator.
s foldl init, (i, v => e)
s.foldl(init, (i, v => e))
foldl(s, init, (i, v => e))
// Right fold. There is no standard operator for that in TLA+,
// but you can define it with a recursive operator.
s foldr init, (i, v => e)
s.foldr(init, (i, v => e))
foldr(s, init, (i, v => e))
```

*Mode:* Stateless, State. Other modes are not allowed.

### Integers

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
m to n
m.to(n)
to(m, n)
```

*Mode:* Stateless, State. Other modes are not allowed.

### Nested operator definitions

There is not much to say here. They are almost identical to the top-level
operators, except that they are visible only to the containing top-level
operator. Nested operator definitions may contain nested operator definitions
too.

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
("val" | "def" | "pred" | "action" | "temporal")
  <identifier>[ "(" <identifier> ("," ..."," <identifier>)* ")" ] [ ":" <type>] "=" <expr>
<expr>
```

*Mode:* The modes are defined as in the case of the top-level operators.  As
expected, the mode of an inner operator should not be more general then the
mode of the outer operator.

### Operators on actions

In comparison to TLA+, TNT has a tiny set of action operators. The other action
operators of TLA+ were moved to the temporal operators, because they are
required only in temporal reasoning.

#### Delayed assignment

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
{
  & x <- 4
  & x + 1 > 0
}
```


*Every state variable `x` must be assigned via `x <- e` at most once in every step.*

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

#### Guess

See the discussion in: [Existential quantifier and non-deterministic
choice](#existsAndGuess).

#### Other action operators of TLA+

There is no equivalent of the composition operators `A \cdot B`. It is no
supported by TLC, so the chance that you will need it is very low. We can add
it later, if you have a use-case for it.

### Temporal operators

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
the translation of a TNT expression `e` to TLA+, then `f'` is the translation
of `e'` to TLA+. In contrast to TLA+, we restrict `next` to the Temporal mode.
Hence, we cannot use `next` in actions. In actions, we should only use `<-`.

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

#### Stutter

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

#### Nostutter

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

#### Other temporal operators

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

### Unbounded quantifiers

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
exists_const(x => P)
forall_const(x => P)
choose_const(x => P)
```

We add the suffix "const" to the operator names to stress the fact that these
operators quantify over the constants of the first-order universe.

*Mode:* Stateless, State, Temporal. No Action mode.

<a name="instances"/>

## Instances

Given a stateful module `M`, we can turn `M` into another module `I`
by rewriting constants and variables of `M`. In this case, module `I` is called
an instance of `M`.

### Common case 1

The most common example is shown below:

```scala
// in Voting.tnt  
  module Voting {
    const Value: set(int)
    const Acceptor: set(str)
    const Quorum: set(set(str))
    // no const, no var below
    // ...
    pred chosen = Value filter (v => Ballot exists (b => ChosenAt(b, v)))
    // ...
  }

// in MC.tnt
  module MC {
    val Acceptor = set("p1", "p2", "p3")
    val Quorum = MC_Acceptor.powerset.filter(Q => Q.cardinality > 1)

    // an instance of Voting that has the name "V"
    module V = Voting(Value = set(0, 1), Acceptor = Acceptor, Quorum = Quorum)
    // ...
  }
```

In the above example, module `V` is produced from the module `Voting` by replacing
every occurrence of `Value`, `Acceptor`, and `Quorum` with `set(0, 1)`, `Acceptor`,
and `Quorum`, respectively.

We can shorten identity substitutions `Acceptor = Acceptor` and `Quorum =
Quorum` by writing:

```scala
    module V = Voting(Value = set(0, 1), *)
```

### Common case 2

Another common example is to rename variables:

```scala
module root {
  module XY {
    var x: int
    var y: int

    pred Init = (
      & x == 0
      & y == 0
    )

    action Next = {
      & x <- x + 1
      & y <- y + 2
    }
  }

  var a: int
  var b: int

  module AB = XY(x = a, y = b)
}
```

In this case, our substitution is a bijection: No two variables are mapped on
the same variable. Hence, the module `AB` will look like follows:

```scala
  module AB = {
    pred Init = (
      & a == 0
      & b == 0
    )

    action Next = {
      & a <- a + 1
      & b <- b + 2
    }
  }
```

### The general case

We may instantiate a module by substituting *state variables* with expressions
over other variables. Consider the following example:

```scala
module root {
  module Counters {
    var x: int
    var y: int

    pred Init = {
      & x == 1
      & y == 0
    }

    action Next = {
      & x <- x + 1
      & y <- x
    }
  }

  module MyCounters {
    var x: int

    module C = Counters(x = x, y = x - 1)
  }
}
```

In the above example, we produce the stateless module `C` from the stateful
module `Counters` by replacing `x` with `x` and `y` with `x - 1`. How is that
even possible in the presence of updates? Here is how `module C` would look
like after instantiation:

```scala
module C = {
  pred Init = (
    & x == 1
    & x - 1 == 0
  )

  temporal Next = {
    & next(x) == x + 1
    & next(x - 1) == x
  }
}
```

The trick here is that since an expression like `x - 1 <- x` does not have
meaningful semantics, we upgrade all actions to temporal formulas and use
`next(e1) = e2` instead of `e1 <- e2`. At this point, we are in the realm of
expressions that look very much like TLA+ formulas, just using a slightly
different syntax. Most likely, we just want to get `C` transpiled into TLA+ and
write some proofs in TLAPS.

### No anonymous instances

TLA+ allows one to instantiate a module and inject its definitions directly in
the namespace of another module, e.g.:

```tla
------ MODULE Bar -------
VARIABLE x
A(y) == x + y
=========================

------- MODULE Foo ------
VARIABLE z
INSTANCE Bar WITH x <- z
=========================
```

TNT does not provide syntax sugar for doing that. If you want to achieve
something similar in TNT, then you can use `import` as follows:

```scala
// Bar.tnt
module Bar {
  var x: int
  def A(y) = x + y
}

// Foo.tnt
module Foo {
  var z: int

  module _FooBar = Bar(x = z)
  import _FooBar.*
}
```

Our solution is not exactly equivalent to the TLA+ specification: We had to
explicitly introduce the name `_FooBar` for the module. By convention, other
modules should not access names that start with underscore (`_`). Should this
happen, a TNT parser may issue a warning.

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
the module `Integers` that extends the operators of the module `Naturals`.  TNT
does not have this issue, as integers are simply built-in in the language.  We
do not have the bearing of history in TNT and thus we can simplify namespaces
and instances.

[UFCS]: https://en.wikipedia.org/wiki/Uniform_Function_Call_Syntax
[Specifying Systems]: https://lamport.azurewebsites.net/tla/book.html
