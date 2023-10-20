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
