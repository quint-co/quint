/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Verification for conflicts in a definition lookup table. Also ensures no shadowing.
 *
 * @author Gabriela Mafra
 *
 * @module
 */

import { DefinitionTable, NameDefinition, TypeDefinition } from './definitionsCollector'
import { ScopeTree, scopesForId } from './scoping'

/**
 * The source of a conflict occurrences
 */
export type ConflictSource =
  /* A user definition, referencing its IR node id */
  | { kind: 'user', reference: BigInt }
  /* A built-in definition, no reference */
  | { kind: 'builtin' }

/**
 * Error report for a found name conflict
 */
export interface Conflict {
  /* Either a 'type' or 'operator' conflict */
  kind: 'operator' | 'type';
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
export function scanConflicts (table: DefinitionTable, tree: ScopeTree): DefinitionsConflictResult {
  const conflicts: Conflict[] = []
  const nameConflicts = table.nameDefinitions.reduce((conflicts: Map<string, ConflictSource[]>, def: NameDefinition) => {
    const defsWithName = table.nameDefinitions.filter(d => d.identifier === def.identifier && canConflict(tree, d, def))
    if (defsWithName.length > 1) {
      const sources: ConflictSource[] = defsWithName.map(d => d.reference ? { kind: 'user', reference: d.reference } : { kind: 'builtin' })
      conflicts.set(def.identifier, sources)
    }
    return conflicts
  }, new Map<string, ConflictSource[]>())

  const typeConflicts = table.typeDefinitions.reduce((conflicts: Map<string, ConflictSource[]>, def: TypeDefinition) => {
    // Types don't have scopes at the moment
    // With type quantification, they should have scopes and this code can be refactor
    // into a more generalized form
    const defsWithName = table.typeDefinitions.filter(d => d.identifier === def.identifier)
    if (defsWithName.length > 1) {
      const sources: ConflictSource[] = defsWithName.map(d => d.reference ? { kind: 'user', reference: d.reference } : { kind: 'builtin' })
      conflicts.set(def.identifier, sources)
    }
    return conflicts
  }, new Map<string, ConflictSource[]>())

  nameConflicts.forEach((value, key) => (conflicts.push({ kind: 'operator', identifier: key, sources: value })))
  typeConflicts.forEach((value, key) => (conflicts.push({ kind: 'type', identifier: key, sources: value })))

  if (conflicts.length > 0) {
    return { kind: 'error', conflicts: conflicts }
  } else {
    return { kind: 'ok' }
  }
}

function canConflict (tree: ScopeTree, d1: NameDefinition, d2: NameDefinition): Boolean {
  return !d1.scope || !d2.scope || scopesForId(tree, d1.scope).includes(d2.scope)
}
