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
import { Map as ImmutMap, Set as ImmutSet } from 'immutable'

import { QuintLexer } from '../generated/QuintLexer'
import * as p from '../generated/QuintParser'
import { QuintListener } from '../generated/QuintListener'

import { QuintDeclaration, QuintDef, QuintEx, QuintModule, isDef } from '../ir/quintIr'
import { IdGenerator, newIdGenerator } from '../idGenerator'
import { ToIrListener } from './ToIrListener'
import { LookupTable, UnusedDefinitions } from '../names/base'
import { NameResolver, resolveNames } from '../names/resolver'
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
  resolver: NameResolver
}

/**
 * Phase 4: Topological sort of declarations and cycle detection.
 */
export interface ParserPhase4 extends ParserPhase3 {}

/**
 * The result of parsing an expression or collection of declarations.
 */
export type ExpressionOrDeclarationParseResult =
  | { kind: 'declaration'; decls: QuintDeclaration[] }
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
    console.debug(`[DEBUG] ignoring listener exception in favor of parse errors. Exception: ${e}`)
    // ignore the exception, we already have errors to report.
    //
    // This happens in a situation where the first part of parsing (constructing
    // the AST) has finished with errors, but we still want to try and build an
    // IR out of it in order to collect as many errors as we can (from this and subsequent
    // phases). So, we try to proceed, but it's fine if it doesn't work out.
    //
    // It is safe to ignore errors here because, normally, we wouldn't even run
    // this code after parse failures. However, if we want to run subsequent
    // phases on top of the generated IR, it is important to consider that it is
    // only a partial result and might have undefined components or be incomplete.
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
  // We accumulate the source map over all files here.
  let sourceMap = new Map(mainPhase1Result.sourceMap)

  // The list of modules that have not been processed yet.  Each element of
  // the list carries the module to be processed and the trail of sources that
  // led to this module.  The construction is similar to the worklist algorithm:
  // https://en.wikipedia.org/wiki/Reaching_definition#Worklist_algorithm
  const worklist: [QuintModule, SourceLookupPath[]][] = mainPhase1Result.modules.map(m => [m, [mainPath]])
  // Collect modules produced by every source.
  const sourceToModules = new Map<string, QuintModule[]>()
  // Collect visited paths, so we don't have to load the same file twice.
  // Some filesystems are case-insensitive, whereas some are case sensitive.
  // To prevent errors like #1194 from happening, we store both the
  // original filename and its lower case version. If the user uses the same
  // filename in different registers, we report an error. Otherwise, it would be
  // quite hard to figure out tricky naming errors in the case-sensitive
  // filesystems.  We could also collect hashes of the files instead of
  // lowercase filenames, but this looks a bit like overkill at the moment.
  const visitedPaths = new Map<string, string>()
  // Assign a rank to every module. The higher the rank,
  // the earlier the module should appear in the list of modules.
  sourceToModules.set(mainPath.normalizedPath, mainPhase1Result.modules)
  visitedPaths.set(mainPath.normalizedPath.toLocaleLowerCase(), mainPath.normalizedPath)
  while (worklist.length > 0) {
    const [importer, pathTrail] = worklist.splice(0, 1)[0]
    for (const decl of importer.declarations) {
      if ((decl.kind === 'import' || decl.kind === 'instance') && decl.fromSource) {
        const importerPath = pathTrail[pathTrail.length - 1]
        const stemPath = sourceResolver.stempath(importerPath)
        const importeePath = sourceResolver.lookupPath(stemPath, decl.fromSource + '.qnt')
        const importeeNormalized = importeePath.normalizedPath
        const importeeLowerCase = importeeNormalized.toLowerCase()
        if (visitedPaths.has(importeeLowerCase)) {
          if (visitedPaths.get(importeeLowerCase) === importeeNormalized) {
            // simply skip this import without parsing the same file twice
            continue
          } else {
            // The source has been parsed already, but:
            //  - Either the same file is imported via paths in different cases, or
            //  - Two different files are imported via case-sensitive paths.
            // Ask the user to disambiguate.
            const original =
              [...visitedPaths.values()].find(
                name => name.toLowerCase() === importeeLowerCase && name !== importeeLowerCase
              ) ?? importeeLowerCase
            const err: QuintError = {
              code: 'QNT408',
              message: `Importing two files that only differ in case: ${original} vs. ${importeeNormalized}. Choose one way.`,
              reference: decl.id,
            }
            return { ...mainPhase1Result, errors: mainPhase1Result.errors.concat([err]), sourceMap }
          }
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
        visitedPaths.set(importeeLowerCase, importeeNormalized)
        sourceMap = new Map([...sourceMap, ...parseResult.sourceMap])
      }
    }
  }

  // Get all the modules and sort them according to the rank (the higher, the earlier)
  let allModules: QuintModule[] = []
  for (const mods of sourceToModules.values()) {
    allModules = allModules.concat(mods)
  }
  // sort the modules
  const sortingResult = sortModules(allModules)

  return {
    ...mainPhase1Result,
    errors: mainPhase1Result.errors.concat(sortingResult.errors),
    modules: sortingResult.modules,
    sourceMap,
  }
}

/**
 * Sort modules according to their imports, that is, importees should appear before importers.
 * @param modules the modules to sort
 * @return a structure that contains errors (if any were found) and the modules (sorted if no errors)
 */
function sortModules(modules: QuintModule[]): { errors: QuintError[]; modules: QuintModule[] } {
  // iterate over the modules to construct:
  //  - the map from module identifiers to modules
  //  - the map from module names to modules
  //  - the set of modules with duplicate names, if there are any
  const [idToModule, nameToModule, duplicates] = modules.reduce(
    ([idMap, namesMap, dups], mod) => {
      const newIdMap = idMap.set(mod.id, mod)
      const newNamesMap = namesMap.set(mod.name, mod)
      const newDups = namesMap.has(mod.name) ? dups.add(mod) : dups
      return [newIdMap, newNamesMap, newDups]
    },
    [ImmutMap<bigint, QuintModule>(), ImmutMap<string, QuintModule>(), ImmutSet<QuintModule>()]
  )

  if (!duplicates.isEmpty()) {
    const errors: QuintError[] = duplicates.toArray().map(mod => {
      return {
        code: 'QNT101',
        message: `Multiple modules conflict on the same name: ${mod.name}`,
        reference: mod.id,
      }
    })
    return { errors, modules }
  }

  // create the import graph
  let edges = ImmutMap<bigint, ImmutSet<bigint>>()
  for (const mod of modules) {
    let imports = ImmutSet<bigint>()
    for (const decl of mod.declarations) {
      // We only keep track of imports and instances, but not of the exports:
      //  - Exports flow in the opposite direction of imports.
      //  - An export cannot be used without a corresponding import.
      if (decl.kind === 'import' || decl.kind === 'instance') {
        if (!nameToModule.has(decl.protoName)) {
          const err: QuintError = {
            code: 'QNT405',
            message: `Module ${mod.name} imports an unknown module ${decl.protoName}`,
            reference: decl.id,
          }
          return { errors: [err], modules }
        }
        imports = imports.add(nameToModule.get(decl.protoName)!.id)
      }
      // add all imports as the edges from mod
      edges = edges.set(mod.id, imports)
    }
  }
  // sort the modules with toposort
  const result = toposort(edges, modules)
  if (result.cycles.isEmpty()) {
    return { errors: [], modules: result.sorted }
  } else {
    // note that the modules in the cycle are not always sorted according to the imports
    const cycle = result.cycles.map(id => idToModule.get(id)?.name).join(', ')
    const err: QuintError = {
      code: 'QNT098',
      message: `Cyclic imports among: ${cycle}`,
      reference: result.cycles.first(),
    }

    return { errors: [err], modules }
  }
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

  // Initialized two structures to be outputted
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
  if (result.kind === 'declaration' && isDef(result.decls[0])) {
    return result.decls[0]
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
      const prevDecls = this.result?.kind === 'declaration' ? this.result.decls : []
      const decls = this.declarationStack
      this.result = { kind: 'declaration', decls: [...prevDecls, ...decls] }
    } else if (ctx.expr()) {
      const expr = this.exprStack[this.exprStack.length - 1]
      this.result = { kind: 'expr', expr }
    } else {
      this.result = { kind: 'none' }
    }
  }
}
