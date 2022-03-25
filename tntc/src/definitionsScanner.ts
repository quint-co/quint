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
 * Error report for a found name conflict
 */
export interface Conflict {
  /* Either a 'type' or 'operator' conflict */
  kind: 'operator' | 'type';
  /* The name that has a conflict */
  identifier: string;
  /* IR ids for the occurrences of the conflicting name */
  references: BigInt[];
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
  const nameConflicts = table.nameDefinitions.reduce((conflicts: Map<string, BigInt[]>, def: NameDefinition) => {
    const defsWithName = table.nameDefinitions.filter(d => d.identifier === def.identifier && canConflict(tree, d, def))
    if (defsWithName.length > 1) {
      conflicts.set(def.identifier, defsWithName.map(d => d.reference ?? BigInt(0)))
    }
    return conflicts
  }, new Map<string, BigInt[]>())

  const typeConflicts = table.typeDefinitions.reduce((conflicts: Map<string, BigInt[]>, def: TypeDefinition) => {
    // Types don't have scopes at the moment
    // With type quantification, they should have scopes and this code can be refactor
    // into a more generalized form
    const defsWithName = table.typeDefinitions.filter(d => d.identifier === def.identifier)
    if (defsWithName.length > 1) {
      conflicts.set(def.identifier, defsWithName.map(d => d.reference ?? BigInt(0)))
    }
    return conflicts
  }, new Map<string, BigInt[]>())

  nameConflicts.forEach((value, key) => (conflicts.push({ kind: 'operator', identifier: key, references: value })))
  typeConflicts.forEach((value, key) => (conflicts.push({ kind: 'type', identifier: key, references: value })))

  if (conflicts.length > 0) {
    return { kind: 'error', conflicts: conflicts }
  } else {
    return { kind: 'ok' }
  }
}

function canConflict (tree: ScopeTree, d1: NameDefinition, d2: NameDefinition): Boolean {
  return !d1.scope || !d2.scope || scopesForId(tree, d1.scope).includes(d2.scope)
}
