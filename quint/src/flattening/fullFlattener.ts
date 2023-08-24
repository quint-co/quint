import { IdGenerator } from '../idGenerator'
import { moduleToString } from '../ir/IRprinting'
import { FlatModule, QuintModule } from '../ir/quintIr'
import { LookupTable } from '../names/base'
import { Loc, parsePhase3importAndNameResolution, parsePhase4toposort } from '../parsing/quintParserFrontend'
import { AnalysisOutput } from '../quintAnalyzer'
import { inlineTypeAliases } from '../types/aliasInliner'
import { flattenModule } from './flattener'
import { flattenInstances } from './instanceFlattener'

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

  const modulesByName = new Map(inlined.modules.map(m => [m.name, m]))
  let flattenedModules: QuintModule[] = []
  let flattenedTable = inlined.table
  const modulesQueue = inlined.modules

  while (modulesQueue.length > 0) {
    const module = modulesQueue.shift()!
    const module1 = flattenModule(module, modulesByName, flattenedTable)

    const instancedModules = flattenInstances(
      module1,
      modulesByName,
      flattenedTable,
      idGenerator,
      sourceMap,
      inlined.analysisOutput
    )

    const modulesToFlatten = instancedModules

    const result = parsePhase3importAndNameResolution({
      modules: flattenedModules.concat(modulesToFlatten),
      sourceMap,
    })

    if (result.isLeft()) {
      flattenedModules.concat(modulesToFlatten).forEach(m => console.log(moduleToString(m)))
      throw new Error('[1] Flattening failed: ' + result.value.map(e => e.explanation))
    }

    const { table: newTable } = result.unwrap()
    flattenedTable = newTable

    const phase3 = instancedModules.map(m => {
      const flat = flattenModule(m, modulesByName, newTable)
      modulesByName.set(m.name, flat)
      return flat
    })

    flattenedModules.push(...phase3)
    const toResolve = flattenedModules.concat(modulesQueue)
    const result3 = parsePhase3importAndNameResolution({
      modules: toResolve,
      sourceMap,
    }).chain(parsePhase4toposort)

    if (result3.isLeft()) {
      toResolve.forEach(m => console.log(moduleToString(m)))
      throw new Error('[2] Flattening failed: ' + result3.value.map(e => e.explanation))
    }

    flattenedModules = result3.unwrap().modules.slice(0, flattenedModules.length)
    flattenedTable = result3.unwrap().table
  }

  return {
    flattenedModules: flattenedModules as FlatModule[],
    flattenedTable,
    flattenedAnalysis: inlined.analysisOutput,
  }
}
