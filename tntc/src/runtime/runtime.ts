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
import { Set, isSet } from 'immutable'

import { TntEx } from '../tntIr'
import { expressionToString } from '../IRprinting'

/**
 * The type of a value that can be computed by the runtime.
 * We carefully avoid (mutable) wrapper objects such as `{ kind: ..., ... }`,
 * since immutable sets and maps have their own definition of equality.
 * The users should convert this result to TntExpr via `toTntExpr`
 * and interpret the expression.
 */
export type EvalResult =
  | boolean
  | bigint
  | Set<EvalResult>

/**
 * Convert an evaluation result to TNT. This is the preferred way for the
 * users.
 *
 * This function always returns sets in the normalized representation,
 * that is, in `set(elements)`, the elements are ordered according to their
 * string representation. As sorting via strings may be slow, we do not
 * recommend using `toTntEx` in computation-intensive code.
 *
 * @param result of evaluation as produced by Computable#eval().
 */
export function toTntEx (result: EvalResult): TntEx {
  // TODO: produce unique identifiers when we know how to do that:
  // https://github.com/informalsystems/tnt/issues/138
  //
  // We are producing untyped TNT expressions. This may change in the future.
  if (typeof result === 'boolean') {
    return {
      id: 0n,
      kind: 'bool',
      value: result,
    }
  } else if (typeof result === 'bigint') {
    return {
      id: 0n,
      kind: 'int',
      value: result,
    }
  } else if (isSet(result)) {
    // Sets are tricky, as we have to normalize them when producing TntEx.
    // The most common normal form is the one that sorts sets according
    // to their string representation. Instead of computing the string
    // representation multiple times, we cache it in `__str` and then forget it.
    function cacheStr (e: TntEx) {
      return {
        ...e,
        __str: expressionToString(e),
      }
    }
    // Normalize the elements by sorting them
    const elems: (TntEx & { __str?: string })[] =
      result
        .map(e => toTntEx(e))
        .map(cacheStr)
        .toArray()
        .sort((e1, e2) => e1.__str.localeCompare(e2.__str))
    // erase the string cache
    elems.forEach(e => delete e.__str)
    // return the expression set(...elems)
    return {
      id: 0n,
      kind: 'app',
      opcode: 'set',
      args: elems,
    }
  } else {
    throw new Error(`Unexpected argument to toTnt: ${result}`)
  }
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
    // The type is irrelevant, we are using 'boolean' for the type checker.
    return none<boolean>()
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
