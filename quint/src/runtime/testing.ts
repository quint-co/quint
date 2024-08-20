/*
 * Unit-testing framework for the JS runtime.
 *
 * Igor Konnov, 2023
 *
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 */

import { QuintEx } from '../ir/quintIr'

import { ExecutionFrame } from './trace'
import { Rng } from '../rng'
import { QuintError } from '../quintError'

/**
 * Various settings to be passed to the testing framework.
 */
export interface TestOptions {
  testMatch: (n: string) => boolean
  maxSamples: number
  rng: Rng
  verbosity: number
  onTrace(index: number, name: string, status: string, vars: string[], states: QuintEx[]): void
}

/**
 * Evaluation result.
 * The implementation details are hidden behind this interface.
 */
export interface TestResult {
  /**
   * The test name.
   */
  name: string
  /**
   * The test status.
   */
  status: 'passed' | 'failed' | 'ignored'
  /**
   * The seed value to repeat the test.
   */
  seed: bigint
  /**
   * When status === 'failed', errors contain the explanatory errors.
   */
  errors: QuintError[]
  /**
   * If the trace was recorded, frames contains the history.
   */
  frames: ExecutionFrame[]
  /**
   * The number of tried samples.
   */
  nsamples: number
}
