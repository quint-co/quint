# ADR004: An Effect System for TNT

| Revision | Date       | Author           |
| :------- | :--------- | :--------------- |
| 1        | 18.05.2022 | Gabriela Moreira |

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

Here's a rough draft of the effect system, to be updated with further
exploration including a draft implementation.

TNT expressions and definitions can be assigned both a type and an effect, which
can be independent of each other. Here are some examples of inferred returned
types and effects for some definitions, considering some new syntax that is
still under discussion.

```
pure P(a: int): int ~> <Pure, int>
stateless S(a: int): int = x + a ~> <Read[x], int>
action<x> A(a: int) = x <- + a ~> <Read[x] & Update[x], bool>
action<x, y> A2(a: int) = x <- x + a ~> <Read[x, y] & Update[x, y], bool>
action<x> A3(a:int) = x <- S(a) ~> <Read[x] & Update[x], bool>
```

### Notation

```
Identifiers v, c, op
Effects E, Ei ::= Read[vars] | Update[vars] | Pure | E & E | (E0, ..., EN) => E
Expressions e, ei ::= any TNT expression
Contexts Γ ::= { kind: 'var', identifier: v } | { kind: 'def', identifier: op, effect: E } | Γ ∪ Γ
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
the `or` operator representing disjunction in TNT takes two expressions with the
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

One might be inclined to treat `Read[vars] & Update[vars]` and `Update[vars]` as equivalent, reasoning that one must be able to read a variable in order to update it. However, in TLA we can update a variable without reading it's current value: `x <- x + 1` is different from `x <- 2`. We anticipate there may be utility in differentiating these cases, such as being able to partition transitions that only read a variable on the current state from transitions that only update a variable (that is, its value on the next state).
```

### Unification

Should be pretty straightforward variable substitution for both effect variables
and variables inside Read and Update statements.

### Inference rules

Inferring names: variables have effect `Read[v]` (unless they are used in as
targets of assignment, where their resulting effect will be inferred correctly
as `Update[v]`), constants have no effect (Pure), operators resolve to the
effect of their respective bodies.

```
{ kind: 'var', identifier: v } ∈ Γ
------------------------------------ (NAME-VAR)
      Γ ⊢ v: Read[v]

{ kind: 'const', identifier: c } ∈ Γ
------------------------------------- (NAME-CONST)
      Γ ⊢ c: Pure
      
{ kind: ('def' | 'val' | 'pred'), identifier: op, body: e } ∈ Γ   e: E
---------------------------------------------------------------------- (NAME-OP)
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

Lambdas: We can assume lambda parameters are always pure for now.
```
       Γ ⊢ e: E
---------------------- (LAMBDA)
Γ ⊢ x => e: (Pure) => E
```

Literals are always `Pure`.

### Examples of built-in operator signatures
```
exists: (Pure, (Pure) => Read[v]) => Read[v]
guess: (Pure, (Pure) => E) => E
and: (E1, E2) => E1 & E2
+(iadd): (E1, E2) => E1 & E2
or: (Read[r1] & Update[u], Read[r2] & Update[u]) => Read[r1 ∪ r2] & Update[u]
assign: (Read[v], E) => Update[v] & E
```

### Example
Table testing a simple expression with conflicting effects (x is updated twice):

```
def A = {
  & x <- x + 1
  & x <- x + 2
} => should raise error
```

First expression in the `and` application:

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

Second expression in the `and` application is analogous:

```
x <- x + 2: Read['x'] & Update['x']-- by (APP)
```

Applying (APP) to the `and` operator, a unification error is found:

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
