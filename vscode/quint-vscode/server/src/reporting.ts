import { ErrorTree, Loc, errorTreeToString } from "@informalsystems/quint"
import { Diagnostic, DiagnosticSeverity, Position } from "vscode-languageserver"

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

export function assembleDiagnostic(explanation: string, loc: Loc): Diagnostic {
  return {
    severity: DiagnosticSeverity.Error,
    range: {
      start: { line: loc.start.line, character: loc.start.col },
      end: {
        line: loc.end ? loc.end.line : loc.start.line,
        character: loc.end ? loc.end.col + 1 : loc.start.col,
      },
    },
    message: explanation,
    source: 'parser',
  }
}

export function findResult(results: Map<Loc, string>, position: Position): string {
  const resultsOnPosition: [string, Loc][] = []

  results.forEach((result, loc) => {
    if (position.line >= loc.start.line && (!loc.end || position.line <= loc.end.line) &&
      position.character >= loc.start.col && (!loc.end || position.character <= loc.end.col)) {
      // Position is part of effect's expression range
      resultsOnPosition.push([result, loc])
    }
  })

  // Sort effects by range size. We want to show the most specific effect for the position.
  const sortedResults = resultsOnPosition.sort(([_e1, a], [_e2, b]) => {
    if (!a.end) {
      return -1
    } else if (!b.end) {
      return 1
    } else if (a.end.index - a.start.index > b.end.index - b.start.index) {
      return 1
    } else {
      return -1
    }
  }).map(([r, _]) => r)

  return sortedResults[0]
}
