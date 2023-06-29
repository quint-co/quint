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
} from '../parsing/quintParserFrontend'
import { Computable, ComputableKind, kindName } from './runtime'
import { ExecutionListener } from './trace'
import { FlatDef, FlatModule, IrErrorMessage, QuintDef, QuintEx, QuintModule } from '../quintIr'
import { CompilerVisitor, EvaluationState, newEvaluationState } from './impl/compilerImpl'
import { walkDefinition } from '../IRVisitor'
import { LookupTable } from '../names/lookupTable'
import { AnalysisOutput, analyzeInc, analyzeModules } from '../quintAnalyzer'
import { mkErrorMessage } from '../cliCommands'
import { IdGenerator, newIdGenerator } from '../idGenerator'
import { SourceLookupPath } from '../parsing/sourceResolver'
import { addDefToFlatModule, flattenModules } from '../flattening'
import { Rng } from '../rng'

/**
 * The name of the shadow variable that stores the last found trace.
 */
export const lastTraceName = 'q::lastTrace'

/**
 * A compilation context returned by 'compile'.
 */
export interface CompilationContext {
  // the lookup table to query for values and definitions
  lookupTable: LookupTable
  // messages that are produced during parsing
  syntaxErrors: ErrorMessage[]
  // messages that are produced by static analysis
  analysisErrors: ErrorMessage[]
  // messages that are produced during compilation
  compileErrors: ErrorMessage[]
  // messages that get populated as the compiled code is executed
  getRuntimeErrors: () => ErrorMessage[]
  // The state of pre-compilation phases.
  compilationState: CompilationState
  // The state of the compiler visitor.
  evaluationState: EvaluationState
}

/**
 * A data structure that holds the state of the compilation process.
 */
export interface CompilationState {
  // The ID generator used during compilation.
  idGen: IdGenerator
  // A list of flattened modules.
  modules: FlatModule[]
  // The source map for the compiled code.
  sourceMap: Map<bigint, Loc>
  // The output of the Quint analyzer.
  analysisOutput: AnalysisOutput
}

/* An empty initial compilation state */
export function newCompilationState(): CompilationState {
  return {
    idGen: newIdGenerator(),
    modules: [],
    sourceMap: new Map(),
    analysisOutput: {
      types: new Map(),
      effects: new Map(),
      modes: new Map(),
    },
  }
}

export function errorContextFromMessage(listener: ExecutionListener): (errors: ErrorMessage[]) => CompilationContext {
  const compilationState = newCompilationState()
  const evaluationState = newEvaluationState(listener)
  return (errs: ErrorMessage[]) => {
    return {
      lookupTable: new Map(),
      syntaxErrors: errs,
      analysisErrors: [],
      compileErrors: [],
      getRuntimeErrors: () => [],
      compilationState,
      evaluationState,
    }
  }
}

export function contextNameLookup(
  context: Map<string, Computable>,
  defName: string,
  kind: ComputableKind
): Either<string, Computable> {
  const value = context.get(kindName(kind, defName))
  if (!value) {
    console.log(`key = ${kindName(kind, defName)}`)
    return left(`No value for definition ${defName}`)
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
  compilationState: CompilationState,
  evaluationState: EvaluationState,
  lookupTable: LookupTable,
  rand: (bound: bigint) => bigint,
  defs: FlatDef[]
): CompilationContext {
  const { sourceMap, analysisOutput } = compilationState

  const visitor = new CompilerVisitor(lookupTable, analysisOutput.types, rand, evaluationState)

  defs.forEach(def => walkDefinition(visitor, def))

  return {
    lookupTable,
    syntaxErrors: [],
    analysisErrors: [],
    compileErrors: visitor.getCompileErrors().map(fromIrErrorMessage(sourceMap)),
    getRuntimeErrors: () => {
      return visitor.getRuntimeErrors().splice(0).map(fromIrErrorMessage(sourceMap))
    },
    compilationState,
    evaluationState: visitor.getEvaluationState(),
  }
}

export function compileExpr(
  state: CompilationState,
  evaluationState: EvaluationState,
  rng: Rng,
  expr: QuintEx
): CompilationContext {
  // Create a definition to encapsulate the parsed expression.
  // Note that the expression may contain nested definitions.
  // Hence, we have to compile it via an auxilliary definition.
  const def: QuintDef = { kind: 'def', qualifier: 'action', name: 'q::input', expr, id: state.idGen.nextId() }

  return compileDef(state, evaluationState, rng, def)
}

export function compileDef(
  state: CompilationState,
  evaluationState: EvaluationState,
  rng: Rng,
  def: QuintDef
): CompilationContext {
  // Define a new module list with the new definition in the last module,
  // ensuring the original object is not modified
  const modules: QuintModule[] = [...state.modules] // Those are flat, but introducing `def` might make them non-flat
  const lastModule: FlatModule = state.modules[state.modules.length - 1] // This is not modules.pop() to ensure flatness
  if (!lastModule) {
    throw new Error('No modules in state')
  }
  modules.pop()
  modules.push({ ...lastModule, defs: [...lastModule.defs, def] })

  // We need to resolve names for this new definition. Incremental name
  // resolution is not our focus now, so just resolve everything again.
  return parsePhase3importAndNameResolution({ modules: modules, sourceMap: state.sourceMap })
    .mapLeft(errorContextFromMessage(evaluationState.listener))
    .map(({ table }) => {
      const [analysisErrors, analysisOutput] = analyzeInc(state.analysisOutput, table, def)

      const { flattenedModule, flattenedDefs, flattenedTable, flattenedAnalysis } = addDefToFlatModule(
        modules,
        table,
        state.idGen,
        state.sourceMap,
        analysisOutput,
        lastModule,
        def
      )

      const flatModules: FlatModule[] = [...state.modules]
      flatModules.pop()
      flatModules.push(flattenedModule)

      const newState = { ...state, analysisOutput: flattenedAnalysis, modules: flatModules }
      const ctx = compile(newState, evaluationState, flattenedTable, rng.next, flattenedDefs)

      const errorLocator = mkErrorMessage(state.sourceMap)
      return {
        ...ctx,
        analysisErrors: Array.from(analysisErrors, errorLocator),
      }
    }).value // We produce a compilation context in any case
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
  rand: (bound: bigint) => bigint
): CompilationContext {
  // parse the module text
  return (
    parse(idGen, '<module_input>', mainPath, code)
      // On errors, we'll produce the computational context up to this point
      .mapLeft(errorContextFromMessage(execListener))
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
          const compilationState: CompilationState = {
            modules: flattenedModules,
            sourceMap,
            analysisOutput: flattenedAnalysis,
            idGen,
          }

          const main = flattenedModules.find(m => m.name === mainName)
          // when the main module is not found, we will report an error
          const mainNotFoundError: IrErrorMessage[] = main
            ? []
            : [
                {
                  explanation: `Main module ${mainName} not found`,
                  refs: [],
                },
              ]
          const defsToCompile = main ? main.defs : []
          const ctx = compile(compilationState, newEvaluationState(execListener), flattenedTable, rand, defsToCompile)

          const errorLocator = mkErrorMessage(sourceMap)
          return right({
            ...ctx,
            compileErrors: ctx.compileErrors.concat(mainNotFoundError.map(fromIrErrorMessage(sourceMap))),
            analysisErrors: Array.from(analysisErrors, errorLocator),
          })
        }
        // we produce CompilationContext in any case
      ).value
  )
}
