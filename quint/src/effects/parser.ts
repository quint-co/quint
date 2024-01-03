/* ----------------------------------------------------------------------------------
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Parsing for effects. To be used internally for the moment.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { CharStreams, CommonTokenStream } from 'antlr4ts'
import { EffectLexer } from '../generated/EffectLexer'
import * as p from '../generated/EffectParser'
import { EffectListener } from '../generated/EffectListener'
import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker'
import { Effect } from './base'
import { ToEffectVisitor } from './ToEffectVisitor'

import { Either, left, right } from '@sweet-monads/either'

/**
 * Parses an effect string into an Effect
 *
 * @param effectString the string to be parsed
 *
 * @returns the parsed effect when the string is a valid effect.
 *          Otherwise, a list of parsing errors.
 */
export function parseEffect(effectString: string): Either<any[], Effect> {
  const errorMessages: any[] = []
  // error listener to report lexical and syntax errors
  const errorListener: any = {
    syntaxError: (_: any, offendingSymbol: any, line: number, charPositionInLine: number, msg: string) => {
      const len = offendingSymbol ? offendingSymbol.stopIndex - offendingSymbol.startIndex : 0
      const index = offendingSymbol ? offendingSymbol.startIndex : 0
      const start = { line: line - 1, col: charPositionInLine, index }
      const end = { line: line - 1, col: charPositionInLine + len, index: index + len }
      errorMessages.push({ explanation: msg, locs: [{ start, end }] })
    },
  }

  // Create the lexer and parser
  const inputStream = CharStreams.fromString(effectString)
  const lexer = new EffectLexer(inputStream)
  // remove the console listener and add our listener
  lexer.removeErrorListeners()
  lexer.addErrorListener(errorListener)

  const tokenStream = new CommonTokenStream(lexer)
  const parser = new p.EffectParser(tokenStream)

  // remove the console listener and add our listener
  parser.removeErrorListeners()
  parser.addErrorListener(errorListener)
  // run the parser
  const tree = parser.effect()
  if (errorMessages.length > 0) {
    // report the errors
    return left(errorMessages)
  } else {
    // walk through the AST and construct the Effect
    const listener = new ToEffectVisitor()
    ParseTreeWalker.DEFAULT.walk(listener as EffectListener, tree)

    if (listener.effect !== undefined) {
      return right(listener.effect)
    } else {
      throw new Error('this should be impossible: effect is undefined')
    }
  }
}

export function parseEffectOrThrow(effect: string): Effect {
  const result = parseEffect(effect)

  if (result.isRight()) {
    const { value } = result
    return value
  } else {
    throw new Error(`Could not parse generated effect: ${effect} `)
  }
}
