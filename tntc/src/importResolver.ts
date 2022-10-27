/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Visits imports and instances copying definitions from modules being imported or instantiated
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { LookupTableByModule, LookupTable, newTable, copyTable, addValueToTable, addTypeToTable } from './definitionsCollector'
import { TntImport, TntInstance, TntModule, TntModuleDef } from './tntIr'
import { IRVisitor, walkModule } from './IRVisitor'

/**
 * A single import error
 */
export interface ImportError {
  /* The name of the module to be imported or instantiated */
  moduleName: string
  /* The reference of the import or instance definition */
  reference: bigint
  /* If importing a specific definition, the name of that definition */
  defName?: string
}

/**
 * The result of import resolution for a TNT Module.
 */
export type ImportResolutionResult =
  /* Success, all imports were resolved and an updated table is provided */
  | { kind: 'ok', definitions: LookupTableByModule }
  /* Error, at least one import couldn't be resolved. All errors are listed in errors */
  | { kind: 'error', errors: ImportError[] }

/**
 * Explores the IR visiting all imports and instances. For each one, tries to find a definition
 * table for the required module name, and if found, copies all unscoped non-default definitions
 * to the current module, including a namespace in case of instances.
 *
 * @param tntModule the TNT module for which imports should be resolved
 * @param definitions lookup table of collected names for all modules
 *
 * @returns a successful result with updated definitions in case all imports were resolved, or the errors otherwise
 */
export function resolveImports (tntModule: TntModule, definitions: LookupTableByModule): ImportResolutionResult {
  const visitor = new ImportResolverVisitor(definitions)
  walkModule(visitor, tntModule)

  return visitor.errors.length > 0
    ? { kind: 'error', errors: visitor.errors }
    : { kind: 'ok', definitions: visitor.tables }
}

class ImportResolverVisitor implements IRVisitor {
  constructor (tables: LookupTableByModule) {
    this.tables = tables
  }

  tables: LookupTableByModule
  errors: ImportError[] = []

  private currentModuleName: string = ''
  private currentTable: LookupTable = newTable({})
  private moduleStack: string[] = []

  enterModuleDef (def: TntModuleDef): void {
    this.tables.set(this.currentModuleName, this.currentTable)

    this.moduleStack.push(def.module.name)
    this.updateCurrentModule()
  }

  exitModuleDef (def: TntModuleDef): void {
    this.tables.set(def.module.name, this.currentTable)

    this.moduleStack.pop()
    this.updateCurrentModule()
  }

  enterInstance (def: TntInstance): void {
    const moduleTable = this.tables.get(def.protoName)

    if (!moduleTable) {
      // Instancing unexisting module
      this.errors.push({ moduleName: def.protoName, reference: def.id })
      return
    }

    // Copy the intanced module lookup table in a new lookup table for the instance
    this.tables.set(def.name, copyTable(moduleTable))

    // All names from the instanced module should be acessible with the instance namespace
    // So, copy them to the current module's lookup table
    const newEntries = copyNames(moduleTable, def.name)
    this.currentTable = mergeTables(this.currentTable, newEntries)
  }

  enterImport (def: TntImport): void {
    const moduleTable = this.tables.get(def.path)
    if (!moduleTable) {
      // Importing unexisting module
      this.errors.push({ moduleName: def.path, reference: def.id })
      return
    }

    const importableDefinitions = copyNames(moduleTable)

    if (def.name === '*') {
      // Imports all definitions
      this.currentTable = mergeTables(this.currentTable, importableDefinitions)
    } else {
      // Tries to find a specific definition, reporting an error if not found
      if (!importableDefinitions.valueDefinitions.has(def.name)) {
        this.errors.push({ moduleName: def.path, defName: def.name, reference: def.id })
        return
      }

      // Copy type and value definitions for the imported name
      const valueDefs = importableDefinitions.valueDefinitions.get(def.name) ?? []
      valueDefs.forEach(def => addValueToTable(def, this.currentTable))
      const typeDefs = importableDefinitions.typeDefinitions.get(def.name) ?? []
      typeDefs.forEach(def => addTypeToTable(def, this.currentTable))

      // For value definitions, check if there are modules being imported
      valueDefs.forEach(definition => {
        if (definition.kind === 'module') {
          // Collect all definitions namespaced to module
          const importedModuleTable = this.tables.get(definition.identifier)

          if (!importedModuleTable) {
            // Importing a module without a lookup table for it
            this.errors.push({ moduleName: def.path, defName: definition.identifier, reference: def.id })
            return
          }

          const newEntries = copyNames(importedModuleTable!, definition.identifier)
          this.currentTable = mergeTables(this.currentTable, newEntries)
        }
      })
    }
  }

  private updateCurrentModule (): void {
    if (this.moduleStack.length > 0) {
      this.currentModuleName = this.moduleStack[this.moduleStack.length - 1]

      if (!this.tables.has(this.currentModuleName)) {
        throw new Error(`Missing module: ${this.currentModuleName}`)
      }

      this.currentTable = this.tables.get(this.currentModuleName)!
    }
  }
}

function copyNames (originTable: LookupTable, namespace?: string): LookupTable {
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

function mergeTables (t1: LookupTable, t2: LookupTable): LookupTable {
  const result = copyTable(t1)

  t2.valueDefinitions.forEach((defs, identifier) => {
    defs.forEach(def => addValueToTable(def, result))
  })
  t2.typeDefinitions.forEach((defs, identifier) => {
    defs.forEach(def => addTypeToTable(def, result))
  })

  return result
}
