/* ----------------------------------------------------------------------------------
 * Copyright 2025 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Evaluates a nondeterministic let-in expression, with retries for `oneOf` calls.
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Either, right } from '@sweet-monads/either'
import { EvalFunction } from './builder'
import { RuntimeValue, rv } from './runtimeValue'
import { isEqual } from 'lodash'
import { QuintError } from '../../quintError'
import { CachedValue } from './Context'
import { Maybe } from '@sweet-monads/maybe'
import { isFalse } from './evaluator'

/**
 * Evaluates a nondet + oneOf() + body expression, which picks a value from a
 * set and evaluates the body with that value. If the body evaluates to false,
 * it retries with the next position in the set until it finds a true value or
 * exhausts all positions.
 *
 * - If the set is empty, it returns false.
 * - If the set is infinite, it picks a random value from the range
 *   [-2^255, 2^255) for each position.
 * - If the set is to big (bigger than QUINT_RETRY_NONDET_SMALLER_THAN), it
 *   does not retry and returns the first value picked from the set.
 *
 * @param name - The name of the nondeterministic expression.
 * @param cache - A cached value to store the picked value.
 * @param setEval - The evaluation function for the set from which to pick a value.
 * @param bodyEval - The evaluation function for the body of the let-in.
 * @returns An evaluation function for the nondet let-in expression.
 */
export function evalNondet(
  name: string,
  cache: CachedValue,
  setEval: EvalFunction,
  bodyEval: EvalFunction
): EvalFunction {
  return ctx =>
    setEval(ctx).chain(set => {
      if (set.cardinality().isRight() && set.cardinality().unwrap() === 0n) {
        // The whole let expression is false if there are no elements to be picked.
        return right(rv.mkBool(false))
      }

      const bounds = set.bounds()
      const originalPositions: bigint[] = bounds.map((b): bigint => {
        if (b.isJust()) {
          return ctx.rand(b.value)
        } else {
          // An infinite set, pick an integer from the range [-2^255, 2^255).
          // Note that pick on Nat uses the absolute value of the passed integer.
          // TODO: make it a configurable parameter:
          // https://github.com/informalsystems/quint/issues/279
          return -(2n ** 255n) + ctx.rand(2n ** 256n)
        }
      })

      let result: Either<QuintError, RuntimeValue>
      let shouldRetry: boolean

      // First attempt is the original positions.
      // Keep it's value to detect when we are back to the original positions, when retrying.
      let newPositions = [...originalPositions]

      do {
        const pickedValue = set.pick(newPositions.values())

        // Eval the let body expression with the picked value (by saving it in the cache).
        cache.value = pickedValue
        result = bodyEval(ctx)

        // If the result is false and the bounds are small enough, we retry with the next position.
        shouldRetry = isFalse(result) && shouldRetryNondet(bounds)
        if (shouldRetry) {
          increment(
            newPositions,
            bounds.map(b => b.unwrap())
          )
        } else {
          // Save the value to `nondetPicks`
          pickedValue.map(value => ctx.varStorage.nondetPicks.set(name, value))
        }

        // Retry if condition is satisfied and we haven't exhausted all possible positions.
      } while (shouldRetry && !isEqual(newPositions, originalPositions))

      // Reset the cache
      cache.value = undefined

      return result
    })
}

function increment(newPositions: bigint[], bounds: bigint[]): undefined {
  for (let i = newPositions.length - 1; i >= 0; i--) {
    if (newPositions[i] < bounds[i] - 1n) {
      newPositions[i]++
      return
    } else {
      newPositions[i] = 0n
    }
  }
  return
}

/* The maximum size of set bounds for which we retry nondet expressions. If the
 * set is too big, it is better to be greedy and let the execution fail if we
 * pick a "wrong" value. As retrying large sets can take a long time, and there
 * might be better chances to find an interesting run if we start from scratch.
 * For example, see gradualPonzi.qnt.
 *
 * There's also the case where we have multiple "nested" nondet expressions, so
 * we set a pretty small value as default to avoid slowdowns even in those. If
 * there are several nested expression with big sets, this can still be slow,
 * but those are not common. The user can always change the value of the
 * environment variable `QUINT_RETRY_NONDET_SMALLER_THAN`.
 */
const QUINT_RETRY_NONDET_SMALLER_THAN = BigInt(process.env.QUINT_RETRY_NONDET_SMALLER_THAN ?? '100')

function shouldRetryNondet(bounds: Maybe<bigint>[]): boolean {
  return bounds.every(b => {
    if (b.isJust()) {
      return b.value < QUINT_RETRY_NONDET_SMALLER_THAN
    } else {
      return false
    }
  })
}
