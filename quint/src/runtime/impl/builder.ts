import { Either, left, right } from '@sweet-monads/either'
import { QuintError } from '../../quintError'
import { RuntimeValue, rv } from './runtimeValue'
import { builtinLambda, builtinValue, lazyBuiltinLambda, lazyOps } from './builtins'
import { CachedValue, Context, Register } from './Context'
import { QuintApp, QuintEx } from '../../ir/quintIr'
import { LookupDefinition, LookupTable } from '../../names/base'
import { NamedRegister, VarStorage, initialRegisterValue } from './VarStorage'
import { List } from 'immutable'

export type EvalFunction = (ctx: Context) => Either<QuintError, RuntimeValue>

export class Builder {
  table: LookupTable
  paramRegistry: Map<bigint, Register> = new Map()
  constRegistry: Map<bigint, Register> = new Map()
  scopedCachedValues: Map<bigint, CachedValue> = new Map()
  initialNondetPicks: Map<string, RuntimeValue | undefined> = new Map()
  memo: Map<bigint, EvalFunction> = new Map()
  memoByInstance: Map<bigint, Map<bigint, EvalFunction>> = new Map()
  public namespaces: List<string> = List()
  public varStorage: VarStorage

  constructor(table: LookupTable, storeMetadata: boolean) {
    this.table = table
    this.varStorage = new VarStorage(storeMetadata, this.initialNondetPicks)
  }

  discoverVar(id: bigint, name: string) {
    const key = [id, ...this.namespaces].join('#')
    if (this.varStorage.vars.has(key)) {
      return
    }

    const varName = nameWithNamespaces(name, this.namespaces)
    const register: NamedRegister = { name: varName, value: initialRegisterValue(varName) }
    const nextRegister: NamedRegister = { name: varName, value: initialRegisterValue(varName) }
    this.varStorage.vars = this.varStorage.vars.set(key, register)
    this.varStorage.nextVars = this.varStorage.nextVars.set(key, nextRegister)
  }

  getVar(id: bigint): NamedRegister {
    const key = [id, ...this.namespaces].join('#')
    const result = this.varStorage.vars.get(key)
    if (!result) {
      throw new Error(`Variable not found: ${key}`)
    }

    return result
  }

  getNextVar(id: bigint): NamedRegister {
    const key = [id, ...this.namespaces].join('#')
    const result = this.varStorage.nextVars.get(key)
    if (!result) {
      throw new Error(`Variable not found: ${key}`)
    }

    return result
  }

  registerForConst(id: bigint, name: string): Register {
    let register = this.constRegistry.get(id)
    if (!register) {
      const message = `Uninitialized const ${name}. Use: import <moduleName>(${name}=<value>).*`
      register = { value: left({ code: 'QNT500', message }) }
      this.constRegistry.set(id, register)
      return register
    }
    return register
  }
}

export function buildExpr(builder: Builder, expr: QuintEx): EvalFunction {
  if (builder.memo.has(expr.id)) {
    return builder.memo.get(expr.id)!
  }
  const exprEval = buildExprCore(builder, expr)
  const wrappedEval: EvalFunction = ctx => {
    try {
      return exprEval(ctx).mapLeft(err => (err.reference === undefined ? { ...err, reference: expr.id } : err))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error'
      return left({ code: 'QNT501', message: message, reference: expr.id })
    }
  }
  builder.memo.set(expr.id, wrappedEval)
  return wrappedEval
}

export function buildUnderDefContext(
  builder: Builder,
  def: LookupDefinition,
  buildFunction: () => EvalFunction
): EvalFunction {
  if (!def.importedFrom || def.importedFrom.kind !== 'instance') {
    return buildFunction()
  }
  const instance = def.importedFrom
  const memoBefore = builder.memo
  if (builder.memoByInstance.has(instance.id)) {
    builder.memo = builder.memoByInstance.get(instance.id)!
  } else {
    builder.memo = new Map()
    builder.memoByInstance.set(instance.id, builder.memo)
  }

  const overrides: [Register, EvalFunction][] = instance.overrides.map(([param, expr]) => {
    const id = builder.table.get(param.id)!.id
    const register = builder.registerForConst(id, param.name)

    // Build the expr as a pure val def so it gets properly cached
    return [register, buildDef(builder, { kind: 'def', qualifier: 'pureval', expr, name: param.name, id: param.id })]
  })

  const namespacesBefore = builder.namespaces
  builder.namespaces = List(def.namespaces)

  const result = buildFunction()
  builder.namespaces = namespacesBefore
  builder.memo = memoBefore

  return ctx => {
    overrides.forEach(([register, evaluate]) => (register.value = evaluate(ctx)))
    return result(ctx)
  }
}

function buildDefCore(builder: Builder, def: LookupDefinition): EvalFunction {
  switch (def.kind) {
    case 'def': {
      if (def.qualifier === 'action') {
        const app: QuintApp = { id: def.id, kind: 'app', opcode: def.name, args: [] }
        const body = buildExpr(builder, def.expr)
        return (ctx: Context) => {
          if (def.expr.kind !== 'lambda') {
            ctx.recorder.onUserOperatorCall(app)
          }

          if (ctx.varStorage.actionTaken === undefined) {
            ctx.varStorage.actionTaken = def.name
          }

          const result = body(ctx)

          if (def.expr.kind !== 'lambda') {
            ctx.recorder.onUserOperatorReturn(app, [], result)
          }
          return result
        }
      }

      if (def.expr.kind === 'lambda') {
        return buildExpr(builder, def.expr)
      }

      if (def.depth === undefined || def.depth === 0) {
        return buildExpr(builder, def.expr)
      }

      let cachedValue = builder.scopedCachedValues.get(def.id)!

      const bodyEval = buildExpr(builder, def.expr)
      if (def.qualifier === 'nondet') {
        builder.initialNondetPicks.set(def.name, undefined)
      }

      return ctx => {
        if (cachedValue.value === undefined) {
          cachedValue.value = bodyEval(ctx)
          if (def.qualifier === 'nondet') {
            cachedValue.value
              .map(value => {
                ctx.varStorage.nondetPicks.set(def.name, value)
              })
              .mapLeft(_ => {
                ctx.varStorage.nondetPicks.set(def.name, undefined)
              })
          }
        }
        return cachedValue.value
      }
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
    case 'const': {
      const register = builder.registerForConst(def.id, def.name)
      return _ => register.value
    }
    default:
      return _ => left({ code: 'QNT000', message: `Not implemented for def kind ${def.kind}` })
  }
}

function buildDefWithMemo(builder: Builder, def: LookupDefinition): EvalFunction {
  if (builder.memo.has(def.id)) {
    return builder.memo.get(def.id)!
  }

  const defEval = buildDefCore(builder, def)

  if (
    !(
      def.kind === 'def' &&
      (def.qualifier === 'pureval' || def.qualifier === 'val') &&
      (def.depth === undefined || def.depth === 0)
    )
  ) {
    builder.memo.set(def.id, defEval)
    return defEval
  }

  // Since we cache things separately per instance, we can cache the value here
  const cachedValue: CachedValue = { value: undefined }
  if (def.qualifier === 'val') {
    // console.log('temp cache', def.name)
    builder.varStorage.cachesToClear.push(cachedValue)
  } else {
    // console.log('perm cache', def.name)
  }
  const wrappedEval: EvalFunction = ctx => {
    if (cachedValue.value === undefined) {
      cachedValue.value = defEval(ctx)
    }
    return cachedValue.value
  }
  builder.memo.set(def.id, wrappedEval)
  return wrappedEval
}

export function buildDef(builder: Builder, def: LookupDefinition): EvalFunction {
  if (!def.importedFrom || def.importedFrom.kind !== 'instance') {
    return buildDefWithMemo(builder, def)
  }

  return buildUnderDefContext(builder, def, () => buildDefWithMemo(builder, def))
}

function buildExprCore(builder: Builder, expr: QuintEx): EvalFunction {
  switch (expr.kind) {
    case 'int':
    case 'bool':
    case 'str': {
      // These are already values, just return them
      const value = right(rv.fromQuintEx(expr))
      return _ => value
    }
    case 'lambda': {
      // Lambda is also like a value, but we should construct it with the context
      const body = buildExpr(builder, expr.expr)
      const lambda = rv.mkLambda(expr.params, body, builder.paramRegistry)
      return _ => right(lambda)
    }
    case 'name': {
      const def = builder.table.get(expr.id)
      if (!def) {
        // TODO: Do we also need to return builtin ops for higher order usage?
        // Answer: yes, see #1332
        return builtinValue(expr.name)
      }
      return buildDef(builder, def)
    }
    case 'app': {
      if (expr.opcode === 'assign') {
        const varDef = builder.table.get(expr.args[0].id)!
        return buildUnderDefContext(builder, varDef, () => {
          builder.discoverVar(varDef.id, varDef.name)
          const register = builder.getNextVar(varDef.id)
          const exprEval = buildExpr(builder, expr.args[1])

          return ctx => {
            return exprEval(ctx).map(value => {
              register.value = right(value)
              return rv.mkBool(true)
            })
          }
        })
      }

      const args = expr.args.map(arg => buildExpr(builder, arg))

      // In these special ops, we don't want to evaluate the arguments before evaluating application
      if (lazyOps.includes(expr.opcode)) {
        const op = lazyBuiltinLambda(expr.opcode)
        return ctx => op(ctx, args)
      }

      const userDefined = builder.table.has(expr.id)

      const op = lambdaForApp(builder, expr)

      return ctx => {
        if (userDefined) {
          ctx.recorder.onUserOperatorCall(expr)
        }
        const argValues = []
        for (const arg of args) {
          const argValue = arg(ctx)
          if (argValue.isLeft()) {
            return argValue
          }
          argValues.push(argValue.unwrap())
        }

        const result = op(ctx, argValues)
        if (userDefined) {
          ctx.recorder.onUserOperatorReturn(expr, argValues, result)
        }
        return result
      }
    }
    case 'let': {
      let cachedValue = builder.scopedCachedValues.get(expr.opdef.id)
      if (!cachedValue) {
        cachedValue = { value: undefined }
        builder.scopedCachedValues.set(expr.opdef.id, cachedValue)
      }
      const bodyEval = buildExpr(builder, expr.expr)
      return ctx => {
        const result = bodyEval(ctx)
        cachedValue!.value = undefined
        return result
      }
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

  const value = buildDef(builder, def)
  return (ctx, args) => {
    const lambdaResult = value(ctx)
    if (lambdaResult.isLeft()) {
      return lambdaResult
    }
    const arrow = lambdaResult.value.toArrow()

    return arrow(ctx, args)
  }
}

export function nameWithNamespaces(name: string, namespaces: List<string>): string {
  const revertedNamespaces = namespaces.reverse()
  return revertedNamespaces.push(name).join('::')
}
