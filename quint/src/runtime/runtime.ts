/*
 * Runtime environment for Quint. This runtime environment is designed for the
 * following purposes:
 *
 *  - Give the language user fast feedback via interpretation of expressions.
 *  - Let the user simulate their specification similar to property-based testing.
 *
 * Igor Konnov, 2022-2023
 *
 * Copyright 2022-2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 */

import { ValueObject } from 'immutable'

import { QuintEx } from '../ir/quintIr'

import { IdGenerator } from '../idGenerator'

import { Either, left } from '@sweet-monads/either'
import { QuintError } from '../quintError'

/**
 * Evaluation result.
 * The implementation details are hidden behind this interface.
 */
export interface EvalResult extends ValueObject {
  /**
   * Convert an evaluation result to Quint.
   *
   * This function always returns sets in the normalized representation,
   * that is, in `set(elements)`, the elements are ordered according to their
   * string representation. As sorting via strings may be slow, we do not
   * recommend using `toQuintEx` in computation-intensive code.
   *
   * @param gen a generator that produces unique ids
   * @return this evaluation result converted to Quint expression.
   */
  toQuintEx(gen: IdGenerator): QuintEx
}

export type EvaluationResult = Either<QuintError, EvalResult>

/**
 * An object that can be evaluated by the runtime. Normally, it is constructed
 * from a Quint expression, but it does not have to.
 */
export interface Computable {
  /**
   * The simplest form of evaluation. Just compute the value.
   * This method may return none, if a computation error happens during
   * evaluation.
   *
   * @param args optional arguments to the computable
   */
  eval: (args?: Either<QuintError, any>[]) => EvaluationResult
}

/**
 * The kind of a computable.
 */
export type ComputableKind = 'var' | 'nextvar' | 'arg' | 'callable'

/**
 * Create a key that encodes its name and kind. This is only useful for
 * storing registers in a map, as JS objects are hard to use as keys.
 * In a good language, we would use (kind, name), but not in JS.
 */
export const kindName = (kind: ComputableKind, name: string | bigint): string => {
  return `${kind}:${name}`
}

/**
 * A computable that evaluates to the value of a readable/writeable register.
 */
export interface Register extends Computable {
  // register name
  name: string
  // register kind
  kind: ComputableKind
  // register is a placeholder where iterators can put their values
  registerValue: Either<QuintError, any>
}

/**
 * Create an object that implements Register.
 */
export function mkRegister(kind: ComputableKind, registerName: string, initValue: Either<QuintError, any>): Register {
  const reg: Register = {
    name: registerName,
    kind,
    registerValue: initValue,
    // first, define a fruitless eval, as we cannot refer to registerValue yet
    eval: () => {
      return initValue
    },
  }
  // override `eval`, as we can use `reg` now
  reg.eval = () => {
    // computing a register just evaluates to the contents that it stores
    return reg.registerValue
  }

  return reg
}

/**
 * A callable value like an operator definition. Its body is computable.
 * One has to pass the values of the parameters to eval.
 */
export interface Callable extends Computable {
  /**
   * The number of parameters expected by the callable value.
   */
  nparams: number
}

/**
 * An implementation of Computable that always fails.
 */
export const fail = {
  eval: (): EvaluationResult => {
    return left({ code: 'QNT501', message: 'Failed to evaluate something :/' })
  },
}

/**
 * An error produced during execution.
 */
export interface ExecError {
  msg: string
  sourceAndLoc: string | undefined
}

/**
 * An error handler that is called on any kind of error that is happening
 * during execution.
 */
export type ExecErrorHandler = (_error: ExecError) => void
