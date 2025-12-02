/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Flattening for modules, replacing imports and exports with definitions referred by the module.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { LookupDefinition, LookupTable, builtinNames } from '../names/base'
import {
  QuintApp,
  QuintDeclaration,
  QuintDef,
  QuintEx,
  QuintExport,
  QuintImport,
  QuintInstance,
  QuintModule,
  QuintName,
  isDef,
  qualifier,
} from '../ir/quintIr'

import { IRVisitor, walkDefinition, walkExpression, walkModule } from '../ir/IRVisitor'
import { addNamespaceToDefinition } from '../ir/namespacer'
import assert from 'assert'
import { uniqBy } from 'lodash'

/**
 * Flatten a module, replacing instances, imports and exports with definitions referred by the module.
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
 * @param expr - The expression for which to find definitions
 * @param lookupTable - The lookup table with all related references
 *
 * @returns The definitions used by the expression and their dependencies
 */
export function dependentDefinitions(expr: QuintEx, lookupTable: LookupTable): QuintDef[] {
  const flattener = new Flattener(new Map(), lookupTable)
  walkExpression(flattener, expr)

  // Walking an expression should never add a non-definition declaration. The following assertion is just to make sure.
  assert(flattener.newDeclarations.every(d => isDef(d)))

  return [...flattener.newDeclarations.values()] as QuintDef[]
}

class Flattener implements IRVisitor {
  // Buffer of declarations, topologically sorted
  newDeclarations: QuintDeclaration[] = []

  private modulesByName: Map<string, QuintModule>
  private lookupTable: LookupTable
  // Store a namespace to use when recursing into nested definitions
  private namespaceForNested?: string

  constructor(modulesByName: Map<string, QuintModule>, lookupTable: LookupTable) {
    this.modulesByName = modulesByName
    this.lookupTable = lookupTable
  }

  enterModule(_quintModule: QuintModule) {
    // Reset `newDeclarations`
    this.newDeclarations = []
  }

  exitModule(quintModule: QuintModule) {
    // Get rid of imports and exports, and add the definitions we collected
    quintModule.declarations = uniqBy(
      this.newDeclarations.filter(d => d.kind !== 'import' && d.kind !== 'export'),
      d => (isDef(d) ? d.name : d.id)
    )
  }

  exitDecl(decl: QuintDeclaration) {
    // Add declarations to the buffer as they are visited. This way, new declarations are added in between, allowing us
    // to keep the topological order.
    this.newDeclarations.push(decl)
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

      const namespace = this.namespaceForNested ?? qualifier(decl)
      const newDef: QuintDef =
        namespace && !def.name.startsWith(namespace)
          ? addNamespaceToDefinition(def, namespace, new Set(builtinNames))
          : def

      if (this.newDeclarations.some(d => isDef(d) && d.name === newDef.name)) {
        // Already added
        return
      }

      // Typescript still keeps `LookupDefinition` extra fields even if we say `newDef` is a `QuintDef`. We need to
      // remove them manually, so when this is collected back into a `LookupTable`, this leftover values don't get
      // propagated.
      const newDefWithoutMetadata = { ...newDef, hidden: false, namespaces: [], importedFrom: undefined }

      this.walkNested(namespace, newDef)
      this.newDeclarations.push(newDefWithoutMetadata)
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
    if (this.newDeclarations.some(d => isDef(d) && d.name === newDef.name)) {
      // Already added
      return
    }

    this.newDeclarations.push(newDef)
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
  if (!def.namespaces || def.namespaces.length === 0) {
    return
  }

  return def.namespaces.reduce((a, b) => `${b}::${a}`)
}
