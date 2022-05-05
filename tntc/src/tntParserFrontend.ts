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
import { resolveImports } from './importResolver'
import { treeFromModule } from './scoping'
import { scanConflicts } from './definitionsScanner'

export interface Loc {
  source: string;
  start: { line: number; col: number; index: number; }
  end?: { line: number; col: number; index: number; }
}

export interface ErrorMessage {
  explanation: string;
  locs: Loc[];
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
        ? offendingSymbol.stopIndex - offendingSymbol.startIndex
        : 0
      const index = offendingSymbol ? offendingSymbol.startIndex : 0
      const start = { line: line - 1, col: charPositionInLine, index: index }
      const end = { line: line - 1, col: charPositionInLine + len, index: index + len }
      errorMessages.push({ explanation: msg, locs: [{ source: sourceLocation, start: start, end: end }] })
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
  const scopeTree = treeFromModule(tntModule)
  const moduleDefinitions = collectDefinitions(tntModule)
  const importResolvingResult = resolveImports(tntModule, moduleDefinitions)
  let definitions
  const errorMessages: ErrorMessage[] = []

  if (importResolvingResult.kind === 'ok') {
    definitions = importResolvingResult.definitions
  } else {
    definitions = moduleDefinitions
    importResolvingResult.errors.forEach(error => {
      const loc = sourceMap.get(error.reference)
      if (!loc) {
        throw new Error(`no loc found for ${error.reference}`)
      }
      if (error.defName) {
        errorMessages.push({
          explanation: `Definition ${error.defName} from module ${error.moduleName} couldn't be imported`,
          locs: [loc],
        })
      } else {
        errorMessages.push({
          explanation: `Module ${error.moduleName} couldn't be imported`,
          locs: [loc],
        })
      }
    })
  }

  definitions.forEach((moduleDefinitions, moduleName) => {
    const conflictResult = scanConflicts(moduleDefinitions, scopeTree)

    if (conflictResult.kind === 'error') {
      conflictResult.conflicts.forEach(conflict => {
        let msg, sources
        if (conflict.sources.some(source => source.kind === 'builtin')) {
          msg = `Built-in name ${conflict.identifier} is redefined in module ${moduleName}`
          sources = conflict.sources.filter(source => source.kind === 'user')
        } else {
          msg = `Conflicting definitions found for name ${conflict.identifier} in module ${moduleName}`
          sources = conflict.sources
        }
        const locs = sources.map(source => {
          const id = source.kind === 'user' ? source.reference : BigInt(0) // Impossible case, but TS requires the check
          const loc = sourceMap.get(id)
          if (!loc) {
            throw new Error(`no loc found for ${id}`)
          }
          return loc
        })
        errorMessages.push({ explanation: msg, locs: locs })
      })
    }
  })

  // Temp: use just the root's module table at name resolution for now
  const result = resolveNames(tntModule, definitions, scopeTree)

  if (result.kind === 'error') {
    // Build error message with resolution explanation and the location obtained from sourceMap
    result.errors.forEach(error => {
      const id = error.reference
      const msg = `Couldn't resolve ${error.kind === 'type' ? 'type alias' : 'name'} ${error.name} in definition for ${error.definitionName}, in module ${error.moduleName}`
      const loc = sourceMap.get(id)
      if (!loc) {
        throw new Error(`no loc found for ${id}`)
      }
      errorMessages.push({ explanation: msg, locs: [loc] })
    })
  }

  return errorMessages.length > 0
    ? { kind: 'error', messages: errorMessages }
    : { kind: 'ok', module: tntModule, sourceMap: sourceMap }
}

export function compactSourceMap (sourceMap: Map<BigInt, Loc>): { sourceIndex: any, map: any } {
  // Collect all sources in order to index them
  const sources: string[] = Array.from(sourceMap.values()).map(loc => loc.source)

  // Initialized two structures to be outputed
  const compactedSourceMap: Map<BigInt, any[]> = new Map<BigInt, number[]>()
  const sourcesIndex: Map<number, string> = new Map<number, string>()

  // Build a compacted version of the source map with array elements
  sourceMap.forEach((value, key) => {
    compactedSourceMap.set(key, [sources.indexOf(value.source), value.start, value.end ? value.end : {}])
  })

  // Build an index from ids to source
  sources.forEach((source) => {
    sourcesIndex.set(sources.indexOf(source), source)
  })

  return { sourceIndex: Object.fromEntries(sourcesIndex), map: Object.fromEntries(compactedSourceMap) }
}
