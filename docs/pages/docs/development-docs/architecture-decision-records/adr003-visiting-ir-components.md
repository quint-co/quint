# ADR003: Interface to visit Internal Representation components

| Revision | Date       | Author           |
| :------- | :--------- | :--------------- |
| 1        | 07.04.2022 | Gabriela Moreira |

## Summary

We are introducing an interface using the [visitor pattern][] (from [Design
Patterns][] GoF book) to allow easy access of arbitrary IR components without
the need to manipulate the entire IR. This should avoid significant occurrences
of boilerplating throughout `quint` source code and possibly external libraries
built on top of it.

## Context

Quint's internal representation has many heterogeneous recursive structures. For
example, a module can contain an operator definition with a let-in expression,
which contains yet another operator definition and a body expression. Therefore,
if we want to define a procedure to extract information of a specific type of
expression (i.e. name expressions to resolve names), we have to recurse on all
this structures looking for expressions in every possible component they can
appear on.

## Options

Taking inspiration on Kotlin's [KSP][], which provides an interface to
manipulate Kotlin's AST. From its library, we could find two options:
1. Define functions to extract components from the IR/AST, that is,
   `findExpressions(myModule)` would return a list of expressions including
   nested ones.
  - Pros:
    - more functional style, a standard we are trying to implement.
  - Cons:
    - Being a stateless model, it could be significantly inefficient. Unless we
      use some caching, every call of `findSomething()` will explore the whole
      AST. And if we use caching, we are losing the statelessness that makes it
      good in the first place.
1. Define an interface (in the OOP sense) with methods to access each component,
   and a procedure that calls these methods accordingly. This is known as the
   [visitor pattern][].
  - Pros:
    - It is a known pattern, so it will be familiar to some people and has a lot
      of online resources with great explanations to those who aren't
    - It's efficient in the sense that only one IR navigation is enough to
      execute however many procedures
    - We already use this pattern in our parser, since the [antlr4ts][] library
      provides an interface to define visitors to the parsed AST.
  - Cons:
    - Implementation relies on classes, and classes in typescript are
      discouraged. Although this seems more like a "know how to use" than
      "don't use" recommendation, is still something to be considered.

## Solution

We choose to go with the visitor pattern approach because it seems like a better
solution overall, despite being an exception to our functional-style standard.
For this pattern, we define an interface with `visit*` methods for all IR
components. Perhaps sometime in the future we will want to differentiate pre and
post order with `enter*` and `exit*` methods, but that's an easy refactor.

```ts
export interface IRVisitor {
  visitExpr?: (expr: QuintEx) => void
  visitDef?: (def: QuintDef) => void

  visitConst?: (cons: QuintConst) => void

  visitName?: (nameExpr: QuintName) => void
  visitApp?: (appExpr: QuintApp) => void

  visitTypeVar?: (typeVar: QuintTypeVar) => void
  visitTypeConst?: (typeConst: QuintTypeConst) => void

  // ...
}
```

We also have to define functions to explore the IR and call the `visit*` methods
at their corresponding components.

```ts

export function walkModule (visitor: IRVisitor, quintModule: QuintModule): void {
  quintModule.defs.forEach(def => walkDefinition(visitor, def))
}

function walkDefinition (visitor: IRVisitor, def: QuintDef) {
  if (visitor.visitDef) {
    visitor.visitDef(def)
  }

  switch (def.kind) {
    case 'const':
      if (visitor.visitConst) {
        visitor.visitConst(def)
      }
      if (def.type) {
        walkType(visitor, def.type)
      }
      break

    // ...
  }
}

function walkExpression (visitor: IRVisitor, expr: QuintEx) { ... }

function walkType (visitor: IRVisitor, quintType: QuintType) { ... }
```

This is the underlying infrastructure. To use it, one has to simply define a
visitor class with methods to visit relevant components.

```ts
class NameResolverVisitor implements IRVisitor {
  constructor (table: DefinitionTable, scopeTree: ScopeTree) {
    this.table = table
    this.scopeTree = scopeTree
  }

  results: NameResolutionResult[] = []

  private table: DefinitionTable = { valueDefinitions: [], typeDefinitions: [] }
  private scopeTree: ScopeTree

  visitName (nameExpr: QuintName): void {
    // This is a name expression, the name must be defined
    // either globally or under a scope that contains the expression
    const valueDefinitionsForScope = filterScope(this.table.valueDefinitions, scopesForId(this.scopeTree, nameExpr.id))

    if (!valueDefinitionsForScope.some(name => name.identifier === nameExpr.name)) {
      this.results.push({
        kind: 'error',
        errors: [{ kind: 'value', name: nameExpr.name, definitionName: 'defName', reference: nameExpr.id }],
      })
    }
  }

  visitApp (appExpr: QuintApp): void { ... }

  visitTypeVar (type: QuintTypeVar): void { ... }

  visitTypeConst (type: QuintTypeConst): void { ... }
}
```

Notice that this implementation has to be stateful since the `visit*` methods
return `void`.

### Implementation plan

Here are the planned steps to get this to `main` in small chunks of changes:

1. Introduce type aliases for each of the IR components (i.e. `{ kind: 'name',
   name: string } & WithId & WithType` should become `QuintName`) to avoid
   duplication of interface definitions across signatures
1. Introduce the visitor interface and the `walk*` functions
1. Refactor `nameResolver` to use a visitor
1. Refactor `definitionsCollector` to use a visitor
1. Refactor `scoping` to use a visitor.

[Design Patterns]: https://www.worldcat.org/title/design-patterns-elements-of-reusable-object-oriented-software/oclc/31171684
[visitor pattern]: https://refactoring.guru/design-patterns/visitor
[antlr4ts]: https://github.com/tunnelvisionlabs/antlr4ts
[KSP]: https://kotlinlang.org/docs/ksp-overview.html
