import { DefinitionTable, NameDefinition } from './definitionsCollector'

export interface Conflict {
    kind: 'operator' | 'type'
    identifier: string;
    references: BigInt[];
}

export type DefinitionsConflictResult =
    | { kind: 'ok' }
    | { kind: 'error', conflicts: Conflict[] }

export interface ScopeTree {
    value: BigInt;
    children?: ScopeTree[];
}

export function scanConflicts (table: DefinitionTable, tree: ScopeTree): DefinitionsConflictResult {
  const conflicts: Conflict[] = []
  const nameConflicts = table.nameDefinitions.reduce((conflicts: Map<string, BigInt[]>, def: NameDefinition) => {
    const definitionsWithName = table.nameDefinitions.filter(d => d.identifier === def.identifier)
    if (definitionsWithName.length > 1) {
      conflicts.set(def.identifier, definitionsWithName.map(d => d.reference ?? BigInt(0)))
    }
    return conflicts
  }, new Map<string, BigInt[]>())

  nameConflicts.forEach((value, key) => (conflicts.push({ kind: 'operator', identifier: key, references: value })))

  return { kind: 'error', conflicts: conflicts }
}
