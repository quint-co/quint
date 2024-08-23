import { Either, left, right } from '@sweet-monads/either'
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
import { Builder, buildDef, buildExpr, nameWithNamespaces } from './compiler'

export type EvalFunction = (ctx: Context) => Either<QuintError, RuntimeValue>

export class Evaluator {
  public ctx: Context
  public recorder: TraceRecorder
  private rng: Rng
  private builder: Builder

  constructor(table: LookupTable, recorder: TraceRecorder, rng: Rng, storeMetadata: boolean = false) {
    this.recorder = recorder
    this.rng = rng
    this.builder = new Builder(table, storeMetadata)
    this.ctx = new Context(recorder, rng.next, this.builder.varStorage)
  }

  get trace(): Trace {
    return this.ctx.trace
  }

  updateTable(table: LookupTable) {
    this.builder.table = table
  }

  shift(): void {
    this.ctx.shift()
  }

  shiftAndCheck(): string[] {
    const missing = this.ctx.varStorage.nextVars.filter(reg => reg.value.isLeft())

    if (missing.size === this.ctx.varStorage.vars.size) {
      // Nothing was changed, don't shift
      return []
    }

    this.shift()
    return missing
      .valueSeq()
      .map(reg => reg.name)
      .toArray()
  }

  evaluate(expr: QuintEx): Either<QuintError, QuintEx> {
    if (expr.kind === 'app') {
      this.recorder.onUserOperatorCall(expr)
    }
    const value = buildExpr(this.builder, expr)(this.ctx)
    if (expr.kind === 'app') {
      this.recorder.onUserOperatorReturn(expr, [], value)
    }
    return value.map(rv.toQuintEx)
  }

  reset() {
    this.trace.reset()
    this.builder.varStorage.reset()
  }

  simulate(
    init: QuintEx,
    step: QuintEx,
    inv: QuintEx,
    nruns: number,
    nsteps: number,
    ntraces: number
  ): Either<QuintError, QuintEx> {
    let errorsFound = 0
    let failure: QuintError | undefined = undefined

    const initEval = buildExpr(this.builder, init)
    const stepEval = buildExpr(this.builder, step)
    const invEval = buildExpr(this.builder, inv)

    // TODO: room for improvement here
    for (let runNo = 0; errorsFound < ntraces && !failure && runNo < nruns; runNo++) {
      this.recorder.onRunCall()
      this.reset()
      // Mocked def for the trace recorder
      const initApp: QuintApp = { id: 0n, kind: 'app', opcode: 'q::initAndInvariant', args: [] }
      this.recorder.onUserOperatorCall(initApp)

      const initResult = initEval(this.ctx).mapLeft(error => (failure = error))
      if (!isTrue(initResult)) {
        this.recorder.onUserOperatorReturn(initApp, [], initResult)
      } else {
        this.shift()

        const invResult = invEval(this.ctx).mapLeft(error => (failure = error))
        this.recorder.onUserOperatorReturn(initApp, [], invResult)
        if (!isTrue(invResult)) {
          errorsFound++
        } else {
          // check all { step, shift(), inv } in a loop

          // FIXME: errorsFound < ntraces is not good, because we continue after invariant violation.
          // This is the same in the old version, so I'll fix later.
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

            const invResult = invEval(this.ctx).mapLeft(error => (failure = error))
            if (!isTrue(invResult)) {
              errorsFound++
            }
            this.recorder.onUserOperatorReturn(stepApp, [], invResult)
          }
        }
      }

      const outcome = failure ? left(failure) : right(rv.mkBool(errorsFound == 0))
      this.recorder.onRunReturn(outcome, this.trace.get())
    }

    const outcome: Either<QuintError, QuintEx> = failure
      ? left(failure)
      : right({ id: 0n, kind: 'bool', value: errorsFound == 0 })

    return outcome
  }

  test(
    testDef: LookupDefinition,
    maxSamples: number,
    onTrace: (name: string, status: string, vars: string[], states: QuintEx[]) => void
  ): TestResult {
    const name = nameWithNamespaces(testDef.name, List(testDef.namespaces))

    this.trace.reset()
    this.recorder.clear()

    // save the initial seed
    let seed = this.rng.getState()

    const testEval = buildDef(this.builder, testDef)

    let nsamples = 1
    // run up to maxSamples, stop on the first failure
    for (; nsamples <= maxSamples; nsamples++) {
      // record the seed value
      seed = this.rng.getState()
      this.recorder.onRunCall()
      // reset the trace
      this.reset()
      // run the test
      const result = testEval(this.ctx)

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
        onTrace(name, 'failed', this.varNames(), states)

        // saveTrace(bestTrace, index, name, 'failed')
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

          onTrace(name, 'passed', this.varNames(), states)

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

    onTrace(name, 'passed', this.varNames(), states)

    return {
      name,
      status: 'passed',
      errors: [],
      seed: seed,
      frames,
      nsamples: nsamples - 1,
    }
  }

  varNames() {
    return this.ctx.varStorage.vars
      .valueSeq()
      .toArray()
      .map(v => v.name)
  }
}

export function isTrue(value: Either<QuintError, RuntimeValue>): boolean {
  return value.isRight() && value.value.toBool() === true
}

export function isFalse(value: Either<QuintError, RuntimeValue>): boolean {
  return value.isRight() && value.value.toBool() === false
}
