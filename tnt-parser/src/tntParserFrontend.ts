/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2021. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

import { CharStreams, CommonTokenStream } from 'antlr4ts'

import { TntLexer } from './generated/TntLexer'
import * as p from './generated/TntParser'
import { TntListener } from './generated/TntListener'
import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker'

import { TntModule } from './tntIr'
import { ToIrListener } from './ToIrListener'

export interface ErrorMessage {
    explanation: string;
    start: { line: number; col: number; }
    end: { line: number; col: number; }
}

export type ParseResult =
    | { kind: 'ok', module: TntModule }
    | { kind: 'error', messages: ErrorMessage[] }

/**
 * Phase 1 of the TNT parser. Read a string in the TNT syntax and produce the IR.
 * Note that the IR may be ill-typed and some names may be unresolved.
 * The main goal of this pass is to translate a sequence of characters into IR.
 */
export function parsePhase1 (text: string): ParseResult {
  // Create the lexer and parser
  const inputStream = CharStreams.fromString(text)
  const lexer = new TntLexer(inputStream)
  const tokenStream = new CommonTokenStream(lexer)
  const parser = new p.TntParser(tokenStream)
  const errorMessages: ErrorMessage[] = []
  // remove ConsoleErrorListener that outputs to console
  parser.removeErrorListeners()
  // add our listener that collects errors
  parser.addErrorListener({
    syntaxError: (recognizer, offendingSymbol, line, charPositionInLine, msg) => {
      const len = (offendingSymbol)
        ? (1 + offendingSymbol.stopIndex - offendingSymbol.startIndex)
        : 1
      const start = { line: line - 1, col: charPositionInLine }
      const end = { line: line - 1, col: charPositionInLine + len }
      errorMessages.push({ explanation: msg, start, end })
    }
  })
  // run the parser
  const tree = parser.module()
  if (errorMessages.length > 0) {
    // report the errors
    return { kind: 'error', messages: errorMessages }
  } else {
    // walk through the AST and construct the IR
    const listener = new ToIrListener()
    ParseTreeWalker.DEFAULT.walk(listener as TntListener, tree)

    if (listener.errors.length > 0) {
      return { kind: 'error', messages: listener.errors }
    } else if (listener.rootModule !== undefined) {
      return { kind: 'ok', module: listener.rootModule }
    } else {
      // this case should not be possible, but we handle it just in case
      const start = { line: tree.start.line, col: tree.start.charPositionInLine }
      const end = tree.stop
        ? { line: tree.stop.line, col: tree.stop.charPositionInLine }
        : start
      const msg = { start: start, end: end, explanation: 'undefined root module' }
      return { kind: 'error', messages: [msg] }
    }
  }
}
