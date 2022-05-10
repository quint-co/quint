# ADR004: An Effect System for TNT

| Revision | Date       | Author           |
| :------- | :--------- | :--------------- |
| 1        | 10.05.2022 | Gabriela Moreira |

## Summary

This is the proposal of a simple read & update effect system for TNT, with two objectives:
1. Check that TNT modes are respected regarding their effects,
2. Check that each variable is updated exactly once at `next`.

## Context

Towards being more explicit about different components of a specification, each
TNT definition has a mode. Because there's also the possibility of high order
operators, we thought it would be wise to define modes in terms of effects in a
system that is independent of the type system and much simpler. With a read &
update effect system, we can also check whether a composition of actions in
`next` is enough to define all variables and is not re-defining any variable.

## Options

We considered a joint effect + type system versus a standalone effect system. As
far as the initial exploration went, there's no evidence of a need to correlate
both systems, so we chose a standalone effect system for the isolation
simplicity.

## Solution

Here's a rough draft of the effect system, to be updated with further
exploration including a draft implementation.

TNT expressions and definitions can be assigned both a type and an effect, which
can be independent of each other. Here are some example of inferred types and
effects for some definitions, considering some new syntax that is still under
discussion.

```
pure P(a: int): int ~> int -> <Pure, int>
stateless S(a: int): int = x + a ~> <Read[x], int>
action<x> A(a: int) = x' = x + a ~> <Read[x] & Update[x], bool>
action<x, y> A2(a: int) = x' = x + a ~> <Read[x, y] & Update[x, y], bool>
action<x> A3(a:int) = x' = S(a) ~> <Read[x] & Update[x], bool>
```

### Notation

```
Identifiers v, c, op
Effects E, Ei ::= Read[vars] | Update[vars] | Pure | E & E | E -> E
Expressions  e, ei ::= any TNT expression
Context Γ ::= { kind: 'var', identifier: v } | { kind: 'def', identifier: op, effect: E } | Γ ∪ Γ
Substitution S, Si ::= {v ↦ E} | S @@ S
```

### Equivalence rules

These are some equivalence rules to be used alongside unification, but that don't require any substitution.

```
E1 = Ex & Read[x0, ..., xn]   E2 = Ey & Read[y0, ..., yn]
---------------------------------------------------------- (READ)
E1 & E2 = Ex & Ey & Read[x0, ..., xn, y0, ..., yn]


E1 = Ex & Update[x0, ..., xn]   E2 = Ey & Update[y0, ..., yn]
             {x0, ..., xn} ∩ {y0, ..., yn} = ∅
-------------------------------------------------------------- (UPDT)
E1 & E2 = Ex & Ey & Update[x0, ..., xn, y0, ..., yn]

E & Pure = E
E1 & E2 = E2 & E1
E1 & (E2 & E3) = (E1 & E2) & E3
```

### Unification

Should be pretty straightforward variable substitution for both effect variables
and variables inside Read and Update statements.

### Inference rules

Inferring names: variables have effect `Read[v]` (unless they are used in
operator assign, where their effect will be inferred correctly as `Update[v]`),
constants have no effect (Pure).

```
{ kind: 'var', identifier: v } ∈ Γ
------------------------------------ (NAME-VAR)
      Γ ⊢ v: Read[v]

{ kind: 'const', identifier: c } ∈ Γ
------------------------------------- (NAME-CONST)
      Γ ⊢ c: Pure
```

Inferring operator application: find its signature and try to unify with the
parameters. Assuming currification of parameters here, shouldn't change much for
a list of parameters. Assume `freshVar` always returns unused names, and unify
returns a substitution unifying the two given effects. `S(E)` applies said
substitution to an effect `E`.

```
{ identifier: op, effect: E } ∈ Γ    Γ ⊢ e1:Epar
Eres <- freshVar   S = unify(E, Epar -> Eres)
------------------------------------------------------ (APP)
          Γ ⊢ op(e1): S(Eres)
```

Operator definitions (top-level or inside let-in's): infer signature and add it to context
```
                       Γ ⊢ e: E
------------------------------------------------------------- (OPDEF)
Γ ∪ { identifier: op, effect: E } ⊢ def op(params) = e: Pure
```

Lambdas: We can assume lambda parameters are always pure for now.
```
       Γ ⊢ e: E
---------------------- (LAMBDA)
Γ ⊢ x => e: Pure -> E
```

Literals are always `Pure`.

### Examples of built-in operator signatures
```
exists: Pure -> E -> E
and: E1 -> E2 -> E1 & E2
+(iadd): E1 -> E2 -> E1 & E2
or: E -> E -> E
assign: Read[v] -> E -> Update[v] & E
```

### Example
Table testing a simple expression with conflicting effects (x is update twice):

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
x + 1: Read['x'] & Pure -- by (APP)
x <- x + 1: Update['x'] & Read['x'] & Pure -- by (APP), see below
  unify(
         Read['x'] -> Read['x'] & Pure -> E0
         Read[v]   -> E                -> Update[v] & E
  ) = {v ↦ 'x', E ↦ Read['x'] & Pure, E0 ↦ Update['x'] & Read['x'] & Pure}
```

Second expression in the `and` application is analogous:

```
x <- x + 2: Update['x'] & Read['x'] & Pure -- by (APP)
```

Applying (APP) to the `and` operator, a unification error is found:

```
unify(
  Update['x'] & Read['x'] & Pure -> Update['x'] & Read['x'] & Pure -> E0
  E1                             -> E2                             -> E1 & E2
) => Error simplifying Update['x'] & Update['x']

{
  & x <- x + 1
  & x <- x + 2
}: Error
```
