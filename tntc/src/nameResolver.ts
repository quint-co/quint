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
 * @author Gabriela Mafra
 *
 * @module
 */

import { TntModule, TntEx } from './tntIr'
import { TntType } from './tntTypes'
import { DefinitionTable, NameDefinition, TypeDefinition } from './definitionsCollector'

/**
 * A single name resolution error
 */
export interface NameError {
  /* Either a 'type' or 'operator' name error */
  kind: 'type' | 'operator';
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
 * @param table lists of names and type aliases defined for that module, including their scope when not global
 *
 * @returns a successful result in case all names are resolved, or an aggregation of errors otherwise
 */
export function resolveNames (tntModule: TntModule, table: DefinitionTable): NameResolutionResult {
  const results: NameResolutionResult[] = tntModule.defs.reduce((res: NameResolutionResult[], def) => {
    switch (def.kind) {
      // Possibly typed definitions
      case 'const':
      case 'var':
      case 'typedef':
      case 'def':
        if (def.type) {
          res.push(resolveInType(table.typeDefinitions, def.name, def.id, def.type))
        }
        break
      // Untyped definitions
      default:
    }

    if (def.kind === 'def') {
      res.push(checkNamesInExpr(table, def.name, def.expr, [def.expr.id]))
    }
    return res
  }, [])

  return mergeNameResults(results)
}

function resolveInType (
  typeDefinitions: TypeDefinition[],
  definitionName: string,
  id: BigInt,
  type: TntType
): NameResolutionResult {
  let results: NameResolutionResult[] = []

  switch (type.kind) {
    case 'const':
    case 'var':
      // Type is a name, check that it is defined
      if (typeDefinitions.some(def => def.identifier === type.name)) {
        return { kind: 'ok' }
      } else {
        return {
          kind: 'error',
          errors: [
            { kind: 'type', name: type.name, definitionName: definitionName, reference: id },
          ],
        }
      }

    case 'set':
    case 'seq':
      // Generic constructors, check parameter
      return resolveInType(typeDefinitions, definitionName, id, type.elem)

    case 'fun':
      // Functions, check both argument and result
      results = [
        resolveInType(typeDefinitions, definitionName, id, type.arg),
        resolveInType(typeDefinitions, definitionName, id, type.res),
      ]
      break

    case 'oper':
      // Operators, check all arguments and result
      results = type.args.map(arg => resolveInType(typeDefinitions, definitionName, id, arg))
      results.push(resolveInType(typeDefinitions, definitionName, id, type.res))
      break

    case 'tuple':
      // Tuples, check all elements
      results = type.elems.map(elem => resolveInType(typeDefinitions, definitionName, id, elem))
      break

    case 'record':
      // Records, check all fields
      results = type.fields.map(field => resolveInType(typeDefinitions, definitionName, id, field.fieldType))
      break

    case 'union':
      // Variants, check all fields for all records
      results = type.records.flatMap(record => {
        return record.fields.map(
          field => resolveInType(typeDefinitions, definitionName, id, field.fieldType)
        )
      })
      break
  }

  return mergeNameResults(results)
}

/* Recursively navigate expressions, resolving both operator names and type aliases */
function checkNamesInExpr (
  table: DefinitionTable,
  defName: string,
  expr: TntEx,
  scopes: BigInt[]
): NameResolutionResult {
  const results: NameResolutionResult[] = []
  // Any expression can have a type. If that's the case, check it.
  if (expr.type) {
    results.push(resolveInType(table.typeDefinitions, defName, expr.id, expr.type))
  }

  switch (expr.kind) {
    case 'name': {
      // This is a name expression, the name must be defined
      // either globally or under a scope that contains the expression
      // The list of scopes containing the expression is accumulated in param scopes
      const nameDefinitionsForScope = filterScope(table.nameDefinitions, scopes)

      if (!nameDefinitionsForScope.some(name => name.identifier === expr.name)) {
        results.push({
          kind: 'error',
          errors: [{ kind: 'operator', name: expr.name, definitionName: defName, reference: expr.id }],
        })
      }
      break
    }

    case 'app': {
      // Application, check that the operator being applied is defined
      const nameDefinitionsForScope = filterScope(table.nameDefinitions, scopes)

      if (!nameDefinitionsForScope.some(name => name.identifier === expr.opcode)) {
        results.push({
          kind: 'error',
          errors: [{ kind: 'operator', name: expr.opcode, definitionName: defName, reference: expr.id }],
        })
      }

      // Resolve names for each of the arguments
      results.push(...expr.args.flatMap(arg => {
        return checkNamesInExpr(table, defName, arg, scopes.concat(arg.id))
      }))
      break
    }

    case 'lambda':
      // Lambda expression, check names in the body expression
      results.push(checkNamesInExpr(table, defName, expr.expr, scopes.concat(expr.expr.id)))
      break

    case 'let':
      // Let epressions, check names in body of the operator definition and in the body of the result expression
      results.push(
        checkNamesInExpr(table, defName, expr.opdef.expr, scopes.concat(expr.opdef.expr.id)),
        checkNamesInExpr(table, defName, expr.expr, scopes.concat(expr.expr.id))
      )
      // Also, the operator definition can be typed, check for type aliases
      if (expr.opdef.type) {
        results.push(resolveInType(table.typeDefinitions, defName, expr.opdef.id, expr.opdef.type))
      }
      break

    default:
    // Other expressions don't have any names to resolve
  }

  return mergeNameResults(results)
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
