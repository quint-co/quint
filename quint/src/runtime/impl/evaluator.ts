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
import { expressionToString } from '../../ir/IRprinting'

export type EvalFunction = (ctx: Context) => Either<QuintError, RuntimeValue>

export class Evaluator {
  public ctx: Context
  public recorder: TraceRecorder
  private trace: Trace = new Trace()
  private rng: Rng
  private lookupTable: LookupTable

  constructor(table: LookupTable, recorder: TraceRecorder, rng: Rng) {
    this.ctx = new Context(recorder, rng.next)
    this.recorder = recorder
    this.rng = rng
    this.lookupTable = table
  }

  get table(): LookupTable {
    console.log('getting table')
    return this.lookupTable
  }

  updateTable(table: LookupTable) {
    this.lookupTable = table
  }

  shift() {
    if (this.ctx.varStorage.nextVars.size === 0) {
      return
    }
    this.ctx.varStorage.shiftVars()
    this.trace.extend(this.ctx.varStorage.asRecord())
    // TODO: save on trace
    this.ctx.nondetPicks = ImmutableMap()
    // this.ctx.clearMemo() // FIXME: clear only non-pure
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
    const value = evaluateExpr(this.table, expr)(this.ctx)
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
    //

    const initEval = evaluateExpr(this.table, init)
    const stepEval = evaluateExpr(this.table, step)
    const invEval = evaluateExpr(this.table, inv)

    // TODO: room for improvement here
    for (let runNo = 0; errorsFound < ntraces && !failure && runNo < nruns; runNo++) {
      this.recorder.onRunCall()
      this.trace.reset()
      this.ctx.reset()
      // Mocked def for the trace recorder
      const initApp: QuintApp = { id: 0n, kind: 'app', opcode: 'q::initAndInvariant', args: [] }
      this.recorder.onUserOperatorCall(initApp)

      const initResult = initEval(this.ctx).mapLeft(error => (failure = error))
      if (!isTrue(initResult)) {
        this.recorder.onUserOperatorReturn(initApp, [], initResult.map(rv.toQuintEx))
        continue
      }

      this.shift()

      const invResult = invEval(this.ctx).mapLeft(error => (failure = error))
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

          const stepResult = stepEval(this.ctx).mapLeft(error => (failure = error))
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

          const invResult = invEval(this.ctx).mapLeft(error => (failure = error))
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

    const testEval = evaluateExpr(this.table, test)

    let nsamples = 1
    // run up to maxSamples, stop on the first failure
    for (; nsamples <= maxSamples; nsamples++) {
      // record the seed value
      seed = this.rng.getState()
      this.recorder.onRunCall()
      // reset the trace
      this.trace.reset()
      // run the test
      const result = testEval(this.ctx).map(e => e.toQuintEx(zerog))

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

export function evaluateExpr(table: LookupTable, expr: QuintEx): (ctx: Context) => Either<QuintError, RuntimeValue> {
  console.log('building expr', expr.id)
  const exprEval = evaluateNewExpr(table, expr)
  return ctx => exprEval(ctx).mapLeft(err => (err.reference === undefined ? { ...err, reference: expr.id } : err))
  // return ctx => {
  //   const id = expr.id
  //   if (id === 0n) {
  //     return evaluateNewExpr(
  //       ctx,
  //       expr
  //     )(ctx).mapLeft(err => (err.reference === undefined ? { ...err, reference: id } : err))
  //   }
  //   const memoValue = ctx.memo.get(id)
  //   if (memoValue === undefined) {
  //     const result = evaluateNewExpr(ctx, expr)
  //     ctx.memo.set(id, result)
  //     return result(ctx).mapLeft(err => (err.reference === undefined ? { ...err, reference: id } : err))
  //   }

  //   return memoValue!(ctx)
  // }

  // console.log('[get] expression', expressionToString(expr), 'memo enabled:', ctx.memoEnabled)
  // if (ctx.memo.has(id)) {
  //   // if (ctx.pureKeys.has(id)) {
  //   //   console.log('pure key', id, expressionToString(expr))
  //   // }
  //   return ctx.memo.get(id)!
  // }

  // return ctx =>
  //   evaluateNewExpr(ctx, expr)(ctx).mapLeft(err => (err.reference === undefined ? { ...err, reference: id } : err))
  // console.log('[set] expression', expressionToString(expr), 'memo enabled:', ctx.memoEnabled)
  // if (ctx.memoEnabled) {
  //   ctx.memo.set(id, result)
  // }
}

export function evaluateUnderDefContext(
  table: LookupTable,
  def: LookupDefinition,
  evaluate: (ctx: Context) => Either<QuintError, RuntimeValue>
): (ctx: Context) => Either<QuintError, RuntimeValue> {
  if (!def.importedFrom || def.importedFrom.kind !== 'instance') {
    return evaluate
  }
  const instance = def.importedFrom

  const overrides: [bigint, (ctx: Context) => Either<QuintError, RuntimeValue>][] = instance.overrides.map(
    ([param, expr]) => {
      const id = table.get(param.id)!.id

      return [id, evaluateExpr(table, expr)]
    }
  )

  return ctx => {
    const constsBefore = ctx.consts
    const namespacesBefore = ctx.namespaces

    ctx.consts = ImmutableMap(overrides.map(([id, evaluate]) => [id, evaluate(ctx)]))
    ctx.namespaces = List(def.namespaces)
    // ctx.addNamespaces(List(def.namespaces))
    // ctx.disableMemo() // We could have one memo per constant

    const result = evaluate(ctx)

    ctx.consts = constsBefore
    ctx.namespaces = namespacesBefore
    // ctx.removeNamespaces()
    // ctx.enableMemo()
    return result
  }
}

function evaluateNondet(
  ctx: Context,
  def: QuintOpDef,
  bodyEval: (ctx: Context) => Either<QuintError, RuntimeValue>
): Either<QuintError, RuntimeValue> {
  const previousPick = ctx.nondetPicks.get(def.id)
  if (previousPick) {
    return previousPick.value
  }

  const pick = bodyEval(ctx)
  ctx.nondetPicks = ctx.nondetPicks.set(def.id, { name: def.name, value: pick })
  return pick
}

function evaluateDefCore(
  table: LookupTable,
  def: LookupDefinition
): (ctx: Context) => Either<QuintError, RuntimeValue> {
  switch (def.kind) {
    case 'def':
      if (def.qualifier === 'nondet') {
        const body = evaluateExpr(table, def.expr)
        return (ctx: Context) => {
          ctx.disableMemo()
          return evaluateNondet(ctx, def, body)
        }
      }

      if (def.qualifier === 'action') {
        const app: QuintApp = { id: def.id, kind: 'app', opcode: def.name, args: [] }
        const body = evaluateExpr(table, def.expr)
        return (ctx: Context) => {
          ctx.recorder.onUserOperatorCall(app)
          const result = body(ctx)
          ctx.recorder.onUserOperatorReturn(app, [], result.map(rv.toQuintEx))
          return result
        }
      }

      return evaluateExpr(table, def.expr)
    case 'param': {
      return (ctx: Context) => {
        ctx.disableMemo()
        const result = ctx.params.get(def.id)

        if (!result) {
          return left({ code: 'QNT501', message: `Parameter ${def.name} not set in context` })
        }
        return result
      }
    }
    case 'var': {
      return (ctx: Context) => {
        ctx.disableMemo()
        const result = ctx.getVar(def.id)

        if (!result) {
          return left({ code: 'QNT502', message: `Variable ${def.name} not set` })
        }
        return result
      }
    }
    case 'const':
      return (ctx: Context) => {
        ctx.disableMemo()
        const constValue = ctx.consts.get(def.id)
        if (!constValue) {
          return left({ code: 'QNT503', message: `Constant ${def.name}(id: ${def.id}) not set` })
        }
        return constValue
      }

    default:
      return _ => left({ code: 'QNT000', message: `Not implemented for def kind ${def.kind}` })
  }
}

function evaluateDef(table: LookupTable, def: LookupDefinition): (ctx: Context) => Either<QuintError, RuntimeValue> {
  return evaluateUnderDefContext(table, def, evaluateDefCore(table, def))
}

function evaluateNewExpr(table: LookupTable, expr: QuintEx): (ctx: Context) => Either<QuintError, RuntimeValue> {
  switch (expr.kind) {
    case 'int':
    case 'bool':
    case 'str':
      // These are already values, just return them
      return _ => right(rv.fromQuintEx(expr))
    case 'lambda':
      // Lambda is also like a value, but we should construct it with the context
      const body = evaluateExpr(table, expr.expr)
      const lambda = rv.mkLambda(expr.params, body)
      return _ => right(lambda)
    case 'name':
      const def = table.get(expr.id)
      if (!def) {
        // TODO: Do we also need to return builtin ops for higher order usage?
        const lambda = builtinValue(expr.name)
        return _ => lambda
      }
      return evaluateDef(table, def)
    case 'app':
      if (expr.opcode === 'assign') {
        const varDef = table.get(expr.args[0].id)!
        const exprEval = evaluateExpr(table, expr.args[1])
        // make sure it is registered in the storage

        return evaluateUnderDefContext(table, varDef, ctx => {
          ctx.discoverVar(varDef.id, varDef.name)
          return exprEval(ctx).map(value => {
            ctx.setNextVar(varDef.id, value)
            return rv.mkBool(true)
          })
        })
      }

      const args = expr.args.map(arg => evaluateExpr(table, arg))

      // In these special ops, we don't want to evaluate the arguments before evaluating application
      if (lazyOps.includes(expr.opcode)) {
        const op = lazyBuiltinLambda(expr.opcode)
        return ctx => op(ctx, args)
      }

      const op = lambdaForApp(table, expr)
      return ctx => {
        const argValues = args.map(arg => arg(ctx))
        if (argValues.some(arg => arg.isLeft())) {
          return argValues.find(arg => arg.isLeft())!
        }

        return op(
          ctx,
          argValues.map(a => a.unwrap())
        )
      }
    case 'let':
      return evaluateExpr(table, expr.expr)
  }
}

function lambdaForApp(
  table: LookupTable,
  app: QuintApp
): (ctx: Context, args: RuntimeValue[]) => Either<QuintError, RuntimeValue> {
  const { id, opcode } = app

  const def = table.get(id)!
  if (!def) {
    return builtinLambda(opcode)
  }

  const value = evaluateDef(table, def)
  return (ctx, args) => {
    const lambdaResult = value(ctx)
    if (lambdaResult.isLeft()) {
      return lambdaResult
    }
    const arrow = lambdaResult.value.toArrow()

    ctx.recorder.onUserOperatorCall(app)
    const result = arrow(ctx, args)
    ctx.recorder.onUserOperatorReturn(app, [], result.map(rv.toQuintEx))
    return result
  }
}

export function isTrue(value: Either<QuintError, RuntimeValue>): boolean {
  return value.isRight() && value.value.toBool() === true
}
