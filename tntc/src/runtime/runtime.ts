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
 * The type of a value that can be computed by the runtime. This data structure
 * may unpredictable change, when we are updating the simulator.
 * Hence, the users should convert this result to TntExpr via `toTntExpr`
 * and interpret the TNT expression.
 */
export type EvalResult = | boolean | bigint | Set<EvalResult> | Interval

// an interval left.to(right), both inclusive
export type Interval = { first: bigint, last: bigint} & Iterable<bigint>

// does an object behave as an interval
export function isInterval (res: EvalResult): res is Interval {
  return typeof res !== 'boolean' && typeof res !== 'bigint' && !isSet(res)
}

// create an immutable record that represents intervals
export function makeInterval (first: bigint, last: bigint): Interval {
  return {
    first: first,
    last: last,
    // that is what makes the interval iterable
    [Symbol.iterator]: () => {
      // return the iterator (defined in the end of this file)
      return new IntervalIterator(first, last)
    },
  }
}

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
  } else if (isInterval(result)) {
    // simply enumerate the values in the interval first..last
    const elems: TntEx[] = []
    for (const i of result) {
      elems.push({ id: 0n, kind: 'int', value: i })
    }
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

// Test whether in object is Iterable.
// https://stackoverflow.com/a/24099583
export function isIterable (obj: any): boolean {
  return obj != null && typeof obj[Symbol.iterator] === 'function'
}

// private definitions

// an iterator over intervals
class IntervalIterator implements Iterator<bigint> {
  private current: bigint
  private end: bigint

  constructor (first: bigint, last: bigint) {
    this.current = first
    this.end = last
  }

  next (): IteratorResult<bigint> {
    if (this.current <= this.end) {
      return { done: false, value: this.current++ }
    } else {
      return { done: true, value: undefined }
    }
  }
}
