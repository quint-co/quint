/*
 * Unit-testing framework for the JS runtime.
 *
 * Igor Konnov, 2023
 *
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 */

import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import { Presets, SingleBar } from 'cli-progress'

import { QuintEx, QuintOpDef } from '../ir/quintIr'

import { CompilationContext, CompilationState, compile } from './compile'
import { zerog } from './../idGenerator'
import { LookupTable } from '../names/base'
import { Computable, kindName } from './runtime'
import { ExecutionFrame, newTraceRecorder } from './trace'
import { Rng } from '../rng'
import { QuintError } from '../quintError'
import { newEvaluationState, toMaybe } from './impl/base'

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

/**
 * Run a test suite of a single module.
 *
 * @param modules Quint modules in the intermediate representation
 * @param main the module that should be used as a state machine
 * @param sourceMap source map as produced by the parser
 * @param lookupTable lookup table as produced by the parser
 * @param analysisOutput the maps produced by the static analysis
 * @param options misc test options
 * @returns the `right(results)` of running the tests if the tests could be
 *    run, or `left(errors)` with any compilation or analysis errors that
 *    prevent the tests from running
 */
export function compileAndTest(
  compilationState: CompilationState,
  mainName: string,
  lookupTable: LookupTable,
  options: TestOptions
): Either<QuintError[], TestResult[]> {
  const main = compilationState.modules.find(m => m.name === mainName)
  if (!main) {
    return left([{ code: 'QNT405', message: `Main module ${mainName} not found` }])
  }

  const recorder = newTraceRecorder(options.verbosity, options.rng)
  const ctx = compile(
    compilationState,
    newEvaluationState(recorder),
    lookupTable,
    options.rng.next,
    false,
    main.declarations
  )

  const ctxErrors = ctx.syntaxErrors.concat(ctx.compileErrors, ctx.analysisErrors)
  if (ctxErrors.length > 0) {
    // In principle, these errors should have been caught earlier.
    // But if they did not, return immediately.
    return left(ctxErrors)
  }

  const saveTrace = (trace: ExecutionFrame, index: number, name: string, status: string) => {
    // Save the best traces that are reported by the recorder:
    // If a test failed, it is the first failing trace.
    // Otherwise, it is the longest trace explored by the test.
    const states = trace.args.map(e => e.toQuintEx(zerog))
    options.onTrace(
      index,
      name,
      status,
      ctx.evaluationState.vars.map(v => v.name),
      states
    )
  }

  const testDefs = main.declarations.filter(d => d.kind === 'def' && options.testMatch(d.name)) as QuintOpDef[]

  return mergeInMany(
    testDefs.map((def, index) => {
      return getComputableForDef(ctx, def).map(comp => {
        recorder.clear()
        const name = def.name
        // save the initial seed
        let seed = options.rng.getState()

        const bar = new SingleBar(
          {
            clearOnComplete: true,
            forceRedraw: true,
            format: '     {test} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} samples',
          },
          Presets.rect
        )

        bar.start(options.maxSamples, 0, { test: name })

        let nsamples = 1
        // run up to maxSamples, stop on the first failure
        for (; nsamples <= options.maxSamples; nsamples++) {
          bar.update(nsamples, { test: name })

          // record the seed value
          seed = options.rng.getState()
          recorder.onRunCall()
          // reset the trace
          ctx.evaluationState.trace.reset()
          // run the test
          const result = comp.eval()
          // extract the trace
          const trace = ctx.evaluationState.trace.get()

          if (trace.length > 0) {
            recorder.onRunReturn(toMaybe(result), trace)
          } else {
            recorder.onRunReturn(toMaybe(result), [])
          }

          const bestTrace = recorder.bestTraces[0].frame
          // evaluate the result
          if (result.isLeft()) {
            // if the test failed, return immediately
            bar.stop()
            return {
              name,
              status: 'failed',
              errors: ctx.getRuntimeErrors().concat(result.value),
              seed,
              frames: bestTrace.subframes,
              nsamples: nsamples,
            }
          }

          const ex = result.value.toQuintEx(zerog)
          if (ex.kind !== 'bool') {
            // if the test returned a malformed result, return immediately
            bar.stop()
            return {
              name,
              status: 'ignored',
              errors: [],
              seed: seed,
              frames: bestTrace.subframes,
              nsamples: nsamples,
            }
          }

          if (!ex.value) {
            // if the test returned false, return immediately
            const error: QuintError = {
              code: 'QNT511',
              message: `Test ${name} returned false`,
              reference: def.id,
            }
            saveTrace(bestTrace, index, name, 'failed')
            bar.stop()
            return {
              name,
              status: 'failed',
              errors: [error],
              seed: seed,
              frames: bestTrace.subframes,
              nsamples: nsamples,
            }
          } else {
            if (options.rng.getState() === seed) {
              // This successful test did not use non-determinism.
              // Running it one time is sufficient.
              saveTrace(bestTrace, index, name, 'passed')
              bar.stop()
              return {
                name,
                status: 'passed',
                errors: [],
                seed: seed,
                frames: bestTrace.subframes,
                nsamples: nsamples,
              }
            }
          }
        }

        // the test was run maxSamples times, and no errors were found
        const bestTrace = recorder.bestTraces[0].frame
        saveTrace(bestTrace, index, name, 'passed')
        bar.stop()
        return {
          name,
          status: 'passed',
          errors: [],
          seed: seed,
          frames: bestTrace.subframes,
          nsamples: nsamples - 1,
        }
      })
    })
  )
}

function getComputableForDef(ctx: CompilationContext, def: QuintOpDef): Either<QuintError, Computable> {
  const comp = ctx.evaluationState.context.get(kindName('callable', def.id))
  if (comp) {
    return right(comp)
  } else {
    return left({ code: 'QNT501', message: `Cannot find computable for ${def.name}`, reference: def.id })
  }
}
