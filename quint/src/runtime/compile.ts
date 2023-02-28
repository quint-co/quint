/*
 * A compiler to the runtime environment.
 *
 * Igor Konnov, 2022-2023
 *
 * Copyright (c) Informal Systems 2022-2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import { Either, left, right } from '@sweet-monads/either'

import {
  ErrorMessage, Loc, fromIrErrorMessage,parsePhase1, parsePhase2
} from '../quintParserFrontend'
import { Computable, ComputableKind, kindName } from './runtime'
import { QuintModule } from '../quintIr'
import { CompilerVisitor } from './impl/compilerImpl'
import { walkDefinition } from '../IRVisitor'
import { treeFromModule } from '../scoping'
import { LookupTableByModule } from '../lookupTable'
import { TypeScheme } from '../types/base'
import { QuintAnalyzer } from '../quintAnalyzer'
import { mkErrorMessage } from '../cliCommands'

/**
 * The name of the shadow variable that stores the last found trace.
 */
export const lastTraceName = '_lastTrace'

/**
 * A compilation context returned by 'compile'.
 */
export interface CompilationContext {
  // the lookup table to query for values and definitions
  lookupTable: LookupTableByModule,
  // names of the variables and definition identifiers mapped to computables
  values: Map<string, Computable>,
  // names of the variables
  vars: string[],
  // names of the shadow variables, internal to the simulator
  shadowVars: string[],
  // messages that are produced during parsing
  syntaxErrors: ErrorMessage[],
  // messages that are produced by static analysis
  analysisErrors: ErrorMessage[],
  // messages that are produced during compilation
  compileErrors: ErrorMessage[],
  // messages that get populated as the compiled code is executed
  getRuntimeErrors: () => ErrorMessage[],
  // source mapping
  sourceMap: Map<bigint, Loc>,
}

function errorContext(errors: ErrorMessage[]): CompilationContext {
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
 * @param moduleName module name to lookup at
 * @param defName definition name
 * @param kind definition kind
 * @returns the associated compiled value, if it uniquely defined, or undefined
 */
export function
  contextLookup(ctx: CompilationContext,
                moduleName: string,
                defName: string,
                kind: ComputableKind): Either<string, Computable> {
  const moduleTable = ctx.lookupTable.get(moduleName)
  if (!moduleTable) {
    return left(`Module ${moduleName} not found`)
  }
  const defs = moduleTable.valueDefinitions.get(defName)
  if (!defs) {
    return left(`Definition ${moduleName}::${defName} not found`)
  }
  if (defs.length !== 1) {
    return left(`Multiple definitions (${defs.length}) of ${moduleName}::${defName} found`)
  }

  const value = ctx.values.get(kindName(kind, defs[0].reference!))
  if (!value) {
    console.log(`key = ${kindName(kind, defs[0].reference!)}`)
    return left(`No value for definition ${moduleName}::${defName}`)
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
 * @param types type table as produced by the type checker
 * @param mainName the name of the module that may contain state varibles
 * @param rand the random number generator
 * @returns the compilation context
 */
export function
  compile(modules: QuintModule[],
          sourceMap: Map<bigint, Loc>,
          lookupTable: LookupTableByModule,
          types: Map<bigint, TypeScheme>,
          mainName: string,
          rand: () => number): CompilationContext {
  // Push back the main module to the end:
  // The compiler exposes the state variables of the last module only.
  const main = modules.find(m => m.name === mainName)
  const visitor = new CompilerVisitor(types, rand)
  if (main) {
    const reorderedModules =
      modules.filter(m => m.name !== mainName).concat(main ? [main] : [])
    // Compile all modules
    reorderedModules.forEach(module => {
      visitor.switchModule(module.id,
                           module.name,
                           lookupTable.get(module.name)!,
                           treeFromModule(module))
      module.defs.forEach(def => walkDefinition(visitor, def))
    })
  }
  // when the main module is not found, we will report an error
  const mainNotFoundError =
    main ? [] : [{
      explanation: `Main module ${mainName} not found`,
      refs: [],
    }]
  return {
    lookupTable: lookupTable,
    values: visitor.getContext(),
    vars: visitor.getVars(),
    shadowVars: visitor.getShadowVars(),
    syntaxErrors: [],
    analysisErrors: [],
    compileErrors:
      visitor.getCompileErrors().concat(mainNotFoundError)
      .map(fromIrErrorMessage(sourceMap)),
    getRuntimeErrors: () => {
      return visitor.getRuntimeErrors()
        .splice(0)
        .map(fromIrErrorMessage(sourceMap))
    },
    sourceMap: sourceMap,
  }
}

/**
 * Parse a string that contains Quint modules and compile it to executable
 * objects. This is a user-facing function. In case of an error, the error
 * messages are passed to an error handler and the function returns undefined.
 *
 * @param code text that stores one or several Quint modules,
 *        which should be parseable without any context
 * @param mainName the name of the module that may contain state varibles
 * @param rand the random number generator
 * @returns the compilation context
 */
export function
  compileFromCode(code: string, mainName: string, rand: () => number):
    CompilationContext {
  // parse the module text
  return parsePhase1(code, '<input>')
    // On errors, we'll produce the computational context up to this point
    .mapLeft(errorContext)
    .chain(d => parsePhase2(d)
      // On errors, we'll produce the computational context up to this point
      .mapLeft(errorContext))
    .chain(parseData => {
      const { modules, table, sourceMap } = parseData
      const analyzer = new QuintAnalyzer(table)
      modules.forEach(module => analyzer.analyze(module))
      // since the type checker and effects checker are incomplete,
      // collect the errors, but do not stop immediately on error
      const [analysisErrors, analysisResult] = analyzer.getResult()
      const ctx =
        compile(modules,
                sourceMap, table, analysisResult.types, mainName, rand)
      const errorLocator = mkErrorMessage(sourceMap)
      return right({
        ...ctx,
        analysisErrors: Array.from(analysisErrors, errorLocator),
      })
    }
  // we produce CompilationContext in any case
  ).value
}
