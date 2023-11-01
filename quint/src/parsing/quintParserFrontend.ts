/*
 * The frontend to the Quint parser, which is generated with Antlr4.
 *
 * Igor Konnov, Gabriela Moreira, Shon Feder, 2021-2023
 *
 * Copyright 2021-2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 */

import { CharStreams, CommonTokenStream } from 'antlr4ts'
import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker'

import { QuintLexer } from '../generated/QuintLexer'
import * as p from '../generated/QuintParser'
import { QuintListener } from '../generated/QuintListener'

import { QuintDeclaration, QuintDef, QuintEx, QuintModule, isDef } from '../ir/quintIr'
import { IdGenerator, newIdGenerator } from '../idGenerator'
import { ToIrListener } from './ToIrListener'
import { LookupTable, UnusedDefinitions } from '../names/base'
import { resolveNames } from '../names/resolver'
import { QuintError } from '../quintError'
import { SourceLookupPath, SourceResolver, fileSourceResolver } from './sourceResolver'
import { CallGraphVisitor, mkCallGraphContext } from '../static/callgraph'
import { walkModule } from '../ir/IRVisitor'
import { toposort } from '../static/toposort'
import { ErrorCode } from '../quintError'
import { Loc } from '../ErrorMessage'
import { flow } from 'lodash'

/**
 * A source map that is constructed by the parser phases.
 */
export type SourceMap = Map<bigint, Loc>

/**
 * The result of parsing, T is specialized to a phase, see below.
 */
export type ParseResult<T> = T

/**
 * Phase 1: Parsing a string of characters into intermediate representation.
 */
export interface ParserPhase1 {
  modules: QuintModule[]
  sourceMap: SourceMap
  errors: QuintError[]
}

/**
 * Phase 2: Import resolution and detection of cyclic imports.
 */
export interface ParserPhase2 extends ParserPhase1 {}

/**
 * Phase 3: Name resolution.
 */
export interface ParserPhase3 extends ParserPhase2 {
  table: LookupTable
  unusedDefinitions: UnusedDefinitions
}

/**
 * Phase 4: Topological sort of declarations and cycle detection.
 */
export interface ParserPhase4 extends ParserPhase3 {}

/**
 * The result of parsing an expression or unit.
 */
export type ExpressionOrDeclarationParseResult =
  | { kind: 'declaration'; decl: QuintDeclaration }
  | { kind: 'expr'; expr: QuintEx }
  | { kind: 'none' }
  | { kind: 'error'; errors: QuintError[] }

/**
 * Try parsing text as an expression or a top-level declaration.
 *
 * @param text input text
 * @param sourceLocation a textual description of the source
 * @returns the parsing result
 */
export function parseExpressionOrDeclaration(
  text: string,
  sourceLocation: string,
  idGenerator: IdGenerator,
  sourceMap: SourceMap
): ExpressionOrDeclarationParseResult {
  const errors: QuintError[] = []
  const parser = setupParser(text, sourceLocation, errors, sourceMap, idGenerator)
  const tree = parser.declarationOrExpr()
  const listener = new ExpressionOrDeclarationListener(sourceLocation, idGenerator)

  // Use an existing source map as a starting point.
  listener.sourceMap = sourceMap

  ParseTreeWalker.DEFAULT.walk(listener as QuintListener, tree)
  errors.push(...listener.errors)
  return errors.length > 0 ? { kind: 'error', errors: errors } : listener.result!
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
  const errors: QuintError[] = []
  const listener = new ToIrListener(sourceLocation, idGen)
  const parser = setupParser(text, sourceLocation, errors, listener.sourceMap, idGen)
  // run the parser
  const tree = parser.modules()

  // wrap this in a try catch, since we are running the parser even if there are
  // errors after the previous command.
  try {
    // walk through the AST and construct the IR
    ParseTreeWalker.DEFAULT.walk(listener as QuintListener, tree)
  } catch (e) {
    if (errors.length === 0) {
      throw e
    }
    // ignore the exception, we already have errors to report
  }

  return { errors: errors.concat(listener.errors), modules: listener.modules, sourceMap: listener.sourceMap }
}

/**
 * Phase 2 of the Quint parser. Go over each declaration of the form
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
  Array.from(mainPhase1Result.modules)
    .reverse()
    .forEach(m => moduleRank.set(m.name, maxModuleRank++))
  while (worklist.length > 0) {
    const [importer, pathTrail] = worklist.splice(0, 1)[0]
    for (const decl of importer.declarations) {
      if ((decl.kind === 'import' || decl.kind === 'instance') && decl.fromSource) {
        const importerPath = pathTrail[pathTrail.length - 1]
        const stemPath = sourceResolver.stempath(importerPath)
        const importeePath = sourceResolver.lookupPath(stemPath, decl.fromSource + '.qnt')
        // check for import cycles
        if (pathTrail.find(p => p.normalizedPath === importeePath.normalizedPath)) {
          // found a cyclic dependency
          const cycle = pathTrail
            .concat([importeePath])
            .map(p => `'${p.toSourceName()}'`)
            .join(' imports ')
          const err: QuintError = {
            code: 'QNT098',
            message: `Cyclic imports: ${cycle}`,
            reference: decl.id,
          }
          return { ...mainPhase1Result, errors: mainPhase1Result.errors.concat([err]), sourceMap }
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
          const err: QuintError = {
            code: 'QNT013',
            message: `import ... from '${decl.fromSource}': could not load`,
            reference: decl.id,
          }
          return { ...mainPhase1Result, errors: mainPhase1Result.errors.concat([err]), sourceMap }
        }
        // try to parse the source code
        const parseResult = parsePhase1fromText(idGen, errorOrText.value, importeePath.toSourceName())
        // all good: add the new modules to the worklist, and update the source map
        const newModules = Array.from(parseResult.modules).reverse()
        newModules.forEach(m => {
          worklist.push([m, pathTrail.concat([importeePath])])
        })
        sourceToModules.set(importeePath.normalizedPath, newModules)
        newModules.forEach(m => moduleRank.set(m.name, maxModuleRank++))
        sourceMap = new Map([...sourceMap, ...parseResult.sourceMap])
      }
    }
  }

  // Get all the modules and sort them according to the rank (the higher, the earlier)
  let allModules: QuintModule[] = []
  for (const mods of sourceToModules.values()) {
    allModules = allModules.concat(mods)
  }
  allModules.sort((m1, m2) => moduleRank.get(m2.name)! - moduleRank.get(m1.name)!)
  return { ...mainPhase1Result, modules: allModules, sourceMap }
}

/**
 * Phase 3 of the Quint parser. Assuming that all external sources have been resolved,
 * resolve imports and names. Read the IR and check that all names are defined.
 * Note that the IR may be ill-typed.
 */
export function parsePhase3importAndNameResolution(phase2Data: ParserPhase2): ParseResult<ParserPhase3> {
  const result = resolveNames(phase2Data.modules)
  return { ...phase2Data, ...result, errors: phase2Data.errors.concat(result.errors) }
}

/**
 * Phase 4 of the Quint parser. Sort all declarations in the topologocal order,
 * that is, every name should be defined before it is used.
 */
export function parsePhase4toposort(phase3Data: ParserPhase3): ParseResult<ParserPhase4> {
  // topologically sort all declarations in each module
  const context = mkCallGraphContext(phase3Data.modules)
  const errors = phase3Data.errors
  const modules = phase3Data.modules.map(mod => {
    const visitor = new CallGraphVisitor(phase3Data.table, context)
    walkModule(visitor, mod)
    const result = toposort(visitor.graph, mod.declarations)

    errors.push(
      ...result.cycles.toArray().map((id): QuintError => {
        return {
          code: 'QNT099',
          message: 'Found cyclic declarations. Use fold and foldl instead of recursion',
          reference: id,
        }
      })
    )

    return { ...mod, declarations: result.sorted }
  })

  return { ...phase3Data, modules, errors }
}

export function compactSourceMap(sourceMap: SourceMap): { sourceIndex: any; map: any } {
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

/**
 * Parses a Quint code string and returns a `ParseResult` containing the result of all three parsing phases.
 *
 * @param idGen An `IdGenerator` instance to generate unique IDs for parsed elements.
 * @param sourceLocation A string describing the source location of the code being parsed.
 * @param mainPath The main source lookup path for resolving imports.
 * @param code The Quint code string to parse.
 * @param sourceCode Optionally a map of previously parsed files, to be updated by this function
 * @returns A `ParseResult` containing the result of all three parsing phases.
 */
export function parse(
  idGen: IdGenerator,
  sourceLocation: string,
  mainPath: SourceLookupPath,
  code: string,
  sourceCode: Map<string, string> = new Map()
): ParseResult<ParserPhase4> {
  return flow([
    () => parsePhase1fromText(idGen, code, sourceLocation),
    phase1Data => {
      const resolver = fileSourceResolver(sourceCode)
      return parsePhase2sourceResolution(idGen, resolver, mainPath, phase1Data)
    },
    parsePhase3importAndNameResolution,
    parsePhase4toposort,
  ])()
}

export function parseDefOrThrow(text: string, idGen?: IdGenerator, sourceMap?: SourceMap): QuintDef {
  const result = parseExpressionOrDeclaration(text, '<builtins>', idGen ?? newIdGenerator(), sourceMap ?? new Map())
  if (result.kind === 'declaration' && isDef(result.decl)) {
    return result.decl
  } else {
    const msg = result.kind === 'error' ? result.errors.join('\n') : `Expected a definition, got ${result.kind}`
    throw new Error(`${msg}, parsing ${text}`)
  }
}

// setup a Quint parser, so it can be used to parse from various non-terminals
function setupParser(
  text: string,
  sourceLocation: string,
  errors: QuintError[],
  sourceMap: SourceMap,
  idGen: IdGenerator
): p.QuintParser {
  // error listener to report lexical and syntax errors
  const errorListener: any = {
    syntaxError: (_recognizer: any, offendingSymbol: any, line: number, charPositionInLine: number, msg: string) => {
      const id = idGen.nextId()
      const len = offendingSymbol ? offendingSymbol.stopIndex - offendingSymbol.startIndex : 0
      const index = offendingSymbol ? offendingSymbol.startIndex : 0
      const start = { line: line - 1, col: charPositionInLine, index }
      const end = { line: line - 1, col: charPositionInLine + len, index: index + len }
      const loc: Loc = { source: sourceLocation, start, end }
      sourceMap.set(id, loc)

      const code = (msg.match(/QNT\d\d\d/)?.[0] as ErrorCode) ?? 'QNT000'

      errors.push({ code, message: msg.replace(`[${code}] `, ''), reference: id })
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

// A simple listener to parse a declaration or expression
class ExpressionOrDeclarationListener extends ToIrListener {
  result?: ExpressionOrDeclarationParseResult

  exitDeclarationOrExpr(ctx: p.DeclarationOrExprContext) {
    if (ctx.declaration()) {
      const decl = this.declarationStack[this.declarationStack.length - 1]
      this.result = { kind: 'declaration', decl }
    } else if (ctx.expr()) {
      const expr = this.exprStack[this.exprStack.length - 1]
      this.result = { kind: 'expr', expr }
    } else {
      this.result = { kind: 'none' }
    }
  }
}
