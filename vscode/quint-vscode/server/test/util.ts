/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
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
  fileSourceResolver,
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
  const phase1Data = parsePhase1fromText(idgen, moduleText, 'mocked_path')

  const resolver = fileSourceResolver(new Map())
  const mainPath = resolver.lookupPath('mocked_path', './main')
  const phase2Data = parsePhase2sourceResolution(idgen, resolver, mainPath, phase1Data)

  const phase3Data = parsePhase3importAndNameResolution(phase2Data)

  if (phase3Data.errors.length > 0) {
    throw new Error('Failed to parse mocked module')
  }

  return [phase2Data.modules, phase2Data.sourceMap, phase3Data.table]
}
