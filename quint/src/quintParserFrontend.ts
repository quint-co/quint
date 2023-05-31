/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2021-2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

import { CharStreams, CommonTokenStream } from 'antlr4ts'

import { QuintLexer } from './generated/QuintLexer'
import * as p from './generated/QuintParser'
import { QuintListener } from './generated/QuintListener'
import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker'

import { IrErrorMessage, QuintDef, QuintEx, QuintModule } from './quintIr'
import { IdGenerator } from './idGenerator'
import { ToIrListener } from './ToIrListener'
import { collectDefinitions } from './definitionsCollector'
import { resolveNames } from './nameResolver'
import { resolveImports } from './importResolver'
import { treeFromModule } from './scoping'
import { scanConflicts } from './definitionsScanner'
import { Definition, LookupTable } from './lookupTable'
import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import { mkErrorMessage } from './cliCommands'
import { DefinitionsByModule, DefinitionsByName } from './definitionsByName'
import { SourceLookupPath, SourceResolver, fileSourceResolver } from './sourceResolver'

export interface Loc {
  source: string
  start: { line: number; col: number; index: number }
  end?: { line: number; col: number; index: number }
}

// the default error location that usually indicates a bug in our code
const unknownLoc: Loc = {
  source: '<unknown>',
  start: { line: 0, col: 0, index: 0 },
}

/**
 * An error message whose locations have been resolved.
 */
export interface ErrorMessage {
  explanation: string
  locs: Loc[]
}

// an adapter from IrErrorMessage to ErrorMessage
export function fromIrErrorMessage(sourceMap: Map<bigint, Loc>): (err: IrErrorMessage) => ErrorMessage {
  return msg => {
    return {
      explanation: msg.explanation,
      locs: msg.refs.map(id => sourceMap.get(id) ?? unknownLoc),
    }
  }
}

export type ParseResult<T> = Either<ErrorMessage[], T>

export interface ParserPhase1 {
  modules: QuintModule[]
  sourceMap: Map<bigint, Loc>
}

export interface ParserPhase2 extends ParserPhase1 { }

export interface ParserPhase3 extends ParserPhase2 {
  table: LookupTable
}

/**
 * The result of parsing an expression or unit.
 */
export type ExpressionOrUnitParseResult =
  | { kind: 'toplevel', def: QuintDef }
  | { kind: 'expr', expr: QuintEx }
  | { kind: 'none' }
  | { kind: 'error'; messages: ErrorMessage[] }

/**
 * Try parsing text as an expression or a top-level declaration.
 *
 * @param text input text
 * @param sourceLocation a textual description of the source
 * @returns the parsing result
 */
export function parseExpressionOrUnit(
  text: string, sourceLocation: string, idGenerator: IdGenerator, sourceMap: Map<bigint, Loc>
): ExpressionOrUnitParseResult {
  const errorMessages: ErrorMessage[] = []
  const parser = setupParser(text, sourceLocation, errorMessages)
  const tree = parser.unitOrExpr()
  if (errorMessages.length > 0) {
    return { kind: 'error', messages: errorMessages }
  } else {
    const listener = new ExpressionOrUnitListener(sourceLocation, idGenerator)

    // Use an existing source map as a starting point.
    listener.sourceMap = sourceMap

    ParseTreeWalker.DEFAULT.walk(listener as QuintListener, tree)
    return listener.result
  }
}

/**
 * Phase 1 of the Quint parser. Read a string in the Quint syntax and produce the IR.
 * Note that the IR may be ill-typed and some names may be unresolved.
 * The main goal of this pass is to translate a sequence of characters into IR.
 */
export function parsePhase1fromText(
  idGen: IdGenerator,
  text: string,
  sourceLocation: string
): ParseResult<ParserPhase1> {
  const errorMessages: ErrorMessage[] = []
  const parser = setupParser(text, sourceLocation, errorMessages)
  // run the parser
  const tree = parser.modules()
  if (errorMessages.length > 0) {
    // report the errors
    return left(errorMessages)
  } else {
    // walk through the AST and construct the IR
    const listener = new ToIrListener(sourceLocation, idGen)
    ParseTreeWalker.DEFAULT.walk(listener as QuintListener, tree)

    if (listener.errors.length > 0) {
      return left(listener.errors)
    } else if (listener.modules.length > 0) {
      return right({ modules: listener.modules, sourceMap: listener.sourceMap })
    } else {
      // istanbul ignore next
      throw new Error('Illegal state: root module is undefined. Please report a bug.')
    }
  }
}

/**
 * Phase 2 of the Quint parser. Go over each definition of the form
 * `import ... from '<path>'`, do the following:
 *
 *  - parse the modules that are referenced by each path,
 *  - add the parsed modules.
 *
 * Cyclic dependencies among different files are reported as errors.
 */
export function parsePhase2sourceResolution(
  idGen: IdGenerator,
  sourceResolver: SourceResolver,
  mainPath: SourceLookupPath,
  mainPhase1Result: ParserPhase1
): ParseResult<ParserPhase2> {
  // we accumulate the source map over all files here
  let sourceMap = new Map(mainPhase1Result.sourceMap)
  // The list of modules that have not been been processed yet.
  // Each element of the list carries the module to be processed and the trail
  // of sources that led to this module.
  // The construction is similar to the worklist algorithm:
  // https://en.wikipedia.org/wiki/Reaching_definition#Worklist_algorithm
  const worklist: [QuintModule, SourceLookupPath[]][] = mainPhase1Result.modules.map(m => [m, [mainPath]])
  // Collect modules produced by every source.
  const sourceToModules = new Map<string, QuintModule[]>()
  // Assign a rank to every module. The higher the rank,
  // the earlier the module should appear in the list of modules.
  sourceToModules.set(mainPath.normalizedPath, mainPhase1Result.modules)
  const moduleRank = new Map<string, number>()
  let maxModuleRank = 0
  mainPhase1Result.modules.reverse().forEach(m => moduleRank.set(m.name, maxModuleRank++))
  while (worklist.length > 0) {
    const [importer, pathTrail] = worklist.splice(0, 1)[0]
    for (const def of importer.defs) {
      if ((def.kind === 'import' || def.kind === 'instance') && def.fromSource) {
        const importerPath = pathTrail[pathTrail.length - 1]
        const stemPath = sourceResolver.stempath(importerPath)
        const importeePath = sourceResolver.lookupPath(stemPath, def.fromSource + '.qnt')
        // check for import cycles
        if (pathTrail.find(p => p.normalizedPath === importeePath.normalizedPath)) {
          // found a cyclic dependency
          const cycle = pathTrail
            .concat([importeePath])
            .map(p => `'${p.toSourceName()}'`)
            .join(' imports ')
          const err = fromIrErrorMessage(sourceMap)({
            explanation: `Cyclic imports: ${cycle}`,
            refs: [def.id],
          })
          return left([err])
        }
        if (sourceToModules.has(importeePath.normalizedPath)) {
          // The source has been parsed already. Just push the module rank,
          // for the modules to appear earlier.
          sourceToModules.get(importeePath.normalizedPath)?.forEach(m => moduleRank.set(m.name, maxModuleRank++))
          continue
        }
        // try to load the source code
        const errorOrText = sourceResolver.load(importeePath)
        if (errorOrText.isLeft()) {
          // failed to load the imported source
          const err = fromIrErrorMessage(sourceMap)({
            // do not use the original message as it propagates absolute file names
            explanation: `import ... from '${def.fromSource}': could not load`,
            refs: [def.id],
          })
          return left([err])
        }
        // try to parse the source code
        const parseResult = parsePhase1fromText(idGen, errorOrText.value, importeePath.toSourceName())
        if (parseResult.isLeft()) {
          // failed to parse the code of the loaded file
          return parseResult
        }
        // all good: add the new modules to the worklist, and update the source map
        const newModules = parseResult.value.modules.reverse()
        newModules.forEach(m => {
          worklist.push([m, pathTrail.concat([importeePath])])
        })
        sourceToModules.set(importeePath.normalizedPath, newModules)
        newModules.forEach(m => moduleRank.set(m.name, maxModuleRank++))
        sourceMap = new Map([...sourceMap, ...parseResult.value.sourceMap])
      }
    }
  }

  // Get all the modules and sort them according to the rank (the higher, the earlier)
  let allModules: QuintModule[] = []
  for (const mods of sourceToModules.values()) {
    allModules = allModules.concat(mods)
  }
  allModules.sort((m1, m2) => moduleRank.get(m2.name)! - moduleRank.get(m1.name)!)
  return right({ modules: allModules, sourceMap: sourceMap })
}

/**
 * Phase 3 of the Quint parser. Assuming that all external sources have been resolved,
 * resolve imports and names. Read the IR and check that all names are defined.
 * Note that the IR may be ill-typed.
 */
export function parsePhase3importAndNameResolution(phase1Data: ParserPhase2): ParseResult<ParserPhase3> {
  const sourceMap: Map<bigint, Loc> = phase1Data.sourceMap

  const definitionsByModule: DefinitionsByModule = new Map()

  const definitions = phase1Data.modules.reduce((result: Either<ErrorMessage[], LookupTable>, module) => {
    const scopeTree = treeFromModule(module)
    const definitionsBeforeImport = collectDefinitions(module)
    definitionsByModule.set(module.name, definitionsBeforeImport)

    const [errors, definitions] = resolveImports(module, definitionsByModule)
    const errorLocator = mkErrorMessage(sourceMap)

    const importResult: Either<ErrorMessage[], DefinitionsByName> =
      errors.size > 0 ? left(Array.from(errors, errorLocator)) : right(definitions)

    definitionsByModule.set(module.name, definitions)

    const conflictResult: Either<ErrorMessage[], void> = scanConflicts(definitions, scopeTree).mapLeft(
      (conflicts): ErrorMessage[] => {
        return conflicts.map(conflict => {
          let msg, sources
          if (conflict.sources.some(source => source.kind === 'builtin')) {
            msg = `Built-in name ${conflict.identifier} is redefined in module ${module.name}`
            sources = conflict.sources.filter(source => source.kind === 'user')
          } else {
            msg = `Conflicting definitions found for name ${conflict.identifier} in module ${module.name}`
            sources = conflict.sources
          }

          const locs = sources.map(source => {
            const id = source.kind === 'user' ? source.reference : 0n // Impossible case, but TS requires the check
            let sourceLoc = sourceMap.get(id)
            if (!sourceLoc) {
              console.error(`No source location found for ${id}. Please report a bug.`)
              return unknownLoc
            } else {
              return sourceLoc
            }
          })

          return { explanation: msg, locs }
        })
      }
    )

    const resolutionResult: Either<ErrorMessage[], LookupTable> = resolveNames(module, definitions, scopeTree).mapLeft(
      errors => {
        // Build error message with resolution explanation and the location obtained from sourceMap
        return errors.map(error => {
          const msg =
            `Failed to resolve ` +
            (error.kind === 'type' ? 'type alias' : 'name') +
            ` ${error.name} in definition for ${error.definitionName}, ` +
            `in module ${error.moduleName}`
          const id = error.reference
          if (id) {
            const sourceLoc = sourceMap.get(id)
            if (!sourceLoc) {
              console.error(`No source location found for ${id}. Please report a bug.`)
            }
            const loc = sourceLoc ?? unknownLoc
            return { explanation: msg, locs: [loc] }
          } else {
            return { explanation: msg, locs: [] }
          }
        })
      }
    )

    return mergeInMany([importResult, conflictResult, resolutionResult])
      .chain(([_, __, table]) => result.map(t => new Map<bigint, Definition>([...t.entries(), ...table.entries()])))
      .mapLeft(errors => errors.flat())
  }, right(new Map()))

  return definitions.map(table => ({ ...phase1Data, table }))
}

export function compactSourceMap(sourceMap: Map<bigint, Loc>): { sourceIndex: any; map: any } {
  // Collect all sources in order to index them
  const sources: string[] = Array.from(sourceMap.values()).map(loc => loc.source)

  // Initialized two structures to be outputed
  const compactedSourceMap: Map<bigint, any[]> = new Map<bigint, number[]>()
  const sourcesIndex: Map<number, string> = new Map<number, string>()

  // Build a compacted version of the source map with array elements
  sourceMap.forEach((value, key) => {
    compactedSourceMap.set(key, [sources.indexOf(value.source), value.start, value.end ? value.end : {}])
  })

  // Build an index from ids to source
  sources.forEach(source => {
    sourcesIndex.set(sources.indexOf(source), source)
  })

  return { sourceIndex: Object.fromEntries(sourcesIndex), map: Object.fromEntries(compactedSourceMap) }
}

export function parse(idGen: IdGenerator, sourceLocation: string, mainPath: SourceLookupPath, code: string): ParseResult<ParserPhase3> {
  return parsePhase1fromText(idGen, code, sourceLocation)
    .chain(phase1Data => {
      const resolver = fileSourceResolver()
      return parsePhase2sourceResolution(idGen, resolver, mainPath, phase1Data)
    })
    .chain(phase2Data =>
      parsePhase3importAndNameResolution(phase2Data)
    )
}

// setup a Quint parser, so it can be used to parse from various non-terminals
function setupParser(text: string, sourceLocation: string, errorMessages: ErrorMessage[]): p.QuintParser {
  // error listener to report lexical and syntax errors
  const errorListener: any = {
    syntaxError: (recognizer: any, offendingSymbol: any, line: number, charPositionInLine: number, msg: string) => {
      const len = offendingSymbol ? offendingSymbol.stopIndex - offendingSymbol.startIndex : 0
      const index = offendingSymbol ? offendingSymbol.startIndex : 0
      const start = { line: line - 1, col: charPositionInLine, index }
      const end = { line: line - 1, col: charPositionInLine + len, index: index + len }
      errorMessages.push({ explanation: msg, locs: [{ source: sourceLocation, start, end }] })
    },
  }

  // Create the lexer and parser
  const inputStream = CharStreams.fromString(text)
  const lexer = new QuintLexer(inputStream)
  // remove the console listener and add our listener
  lexer.removeErrorListeners()
  lexer.addErrorListener(errorListener)

  const tokenStream = new CommonTokenStream(lexer)
  const parser = new p.QuintParser(tokenStream)

  // remove the console listener and add our listener
  parser.removeErrorListeners()
  parser.addErrorListener(errorListener)

  return parser
}

// A simple listener to parse a unit or expression
class ExpressionOrUnitListener extends ToIrListener {
  result: ExpressionOrUnitParseResult = {
    kind: 'error',
    messages: [
      {
        explanation: 'unknown parse result',
        locs: [],
      },
    ],
  }

  exitUnitOrExpr(ctx: p.UnitOrExprContext) {
    if (ctx.unit()) {
      const def = this.definitionStack[this.definitionStack.length - 1]
      this.result = { kind: 'toplevel', def }
    } else if (ctx.expr()) {
      const expr = this.exprStack[this.exprStack.length - 1]
      this.result = { kind: 'expr', expr }
    } else {
      this.result = { kind: 'none' }
    }
  }
}
