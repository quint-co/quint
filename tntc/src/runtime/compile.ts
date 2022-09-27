/*
 * A compiler to the runtime environment.
 *
 * Igor Konnov, 2022
 *
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import { parsePhase1, parsePhase2, ErrorMessage } from '../tntParserFrontend'
import { Computable, ExecError, ExecErrorHandler } from './runtime'
import { CompilerVisitor } from './impl/compilerImpl'
import { walkModule } from '../IRVisitor'

/**
 * The default error handler, which simply prints the error on the console.
 */
const consoleHandler = (err: ExecError) => {
  console.error(`${err.sourceAndLoc}: ${err.msg}`)
}

/**
 * A compilation context returned by 'compile'.
 */
export interface CompilationContext {
  values: Map<string, Computable>,
  vars: string[]
}

/**
 * Parse a string that contains a TNT module and compile it to executable
 * objects. This is a user-facing function. In case of an error, the error
 * messages are passed to an error handler and the function returns undefined.
 *
 * @param moduleText text that stores a TNT module,
 *        which should be parseable without any context
 * @param errorHandler error handler, which defaults to console output
 * @returns a mapping from names to computable values
 */
export function
compile (moduleText: string, errorHandler: ExecErrorHandler = consoleHandler):
    CompilationContext {
  // parse the module text
  const parseRes = parsePhase1(moduleText, '<input>')
  let errors = []
  if (parseRes.kind === 'error') {
    errors = parseRes.messages
  } else {
    const resolutionRes = parsePhase2(parseRes.module, parseRes.sourceMap)
    if (resolutionRes.kind === 'error') {
      errors = resolutionRes.messages
    } else {
      const visitor = new CompilerVisitor()
      walkModule(visitor, parseRes.module)
      return {
        values: visitor.getContext(),
        vars: visitor.getVars(),
      }
    }
  }

  // report error messages
  errors.forEach((err: ErrorMessage) => {
    let loc
    if (err.locs.length > 0) {
      const start = err.locs[0].start
      // compensate for 2 lines in moduleText,
      // make lines and columns start with 1
      loc = `${start.line - 1}:${start.col + 1}`
    } else {
      loc = '<unknown>'
    }

    errorHandler({
      msg: err.explanation,
      sourceAndLoc: loc,
    })
  })

  return {
    values: new Map(),
    vars: [],
  }
}
