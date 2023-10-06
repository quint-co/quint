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
import { Maybe, just, none } from '@sweet-monads/maybe'

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
 * enables trasforming the found value.
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
