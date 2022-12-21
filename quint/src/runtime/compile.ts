/*
 * A compiler to the runtime environment.
 *
 * Igor Konnov, 2022
 *
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import {
  ErrorMessage, Loc, parsePhase1, parsePhase2
} from '../quintParserFrontend'
import { inferTypes } from '../types/inferrer'
import { inferEffects } from '../effects/inferrer'
import { ErrorTree, errorTreeToString } from '../errorTree'
import { Computable } from './runtime'
import { IrErrorMessage } from '../quintIr'
import { CompilerVisitor } from './impl/compilerImpl'
import { walkModule } from '../IRVisitor'
import { right } from '@sweet-monads/either'

/**
 * The name of the shadow variable that stores the last found trace.
 */
export const lastTraceName = '_lastTrace'

/**
 * A compilation context returned by 'compile'.
 */
export interface CompilationContext {
  // names of the variables and definitions mapped to computables
  values: Map<string, Computable>,
  // names of the variables
  vars: string[],
  // names of the shadow variables, internal to the simulator
  shadowVars: string[],
  // messages that are produced during parsing
  syntaxErrors: ErrorMessage[],
  // messages that are produced by the type checker
  typeErrors: ErrorMessage[],
  // messages that are produced by the effects checker
  effectsErrors: ErrorMessage[],
  // messages that are produced during compilation
  compileErrors: IrErrorMessage[],
  // messages that get populated as the compiled code is executed
  runtimeErrors: IrErrorMessage[],
  // source mapping
  sourceMap: Map<bigint, Loc>,
}

function errorContext(errors: ErrorMessage[]): CompilationContext {
  return {
    values: new Map(),
    vars: [],
    shadowVars: [],
    syntaxErrors: errors,
    typeErrors: [],
    effectsErrors: [],
    compileErrors: [],
    runtimeErrors: [],
    sourceMap: new Map(),
  }
}

// convert an error tree to an error message
function errorTreeToMsg(sourceMap: Map<bigint, Loc>, trees: Map<bigint, ErrorTree>) {
  const errors: ErrorMessage[] = []
  trees.forEach((value, key) => {
    const loc = sourceMap.get(key)!
    const msg = {
      explanation: errorTreeToString(value),
      locs: [loc],
    }
    errors.push(msg)
  })

  return errors
}

/**
 * Parse a string that contains a Quint module and compile it to executable
 * objects. This is a user-facing function. In case of an error, the error
 * messages are passed to an error handler and the function returns undefined.
 *
 * @param moduleText text that stores a Quint module,
 *        which should be parseable without any context
 * @returns a mapping from names to computable values
 */
export function
  compile(moduleText: string): CompilationContext {
  // parse the module text
  return parsePhase1(moduleText, '<input>')
    // On errors, we'll produce the computational context up to this point
    .mapLeft(errorContext)
    .chain(d => parsePhase2(d)
      // On errors, we'll produce the computational context up to this point
      .mapLeft(errorContext))
    .chain(parseData => {
      const { module, table, sourceMap } = parseData
      // in the future, we will be using types and effects
      const [typeErrors, _types] = inferTypes(module, table)
      const [effectsErrors, _effects] = inferEffects(table, module)
      // since the type checker and effects checker are incomplete,
      // collect the errors, but do not stop immediately on error
      const visitor = new CompilerVisitor()
      walkModule(visitor, module)
      return right({
        values: visitor.getContext(),
        vars: visitor.getVars(),
        shadowVars: visitor.getShadowVars(),
        syntaxErrors: [],
        typeErrors: errorTreeToMsg(sourceMap, typeErrors),
        effectsErrors: errorTreeToMsg(sourceMap, effectsErrors),
        compileErrors: visitor.getCompileErrors(),
        runtimeErrors: visitor.getRuntimeErrors(),
        sourceMap: sourceMap,
      })
    }
      // Wether we end up with a right or a left, we will have a CompilationContext
    ).value
}
