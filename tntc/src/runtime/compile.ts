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
  parsePhase1, parsePhase2, ErrorMessage, Loc
} from '../tntParserFrontend'
import { Computable } from './runtime'
import { IrErrorMessage } from '../tntIr'
import { CompilerVisitor } from './impl/compilerImpl'
import { walkModule } from '../IRVisitor'

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
  // messages that are produced during compilation
  compileErrors: IrErrorMessage[],
  // messages that get populated as the compiled code is executed
  runtimeErrors: IrErrorMessage[],
  // source mapping
  sourceMap: Map<bigint, Loc>,
}

function errorContext (errors: ErrorMessage[]): CompilationContext {
  return {
    values: new Map(),
    vars: [],
    shadowVars: [],
    syntaxErrors: errors,
    compileErrors: [],
    runtimeErrors: [],
    sourceMap: new Map(),
  }
}

/**
 * Parse a string that contains a TNT module and compile it to executable
 * objects. This is a user-facing function. In case of an error, the error
 * messages are passed to an error handler and the function returns undefined.
 *
 * @param moduleText text that stores a TNT module,
 *        which should be parseable without any context
 * @returns a mapping from names to computable values
 */
export function
compile (moduleText: string): CompilationContext {
  // parse the module text
  const parseRes = parsePhase1(moduleText, '<input>')

  if (parseRes.kind === 'error') {
    return errorContext(parseRes.messages)
  } else {
    const resolutionRes = parsePhase2(parseRes.module, parseRes.sourceMap)
    if (resolutionRes.kind === 'error') {
      return errorContext(resolutionRes.messages)
    } else {
      const visitor = new CompilerVisitor()
      walkModule(visitor, parseRes.module)
      return {
        values: visitor.getContext(),
        vars: visitor.getVars(),
        shadowVars: visitor.getShadowVars(),
        syntaxErrors: [],
        compileErrors: visitor.getCompileErrors(),
        runtimeErrors: visitor.getRuntimeErrors(),
        sourceMap: parseRes.sourceMap,
      }
    }
  }
}
