/*
 * A state-machine simulator.
 *
 * Igor Konnov, 2023
 *
 * Copyright 2023 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 */

import { Either } from '@sweet-monads/either'

import { compileFromCode, contextNameLookup } from './runtime/compile'
import { QuintEx } from './ir/quintIr'
import { Computable } from './runtime/runtime'
import { ExecutionFrame, Trace, newTraceRecorder } from './runtime/trace'
import { IdGenerator } from './idGenerator'
import { Rng } from './rng'
import { SourceLookupPath } from './parsing/sourceResolver'
import { QuintError } from './quintError'
import { mkErrorMessage } from './cliCommands'
import { createFinders, formatError } from './errorReporter'
import assert from 'assert'

/**
 * Various settings that have to be passed to the simulator to run.
 */
export interface SimulatorOptions {
  init: string
  step: string
  invariant: string
  maxSamples: number
  maxSteps: number
  numberOfTraces: number
  rng: Rng
  verbosity: number
  storeMetadata: boolean
  onTrace(index: number, status: string, vars: string[], states: QuintEx[]): void
}

/** The outcome of a simulation
 */
export type Outcome =
  | { status: 'ok' } /** Simulation succeeded */
  | { status: 'violation' } /** Simulation found an invariant violation */
  | { status: 'error'; errors: QuintError[] } /** An error occurred during simulation  */

/**
 * A result returned by the simulator.
 */
export interface SimulatorResult {
  outcome: Outcome
  vars: string[]
  states: QuintEx[]
  frames: ExecutionFrame[]
  seed: bigint
}

function errSimulationResult(errors: QuintError[]): SimulatorResult {
  return {
    outcome: { status: 'error', errors },
    vars: [],
    states: [],
    frames: [],
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
    `def q::test(q::nrunsArg, q::nstepsArg, q::ntracesArg, q::initArg, q::nextArg, q::invArg) = false`,
    `action q::init = { ${o.init} }`,
    `action q::step = { ${o.step} }`,
    `val q::inv = { ${o.invariant} }`,
    `val q::runResult = q::test(${o.maxSamples}, ${o.maxSteps}, ${o.numberOfTraces}, q::init, q::step, q::inv)`,
  ]

  // Construct the modules' code, adding the extra definitions to the main module
  const newMainModuleCode = code.slice(mainStart, mainEnd - 1) + '\n' + extraDefs.join('\n')
  const codeWithExtraDefs = code.slice(0, mainStart) + newMainModuleCode + code.slice(mainEnd)

  const recorder = newTraceRecorder(options.verbosity, options.rng, options.numberOfTraces)
  const ctx = compileFromCode(
    idGen,
    codeWithExtraDefs,
    mainName,
    mainPath,
    recorder,
    options.rng.next,
    options.storeMetadata
  )

  const compilationErrors = ctx.syntaxErrors.concat(ctx.analysisErrors).concat(ctx.compileErrors)
  if (compilationErrors.length > 0) {
    return errSimulationResult(compilationErrors)
  }

  // evaluate q::runResult, which triggers the simulator
  const evaluationState = ctx.evaluationState
  const res: Either<string, Computable> = contextNameLookup(evaluationState.context, 'q::runResult', 'callable')
  if (res.isLeft()) {
    const errors = [{ code: 'QNT512', message: res.value }] as QuintError[]
    return errSimulationResult(errors)
  } else {
    res.value.eval()
  }

  const topTraces: Trace[] = recorder.bestTraces
  const vars = evaluationState.vars.map(v => v.name)

  topTraces.forEach((trace, index) => {
    const maybeEvalResult = trace.frame.result
    assert(maybeEvalResult.isJust(), 'invalid simulation failed to produce a result')
    const quintExResult = maybeEvalResult.value.toQuintEx(idGen)
    assert(quintExResult.kind === 'bool', 'invalid simulation produced non-boolean value ')
    const simulationSucceeded = quintExResult.value
    const status = simulationSucceeded ? 'ok' : 'violation'
    const states = trace.frame.args.map(e => e.toQuintEx(idGen))

    options.onTrace(index, status, vars, states)
  })

  const topFrame = topTraces[0].frame
  const seed = topTraces[0].seed
  // Validate required outcome of correct simulation
  const maybeEvalResult = topFrame.result
  assert(maybeEvalResult.isJust(), 'invalid simulation failed to produce a result')
  const quintExResult = maybeEvalResult.value.toQuintEx(idGen)
  assert(quintExResult.kind === 'bool', 'invalid simulation produced non-boolean value ')
  const simulationSucceeded = quintExResult.value

  const states = topFrame.args.map(e => e.toQuintEx(idGen))
  const frames = topFrame.subframes

  const runtimeErrors = ctx.getRuntimeErrors()
  if (runtimeErrors.length > 0) {
    // FIXME(#1052) we shouldn't need to do this if the error id was not some non-sense generated in `compileFromCode`
    // The evaluated code source is not included in the context, so we crete a version with it for the error reporter
    const code = new Map([...ctx.compilationState.sourceCode.entries(), [mainPath.normalizedPath, codeWithExtraDefs]])
    const finders = createFinders(code)

    const locatedErrors = runtimeErrors.map(error => ({
      code: error.code,
      // Include the location information (locs) in the error message - this
      // is the hacky part, as it should only be included at the CLI level
      message: formatError(code, finders, {
        // This will create the `locs` attribute and an explanation
        ...mkErrorMessage(ctx.compilationState.sourceMap)(error),
        // We override the explanation to keep the original one to avoid
        // duplication, since `mkErrorMessage` will be called again at the CLI
        // level. `locs` won't be touched then because this error doesn't
        // include a `reference` field
        explanation: error.message,
      }),
    }))

    // This should be kept after the hack is removed
    return {
      vars,
      states,
      frames,
      seed,
      outcome: { status: 'error', errors: locatedErrors },
    }
  } else {
    const status = simulationSucceeded ? 'ok' : 'violation'
    return {
      vars,
      states,
      frames,
      seed,
      outcome: { status },
    }
  }
}
