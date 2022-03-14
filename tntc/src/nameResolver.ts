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
      return mergeNameResults(
        [
          def.type ? checkType(typeDefinitions, def.name, def.id, def.type) : { kind: 'ok' },
          def.kind === 'def' ? checkExprTypes(typeDefinitions, def.name, def.expr) : { kind: 'ok' },
        ]
      )
    default:
      return { kind: 'ok' }
  }
}

function checkExprTypes (typeDefinitions: TypeDefinition[], definitionName: string, expr: TntEx): NameResolutionResult {
  let results: NameResolutionResult[] = []
  if (expr.type) {
    results.push(checkType(typeDefinitions, definitionName, expr.id, expr.type))
  }

  switch (expr.kind) {
    case 'lambda':
      results.push(checkExprTypes(typeDefinitions, definitionName, expr.expr))
      break
    case 'app':
      results = expr.args.flatMap(arg => { return checkExprTypes(typeDefinitions, definitionName, arg) })
      break
    case 'let':
      if (expr.opdef.type) {
        results.push(checkType(typeDefinitions, definitionName, expr.opdef.id, expr.opdef.type))
      }
      results.push(checkExprTypes(typeDefinitions, definitionName, expr.opdef.expr))
      results.push(checkExprTypes(typeDefinitions, definitionName, expr.expr))
      break
    default:
    // no child expressions to check
  }

  return mergeNameResults(results)
}

function checkType (typeDefinitions: TypeDefinition[], definitionName: string, id: BigInt, type: TntType): NameResolutionResult {
  let results: NameResolutionResult[] = []

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
      results = [
        checkType(typeDefinitions, definitionName, id, type.arg),
        checkType(typeDefinitions, definitionName, id, type.res),
      ]
      break
    case 'oper':
      results = type.args.map(arg => checkType(typeDefinitions, definitionName, id, arg))
      results.push(checkType(typeDefinitions, definitionName, id, type.res))
      break
    case 'tuple':
      results = type.elems.map(elem => checkType(typeDefinitions, definitionName, id, elem))
      break
    case 'record':
      results = type.fields.map(field => checkType(typeDefinitions, definitionName, id, field.fieldType))
      break
    case 'union':
      results = type.records.map(record => {
        const fieldResults = record.fields.map(field => checkType(typeDefinitions, definitionName, id, field.fieldType))
        return mergeNameResults(fieldResults)
      })
      break
  }

  return mergeNameResults(results)
}

function checkNamesInExpr (
  nameDefinitions: NameDefinition[],
  defName: string,
  expr: TntEx,
  scopes: BigInt[]
): NameResolutionResult {
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
      const results = expr.args.flatMap(arg => {
        return checkNamesInExpr(nameDefinitions, defName, arg, scopes.concat(arg.id))
      })
      return mergeNameResults(results)
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
