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

import isEqual from 'lodash.isequal'
import { ValueDefinition, LookupTable } from './definitionsCollector'
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
export type DefinitionsConflictResult =
  /* No conflicts */
  | { kind: 'ok' }
  /* One or more conflicts */
  | { kind: 'error', conflicts: Conflict[] }

/**
 * Scans a definition lookup table for conflicts between module-level names and
 * scoped names within nested scopes with conflicts
 *
 * @param table the definition lookup table to scan for conflicts
 * @param tree a scope tree for the TNT module with the definitions
 *
 * @returns a successful result in case there are no conflicts, or an aggregation of conflicts otherwise
 */
export function scanConflicts (table: LookupTable, tree: ScopeTree): DefinitionsConflictResult {
  const conflicts: Conflict[] = []
  table.forEach((defs, identifier) => {
    // Value definition conflicts depend on scope
    const conflictingDefinitions = defs.valueDefinitions.filter(def => defs.valueDefinitions.some(d => {
      return !isEqual(d, def) && (canConflict(tree, d, def) || canConflict(tree, def, d))
    }))

    if (conflictingDefinitions.length > 0) {
      const sources: ConflictSource[] = conflictingDefinitions.map(d => d.reference ? { kind: 'user', reference: d.reference } : { kind: 'builtin' })
      conflicts.push({ kind: 'value', identifier: identifier, sources: sources })
    }

    // Type definition conflicts don't depend on scope as type aliases can't be scoped
    if (defs.typeDefinitions.length > 1) {
      const sources: ConflictSource[] = defs.typeDefinitions.map(d => d.reference ? { kind: 'user', reference: d.reference } : { kind: 'builtin' })
      conflicts.push({ kind: 'type', identifier: identifier, sources: sources })
    }
  })

  if (conflicts.length > 0) {
    return { kind: 'error', conflicts: conflicts }
  } else {
    return { kind: 'ok' }
  }
}

function canConflict (tree: ScopeTree, d1: ValueDefinition, d2: ValueDefinition): Boolean {
  return !d1.scope || !d2.scope || scopesForId(tree, d1.scope).includes(d2.scope)
}
