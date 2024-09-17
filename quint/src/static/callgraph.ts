/**
 * Compute the call graph of Quint definitions. Technically, it is a "uses"
 * graph, as it also captures type aliases.
 *
 * @author Igor Konnov, Informal Systems, 2023
 *
 * Copyright 2022-2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 */

import { Map, Record, Set } from 'immutable'
import type { RecordOf } from 'immutable'

import { IRVisitor } from '../ir/IRVisitor'
import { LookupTable } from '../names/base'
import {
  QuintApp,
  QuintDeclaration,
  QuintDef,
  QuintExport,
  QuintImport,
  QuintInstance,
  QuintModule,
  QuintName,
} from '../ir/quintIr'
import { QuintConstType } from '../ir/quintTypes'

/**
 * The call graph is simply a mapping from the caller's id
 * to the set of callees' ids.
 */
export type CallGraph = Map<bigint, Set<bigint>>

// The record factory that we use for immutable keys
// in CallGraphContext.importsByName (see below).
// This requires a bit of boilerplate, see:
// https://immutable-js.com/docs/v4.3.0/Record/
type ImportKeyRecordProps = { importingModuleId: bigint; importedModuleName: string }
const importKeyRecordFactory: Record.Factory<ImportKeyRecordProps> = Record({
  importingModuleId: -1n,
  importedModuleName: '',
})
type ImportKeyRecordType = RecordOf<ImportKeyRecordProps>
function mkImportKey(importingModuleId: bigint, importedModuleName: string) {
  return importKeyRecordFactory({ importingModuleId, importedModuleName })
}

/**
 * A context that is needed for computing a call graph in the presence
 * of multiple modules, imports, and exports.
 */
export type CallGraphContext = {
  /**
   * The map from a module name to the corresponding module.
   */
  modulesByName: Map<string, QuintModule>

  /**
   * For every module A and the imported module name B, keep the set of
   * import statements that refer to B in A. The values are sets of identifiers
   * that refer to the import statements.
   */
  importsByName: Map<ImportKeyRecordType, Set<bigint>>

  /**
   * For every definition in a set of modules, map the definition id to
   * the module id, where it has been defined.
   */
  definedAt: Map<bigint, QuintModule>
}

/**
 * Compute the context for computing the call graph.
 *
 * @param modules the modules to compute the context for
 */
export function mkCallGraphContext(modules: QuintModule[]): CallGraphContext {
  type ImportsMap = Map<ImportKeyRecordType, Set<bigint>>
  type DefinedAtMap = Map<bigint, QuintModule>

  function collectImports(inMap: ImportsMap, mod: QuintModule): ImportsMap {
    // add a single import to the imports map
    function addImport(map: ImportsMap, importId: bigint, name: string) {
      const key: ImportKeyRecordType = importKeyRecordFactory({ importingModuleId: mod.id, importedModuleName: name })
      const value = map.get(key) ?? Set<bigint>()
      return map.set(key, value.add(importId))
    }
    // add all imports and instances
    return mod.declarations.reduce((map, decl) => {
      if (decl.kind === 'import' || decl.kind === 'instance') {
        // import A
        // import B(N = 3)
        let result = addImport(map, decl.id, decl.protoName)
        if (decl.qualifiedName) {
          // import A as A1
          // import B(N = 3) as B1
          result = addImport(result, decl.id, decl.qualifiedName)
        }
        return result
      } else {
        return map
      }
    }, inMap)
  }

  function collectDefinedAt(map: DefinedAtMap, mod: QuintModule): DefinedAtMap {
    return mod.declarations.reduce((map, decl) => map.set(decl.id, mod), map)
  }

  const definedAt = modules.reduce(collectDefinedAt, Map())
  const importsByName = modules.reduce(collectImports, Map())
  const modulesByName = modules.reduce((map, mod) => map.set(mod.name, mod), Map<string, QuintModule>())

  return { modulesByName, importsByName, definedAt }
}

/**
 * IR visitor that computes the call graph. This class accumulates the graph in
 * its state. If you want to compute a new graph, create a new instance.
 */
export class CallGraphVisitor implements IRVisitor {
  private lookupTable: LookupTable
  private context: CallGraphContext
  private stack: QuintDeclaration[]
  private currentModuleId: bigint
  /**
   * The call graph computed by the visitor.
   */
  private _graph: CallGraph

  constructor(lookupTable: LookupTable, context: CallGraphContext) {
    this.lookupTable = lookupTable
    this.context = context
    this._graph = Map()
    this.stack = []
    this.currentModuleId = -1n
  }

  get graph() {
    return this._graph
  }

  /**
   * Print the graph in the graphviz dot format. Use it for debugging purposes,
   * e.g., print(console.log)
   */
  print(out: (s: string) => void) {
    out(`digraph {`)
    this._graph.forEach((succ, pred) => {
      succ.forEach(oneSucc => {
        out(`  n${pred} -> n${oneSucc};`)
      })
    })
    out('}')
  }

  enterModule(module: QuintModule) {
    this.currentModuleId = module.id
  }

  enterDef(def: QuintDef) {
    this.stack.push(def)
    const hostModule = this.context.definedAt.get(def.id)
    if (hostModule && hostModule.id !== this.currentModuleId) {
      // This definition A is imported from another module B.
      // Hence, the definition A should appear after the statements
      // import A... and import A(...)...
      const key = mkImportKey(this.currentModuleId, hostModule.name)
      const imports = this.context.importsByName.get(key) ?? Set()
      this.graphAddAll(def.id, imports)
    }
  }

  exitDef(_def: QuintDef) {
    this.stack.pop()
  }

  enterImport(decl: QuintImport) {
    const importedModule = this.context.modulesByName.get(decl.protoName)
    if (importedModule) {
      this.graphAddAll(decl.id, Set([importedModule.id]))
    }
  }

  enterInstance(decl: QuintInstance) {
    // Instances are the only non-definition declarations that need to be added to the stack,
    // because they may contain names in the overrides
    this.stack.push(decl)
    const importedModule = this.context.modulesByName.get(decl.protoName)
    if (importedModule) {
      this.graphAddAll(decl.id, Set([importedModule.id]))
    }
  }

  exitInstance(_decl: QuintInstance) {
    this.stack.pop()
  }

  enterExport(decl: QuintExport) {
    const key = mkImportKey(this.currentModuleId, decl.protoName)
    const imports = this.context.importsByName.get(key) ?? Set()
    // the imports and instance of the same module must precede the export
    this.graphAddAll(decl.id, imports)
  }

  // e.g., called for plus inside plus(x, y)
  exitApp(app: QuintApp) {
    const lookupDef = this.lookupTable.get(app.id)
    if (lookupDef) {
      this.graphAddOne(lookupDef.id)
      this.graphAddImports(lookupDef.id)
    }
  }

  // e.g., called for x and y inside plus(x, y)
  exitName(name: QuintName) {
    const lookupDef = this.lookupTable.get(name.id)
    if (lookupDef) {
      this.graphAddOne(lookupDef.id)
      this.graphAddImports(lookupDef.id)
    }
  }

  // e.g., called for Bar inside type Foo = Set[Bar]
  exitConstType(tp: QuintConstType) {
    if (tp.id) {
      const lookupDef = this.lookupTable.get(tp.id)
      if (lookupDef) {
        this.graphAddOne(lookupDef.id)
        this.graphAddImports(lookupDef.id)
      }
    }
  }

  private graphAddOne(usedId: bigint) {
    // Add the reference for every definition on the stack.
    // Hence, if we have nested definitions, top-level definitions
    // are also designated as callers of the definition.
    this.stack.forEach(def => {
      const callees = this.graph.get(def.id) ?? Set()
      this._graph = this._graph.set(def.id, callees.add(usedId))
    })
  }

  // if the referenced operator is defined in another module
  // via a definition with originId,
  // add a dependency of occurenceId on the corresponding import
  private graphAddImports(originId: bigint) {
    const hostModule = this.context.definedAt.get(originId)
    if (hostModule && hostModule.id !== this.currentModuleId) {
      const key = mkImportKey(this.currentModuleId, hostModule.name)
      const imports = this.context.importsByName.get(key)
      if (imports !== undefined) {
        this.stack.forEach(def => this.graphAddAll(def.id, imports))
      }
    }
  }

  private graphAddAll(defId: bigint, ids: Set<bigint>) {
    const callees = this.graph.get(defId) ?? Set()
    this._graph = this._graph.set(defId, callees.union(ids))
  }
}
