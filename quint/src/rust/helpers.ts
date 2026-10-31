/* ----------------------------------------------------------------------------------
 * Copyright 2026 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Custom JSON replacer for serializing data to the Rust evaluator.
 * Handles Map/Set conversion and integer literals outside the i64 range.
 *
 * @author Yassine Boukhari
 */

import { replacer } from '../jsonHelper'

const I64_MIN = -(2n ** 63n)
const I64_MAX = 2n ** 63n - 1n

export function rustEvaluatorReplacer(_key: string, value: any): any {
  // Send QuintInt values outside the i64 range as strings, as the Rust
  // evaluator cannot parse JSON numbers that don't fit in 64 bits
  if (value && typeof value.value === 'bigint' && (value.value < I64_MIN || value.value > I64_MAX)) {
    return { ...value, value: value.value.toString() }
  }

  // Delegate to standard replacer for Map/Set handling
  return replacer(_key, value)
}
