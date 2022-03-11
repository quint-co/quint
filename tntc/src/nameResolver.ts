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
  /* The name that couldn't be resolved */
  name: string;
  /* The module-level definition containing the error */
  definitionName: string;
  /* The name expression where the error occurs */
  expression: TntEx;
  /* A stacktrace of expressions from the error to the module-level definition */
  trace: TntEx[];
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
  const results: NameResolutionResult[] = tntModule.defs.map(def => {
    // TODO: merge type and name results
    console.log(checkDefTypes(table.typeDefinitions, def))
    return def.kind === 'def' ? checkNamesInExpr(table.nameDefinitions, def.name, def.expr, [def.expr.id]) : { kind: 'ok' }
  })

  // Aggregate errors
  const errors = results.reduce((errors: NameError[], result: NameResolutionResult) => {
    return result.kind === 'error' ? errors.concat(result.errors) : errors
  }, [])

  return errors.length > 0 ? { kind: 'error', errors: errors } : { kind: 'ok' }
}

function checkType (typeDefinitions: TypeDefinition[], type: TntType): Boolean {
  switch (type.kind) {
    case 'const':
    case 'var':
      return typeDefinitions.some(def => def.identifier === type.name)
    case 'set':
    case 'seq':
      return checkType(typeDefinitions, type.elem)
    case 'fun':
      return checkType(typeDefinitions, type.arg) && checkType(typeDefinitions, type.res)
    case 'oper':
      return type.args.every(arg => checkType(typeDefinitions, arg)) && checkType(typeDefinitions, type.res)
    case 'tuple':
      return type.elems.every(elem => checkType(typeDefinitions, elem))
    case 'record':
      return type.fields.every(field => checkType(typeDefinitions, field.fieldType))
    case 'union':
      return type.records.every(record => {
        return record.fields.every(field => checkType(typeDefinitions, field.fieldType))
      })
  }
  return true
}

function checkDefTypes (typeDefinitions: TypeDefinition[], def: TntDef): Boolean {
  switch (def.kind) {
    case 'const':
    case 'var':
    case 'typedef':
      return def.type ? checkType(typeDefinitions, def.type) : true
    default:
      return true
  }
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
        return { kind: 'error', errors: [{ name: expr.name, definitionName: defName, expression: expr, trace: [] }] }
      }
    }

    case 'app': {
      // Application, we need to resolve names for each of the arguments
      const errors = expr.args.flatMap(arg => {
        const result = checkNamesInExpr(nameDefinitions, defName, arg, scopes.concat(arg.id))

        if (result.kind === 'error') {
          return result.errors.map(error => ({
            name: error.name,
            definitionName: defName,
            expression: error.expression,
            trace: error.trace.length === 0 ? error.trace.concat([arg, expr]) : error.trace.concat([expr]),
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

function filterScope (nameDefinitions: NameDefinition[], scopes: BigInt[]): NameDefinition[] {
  return nameDefinitions.filter(definition => {
    // A definition should be considered in a scope if it's either unscoped or its scope is included
    // in some scope containing the name expression's scope
    return !definition.scope || scopes.includes(definition.scope)
  })
}
