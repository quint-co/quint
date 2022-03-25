import { DefinitionTable, NameDefinition, TypeDefinition } from './definitionsCollector'
import { ScopeTree, scopesForId } from './scoping'

export interface Conflict {
  kind: 'operator' | 'type'
  identifier: string;
  references: BigInt[];
}

export type DefinitionsConflictResult =
  | { kind: 'ok' }
  | { kind: 'error', conflicts: Conflict[] }

export function scanConflicts (table: DefinitionTable, tree: ScopeTree): DefinitionsConflictResult {
  const conflicts: Conflict[] = []
  const nameConflicts = table.nameDefinitions.reduce((conflicts: Map<string, BigInt[]>, def: NameDefinition) => {
    const definitionsWithName = table.nameDefinitions
      .filter(d => d.identifier === def.identifier && (!d.scope || !def.scope || scopesForId(tree, d.scope).includes(def.scope)))
    if (definitionsWithName.length > 1) {
      conflicts.set(def.identifier, definitionsWithName.map(d => d.reference ?? BigInt(0)))
    }
    return conflicts
  }, new Map<string, BigInt[]>())

  const typeConflicts = table.typeDefinitions.reduce((conflicts: Map<string, BigInt[]>, def: TypeDefinition) => {
    const definitionsWithName = table.typeDefinitions.filter(d => d.identifier === def.identifier)
    if (definitionsWithName.length > 1) {
      conflicts.set(def.identifier, definitionsWithName.map(d => d.reference ?? BigInt(0)))
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
