/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Find and collect definitions from a TNT module, along with a default list for built-in
 * definitions. Collect both operator and type alias definitions. For scoped operators,
 * collect scope information.
 *
 * @module
 */

import { TntModule, TntEx } from './tntIr'
import { TntType } from './tntTypes'

/**
 * A named operator defined. Can be scoped or module-wide (unscoped).
 */
export interface NameDefinition {
  /* Same as TntDef kinds */
  kind: string
  /* The name given to the defined operator */
  identifier: string
  /* Optional scope, an id pointing to the TntIr node that introduces the name */
  scope?: bigint
}

/**
 * A type alias definition
 */
export interface TypeDefinition {
  /* The alias given to the type */
  identifier: string
  /* The type that is aliased */
  type: TntType
}

/**
 * A lookup table aggregating operator and type alias definitions
 */
export interface DefinitionTable {
  /* Names for operators defined */
  nameDefinitions: NameDefinition[]
  /* Type aliases defined */
  typeDefinitions: TypeDefinition[]
}

/**
 * Built-in name definitions that are always included in definitions collection
*/
export const defaultDefinitions: DefinitionTable = {
  nameDefinitions: [
    { kind: 'def', identifier: 'not' },
    { kind: 'def', identifier: 'and' },
    { kind: 'def', identifier: 'or' },
    { kind: 'def', identifier: 'iff' },
    { kind: 'def', identifier: 'implies' },
    { kind: 'def', identifier: 'exists' },
    { kind: 'def', identifier: 'guess' },
    { kind: 'def', identifier: 'forall' },
    { kind: 'def', identifier: 'in' },
    { kind: 'def', identifier: 'notin' },
    { kind: 'def', identifier: 'union' },
    { kind: 'def', identifier: 'contains' },
    { kind: 'def', identifier: 'fold' },
    { kind: 'def', identifier: 'intersect' },
    { kind: 'def', identifier: 'exclude' },
    { kind: 'def', identifier: 'subseteq' },
    { kind: 'def', identifier: 'map' },
    { kind: 'def', identifier: 'applyTo' },
    { kind: 'def', identifier: 'filter' },
    { kind: 'def', identifier: 'powerset' },
    { kind: 'def', identifier: 'flatten' },
    { kind: 'def', identifier: 'seqs' },
    { kind: 'def', identifier: 'choose_some' },
    { kind: 'def', identifier: 'isFinite' },
    { kind: 'def', identifier: 'cardinality' },
    { kind: 'def', identifier: 'get' },
    { kind: 'def', identifier: 'put' },
    { kind: 'def', identifier: 'keys' },
    { kind: 'def', identifier: 'mapOf' },
    { kind: 'def', identifier: 'setOfMaps' },
    { kind: 'def', identifier: 'update' },
    { kind: 'def', identifier: 'updateAs' },
    { kind: 'def', identifier: 'fields' },
    { kind: 'def', identifier: 'with' },
    { kind: 'def', identifier: 'tuples' },
    { kind: 'def', identifier: 'append' },
    { kind: 'def', identifier: 'concat' },
    { kind: 'def', identifier: 'head' },
    { kind: 'def', identifier: 'tail' },
    { kind: 'def', identifier: 'length' },
    { kind: 'def', identifier: 'nth' },
    { kind: 'def', identifier: 'indices' },
    { kind: 'def', identifier: 'replaceAt' },
    { kind: 'def', identifier: 'slice' },
    { kind: 'def', identifier: 'select' },
    { kind: 'def', identifier: 'foldl' },
    { kind: 'def', identifier: 'foldr' },
    { kind: 'def', identifier: 'to' },
    { kind: 'def', identifier: 'always' },
    { kind: 'def', identifier: 'eventually' },
    { kind: 'def', identifier: 'next' },
    { kind: 'def', identifier: 'stutter' },
    { kind: 'def', identifier: 'nostutter' },
    { kind: 'def', identifier: 'enabled' },
    { kind: 'def', identifier: 'weakFair' },
    { kind: 'def', identifier: 'strongFair' },
    { kind: 'def', identifier: 'guarantees' },
    { kind: 'def', identifier: 'exists_const' },
    { kind: 'def', identifier: 'forall_const' },
    { kind: 'def', identifier: 'choose_const' },
    { kind: 'def', identifier: 'Bool' },
    { kind: 'def', identifier: 'Int' },
    { kind: 'def', identifier: 'Nat' },
    { kind: 'def', identifier: 'TRUE' },
    { kind: 'def', identifier: 'FALSE' },
    { kind: 'def', identifier: 'set' },
    { kind: 'def', identifier: 'seq' },
    { kind: 'def', identifier: 'tup' },
    { kind: 'def', identifier: 'tuple' },
    { kind: 'def', identifier: 'rec' },
    { kind: 'def', identifier: 'record' },
    { kind: 'def', identifier: 'igt' },
    { kind: 'def', identifier: 'ilt' },
    { kind: 'def', identifier: 'igte' },
    { kind: 'def', identifier: 'ilte' },
    { kind: 'def', identifier: 'iadd' },
    { kind: 'def', identifier: 'isub' },
    { kind: 'def', identifier: 'iuminus' },
    { kind: 'def', identifier: 'imul' },
    { kind: 'def', identifier: 'idiv' },
    { kind: 'def', identifier: 'imod' },
    { kind: 'def', identifier: 'ipow' },
    { kind: 'def', identifier: 'andAction' },
    { kind: 'def', identifier: 'orAction' },
    { kind: 'def', identifier: 'andExpr' },
    { kind: 'def', identifier: 'orExpr' },
    { kind: 'def', identifier: 'field' },
    { kind: 'def', identifier: 'item' },
    { kind: 'def', identifier: 'match' },
    { kind: 'def', identifier: 'assign' },
    { kind: 'def', identifier: 'of' },
    { kind: 'def', identifier: 'eq' },
    { kind: 'def', identifier: 'neq' },
    { kind: 'def', identifier: 'ite' },
    { kind: 'def', identifier: 'cross' },
    { kind: 'def', identifier: 'cardinality' },
    { kind: 'def', identifier: 'difference' },
  ],
  typeDefinitions: [
    { identifier: 'PROC', type: { kind: 'const', name: 'PROC' } },
  ],
}

/**
 * Recursively iterate over a module's definition collecting all names and type aliases
 * into a definition table. Also includes all default definitions for built-in names.
 *
 * @param tntModule the TNT module to have definitions collected from
 *
 * @returns a lookup table with all defined values for the module
 */
export function collectDefinitions (tntModule: TntModule): DefinitionTable {
  return tntModule.defs.reduce((table: DefinitionTable, def) => {
    switch (def.kind) {
      case 'const':
      case 'var':
        table.nameDefinitions.push({
          kind: def.kind,
          identifier: def.name,
        })
        break
      case 'def':
        table.nameDefinitions.push({
          kind: def.kind,
          identifier: def.name,
        })
        table.nameDefinitions.push(...collectFromExpr(def.expr))
        break
      case 'instance': {
        table.nameDefinitions.push({
          kind: 'namespace',
          identifier: def.name,
        })
        table.nameDefinitions.push(...def.overrides.flatMap(e => collectFromExpr(e[1])))

        // Alias definitions from the instanced module to the new name
        const namespacedDefinitions = table.nameDefinitions.reduce((ds: NameDefinition[], d) => {
          const names = d.identifier.split('::')
          // Collect this name scoped to the instance iff the import matches the module's namespace
          if (names[0] === def.protoName && names[1]) {
            ds.push({ kind: d.kind, identifier: `${def.name}::${names[1]}` })
          }
          return ds
        }, [])
        table.nameDefinitions.push(...namespacedDefinitions)
        break
      }
      case 'module': {
        table.nameDefinitions.push({
          kind: 'namespace',
          identifier: def.module.name,
        })
        const moduleDefinitions = collectDefinitions(def.module)
        // Collect all definitions namespaced to module
        const namespacedDefinitions = moduleDefinitions.nameDefinitions.map(d => {
          return { kind: d.kind, identifier: `${def.module.name}::${d.identifier}` }
        })
        table.nameDefinitions.push(...namespacedDefinitions)
        break
      }
      case 'import': {
        // FIXME: check if definitions are found, when we actually import them from other files
        const namespacedDefinitions = table.nameDefinitions.reduce((ds: NameDefinition[], d) => {
          const names = d.identifier.split('::')
          // Collect this name as unscoped iff the import matches its namespace and name
          if (names[0] === def.path && names[1] && (def.name === '*' || def.name === names[1])) {
            ds.push({ kind: d.kind, identifier: names[1] })
          }
          return ds
        }, [])
        table.nameDefinitions.push(...namespacedDefinitions)
        break
      }
      case 'typedef':
        table.typeDefinitions.push({
          identifier: def.name,
          type: def.type,
        })
        break
      case 'assume':
        table.nameDefinitions.push({
          kind: 'assumption',
          identifier: def.name,
        })
        table.nameDefinitions.push(...collectFromExpr(def.assumption))
        break
    }
    return table
  }, { nameDefinitions: [], typeDefinitions: [] })
}

export function mergeTables (a: DefinitionTable, b: DefinitionTable): DefinitionTable {
  return {
    nameDefinitions: a.nameDefinitions.concat(b.nameDefinitions),
    typeDefinitions: a.typeDefinitions.concat(b.typeDefinitions),
  }
}

function collectFromExpr (expr: TntEx): NameDefinition[] {
  switch (expr.kind) {
    case 'lambda':
      return expr.params
        .map(p => { return { kind: 'def', identifier: p, scope: expr.id } as NameDefinition })
        .concat(collectFromExpr(expr.expr))
    case 'app':
      return expr.args.flatMap(arg => { return collectFromExpr(arg) })
    case 'let':
      return [{ kind: expr.opdef.qualifier, identifier: expr.opdef.name, scope: expr.id } as NameDefinition]
        .concat(collectFromExpr(expr.opdef.expr))
        .concat(collectFromExpr(expr.expr))
    default:
      return []
  }
}
