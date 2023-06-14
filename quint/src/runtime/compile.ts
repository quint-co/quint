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
import { FlatModule, QuintDef, QuintEx, QuintModule } from '../quintIr'
import { CompilerVisitor } from './impl/compilerImpl'
import { walkDefinition } from '../IRVisitor'
import { LookupTable } from '../lookupTable'
import { AnalysisOutput, analyzeInc, analyzeModules } from '../quintAnalyzer'
import { mkErrorMessage } from '../cliCommands'
import { IdGenerator, newIdGenerator } from '../idGenerator'
import { SourceLookupPath } from '../sourceResolver'
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
  compilationState: CompilationState
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
    compilationState: newCompilationState(),
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
  compilationState: CompilationState,
  lookupTable: LookupTable,
  mainName: string,
  execListener: ExecutionListener,
  rand: (bound: bigint) => bigint
): CompilationContext {
  const { modules, sourceMap, analysisOutput } = compilationState
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
    compilationState,
  }
}
export function compileExpr(state: CompilationState, rng: Rng, recorder: any, expr: QuintEx): CompilationContext {
  // Create a definition to encapsulate the parsed expression.
  const def: QuintDef = { kind: 'def', qualifier: 'action', name: 'q::input', expr, id: state.idGen.nextId() }

  return compileDef(state, rng, recorder, def)
}

export function compileDef(state: CompilationState, rng: Rng, recorder: any, def: QuintDef): CompilationContext {
  // Define a new module list with the new definition in the last module,
  // ensuring the original object is not modified
  const modules: QuintModule[] = [...state.modules] // Those are flat, but introducing `def` might make them non-flat
  const lastModule: FlatModule = state.modules[state.modules.length - 1] //This is not modules.pop() to ensure flatness
  if (!lastModule) {
    throw new Error('No modules in state')
  }
  modules.pop()
  modules.push({ ...lastModule, defs: [...lastModule.defs, def] })

  // We need to resolve names for this new definition. Incremental name
  // resolution is not our focus now, so just resolve everything again.
  return parsePhase3importAndNameResolution({ modules: modules, sourceMap: state.sourceMap })
    .mapLeft(errorContextFromMessage)
    .map(({ table }) => {
      const [analysisErrors, analysisOutput] = analyzeInc(state.analysisOutput, table, def)

      const { flattenedModule, flattenedTable, flattenedAnalysis } = addDefToFlatModule(
        lastModule,
        table,
        new Map(modules.map(m => [m.name, m])),
        state.idGen,
        state.sourceMap,
        analysisOutput,
        def
      )

      const flatModules: FlatModule[] = [...state.modules]
      flatModules.pop()
      flatModules.push(flattenedModule)

      const newState = { ...state, analysisOutput: flattenedAnalysis, modules: flatModules }
      const ctx = compile(newState, flattenedTable, lastModule?.name, recorder, rng.next)

      const errorLocator = mkErrorMessage(state.sourceMap)
      return {
        ...ctx,
        compilationState: newState,
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
          const compilationState = {
            modules: flattenedModules,
            sourceMap,
            analysisOutput: flattenedAnalysis,
            idGen,
          }

          const ctx = compile(compilationState, flattenedTable, mainName, execListener, rand)

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
