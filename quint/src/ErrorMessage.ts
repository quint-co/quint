/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Error messages with source locations.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { compact } from 'lodash'
import { QuintError, quintErrorToString } from './quintError'

/**
 * An error message whose locations have been resolved.
 */
export interface ErrorMessage {
  explanation: string
  locs: Loc[]
  traceLocs?: Loc[]
}

export interface Loc {
  source: string
  start: { line: number; col: number; index: number }
  end?: { line: number; col: number; index: number }
}

/**
 * Map an identifier to the corresponding location in the source map, if possible.
 * @param sourceMap the source map
 * @param id the identifier to map
 * @returns the location, if found in the map, or the unknown location
 */
export function sourceIdToLoc(sourceMap: Map<bigint, Loc>, id: bigint): Loc {
  let sourceLoc = sourceMap.get(id)
  if (!sourceLoc) {
    console.error(`No source location found for ${id}. Please report a bug.`)
    return unknownLoc
  } else {
    return sourceLoc
  }
}

export function resolveErrorLocation(sourceMap: Map<bigint, Loc>, error: QuintError): Loc | undefined {
  const errorId = error.trace?.[0] ?? error.reference
  return errorId ? sourceMap.get(errorId) : undefined
}

export function resolveTraceLocations(sourceMap: Map<bigint, Loc>, error: QuintError): Loc[] | undefined {
  const traceRest = error.trace?.slice(1)
  if (!traceRest || traceRest.length === 0) {
    return undefined
  }
  return traceRest.map(id => sourceMap.get(id)).filter((loc): loc is Loc => loc !== undefined)
}

export function fromQuintError(sourceMap: Map<bigint, Loc>): (_: QuintError) => ErrorMessage {
  return error => {
    const loc = resolveErrorLocation(sourceMap, error)
    const traceLocs = resolveTraceLocations(sourceMap, error)
    return {
      explanation: quintErrorToString(error),
      locs: compact([loc]),
      traceLocs,
    }
  }
}

// the default error location that usually indicates a bug in our code
const unknownLoc: Loc = {
  source: '<unknown>',
  start: { line: 0, col: 0, index: 0 },
}
