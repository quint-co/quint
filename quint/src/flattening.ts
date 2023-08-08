/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Flattening for modules, replacing instances and (soon) imports with their definitions.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { IdGenerator } from './idGenerator'
import { LookupTable, builtinNames } from './names/base'
import {
  FlatDef,
  FlatModule,
  QuintDef,
  QuintEx,
  QuintExport,
  QuintImport,
  QuintInstance,
  QuintModule,
  QuintOpDef,
  isAnnotatedDef,
  isFlat,
} from './quintIr'
import { definitionToString } from './IRprinting'
import { ConcreteFixedRow, QuintType, Row } from './quintTypes'
import { Loc, parsePhase3importAndNameResolution } from './parsing/quintParserFrontend'
import { compact, uniqBy } from 'lodash'
import { AnalysisOutput } from './quintAnalyzer'
import { inlineAliasesInDef, inlineAnalysisOutput, inlineTypeAliases } from './types/aliasInliner'

/**
 * Flatten an array of modules, replacing instances, imports and exports with
 * their definitions and inlining type aliases.
 *
 * @param modules The modules to flatten
 * @param table The lookup table to for all referred names
 * @param idGenerator The id generator to use for new definitions; should be the same as used for parsing
 * @param sourceMap The source map for all modules involved
 * @param analysisOutput The analysis output for all modules involved
 *
 * @returns An object containing the flattened modules, flattened lookup table and flattened analysis output
 */
export function flattenModules(
  modules: QuintModule[],
  table: LookupTable,
  idGenerator: IdGenerator,
  sourceMap: Map<bigint, Loc>,
  analysisOutput: AnalysisOutput
): { flattenedModules: FlatModule[]; flattenedTable: LookupTable; flattenedAnalysis: AnalysisOutput } {
  // FIXME: use copies of parameters so the original objects are not mutated.
  // This is not a problem atm, but might be in the future.

  // Inline type aliases
  const inlined = inlineTypeAliases(modules, table, analysisOutput)
  // Create a map of imported modules, to be used when flattening
  // instances/imports/exports. This is updated as the modules are flattened.
  const importedModules = new Map(inlined.modules.map(m => [m.name, m]))

  // Reduce the array of modules to a single object containing the flattened
  // modules, flattened lookup table and flattened analysis output
  return inlined.modules.reduce(
    (acc, module) => {
      const { flattenedModules, flattenedTable, flattenedAnalysis } = acc

      // Flatten the current module
      const flattener = new Flatenner(
        idGenerator,
        flattenedTable,
        sourceMap,
        flattenedAnalysis,
        importedModules,
        module
      )
      const flattened = flattener.flattenModule()

      // Add the flattened module to the imported modules map
      importedModules.set(module.name, flattened)

      // Return the updated flattened modules, flattened lookup table and flattened analysis output
      return {
        flattenedModules: [...flattenedModules, flattened],
        // The lookup table has to be updated for every new module that is flattened
        // Since the flattened modules have new ids for both the name expressions
        // and their definitions, and the next iteration might depend on an updated
        // lookup table
        flattenedTable: resolveNamesOrThrow(flattenedTable, sourceMap, flattened),
        flattenedAnalysis: flattenedAnalysis,
      }
    },
    { flattenedModules: [] as FlatModule[], flattenedTable: inlined.table, flattenedAnalysis: inlined.analysisOutput }
  )
}

/**
 * Adds a definition to a flat module, flattening any instances, imports and
 * exports in the process. Note that the provided parameters should include
 * information for the new definition already, i.e. the lookup table should
 * already contain all the references for names in the definition.
 *
 * @param modules The modules possibly reffered by the definition
 * @param table The lookup table to for all referred names
 * @param idGenerator The id generator to use for new definitions
 * @param sourceMap The source map for all modules involved
 * @param analysisOutput The analysis output for all modules involved
 * @param module The flat module to add the definition to
 * @param def The definition to add
 *
 * @returns An object containing the flattened module, flattened lookup table
 * and flattened analysis output
 */
export function addDefToFlatModule(
  modules: QuintModule[],
  table: LookupTable,
  idGenerator: IdGenerator,
  sourceMap: Map<bigint, Loc>,
  analysisOutput: AnalysisOutput,
  module: FlatModule,
  def: QuintDef
): {
  flattenedModule: FlatModule
  flattenedDefs: FlatDef[]
  flattenedTable: LookupTable
  flattenedAnalysis: AnalysisOutput
} {
  const importedModules = new Map(modules.map(m => [m.name, m]))
  const flattener = new Flatenner(idGenerator, table, sourceMap, analysisOutput, importedModules, module)

  const flattenedDefs = flattener
    .flattenDef(def)
    // Inline type aliases in new defs
    .map(d => inlineAliasesInDef(d, table) as FlatDef)
  const flattenedModule: FlatModule = { ...module, defs: [...module.defs, ...flattenedDefs] }

  return {
    flattenedModule,
    flattenedDefs,
    flattenedTable: resolveNamesOrThrow(table, sourceMap, flattenedModule),
    flattenedAnalysis: inlineAnalysisOutput(analysisOutput, table),
  }
}

class Flatenner {
  private idGenerator: IdGenerator
  private table: LookupTable
  private currentModuleNames: Set<string>
  private sourceMap: Map<bigint, Loc>
  private analysisOutput: AnalysisOutput
  private importedModules: Map<string, QuintModule>
  private module: QuintModule

  constructor(
    idGenerator: IdGenerator,
    table: LookupTable,
    sourceMap: Map<bigint, Loc>,
    analysisOutput: AnalysisOutput,
    importedModules: Map<string, QuintModule>,
    module: QuintModule
  ) {
    this.idGenerator = idGenerator
    this.table = table
    this.currentModuleNames = new Set([
      // builtin names
      ...builtinNames,
      // names from the current module
      ...compact(module.defs.map(d => (isFlat(d) ? d.name : undefined))),
    ])

    this.sourceMap = sourceMap
    this.analysisOutput = analysisOutput
    this.importedModules = importedModules
    this.module = module
  }

  flattenDef(def: QuintDef): FlatDef[] {
    if (isFlat(def)) {
      // Not an instance, import or export, keep the same def
      return [def]
    }

    if (def.kind === 'instance') {
      return this.flattenInstance(def)
    }

    return this.flattenImportOrExport(def)
  }

  flattenModule(): FlatModule {
    const newDefs = this.module.defs.flatMap(def => this.flattenDef(def))

    return { ...this.module, defs: uniqBy(newDefs, 'name') }
  }

  private flattenInstance(def: QuintInstance): FlatDef[] {
    // Build pure val definitions from overrides to replace the constants in the
    // instance. Index them by name to make it easier to replace the corresponding constants.
    const overrides: Map<string, FlatDef> = new Map(
      def.overrides.map(([param, expr]) => {
        const constDef = this.table.get(param.id)!

        return [
          param.name,
          {
            kind: 'def',
            qualifier: 'pureval',
            name: param.name,
            expr,
            typeAnnotation: constDef.typeAnnotation,
            id: param.id,
          },
        ]
      })
    )

    const protoModule = this.importedModules.get(def.protoName)!

    // Overrides replace the original constant definitions, in the same position as they appear originally
    const newProtoDefs = protoModule.defs.map(d => {
      if (isFlat(d) && overrides.has(d.name)) {
        return overrides.get(d.name)!
      }

      return d
    })

    // Add the new defs to the modules table under the instance name
    if (def.qualifiedName) {
      this.importedModules.set(def.qualifiedName, { ...protoModule, defs: newProtoDefs })
    }

    return newProtoDefs.map(protoDef => this.copyDef(protoDef, def.qualifiedName))
  }

  private flattenImportOrExport(def: QuintImport | QuintExport): FlatDef[] {
    const qualifiedName = def.defName ? undefined : def.qualifiedName ?? def.protoName

    const protoModule = this.importedModules.get(def.protoName)
    if (!protoModule) {
      // Something went really wrong. Topological sort should prevent this from happening.
      throw new Error(`Imported module ${def.protoName} not found. Please report a bug.`)
    }

    // Add the new defs to the modules table under the qualified name
    if (qualifiedName) {
      this.importedModules.set(qualifiedName, { ...protoModule, name: qualifiedName })
    }

    const defsToFlatten = filterDefs(protoModule.defs, def.defName)

    return defsToFlatten.map(protoDef => this.copyDef(protoDef, qualifiedName))
  }

  private copyDef(def: QuintDef, qualifier: string | undefined): FlatDef {
    if (!isFlat(def)) {
      throw new Error(`Impossible: ${definitionToString(def)} should have been flattened already`)
    }

    if (!isAnnotatedDef(def)) {
      return this.addNamespaceToDef(qualifier, def)
    }

    const type = this.addNamespaceToType(qualifier, def.typeAnnotation)
    const newDef = this.addNamespaceToDef(qualifier, def)
    if (!isAnnotatedDef(newDef)) {
      throw new Error(`Impossible: transformation should preserve kind`)
    }

    return { ...newDef, typeAnnotation: type }
  }

  private addNamespaceToDef(name: string | undefined, def: QuintDef): FlatDef {
    switch (def.kind) {
      case 'def':
        return this.addNamespaceToOpDef(name, def)
      case 'assume':
        return {
          ...def,
          name: this.namespacedName(name, def.name),
          assumption: this.addNamespaceToExpr(name, def.assumption),
          id: this.getNewIdWithSameData(def.id),
        }
      case 'const':
      case 'var':
        return { ...def, name: this.namespacedName(name, def.name), id: this.getNewIdWithSameData(def.id) }
      case 'typedef':
        return {
          ...def,
          name: this.namespacedName(name, def.name),
          type: def.type ? this.addNamespaceToType(name, def.type) : undefined,
          id: this.getNewIdWithSameData(def.id),
        }
      case 'instance':
        throw new Error(`Instance in ${definitionToString(def)} should have been flatenned already`)
      case 'import':
        throw new Error(`Import in ${definitionToString(def)} should have been flatenned already`)
      case 'export':
        throw new Error(`Export in ${definitionToString(def)} should have been flatenned already`)
    }
  }

  private addNamespaceToOpDef(name: string | undefined, opdef: QuintOpDef): QuintOpDef {
    return {
      ...opdef,
      name: this.namespacedName(name, opdef.name),
      expr: this.addNamespaceToExpr(name, opdef.expr),
      id: this.getNewIdWithSameData(opdef.id),
    }
  }

  private addNamespaceToExpr(name: string | undefined, expr: QuintEx): QuintEx {
    const id = this.getNewIdWithSameData(expr.id)

    switch (expr.kind) {
      case 'name':
        if (this.shouldAddNamespace(expr.name)) {
          return { ...expr, name: this.namespacedName(name, expr.name), id }
        }

        return { ...expr, id }
      case 'bool':
      case 'int':
      case 'str':
        return { ...expr, id }
      case 'app': {
        if (this.shouldAddNamespace(expr.opcode)) {
          return {
            ...expr,
            opcode: this.namespacedName(name, expr.opcode),
            args: expr.args.map(arg => this.addNamespaceToExpr(name, arg)),
            id,
          }
        }

        return {
          ...expr,
          args: expr.args.map(arg => this.addNamespaceToExpr(name, arg)),
          id,
        }
      }
      case 'lambda':
        return {
          ...expr,
          params: expr.params.map(param => ({
            name: this.namespacedName(name, param.name),
            id: this.getNewIdWithSameData(param.id),
          })),
          expr: this.addNamespaceToExpr(name, expr.expr),
          id,
        }

      case 'let':
        return {
          ...expr,
          opdef: this.addNamespaceToOpDef(name, expr.opdef),
          expr: this.addNamespaceToExpr(name, expr.expr),
          id,
        }
    }
  }

  private addNamespaceToType(name: string | undefined, type: QuintType): QuintType {
    const id = type.id ? this.getNewIdWithSameData(type.id) : undefined

    switch (type.kind) {
      case 'bool':
      case 'int':
      case 'str':
      case 'var':
        return { ...type, id }
      case 'const':
        return { ...type, name: this.namespacedName(name, type.name), id }
      case 'set':
      case 'list':
        return { ...type, elem: this.addNamespaceToType(name, type.elem), id }
      case 'fun':
        return {
          ...type,
          arg: this.addNamespaceToType(name, type.arg),
          res: this.addNamespaceToType(name, type.res),
          id,
        }
      case 'oper':
        return {
          ...type,
          args: type.args.map(arg => this.addNamespaceToType(name, arg)),
          res: this.addNamespaceToType(name, type.res),
          id,
        }
      case 'tup':
      case 'rec':
        return {
          ...type,
          fields: this.addNamespaceToRow(name, type.fields),
          id,
        }
      case 'sum':
        return {
          ...type,
          fields: this.addNamespaceToSumRow(name, type.fields),
          id,
        }
      case 'union':
        return {
          ...type,
          records: type.records.map(record => {
            return {
              ...record,
              fields: this.addNamespaceToRow(name, record.fields),
            }
          }),
          id,
        }
    }
  }

  private addNamespaceToRow(name: string | undefined, row: Row): Row {
    if (row.kind !== 'row') {
      return row
    }

    return {
      ...row,
      fields: row.fields.map(field => {
        return {
          ...field,
          fieldType: this.addNamespaceToType(name, field.fieldType),
        }
      }),
    }
  }

  private addNamespaceToSumRow(name: string | undefined, row: ConcreteFixedRow): ConcreteFixedRow {
    return {
      ...row,
      fields: row.fields.map(field => {
        return {
          ...field,
          fieldType: this.addNamespaceToType(name, field.fieldType),
        }
      }),
    }
  }

  private namespacedName(namespace: string | undefined, name: string): string {
    return namespace ? `${namespace}::${name}` : name
  }

  /**
   * Whether a name should be prefixed with the namespace.
   *
   * @param name the name to be prefixed
   *
   * @returns false if the name is on the curentModulesName list, true otherwise
   */
  private shouldAddNamespace(name: string): boolean {
    if (this.currentModuleNames.has(name)) {
      return false
    }

    return true
  }

  private getNewIdWithSameData(id: bigint): bigint {
    const newId = this.idGenerator.nextId()

    const type = this.analysisOutput.types.get(id)
    const effect = this.analysisOutput.effects.get(id)
    const mode = this.analysisOutput.modes.get(id)
    const source = this.sourceMap.get(id)

    if (type) {
      this.analysisOutput.types.set(newId, type)
    }
    if (effect) {
      this.analysisOutput.effects.set(newId, effect)
    }
    if (mode) {
      this.analysisOutput.modes.set(newId, mode)
    }
    if (source) {
      this.sourceMap.set(newId, source)
    }

    return newId
  }
}

function filterDefs(defs: QuintDef[], name: string | undefined): QuintDef[] {
  if (!name || name === '*') {
    return defs
  }

  return defs.filter(def => isFlat(def) && def.name === name)
}

function resolveNamesOrThrow(currentTable: LookupTable, sourceMap: Map<bigint, Loc>, module: QuintModule): LookupTable {
  const newEntries = parsePhase3importAndNameResolution({ modules: [module], sourceMap })
    .mapLeft(errors => {
      // This should not happen, as the flattening should not introduce any
      // errors, since parsePhase3 analysis of the original modules has already
      // assured all names are correct.
      throw new Error(`Error on resolving names for flattened modules: ${errors.map(e => e.explanation)}`)
    })
    .unwrap().table

  return new Map([...currentTable.entries(), ...newEntries.entries()])
}
