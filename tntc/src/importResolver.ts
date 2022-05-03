import { DefinitionTableByModule, DefinitionTable, emptyTable } from './definitionsCollector'
import { TntImport, TntInstance, TntModule, TntModuleDef } from './tntIr'
import { IRVisitor, walkModule } from './IRVisitor'

export interface ImportError {
  moduleName: string
  reference: bigint
  defName?: string
}

export type ImportResolutionResult =
  /* Success, all names were resolved */
  | { kind: 'ok', definitions: DefinitionTableByModule }
  /* Error, at least one name couldn't be resolved. All errors are listed in errors */
  | { kind: 'error', errors: ImportError[] }

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

    // Alias definitions from the instanced module to the new name
    const namespacedDefinitions = moduleTable.valueDefinitions
      .filter(d => !d.scope)
      .map(d => {
        // FIXME: This identifier string manipulation should be replaced by a better representation, see #58
        return { kind: d.kind, identifier: `${def.name}::${d.identifier}`, reference: d.reference }
      })
    this.currentTable.valueDefinitions.push(...namespacedDefinitions)
  }

  enterImport (def: TntImport): void {
    // FIXME: check if definitions are found, when we actually import them from other files
    const moduleTable = this.tables.get(def.path)
    if (!moduleTable) {
      this.errors.push({ moduleName: def.path, reference: def.id })
      return
    }
    // Import only unscoped and non-default (referenced) names
    const importableDefinitions = moduleTable.valueDefinitions.filter(d => !d.scope && d.reference)

    if (def.name === '*') {
      this.currentTable.valueDefinitions.push(...importableDefinitions)
    } else {
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
