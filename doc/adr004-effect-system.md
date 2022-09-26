# ADR004: An Effect System for TNT

| Revision | Date       | Author           |
| :------- | :--------- | :--------------- |
| 3        | 26.09.2022 | Gabriela Moreira |

## Summary

Reasoning about state changes in a system is difficult. It is even tricky to try
to automate analysis of the aggregate state updates and reads that are specified
by a set of operators. We would like to have an elegant way of ensuring
specifications are valid before we hand them to the model checker, and a way of
providing users with clear feedback on when they are making invalid updates (or
failing to make required updates).

This is the proposal of a simple read & update effect system for TNT, with two
objectives:
1. Check that TNT modes are respected regarding their effects,
2. Check that each variable is updated exactly once at `next`.

## Context

Towards being more explicit about different components of a specification, each
TNT definition has a mode. Because there's also the possibility of higher order
operators, we thought it would be wise to define modes in terms of effects in a
system that is independent of the type system and much simpler. With a read &
update effect system, we can also check whether a composition of actions in
`next` is enough to define updates to all variables and ensure that is not
re-defining any variable.

## Options

We considered a unified system that accounted for effects in the types versus a
type-and-effect system, where the types and effects are analyzed separately. As
far as the initial exploration went, there's no evidence of a need to correlate
both systems, so we chose a standalone effect system for the isolation
simplicity.

## Solution

TNT expressions and definitions can be assigned both a type and an effect, which
are independent of each other. Here are some examples of inferred effects for
some definitions:

```
var x: int
var y: int

pure P(a) = a + 1 // (Pure) => Pure
state S(a) = x + a // (Pure) => Read['x']

action<x> A1(a) = x <- x + a // (Pure) => Read['x'] & Update['x']
action<x> A2(a) = x <- S(a) // (Pure) => Read['x'] & Update['x']

action<x, y> A3(a) = x <- x + a // (Pure) => Read['x', 'y'] & Update['x', 'y']
```


In these examples, keywords `pure`, `state` and `action` are providing effect
information to be checked against the inferred effect. This information is not
used for inference. Note that information between `<...>` is not part of the
effect system, but actually syntax sugar for unchanged assignments (and
assignments do have influence on effects).

### How restrictive should `pure` definitions be?

This is an open question. We have two alternatives for the `pure` keyword:
1. Only allow Pure parameters and Pure result
2. Allow parameters with Read effects as long as the resulting effect doesn't Read
   any other variables

Option 1 may be too restrictive and barely used, since, for most operators, it's
desirable that they can be applied to state variables (i.e. `+` in `x + 1` if
`x` is a state variable).

PS: alternative names for `pure` are `static` and `stateless`.

### Notation

```
Identifiers v, c, op
Effects E, Ei ::= Read[vars] | Update[vars] | Pure | E & E | (E0, ..., EN) => E
Expressions e, ei ::= any TNT expression
Contexts Γ ::= { kind: 'var' | 'const' | 'param', identifier: v } | { kind: 'def', identifier: op, effect: E } | Γ ∪ Γ
Substitutions S, Si ::= {v ↦ E} | {v ↦ c} | S ∪ S
```

### Normal form

A normalized effect takes only one of two forms:

```
Effects E ::= Read[vars] & Update[vars] | (E0, ..., EN) => E 
```

Other forms are actually sugaring for these two. Effects like `Update['x'] &
Update['y']` are in an invalid format and should be simplified before applying
any other transformation. See equivalence rules below.

The motivation for this form is to help writing effect signatures for operators
that care only about the read or the update part of some effect. For example,
the `or` operator representing disjunction in TNT takes expressions with the
identical updates, but doesn't have any restrictions on the read part. Ensuring
this normal form allows us to write its signature as `(Read[r1] & Update[u],
Read[r2] & Update[u]) => Read[r1 ∪ r2] & Update[u]`.

### Equivalence rules

These are some equivalence rules to be used alongside unification, but that
don't require any substitution. These are applied in a simplification process
with the goal of reaching the normal form. Equivalence between `E1` and `E2` is
expressed by `E1 ≡ E2`, and the equivalence symbol `≡` has the lowest precedence
on this system.

```
E1 ≡ Ex & Read[x0, ..., xn]   E2 ≡ Ey & Read[y0, ..., yn]
---------------------------------------------------------- (READ)
E1 & E2 ≡ Ex & Ey & Read[x0, ..., xn, y0, ..., yn]


E1 ≡ Ex & Update[x0, ..., xn]   E2 ≡ Ey & Update[y0, ..., yn]
             {x0, ..., xn} ∩ {y0, ..., yn} ≡ ∅
-------------------------------------------------------------- (UPDT)
E1 & E2 ≡ Ex & Ey & Update[x0, ..., xn, y0, ..., yn]

Pure ≡ Read[] ≡ Update[] ≡ Read[] & Update[] 
E & Pure ≡ E
E1 & E2 ≡ E2 & E1
E1 & (E2 & E3) ≡ (E1 & E2) & E3
```

One might be inclined to treat `Read[vars] & Update[vars]` and `Update[vars]` as
equivalent, reasoning that one must be able to read a variable in order to
update it. However, in TLA we can update a variable without reading it's current
value: `x <- x + 1` is different from `x <- 2`. We anticipate there may be
utility in differentiating these cases, such as being able to partition
transitions that only read a variable on the current state from transitions that
only update a variable (that is, its value on the next state).

### Unification

Should be pretty straightforward variable substitution for both effect variables
and variables inside Read and Update statements.

### Inference rules

Inferring names: variables have effect `Read[v]` (unless they are used in as
targets of assignment, where their resulting effect will be inferred correctly
as `Update[v]`), constants have no effect (Pure), values used as parameters can
read variables (the read variables are introduces as a new quantification over
variables with the parameter name prefixed by `r_`) operators resolve to the
effect of their respective bodies.

```
{ kind: 'var', identifier: v } ∈ Γ
------------------------------------ (NAME-VAR)
      Γ ⊢ v: Read[v]

{ kind: 'const', identifier: c } ∈ Γ
------------------------------------- (NAME-CONST)
      Γ ⊢ c: Pure
      
 { kind: 'param', identifier: p } ∈ Γ
------------------------------------ (NAME-PARAM)
         Γ ⊢ v: Read[r_p]

{ identifier: op, effect: E } ∈ Γ
-------------------------------------- (NAME-OP)
          Γ ⊢ op: E
```

Inferring operator application: find its signature and try to unify with the
parameters. Assume `freshVar` always returns unused names, and `unify` returns a
substitution unifying the two given effects. `S(E)` applies said substitution to
an effect `E`.

```
{ identifier: op, effect: E } ∈ Γ    Γ ⊢ p0:E0 ... Γ ⊢ pn:EN
Eres <- freshVar   S = unify(E, (E0, ...,  EN) => Eres)
------------------------------------------------------ (APP)
          Γ ⊢ op(p0, ..., pn): S(Eres)
```

Operator definitions (top-level or inside let-in's): infer signature and add it to context
```
                       Γ ⊢ e: E
------------------------------------------------------------- (OPDEF)
Γ ∪ { identifier: op, effect: E } ⊢ (def op(params) = e): Pure
```

Lambda parameters can have any shape since we allow high order operators.
```
                 Γ ⊢ e: E
---------------------------------------------- (LAMBDA)
Γ ⊢ (p0, ..., pn) => e: (E0, ..., En) => E
```

Let-in expressions assume the effect of the expression in its body.
```
    Γ ⊢ e: E
----------------------- (LET)
Γ ⊢ <opdef> { e }: E
```

Literals are always `Pure`.

### Examples of built-in operator signatures
```
exists: (Read[r1], (Read[p]) => Read[r2]) => Read[r1, p, r2] 
guess: (Read[r1], (Read[p]) => Read[r2] & Update[u]) => Read[r1, p, r2] & Update[u]
+(iadd): (Read[r1], Read[r2]) => Read[r1, r2]
assign: (Read[r1], Read[r2] & Update[u2]) => Read[r2] & Update[r1, u2]
```

Some operators support different arity, and therefore are defined as functions that take the number of arguments as parameter and returns the signature for that arity. Some examples for arity 2:
```
andAction: (Read[r1] & Update[u1], Read[r2] & Update[u2]) => Read[r1, r2] & Update[u1, u2]
orAction: (Read[r1] & Update[u], Read[r2] & Update[u]) => Read[r1, r2] & Update[u]
```

### Example
Table testing a simple expression with conflicting effects (x is updated twice):

```
def A = {
  & x <- x + 1
  & x <- x + 2
} => should raise error
```

First expression in the `andAction` application:

```
x: Read['x'] -- by (NAME)
1: Pure
x + 1: Read['x'] -- by (APP)
x <- x + 1: Update['x'] & Read['x'] -- by (APP), see below
  S = unify(
         (Read['x'], Read['x']) => E0
         (Read[v]  , E        ) => Update[v] & E
  ) = {v ↦ 'x', E ↦ Read['x'], E0 ↦ Update['x'] & Read['x']}
  S(E0) = Read['x'] & Update['x']
```

Second expression in the `andAction` application is analogous:

```
x <- x + 2: Read['x'] & Update['x']-- by (APP)
```

Applying (APP) to the `andAction` operator, a unification error is found:

```
unify(
  (Update['x'] & Read['x'], Update['x'] & Read['x']) => E0
  (E1                     , E2                     ) => E1 & E2
) => Error simplifying Update['x'] & Update['x']

{
  & x <- x + 1
  & x <- x + 2
}: Error
```

## Implementation Plan

1. Implement unification system for effects, including simplification, checks
   and substitution application
2. Define effect signatures for all built-in operators
3. Extend name resolution to provide interfaces for obtaining a definition's
   body from its name
4. Write visitor to infer effects and report errors when found.
