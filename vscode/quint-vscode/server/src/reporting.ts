/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Formating of errors and results to LSP-friendly structures
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Loc, QuintError, QuintModule, SourceMap, findExpressionWithId, findTypeWithId } from '@informalsystems/quint'
import { Diagnostic, DiagnosticSeverity, Position, Range } from 'vscode-languageserver'
import { compact } from 'lodash'

/**
 * Assembles a list of diagnostics from pairs of expression ids and their errors
 * using a source map
 *
 * @param errors the errors to be transformed
 * @param sourceMap the source map for the document in which the errors occured
 *
 * @returns a map with a list of diagnostics grouped by file
 */
export function diagnosticsFromErrors(errors: QuintError[], sourceMap: SourceMap): Map<string, Diagnostic[]> {
  const diagnostics = new Map()

  errors.forEach(error => {
    const loc = sourceMap.get(error.reference!)!
    if (!loc) {
      console.log(`loc for ${error} not found in source map`)
    } else {
      const diagnostic = assembleDiagnostic(error, loc)
      const previous = diagnostics.get(loc.source) ?? []
      diagnostics.set(loc.source, [...previous, diagnostic])
    }
  })

  return diagnostics
}

/**
 * Assembles a diagnostic object from an error message and its location
 * @param explanation the diagnostic message
 * @param loc the location in which to report the diagnostic
 *
 * @returns a diagnostic object with the provided information
 */
export function assembleDiagnostic(error: QuintError, loc: Loc): Diagnostic {
  return {
    severity: DiagnosticSeverity.Error,
    range: locToRange(loc),
    message: error.message,
    code: error.code,
    data: error.data,
    source: 'quint',
  }
}

/** Finds the name of the expression at a given position in a module
 *
 * @param module the module in which to search for the expression
 * @param sources the source map for the module in the form of a list of tuples
 * @param position the position for which to find the expression
 *
 * @returns the name of the expression at the given position, or undefined if
 * the position is not under a name expression or an operator application
 */
export function findName(
  modules: QuintModule[],
  sources: [Loc, bigint][],
  position: Position,
  sourceFile: string
): [string, bigint] | undefined {
  const ids = resultsOnPosition(sources, position, sourceFile)
  const names: ([string, bigint] | undefined)[] = ids.map(id => {
    const expr = findExpressionWithId(modules, id)

    switch (expr?.kind) {
      case 'name':
        return [expr.name, expr.id]
      case 'app':
        return [expr.opcode, expr.id]
    }

    const type = findTypeWithId(modules, id)
    if (type?.kind === 'const' && type.id) {
      return [type.name, type.id]
    }
  })

  return compact(names)[0]
}

/**
 * Finds the result that best matches a given position. That is, the result
 * whose loc is the smallest loc that contains the position.
 *
 * @param sourceMap the source map with the locs for the results
 * @param results the list of tuples of ids from the source map and a result
 * computed for it
 * @param position the position for which to find the result
 *
 * @returns an object with the location and the result from the list that best
 * matches the position, or undefined if none is found
 */
export function findBestMatchingResult<T>(
  sourceMap: Map<bigint, Loc>,
  results: [bigint, T][],
  position: Position,
  sourceFile: string
): { id: bigint; loc: Loc; result: T } | undefined {
  const matchingResults = findMatchingResults(sourceMap, results, position, sourceFile)
  if (matchingResults.length === 0) {
    return undefined
  }

  const { id, result } = matchingResults[0]
  return { id, loc: sourceMap.get(id)!, result }
}

/**
 * Finds all results that match a given position. That is, the results
 * whose loc contains the position.
 *
 * @param sourceMap the source map with the locs for the results
 * @param results the list of tuples of ids from the source map and a result
 * computed for it
 * @param position the position for which to find the result
 *
 * @returns an array of objects whose locations match the position, from the tightest to the loosest
 */
export function findMatchingResults<T>(
  sourceMap: Map<bigint, Loc>,
  results: [bigint, T][],
  position: Position,
  sourceFile: string
): { id: bigint; loc: Loc; result: T }[] {
  const resultsByLoc: [Loc, { id: bigint; result: T }][] = results.map(([id, result]) => [
    sourceMap.get(id)!,
    { id, result },
  ])

  const matchingResults = resultsOnPosition(resultsByLoc, position, sourceFile)

  return matchingResults.map(({ id, result }) => ({ id, loc: sourceMap.get(id)!, result }))
}

/**
 * Converts a Quint location to a LSP range
 *
 * @param loc the quint location to be converted
 *
 * @returns a LSP range with corresponding start and end positions
 */
export function locToRange(loc: Loc): Range {
  return {
    start: { line: loc.start.line, character: loc.start.col },
    end: {
      line: loc.end ? loc.end.line : loc.start.line,
      character: loc.end ? loc.end.col + 1 : loc.start.col,
    },
  }
}

function resultsOnPosition<T>(results: [Loc, T][], position: Position, sourceFile: string): T[] {
  const filteredResults = results.filter(([loc, _result]) => {
    // Position is part of effect's expression range
    return (
      loc &&
      loc.source === sourceFile &&
      position.line >= loc.start.line &&
      (!loc.end || position.line <= loc.end.line) &&
      position.character >= loc.start.col &&
      (!loc.end || position.character <= loc.end.col)
    )
  })

  // Sort effects by range size. We want to show the most specific effect for the position.
  const sortedResults = filteredResults.sort(([a, _r1], [b, _r2]) => {
    if (!a.end) {
      return -1
    } else if (!b.end) {
      return 1
    } else if (a.end.index - a.start.index > b.end.index - b.start.index) {
      return 1
    } else {
      return -1
    }
  })

  return sortedResults.map(([_loc, result]) => result)
}

export function stringToRegex(input: string): RegExp {
  // 1. Escape special regex characters
  const escaped = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // 2. Replace spaces with \s+
  const withSpaces = escaped.replace(/\s+/g, '\\s*')

  return new RegExp(withSpaces)
}
