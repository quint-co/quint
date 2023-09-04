/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Flattening for modules, replacing instances, imports and exports with definitions referred by the module.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import assert from 'assert'
import { IdGenerator } from '../idGenerator'
import { moduleToString } from '../ir/IRprinting'
import { FlatModule, QuintModule, isDef } from '../ir/quintIr'
import { LookupTable } from '../names/base'
import { Loc, ParserPhase3, parsePhase3importAndNameResolution } from '../parsing/quintParserFrontend'
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

  // Mutable values, updated on every iteration
  const flattenedAnalysis = inlined.analysisOutput
  const modulesQueue = inlined.modules

  // Mutable references, updated on every iteration
  let flattenedModules: QuintModule[] = []
  let flattenedTable = inlined.table

  while (modulesQueue.length > 0) {
    const module = modulesQueue.shift()!

    // First, flatten imports and exports
    const moduleAfterFirstFlattening = flattenModule(module, modulesByName, flattenedTable)

    // Then, flatten instances, replacing them with imports
    const instancedModules = flattenInstances(
      moduleAfterFirstFlattening,
      modulesByName,
      flattenedTable,
      idGenerator,
      sourceMap,
      flattenedAnalysis
    )

    // Get an updated lookup table including references for the instanced modules. For that, use all the modules that
    // were flattened so far, plus the instanced modules.
    const intermediateTable = resolveNamesOrThrow(flattenedModules.concat(instancedModules), sourceMap).table

    // Flatten the instanced modules, removing the added imports.
    instancedModules.forEach(m => {
      const flat = flattenModule(m, modulesByName, intermediateTable)
      flattenedModules.push(flat)

      // Update the index that is going to be used in next iterations
      modulesByName.set(m.name, flat)
    })

    // Finally, get an updated lookup table and a toposorted version of the definitions. For that, we combine the
    // modules that were flattened so far, plus the modules that still have to be flattened (queue). We need to do this
    // for the modules in the queue as well since they might also refer to definitions that had their ids changed by the
    // instance flattener.
    const result = resolveNamesOrThrow(flattenedModules.concat(modulesQueue), sourceMap)

    flattenedModules = result.modules.slice(0, flattenedModules.length)
    flattenedTable = result.table
  }

  // FIXME: Ideally we should do this via the type system
  assert(flattenedModules.every(m => m.declarations.every(isDef)))

  flattenedModules.forEach(m => console.log(moduleToString(m)))
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
    throw new Error('Internal error while flattening ' + result.value.map(e => e.explanation))
  }

  return result.unwrap()
}
