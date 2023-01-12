/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Formating of errors and results to LSP-friendly structures
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { ErrorTree, Loc, QuintModule, errorTreeToString, findExpressionWithId } from "@informalsystems/quint"
import { Diagnostic, DiagnosticSeverity, Position, Range } from "vscode-languageserver"

/**
 * Assembles a list of diagnostics from a map of expression ids to their errors
 * using a source map
 *
 * @param errors the error map to be transformed
 * @param sourceMap the source map for the document in which the errors occured
 *
 * @returns a list of diagnostics with the proper error messages and locations
 */
export function diagnosticsFromErrorMap(errors: Map<bigint, ErrorTree>, sourceMap: Map<bigint, Loc>): Diagnostic[] {
  const diagnostics: Diagnostic[] = []
  errors.forEach((error, id) => {
    const loc = sourceMap.get(id)!
    if (!loc) {
      console.log(`loc for ${id} not found in source map`)
    } else {
      const diag = assembleDiagnostic(errorTreeToString(error), loc)
      diagnostics.push(diag)
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
export function assembleDiagnostic(explanation: string, loc: Loc): Diagnostic {
  return {
    severity: DiagnosticSeverity.Error,
    range: locToRange(loc),
    message: explanation,
    source: 'parser',
  }
}

/**
 * Finds the result that better matches a given position.
 * That is, the result for which the loc is the smallest loc that contains the position.
 *
 * @param results a map from locations in the file to the result computed for it
 * @param position the position for which to find the result
 *
 * @returns the result from the map that better matches the position, or undefined if none is found
 */
export function findName(module: QuintModule, results: [Loc, bigint][], position: Position): string | undefined {
  const ids = resultsOnPosition(results, position)
  const names = ids.map(([_loc, id]) => {
    const expr = findExpressionWithId(module, id)
    if (!expr) {
      return ''
    }

    switch(expr.kind) {
      case 'name':
        return expr.name
      case 'app':
        return expr.opcode
    }
  })

  return names.find(name => name !== '')
}

export function findBestMatchingResult<T>(results: [Loc, T][], position: Position): [Loc, T] {
  return resultsOnPosition(results, position)[0]
}

export function locToRange(loc: Loc): Range {
  return {
    start: { line: loc.start.line, character: loc.start.col },
    end: {
      line: loc.end ? loc.end.line : loc.start.line,
      character: loc.end ? loc.end.col + 1 : loc.start.col,
    },
  }
}

function resultsOnPosition<T>(results: [Loc, T][], position: Position): [Loc, T][] {
  const filteredResults = results.filter(([loc, _result]) => {
    // Position is part of effect's expression range
    return (position.line >= loc.start.line && (!loc.end || position.line <= loc.end.line) &&
      position.character >= loc.start.col && (!loc.end || position.character <= loc.end.col))
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

  return sortedResults
}
