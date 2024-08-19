/* ----------------------------------------------------------------------------------
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * General purpose utilities used within the quint codebase
 *
 * @author Shon Feder
 *
 * @module
 */

import JSONbig from 'json-bigint'
import lodash from 'lodash'
import { Maybe, none } from '@sweet-monads/maybe'

/** Add this at the end of a switch statement or if/then sequence to enforce exhaustiveness checking
 *
 * E.g.,
 *
 * ```
 * switch (foo.bar) {
 *   case 'bax': ...
 *   case 'qux': ...
 *   default: unreachable(foo)
 * }
 * ```
 * See https://stackoverflow.com/a/39419171 */
export function unreachable(object: never): never {
  throw new Error(`impossible: non-exhuastive check should fail during type checking ${JSONbig.stringify(object)}`)
}

/**  A wrapper around lodash zip that ensures all zipped elements are defined
 *
 * Raises `Error` if the arrays are not the same length
 */
export function zip<A, B>(a: A[], b: B[]): [A, B][] {
  return lodash.zip(a, b).map(([x, y]) => {
    if (x === undefined || y === undefined) {
      throw new Error('Illegal arguments to zip: array lengths unequal')
    } else {
      return [x, y]
    }
  })
}

/** `findMap(xs)` is `just(y)` if there is an `x` in `xs` for which `f(x)` is `just(y)`
 * otherwise, it is `none`
 *
 * This is like `Array.prototype.find`, except that it works on any iterable and
 * enables transforming the found value.
 *
 * Example:
 *
 * ```
 * const result = findMap([1,2,3], (x) => x % 2 === 0 ? just(x) : none<int>())
 * lodash.isEqual(result, just(2))
 * ```
 * */
export function findMap<X, Y>(xs: Iterable<X>, f: (x: X) => Maybe<Y>): Maybe<Y> {
  for (const x of xs) {
    const maybeY = f(x)
    if (maybeY.isJust()) {
      return maybeY
    }
  }
  return none<Y>()
}

/** Insert an item into an array sorted in ascending order by the given comparator.
 *
 * Important: The array must be sorted in ascending order.
 *
 * Complexity: O(log n)
 */
export function insertSorted<A>(array: A[], item: A, cmp: (a: A, b: A) => number): void {
  if (array.length === 0) {
    array.push(item)
    return
  }

  const index = findInsertionIndex(array, x => cmp(x, item) > 0)
  array.splice(index, 0, item)
}

/** Find the `index` in `array` where the predicate `pred(array[index])` is true.
 *
 * Important: The array must be sorted in ascending order.
 *
 * Implements a binary search with complexity: O(log n)
 *
 * This function is not exported as it is only meant to be used internally by `insertSorted`.
 */
function findInsertionIndex<A>(array: A[], pred: (a: A) => boolean): number {
  var low = 0
  var high = array.length

  while (low < high) {
    // Integer version of `Math.floor((low + high) / 2)`
    const mid = (low + high) >>> 1

    if (pred(array[mid])) {
      // The element at mid satisfies the predicate, so we need to search to the left
      high = mid
    } else {
      // The element at mid does not satisfy the predicate, so we need to search to the right
      low = mid + 1
    }
  }

  return low
}
