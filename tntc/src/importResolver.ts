/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Visits imports and instances copying definitions from modules being imported or instantiated
 *
 * @author Gabriela Mafra
 *
 * @module
 */

import { DefinitionTableByModule, DefinitionTable, emptyTable } from './definitionsCollector'
import { TntImport, TntInstance, TntModule, TntModuleDef } from './tntIr'
import { IRVisitor, walkModule } from './IRVisitor'

/**
 * A single import error
 */
export interface ImportError {
  /* The name of the module supposed to be imported/instantiated */
  moduleName: string
  /* The reference of the import/instance definition */
  reference: bigint
  /* If importing a specific definition, the name of that definition */
  defName?: string
}

/**
 * The result of import resolution for a TNT Module.
 */
export type ImportResolutionResult =
  /* Success, all imports were resolved and an updated table is provided */
  | { kind: 'ok', definitions: DefinitionTableByModule }
  /* Error, at least one import couldn't be resolved. All errors are listed in errors */
  | { kind: 'error', errors: ImportError[] }

/**
 * Explores the IR visiting all imports and instances. For each one, tries to find a definition
 * table for the required module name, and if found, copies all unscoped non-default definitions
 * to the current module, including a namespace in case of instances.
 *
 * @param tntModule the TNT module for which imports should be resolved
 * @param definitions lists of names and type aliases collected for all modules
 *
 * @returns a successful result with updated definitions in case all imports were resolved, or the errors otherwise
 */
export function resolveImports (tntModule: TntModule, definitions: DefinitionTableByModule): ImportResolutionResult {
  const visitor = new ImportResolverVisitor(definitions)
  walkModule(visitor, tntModule)
  return visitor.errors.length > 0
    ? { kind: 'error', errors: visitor.errors }
    : { kind: 'ok', definitions: visitor.tables }
}

class ImportResolverVisitor implements IRVisitor {
  constructor (tables: DefinitionTableByModule) {
    this.tables = tables
  }

  tables: DefinitionTableByModule
  errors: ImportError[] = []

  private currentModule: string = ''
  private currentTable: DefinitionTable = emptyTable()
  private moduleStack: string[] = []

  enterModuleDef (def: TntModuleDef): void {
    this.moduleStack.push(def.module.name)

    this.updateCurrent()
  }

  exitModuleDef (_: TntModuleDef): void {
    this.moduleStack.pop()

    this.updateCurrent()
  }

  enterInstance (def: TntInstance): void {
    const moduleTable = this.tables.get(def.protoName)
    if (!moduleTable) {
      this.errors.push({ moduleName: def.protoName, reference: def.id })
      return
    }
    this.tables.set(def.name, copyTable(moduleTable))

    const namespacedDefinitions = moduleTable.valueDefinitions
      .filter(d => !d.scope)
      .map(d => {
        // FIXME: This identifier string manipulation should be replaced by a better representation, see #58
        // Alias definitions from the instanced module to the new name
        return { kind: d.kind, identifier: `${def.name}::${d.identifier}`, reference: d.reference }
      })
    this.currentTable.valueDefinitions.push(...namespacedDefinitions)
  }

  enterImport (def: TntImport): void {
    const moduleTable = this.tables.get(def.path)
    if (!moduleTable) {
      this.errors.push({ moduleName: def.path, reference: def.id })
      return
    }
    // Import only unscoped and non-default (referenced) names
    const importableDefinitions = moduleTable.valueDefinitions.filter(d => !d.scope && d.reference)

    if (def.name === '*') {
      // Imports all definitions
      this.currentTable.valueDefinitions.push(...importableDefinitions)
    } else {
      // Tries to find specific definition, reporting an error if not found
      const definition = importableDefinitions.find(d => d.identifier === def.name)

      if (definition) {
        this.currentTable.valueDefinitions.push(definition)
      } else {
        this.errors.push({ moduleName: def.path, defName: def.name, reference: def.id })
      }
    }
  }

  private updateCurrent (): void {
    if (this.moduleStack.length > 0) {
      this.currentModule = this.moduleStack[this.moduleStack.length - 1]

      let moduleTable = this.tables.get(this.currentModule)
      if (!moduleTable) {
        moduleTable = emptyTable()
        this.tables.set(this.currentModule, moduleTable)
      }
      this.currentTable = moduleTable
    }
  }
}

function copyTable (t: DefinitionTable): DefinitionTable {
  return {
    valueDefinitions: t.valueDefinitions,
    typeDefinitions: t.typeDefinitions,
  }
}
