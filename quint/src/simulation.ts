/*
 * A state-machine simulator.
 *
 * Igor Konnov, 2023
 *
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 */

import { QuintEx } from './ir/quintIr'
import { Rng } from './rng'
import { QuintError } from './quintError'
import { TraceHook } from './cliReporting'
import { DebugMessage } from './itf'

/**
 * Various settings that have to be passed to the simulator to run.
 */
export interface SimulatorOptions {
  init: string
  step: string
  invariant: string
  individualInvariants?: string[]
  maxSamples: number
  maxSteps: number
  numberOfTraces: number
  rng: Rng
  verbosity: number
  storeMetadata: boolean
  hideVars: string[]
  onTrace?: TraceHook
}

export interface SimulationTrace {
  states: QuintEx[]
  diagnostics?: DebugMessage[][]
  result: boolean
  seed: bigint
}

export type SimulationStatus = 'ok' | 'violation' | 'error'

/** The outcome of a simulation
 */
export interface Outcome {
  status: SimulationStatus
  errors: QuintError[]
  bestTraces: SimulationTrace[]
  witnessingTraces: number[]
  samples: number
  traceStatistics: TraceStatistics
  violatedInvariants: number[]
}

export interface TraceStatistics {
  averageTraceLength: number
  minTraceLength: number
  maxTraceLength: number
}

export function getTraceStatistics(traceLengths: number[]): TraceStatistics {
  return {
    maxTraceLength: Math.max(...traceLengths),
    minTraceLength: Math.min(...traceLengths),
    averageTraceLength: traceLengths.reduce((a, b) => a + b, 0) / traceLengths.length,
  }
}

export function showTraceStatistics(stats: TraceStatistics): string {
  return `Trace length statistics: max=${stats.maxTraceLength}, min=${
    stats.minTraceLength
  }, average=${stats.averageTraceLength.toFixed(2)}`
}
