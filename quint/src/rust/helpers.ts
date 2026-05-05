/* ----------------------------------------------------------------------------------
 * Copyright 2026 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Custom JSON replacer for serializing data to the Rust evaluator.
 * Handles Map/Set conversion and detects out-of-bounds integer literals.
 *
 * @author Yassine Boukhari
 */

import { QuintError } from '../quintError'
import { replacer } from '../jsonHelper'

const I64_MIN = -(2n ** 63n)
const I64_MAX = 2n ** 63n - 1n

function createError(value: bigint, context: string, id: bigint): QuintError {
  return {
    code: 'QNT600',
    message: `Integer literal ${value}${context} is outside i64 range and is not supported by the Rust evaluator.`,
    reference: id,
  }
}

export function bigintCheckerReplacer(_key: string, value: any): any {
  // Detect QuintInt expressions with out-of-bounds values
  if (value && typeof value.value === 'bigint') {
    const intValue = value.value
    if (intValue < I64_MIN || intValue > I64_MAX) {
      const error = createError(intValue, '', value.id)
      throw error
    }
  }

  // Delegate to standard replacer for Map/Set handling
  return replacer(_key, value)
}
