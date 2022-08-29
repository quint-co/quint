/*
 * Operations over EvalResult. This is an implementation module.
 * It should be used exclusively by the TNT simulator and transpiler.
 *
 * Igor Konnov, 2022
 *
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import { Maybe, none, just } from '@sweet-monads/maybe'
import { Set, isSet, is as immutableIs } from 'immutable'

import {
  EvalResult, Interval, isInterval, isIterable
} from '../runtime'

/**
 * Transform an Iterable to an immutable set via iteration.
 * This is useful for special sets such as intervals.
 *
 * @param iterable an iterable collection of results
 * @return an immutable set of results
 * (probably much larger than the original object)
 */
export const toSet = (iterable: Iterable<EvalResult>): Set<EvalResult> => {
  if (isSet(iterable)) {
    return iterable as Set<EvalResult>
  } else {
    let set = Set.of<EvalResult>()
    for (const e of iterable) {
      set = set.add(e)
    }
    return set
  }
}

/**
  * If a value is iterable, convert it to an immutable set via toSet.
  *
  * @param value an evaluation result, maybe not Iterable
  * @return either the original value, if it is not iterable, or
  * an immutable set of results (probably much larger than the original object)
  */
export const iterableToSet = (value: EvalResult): EvalResult => {
  if (isSet(value) || !isIterable(value)) {
    return value
  } else {
    let set = Set.of<EvalResult>()
    for (const e of value as Iterable<EvalResult>) {
      set = set.add(e)
    }
    return set
  }
}

/**
  * Does an iterable collection (a set or an interval) contain an element?
  *
  * @param iterable iterable collection, e.g., a set or an interval
  * @param elem evaluation result to check for membership
  * @return true, if `elem` appears in `iterable`
  */
export function
contains (iterable: Iterable<EvalResult>, elem: EvalResult): boolean {
  if (isSet(iterable)) {
    // do a (hopefully) less expensive test
    return iterable.includes(iterableToSet(elem))
  }

  let found = false
  for (const other of iterable) {
    if (evalResultIs(elem, other)) {
      found = true
    }
  }

  return found
}

/**
  * Is one set a subset of another (as iterables)?
  *
  * @param smaller collection of results that should be included in the larger one
  * @param larger collection of results that should include the smaller one
  * @result true if `smaller` is included or equal to the `larger`
  */
export function isSubset
(smaller: Iterable<EvalResult>, larger: Iterable<EvalResult>): boolean {
  if (isSet(smaller) && isSet(larger)) {
    // do a (hopefully) less expensive test
    return smaller.isSubset(larger)
  } else {
    // Do O(m * n) tests, where m and n are the cardinalities of lhs and rhs.
    // Maybe we should use a cardinality test, when it's possible.
    for (const e of smaller) {
      if (!contains(larger, e)) {
        return false
      }
    }

    return true
  }
}

/**
 * Check equality over evaluation results. As defined in TNT, not in JavaScript.
 *
 * @param lhs left element of equality
 * @param rhs right element of equality
 * @return true, if `lhs` equals to `rhs`
 */
export function evalResultIs
(lhs: EvalResult, rhs: EvalResult): boolean {
  if (typeof lhs === 'bigint' || typeof lhs === 'boolean') {
    return lhs === rhs
  } else if (isSet(lhs) && isSet(rhs)) {
    // delegate equality to immutable-js
    return immutableIs(lhs, rhs)
  } else if (isInterval(lhs) && isInterval(rhs)) {
    // TS is smart enough to see the first condition, but not the second one
    const rhsInterval = rhs as Interval
    return lhs.first === rhsInterval.first && lhs.last === rhsInterval.last
  } else if (isIterable(lhs) && isIterable(rhs)) {
    // The worst case, e.g., comparing an interval to a set.
    // First, convert both iterables to sets and then compare them as sets.
    // (We have found that it is faster, though it consumes more memory.)
    // TS is smart enough to figure out the type of lhs, but not of rhs.
    return immutableIs(toSet(lhs), toSet(rhs as Iterable<EvalResult>))
  } else {
    return false
  }
}

/**
 * Apply `f` to every element of `iterable` and either:
 *
 *  - return `none`, if one of the results in `none`, or
 *  - return `just` of the unpacked results.
 */
export function flatMap<T, R>
(iterable: Iterable<T>, f: (arg: T) => Maybe<R>): Maybe<Array<R>> {
  const results: R[] = []
  for (const arg of iterable) {
    const res = f(arg)
    if (res.isNone()) {
      return none<Array<R>>()
    } else {
      const { value } = res
      results.push(value)
    }
  }

  return just(results)
}
