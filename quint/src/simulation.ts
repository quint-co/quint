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
  pendingDiagnostics?: DebugMessage[]
  result: boolean
  seed: bigint
}

/**
 * `observed`: the simulation stopped at a trace that reaches an observation
 * given with `--observation`. The Rust simulator's output carries the same values.
 */
export type SimulationStatus = 'ok' | 'violation' | 'observed' | 'error'

/** The outcome of a simulation
 */
export interface Outcome {
  status: SimulationStatus
  errors: QuintError[]
  bestTraces: SimulationTrace[]
  observingTraces: number[]
  /** When `status` is `observed`, the indices of the stopping observations that its trace reaches */
  stoppedByObservations: number[]
  samples: number
  traceStatistics: TraceStatistics
  violatedInvariants: number[]
}

/** The status that a simulation trace is reported with, e.g. in the ITF `#meta` */
export function traceStatus(
  trace: { result: boolean },
  outcomeStatus: SimulationStatus
): 'ok' | 'violation' | 'observed' {
  if (!trace.result) {
    return 'violation'
  }
  return outcomeStatus === 'observed' ? 'observed' : 'ok'
}

export interface TraceStatistics {
  averageTraceLength: number
  minTraceLength: number
  maxTraceLength: number
}

export function getTraceStatistics(traceLengths: number[]): TraceStatistics {
  return {
    maxTraceLength: traceLengths.reduce((a, b) => Math.max(a, b), 0),
    minTraceLength: traceLengths.reduce((a, b) => Math.min(a, b), Infinity),
    averageTraceLength: traceLengths.reduce((a, b) => a + b, 0) / traceLengths.length,
  }
}

export function showTraceStatistics(stats: TraceStatistics): string {
  return `Trace length statistics: max=${stats.maxTraceLength}, min=${
    stats.minTraceLength
  }, average=${stats.averageTraceLength.toFixed(2)}`
}
