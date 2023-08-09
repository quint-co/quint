/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022-2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Name collection for Quint name resolution.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { IRVisitor } from '../ir/IRVisitor'
import { QuintError } from '../quintError'
import {
  QuintAssume,
  QuintConst,
  QuintExport,
  QuintImport,
  QuintInstance,
  QuintModule,
  QuintOpDef,
  QuintTypeDef,
  QuintVar,
} from '../ir/quintIr'
import { Definition, DefinitionsByModule, DefinitionsByName, LookupTable, builtinNames, copyNames } from './base'
import {
  moduleNotFoundError,
  nameNotFoundError,
  paramIsNotAConstantError,
  paramNotFoundError,
  selfReferenceError,
} from './importErrors'

/**
 * Collects all top-level definitions in Quint modules. Used internally by
 * `NameResolver`. Also handles imports, instances and exports, collecting
 * definitions from those statements and managing their level of visibility.
 */
export class NameCollector implements IRVisitor {
  definitionsByName: DefinitionsByName = new Map()
  definitionsByModule: DefinitionsByModule = new Map()
  errors: QuintError[] = []
  table: LookupTable = new Map()
  private currentModuleName: string = ''
  private definitionDepth: number = 0

  enterModule(module: QuintModule): void {
    this.currentModuleName = module.name
    this.definitionsByName = new Map()

    if (this.definitionsByModule.has(module.name)) {
      const message = `Module with name '${module.name}' was already defined`
      this.errors.push({ code: 'QNT102', message, reference: module.id, data: {} })
    }
  }

  exitModule(module: QuintModule): void {
    this.definitionsByModule.set(module.name, this.definitionsByName)
  }

  enterVar(def: QuintVar): void {
    this.collectDefinition(def.name, { kind: def.kind, reference: def.id, typeAnnotation: def.typeAnnotation })
  }

  enterConst(def: QuintConst): void {
    this.collectDefinition(def.name, { kind: def.kind, reference: def.id, typeAnnotation: def.typeAnnotation })
  }

  enterOpDef(def: QuintOpDef): void {
    // FIXME (#1013): This should collect the type annotation, but something
    // breaks in the type checker if we do. We should fix that and then ensure
    // that we collect type annotations here.
    if (this.definitionDepth === 0) {
      // collect only top-level definitions
      this.collectDefinition(def.name, { kind: def.kind, reference: def.id })
    }

    this.definitionDepth++
  }

  exitOpDef(_def: QuintOpDef): void {
    this.definitionDepth--
  }

  enterTypeDef(def: QuintTypeDef): void {
    this.collectDefinition(def.name, { kind: 'type', reference: def.id, typeAnnotation: def.type })
  }

  enterAssume(def: QuintAssume): void {
    this.collectDefinition(def.name, { kind: 'assumption', reference: def.id })
  }

  enterInstance(def: QuintInstance): void {
    // Copy defs from the module being instantiated
    if (def.protoName === this.currentModuleName) {
      // Importing current module
      this.errors.push(selfReferenceError(def))
      return
    }

    const moduleTable = this.definitionsByModule.get(def.protoName)

    if (!moduleTable) {
      // Instantiating a non-existing module
      this.errors.push(moduleNotFoundError(def))
      return
    }

    const instanceTable = new Map([...moduleTable.entries()])
    if (def.qualifiedName) {
      // Add the qualifier to `definitionsMyModule` map with a copy of the
      // definitions, so if there is an export of that qualifier, we know which
      // definitions to export
      this.definitionsByModule.set(def.qualifiedName, instanceTable)
    }

    // For each override, check if the name exists in the instantiated module and is a constant.
    // If so, update the value definition to point to the expression being overriden
    def.overrides.forEach(([param, ex]) => {
      const constDef = instanceTable.get(param.name)

      if (!constDef) {
        this.errors.push(paramNotFoundError(def, param))
        return
      }

      if (constDef.kind !== 'const') {
        this.errors.push(paramIsNotAConstantError(def, param))
        return
      }

      // Update the definition to point to the expression being overriden
      instanceTable.set(param.name, { ...constDef, reference: ex.id })
    })

    // All names from the instanced module should be acessible with the instance namespace
    // So, copy them to the current module's lookup table
    const newDefs = copyNames(instanceTable, def.qualifiedName, true)
    this.collectDefinitions(newDefs)
  }

  enterImport(def: QuintImport): void {
    if (def.protoName === this.currentModuleName) {
      // Importing current module
      this.errors.push(selfReferenceError(def))
      return
    }

    const moduleTable = this.definitionsByModule.get(def.protoName)

    if (!moduleTable) {
      // Importing non-existing module
      this.errors.push(moduleNotFoundError(def))
      return
    }

    if (def.qualifiedName) {
      // Add the qualifier to `definitionsMyModule` map with a copy of the
      // definitions, so if there is an export of that qualifier, we know which
      // definitions to export
      const newTable = new Map([...moduleTable.entries()])
      this.definitionsByModule.set(def.qualifiedName, newTable)
    }

    const qualifier = def.defName ? undefined : def.qualifiedName ?? def.protoName
    const importableDefinitions = copyNames(moduleTable, qualifier, true)

    if (!def.defName || def.defName === '*') {
      // Imports all definitions
      this.collectDefinitions(importableDefinitions)
      return
    }

    // Tries to find a specific definition, reporting an error if not found
    const newDef = importableDefinitions.get(def.defName)
    if (!newDef) {
      this.errors.push(nameNotFoundError(def))
      return
    }

    this.collectDefinition(def.defName, newDef, def.id)
  }

  // Imported names are copied with a scope since imports are not transitive by
  // default. Exporting needs to turn those names into unhidden ones so, when
  // the current module is imported, the names are accessible. Note that it is
  // also possible to export names that were not previously imported via `import`.
  enterExport(def: QuintExport) {
    if (def.protoName === this.currentModuleName) {
      // Exporting current module
      this.errors.push(selfReferenceError(def))
      return
    }

    const moduleTable = this.definitionsByModule.get(def.protoName)
    if (!moduleTable) {
      // Exporting non-existing module
      this.errors.push(moduleNotFoundError(def))
      return
    }

    const qualifier = def.defName ? undefined : def.qualifiedName ?? def.protoName
    const exportableDefinitions = copyNames(moduleTable, qualifier)

    if (!def.defName || def.defName === '*') {
      // Export all definitions
      this.collectDefinitions(exportableDefinitions)
      return
    }

    // Tries to find a specific definition, reporting an error if not found
    const newDef = exportableDefinitions.get(def.defName)

    if (!newDef) {
      this.errors.push(nameNotFoundError(def))
      return
    }

    this.collectDefinition(def.defName, newDef, def.id)
  }

  /** Public interface to manipulate the collected definitions. Used by
   * `NameResolver` to add and remove scoped definitions */

  /**
   * Collects a definition with the given identifier and definition object. If the
   * identifier is an underscore or a built-in name, the definition is not collected.
   * If the identifier conflicts with a previous definition, a conflict is recorded.
   *
   * @param identifier - The identifier of the definition to collect.
   * @param def - The definition object to collect.
   * @param source - An optional source identifier for the definition, if the
   * source is different than `def.id` (i.e. in import-like statements).
   */
  collectDefinition(identifier: string, def: Definition, source?: bigint): void {
    if (identifier === '_') {
      // Don't collect underscores, as they are special identifiers that allow no usage
      return
    }

    if (builtinNames.includes(identifier)) {
      // Conflict with a built-in name
      this.recordConflict(identifier, undefined, source ?? def.reference)
      return
    }

    if (this.definitionsByName.has(identifier) && this.definitionsByName.get(identifier)!.reference != def.reference) {
      // Conflict with a previous definition
      this.recordConflict(identifier, this.definitionsByName.get(identifier)!.reference, source ?? def.reference)
      return
    }

    this.definitionsByName.set(identifier, def)
  }

  /**
   * Deletes the definition with the given identifier from the collected definitions.
   *
   * @param identifier - The identifier of the definition to delete.
   */
  deleteDefinition(identifier: string): void {
    this.definitionsByName.delete(identifier)
  }

  /**
   * Obtains a collected definition.
   *
   * @param identifier - The identifier of the definition to retrieve.
   *
   * @returns The definition object for the given identifier, or undefined if a
   * definitions with that identifier was never collected.
   */
  getDefinition(identifier: string): Definition | undefined {
    return this.definitionsByName.get(identifier)
  }

  private collectDefinitions(newDefs: DefinitionsByName): void {
    newDefs.forEach((def, identifier) => {
      const existingEntry = this.definitionsByName.get(identifier)
      if (existingEntry && existingEntry.reference !== def.reference) {
        this.recordConflict(identifier, existingEntry.reference, def.reference)
      }
    })

    this.definitionsByName = new Map([...this.definitionsByName.entries(), ...newDefs.entries()])
  }

  private recordConflict(identifier: string, exisitingSource: bigint | undefined, newSource: bigint): void {
    // exisitingSource is undefined when the conflict is with a built-in name
    const message = exisitingSource
      ? `Conflicting definitions found for name '${identifier}' in module '${this.currentModuleName}'`
      : `Built-in name '${identifier}' is redefined in module '${this.currentModuleName}'`

    if (exisitingSource) {
      this.errors.push({ code: 'QNT101', message, reference: exisitingSource, data: {} })
    }

    this.errors.push({ code: 'QNT101', message, reference: newSource, data: {} })
  }
}
