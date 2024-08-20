import { Either, left, right } from '@sweet-monads/either'
import { EffectScheme } from '../../effects/base'
import { QuintApp, QuintEx, QuintOpDef } from '../../ir/quintIr'
import { LookupDefinition, LookupTable } from '../../names/base'
import { QuintError } from '../../quintError'
import { TraceRecorder } from '../trace'
import { builtinLambda, builtinValue, lazyBuiltinLambda, lazyOps } from './builtins'
import { Trace } from './trace'
import { RuntimeValue, rv } from './runtimeValue'
import { Context } from './Context'
import { TestResult } from '../testing'
import { Rng } from '../../rng'
import { zerog } from '../../idGenerator'
import { List, Map as ImmutableMap } from 'immutable'

export class Evaluator {
  public ctx: Context
  public recorder: TraceRecorder
  private trace: Trace = new Trace()
  private rng: Rng

  constructor(table: LookupTable, recorder: TraceRecorder, rng: Rng) {
    this.ctx = new Context(table, recorder, rng.next)
    this.recorder = recorder
    this.rng = rng
  }

  updateTable(table: LookupTable) {
    this.ctx.table = table
  }

  shift() {
    if (this.ctx.varStorage.nextVars.size === 0) {
      return
    }
    this.ctx.varStorage.shiftVars()
    this.trace.extend(this.ctx.varStorage.asRecord())
    this.ctx.clearMemo() // FIXME: clear only non-pure
  }

  shiftAndCheck(): string[] {
    const missing = [...this.ctx.varStorage.vars.keys()].filter(name => !this.ctx.varStorage.nextVars.has(name))

    if (missing.length === this.ctx.varStorage.varNames.size) {
      // Nothing was changed, don't shift
      return []
    }

    this.shift()
    return missing.map(name => name.split('#')[1])
  }

  evaluate(expr: QuintEx): Either<QuintError, QuintEx> {
    const value = evaluateExpr(this.ctx, expr)
    return value.map(rv.toQuintEx)
  }

  simulate(
    init: QuintEx,
    step: QuintEx,
    inv: QuintEx,
    nruns: number,
    nsteps: number,
    ntraces: number,
    effects: Map<bigint, EffectScheme>
  ): Either<QuintError, QuintEx> {
    let errorsFound = 0
    let failure: QuintError | undefined = undefined

    // effects.forEach((scheme, id) => {
    //   const [mode] = modeForEffect(scheme)
    //   if (mode === 'pureval' || mode === 'puredef') {
    //     console.log('pure key', id)
    //     this.ctx.pureKeys = this.ctx.pureKeys.add(id)
    //   }
    // })

    // TODO: room for improvement here
    for (let runNo = 0; errorsFound < ntraces && !failure && runNo < nruns; runNo++) {
      this.recorder.onRunCall()
      this.trace.reset()
      this.ctx.reset()
      // Mocked def for the trace recorder
      const initApp: QuintApp = { id: 0n, kind: 'app', opcode: 'q::initAndInvariant', args: [] }
      this.recorder.onUserOperatorCall(initApp)

      const initResult = evaluateExpr(this.ctx, init).mapLeft(error => (failure = error))
      if (!isTrue(initResult)) {
        this.recorder.onUserOperatorReturn(initApp, [], initResult.map(rv.toQuintEx))
        continue
      }

      this.shift()

      const invResult = evaluateExpr(this.ctx, inv).mapLeft(error => (failure = error))
      this.recorder.onUserOperatorReturn(initApp, [], invResult.map(rv.toQuintEx))
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

          const stepResult = evaluateExpr(this.ctx, step).mapLeft(error => (failure = error))
          if (!isTrue(stepResult)) {
            // The run cannot be extended. In some cases, this may indicate a deadlock.
            // Since we are doing random simulation, it is very likely
            // that we have not generated good values for extending
            // the run. Hence, do not report an error here, but simply
            // drop the run. Otherwise, we would have a lot of false
            // positives, which look like deadlocks but they are not.

            this.recorder.onUserOperatorReturn(stepApp, [], stepResult.map(rv.toQuintEx))
            this.recorder.onRunReturn(right({ id: 0n, kind: 'bool', value: true }), this.trace.get())
            break
          }

          this.shift()

          const invResult = evaluateExpr(this.ctx, inv).mapLeft(error => (failure = error))
          if (!isTrue(invResult)) {
            errorsFound++
          }
          this.recorder.onUserOperatorReturn(stepApp, [], invResult.map(rv.toQuintEx))
        }
      }

      const outcome: Either<QuintError, QuintEx> = failure
        ? left(failure)
        : right({ id: 0n, kind: 'bool', value: errorsFound == 0 })
      this.recorder.onRunReturn(outcome, this.trace.get())
      // this.nextVars = new Map([...nextVarsSnapshot.entries()])
    }

    const outcome: Either<QuintError, QuintEx> = failure
      ? left(failure)
      : right({ id: 0n, kind: 'bool', value: errorsFound == 0 })

    return outcome
  }

  test(name: string, test: QuintEx, maxSamples: number): TestResult {
    this.trace.reset()
    // save the initial seed
    let seed = this.rng.getState()

    let nsamples = 1
    // run up to maxSamples, stop on the first failure
    for (; nsamples <= maxSamples; nsamples++) {
      // record the seed value
      seed = this.rng.getState()
      this.recorder.onRunCall()
      // reset the trace
      this.trace.reset()
      // run the test
      const result = evaluateExpr(this.ctx, test).map(e => e.toQuintEx(zerog))

      // extract the trace
      const trace = this.trace.get()

      if (trace.length > 0) {
        this.recorder.onRunReturn(result, trace)
      } else {
        // Report a non-critical error
        console.error('Missing a trace')
        this.recorder.onRunReturn(result, [])
      }

      const bestTrace = this.recorder.bestTraces[0].frame
      // evaluate the result
      if (result.isLeft()) {
        // if the test failed, return immediately
        return {
          name,
          status: 'failed',
          errors: [result.value],
          seed,
          frames: bestTrace.subframes,
          nsamples: nsamples,
        }
      }

      const ex = result.value
      if (ex.kind !== 'bool') {
        // if the test returned a malformed result, return immediately
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
          reference: test.id,
        }
        //         options.onTrace(
        //   index,
        //   name,
        //   status,
        //   ctx.evaluationState.vars.map(v => v.name),
        //   states
        // )

        // saveTrace(bestTrace, index, name, 'failed')
        return {
          name,
          status: 'failed',
          errors: [error],
          seed: seed,
          frames: bestTrace.subframes,
          nsamples: nsamples,
        }
      } else {
        if (this.rng.getState() === seed) {
          // This successful test did not use non-determinism.
          // Running it one time is sufficient.

          // saveTrace(bestTrace, index, name, 'passed')
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
    const bestTrace = this.recorder.bestTraces[0].frame
    // saveTrace(bestTrace, index, name, 'passed')
    return {
      name,
      status: 'passed',
      errors: [],
      seed: seed,
      frames: bestTrace.subframes,
      nsamples: nsamples - 1,
    }
  }
}

export function evaluateExpr(ctx: Context, expr: QuintEx): Either<QuintError, RuntimeValue> {
  const id = expr.id
  if (id === 0n || !ctx.memoEnabled) {
    return evaluateNewExpr(ctx, expr).mapLeft(err => (err.reference === undefined ? { ...err, reference: id } : err))
  }

  if (ctx.memo.has(id)) {
    // if (ctx.pureKeys.has(id)) {
    //   console.log('pure key', id, expressionToString(expr))
    // }
    return ctx.memo.get(id)!
  }

  const result = evaluateNewExpr(ctx, expr).mapLeft(err =>
    err.reference === undefined ? { ...err, reference: id } : err
  )
  ctx.memo.set(id, result)
  return result
}

export function evaluateUnderDefContext(
  ctx: Context,
  def: LookupDefinition,
  evaluate: () => Either<QuintError, RuntimeValue>
): Either<QuintError, RuntimeValue> {
  if (def.kind === 'def' && def.qualifier === 'nondet' && ctx.memoEnabled) {
    ctx.disableMemo()
    const r = evaluateUnderDefContext(ctx, def, evaluate)
    ctx.enableMemo()
    return r
  }

  if (!def.importedFrom || def.importedFrom.kind !== 'instance') {
    return evaluate()
  }

  const instance = def.importedFrom
  const overrides: [bigint, Either<QuintError, RuntimeValue>][] = instance.overrides.map(([param, expr]) => {
    const id = ctx.table.get(param.id)!.id

    return [id, evaluateExpr(ctx, expr)]
  })

  ctx.addConstants(ImmutableMap(overrides))
  ctx.addNamespaces(List(def.namespaces))
  ctx.disableMemo() // We could have one memo per constant

  const result = evaluate()

  ctx.removeConstants()
  ctx.removeNamespaces()
  ctx.enableMemo()

  return result
}

function evaluateNondet(ctx: Context, def: QuintOpDef): Either<QuintError, RuntimeValue> {
  const previousPick = ctx.nondetPicks.get(def.id)
  if (previousPick) {
    return previousPick.value
  }

  const pick = evaluateExpr(ctx, def.expr)
  ctx.nondetPicks = ctx.nondetPicks.set(def.id, { name: def.name, value: pick })
  return pick
}

function evaluateDef(ctx: Context, def: LookupDefinition): Either<QuintError, RuntimeValue> {
  return evaluateUnderDefContext(ctx, def, () => {
    switch (def.kind) {
      case 'def':
        if (def.qualifier === 'nondet') {
          return evaluateNondet(ctx, def)
        }

        if (def.qualifier === 'action') {
          const app: QuintApp = { id: def.id, kind: 'app', opcode: def.name, args: [] }
          ctx.recorder.onUserOperatorCall(app)
          const result = evaluateExpr(ctx, def.expr)
          ctx.recorder.onUserOperatorReturn(app, [], result.map(rv.toQuintEx))
        }

        return evaluateExpr(ctx, def.expr)
      case 'param': {
        const result = ctx.params.get(def.id)

        if (!result) {
          return left({ code: 'QNT501', message: `Parameter ${def.name} not set in context` })
        }
        return result
      }
      case 'var': {
        ctx.discoverVar(def.id, def.name)
        const result = ctx.getVar(def.id)

        if (!result) {
          return left({ code: 'QNT502', message: `Variable ${def.name} not set` })
        }
        return result
      }
      case 'const':
        const constValue = ctx.consts.get(def.id)
        if (!constValue) {
          return left({ code: 'QNT503', message: `Constant ${def.name}(id: ${def.id}) not set` })
        }
        return constValue

      default:
        return left({ code: 'QNT000', message: `Not implemented for def kind ${def.kind}` })
    }
  })
}

function evaluateNewExpr(ctx: Context, expr: QuintEx): Either<QuintError, RuntimeValue> {
  switch (expr.kind) {
    case 'int':
    case 'bool':
    case 'str':
      // These are already values, just return them
      return right(rv.fromQuintEx(expr))
    case 'lambda':
      // Lambda is also like a value, but we should construct it with the context
      return right(rv.mkLambda(expr.params, expr.expr, ctx))
    case 'name':
      const def = ctx.table.get(expr.id)
      if (!def) {
        return builtinValue(expr.name)
      }
      return evaluateDef(ctx, def)
    case 'app':
      // In these special ops, we don't want to evaluate the arguments before evaluating application
      if (lazyOps.includes(expr.opcode)) {
        return lazyBuiltinLambda(ctx, expr.opcode)(expr.args)
      }

      const op = lambdaForApp(ctx, expr)
      const args = expr.args.map(arg => evaluateExpr(ctx, arg))
      if (args.some(arg => arg.isLeft())) {
        return args.find(arg => arg.isLeft())!
      }
      return op(args.map(a => a.unwrap()))
    case 'let':
      return evaluateExpr(ctx, expr.expr)
  }
}

function lambdaForApp(ctx: Context, app: QuintApp): (args: RuntimeValue[]) => Either<QuintError, RuntimeValue> {
  const { id, opcode } = app

  if (!ctx.table.has(id)) {
    return builtinLambda(ctx, opcode)
  }

  const def = ctx.table.get(id)!
  const value = evaluateDef(ctx, def)
  if (value.isLeft()) {
    return _ => value
  }
  const arrow = value.value.toArrow()
  return args => {
    ctx.recorder.onUserOperatorCall(app)
    const result = arrow(args)
    ctx.recorder.onUserOperatorReturn(app, [], result.map(rv.toQuintEx))
    return result
  }
}

export function isTrue(value: Either<QuintError, RuntimeValue>): boolean {
  return value.isRight() && value.value.toBool() === true
}
