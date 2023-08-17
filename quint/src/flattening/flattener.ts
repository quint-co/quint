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

import { Definition, LookupTable, builtinNames } from '../names/base'
import { QuintApp, QuintDef, QuintExport, QuintImport, QuintInstance, QuintModule, QuintName } from '../ir/quintIr'

import { IRVisitor, walkDefinition, walkModule } from '../ir/IRVisitor'
import { addNamespaceToDefinition } from '../ir/namespacer'

export function flattenModule(
  quintModule: QuintModule,
  modulesByName: Map<string, QuintModule>,
  lookupTable: LookupTable
): QuintModule {
  const moduleCopy: QuintModule = { ...quintModule, declarations: [...quintModule.declarations] }
  const flattener = new Flatenner(modulesByName, lookupTable)
  walkModule(flattener, moduleCopy)
  return moduleCopy
}

class Flatenner implements IRVisitor {
  defsToAdd: Map<string, QuintDef> = new Map()
  private modulesByName: Map<string, QuintModule>

  private lookupTable: LookupTable
  private namespaceForNested?: string

  constructor(modulesByName: Map<string, QuintModule>, lookupTable: LookupTable) {
    this.modulesByName = modulesByName
    this.lookupTable = lookupTable
  }

  enterModule(_quintModule: QuintModule) {
    this.defsToAdd = new Map()
  }

  exitModule(quintModule: QuintModule) {
    quintModule.declarations = quintModule.declarations.filter(d => d.kind !== 'import' && d.kind !== 'export')
    quintModule.declarations.push(...this.defsToAdd.values())
  }

  enterName(name: QuintName) {
    const def = this.lookupTable.get(name.id)
    if (!def || def.kind === 'param' || (def.kind === 'def' && def.depth && def.depth > 0)) {
      return
    }
    const namespace = this.namespaceForNested ?? getNamespaceForDef(def)

    const newDef =
      namespace && !def.name.startsWith(namespace)
        ? addNamespaceToDefinition(def, namespace, new Set(builtinNames))
        : def

    this.defsToAdd.set(newDef.name, newDef)

    const old = this.namespaceForNested
    this.namespaceForNested = namespace
    walkDefinition(this, newDef)
    this.namespaceForNested = old
  }

  enterApp(expr: QuintApp) {
    const def = this.lookupTable.get(expr.id)
    if (!def || def.kind === 'param' || (def.kind === 'def' && def.depth && def.depth > 0)) {
      return
    }

    const namespace = this.namespaceForNested ?? getNamespaceForDef(def)
    const newDef =
      namespace && !def.name.startsWith(namespace)
        ? addNamespaceToDefinition(def, namespace, new Set(builtinNames))
        : def
    this.defsToAdd.set(newDef.name, newDef)

    const old = this.namespaceForNested
    this.namespaceForNested = namespace
    walkDefinition(this, newDef)
    this.namespaceForNested = old
  }

  enterExport(decl: QuintExport) {
    const ids = this.modulesByName.get(decl.protoName)!.declarations.map(d => d.id)
    const definitions = [...this.lookupTable.values()].filter(d => ids.includes(d.id))

    definitions.forEach(def => {
      if (def.kind === 'param') {
        throw new Error(
          `Impossible: instersection of top-level declarations with lookup table entries should never be a param. Found ${def}`
        )
      }

      if (this.defsToAdd.has(def.name)) {
        return
      }

      const namespace = this.namespaceForNested ?? decl.defName ? undefined : decl.qualifiedName ?? decl.protoName
      const old = this.namespaceForNested
      this.namespaceForNested = namespace
      const newDef =
        namespace && !def.name.startsWith(namespace)
          ? addNamespaceToDefinition(def, namespace, new Set(builtinNames))
          : def
      const newDefWithoutMetadata = { ...newDef, importedFrom: undefined, hidden: false, namespaces: [] }
      walkDefinition(this, newDefWithoutMetadata)
      this.defsToAdd.set(newDef.name, newDefWithoutMetadata)
      this.namespaceForNested = old
    })
  }

  enterInstance(instance: QuintInstance) {
    if (instance.qualifiedName) {
      this.modulesByName.set(instance.qualifiedName, this.modulesByName.get(instance.protoName)!)
    }
  }

  enterImport(decl: QuintImport) {
    if (decl.qualifiedName) {
      this.modulesByName.set(decl.qualifiedName, this.modulesByName.get(decl.protoName)!)
    }
  }
}

function getNamespaceForDef(def?: Definition): string | undefined {
  if (!def || !def.namespaces) {
    return
  }

  return [...def.namespaces].reverse().join('::')
}
