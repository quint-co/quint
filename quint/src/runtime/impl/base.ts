/* ----------------------------------------------------------------------------------
 * Copyright 2022-2024 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Base types and functions for the runtime implementation.
 *
 * @author Igor Konnov, Gabriela Moreira
 *
 * @module
 */

import { Maybe, just, none } from '@sweet-monads/maybe'
import { ErrorCode, QuintError } from '../../quintError'
import { EvaluationResult } from '../runtime'
import { Either, right } from '@sweet-monads/either'
import { RuntimeValue } from './runtimeValue'

// Internal names in the compiler, which have special treatment.
// For some reason, if we replace 'q::input' with inputDefName, everything breaks.
// What kind of JS magic is that?
export const specialNames = ['q::input', 'q::runResult', 'q::nruns', 'q::nsteps', 'q::init', 'q::next', 'q::inv']

/**
 * Creates a new EvaluationState object.
 *
 * @returns a new EvaluationState object.
 */
export class CompilerErrorTracker {
  // messages that are produced during compilation
  compileErrors: QuintError[] = []
  // messages that get populated as the compiled code is executed
  runtimeErrors: QuintError[] = []

  addCompileError(reference: bigint, code: ErrorCode, message: string) {
    this.compileErrors.push({ code, message, reference })
  }

  addRuntimeError(reference: bigint | undefined, error: QuintError) {
    this.runtimeErrors.push({ ...error, reference: error.reference ?? reference })
  }
}

export function toMaybe<T>(r: Either<QuintError, T>): Maybe<T> {
  if (r.isRight()) {
    return just(r.value)
  } else {
    return none()
  }
}

// make a `Computable` that always returns a given runtime value
export function mkConstComputable(value: RuntimeValue) {
  return {
    eval: () => {
      return right(value)
    },
  }
}

// make a `Computable` that always returns a given runtime value
export function mkFunComputable(fun: () => EvaluationResult) {
  return {
    eval: () => {
      return fun()
    },
  }
}
