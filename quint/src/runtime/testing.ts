/*
 * Unit-testing framework for the JS runtime.
 *
 * Igor Konnov, 2023
 *
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import { Either, left, merge, right } from '@sweet-monads/either'

import { ErrorMessage, Loc, fromIrErrorMessage } from '../quintParserFrontend'
import { QuintModule, QuintOpDef } from '../quintIr'
import { TypeScheme } from '../types/base'

import { CompilationContext, compile } from './compile'
import { zerog } from './../idGenerator'
import { LookupTable } from '../lookupTable'
import { Computable, kindName } from './runtime'
import { ExecutionFrame, newTraceRecorder } from './trace'
import { Rng } from '../rng'

/**
 * Various settings to be passed to the testing framework.
 */
export interface TestOptions {
  testMatch: (n: string) => boolean,
  maxSamples: number,
  rng: Rng,
  verbosity: number,
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
  seed: bigint,
  /**
   * When status === 'failed', errors contain the explanatory error messages.
   */
  errors: ErrorMessage[]
  /**
   * If the trace was recorded, frames contains the history.
   */
  frames: ExecutionFrame[],
  /**
   * The number of tried samples.
   */
  nsamples: number,
}

/**
 * Run a test suite of a single module.
 *
 * @param modules Quint modules in the intermediate representation
 * @param main the module that should be used as a state machine
 * @param sourceMap source map as produced by the parser
 * @param lookupTable lookup table as produced by the parser
 * @param types type table as produced by the type checker
 * @param options misc test options
 * @returns the results of running the tests
 */
export function compileAndTest(
    modules: QuintModule[],
    main: QuintModule,
    sourceMap: Map<bigint, Loc>,
    lookupTable: LookupTable,
    types: Map<bigint, TypeScheme>,
    options: TestOptions): Either<ErrorMessage[], TestResult[]> {
  const recorder = newTraceRecorder(options.verbosity, options.rng)
  const ctx =
    compile(modules, sourceMap, lookupTable,
            types, main.name, recorder, options.rng.next)

  if(!ctx.main) {
    return left([ { explanation: 'Cannot find main module', locs: [] } ])
  }

  const ctxErrors =
    ctx.syntaxErrors.concat(ctx.compileErrors).concat(ctx.analysisErrors)
  if (ctxErrors.length > 0) {
    // In principle, these errors should have been caught earlier.
    // But if they did not, return immediately.
    return left(ctxErrors)
  }

  const testDefs =
    ctx.main.defs.filter(d =>
      d.kind === 'def' && options.testMatch(d.name)) as QuintOpDef[]

  return merge(testDefs.map(def => {
    return getComputableForDef(ctx, def)
      .map(comp => {
        const name = def.name
        // save the initial seed
        let seed = options.rng.getState()
        
        let nsamples = 1
        // run up to maxSamples, stop on the first failure
        for (; nsamples <= options.maxSamples; nsamples++) {
          // record the seed value
          seed = options.rng.getState()
          // run the test
          recorder.onRunCall()
          const result = comp.eval()
          recorder.onRunReturn(result, [] /* <= ignore the states */)

          if (result.isNone()) {
            // if the test failed, return immediately
            return {
              name, status: 'failed', errors: ctx.getRuntimeErrors(),
              seed, frames: recorder.getBestTrace().subframes, nsamples: nsamples,
            }
          }

          const ex = result.value.toQuintEx(zerog)
          if (ex.kind !== 'bool') {
            // if the test returned a malformed result, return immediately
            return { name, status: 'ignored', errors: [], seed: seed, frames: [], nsamples: nsamples }
          }

          if (!(ex.value)) {
            // if the test returned false, return immediately
            const e = fromIrErrorMessage(sourceMap)({
              explanation: `${name} returns false`,
              refs: [def.id],
            })
            return {
              name,
              status: 'failed',
              errors: [e],
              seed: seed,
              frames: recorder.getBestTrace().subframes,
              nsamples: nsamples,
            }
          } else {
            if (options.rng.getState() === seed) {
              // This successful test did not use non-determinism.
              // Running it one time is sufficient.
              return {
                 name, status: 'passed', errors: [],
                 seed: seed, frames: [], nsamples: nsamples
              }
            }
          }
        }

        // the test was run maxSamples times, and no errors were found
        return {
          name, status: 'passed', errors: [],
          seed: seed, frames: [], nsamples: nsamples - 1
        }
      })
  }))
}

function getComputableForDef(ctx: CompilationContext, def: QuintOpDef):
    Either<ErrorMessage[], Computable> {
  const comp = ctx.values.get(kindName('callable', def.id))
  if (comp) {
    return right(comp)
  } else {
    return left([ { explanation: `Cannot find computable for ${def.name}`, locs: [] } ])
  }
}
