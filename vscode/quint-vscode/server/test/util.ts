/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Utilities for testing
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { Loc, LookupTableByModule, QuintModule, parsePhase1, parsePhase2 } from "@informalsystems/quint"

/**
 * Parses a mocked module and returns the result of the parsing phases, or
 * throws an error if the parsing fails. To be used in tests only.
 *
 * @param moduleText the text of the mocked module
 *
 * @throws Error if the parsing fails
 *
 * @returns A triple with the combined result of the parsing phases
*/
export function parseOrThrow(moduleText: string): [QuintModule, Map<bigint, Loc>, LookupTableByModule] {
  const result1 = parsePhase1(moduleText, 'mocked_path')
  const result2 = result1.chain(parsePhase2)

  if (result1.isLeft() || result2.isLeft()) {
    throw new Error('Failed to parse mocked module')
  }

  return [result1.value.module, result1.value.sourceMap, result2.value.table]
}
