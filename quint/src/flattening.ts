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
  QuintExport,
  QuintImport,
  QuintInstance,
  QuintModule,
  isFlat,
} from './internal_representation/quintIr'
import { definitionToString, moduleToString } from './internal_representation/IRprinting'
import { Loc, parsePhase3importAndNameResolution } from './parsing/quintParserFrontend'
import { compact, uniqBy } from 'lodash'
import { AnalysisOutput } from './quintAnalyzer'
import { inlineAliasesInDef, inlineAnalysisOutput, inlineTypeAliases } from './types/aliasInliner'
import { addNamespaceToDefinition } from './internal_representation/namespacer'
import { generateFreshIds } from './internal_representation/idRefresher'

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
  private table: LookupTable
  private currentModuleNames: Set<string>
  private importedModules: Map<string, QuintModule>
  private module: QuintModule

  private idGenerator: IdGenerator
  private sourceMap: Map<bigint, Loc>
  private analysisOutput: AnalysisOutput

  constructor(
    idGenerator: IdGenerator,
    table: LookupTable,
    sourceMap: Map<bigint, Loc>,
    analysisOutput: AnalysisOutput,
    importedModules: Map<string, QuintModule>,
    module: QuintModule
  ) {
    this.table = table
    this.currentModuleNames = new Set([
      // builtin names
      ...builtinNames,
      // names from the current module
      ...compact(module.defs.map(d => (isFlat(d) ? d.name : undefined))),
    ])

    this.importedModules = importedModules
    this.module = module
    this.idGenerator = idGenerator
    this.sourceMap = sourceMap
    this.analysisOutput = analysisOutput
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

    const defWithQualifier = qualifier ? addNamespaceToDefinition(def, qualifier, this.currentModuleNames) : def
    const defWithNewId = generateFreshIds(defWithQualifier, this.idGenerator, this.sourceMap, this.analysisOutput)

    if (!isFlat(defWithNewId)) {
      // safe cast
      throw new Error(`Impossible: updating definitions cannot unflatten a def: ${definitionToString(defWithNewId)}`)
    }

    return defWithNewId
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
      console.log(moduleToString(module))
      throw new Error(`Error on resolving names for flattened modules: ${errors.map(e => e.explanation)}`)
    })
    .unwrap().table

  return new Map([...currentTable.entries(), ...newEntries.entries()])
}
