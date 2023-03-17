import { QuintType } from "./quintTypes"
import { ScopeTree, filterScope, scopesForId } from "./scoping"

/**
 * Possible kinds for value definitions
 */
export type ValueDefinitionKind = 'module' | 'def' | 'val' | 'assumption' | 'param' | 'var' | 'const'

/**
 * A named operator definition. Can be scoped or module-wide (unscoped).
 */
export interface ValueDefinition {
  /* Same as QuintDef kinds */
  kind: ValueDefinitionKind
  /* The name given to the defined operator */
  identifier: string
  /* Expression or definition id from where the name was collected */
  reference?: bigint
  /* Optional scope, an id pointing to the QuintIr node that introduces the name */
  scope?: bigint
  /* Optional type annotation */
  typeAnnotation?: QuintType
}

/**
 * A type alias definition
 */
export interface TypeDefinition {
  /* The alias given to the type */
  identifier: string
  /* The type that is aliased (none for uninterpreted type) */
  type?: QuintType
  /* Expression or definition id from where the type was collected */
  reference?: bigint
}

/**
 * A definitions table partitioned in value definitions and type definitions. Should
 * be manipulated only by functions in this file to maintain it's consistency:
 *
 * If a name is set on a definitions map, its values must be non-empty.
 */
export interface DefinitionsByName {
  /* Names for operators defined */
  valueDefinitions: Map<string, ValueDefinition[]>
  /* Type aliases defined */
  typeDefinitions: Map<string, TypeDefinition[]>
}


/**
 * Definitions tables for each module
 */
export type DefinitionsByModule = Map<string, DefinitionsByName>

/**
 * An initializer for definitions tables
 *
 * @param definitions optional interface with lists of valueDefinitions and
 * typeDefinitions to start the table with
 *
 * @returns a new definitions table with the given definitions
 */
export function newTable(
  {
    valueDefinitions = [],
    typeDefinitions = [],
  }: { valueDefinitions?: ValueDefinition[], typeDefinitions?: TypeDefinition[] }
): DefinitionsByName {
  const table: DefinitionsByName = {
    valueDefinitions: new Map<string, ValueDefinition[]>(),
    typeDefinitions: new Map<string, TypeDefinition[]>(),
  }

  valueDefinitions.forEach(def => addValueToTable(def, table))
  typeDefinitions.forEach(def => addTypeToTable(def, table))

  return table
}

/**
 * Duplicate a definitions table
 *
 * @param table the table to be copied
 *
 * @returns a definitions table with the same definitions as the provided one
 */
export function copyTable(table: DefinitionsByName): DefinitionsByName {
  return {
    valueDefinitions: new Map<string, ValueDefinition[]>(table.valueDefinitions.entries()),
    typeDefinitions: new Map<string, TypeDefinition[]>(table.typeDefinitions.entries()),
  }
}

/**
 * Add a value definitions to a definitions table
 *
 * @param def the value definition to be added
 * @param table the definitions table to be updated
 */
export function addValueToTable(def: ValueDefinition, table: DefinitionsByName) {
  if (!table.valueDefinitions.has(def.identifier)) {
    table.valueDefinitions.set(def.identifier, [])
  }

  table.valueDefinitions.get(def.identifier)!.push(def)
}

/**
 * Add a type definitions to a definitions table
 *
 * @param def the type definition to be added
 * @param table the definitions table to be updated
 */
export function addTypeToTable(def: TypeDefinition, table: DefinitionsByName) {
  if (!table.typeDefinitions.has(def.identifier)) {
    table.typeDefinitions.set(def.identifier, [])
  }

  table.typeDefinitions.get(def.identifier)!.push(def)
}

/**
 * Lookup a name in the value definitions in a definitions table
 *
 * @param table the definitions table to be scanned
 * @param scopeTree the scope tree for the module where the name occurs
 * @param name the name of the definition to be found
 * @param scope the expression id where the name occurs
 *
 * @returns the value definition, if found under the scope. Otherwise, undefined
 */
export function lookupValue(
  table: DefinitionsByName, scopeTree: ScopeTree, name: string, scope: bigint
): ValueDefinition | undefined {
  if (!table.valueDefinitions.has(name)) {
    return undefined
  }

  return filterScope(table.valueDefinitions.get(name)!, scopesForId(scopeTree, scope))[0]
}

/**
 * Lookup a name in the type definitions in a definitions table
 *
 * @param table the definitions table to be scanned
 * @param name the name of the definition to be found
 *
 * @returns the type definition, if found under the scope. Otherwise, undefined
 */
export function lookupType(table: DefinitionsByName, name: string): TypeDefinition | undefined {
  if (!table.typeDefinitions.has(name)) {
    return undefined
  }

  return table.typeDefinitions.get(name)![0]
}

/**
 * Copy the names of a definitions table to a new one, ignoring scoped and default
 * definitions, and optionally adding a namespace.
 *
 * @param originTable the definitions table to copy from
 * @param namespace optional namespace to be added to copied names
 * @param scope optional scope to be added to copied definitions
 *
 * @returns a definitions table with the filtered and namespaced names
 */
export function copyNames(originTable: DefinitionsByName, namespace?: string, scope?: bigint): DefinitionsByName {
  const table = newTable({})

  originTable.valueDefinitions.forEach((defs, identifier) => {
    const name = namespace ? [namespace, identifier].join('::') : identifier

    // Copy only unscoped and non-default (referenced) names
    const valueDefs = defs.filter(d => !d.scope && d.reference).map(d => ({ ...d, identifier: name, scope }))

    if (valueDefs.length > 0) {
      table.valueDefinitions.set(name, valueDefs)
    }
  })

  originTable.typeDefinitions.forEach((defs, identifier) => {
    const name = namespace ? [namespace, identifier].join('::') : identifier

    // Copy only non-default (referenced) names
    const typeDefs = defs.filter(d => d.reference).map(d => ({ ...d, identifier: name }))

    if (typeDefs.length > 0) {
      table.typeDefinitions.set(name, typeDefs)
    }
  })

  return table
}

/**
 * Merges two definitions tables together in a new one.
 *
 * @param t1 a definitions table to be merged
 * @param t2 a definitions table to be merged
 *
 * @returns the merged definitions table
 */
export function mergeTables(t1: DefinitionsByName, t2: DefinitionsByName): DefinitionsByName {
  const result = copyTable(t1)

  t2.valueDefinitions.forEach((defs, _identifier) => {
    defs.forEach(def => addValueToTable(def, result))
  })
  t2.typeDefinitions.forEach((defs, _identifier) => {
    defs.forEach(def => addTypeToTable(def, result))
  })

  return result
}
