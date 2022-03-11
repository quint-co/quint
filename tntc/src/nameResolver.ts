/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Name resolution for TNT. From a lookup table of scoped and unscoped names,
 * navigate a module in the internal representation and check that each name
 * has either an unscoped definition or a scoped definition with a scope containing
 * the name expression.
 *
 * @module
 */

import { TntModule, TntEx, TntDef } from './tntIr'
import { TntType } from './tntTypes'
import { DefinitionTable, NameDefinition, TypeDefinition } from './definitionsCollector'

/**
 * A single name resolution error
 */
export interface NameError {
  kind: string
  /* The name that couldn't be resolved */
  name: string;
  /* The module-level definition containing the error */
  definitionName: string;
  /* The identifier of the IR node where the error occurs */
  reference: BigInt;
}

/**
 * The result of name resolution for a TNT Module.
 */
export type NameResolutionResult =
  /* Success, all names were resolved */
  | { kind: 'ok' }
  /* Error, at least one name couldn't be resolved. All errors are listed in errors */
  | { kind: 'error', errors: NameError[] }

/**
 * Explore the IR checking all name expressions for undefined names
 *
 * @param tntModule the TNT module to be checked
 * @param definitions a list of names defined for that module, including their scope when not global
 *
 * @returns a successful result in case all names are resolved, or an aggregation of errors otherwise
 */
export function resolveNames (tntModule: TntModule, table: DefinitionTable): NameResolutionResult {
  const results: NameResolutionResult[] = tntModule.defs.reduce((res: NameResolutionResult[], def) => {
    res.push(checkDefTypes(table.typeDefinitions, def))
    if (def.kind === 'def') {
      res.push(checkNamesInExpr(table.nameDefinitions, def.name, def.expr, [def.expr.id]))
    }
    return res
  }, [])

  return mergeNameResults(results)
}

function checkDefTypes (typeDefinitions: TypeDefinition[], def: TntDef): NameResolutionResult {
  switch (def.kind) {
    case 'const':
    case 'var':
    case 'typedef':
    case 'def':
      return def.type ? checkType(typeDefinitions, def.name, def.id, def.type) : { kind: 'ok' }
    default:
      return { kind: 'ok' }
  }
}

function checkType (typeDefinitions: TypeDefinition[], definitionName: string, id: BigInt, type: TntType): NameResolutionResult {
  switch (type.kind) {
    case 'const':
    case 'var':
      if (typeDefinitions.some(def => def.identifier === type.name)) {
        return { kind: 'ok' }
      } else {
        return { kind: 'error', errors: [{ kind: 'type', name: type.name, definitionName: definitionName, reference: id }] }
      }
    case 'set':
    case 'seq':
      return checkType(typeDefinitions, definitionName, id, type.elem)
    case 'fun':
      return mergeNameResults([
        checkType(typeDefinitions, definitionName, id, type.arg),
        checkType(typeDefinitions, definitionName, id, type.res),
      ])
    case 'oper': {
      const argsResults = type.args.map(arg => checkType(typeDefinitions, definitionName, id, arg))
      argsResults.push(checkType(typeDefinitions, definitionName, id, type.res))
      return mergeNameResults(argsResults)
    }
    case 'tuple': {
      const results = type.elems.map(elem => checkType(typeDefinitions, definitionName, id, elem))
      return mergeNameResults(results)
    }
    case 'record': {
      const results = type.fields.map(field => checkType(typeDefinitions, definitionName, id, field.fieldType))
      return mergeNameResults(results)
    }
    case 'union': {
      const results = type.records.map(record => {
        const fieldResults = record.fields.map(field => checkType(typeDefinitions, definitionName, id, field.fieldType))
        return mergeNameResults(fieldResults)
      })
      return mergeNameResults(results)
    }
  }
  return { kind: 'ok' }
}

function checkNamesInExpr (
  nameDefinitions: NameDefinition[],
  defName: string,
  expr: TntEx,
  scopes: BigInt[]
): { kind: 'ok' } | { kind: 'error', errors: NameError[] } {
  switch (expr.kind) {
    case 'name': {
      // This is a name expression, the name must be defined
      // either globally or under a scope that contains the expression
      // The list of scopes containing the expression is accumulated in param scopes
      const nameDefinitionsForScope = filterScope(nameDefinitions, scopes)

      if (nameDefinitionsForScope.some(name => name.identifier === expr.name)) {
        return { kind: 'ok' }
      } else {
        return { kind: 'error', errors: [{ kind: 'operator', name: expr.name, definitionName: defName, reference: expr.id }] }
      }
    }

    case 'app': {
      // Application, we need to resolve names for each of the arguments
      const errors = expr.args.flatMap(arg => {
        const result = checkNamesInExpr(nameDefinitions, defName, arg, scopes.concat(arg.id))

        if (result.kind === 'error') {
          return result.errors.map(error => ({
            kind: 'operator',
            name: error.name,
            definitionName: defName,
            reference: error.reference,
          }))
        }

        return []
      })

      return errors.length === 0 ? { kind: 'ok' } : { kind: 'error', errors: errors }
    }

    case 'lambda':
      // Lambda expression, check names in the body expression
      return checkNamesInExpr(nameDefinitions, defName, expr.expr, scopes.concat(expr.expr.id))

    default:
      // Other expressions don't have any names to resolve
      return { kind: 'ok' }
  }
}

function mergeNameResults (results: NameResolutionResult[]): NameResolutionResult {
  // Aggregate errors
  const errors = results.reduce((errors: NameError[], result: NameResolutionResult) => {
    return result.kind === 'error' ? errors.concat(result.errors) : errors
  }, [])

  return errors.length > 0 ? { kind: 'error', errors: errors } : { kind: 'ok' }
}

function filterScope (nameDefinitions: NameDefinition[], scopes: BigInt[]): NameDefinition[] {
  return nameDefinitions.filter(definition => {
    // A definition should be considered in a scope if it's either unscoped or its scope is included
    // in some scope containing the name expression's scope
    return !definition.scope || scopes.includes(definition.scope)
  })
}
