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
import { newIdGenerator } from './../idGenerator'
import { LookupTable } from '../lookupTable'
import { Computable, kindName } from './runtime'
import { ExecutionFrame, newTraceRecorder } from './trace'

/**
 * Various settings to be passed to the testing framework.
 */
export interface TestOptions {
  testMatch: (n: string) => boolean,
  rand: () => number,
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
   * When status === 'failed', errors contain the explanatory error messages.
   */
  errors: ErrorMessage[]
  /**
   * If the trace was recorded, frames contains the history.
   */
  frames: ExecutionFrame[],
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
    options: TestOptions): Either<string, TestResult[]> {
  const recorder = newTraceRecorder(options.verbosity)
  const ctx =
    compile(modules, sourceMap, lookupTable,
            types, main.name, recorder, options.rand)

  if(!ctx.main) {
    return left('Cannot find main module')
  }

  const testDefs =
    ctx.main.defs.filter(d =>
      d.kind === 'def' && options.testMatch(d.name)) as QuintOpDef[]

  return merge(testDefs.map(def => {
    return getComputableForDef(ctx, def)
      .map(comp => {
        recorder.onRunCall()
        const name = def.name
        const result = comp.eval()
        recorder.onRunReturn(result, [] /* <= ignore the states */)
        if (result.isNone()) {
          return {
            name, status: 'failed', errors: ctx.getRuntimeErrors(),
            frames: recorder.getBestTrace().subframes,
          }
        }

        const ex = result.value.toQuintEx(newIdGenerator())
        if (ex.kind !== 'bool') {
          return { name, status: 'ignored', errors: [], frames: [] }
        }
        if (ex.value) {
          return { name, status: 'passed', errors: [], frames: [] }
        }

        const e = fromIrErrorMessage(sourceMap)({
          explanation: `${name} returns false`,
          refs: [def.id],
        })
        return {
          name,
          status: 'failed',
          errors: [e],
          frames: recorder.getBestTrace().subframes,
        }
      })
  }))
}

function getComputableForDef(ctx: CompilationContext, def: QuintOpDef): Either<string, Computable> {
  const comp = ctx.values.get(kindName('callable', def.id))
  if (comp) {
    return right(comp)
  } else {
    return left(`Cannot find computable for ${def.name}`)
  }
}
