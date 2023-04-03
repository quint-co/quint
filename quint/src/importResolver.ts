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

import { DefinitionsByModule, DefinitionsByName, addTypeToTable, addValueToTable, copyNames, copyTable, mergeTables, newTable } from './definitionsByName'
import { QuintExport, QuintImport, QuintInstance, QuintModule } from './quintIr'
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
export type ImportResolutionResult = [Map<bigint, QuintError>, DefinitionsByName]
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
export function resolveImports(quintModule: QuintModule, tables: DefinitionsByModule): ImportResolutionResult {
  const visitor = new ImportResolverVisitor(tables)
  walkModule(visitor, quintModule)

  return [visitor.errors, visitor.table]
}

class ImportResolverVisitor implements IRVisitor {
  constructor(tables: DefinitionsByModule) {
    this.tables = tables
  }

  tables: DefinitionsByModule
  errors: Map<bigint, QuintError> = new Map<bigint, QuintError>()
  table: DefinitionsByName = newTable({})

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
    if (def.qualifiedName) {
      this.tables.set(def.qualifiedName, instanceTable)
    }

    // For each override, check if the name exists in the instantiated module and is a constant.
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

    // All names from the instanced module should be acessible with the instance namespace
    // So, copy them to the current module's lookup table
    const newEntries = copyNames(instanceTable, def.qualifiedName, this.currentModule?.id)
    this.table = mergeTables(this.table, newEntries)
  }

  enterImport(def: QuintImport): void {
    if (def.protoName === this.currentModule?.name) {
      // Importing current module
      this.errors.set(def.id, {
        code: 'QNT407',
        message: `Cannot import ${def.protoName} inside ${def.protoName}`,
        data: {},
      })
      return
    }

    const moduleTable = this.tables.get(def.protoName)
    if (!moduleTable) {
      // Importing unexisting module
      this.errors.set(def.id, {
        code: 'QNT404',
        message: `Module ${def.protoName} not found`,
        data: {},
      })
      return
    }

    const qualifier = def.defName ? undefined : (def.qualifiedName ?? def.protoName)
    const importableDefinitions = copyNames(moduleTable, qualifier, this.currentModule?.id)
    if (!def.defName || def.defName === '*') {
      // Imports all definitions
      this.table = mergeTables(this.table, importableDefinitions)
    } else {
      // Tries to find a specific definition, reporting an error if not found
      if (!importableDefinitions.valueDefinitions.has(def.defName)) {
        this.errors.set(def.id, {
          code: 'QNT405',
          message: `Name ${def.protoName}::${def.defName} not found`,
          data: {},
        })
        return
      }

      // Copy type and value definitions for the imported name
      const valueDefs = importableDefinitions.valueDefinitions.get(def.defName) ?? []
      valueDefs.forEach(def => addValueToTable(def, this.table))
      const typeDefs = importableDefinitions.typeDefinitions.get(def.defName) ?? []
      typeDefs.forEach(def => addTypeToTable(def, this.table))
    }
  }

  enterExport(def: QuintExport) {
    if (def.protoName === this.currentModule?.name) {
      // Exporting current module
      this.errors.set(def.id, {
        code: 'QNT407',
        message: `Cannot export ${def.protoName} inside ${def.protoName}`,
        data: {},
      })
      return
    }

    const moduleTable = this.tables.get(def.protoName)
    if (!moduleTable) {
      // Exporting unexisting module
      this.errors.set(def.id, {
        code: 'QNT404',
        message: `Module ${def.protoName} not found`,
        data: {},
      })
      return
    }

    const qualifier = def.defName ? undefined : (def.qualifiedName ?? def.protoName)
    const exportableDefinitions = copyNames(moduleTable, qualifier)

    if (!def.defName || def.defName === '*') {
      // Remove scoped versions of the definitions to avoid conflicts
      exportableDefinitions.valueDefinitions.forEach((_, name) => {
        const existingDefs = this.table.valueDefinitions.get(name)
        if (existingDefs) {
          this.table.valueDefinitions.set(name, existingDefs.filter(d => d.scope !== this.currentModule?.id))
        }
      })
      exportableDefinitions.typeDefinitions.forEach((_, name) => {
        const existingDefs = this.table.typeDefinitions.get(name)
        if (existingDefs) {
          this.table.typeDefinitions.set(name, existingDefs.filter(d => d.scope !== this.currentModule?.id))
        }
      })

      // Export all definitions
      this.table = mergeTables(this.table, exportableDefinitions)
    } else {
      // Tries to find a specific definition, reporting an error if not found
      const valueDefs = exportableDefinitions.valueDefinitions.get(def.defName)
      const typeDefs = exportableDefinitions.typeDefinitions.get(def.defName)

      if (valueDefs) {
        // Remove scoped versions of the definitions to avoid conflicts
        console.log(this.table.valueDefinitions.get(def.defName))
        exportableDefinitions.valueDefinitions.forEach((_, name) => {
          const existingDefs = this.table.valueDefinitions.get(name)
          if (existingDefs) {
            this.table.valueDefinitions.set(name, existingDefs.filter(d => d.scope !== this.currentModule?.id))
          }
        })
        console.log(this.table.valueDefinitions.get(def.defName))

        valueDefs.forEach(def => addValueToTable(def, this.table))
        return
      }

      if (typeDefs) {
        // Remove scoped versions of the definitions to avoid conflicts

        exportableDefinitions.typeDefinitions.forEach((_, name) => {
          const existingDefs = this.table.typeDefinitions.get(name)
          if (existingDefs) {
            this.table.typeDefinitions.set(name, existingDefs.filter(d => d.scope !== this.currentModule?.id))
          }
        })

        typeDefs.forEach(def => addTypeToTable(def, this.table))
        return
      }

      this.errors.set(def.id, {
        code: 'QNT405',
        message: `Name ${def.protoName}::${def.defName} not found`,
        data: {},
      })
    }
  }
}
