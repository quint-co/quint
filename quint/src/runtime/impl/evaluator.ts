import { Either, left, right } from '@sweet-monads/either'
import { QuintApp, QuintEx, QuintOpDef } from '../../ir/quintIr'
import { LookupDefinition, LookupTable } from '../../names/base'
import { QuintError } from '../../quintError'
import { TraceRecorder } from '../trace'
import { builtinLambda, builtinValue, lazyBuiltinLambda, lazyOps } from './builtins'
import { Trace } from './trace'
import { RuntimeValue, rv } from './runtimeValue'
import { Context, Register } from './Context'
import { TestResult } from '../testing'
import { Rng } from '../../rng'
import { zerog } from '../../idGenerator'
import { List, Map as ImmutableMap } from 'immutable'
import { VarRegister, VarStorage } from './VarStorage'
import { expressionToString } from '../../ir/IRprinting'

export type EvalFunction = (ctx: Context) => Either<QuintError, RuntimeValue>

export class Builder {
  table: LookupTable
  paramRegistry: Map<bigint, Register> = new Map()
  constRegistry: Map<bigint, Register> = new Map()
  scopedCachedValues: Map<bigint, { value: Either<QuintError, RuntimeValue> | undefined }> = new Map()
  public namespaces: List<string> = List()
  public varStorage: VarStorage = new VarStorage()

  constructor(table: LookupTable) {
    this.table = table
  }

  discoverVar(id: bigint, name: string) {
    const key = [id, ...this.namespaces].join('#')
    console.log('discovering var', id, name, key)
    if (this.varStorage.vars.has(key)) {
      return
    }

    const revertedNamespaces = this.namespaces.reverse()
    const varName = revertedNamespaces.push(name).join('::')
    const register: VarRegister = { name: varName, value: left({ code: 'QNT502', message: 'Variable not set' }) }
    const nextRegister: VarRegister = { name: varName, value: left({ code: 'QNT502', message: 'Variable not set' }) }
    this.varStorage.vars = this.varStorage.vars.set(key, register)
    this.varStorage.nextVars = this.varStorage.nextVars.set(key, nextRegister)
  }

  getVar(id: bigint): VarRegister {
    const key = [id, ...this.namespaces].join('#')
    const result = this.varStorage.vars.get(key)
    if (!result) {
      throw new Error(`Variable not found: ${key}`)
    }

    return result
  }

  getNextVar(id: bigint): VarRegister {
    const key = [id, ...this.namespaces].join('#')
    const result = this.varStorage.nextVars.get(key)
    if (!result) {
      throw new Error(`Variable not found: ${key}`)
    }

    return result
  }
}

export class Evaluator {
  public ctx: Context
  public recorder: TraceRecorder
  private rng: Rng
  private builder: Builder

  constructor(table: LookupTable, recorder: TraceRecorder, rng: Rng) {
    this.recorder = recorder
    this.rng = rng
    this.builder = new Builder(table)
    this.ctx = new Context(recorder, rng.next, this.builder.varStorage)
  }

  get table(): LookupTable {
    console.log('getting table')
    return this.builder.table
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
    const value = evaluateExpr(this.builder, expr)(this.ctx)
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

    const initEval = evaluateExpr(this.builder, init)
    const stepEval = evaluateExpr(this.builder, step)
    const invEval = evaluateExpr(this.builder, inv)

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
        continue
      }

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

      const outcome = failure ? left(failure) : right(rv.mkBool(errorsFound == 0))
      this.recorder.onRunReturn(outcome, this.trace.get())
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

    const testEval = evaluateExpr(this.builder, test)

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

      const ex = result.value.toQuintEx(zerog)
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

export function evaluateExpr(builder: Builder, expr: QuintEx): (ctx: Context) => Either<QuintError, RuntimeValue> {
  const exprEval = evaluateNewExpr(builder, expr)
  return ctx => exprEval(ctx).mapLeft(err => (err.reference === undefined ? { ...err, reference: expr.id } : err))
}

export function buildUnderDefContext(
  builder: Builder,
  def: LookupDefinition,
  buildFunction: () => (ctx: Context) => Either<QuintError, RuntimeValue>
): (ctx: Context) => Either<QuintError, RuntimeValue> {
  if (!def.importedFrom || def.importedFrom.kind !== 'instance') {
    return buildFunction()
  }
  const instance = def.importedFrom

  const overrides: [Register, (ctx: Context) => Either<QuintError, RuntimeValue>][] = instance.overrides.map(
    ([param, expr]) => {
      const id = builder.table.get(param.id)!.id
      let register = builder.constRegistry.get(id)
      if (!register) {
        register = { value: left({ code: 'QNT504', message: `Constant ${param.name} not set` }) }
        builder.constRegistry.set(id, register)
      }

      return [register, evaluateExpr(builder, expr)]
    }
  )

  const namespacesBefore = builder.namespaces
  builder.namespaces = List(def.namespaces)

  const result = buildFunction()
  builder.namespaces = namespacesBefore

  return ctx => {
    overrides.forEach(([register, evaluate]) => (register.value = evaluate(ctx)))
    return result(ctx)
  }
}

function evaluateDefCore(builder: Builder, def: LookupDefinition): (ctx: Context) => Either<QuintError, RuntimeValue> {
  switch (def.kind) {
    case 'def':
      // if (def.qualifier === 'nondet') {
      //   const body = evaluateExpr(builder, def.expr)
      //   return (ctx: Context) => {
      //     return evaluateNondet(ctx, def, body)
      //   }
      // }

      if (def.qualifier === 'action') {
        const app: QuintApp = { id: def.id, kind: 'app', opcode: def.name, args: [] }
        const body = evaluateExpr(builder, def.expr)
        return (ctx: Context) => {
          ctx.recorder.onUserOperatorCall(app)
          const result = body(ctx)
          ctx.recorder.onUserOperatorReturn(app, [], result)
          return result
        }
      }

      if (def.expr.kind === 'lambda') {
        return evaluateExpr(builder, def.expr)
      }

      if (def.depth === undefined || def.depth === 0) {
        return evaluateExpr(builder, def.expr)
      }

      const cachedValue = builder.scopedCachedValues.get(def.id)!
      const bodyEval = evaluateExpr(builder, def.expr)

      return ctx => {
        if (cachedValue.value === undefined) {
          cachedValue.value = bodyEval(ctx)
          return cachedValue.value
        }
        return cachedValue.value
      }
    case 'param': {
      const register = builder.paramRegistry.get(def.id)
      if (!register) {
        const reg: Register = { value: left({ code: 'QNT501', message: `Parameter ${def.name} not set` }) }
        builder.paramRegistry.set(def.id, reg)
        return _ => reg.value
      }
      return _ => register.value
    }

    case 'var': {
      const register = builder.getVar(def.id)
      return _ => {
        return register.value
      }
    }
    case 'const':
      const register = builder.constRegistry.get(def.id)
      if (!register) {
        const reg: Register = { value: left({ code: 'QNT501', message: `Constant ${def.name} not set` }) }
        builder.constRegistry.set(def.id, reg)
        return _ => reg.value
      }
      return _ => register.value
    default:
      return _ => left({ code: 'QNT000', message: `Not implemented for def kind ${def.kind}` })
  }
}

function evaluateDef(builder: Builder, def: LookupDefinition): (ctx: Context) => Either<QuintError, RuntimeValue> {
  return buildUnderDefContext(builder, def, () => evaluateDefCore(builder, def))
}

function evaluateNewExpr(builder: Builder, expr: QuintEx): (ctx: Context) => Either<QuintError, RuntimeValue> {
  switch (expr.kind) {
    case 'int':
    case 'bool':
    case 'str':
      // These are already values, just return them
      const value = right(rv.fromQuintEx(expr))
      return _ => value
    case 'lambda':
      // Lambda is also like a value, but we should construct it with the context
      const body = evaluateExpr(builder, expr.expr)
      const lambda = rv.mkLambda(expr.params, body, builder.paramRegistry)
      return _ => right(lambda)
    case 'name':
      const def = builder.table.get(expr.id)
      if (!def) {
        // TODO: Do we also need to return builtin ops for higher order usage?
        const lambda = builtinValue(expr.name)
        return _ => lambda
      }
      return evaluateDef(builder, def)
    case 'app':
      if (expr.opcode === 'assign') {
        const varDef = builder.table.get(expr.args[0].id)!
        return buildUnderDefContext(builder, varDef, () => {
          console.log(expressionToString(expr))
          builder.discoverVar(varDef.id, varDef.name)
          const register = builder.getNextVar(varDef.id)
          const exprEval = evaluateExpr(builder, expr.args[1])

          return ctx => {
            return exprEval(ctx).map(value => {
              register.value = right(value)
              return rv.mkBool(true)
            })
          }
        })
      }

      const args = expr.args.map(arg => evaluateExpr(builder, arg))

      // In these special ops, we don't want to evaluate the arguments before evaluating application
      if (lazyOps.includes(expr.opcode)) {
        const op = lazyBuiltinLambda(expr.opcode)
        return ctx => op(ctx, args)
      }

      const op = lambdaForApp(builder, expr)
      return ctx => {
        const argValues = []
        for (const arg of args) {
          const argValue = arg(ctx)
          if (argValue.isLeft()) {
            return argValue
          }
          argValues.push(argValue.unwrap())
        }

        return op(ctx, argValues)
      }

    case 'let':
      let cachedValue = builder.scopedCachedValues.get(expr.opdef.id)
      if (!cachedValue) {
        cachedValue = { value: undefined }
        builder.scopedCachedValues.set(expr.opdef.id, cachedValue)
      }
      const bodyEval = evaluateExpr(builder, expr.expr)
      return ctx => {
        const result = bodyEval(ctx)
        cachedValue!.value = undefined
        return result
      }
  }
}

function lambdaForApp(
  builder: Builder,
  app: QuintApp
): (ctx: Context, args: RuntimeValue[]) => Either<QuintError, RuntimeValue> {
  const { id, opcode } = app

  const def = builder.table.get(id)!
  if (!def) {
    return builtinLambda(opcode)
  }

  const value = evaluateDef(builder, def)
  return (ctx, args) => {
    const lambdaResult = value(ctx)
    if (lambdaResult.isLeft()) {
      return lambdaResult
    }
    const arrow = lambdaResult.value.toArrow()

    ctx.recorder.onUserOperatorCall(app)
    const result = arrow(ctx, args)
    ctx.recorder.onUserOperatorReturn(app, [], result)
    return result
  }
}

export function isTrue(value: Either<QuintError, RuntimeValue>): boolean {
  return value.isRight() && value.value.toBool() === true
}

export function isFalse(value: Either<QuintError, RuntimeValue>): boolean {
  return value.isRight() && value.value.toBool() === false
}

export function profile<T>(name: string, f: () => T): T {
  // const start = Date.now()
  const r = f()
  // const end = Date.now()
  // console.log(`${name} took ${end - start}ms`)
  return r
}
