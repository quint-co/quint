/* ----------------------------------------------------------------------------------
 * Copyright 2022-2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Type definitions and utilities for Quint name resolution.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { cloneDeep, compact } from 'lodash'
import { QuintDef, QuintExport, QuintImport, QuintInstance, QuintLambdaParameter } from '../ir/quintIr'
import { QuintType } from '../ir/quintTypes'
import { QuintError } from '../quintError'
import { NameResolver } from './resolver'

/**
 * Possible kinds for definitions
 */
export type DefinitionKind = 'module' | 'def' | 'val' | 'assumption' | 'param' | 'var' | 'const' | 'type'

/**
 * A definition to be stored in `DefinitionsByName` and `LookupTable`. Either a `QuintDef`
 * or a `QuintLambdaParameter`, with additional metadata fields
 */
export type LookupDefinition = (QuintDef | ({ kind: 'param' } & QuintLambdaParameter)) & {
  /* Hidden definitions won't be copied over to a module when an
   * import/intance/export statement is resolved. `hidden` can be removed with
   * `export` statements for the hidden definitions. */
  hidden?: boolean
  /* `namespaces` are names to add to the definition's name, when it
   * is copied from one module to another with a qualified name. Ordered from
   * innermost to the outermost namespace. */
  namespaces?: string[]
  /* importedFrom` is a reference to the import/instance/export statement that
   * originated the definition, if the definition was copied from another
   * module. */
  importedFrom?: QuintImport | QuintInstance | QuintExport
  /* `typeAnnotation` is the type annotation of the definition, if it has one.
   * Some types in `QuintDef` already have a `typeAnnotation` field. This
   * ensures that this field is always accessible */
  typeAnnotation?: QuintType
  /* optional depth of the definition, 0 if top-level. Only for `QuintOpDef`. */
  depth?: number
  /* optional flag to tell if this is shadowing another def, therefore needing to be unshadowed during compilation */
  shadowing?: boolean
}

/**
 * A module's definitions, indexed by name.
 */
export type DefinitionsByName = Map<string, LookupDefinition[]>

/**
 * Definitions for each module
 */
export type DefinitionsByModule = Map<string, DefinitionsByName>

/**
 * A lookup table from IR component ids to their definitions.
 * Should have an entry for every IR component with a name
 * That is:
 * - Name expressions
 * - App expressions (opcode is a name)
 * - Override parameters in instance definitions
 * - Constant types (which are references to type aliases or uninterpreted types)
 *
 * This should be created by `resolveNames` from `resolver.ts`
 */
export type LookupTable = Map<bigint, LookupDefinition>

/**
 * A lazy mapping from module names to the definitions that are available but not used in that module.
 */
export type UnusedDefinitions = (moduleName: string) => Set<LookupDefinition>

/**
 * The result of name resolution, when successful.
 */
export type NameResolutionResult = {
  table: LookupTable
  unusedDefinitions: UnusedDefinitions
  errors: QuintError[]
  resolver: NameResolver
}

export function getTopLevelDef(defs: DefinitionsByName, name: string): LookupDefinition | undefined {
  return defs.get(name)?.at(0)
}

/**
 * Copy the names of a definitions table to a new one, ignoring hidden
 * definitions, and optionally adding a namespace.
 *
 * @param originTable - The definitions table to copy from
 * @param namespace - Optional namespace to be added to copied names
 * @param copyAsHidden - Optional, true iff the copied definitions should be tagged as 'hidden'
 *
 * @returns a definitions table with the filtered and namespaced names
 */
export function copyNames(
  originTable: DefinitionsByName,
  namespace?: string,
  copyAsHidden?: boolean
): DefinitionsByName {
  const table = new Map()

  originTable.forEach((defs, identifier) => {
    const name = namespace ? [namespace, identifier].join('::') : identifier
    const newDefs = defs.map(def => {
      if (!def.hidden || def.kind === 'const') {
        return cloneDeep(copyAsHidden ? { ...def, hidden: copyAsHidden } : def)
      }
    })

    table.set(name, compact(newDefs))
  })

  return table
}

/**
 * Add namespaces to a definition's `namespaces` field, if it doesn't already
 * have them on the last position or in the beginning of its name.
 *
 * @param def - The definition to add the namespaces to
 * @param namespaces - The namespaces to be added
 *
 * @returns The definition with the namespaces added
 */
export function addNamespacesToDef(def: LookupDefinition, namespaces: string[]): LookupDefinition {
  // FIXME(#1111): This doesn't take care of some corner cases.
  return namespaces.reduce((def, namespace) => {
    if (def.namespaces && def.namespaces[def.namespaces?.length - 1] === namespace) {
      // If this is already the last namespace, don't add it again
      return def
    }

    if (def.name.startsWith(`${namespace}::`)) {
      // If the namespace is already in the beginning of the name, don't add it again
      return def
    }

    const namespaces = namespace ? def.namespaces?.concat([namespace]) ?? [namespace] : []
    return { ...def, namespaces }
  }, def)
}

/**
 * Built-in name definitions that are always resolved and generate conflicts if collected.
 */
export const builtinNames = [
  'not',
  'and',
  'or',
  'iff',
  'implies',
  'exists',
  'forall',
  'in',
  'union',
  'contains',
  'fold',
  'intersect',
  'exclude',
  'subseteq',
  'map',
  'applyTo',
  'filter',
  'powerset',
  'flatten',
  'allLists',
  'allListsUpTo',
  'chooseSome',
  'oneOf',
  'isFinite',
  'size',
  'get',
  'put',
  'keys',
  'mapBy',
  'setToMap',
  'setOfMaps',
  'set',
  'setBy',
  'fields',
  'with',
  'tuples',
  'append',
  'concat',
  'head',
  'tail',
  'length',
  'nth',
  'indices',
  'replaceAt',
  'slice',
  'select',
  'foldl',
  'foldr',
  'to',
  'always',
  'eventually',
  'next',
  'then',
  'expect',
  'reps',
  'fail',
  'assert',
  'orKeep',
  'mustChange',
  'enabled',
  'weakFair',
  'strongFair',
  'Bool',
  'Int',
  'Nat',
  'Set',
  'Map',
  'List',
  'Tup',
  'Rec',
  'range',
  'igt',
  'ilt',
  'igte',
  'ilte',
  'iadd',
  'isub',
  'iuminus',
  'imul',
  'idiv',
  'imod',
  'ipow',
  'actionAll',
  'actionAny',
  'field',
  'fieldNames',
  'item',
  'assign',
  'of',
  'eq',
  'neq',
  'ite',
  'cross',
  'difference',
  'matchVariant',
  'variant',
  'q::debug',
  'q::lastTrace',
]
