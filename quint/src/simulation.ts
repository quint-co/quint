/*
 * A state-machine simulator.
 *
 * Igor Konnov, 2023
 *
 * Copyright (c) Informal Systems 2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import { Either } from '@sweet-monads/either'

import { compileFromCode, contextNameLookup, lastTraceName } from './runtime/compile'
import { ErrorMessage } from './parsing/quintParserFrontend'
import { QuintEx } from './ir/quintIr'
import { Computable } from './runtime/runtime'
import { ExecutionFrame, newTraceRecorder } from './runtime/trace'
import { IdGenerator } from './idGenerator'
import { Rng } from './rng'
import { SourceLookupPath } from './parsing/sourceResolver'

/**
 * Various settings that have to be passed to the simulator to run.
 */
export interface SimulatorOptions {
  init: string
  step: string
  invariant: string
  maxSamples: number
  maxSteps: number
  rng: Rng
  verbosity: number
}

export type SimulatorResultStatus = 'ok' | 'violation' | 'failure' | 'error'

/**
 * A result returned by the simulator.
 */
export interface SimulatorResult {
  status: SimulatorResultStatus
  vars: string[]
  states: QuintEx[]
  frames: ExecutionFrame[]
  errors: ErrorMessage[]
  seed: bigint
}

function errSimulationResult(status: SimulatorResultStatus, errors: ErrorMessage[]): SimulatorResult {
  return {
    status,
    vars: [],
    states: [],
    frames: [],
    errors: errors,
    seed: 0n,
  }
}

/**
 * Execute a run.
 *
 * @param idGen a unique generator of identifiers
 * @param code the source code of the modules
 * @param mainStart the start index of the main module in the code
 * @param mainEnd the end index of the main module in the code
 * @param mainName the module that should be used as a state machine
 * @param mainPath the lookup path that was used to retrieve the main module
 * @param options simulator settings
 * @returns either error messages (left),
    or the trace as an expression (right)
 */
export function compileAndRun(
  idGen: IdGenerator,
  code: string,
  mainStart: number,
  mainEnd: number,
  mainName: string,
  mainPath: SourceLookupPath,
  options: SimulatorOptions
): SimulatorResult {
  // Once we have 'import from ...' implemented, we should pass
  // a filename instead of the source code (see #8)

  // Parse the code once again, but this time include the special definitions
  // that are required by the runner.
  // This code should be revisited in #618.
  const o = options
  // Defs required by the simulator, to be added to the main module before compilation
  const extraDefs = [
    `val ${lastTraceName} = [];`,
    `def q::test(q::nrunsArg, q::nstepsArg, q::initArg, q::nextArg, q::invArg) = false`,
    `action q::init = { ${o.init} }`,
    `action q::step = { ${o.step} }`,
    `val q::inv = { ${o.invariant} }`,
    `val q::runResult = q::test(${o.maxSamples}, ${o.maxSteps}, q::init, q::step, q::inv)`,
  ]

  // Construct the modules' code, adding the extra definitions to the main module
  const newMainModuleCode = code.slice(mainStart, mainEnd - 1) + extraDefs.join('\n')
  const codeWithExtraDefs = code.slice(0, mainStart) + newMainModuleCode + code.slice(mainEnd)

  const recorder = newTraceRecorder(options.verbosity, options.rng)
  const ctx = compileFromCode(idGen, codeWithExtraDefs, mainName, mainPath, recorder, options.rng.next)

  if (ctx.compileErrors.length > 0 || ctx.syntaxErrors.length > 0 || ctx.analysisErrors.length > 0) {
    const errors = ctx.syntaxErrors.concat(ctx.analysisErrors).concat(ctx.compileErrors)
    return errSimulationResult('error', errors)
  } else {
    // evaluate q::runResult, which triggers the simulator
    const evaluationState = ctx.evaluationState
    const res: Either<string, Computable> = contextNameLookup(evaluationState.context, 'q::runResult', 'callable')
    if (res.isLeft()) {
      const errors = [{ explanation: res.value, locs: [] }] as ErrorMessage[]
      return errSimulationResult('error', errors)
    } else {
      const _ = res.value.eval()
    }

    const topFrame = recorder.getBestTrace()
    let status: SimulatorResultStatus = 'failure'
    if (topFrame.result.isJust()) {
      const ex = topFrame.result.unwrap().toQuintEx(idGen)
      if (ex.kind === 'bool') {
        status = ex.value ? 'ok' : 'violation'
      }
    } else {
      // This should not happen. But if it does, give a debugging hint.
      console.error('No trace recorded')
    }

    return {
      status: status,
      vars: evaluationState.vars.map(v => v.name),
      states: topFrame.args.map(e => e.toQuintEx(idGen)),
      frames: topFrame.subframes,
      errors: ctx.getRuntimeErrors(),
      seed: recorder.getBestTraceSeed(),
    }
  }
}
