/*
 * A state-machine simulator.
 *
 * Igor Konnov, 2023
 *
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import { Either, left, right } from '@sweet-monads/either'
import { strict as assert } from 'assert'
import { range } from 'lodash'
import chalk from 'chalk'

import {
  compileFromCode, contextNameLookup, lastTraceName
} from './runtime/compile'
import { ErrorMessage } from './quintParserFrontend'
import { QuintEx } from './quintIr'
import { fail, kindName } from './runtime/runtime'
import { chalkQuintEx } from './repl'
import { IdGenerator } from './idGenerator'

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
}

/**
 * A result returned by the simulator.
 */
export interface SimulatorResult {
  status: 'ok' | 'violation',
  vars: string[],
  trace: QuintEx,
}

/**
 * Print a trace with chalk.
 */
export function printTrace(out: (line: string) => void, trace: QuintEx) {
  assert(trace.kind === 'app' && trace.opcode === 'List')
  const kw = (s: string) => chalk.green(s)
  const lp = chalk.gray('{')
  const rp = chalk.gray('}')
  const eq = chalk.gray('=')
  const comma = chalk.gray(',')
  trace.args.forEach((state, index) => {
    assert(state.kind === 'app'
           && state.opcode === 'Rec' && state.args.length % 2 === 0)

    out(`${kw('action')} step${index} ${eq} ${kw('all')} ` + lp)
    range(0, Math.trunc(state.args.length / 2))
      .forEach(i => {
        const key = state.args[2 * i]
        assert(key.kind === 'str')
        const valueText = chalkQuintEx(state.args[2 * i + 1])
        out(`  ${key.value}' ${eq} ${valueText}` + comma)
      })
    out(rp + '\n')
  })

  out(`${kw('run')} test ${eq} ` + lp)
  const testText =
    range(0, trace.args.length)
      .map(i => `step${i}`)
      .reduce((left, name) => `${left}.then(${name})`)
  out('  ' + testText)
  out(rp)
}

/**
 * Run a test suite of a single module.
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
              options: SimulatorOptions):
                Either<ErrorMessage[], SimulatorResult> {
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
  def _test(__nrunsArg, __nstepsArg, __initArg, __nextArg, __invArg) = false;
  action __init = { ${o.init} }
  action __step = { ${o.step} }
  val __inv = { ${o.invariant} }
  val __runResult =
    _test(${o.maxSamples}, ${o.maxSteps}, __init, __step, __inv)
}
`

  const ctx = compileFromCode(idGen, wrappedCode, '__run__', options.rand)

  if (ctx.compileErrors.length > 0
      || ctx.syntaxErrors.length > 0
      || ctx.analysisErrors.length > 0) {
    return left(ctx.syntaxErrors
                .concat(ctx.analysisErrors)
                .concat(ctx.compileErrors))
  } else {
    // evaluate __runResult
    const res: Either<ErrorMessage[], boolean> =
      contextNameLookup(ctx, '__runResult', 'callable')
        .mapLeft(msg => [{ explanation: msg, locs: [] }] as ErrorMessage[])
        .map(comp => {
          const result = comp.eval()
          if (result.isNone()) {
            return left(ctx.getRuntimeErrors())
          }

          const ex = result.unwrap().toQuintEx(idGen)
          if (ex.kind !== 'bool') {
            return left([{
              explanation: 'Expected a Boolean result',
              locs: [],
            }])
          } else {
            return right(ex.value)
          }
        })
        .join()

    return res.map(noViolation => {
        // evaluate _lastTrace
        const lastTrace =
          ctx.values.get(kindName('shadow', lastTraceName)) ?? fail
        const result = lastTrace.eval()
        const runtimeErrors = ctx.getRuntimeErrors()
        if (result.isNone() || runtimeErrors.length > 0) {
          if (runtimeErrors.length > 0) {
            return left(runtimeErrors)
          } else {
            return left([ {
              explanation: `${lastTraceName} not found`,
              locs: [],
            } ])
          }
        } else {
          return right({
            status: noViolation ? 'ok' : 'violation',
            vars: ctx.vars,
            trace: result.unwrap().toQuintEx(idGen),
          } as SimulatorResult)
        }
      })
      .join()
  }
}
