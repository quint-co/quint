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
import { Computable, fail, ExecError, ExecErrorHandler } from './runtime'
import { CompilerVisitor } from './impl/compilerImpl'
import { walkModule } from '../IRVisitor'

/**
 * The default error handler, which simply prints the error on the console.
 */
const consoleHandler = (err: ExecError) => {
  console.error(`${err.sourceAndLoc}: ${err.msg}`)
}

/**
 * A convenience interface over Computable which unwraps Maybe into any | undefined.
 * The users do not have to worry about us using Maybe and they can use the standard
 * TypeScript idioms instead.
 */
export interface Executable extends Computable {
  exec: () => (any | undefined)
}

/**
 * Parse a string that contains a TNT expression and compile it to an executable
 * object. This is a user-facing function. In case of an error, the error
 * messages are passed to an error handler and the function returns undefined.
 *
 * @param text that stores a TNT expression,
 *        which should be parseable without any context
 * @param errorHandler error handler, which defaults to console output
 * @returns a computable value that encodes the expression, which may evaluate to undefined,
 *          in case a parsing or evaluation error occurs
 */
export function
compileExpr (text: String, errorHandler: ExecErrorHandler = consoleHandler): Executable {
  // embed expression text into a module definition
  const moduleText =
`module __Runtime {
   val __exprToCompile =
${text}
}`
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
      // add a helper function to the computable value to unwrap Maybe
      const comp = visitor.findByName('__exprToCompile') ?? fail
      return makeExecutable(comp)
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

  return makeExecutable(fail)
}

// module-private functions go here

// make an Executable out of Computable
function makeExecutable (comp: Computable): Executable {
  return {
    ...comp,
    exec () : any | undefined {
      const { value } = comp.eval()
      return value
    },
  }
}
