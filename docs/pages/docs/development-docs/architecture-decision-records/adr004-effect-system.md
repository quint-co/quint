# ADR004: An Effect System for Quint

| Revision | Date       | Author           |
| :------- | :--------- | :--------------- |
| 4        | 26.04.2023 | Gabriela Moreira |

## Summary

Reasoning about state changes in a system is difficult. Automating analysis of
the aggregate state updates and reads specified by operators is tricky. To
ensure specifications are valid before they are handed to the model checker and
to provide users with clear feedback on invalid updates or failures to make
required updates, we propose a simple read & update effect system for Quint.
This system has two objectives:

1. Check that Quint modes are respected regarding their effects.
2. Check that each variable is updated exactly once at `next`.

## Context

We want to be more explicit about different components of a specification. For
this reason, each Quint definition has a mode. Because there's also the
possibility of higher order operators, we thought it would be wise to define
modes in terms of effects in a system that is independent of the type system and
much simpler. With a read & update effect system, we can also check whether a
composition of actions in `next` is enough to define updates to all variables
and ensure that no variable is redefined.

## Options

We considered a unified system that accounted for effects in the types versus a
type-and-effect system, where the types and effects are analyzed separately. As
far as the initial exploration went, there's no evidence of a need to correlate
both systems, so we chose a standalone effect system for the isolation
simplicity.

## Solution

Quint expressions and definitions can be assigned both a type and an effect,
which are independent of each other. Here are some examples of inferred effects
for some definitions:

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

Effects for operators can depend on the effect of their parameters. In the
example for operator `P`, the effect defines that the parameter can have a Read
and Temporal effect, and the result effect will be the same - for that, we
capture the some values in quantified variables `r1` and `t1`.

### How restrictive should `pure` definitions be?

We have two alternatives for the `pure` keyword:

1. Only allow Pure parameters and Pure result
2. Allow parameters with Read effects as long as the resulting effect doesn't
   read any other variables

Option 1 may be too restrictive and barely used, since, for most operators, it's
desirable that they can be applied to state variables (i.e. `+` in `x + 1` if
`x` is a state variable).

### Decision

We have decided to implement option 2 for all modes. According to this option, a
definition is considered pure if it does not add any read effect on top of the
effects that the parameters may carry. A definition is considered (impure) `def` if it
introduces a new `Read` effect, but does not introduce any `Update` or
`Temporal` effects. The same principle applies to other types of definitions.

### Notation

```
StateVariable 'x', 'y', 'z'
ConstantExpression c
Operator op
EntityVariable v
Entities V, Vi ::= v | 'x' | V1, ..., Vn
EffectVariable e
Effect E, Ei ::= e | Read[V] | Update[V] | Temporal[V] | Pure | E & E | (E0, ..., EN) => E
Expression expr, expri ::= any Quint expression
Context Γ ::= lookup tables and previously inferred effects
Substitution S, Si ::= {e ↦ E} | {v ↦ V} | S ∪ S
```

### Representation

This section describes how the effects are represented in typescript code, as
this is not straightforward.

### Entities

Effects act upon `Entities`, which are typically lists of state variables.
However, we also need to represent entities as a variable that can later be
replaced with the actual state variables and combinations (unions) of those.
This is necessary for defining effect signatures for operators.

Consider an operator such as `+` (`iadd`), which takes two arguments, each with
its own effect, and returns a value whose effect is the combination of the
effects of the arguments. We could write the signature of `iadd` as:

```
iadd: (Read[r1] & Temporal[t1]) => (Read[r2] & Temporal[t2]) => Read[r1, r2] & Temporal[t1, t2]
```

Here, `r1`, `r2`, `t1` and `t2` are entity variables, which can be substituted
with the actual state variables during inference.

A concrete entity with no state variables and an union of zero entities are both
considered empty entities, and we say they nullify the effect acting upon them.
For example, replacing `r` with an empty entity in `Read[r]` results in `Read[]`
which is equivalent to `Pure`.

```typescript
/*
 * The Entity an effect acts upon. Either a list of state variables, an
 * entity variable or a combination of other entities.
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
the spec. It also carries an optional reference to the expression in which the
state variable occurred, which is used for error reporting.

```typescript
/* A state variable */
export interface StateVariable {
  /* The variable name */
  name: string,
  /* The id of the expression in which the state variable occurred */
  reference: bigint
}
```

### Effects

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
structured as a list of effect components. An effect component has a kind and an
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

The effect signature of an operator may depend on its parameters. For that reason,
we also define arrow effects, which carry a list of effects for the respective
parameters of an operator and the effect resulting from the operator's application.

```typescript
/* Arrow effects for expressions with effects depending on parameters */
export interface ArrowEffect { kind: 'arrow', params: Effect[], result: Effect }
```

There is a separate class of variables that range over effects, which can be
substituted with another effect during inference. Effect variables are the most general kind of effects.
When no effect information for a given expression is available, the effect is left
undetermined, as indicated by an effect variable. I.e. `def foo(x) = x` is inferred to have the effect signature `(e) => e`, where `e` is an effect variable, since there are no constraints on the effect of `x`. An **effect variable** `e` is equivalent to the effect `Read[v1] & Update[v2] & Temporal[v3]`, where `v1`, `v2` and `v3` are _entity variables_.

```typescript
/* A variable standing for an unknown effect */
export interface EffectVariable { kind: 'variable', name: string }
```

### Effect Schemes

Both effects and entities can be universally quantified, and we need to keep
track of which of them are. Effect schemes are responsible for keeping track of that
information.

```typescript
/*
 * An effect scheme, listing which effect variables (represented by the names of effect variables)
 * and entity variables (represented by the names of entity variables) are universally quantified
 * in the effect
 */
export type EffectScheme = {
  /* The effect */
  effect: Effect,
  /* The names of universally quantified Effect variables */
  effectVariables: Set<string>,
  /* The names of universally quantified Entity variables */
  entityVariables: Set<string>,
}
```

An effect like `(e25, Read[v22]) => Read['x', v22])` with both `e25` and `v22`
being universally quantified would be represented as:

```typescript
{
  effect: ...,
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
cases where we would need to. Those workarounds rely on reasoning about one
of the unions as a single new variable, which is done by introducing a new
hashed variable, which is then binded to the other union. A hashed variable for
the union `r1, r2, r3` is `r1#r2#r3`. This hashing procedure is also used to
unpack tuples into lambdas that take more than one argument.

### Inference rules

Inferring names: variables have effect `Read[<variable_name>]` (unless they are
used as targets of assignment, where their resulting effect will be inferred
correctly as `Update[<variable_name>]`).

```
-------------------------------------- (VAR)
      Γ ⊢ var name: Read[name]
```


Constants values are always pure. Constants with arrow types have arrow effects
with standard propagation of read and temporal effects
```
  type annotation for c is not oper
------------------------------------- (CONST-VAL)
      Γ ⊢ const c: Pure
```

```
     type annotation for c is oper with n args
-------------------------------------------------------- (CONST-OPER)
Γ ⊢ const c: propagateComponents(['read', 'temporal'])(n)
```

PS: See the definition for `propagateComponents` in the next section.

Lambda parameters have an effect variable with a name built from the parameter
name and its reference, which can always be found in the context. This way, we
ensure that the effect is the same for all ocurrences of that parameter.

```
 { kind: 'param', identifier: p, reference: ref } ∈ Γ
------------------------------------------------------- (LAMBDA-PARAM)
               Γ ⊢ p: e_p_ref
```

There is also a special rule for the underscore parameter, which is always a fresh
effect variable:

```
 { kind: 'param', identifier: '_', reference: ref } ∈ Γ
                e <- freshVar
------------------------------------------------------- (UNDERSCORE)
               Γ ⊢ '_': e
```


Name expressions are simply looked up in the context. If the operator is a built-in,
it's signature must already be on the context, since there is no body to infer it from.
```
{ identifier: name }: E ∈ Γ
-----------------------------(NAME)
      Γ ⊢ name: E
```

Inferring operator application: find its signature and try to unify with the
parameters. Assume `freshVar` always returns unused names, and `unify` returns a
substitution unifying the two given effects. `S(E)` applies said substitution to
an effect `E`. Assume `newInstance(E)` returns `E`  with all its quantified variables
substituted by fresh ones, and `quantify(E)` finds all non free variables in the
`E` and quantifies them.

```
{ identifier: op, effect: E } ∈ Γ    Γ ⊢ p0:E0 ... Γ ⊢ pn:EN
Eres <- freshVar   S = unify(newInstance(E), (E0, ...,  EN) => Eres)
------------------------------------------------------------------- (APP)
          Γ ⊢ op(p0, ..., pn): S(Eres)
```

Operator definitions (top-level or inside let-in's) carry the effect of their bodies.

```
            Γ ⊢ expr: E
---------------------------------- (OPDEF)
   Γ ⊢ (def op(params) = expr): E
```

Lambda parameters can have any shape since we allow high order operators.
```
                 Γ ⊢ expr: E
------------------------------------------------------- (LAMBDA)
Γ ⊢ (p0, ..., pn) => expr: quantify((E0, ..., En) => E)
```

Let-in expressions assume the effect of the expression in its body.
```
    Γ ⊢ expr: E
------------------------- (LET)
  Γ ⊢ <opdef> { expr }: E
```

Literals are always `Pure`.

### Built-in operators

The effect signatures for built-in operators are defined using two different
methods. For general operators that only propagate the effects of their
arguments, we define helper functions that generate signatures for a given arity
and list of component kinds to be propagated. For operators that have more
meaningful effects, we define their signatures directly.

For example, most binary operators (such as `+` and `implies`) use a helper
function that allows expressions in the arguments to read or apply temporal
operators over state variables, but not to update them. Therefore, we only
propagate `read` and `temporal` components. The `propagateComponents` function
takes a list of component kinds and returns a function that takes the arity of
the operator and returns the signature for that arity. The signature for arity 2
is the following:

```quint
propagateComponents(['read', 'temporal'])(2):
  (Read[r1] & Temporal[t1], Read[r2] & Temporal[t2]) => Read[r1, r2] & Temporal[t1, t2]
```

Here are some examples of signatures for non-general operators:

```quint
always: (Read[r] & Temporal[t]) => Temporal[r, t]
guess: (Read[r1], (Read[r1]) => Read[r2] & Update[u]) => Read[r1, r2] & Update[u]
assign: (Read[r1], Read[r2]) => Read[r2] & Update[r1]
```

### Checking modes

Modes are qualifiers for quint operators that describe the user's expectation
about the effect of that operator. We avoid exposing effects to the user, so we
only use the effect information to check against the given modes. We provide
error messages with fix instructions when the given mode is stricter than the
inferred effect.

Consider the following example:

```quint
module foo {
  var x: int

  def bar(y) = x' = y
}
```

The inferred effect for `bar` is:

```
∀ v0 . (Read[v0]) => Read[v0] & Update['x']
```

Which is incompatible with `def` mode. The mode checker will report an error:

```
test.qnt:4:3 - error: [QNT200] def operators may only read state variables, but operator `bar` updates variables 'x'. Use action instead.
4:   def bar(y) = x' = y
     ^^^^^^^^^^^^^^^^^^^

```

### Checking for multiple updates

Multiple updates of the same state variable are not allowed in Quint. We check
for these after the inference process by scanning the inferred effects in an
additional static analysis procedure called `MultipleUpdatesChecker`.
Previously, we performed this check during unification, but then it was not
possible to report meaningful error messages.

Consider the following spec that updates variable `x` twice:

```quint
module foo {
  var x: int

  action bar = all {
    x' = 1,
    x' = 2,
  }
}
```

The inferred effect for `bar` is:

```
Update['x', 'x']
```

The multiple updates checker will report the following errors:

```
test.qnt:5:5 - error: [QNT202] Multiple updates of variable x
5:     x' = 1,
       ^^^^^^

test.qnt:6:5 - error: [QNT202] Multiple updates of variable x
6:     x' = 2,
       ^^^^^^
```
