import { IdGenerator } from '../idGenerator'
import { moduleToString } from '../ir/IRprinting'
import { FlatModule, QuintModule } from '../ir/quintIr'
import { LookupTable } from '../names/base'
import {
  Loc,
  ParserPhase3,
  ParserPhase4,
  parsePhase3importAndNameResolution,
  parsePhase4toposort,
} from '../parsing/quintParserFrontend'
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
  const flattenedAnalysis = inlined.analysisOutput
  const modulesQueue = inlined.modules

  while (modulesQueue.length > 0) {
    const module = modulesQueue.shift()!
    const moduleAfterFirstFlattening = flattenModule(module, modulesByName, flattenedTable)

    const instancedModules = flattenInstances(
      moduleAfterFirstFlattening,
      modulesByName,
      flattenedTable,
      idGenerator,
      sourceMap,
      flattenedAnalysis
    )

    const intermediateTable = resolveNamesOrThrow(flattenedModules.concat(instancedModules), sourceMap).table

    const phase3 = instancedModules.map(m => {
      const flat = flattenModule(m, modulesByName, intermediateTable)
      modulesByName.set(m.name, flat)
      return flat
    })

    flattenedModules.push(...phase3)

    const result = toposortOrThrow(flattenedModules.concat(modulesQueue), sourceMap)

    flattenedModules = result.modules.slice(0, flattenedModules.length)
    flattenedTable = result.table
  }

  return {
    flattenedModules: flattenedModules as FlatModule[],
    flattenedTable,
    flattenedAnalysis,
  }
}

function resolveNamesOrThrow(modules: QuintModule[], sourceMap: Map<bigint, Loc>): ParserPhase3 {
  const result = parsePhase3importAndNameResolution({ modules, sourceMap })
  if (result.isLeft()) {
    modules.forEach(m => console.log(moduleToString(m)))
    throw new Error('Internal error while flattening' + result.value.map(e => e.explanation))
  }

  return result.unwrap()
}

function toposortOrThrow(modules: QuintModule[], sourceMap: Map<bigint, Loc>): ParserPhase4 {
  const result = parsePhase3importAndNameResolution({ modules, sourceMap }).chain(parsePhase4toposort)
  if (result.isLeft()) {
    modules.forEach(m => console.log(moduleToString(m)))
    throw new Error('Internal error while flattening' + result.value.map(e => e.explanation))
  }

  return result.unwrap()
}
