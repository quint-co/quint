# ADR005: A Type System for Quint

| Revision | Date       | Author           |
| :------- | :--------- | :--------------- |
| 1        | 17.08.2022 | Gabriela Moreira |

## Summary

Quint is a statically typed language and, therefore, should offer fast feedback on
the correctness of a specification's types. This ADR proposes a type system to
be used for:
1. Type checking any parsed Quint specification;
2. Providing type information using the Language Server Protocol (LSP), enabling
   useful tools such as auto-completion and type hints.

## Context

Quint's type system should be simple, in consequence of the language design
decisions that avoid ambiguity present in TLA+, eliminating the need for ad-hoc
polymorphism. Using [Apalache's type
system](https://apalache.informal.systems/docs/adr/002adr-types.html) and its
[extension for precise
records](https://apalache.informal.systems/docs/adr/014adr-precise-records.html)
as basis, the proposed type system should be able to infer simple types, match
annotations and handle row types from records and tuples variants.

The type grammar for Quint is already defined at the [Language
Manual](/docs/lang),
so this ADR will cover only type inference and type checking.

## Options

From the start, we were decided to use constraint-based type inference to be
able to directly handle type annotations and row types, using Apalache's
constraint-based type system as basis. The next decision was whether to use a
robust type system from the literature, or design a simpler instance more fit to
Quint's stricter needs (with no recursion and no ad-hoc polymorphism). Some
considered options from the literature were:
1. [OutsideIn](https://www.microsoft.com/en-us/research/publication/complete-and-decidable-type-inference-for-gadts/):
   simpler to implement when compared to other constraint-based approaches in
   the literature, but was designed to handle GADTs which are not on Quints
   roadmap at all, so has a lot of extra complexity involving implication
   constraints.
2. [HM(X)](http://cristal.inria.fr/attapl/emlti-long.pdf): More basic type
   system, with defined extensions for both ADTs and row types. This seemed like
   a good fit at first, but constraint solving for this system showed to be
   surprisingly complex, requiring several implementation components. The
   proposed solving algorithm was shown by the authors to be the most efficient
   possible, but efficiency is not a priority for Quint's type checker, since
   feasible specs (that can be checked in reasonable time) should be smaller
   than a size where type checking time can be an issue.

Considering the cons of these approaches regarding unnecessary complexity and
the small scope of Quint's needs, the decision was to design our own type system
based on Apalache's and the literature algorithms. The drawback of this
approach is that we don't get any proven properties that a state-of-the-art
system would provide.

## Solution

The type system being proposed is a simple equality constraints generator from
Quint expressions, and a constraint solver that unifies and composes those
constraints. It also uses type schemes to define polymorphic types, which allows
a list of variables to be quantified in a type.

Constraint generation is done with an IR visitor implementation, where the
context (mapping names to their types) and the results (mapping each expression
to its generated type and constraint, or to an error) are kept in the class
state as attributes. Constraints are solved every time a new operator is defined
so the type added to the context is the most precise one.

For name references, we just fetch its type from the context, without the need
of a constraint.

```
  n: t ∈ Γ
----------------- (NAME)
 Γ ⊢ n: (t, true)
```

For operator application, we fetch its signature from the context and add a
constraint matching it to a new constructed operator type that takes the
inferred type for the application parameters as arguments and a fresh type
variable as result. This is similar to constraint generation for function
application in algorithms from the literature, but is adapted to consider many
arguments instead of the common currying approach.

```
  op: q ∈ Γ   Γ ⊢  p0: (t0, c0), ..., pn: (tn, cn)    a is fresh
------------------------------------------------------------------------ (APP)
   Γ ⊢ op(p0, ..., pn): (a, q ~ (t0, ..., tn) => a ∧ c0 ∧ ... ∧ cn)
```

Lambdas are also straightforward, and also adapted to take multiple parameters.
We generate a fresh variable for each parameter, add them to the context and
then generate constraints for the expression.

```
   Γ ∪ {p0: t0, ..., pn: tn} ⊢ e: (te, c)    t0, ..., tn are fresh
---------------------------------------------------------------------- (LAMBDA)
           Γ ⊢ (p0, ..., pn) => e: ((t0, ..., tn) => te, c)
```

Top-level operator definitions are interpreted as nested LET-IN expressions, such that a module in the form:
```
def d1 = e1
...
def dn = en
```
is interpreted by the type system as:
```
def d1 = e1 { ... { def dn = en } }
```

For LET-IN expressions, the visitor generates constraints for the operator's
body expression. Then, it solves that constraint (that conceptually carries all
the context's constraints with it), which yields a substitution, apply that
substitution to the context and generate constraints for the result expression.

```
  Γ ⊢ e1: (t1, c1)    s = solve(c1)   s(Γ ∪ {n: t1}) ⊢ e2: (t2, c2)
------------------------------------------------------------------------ (LET)
              Γ ⊢ val n = e1 { e2 }: (t2, s(c1 ∧ c2))
```

Whenever we fetch a type scheme from the context, any quantified variables are
replaced with fresh type variables. The class state is used to track free type
variables in the context, and operator signatures always assume quantification
of all names that are not free in the context.

### Additional requirements

1. Type annotations should be added as constraints, and the type system should
   be able to identify which annotations couldn't have its constraint satisfied.
   This can be done by adding an optional source id to the constraint interface.
2. Quint has some multiple arity operators such as `actionAnd` and `match`.
   Signatures for these operators are parametrized over the number of arguments,
   but some of them have restrictions over how many arguments it can receive.
   For example, `match` require an odd number of arguments, while `record`
   requires an even one. The signature provider needs to check the requested
   arity against these restrictions before generating a signature.
3. Unification involving type aliases requires collecting and resolving the type
   which is aliased beforehand, and adding the alias to our context. This is
   opposed to only replacing aliases with their types in a preprocessing step,
   which would make it impossible for the type checker to use the alias names when
   reporting errors, and lead to confusing error messages for the end user.
4. As recursion is not allowed, we should detect recursion in operator,
   lambda, and let-in definitions to report them as unsupported. This should be a simple
   occurs check of the operator's name in its body.

## Implementation Plan
1. Write a type parser using the already defined grammar;
1. Define type signatures for built-in operators;
1. Write a constraint solver with a simple unification algorithm;
1. Write a constraint generator according to the rules specified in this ADR;
1. Take care of the 4 additional requirements previously defined;
1. Integrate type checking and type inference into the VSCode plugin;
1. Look for generalization opportunities between the effect system and the type
   system. Candidate may include substitution-related functions and types, and
   variable binding (occurs check).
