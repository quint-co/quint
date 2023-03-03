# ADR004: An Effect System for Quint

| Revision | Date       | Author           |
| :------- | :--------- | :--------------- |
| 4        | 02.03.2023 | Gabriela Moreira |

## Summary

Reasoning about state changes in a system is difficult. It is even tricky to try
to automate analysis of the aggregate state updates and reads that are specified
by a set of operators. We would like to have an elegant way of ensuring
specifications are valid before we hand them to the model checker, and a way of
providing users with clear feedback on when they are making invalid updates (or
failing to make required updates).

This is the proposal of a simple read & update effect system for Quint, with two
objectives:
1. Check that Quint modes are respected regarding their effects,
2. Check that each variable is updated exactly once at `next`.

## Context

Towards being more explicit about different components of a specification, each
Quint definition has a mode. Because there's also the possibility of higher order
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

Quint expressions and definitions can be assigned both a type and an effect, which
are independent of each other. Here are some examples of inferred effects for
some definitions:

```
var x: int
var y: int

pure def P(a) = a + 1 // (Read[r1] & Temporal[t1]) => Read[r1] & Temporal[t1]
def S(a) = y + a // (Read[r1] & Temporal[t1]) => Read['y', r1] & Temporal[t1]

action A1 = x' = x + 1 // Read['x'] & Update['x']
action A2 = x' = S(1) // Read['y'] & Update['x']
```

In these examples, keywords `pure def`, `def` and `action` are providing effect
information to be checked against the inferred effect. This information is not
used for inference.

### How restrictive should `pure` definitions be?

We have two alternatives for the `pure` keyword:
1. Only allow Pure parameters and Pure result
2. Allow parameters with Read effects as long as the resulting effect doesn't Read
   any other variables

Option 1 may be too restrictive and barely used, since, for most operators, it's
desirable that they can be applied to state variables (i.e. `+` in `x + 1` if
`x` is a state variable).

#### Decision

We decided to implement option 2, which also applies of all other modes. That
is, a definition is pure iff it doesn't add any read effect on top of the
effects the parameters may carry. A definition is `def` iff it introduces a new
`Read` effect, but doesn't introduce any `Update` or `Temporal` effects. And so on.

### Notation

```
Identifiers v, c, op
Effects E, Ei ::= e | Read[entity] | Update[entity] | Temporal[entity] | Pure | E & E | (E0, ..., EN) => E
Entities V ::= v | 'x' | v1, ..., vn
Expressions e, ei ::= any Quint expression
Contexts Γ ::= lookup tables and previously inferred effects
Substitutions S, Si ::= {e ↦ E} | {v ↦ V} | S ∪ S
```

### Representation

This section describes how the effects are represented in typescript code, as
this is not straightforward.

#### Entities

Effects act upon entities. An entity is normally a list of state variables, but
we also need to represent them as a variable that can latter be replaced with
the actual state variables and combinations (unions) of those, in order to
define effect signatures for operators. Imagine an operator such as `+`
(`iadd`), that takes two arguments, each with its own effect, and returns a
value whose effect is the combination of the effects of the arguments. We could
write the signature of `iadd` as:

```
iadd: (Read[r1] & Temporal[t1]) => (Read[r2] & Temporal[t2]) => Read[r1, r2] & Temporal[t1, t2]
```

Here, `r1`, `r2`, `t1` and `t2` are entity variables, which can be substituted
with the actual state variables during inferrence.

A concrete entity with no state variables and an union of zero entities are both
considered empty entities, and we say them nullify the effect actin upon them.
For example, replacing `r` with an empty entity in `Read[r]` results in `Read[]`
which is equivalent to `Pure`.

```typescript
/*
 * The Entity an effect acts upon. Either a list of state variables, a
 * variable or a combination of other entities.
 */
export type Entity =
  /* A list of state variables */
  | { kind: 'concrete', stateVariables: StateVariable[] }
  /* A variable representing some entity */
  | { kind: 'variable', name: string, reference?: bigint }
  /* A combination of entities */
  | { kind: 'union', entities: Entity[] }
```

A state variable is just a name that is exactly the name of a state variable in
the spec. It also carries an optional reference to the expression on which the
state variable occurred, which is used for error reporting.

```typescript
/* A state variable */
export interface StateVariable {
  /* The variable name */
  name: string,
  /* The id of the expression on which the state variable ocurred */
  reference: bigint
}
```

#### Effects

An effect can also have three different forms: concrete, arrow and variable.

```typescript
/*
 * The effect of a Quint expression, regarding which state entities are read
 * and/or updated
 */
export type Effect =
  | ConcreteEffect
  | ArrowEffect
  | EffectVariable
```

The most basic representation of effects is a concrete effect, and it is
structured as a list of effect components. An effect component has kind and an
entity. The kind can be `read`, `update` or `temporal`, and the entity is the
entity the effect acts upon.

```typescript
/* Kinds for concrete effect components */
export type ComponentKind = 'read' | 'update' | 'temporal'

/* A concrete effect component, specifying a kind and the entity it acts upon */
export interface EffectComponent { kind: ComponentKind, entity: Entity }

/* Concrete atomic effects specifying which kinds of effects act upon which entities */
export interface ConcreteEffect { kind: 'concrete', components: EffectComponent[] }

```

The effect `Read['x', 'y'] & Update[v]` would be represented as:

```typescript
{
  kind: 'concrete',
  components: [
    { kind: 'read', entity: { kind: 'concrete', stateVariables: [{ name: 'x', reference: 1n }, { name: 'y', reference: 2n }] } },
    { kind: 'update', entity: { kind: 'variable', name: 'v' } },
  ],
}
```

Effect signatures for operators may depend on its parameters. For that purpose,
we also define arrow effects, which carry a list of effects for the respective
parameters of an operator and the resulting effect.

```typescript
/* Arrow effects for expressions with effects depending on parameters */
export interface ArrowEffect { kind: 'arrow', params: Effect[], result: Effect }
```

Just like with entities, an effect can also be a variable, which can be
substituted with another effect during inferrence. Those are the most general
kinds of effects, and will be used when no effect information for a given
expression is available, i.e. `def foo(x) = x` will have a `(e) => e` effect
signature, where `e` is an effect variable, since there are no constraints on
the effect of `x`. An effect variable is equivalent to `Read[v1] & Update[v2] &
Temporal[v3]`, where `v1`, `v2` and `v3` are entity variables.

```typescript
/* A variable representing some effect */
export interface EffectVariable { kind: 'variable', name: string }
```

#### Effect Schemes

Both effects and entities can be universally quantified, and we need to keep
track of which of them are. Effect schemes are responsible to keep track of that
information.

```typescript
/*
 * An effect scheme, listing which effect variables (names referring to effects)
 * and entity variables (names refering to entities) are universally quantified
 * in the effect
 */
export type EffectScheme = {
  /* The effect */
  effect: Effect,
  /* Universally quantified names refering to Effects */
  effectVariables: Set<string>,
  /* Universally quantified names refering to Entities */
  entityVariables: Set<string>,
}
```

An effect like `(e25, Read[v22]) => Read['x', v22])` with both `e25` and `v22`
being universally quantified would be represented as:

```typescript
{
  effect: ...
  effectVariables: new Set(['e25']),
  entityVariables: new Set(['v22']),
}
```

And pretty printed as:
```
∀ e0, v0 . (e0, Read[v0]) => Read['x', v0]
```

### Unification

Unification is pretty standard. It recursively looks at effect variables and
entity variables to bind. The most complicated part must be the unification of
unions of variables, which requires unifying sets. Since that is too complicated
to implement, we use some workarounds to avoid having to do that in the few
cases where we would need to. Those workarounds revolve on reasoning about one
of the unions as a single new variable, which is done by introducing a new
hashed variable, which is then binded to the other union. A hashed variable for
the union `r1, r2, r3` is `r1#r2#r3`. These hashing procedure is also used to
unpack tuples into lambdas that take more than one argument. 

### Inference rules

Inferring names: variables have effect `Read[<variable_name>]` (unless they are
used in as targets of assignment, where their resulting effect will be inferred
correctly as `Update[<variable_name>]`), constants have no effect (Pure).

```
{ kind: 'var', identifier: name } ∈ Γ
-------------------------------------- (NAME-VAR)
      Γ ⊢ name: Read[name]

{ kind: 'const', identifier: c } ∈ Γ
------------------------------------- (NAME-CONST)
      Γ ⊢ c: Pure
```

Lambda parameters have an effect variable with a name built from the parameter
name and its reference, which can always be found in the context. This way, we
ensure that the effect is the same for all ocurrences of that parameter.

```
 { kind: 'param', identifier: p, reference: ref } ∈ Γ
------------------------------------------------------- (NAME-PARAM)
         Γ ⊢ p: e_p_ref
```

Names of operators resolve to the effect of their respective bodies.

```
{ kind: 'def', identifier: op, body: e } ∈ Γ   Γ ⊢ e : E
----------------------------------------------------------- (NAME-OP)
                      Γ ⊢ op: E
```

If the operator is a built-in, we just return its signature.
0
```
    built-in signature of op is E
--------------------------------------- (NAME-OP-BUILTIN)
         Γ ⊢ op: E
```

Inferring operator application: find its signature and try to unify with the
parameters. Assume `freshVar` always returns unused names, and `unify` returns a
substitution unifying the two given effects. `S(E)` applies said substitution to
an effect `E`.

Assume `newInstance(E)` returns `E`  with all its quantified variables
substituted by fresh ones, and `quantify(E)` finds all non free variables in the
`E` and quantifies them.

```
{ identifier: op, effect: E } ∈ Γ    Γ ⊢ p0:E0 ... Γ ⊢ pn:EN
Eres <- freshVar   S = unify(newInstance(E), (E0, ...,  EN) => Eres)
------------------------------------------------------------------- (APP)
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
---------------------------------------------------- (LAMBDA)
Γ ⊢ (p0, ..., pn) => e: quantify((E0, ..., En) => E)
```

Let-in expressions assume the effect of the expression in its body.
```
    Γ ⊢ e: E
----------------------- (LET)
  Γ ⊢ <opdef> { e }: E
```

Literals are always `Pure`.

### Built-in operators

The effect signatures for built-in operators are defined with two different
methods. For general operators that only propagate the effects of its arguments,
we define some helper functions that generate signatures for a given arity and a
list of component kinds to be propagated. For operators that have a more
meaningful effect, we define them directly.

Here's an example of a helper function used for most binary operators (such as
`+` and `implies`). In the general case, we want to allow expressions that read
or apply temporal operators over state variables to be given as arguments to
those binary operators, but not updates should be allowed. Therefore, we only
propagate `read` and `temporal` components. The function `propagateComponents`
takes a list of component kinds and returns a function that takes the arity of
the operator and returns the signature for that arity. The signature for arity 2
is the following:

```
propagateComponents(['read', 'temporal'])(2):
  (Read[r1] & Temporal[t1], Read[r2] & Temporal[t2]) => Read[r1, r2] & Temporal[t1, t2]
```

Here are some examples of signatures for non-general operators:

```
always: (Read[r] & Temporal[t]) => Temporal[r, t]
guess: (Read[r1], (Read[r1]) => Read[r2] & Update[u]) => Read[r1, r2] & Update[u]
assign: (Read[r1], Read[r2]) => Read[r2] & Update[r1]
```

### Checking modes

Modes are qualifiers for quint operators that describe an expectation of the
user about the effect of that operator. We avoid exposing effects to the user,
so we use the effect information only to check against the given modes,
providing error messages with fix instructions when the given mode is stricter
than the inferred effect.

### Checking for multiple updates

Multiple updates of the same state variable are not allowed in quint. We check
for those after the inferrence process, by scanning the inferred effects in an
additional static analysis procedure called `MultipleUpdatesChecker`.
Previously, we performed this check during unification, but then it was not
possible to report meaningful error messages.
