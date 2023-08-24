/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Flattening for modules, replacing instances, imports and exports with definitions refered by the module.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { LookupDefinition, LookupTable, builtinNames } from '../names/base'
import {
  QuintApp,
  QuintDef,
  QuintEx,
  QuintExport,
  QuintImport,
  QuintInstance,
  QuintModule,
  QuintName,
  qualifier,
} from '../ir/quintIr'

import { IRVisitor, walkDefinition, walkExpression, walkModule } from '../ir/IRVisitor'
import { addNamespaceToDefinition } from '../ir/namespacer'

/**
 * Flatten a module, replacing instances, imports and exports with definitions refered by the module.
 *
 * @param quintModule - The module to be flattened
 * @param modulesByName - A map of referred modules by name
 * @param lookupTable - The lookup table for the module and all its references
 *
 * @returns The flattened module
 */
export function flattenModule(
  quintModule: QuintModule,
  modulesByName: Map<string, QuintModule>,
  lookupTable: LookupTable
): QuintModule {
  const moduleCopy: QuintModule = { ...quintModule, declarations: [...quintModule.declarations] }
  const flattener = new Flattener(modulesByName, lookupTable)
  walkModule(flattener, moduleCopy)
  return moduleCopy
}

/**
 * Find definitions used by a given expression, by flattening that expression.
 *
 * @param expr - The expression to for which to find definitions
 * @param lookupTable - The lookup table with all related references
 *
 * @returns The definitions used by the expression and their dependencies
 */
export function dependentDefinitions(expr: QuintEx, lookupTable: LookupTable): QuintDef[] {
  const flattener = new Flattener(new Map(), lookupTable)
  walkExpression(flattener, expr)
  return [...flattener.defsToAdd.values()]
}

class Flattener implements IRVisitor {
  // Buffer of definitions to add to the module. We can try to make this ordered in the future.
  // For now, we rely on toposorting defs after flattening.
  defsToAdd: Map<string, QuintDef> = new Map()

  private modulesByName: Map<string, QuintModule>
  private lookupTable: LookupTable
  // Store a namespace to use when recursing into nested definitions
  private namespaceForNested?: string

  constructor(modulesByName: Map<string, QuintModule>, lookupTable: LookupTable) {
    this.modulesByName = modulesByName
    this.lookupTable = lookupTable
  }

  enterModule(_quintModule: QuintModule) {
    // Reset `defsToAdd`
    this.defsToAdd = new Map()
  }

  exitModule(quintModule: QuintModule) {
    // Get rid of imports and exports, and add the definitions we collected
    quintModule.declarations = quintModule.declarations.filter(d => d.kind !== 'import' && d.kind !== 'export')
    quintModule.declarations.push(...this.defsToAdd.values())
  }

  enterName(name: QuintName) {
    this.flattenName(name.id)
  }

  enterApp(app: QuintApp) {
    this.flattenName(app.id)
  }

  enterExport(decl: QuintExport) {
    // Find all top-level definitions in the exported module that are used somewhere
    // (not necessarily in the module itself)
    const ids = this.modulesByName.get(decl.protoName)!.declarations.map(d => d.id)
    const definitions = [...this.lookupTable.values()].filter(d => ids.includes(d.id))

    definitions.forEach(def => {
      if (def.kind === 'param') {
        throw new Error(
          `Impossible: intersection of top-level declarations with lookup table entries should never be a param. Found ${def}`
        )
      }

      if (this.defsToAdd.has(def.name)) {
        // Already added
        return
      }

      const namespace = this.namespaceForNested ?? qualifier(decl)
      const newDef =
        namespace && !def.name.startsWith(namespace)
          ? addNamespaceToDefinition(def, namespace, new Set(builtinNames))
          : def

      this.walkNested(namespace, newDef)
      this.defsToAdd.set(newDef.name, newDef)
    })
  }

  enterInstance(decl: QuintInstance) {
    if (decl.qualifiedName) {
      this.modulesByName.set(decl.qualifiedName, this.modulesByName.get(decl.protoName)!)
    }
  }

  enterImport(decl: QuintImport) {
    if (decl.qualifiedName) {
      this.modulesByName.set(decl.qualifiedName, this.modulesByName.get(decl.protoName)!)
    }
  }

  private flattenName(id: bigint) {
    const def = this.lookupTable.get(id)!
    if (!def) {
      // skip bulit-in names
      return
    }

    if (def.kind === 'def' && def.depth && def.depth > 0) {
      // skip non-top level definitions
      return
    }

    if (def.kind === 'param') {
      // skip lambda parameters
      return
    }

    if (def.importedFrom?.kind === 'instance') {
      // Don't do anything for definitions that come from instances. Those have to be instantiated first.
      return
    }

    const namespace = this.namespaceForNested ?? getNamespaceForDef(def)
    const newDef =
      namespace && !def.name.startsWith(namespace)
        ? addNamespaceToDefinition(def, namespace, new Set(builtinNames))
        : def

    this.walkNested(namespace, newDef)
    this.defsToAdd.set(newDef.name, newDef)
  }

  private walkNested(namespace: string | undefined, def: QuintDef) {
    // Save previous value to be restored
    const nestedBefore = this.namespaceForNested

    this.namespaceForNested = namespace
    walkDefinition(this, def)

    // Restore previous value
    this.namespaceForNested = nestedBefore
  }
}

export function getNamespaceForDef(def: LookupDefinition): string | undefined {
  if (!def.namespaces) {
    return
  }

  return [...def.namespaces].reverse().join('::')
}
