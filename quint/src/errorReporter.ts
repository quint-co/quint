/* ----------------------------------------------------------------------------------
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Human-friendly error reporting for Quint errors. From the read text and an error
 * message containing localization errors, fetch offending lines and highlights
 * offending sections with ^^^ strings.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Maybe, just } from '@sweet-monads/maybe'
import JSONbig from 'json-bigint'
import chalk from 'chalk'

import { ErrorMessage, Loc } from './ErrorMessage'
import lineColumn from 'line-column'

/**
 * Extract error code from error explanation string.
 * Error explanations follow the format: "[CODE] message"
 *
 * @param explanation - the error explanation string
 * @returns the error code, or 'QNT000' if not found
 */
function extractErrorCode(explanation: string): string {
  const match = explanation.match(/\[([^\]]+)\]/)
  return match?.[1] || 'QNT000'
}

/**
 * Remove error code from error explanation string.
 *
 * @param explanation - the error explanation string
 * @returns the explanation without the error code prefix
 */
function stripErrorCode(explanation: string): string {
  return explanation.replace(/\[[^\]]+\]\s*/, '')
}

/**
 * Format a location string with line and column numbers.
 *
 * @param loc - the source location
 * @param lineOffset - offset to add to line numbers (for 1-based indexing)
 * @returns formatted location string like "file.qnt:10:5"
 */
function formatLocation(loc: Loc, lineOffset: Maybe<number>): string {
  if (lineOffset.isJust()) {
    return `${loc.source}:${loc.start.line + lineOffset.value}:${loc.start.col + 1}`
  }
  return `${loc.source}:${loc.start.line}:${loc.start.col + 1}`
}

/**
 * Generate a string with formatted error reporting for a given error message.
 * Displays the error with source location, code snippet, and optional call stack trace.
 *
 * @param code a map from all possible loc sources to their file contents
 * @param finders a map of from all possible loc sources to a line-column lib
 *   finder object created from the text for that source, used as cached maps of indexes
 * @param message the error message to be reported
 * @param lineOffset a maybe number to add to line numbers in error messages,
 *        the default value is `just(1)`.
 *        No source info is printed if `lineOffset == none()`.
 *
 * @returns a formatted string with error information
 */
export function formatError(
  code: Map<string, string>,
  finders: Map<string, any>,
  message: ErrorMessage,
  lineOffset: Maybe<number> = just(1)
): string {
  if (message.locs.length === 0) {
    return `error: ${message.explanation}`
  }

  try {
    // Format the primary error location
    let output = message.locs.reduce((output, loc) => {
      const text = code.get(loc.source)!
      const finder = finders.get(loc.source)!

      // Error message first: "Error [CODE]: message"
      const errorCode = extractErrorCode(message.explanation)
      const errorMessage = stripErrorCode(message.explanation)
      output += `\n Error [${errorCode}]: ${errorMessage}\n`

      // Location below, indented
      const locString = formatLocation(loc, lineOffset)
      output += `\n  at ${locString}\n`

      const endLine = loc.end ? loc.end.line : loc.start.line
      const endCol = loc.end ? loc.end.col : loc.start.col
      for (let i = loc.start.line; i <= endLine; i++) {
        // finder's indexes start at 1
        const lineStartIndex = finder.toIndex(i + 1, 1)
        const line = text.slice(lineStartIndex).split('\n')[0]

        const lineStartCol = i === loc.start.line ? loc.start.col : 0
        const lineEndCol = i === endLine ? endCol : line.length - 1

        const lineIndex = lineOffset.map(offs => offs + i)
        output += formatLine(lineIndex, lineStartCol, lineEndCol, line, 2)
      }
      return output
    }, '')

    // Append call stack trace if available
    if (message.traceLocs && message.traceLocs.length > 0) {
      output += formatCallStack(message.traceLocs, code, finders, lineOffset)
    }

    return output
  } catch (error: any) {
    // If it happens that an error occurs during the error reconstruction,
    // print that we could not construct a good explanation, instead of throwing.
    console.error('\nSomething unexpected happened during error reconstruction. Please report a bug.\n')
    console.error('Include this in the bug report: {')
    console.trace(error.message)
    console.log('Trying to format', JSONbig.stringify(message.locs))
    console.error('} // end of the bug report\n')

    // return the bare bones error message
    return `error: ${message.explanation}`
  }
}

/**
 * Create line column finders (from the line-column lib) for each file in a map.
 *
 * @param sourceCode - a map of file names to their contents
 *
 * @returns a map of file names to their finders
 */
export function createFinders(sourceCode: Map<string, string>): Map<string, any> {
  return new Map([...sourceCode.entries()].map(([path, code]) => [path, lineColumn(code)]))
}

/**
 * Format a single line of code with caret markers pointing to the error.
 *
 * @param lineIndex - optional line number to display
 * @param startCol - starting column of the error
 * @param endCol - ending column of the error
 * @param line - the code line to display
 * @param indent - number of spaces to indent the output
 * @returns formatted line with carets pointing to the error
 */
function formatLine(lineIndex: Maybe<number>, startCol: number, endCol: number, line: string, indent: number = 0): string {
  let output = ''
  const indentStr = ' '.repeat(indent)
  const lineNumberIndicator = lineIndex.isJust() ? `${lineIndex.value}: ` : ''
  output += `${indentStr}${lineNumberIndicator}${line}\n`

  // Add margin according to indent + how much space the indicator takes
  output += ' '.repeat(indent + lineNumberIndicator.length)

  // Write ^ characters for columns that should be highlighted in this line
  output += ' '.repeat(startCol)
  output += '^'.repeat(1 + endCol - startCol)
  output += '\n'
  return output
}

/**
 * Format the call stack trace in JavaScript/TypeScript style.
 * Each frame shows "at expression (location)" where the expression is the actual
 * code that was executed at that call site.
 *
 * @param traceLocs - array of source locations representing the call stack
 * @param code - map of file contents
 * @param finders - map of line-column finders for each file
 * @param lineOffset - offset to add to line numbers
 * @returns formatted call stack trace string
 */
function formatCallStack(
  traceLocs: Loc[],
  code: Map<string, string>,
  finders: Map<string, any>,
  lineOffset: Maybe<number>
): string {
  let output = ''

  for (const loc of traceLocs) {
    const text = code.get(loc.source)
    const finder = finders.get(loc.source)
    if (!text || !finder) continue

    const locString = formatLocation(loc, lineOffset)

    // Get the code snippet and extract the problematic expression
    const lineStartIndex = finder.toIndex(loc.start.line + 1, 1)
    const fullLine = text.slice(lineStartIndex).split('\n')[0]
    const endLine = loc.end ? loc.end.line : loc.start.line
    const lineEndCol = loc.start.line === endLine && loc.end ? loc.end.col : fullLine.length - 1

    // Extract the expression that was called
    const expr = fullLine.slice(loc.start.col, lineEndCol + 1)

    // Format: "at expression (location)" - JavaScript/TypeScript style
    output += chalk.gray(`    at `) + chalk.gray.bold(expr) + chalk.gray(` (${locString})\n`)
  }

  return output
}
