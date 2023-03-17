/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Verification for conflicts in a definition lookup table. Also ensures no shadowing.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Either, left, right } from '@sweet-monads/either';
import isEqual from 'lodash.isequal'
import { DefinitionsByName, ValueDefinition } from './definitionsByName'
import { ScopeTree, scopesForId } from './scoping'

/**
 * The source of a conflict occurrences
 */
export type ConflictSource =
  /* A user definition, referencing its IR node id */
  | { kind: 'user', reference: bigint }
  /* A built-in definition, no reference */
  | { kind: 'builtin' }

/**
 * Error report for a found name conflict
 */
export interface Conflict {
  /* Either a 'type' or 'value' conflict */
  kind: 'value' | 'type';
  /* The name that has a conflict */
  identifier: string;
  /* Sources of the occurrences of the conflicting name */
  sources: ConflictSource[];
}

/**
 * Aggregation of conflicts for a definition table
 */
export type DefinitionsConflictResult = Either<Conflict[], void>

/**
 * Scans a definition lookup table for conflicts between module-level names and
 * scoped names within nested scopes with conflicts
 *
 * @param table the definition lookup table to scan for conflicts
 * @param tree a scope tree for the Quint module with the definitions
 *
 * @returns a successful result in case there are no conflicts, or an aggregation of conflicts otherwise
 */
export function scanConflicts(table: DefinitionsByName, tree: ScopeTree): DefinitionsConflictResult {
  const conflicts: Conflict[] = []
  table.valueDefinitions.forEach((defs, identifier) => {
    // Value definition conflicts depend on scope
    const conflictingDefinitions = defs.filter(def => defs.some(d => {
      return !isEqual(d, def) && canConflict(tree, d, def)
    }))

    if (conflictingDefinitions.length > 0) {
      const sources: ConflictSource[] = conflictingDefinitions.map(d => {
        return d.reference ? { kind: 'user', reference: d.reference } : { kind: 'builtin' }
      })
      conflicts.push({ kind: 'value', identifier, sources })
    }
  })

  table.typeDefinitions.forEach((defs, identifier) => {
    // Type definition conflicts don't depend on scope as type aliases can't be scoped
    const conflictingDefinitions = defs.filter(def => defs.some(d => !isEqual(d, def)))

    if (conflictingDefinitions.length > 1) {
      const sources: ConflictSource[] = conflictingDefinitions.map(d => {
        return d.reference ? { kind: 'user', reference: d.reference } : { kind: 'builtin' }
      })
      conflicts.push({ kind: 'type', identifier, sources })
    }
  })

  if (conflicts.length > 0) {
    return left(conflicts)
  } else {
    return right(undefined)
  }
}

function canConflict(tree: ScopeTree, d1: ValueDefinition, d2: ValueDefinition): Boolean {
  return !d1.scope ||
    !d2.scope ||
    scopesForId(tree, d1.scope).includes(d2.scope) ||
    scopesForId(tree, d2.scope).includes(d1.scope)
}
