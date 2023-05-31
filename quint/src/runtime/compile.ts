/*
 * A compiler to the runtime environment.
 *
 * Igor Konnov, Informal Systems, 2022-2023
 *
 * Copyright (c) Informal Systems 2022-2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import { Either, left, right } from '@sweet-monads/either'
import {
  ErrorMessage,
  Loc,
  fromIrErrorMessage,
  parse,
  parsePhase3importAndNameResolution,
} from '../quintParserFrontend'
import { Computable, ComputableKind, kindName } from './runtime'
import { ExecutionListener } from './trace'
import { QuintDef, QuintEx, QuintModule } from '../quintIr'
import { CompilerVisitor } from './impl/compilerImpl'
import { walkDefinition } from '../IRVisitor'
import { LookupTable } from '../lookupTable'
import { AnalysisOutput, analyzeInc, analyzeModules } from '../quintAnalyzer'
import { mkErrorMessage } from '../cliCommands'
import { IdGenerator } from '../idGenerator'
import { SourceLookupPath } from '../sourceResolver'
import { flattenModules } from '../flattening'
import { Rng } from '../rng'

/**
 * The name of the shadow variable that stores the last found trace.
 */
export const lastTraceName = 'q::lastTrace'

/**
 * A compilation context returned by 'compile'.
 */
export interface CompilationContext {
  // The main module, when present
  main?: QuintModule
  // the lookup table to query for values and definitions
  lookupTable: LookupTable
  // names of the variables and definition identifiers mapped to computables
  values: Map<string, Computable>
  // names of the variables
  vars: string[]
  // names of the shadow variables, internal to the simulator
  shadowVars: string[]
  // messages that are produced during parsing
  syntaxErrors: ErrorMessage[]
  // messages that are produced by static analysis
  analysisErrors: ErrorMessage[]
  // messages that are produced during compilation
  compileErrors: ErrorMessage[]
  // messages that get populated as the compiled code is executed
  getRuntimeErrors: () => ErrorMessage[]
  // source mapping
  sourceMap: Map<bigint, Loc>,
  flattenedModules?: QuintModule[],
  analysisOutput?: AnalysisOutput,
}

export interface CompilationState {
  // generator of unique identifiers
  idGen: IdGenerator
  // Quint analyzer (for incremental static analysis)
  modules: QuintModule[]
  sourceMap: Map<bigint, Loc>
  analysisOutput?: AnalysisOutput
}

export function errorContextFromMessage(errors: ErrorMessage[]): CompilationContext {
  return {
    lookupTable: new Map(),
    values: new Map(),
    vars: [],
    shadowVars: [],
    syntaxErrors: errors,
    analysisErrors: [],
    compileErrors: [],
    getRuntimeErrors: () => [],
    sourceMap: new Map(),
  }
}

/**
 * Extract a compiled value of a specific kind via the module name and kind.
 *
 * @param ctx compilation context
 * @param defId the definition id to lookup
 * @param kind definition kind
 * @returns the associated compiled value, if it uniquely defined, or undefined
 */
export function contextLookup(
  ctx: CompilationContext,
  defId: bigint,
  kind: ComputableKind
): Either<string, Computable> {
  const def = ctx.lookupTable.get(defId)
  if (!def) {
    return left(`Definition for id ${defId} not found`)
  }

  const value = ctx.values.get(kindName(kind, def.reference!))
  if (!value) {
    console.log(`key = ${kindName(kind, def.reference!)}`)
    return left(`No value for definition ${defId}}`)
  } else {
    return right(value)
  }
}

export function contextNameLookup(
  ctx: CompilationContext,
  defName: string,
  kind: ComputableKind
): Either<string, Computable> {
  const value = ctx.values.get(kindName(kind, defName))
  if (!value) {
    console.log(`key = ${kindName(kind, defName)}`)
    return left(`No value for definition ${defName}}`)
  } else {
    return right(value)
  }
}

/**
 * Compile Quint modules to JS runtime objects from the parsed and type-checked
 * data structures. This is a user-facing function. In case of an error, the
 * error messages are passed to an error handler and the function returns
 * undefined.
 *
 * @param modules Quint modules in the intermediate representation
 * @param sourceMap source map as produced by the parser
 * @param lookupTable lookup table as produced by the parser
 * @param analysisOutput the maps produced by the static analysis
 * @param mainName the name of the module that may contain state varibles
 * @param execListener execution listener
 * @param rand the random number generator
 * @returns the compilation context
 */
export function compile(
  modules: QuintModule[],
  sourceMap: Map<bigint, Loc>,
  lookupTable: LookupTable,
  analysisOutput: AnalysisOutput,
  mainName: string,
  execListener: ExecutionListener,
  rand: (bound: bigint) => bigint,
): CompilationContext {
  const main = modules.find(m => m.name === mainName)

  const visitor = new CompilerVisitor(lookupTable, analysisOutput.types, rand, execListener)
  if (main) {
    main.defs.forEach(def => walkDefinition(visitor, def))
  }
  // when the main module is not found, we will report an error
  const mainNotFoundError = main
    ? []
    : [
      {
        explanation: `Main module ${mainName} not found`,
        refs: [],
      },
    ]
  return {
    main,
    lookupTable,
    values: visitor.getContext(),
    vars: visitor.getVars(),
    shadowVars: visitor.getShadowVars(),
    syntaxErrors: [],
    analysisErrors: [],
    compileErrors: visitor.getCompileErrors().concat(mainNotFoundError).map(fromIrErrorMessage(sourceMap)),
    getRuntimeErrors: () => {
      return visitor.getRuntimeErrors().splice(0).map(fromIrErrorMessage(sourceMap))
    },
    sourceMap: sourceMap,
    // The analysis output will be used in subsequent compilations.
    // It might seem like the object was not changed by this function, but it was, since
    // flattening updates the internal maps.
    analysisOutput: analysisOutput,
  }
}

export function compileExpr(state: CompilationState, rng: Rng, recorder: any, expr: QuintEx): CompilationContext {
  // Create a definition to encapsulate the parsed expression.
  const def: QuintDef = { kind: 'def', qualifier: 'action', name: 'q::input', expr, id: state.idGen.nextId() }

  // Define a new module list with the new definition in the last module,
  // ensuring the original object is not modified
  const modules = [...state.modules]
  const lastModule = modules.pop()
  if (lastModule) {
    modules.push({ ...lastModule, defs: [...lastModule.defs, def] })
  }

  // We need to resolve names for this new definition. Incremental name
  // resolution is not our focus now, so just resolve everything again.
  const lookupTable = parsePhase3importAndNameResolution({ modules, sourceMap: state.sourceMap })
    .mapLeft(errors => {
      // TODO: Properly report these errors
      throw new Error(`Error on resolving names: ${errors.map(e => e.explanation)}`)
    })
    .unwrap().table

  if (!state.analysisOutput) {
    throw new Error('No analysis output in state')
  }

  const [analysisErrors, analysisOutput] = analyzeInc(state.analysisOutput, lookupTable, def)

  // TODO: Properly report these errors.
  if (analysisErrors.length > 0) {
    console.log(analysisErrors)
    throw new Error(`Error on analysis: ${analysisErrors.map(([_, e]) => e.message)}`)
  }

  return compile(modules, state.sourceMap, lookupTable, analysisOutput, '__repl__', recorder, rng.next)
}

/**
 * Parse a string that contains Quint modules and compile it to executable
 * objects. This is a user-facing function. In case of an error, the error
 * messages are passed to an error handler and the function returns undefined.
 *
 * @param code text that stores one or several Quint modules,
 *        which should be parseable without any context
 * @param mainName the name of the module that may contain state varibles
 * @param execListener execution listener
 * @param rand the random number generator
 * @returns the compilation context
 */
export function compileFromCode(
  idGen: IdGenerator,
  code: string,
  mainName: string,
  mainPath: SourceLookupPath,
  execListener: ExecutionListener,
  rand: (bound: bigint) => bigint,
): CompilationContext {
  // parse the module text
  return (
    parse(idGen, '<input>', mainPath, code)
      // On errors, we'll produce the computational context up to this point
      .mapLeft(errorContextFromMessage)
      .chain(
        parseData => {
          const { modules, table, sourceMap } = parseData
          const [analysisErrors, analysisOutput] = analyzeModules(table, modules)

          const { flattenedModules, flattenedTable, flattenedAnalysis } = flattenModules(
            modules,
            table,
            idGen,
            sourceMap,
            analysisOutput
          )

          const ctx = compile(
            flattenedModules,
            sourceMap,
            flattenedTable,
            flattenedAnalysis,
            mainName,
            execListener,
            rand
          )
          const errorLocator = mkErrorMessage(sourceMap)
          return right({
            ...ctx,
            analysisErrors: Array.from(analysisErrors, errorLocator),
          })
        }
        // we produce CompilationContext in any case
      ).value
  )
}
