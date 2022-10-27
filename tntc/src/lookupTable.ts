import { filterScope, scopesForId, ScopeTree } from './scoping'
import { TntType } from './tntTypes'

/**
 * A named operator defined. Can be scoped or module-wide (unscoped).
 */
export interface ValueDefinition {
  /* Same as TntDef kinds */
  kind: string
  /* The name given to the defined operator */
  identifier: string
  /* Expression or definition id from where the name was collected */
  reference?: bigint
  /* Optional scope, an id pointing to the TntIr node that introduces the name */
  scope?: bigint
}

/**
 * A type alias definition
 */
export interface TypeDefinition {
  /* The alias given to the type */
  identifier: string
  /* The type that is aliased (none for uninterpreted type) */
  type?: TntType
  /* Expression or definition id from where the type was collected */
  reference?: bigint
}

/**
 * A lookup table with all definitions for each name
 */
export interface LookupTable {
  /* Names for operators defined */
  valueDefinitions: Map<string, ValueDefinition[]>
  /* Type aliases defined */
  typeDefinitions: Map<string, TypeDefinition[]>
}

/**
 * Lookup tables for each module
 */
export type LookupTableByModule = Map<string, LookupTable>

/**
 * An empty lookup table, useful for initializing
 */
export function newTable ({ valueDefinitions = [], typeDefinitions = [] }: { valueDefinitions?: ValueDefinition[], typeDefinitions?: TypeDefinition[] }): LookupTable {
  const table: LookupTable = {
    valueDefinitions: new Map<string, ValueDefinition[]>(),
    typeDefinitions: new Map<string, TypeDefinition[]>(),
  }

  valueDefinitions.forEach(def => addValueToTable(def, table))
  typeDefinitions.forEach(def => addTypeToTable(def, table))

  return table
}

/**
 * A new lookup table instances with the same entries as an existing one
 */
export function copyTable (table: LookupTable): LookupTable {
  return {
    valueDefinitions: new Map<string, ValueDefinition[]>(table.valueDefinitions.entries()),
    typeDefinitions: new Map<string, TypeDefinition[]>(table.typeDefinitions.entries()),
  }
}

export function addValueToTable (def: ValueDefinition, table: LookupTable) {
  if (!table.valueDefinitions.has(def.identifier)) {
    table.valueDefinitions.set(def.identifier, [])
  }

  table.valueDefinitions.get(def.identifier)!.push(def)
}

export function addTypeToTable (def: TypeDefinition, table: LookupTable) {
  if (!table.typeDefinitions.has(def.identifier)) {
    table.typeDefinitions.set(def.identifier, [])
  }

  table.typeDefinitions.get(def.identifier)!.push(def)
}

export function lookupValue (table: LookupTable, scopeTree: ScopeTree, name: string, scope: bigint): ValueDefinition | undefined {
  if (!table.valueDefinitions.has(name)) {
    return undefined
  }

  return filterScope(table.valueDefinitions.get(name)!, scopesForId(scopeTree, scope))[0]
}

export function lookupType (table: LookupTable, name: string): TypeDefinition | undefined {
  if (!table.typeDefinitions.has(name)) {
    return undefined
  }

  return table.typeDefinitions.get(name)![0]
}

export function copyNames (originTable: LookupTable, namespace?: string): LookupTable {
  const table = newTable({})

  originTable.valueDefinitions.forEach((defs, identifier) => {
    const name = namespace ? [namespace, identifier].join('::') : identifier

    // Copy only unscoped and non-default (referenced) names
    const valueDefs = defs.filter(d => !d.scope && d.reference).map(d => ({ ...d, identifier: name }))

    if (valueDefs.length > 0) {
      table.valueDefinitions.set(name, valueDefs)
    }
  })

  originTable.typeDefinitions.forEach((defs, identifier) => {
    const name = namespace ? [namespace, identifier].join('::') : identifier

    // Copy only on-default (referenced) names
    const typeDefs = defs.filter(d => d.reference).map(d => ({ ...d, identifier: name }))

    if (typeDefs.length > 0) {
      table.typeDefinitions.set(name, typeDefs)
    }
  })

  return table
}

export function mergeTables (t1: LookupTable, t2: LookupTable): LookupTable {
  const result = copyTable(t1)

  t2.valueDefinitions.forEach((defs, _identifier) => {
    defs.forEach(def => addValueToTable(def, result))
  })
  t2.typeDefinitions.forEach((defs, _identifier) => {
    defs.forEach(def => addTypeToTable(def, result))
  })

  return result
}
