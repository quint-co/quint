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
import { resolveNames } from './nameResolver'

export interface Loc {
  source: string;
  start: { line: number; col: number; index: number; }
  end?: { line: number; col: number; index: number; }
}

export interface ErrorMessage {
  explanation: string;
  loc: Loc;
}

export type ParseResult =
  | { kind: 'ok', module: TntModule, sourceMap: Map<BigInt, Loc> }
  | { kind: 'error', messages: ErrorMessage[] }

/**
 * Phase 1 of the TNT parser. Read a string in the TNT syntax and produce the IR.
 * Note that the IR may be ill-typed and some names may be unresolved.
 * The main goal of this pass is to translate a sequence of characters into IR.
 */
export function parsePhase1 (text: string, sourceLocation: string): ParseResult {
  const errorMessages: ErrorMessage[] = []
  // error listener to report lexical and syntax errors
  const errorListener: any = {
    syntaxError: (recognizer: any,
      offendingSymbol: any,
      line: number,
      charPositionInLine: number,
      msg: string) => {
      //
      const len = offendingSymbol
        ? (1 + offendingSymbol.stopIndex - offendingSymbol.startIndex)
        : 0
      const index = offendingSymbol ? offendingSymbol.startIndex : 0
      const start = { line: line - 1, col: charPositionInLine, index: index }
      const end = { line: line - 1, col: charPositionInLine + len, index: index + len }
      errorMessages.push({ explanation: msg, loc: { source: sourceLocation, start: start, end: end } })
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
    const listener = new ToIrListener(sourceLocation)
    ParseTreeWalker.DEFAULT.walk(listener as TntListener, tree)

    if (listener.errors.length > 0) {
      return { kind: 'error', messages: listener.errors }
    } else if (listener.rootModule !== undefined) {
      return { kind: 'ok', module: listener.rootModule, sourceMap: listener.sourceMap }
    } else {
      // istanbul ignore next
      throw new Error('this should be impossible: root module is undefined')
    }
  }
}

/**
 * Phase 2 of the TNT parser. Read the IR and check that all names are defined.
 * Note that the IR may be ill-typed.
 */
export function parsePhase2 (tntModule: TntModule, sourceMap: Map<BigInt, Loc>): ParseResult {
  const definitions = collectDefinitions(tntModule)

  const result = resolveNames(tntModule, definitions)

  const errorMessages: ErrorMessage[] = []

  if (result.kind === 'error') {
    result.errors.forEach(error => {
      const expression = error.expression
      const msg = `Couldn't resolve name ${error.name} in definition for ${error.definitionName}`
      const loc = sourceMap.get(expression.id)
      if (!loc) {
        throw new Error(`no loc found for ${expression.id}`)
      }
      errorMessages.push({ explanation: msg, loc: loc })
    })
  }

  return errorMessages.length > 0 ? { kind: 'error', messages: errorMessages } : { kind: 'ok', module: tntModule, sourceMap: sourceMap }
}
