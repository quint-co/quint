/*
 * A compiler to the runtime environment.
 *
 * Igor Konnov, Informal Systems, 2022-2023
 *
 * Copyright 2022-2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 */

import { Either, left, right } from '@sweet-monads/either'
import { SourceMap, parse, parsePhase3importAndNameResolution } from '../parsing/quintParserFrontend'
import { Computable, ComputableKind, kindName } from './runtime'
import { ExecutionListener } from './trace'
import { FlatModule, QuintDeclaration, QuintDef, QuintEx, QuintModule } from '../ir/quintIr'
import { CompilerVisitor, EvaluationState, newEvaluationState } from './impl/compilerImpl'
import { walkDefinition } from '../ir/IRVisitor'
import { LookupTable } from '../names/base'
import { AnalysisOutput, analyzeInc, analyzeModules } from '../quintAnalyzer'
import { IdGenerator, newIdGenerator } from '../idGenerator'
import { SourceLookupPath } from '../parsing/sourceResolver'
import { Rng } from '../rng'
import { flattenModules } from '../flattening/fullFlattener'
import { QuintError } from '../quintError'

/**
 * The name of the builtin name that returns the last found trace.
 */
export const lastTraceName = 'q::lastTrace'

/**
 * The name of a definition that wraps the user input, e.g., in REPL.
 */
export const inputDefName: string = 'q::input'

/**
 * A compilation context returned by 'compile'.
 */
export interface CompilationContext {
  // the lookup table to query for values and definitions
  lookupTable: LookupTable
  // messages that are produced during parsing
  syntaxErrors: QuintError[]
  // messages that are produced by static analysis
  analysisErrors: QuintError[]
  // messages that are produced during compilation
  compileErrors: QuintError[]
  // messages that get populated as the compiled code is executed
  getRuntimeErrors: () => QuintError[]
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
  // File content loaded for each source, used to report errors
  sourceCode: Map<string, string>
  // A list of modules as they are constructed, without flattening. This is
  // needed to derive correct name resolution during incremental compilation in
  // a flattened context.
  originalModules: QuintModule[]
  // A list of flattened modules.
  modules: FlatModule[]
  // The name of the main module.
  mainName?: string
  // The source map for the compiled code.
  sourceMap: SourceMap
  // The output of the Quint analyzer.
  analysisOutput: AnalysisOutput
}

/* An empty initial compilation state */
export function newCompilationState(): CompilationState {
  return {
    idGen: newIdGenerator(),
    sourceCode: new Map(),
    originalModules: [],
    modules: [],
    sourceMap: new Map(),
    analysisOutput: {
      types: new Map(),
      effects: new Map(),
      modes: new Map(),
    },
  }
}

export function errorContextFromMessage(
  listener: ExecutionListener
): (_: { errors: QuintError[]; sourceMap: SourceMap }) => CompilationContext {
  const evaluationState = newEvaluationState(listener)
  return ({ errors, sourceMap }) => {
    return {
      lookupTable: new Map(),
      syntaxErrors: errors,
      analysisErrors: [],
      compileErrors: [],
      getRuntimeErrors: () => [],
      compilationState: { ...newCompilationState(), sourceMap },
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
 * Compile Quint defs to JS runtime objects from the parsed and type-checked
 * data structures. This is a user-facing function. In case of an error, the
 * error messages are passed to an error handler and the function returns
 * undefined.
 *
 * @param compilationState the state of the compilation process
 * @param evaluationState the state of the compiler visitor
 * @param lookupTable lookup table as produced by the parser
 * @param rand the random number generator
 * @param defs the definitions to compile
 * @returns the compilation context
 */
export function compile(
  compilationState: CompilationState,
  evaluationState: EvaluationState,
  lookupTable: LookupTable,
  rand: (bound: bigint) => bigint,
  defs: QuintDef[]
): CompilationContext {
  const visitor = new CompilerVisitor(lookupTable, rand, evaluationState)

  defs.forEach(def => walkDefinition(visitor, def))

  return {
    lookupTable,
    syntaxErrors: [],
    analysisErrors: [],
    compileErrors: visitor.getCompileErrors(),
    getRuntimeErrors: () => {
      return visitor.getRuntimeErrors().splice(0)
    },
    compilationState,
    evaluationState: visitor.evaluationState,
  }
}

/**
 * Compile a single Quint expression, given a non-empty compilation and
 * evaluation state. That is, those states should have the results of the
 * compilation of at least one module.
 *
 * @param state - The current compilation state
 * @param evaluationState - The current evaluation state
 * @param rng - The random number generator
 * @param expr - The Quint exporession to be compiled
 *
 * @returns A compilation context with the compiled expression or its errors
 */
export function compileExpr(
  state: CompilationState,
  evaluationState: EvaluationState,
  rng: Rng,
  expr: QuintEx
): CompilationContext {
  // Create a definition to encapsulate the parsed expression.
  // Note that the expression may contain nested definitions.
  // Hence, we have to compile it via an auxilliary definition.
  const def: QuintDef = { kind: 'def', qualifier: 'action', name: inputDefName, expr, id: state.idGen.nextId() }

  return compileDecls(state, evaluationState, rng, [def])
}

/**
 * Compile a single Quint definition, given a non-empty compilation and
 * evaluation state. That is, those states should have the results of the
 * compilation of at least one module.
 *
 * @param state - The current compilation state
 * @param evaluationState - The current evaluation state
 * @param rng - The random number generator
 * @param decls - The Quint declarations to be compiled
 *
 * @returns A compilation context with the compiled definition or its errors
 */
export function compileDecls(
  state: CompilationState,
  evaluationState: EvaluationState,
  rng: Rng,
  decls: QuintDeclaration[]
): CompilationContext {
  if (state.originalModules.length === 0 || state.modules.length === 0) {
    throw new Error('No modules in state')
  }

  // Define a new module list with the new definition in the main module,
  // ensuring the original object is not modified
  const originalModules = state.originalModules.map(m => {
    if (m.name === state.mainName) {
      return { ...m, declarations: [...m.declarations, ...decls] }
    }
    return m
  })

  const mainModule = state.modules.find(m => m.name === state.mainName)!

  // We need to resolve names for this new definition. Incremental name
  // resolution is not our focus now, so just resolve everything again.
  const { table, errors } = parsePhase3importAndNameResolution({
    modules: originalModules,
    sourceMap: state.sourceMap,
    errors: [],
  })

  if (errors.length > 0) {
    // For now, don't try to run analysis and flattening if there are errors
    return errorContextFromMessage(evaluationState.listener)({ errors, sourceMap: state.sourceMap })
  }

  const [analysisErrors, analysisOutput] = analyzeInc(state.analysisOutput, table, decls)

  const {
    flattenedModules: flatModules,
    flattenedTable,
    flattenedAnalysis,
  } = flattenModules(originalModules, table, state.idGen, state.sourceMap, analysisOutput)

  const newState = {
    ...state,
    analysisOutput: flattenedAnalysis,
    modules: flatModules,
    originalModules: originalModules,
  }

  const flatDefinitions = flatModules.find(m => m.name === state.mainName)!.declarations

  // Filter definitions that were not compiled yet
  const defsToCompile = flatDefinitions.filter(d => !mainModule.declarations.some(d2 => d2.id === d.id))

  const ctx = compile(newState, evaluationState, flattenedTable, rng.next, defsToCompile)

  return { ...ctx, analysisErrors }
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
  // FIXME(#1052): We should build a proper sourceCode map from the files we previously loaded
  const sourceCode: Map<string, string> = new Map()
  const { modules, table, sourceMap, errors } = parse(idGen, mainPath.toSourceName(), mainPath, code, sourceCode)
  // On errors, we'll produce the computational context up to this point
  const [analysisErrors, analysisOutput] = analyzeModules(table, modules)

  const { flattenedModules, flattenedTable, flattenedAnalysis } = flattenModules(
    modules,
    table,
    idGen,
    sourceMap,
    analysisOutput
  )
  const compilationState: CompilationState = {
    originalModules: modules,
    modules: flattenedModules,
    mainName,
    sourceMap,
    analysisOutput: flattenedAnalysis,
    idGen,
    sourceCode,
  }

  const main = flattenedModules.find(m => m.name === mainName)
  // when the main module is not found, we will report an error
  const mainNotFoundError: QuintError[] = main
    ? []
    : [
        {
          code: 'QNT405',
          message: `Main module ${mainName} not found`,
        },
      ]
  const defsToCompile = main ? main.declarations : []
  const ctx = compile(compilationState, newEvaluationState(execListener), flattenedTable, rand, defsToCompile)

  return {
    ...ctx,
    compileErrors: ctx.compileErrors.concat(mainNotFoundError),
    analysisErrors,
    syntaxErrors: errors,
  }
}
