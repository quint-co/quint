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
import { collectDefinitions } from './definitionsCollector'
import { resolveNames, NameResolutionResult } from './nameResolver'

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
  const errorMessages: ErrorMessage[] = []
  // error listener to report lexical and syntax errors
  const errorListener: any = {
    syntaxError: (recognizer: any,
      offendingSymbol: any,
      line: number,
      charPositionInLine: number,
      msg: string) => {
      //
      const len = (offendingSymbol)
        ? (1 + offendingSymbol.stopIndex - offendingSymbol.startIndex)
        : 1
      const start = { line: line - 1, col: charPositionInLine }
      const end = { line: line - 1, col: charPositionInLine + len }
      errorMessages.push({ explanation: msg, start, end })
    },
  }

  // Create the lexer and parser
  const inputStream = CharStreams.fromString(text)
  const lexer = new TntLexer(inputStream)
  // remove the console listener and add our listener
  lexer.removeErrorListeners()
  lexer.addErrorListener(errorListener)

  const tokenStream = new CommonTokenStream(lexer)
  const parser = new p.TntParser(tokenStream)

  // remove the console listener and add our listener
  parser.removeErrorListeners()
  parser.addErrorListener(errorListener)
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
      // istanbul ignore next
      throw new Error('this should be impossible: root module is undefined')
    }
  }
}

export function parsePhase2 (tntModule: TntModule): NameResolutionResult {
  // Phase 2 is name resolution
  const definitions = collectDefinitions(tntModule)

  return resolveNames(tntModule, definitions)
}
