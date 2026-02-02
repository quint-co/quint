/* ----------------------------------------------------------------------------------
 * Copyright 2022-2024 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * An evaluator for Quint in Node TS runtime.
 *
 * Testing and simulation are heavily based on the original `compilerImpl.ts` file written by Igor Konnov.
 *
 * @author Igor Konnov, Gabriela Moreira
 *
 * @module
 */

import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import { QuintApp, QuintEx } from '../../ir/quintIr'
import { LookupDefinition, LookupTable } from '../../names/base'
import { QuintError } from '../../quintError'
import { TraceRecorder } from '../trace'
import { Trace } from './trace'
import { RuntimeValue, rv } from './runtimeValue'
import { Context } from './Context'
import { TestResult } from '../testing'
import { Rng } from '../../rng'
import { zerog } from '../../idGenerator'
import { List } from 'immutable'
import { Builder, buildDef, buildExpr, nameWithNamespaces } from './builder'
import { Presets, SingleBar } from 'cli-progress'
import { Outcome, SimulationTrace, getTraceStatistics } from '../../simulation'
import assert from 'assert'
import { TraceHook } from '../../cliReporting'

/**
 * An evaluator for Quint in Node TS runtime.
 */
export class Evaluator {
  public ctx: Context
  public recorder: TraceRecorder
  private rng: Rng
  private builder: Builder

  /**
   * Constructs an Evaluator that can be re-used across evaluations.
   *
   * @param table - The lookup table for definitions.
   * @param recorder - The trace recorder to log evaluation traces.
   * @param rng - The random number generator to use for evaluation.
   * @param storeMetadata - Optional, whether to store `actionTaken` and `nondetPicks`. Default is false.
   */
  constructor(table: LookupTable, recorder: TraceRecorder, rng: Rng, storeMetadata: boolean = false) {
    this.recorder = recorder
    this.rng = rng
    this.builder = new Builder(table, storeMetadata)
    this.ctx = new Context(recorder, rng.next, this.builder.varStorage)
  }

  /**
   * Get the current trace from the context
   */
  get trace(): Trace {
    return this.ctx.trace
  }

  /**
   * Update the lookup table, if the same table is used for multiple evaluations but there are new definitions.
   *
   * @param table
   */
  updateTable(table: LookupTable) {
    this.builder.table = table
  }

  updateState(state: QuintEx) {
    this.ctx.varStorage.fromRecord(rv.fromQuintEx(state))
  }

  /**
   * Shift the context to the next state. That is, updated variables in the next state are moved to the current state,
   * and the trace is extended.
   */
  shift(): void {
    this.ctx.shift()
  }

  /**
   * Shift the context to the next state. That is, updated variables in the next state are moved to the current state,
   * and the trace is extended.
   *
   * @returns a tuple [shifted, missing_vars, old_state, new_state] where:
   *  - shifted: boolean indicating if there were any next variables that got shifted
   *  - missing_vars: names of the variables that don't have values in the new state (empty list if no shifting happened)
   *  - old_state: the state before shifting (as RuntimeValue)
   *  - new_state: the state after shifting (as RuntimeValue)
   */
  replShift(): [boolean, string[], RuntimeValue, RuntimeValue] {
    const missing = this.ctx.varStorage.nextVars.filter(reg => reg.value.isLeft())

    if (missing.size === this.ctx.varStorage.nextVars.size) {
      // All next vars are missing, nothing was changed, don't shift
      const currentState = this.ctx.varStorage.asRecord()
      return [false, [], currentState, currentState]
    }

    // Save old state before shifting
    const oldState = this.ctx.varStorage.asRecord()

    this.shift()

    // Get new state after shifting
    const newState = this.ctx.varStorage.asRecord()

    return [
      true,
      missing
        .valueSeq()
        .map(reg => reg.name)
        .toArray(),
      oldState,
      newState,
    ]
  }

  /**
   * Evaluate a Quint expression.
   *
   * @param expr
   * @returns the result of the evaluation, if successful, or an error if the evaluation failed.
   */
  evaluate(expr: QuintEx): Either<QuintError, QuintEx> {
    if (expr.kind === 'app' && (expr.opcode == 'q::test' || expr.opcode === 'q::testOnce')) {
      return this.evaluateSimulation(expr)
    }

    const value = buildExpr(this.builder, expr)(this.ctx)

    return value.map(rv.toQuintEx)
  }

  /**
   * Reset the evaluator to its initial state (in terms of trace and variables)
   */
  reset() {
    this.trace.reset()
    this.builder.varStorage.reset()
  }

  /**
   * Simulates the execution of an initial expression followed by a series of step expressions,
   * while checking an invariant expression at each step. The simulation is run multiple times,
   * up to a specified number of runs, and each run is executed for a specified number of steps.
   * The simulation stops if a specified number of traces with errors are found.
   *
   * @param init - The initial expression to evaluate.
   * @param step - The step expression to evaluate repeatedly.
   * @param inv - The invariant expression to check after each step.
   * @param nruns - The number of simulation runs to perform.
   * @param nsteps - The number of steps to perform in each simulation run.
   * @param ntraces - The number of error traces to collect before stopping the simulation.
   * @param onTrace - A callback function to be called with trace information for each simulation run.
   * @returns a simulation outcome with all data to report
   */
  simulate(
    init: QuintEx,
    step: QuintEx,
    inv: QuintEx,
    witnesses: QuintEx[],
    nruns: number,
    nsteps: number,
    ntraces: number,
    onTrace?: TraceHook
  ): Outcome {
    let errorsFound = 0
    let failure: QuintError | undefined = undefined
    const startTime = Date.now()

    const progressBar = new SingleBar(
      {
        clearOnComplete: true,
        forceRedraw: true,
        format: 'Running... [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} samples | {speed} samples/s',
      },
      Presets.rect
    )
    progressBar.start(Number(nruns), 0, { speed: '0' })

    const initEval = buildExpr(this.builder, init)
    const stepEval = buildExpr(this.builder, step)
    const invEval = buildExpr(this.builder, inv)
    const witnessesEvals = witnesses.map(w => buildExpr(this.builder, w))
    const witnessingTraces = new Array(witnesses.length).fill(0)
    const traceLengths: number[] = []

    let runNo = 0
    for (; errorsFound < ntraces && !failure && runNo < nruns; runNo++) {
      const elapsedSeconds = (Date.now() - startTime) / 1000
      const speed = Math.round(runNo / elapsedSeconds)
      progressBar.update(runNo, { speed })
      const traceWitnessed = new Array(witnesses.length).fill(false)

      this.recorder.onRunCall()
      this.reset()
      // Mocked def for the trace recorder
      const initApp: QuintApp = { id: 0n, kind: 'app', opcode: 'q::initAndInvariant', args: [] }
      this.recorder.onUserOperatorCall(initApp)

      const initResult = initEval(this.ctx).mapLeft(error => (failure = error))
      if (!isTrue(initResult)) {
        traceLengths.push(0)
        this.recorder.onUserOperatorReturn(initApp, [], initResult)
      } else {
        this.shift()

        const invResult = invEval(this.ctx).mapLeft(error => (failure = error))
        this.recorder.onUserOperatorReturn(initApp, [], invResult)
        if (!isTrue(invResult)) {
          errorsFound++
          traceLengths.push(this.trace.get().length)
        } else {
          // check all { step, shift(), inv } in a loop
          for (let i = 0; errorsFound < ntraces && !failure && i < nsteps; i++) {
            const stepApp: QuintApp = {
              id: 0n,
              kind: 'app',
              opcode: 'q::stepAndInvariant',
              args: [],
            }
            this.recorder.onUserOperatorCall(stepApp)

            const stepResult = stepEval(this.ctx).mapLeft(error => (failure = error))
            if (!isTrue(stepResult)) {
              traceLengths.push(this.trace.get().length)

              // The run cannot be extended. In some cases, this may indicate a deadlock.
              // Since we are doing random simulation, it is very likely
              // that we have not generated good values for extending
              // the run. Hence, do not report an error here, but simply
              // drop the run. Otherwise, we would have a lot of false
              // positives, which look like deadlocks but they are not.

              this.recorder.onUserOperatorReturn(stepApp, [], stepResult)
              this.recorder.onRunReturn(right(rv.mkBool(true)), this.trace.get())
              break
            }

            this.shift()

            witnessesEvals.forEach((witnessEval, i) => {
              const witnessResult = witnessEval(this.ctx)
              if (isTrue(witnessResult)) {
                traceWitnessed[i] = true
              }
            })

            const invResult = invEval(this.ctx).mapLeft(error => (failure = error))
            if (!isTrue(invResult)) {
              errorsFound++
            }
            this.recorder.onUserOperatorReturn(stepApp, [], invResult)
          }

          traceWitnessed.forEach((witnessed, i) => {
            if (witnessed) {
              witnessingTraces[i] = witnessingTraces[i] + 1
            }
          })

          traceLengths.push(this.trace.get().length)
        }
      }

      const outcome = failure ? left(failure) : right(rv.mkBool(errorsFound == 0))
      this.recorder.onRunReturn(outcome, this.trace.get())
    }
    progressBar.stop()

    const results: Either<QuintError[], SimulationTrace[]> = mergeInMany(
      this.recorder.bestTraces.map((trace, index) => {
        const maybeEvalResult = trace.frame.result
        if (maybeEvalResult.isLeft()) {
          return left(maybeEvalResult.value)
        }
        const quintExResult = maybeEvalResult.value.toQuintEx(zerog)
        assert(quintExResult.kind === 'bool', 'invalid simulation produced non-boolean value ')
        const simulationSucceeded = quintExResult.value
        const status = simulationSucceeded ? 'ok' : 'violation'
        const states = trace.frame.args.map(e => e.toQuintEx(zerog))

        if (onTrace !== undefined) {
          onTrace(index, status, this.varNames(), states)
        }

        return right({ states, result: simulationSucceeded, seed: trace.seed })
      })
    )

    const runtimeErrors = results.isLeft() ? results.value : []

    let traces = results.isRight() ? results.value : []

    return {
      status: failure ? 'error' : errorsFound == 0 ? 'ok' : 'violation',
      errors: failure ? [failure, ...runtimeErrors] : runtimeErrors,
      bestTraces: traces,
      witnessingTraces,
      samples: runNo,
      traceStatistics: getTraceStatistics(traceLengths),
    }
  }

  /**
   * Run a specified test definition a given number of times, and report the result.
   *
   * @param testDef - The definition of the test to be run.
   * @param maxSamples - The maximum number of times to run the test.
   * @param onTrace - A callback function to be called with trace information for each test run.
   * @returns The result of the test, including its name, status, any errors, the seed used, frames,
              and the number of samples run.
   */
  test(testDef: LookupDefinition, maxSamples: number, index: number, onTrace: TraceHook): TestResult {
    const name = nameWithNamespaces(testDef.name, List(testDef.namespaces))
    const startTime = Date.now()
    const progressBar = new SingleBar(
      {
        clearOnComplete: true,
        forceRedraw: true,
        format: '     {test} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} samples | {speed} samples/s',
      },
      Presets.rect
    )

    progressBar.start(maxSamples, 0, { test: name, speed: '0' })

    this.trace.reset()
    this.recorder.clear()

    // save the initial seed
    let seed = this.rng.getState()

    const testEval = buildDef(this.builder, testDef)

    let nsamples = 1
    // run up to maxSamples, stop on the first failure
    for (; nsamples <= maxSamples; nsamples++) {
      const elapsedSeconds = (Date.now() - startTime) / 1000
      const speed = Math.round(nsamples / elapsedSeconds)
      progressBar.update(nsamples, { test: name, speed })
      // record the seed value
      seed = this.rng.getState()
      this.recorder.onRunCall()
      // reset the trace
      this.reset()
      // run the test
      const result = testEval(this.ctx)
      this.ctx.shift()

      // extract the trace
      const trace = this.trace.get()
      if (trace.length > 0) {
        this.recorder.onRunReturn(result, trace)
      } else {
        this.recorder.onRunReturn(result, [])
      }

      const states = this.recorder.bestTraces[0]?.frame?.args?.map(rv.toQuintEx)
      const frames = this.recorder.bestTraces[0]?.frame?.subframes ?? []
      // evaluate the result
      if (result.isLeft()) {
        // if there was an error, return immediately
        progressBar.stop()
        return {
          name,
          status: 'failed',
          errors: [result.value],
          seed,
          frames,
          nsamples,
        }
      }

      const ex = result.value.toQuintEx(zerog)
      if (ex.kind !== 'bool') {
        // if the test returned a malformed result, return immediately
        progressBar.stop()
        return {
          name,
          status: 'ignored',
          errors: [],
          seed,
          frames,
          nsamples,
        }
      }

      if (!ex.value) {
        // if the test returned false, return immediately
        const error: QuintError = {
          code: 'QNT511',
          message: `Test ${name} returned false`,
          reference: testDef.id,
        }
        onTrace(index, 'failed', this.varNames(), states, name)
        progressBar.stop()
        return {
          name,
          status: 'failed',
          errors: [error],
          seed,
          frames,
          nsamples,
        }
      } else {
        if (this.rng.getState() === seed) {
          // This successful test did not use non-determinism.
          // Running it one time is sufficient.

          onTrace(index, 'passed', this.varNames(), states, name)
          progressBar.stop()
          return {
            name,
            status: 'passed',
            errors: [],
            seed: seed,
            frames,
            nsamples,
          }
        }
      }
    }

    // the test was run maxSamples times, and no errors were found
    const states = this.recorder.bestTraces[0]?.frame?.args?.map(rv.toQuintEx)
    const frames = this.recorder.bestTraces[0]?.frame?.subframes ?? []

    onTrace(index, 'passed', this.varNames(), states, name)

    progressBar.stop()
    return {
      name,
      status: 'passed',
      errors: [],
      seed: seed,
      frames,
      nsamples: nsamples - 1,
    }
  }

  /**
   * Variable names in context
   * @returns the names of all variables in the current context.
   */
  varNames() {
    return this.ctx.varStorage.vars
      .valueSeq()
      .toArray()
      .map(v => v.name)
  }

  /**
   * Special case of `evaluate` where the expression is a call to a simulation.
   *
   * @param expr
   * @returns the result of the simulation, or an error if the simulation cannot be completed.
   */
  private evaluateSimulation(expr: QuintApp): Either<QuintError, QuintEx> {
    let result: Outcome
    if (expr.opcode === 'q::testOnce') {
      const [nsteps, ntraces, init, step, inv] = expr.args
      result = this.simulate(init, step, inv, [], 1, toNumber(nsteps), toNumber(ntraces))
    } else {
      const [nruns, nsteps, ntraces, init, step, inv] = expr.args
      result = this.simulate(init, step, inv, [], toNumber(nruns), toNumber(nsteps), toNumber(ntraces))
    }

    if (result.status === 'error') {
      return left(result.errors[0])
    } else {
      return right({ kind: 'str', value: result.status, id: 0n })
    }
  }
}

export function isTrue(value: Either<QuintError, RuntimeValue>): boolean {
  return value.isRight() && value.value.toBool() === true
}

export function isFalse(value: Either<QuintError, RuntimeValue>): boolean {
  return value.isRight() && value.value.toBool() === false
}

function toNumber(value: QuintEx): number {
  if (value.kind !== 'int') {
    throw new Error('Expected an integer')
  }
  return Number(value.value)
}
