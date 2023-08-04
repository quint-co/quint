/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * General purpose utilities used within the quint codebase
 *
 * @author Shon Feder
 *
 * @module
 */

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
export function unreachable(_: never): never {
  throw new Error('impossible: non-exhuastive check should fail during type checking')
}
