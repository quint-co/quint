/*
 * A compiler to the runtime environment.
 *
 * Igor Konnov, 2022
 *
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import { Either, left, right } from '@sweet-monads/either'

import {
  ErrorMessage, Loc, parsePhase1, parsePhase2
} from '../quintParserFrontend'
import { ErrorTree, errorTreeToString } from '../errorTree'
import { Computable, ComputableKind, kindName } from './runtime'
import { IrErrorMessage } from '../quintIr'
import { CompilerVisitor } from './impl/compilerImpl'
import { walkDefinition } from '../IRVisitor'
import { treeFromModule } from '../scoping'
import { LookupTableByModule } from '../lookupTable'
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
  compileErrors: IrErrorMessage[],
  // messages that get populated as the compiled code is executed
  runtimeErrors: IrErrorMessage[],
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
    runtimeErrors: [],
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
 * Parse a string that contains a Quint module and compile it to executable
 * objects. This is a user-facing function. In case of an error, the error
 * messages are passed to an error handler and the function returns undefined.
 *
 * @param code text that stores one or several Quint modules,
 *        which should be parseable without any context
 * @param mainName the name of the module that may contain state varibles
 * @returns a mapping from names to computable values
 */
export function
  compile(code: string, mainName: string): CompilationContext {
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
      const [analysisErrors, result] = analyzer.getResult()
      // Push back the main module to the end
      const main = modules.find(m => m.name === mainName)
      // when the main module is not found, we will report an error
      const mainNotFound =
        main ? [] : [{
          explanation: `Main module ${mainName} not found`,
          refs: [],
        }]
      const reorderedModules =
        modules.filter(m => m.name !== mainName).concat(main ? [main] : [])
      // Compile all modules
      const visitor = new CompilerVisitor(result.types)
      reorderedModules.forEach(module => {
        visitor.switchModule(module.id, table.get(module.name)!, treeFromModule(module))
        module.defs.forEach(def => walkDefinition(visitor, def))
      })
      const errorLocator = mkErrorMessage(sourceMap)
      return right({
        lookupTable: table,
        values: visitor.getContext(),
        vars: visitor.getVars(),
        shadowVars: visitor.getShadowVars(),
        syntaxErrors: [],
        analysisErrors: Array.from(analysisErrors, errorLocator),
        compileErrors: visitor.getCompileErrors().concat(mainNotFound),
        runtimeErrors: visitor.getRuntimeErrors(),
        sourceMap: sourceMap,
      })
    }
      // Wether we end up with a right or a left, we will have a CompilationContext
    ).value
}
