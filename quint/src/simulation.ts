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
import { Maybe, none } from '@sweet-monads/maybe'
import { strict as assert } from 'assert'

import {
  compileFromCode, contextNameLookup, lastTraceName
} from './runtime/compile'
import { ErrorMessage } from './quintParserFrontend'
import { QuintApp, QuintEx } from './quintIr'
import { Computable, EvalResult } from './runtime/runtime'
import {
  ExecutionFrame, newTraceRecorder, noExecutionListener
} from './runtime/trace'
import { IdGenerator } from './idGenerator'
import { verbosity } from './verbosity'

/**
 * Various settings that have to be passed to the simulator to run.
 */
export interface SimulatorOptions {
  init: string,
  step: string,
  invariant: string,
  maxSamples: number,
  maxSteps: number,
  rand: () => number,
  verbosity: number,
}

export type SimulatorResultStatus =
  'ok' | 'violation' | 'failure' | 'error'

/**
 * A result returned by the simulator.
 */
export interface SimulatorResult {
  status: SimulatorResultStatus,
  vars: string[],
  states: QuintEx[],
  frames: ExecutionFrame[],
  errors: ErrorMessage[],
}

function errSimulationResult(status: SimulatorResultStatus,
                             errors: ErrorMessage[]): SimulatorResult {
  return {
    status: 'failure',
    vars: [],
    states: [],
    frames: [],
    errors: errors,
  }
}

/**
 * Execute a run.
 *
 * @param idGen a unique generator of identifiers
 * @param code the source code of the modules
 * @param mainName the module that should be used as a state machine
 * @param options simulator settings
 * @returns either error messages (left),
    or the trace as an expression (right)
 */
export function
compileAndRun(idGen: IdGenerator,
              code: string,
              mainName: string,
              options: SimulatorOptions): SimulatorResult {
  // Once we have 'import from ...' implemented, we should pass
  // a filename instead of the source code (see #8)

  // Parse the code once again, but this time include the special definitions
  // that are required by the runner.
  // This code should be revisited in #618.
  const o = options
  const wrappedCode =
`${code}

module __run__ {
  import ${mainName}.*

  val ${lastTraceName} = [];
  def q::test(q::nrunsArg, q::nstepsArg, q::initArg, q::nextArg, q::invArg) = false;
  action q::init = { ${o.init} }
  action q::step = { ${o.step} }
  val q::inv = { ${o.invariant} }
  val q::runResult =
    q::test(${o.maxSamples}, ${o.maxSteps}, q::init, q::step, q::inv)
}
`

  const recorder = newTraceRecorder(options.verbosity)
  const ctx = compileFromCode(idGen,
    wrappedCode, '__run__', recorder, options.rand)

  if (ctx.compileErrors.length > 0
      || ctx.syntaxErrors.length > 0
      || ctx.analysisErrors.length > 0) {
    const errors =
      ctx.syntaxErrors
        .concat(ctx.analysisErrors)
        .concat(ctx.compileErrors)
    return errSimulationResult('error', errors)
  } else {
    // evaluate q::runResult, which triggers the simulator
    const res: Either<string, Computable> =
      contextNameLookup(ctx, 'q::runResult', 'callable')
    if (res.isLeft()) {
      const errors = [{ explanation: res.value, locs: [] }] as ErrorMessage[]
      return errSimulationResult('error', errors)
    } else {
      const _ = res.value.eval()
    }

    const frame = recorder.getBestTrace()
    let status: SimulatorResultStatus = 'failure'
    if (frame.result.isJust()) {
      const ex = frame.result.unwrap().toQuintEx(idGen)
      if (ex.kind === 'bool') {
        status = ex.value ? 'ok' : 'violation'
      }
    }

    return {
      status: status,
      vars: ctx.vars,
      states: frame.args.map(e => e.toQuintEx(idGen)),
      frames: frame.subframes,
      errors: ctx.getRuntimeErrors(),
    }
  }
}

