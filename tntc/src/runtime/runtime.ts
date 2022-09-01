/*
 * Runtime environment for TNT. This runtime environment is designed for the
 * following purposes:
 *
 *  - Give the language user fast feedback via interpretation of expressions.
 *  - Let the user simulate their specification similar to property-based testing.
 *
 * Igor Konnov, 2022
 *
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import { Maybe, none } from '@sweet-monads/maybe'

import { ValueObject } from 'immutable'

import { TntEx } from '../tntIr'

/**
 * Evaluation result.
 * The implementation details are hidden behind this interface.
 */
export interface EvalResult extends ValueObject {
  /**
   * Convert an evaluation result to TNT.
   *
   * This function always returns sets in the normalized representation,
   * that is, in `set(elements)`, the elements are ordered according to their
   * string representation. As sorting via strings may be slow, we do not
   * recommend using `toTntEx` in computation-intensive code.
   *
   * @return this evaluation result converted to TNT expression.
   */
  toTntEx(): TntEx
}

/**
 * An object that can be evaluated by the runtime. Normally, it is constructed
 * from a TNT expression, but it does not have to.
 */
export interface Computable {
  /**
   * The simplest form of evaluation. Just compute the value.
   * This method may return none, if a computation error happens during
   * evaluation.
   */
  eval: () => Maybe<EvalResult>
}

/**
 * An implementation of Computable that always fails.
 */
export const fail = {
  eval: () => {
    return none<EvalResult>()
  },
}

/**
 * An error produced during execution.
 */
export interface ExecError {
  msg: string,
  sourceAndLoc: string | undefined,
}

/**
 * An error handler that is called on any kind of error that is happening
 * during execution.
 */
export type ExecErrorHandler = (error: ExecError) => void;
