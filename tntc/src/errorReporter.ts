/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Human-friendly error reporting for TNT errors. From the read text and an error
 * message containing localization errors, fetch offending lines and highlights
 * offending sections with ^^^ strings.
 *
 * @author Gabriela Mafra
 *
 * @module
 */

import { ErrorMessage } from './tntParserFrontend'

/** Generate a string with formatted error reporting for a given error message
 *
 * @param text the string read from the source file for which the messages' location info points to
 * @param finder a line-column lib finder object created from text, used as a cached map of indexes
 * @param message the error message to be reported
 *
 * @returns a formatted string with error information
 * */
export function formatError (text: string, finder: any, message: ErrorMessage): string {
  if (message.locs.length === 0) {
    return `error: ${message.explanation}`
  }

  return message.locs.reduce((output, loc) => {
    const locString = `${loc.source}:${loc.start.line + 1}:${loc.start.col + 1}`
    output += `${locString} - error: ${message.explanation}\n`

    const endLine = loc.end ? loc.end.line : loc.start.line
    const endCol = loc.end ? loc.end.col : loc.start.col
    for (let i = loc.start.line; i <= endLine; i++) {
      // finder's indexes start at 1
      const lineStartIndex = finder.toIndex(i + 1, 1)
      const line = text.slice(lineStartIndex).split('\n')[0]

      const lineStartCol = i === loc.start.line ? loc.start.col : 0
      const lineEndCol = i === endLine ? endCol : line.length - 1

      output += formatLine(i, lineStartCol, lineEndCol, line)
    }
    return output
  }, '')
}

function formatLine (lineIndex: number, startCol: number, endCol: number, line: string): string {
  let output = ''
  const lineNumberIndicator = `${lineIndex + 1}: `
  output += `${lineNumberIndicator}${line}\n`
  // Add margin according to how much space the indicator takes
  output += ' '.repeat(lineNumberIndicator.length)

  // Write ^ characters for columns that should be highlited in this line
  output += ' '.repeat(startCol)
  output += '^'.repeat(1 + endCol - startCol)
  output += '\n'
  return output
}
