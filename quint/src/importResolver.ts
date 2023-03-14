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

import { LookupTable, LookupTableByModule, addTypeToTable, addValueToTable, copyNames, copyTable, mergeTables, newTable } from './lookupTable'
import { QuintImport, QuintInstance, QuintModule } from './quintIr'
import { IRVisitor, walkModule } from './IRVisitor'
import { QuintError } from './quintError'

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
 * The result of import resolution for a Quint Module.
 */
export type ImportResolutionResult = [Map<bigint, QuintError>, LookupTable]
/**
 * Explores the IR visiting all imports and instances. For each one, tries to find a definition
 * table for the required module name, and if found, copies all unscoped non-default definitions
 * to the current module, including a namespace in case of instances.
 *
 * @param quintModule the Quint module for which imports should be resolved
 * @param tables lookup table of collected names for all modules
 *
 * @returns a successful result with updated definitions in case all imports were resolved, or the errors otherwise
 */
export function resolveImports(quintModule: QuintModule, tables: LookupTableByModule): ImportResolutionResult {
  const visitor = new ImportResolverVisitor(tables)
  walkModule(visitor, quintModule)

  return [visitor.errors, visitor.table]
}

class ImportResolverVisitor implements IRVisitor {
  constructor(tables: LookupTableByModule) {
    this.tables = tables
  }

  tables: LookupTableByModule
  errors: Map<bigint, QuintError> = new Map<bigint, QuintError>()
  table: LookupTable = newTable({})

  private currentModule?: QuintModule

  enterModule(module: QuintModule): void {
    this.currentModule = module
    this.table = this.tables.get(module.name) ?? newTable({})
  }

  exitModule(module: QuintModule): void {
    this.tables.set(module.name, this.table)
  }

  enterInstance(def: QuintInstance): void {
    if (def.protoName === this.currentModule?.name) {
      // Importing current module
      this.errors.set(def.id, {
        code: 'QNT407',
        message: `Cannot instantiate ${def.protoName} inside ${def.protoName}`,
        data: {},
      })
      return
    }

    const moduleTable = this.tables.get(def.protoName)

    if (!moduleTable) {
      // Instantiating a non-existing module
      this.errors.set(def.id, {
        code: 'QNT404',
        message: `Module ${def.protoName} not found`,
        data: {},
      })
      return
    }
    const instanceTable = copyTable(moduleTable)

    // For each override, check if the name exists in the instanced module and is a constant.
    // If so, update the value definition to point to the expression being overriden
    def.overrides.forEach(([name, ex]) => {
      const valueDefs = instanceTable.valueDefinitions.get(name.name) ?? []

      if (valueDefs.length === 0) {
        this.errors.set(def.id, {
          code: 'QNT406',
          message: `Instantiation error: ${name.name} not found in ${def.protoName}`,
          data: {},
        })
      }

      if (!valueDefs.every(def => def.kind === 'const')) {
        this.errors.set(def.id, {
          code: 'QNT406',
          message: `Instantiation error: ${name.name} is not a constant`,
          data: {},
        })
      }
      const newDefs = valueDefs.map(def => ({ ...def, reference: ex.id }))
      instanceTable.valueDefinitions.set(name.name, newDefs)
    })

    // Copy the intanced module lookup table in a new lookup table for the instance
    this.tables.set(def.name, instanceTable)

    // All names from the instanced module should be acessible with the instance namespace
    // So, copy them to the current module's lookup table
    const newEntries = copyNames(instanceTable, def.name, this.currentModule?.id)
    this.table = mergeTables(this.table, newEntries)
  }

  enterImport(def: QuintImport): void {
    if(def.path === this.currentModule?.name) {
      // Importing current module
      this.errors.set(def.id, {
        code: 'QNT407',
        message: `Cannot import ${def.path} inside ${def.path}`,
        data: {},
      })
      return
    }

    const moduleTable = this.tables.get(def.path)
    if (!moduleTable) {
      // Importing unexisting module
      this.errors.set(def.id, {
        code: 'QNT404',
        message: `Module ${def.path} not found`,
        data: {},
      })
      return
    }

    const importableDefinitions = copyNames(moduleTable, undefined, this.currentModule?.id)

    if (def.name === '*') {
      // Imports all definitions
      this.table = mergeTables(this.table, importableDefinitions)
    } else {
      // Tries to find a specific definition, reporting an error if not found
      if (!importableDefinitions.valueDefinitions.has(def.name)) {
        this.errors.set(def.id, {
          code: 'QNT405',
          message: `Name ${def.path}::${def.name} not found`,
          data: {},
        })
        return
      }

      // Copy type and value definitions for the imported name
      const valueDefs = importableDefinitions.valueDefinitions.get(def.name) ?? []
      valueDefs.forEach(def => addValueToTable(def, this.table))
      const typeDefs = importableDefinitions.typeDefinitions.get(def.name) ?? []
      typeDefs.forEach(def => addTypeToTable(def, this.table))
    }
  }
}
