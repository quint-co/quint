/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Utilities for testing
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import {
  Loc,
  LookupTable,
  QuintModule,
  newIdGenerator,
  parsePhase1fromText,
  parsePhase2sourceResolution,
  parsePhase3importAndNameResolution,
  stringSourceResolver
} from '@informalsystems/quint'

/**
 * Parses a mocked module and returns the result of the parsing phases, or
 * throws an error if the parsing fails. To be used in tests only.
 *
 * @param moduleText the text of the mocked module
 *
 * @throws Error if the parsing fails
 *
 * @returns A triple with the combined result of the parsing phases
 */
export function parseOrThrow(moduleText: string): [QuintModule[], Map<bigint, Loc>, LookupTable] {
  const idgen = newIdGenerator()
  const result1 = parsePhase1fromText(idgen, moduleText, 'mocked_path')
  const result2 = result1.chain(phase1Data => {
    const resolver = stringSourceResolver(new Map())
    const mainPath = resolver.lookupPath('mocked_path', './main')
    return parsePhase2sourceResolution(idgen, resolver, mainPath, phase1Data)
  })
  const result3 = result2.chain(parsePhase3importAndNameResolution)

  if (result1.isLeft() || result2.isLeft() || result3.isLeft()) {
    throw new Error('Failed to parse mocked module')
  }

  return [result2.value.modules, result2.value.sourceMap, result3.value.table]
}
