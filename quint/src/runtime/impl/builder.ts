/* ----------------------------------------------------------------------------------
 * Copyright 2022-2024 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * A builder to build arrow functions used to evaluate Quint expressions.
 *
 * Caching and var storage are heavily based on the original `compilerImpl.ts` file written by Igor Konnov.
 * The performance of evaluation relies on a lot of memoization done mainly with closures in this file.
 * We define registers and cached value data structures that work as pointers, to avoid the most lookups and
 * memory usage as possible. This adds a lot of complexity to the code, but it is necessary to achieve feasible
 * performance, as the functions built here will be called thousands of times by the simulator.
 *
 * @author Igor Konnov, Gabriela Moreira
 *
 * @module
 */

import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import { QuintError } from '../../quintError'
import { RuntimeValue, rv } from './runtimeValue'
import { builtinLambda, builtinValue, lazyBuiltinLambda, lazyOps } from './builtins'
import { CachedValue, Context, Register } from './Context'
import { QuintApp, QuintEx, QuintVar } from '../../ir/quintIr'
import { LookupDefinition, LookupTable } from '../../names/base'
import { NamedRegister, VarStorage, initialRegisterValue } from './VarStorage'
import { List } from 'immutable'
import { isEqual } from 'lodash'
import { Maybe } from '@sweet-monads/maybe'

/**
 * The type returned by the builder in its methods, which can be called to get the
 * evaluation result under a given context.
 */
export type EvalFunction = (ctx: Context) => Either<QuintError, RuntimeValue>

/**
 * A builder to build arrow functions used to evaluate Quint expressions.
 * It can be understood as a Quint compiler that compiles Quint expressions into
 * typescript arrow functions. It is called a builder instead of compiler because
 * the compiler term is overloaded.
 */
export class Builder {
  table: LookupTable
  paramRegistry: Map<bigint, Register> = new Map()
  constRegistry: Map<bigint, Register> = new Map()
  scopedCachedValues: Map<bigint, CachedValue> = new Map()
  initialNondetPicks: Map<string, RuntimeValue | undefined> = new Map()
  memo: Map<bigint, EvalFunction> = new Map()
  memoByInstance: Map<bigint, Map<bigint, EvalFunction>> = new Map()
  namespaces: List<string> = List()
  varStorage: VarStorage

  /**
   * Constructs a new Builder instance.
   *
   * @param table - The lookup table containing definitions.
   * @param storeMetadata - A flag indicating whether to store metadata (`actionTaken` and `nondetPicks`).
   */
  constructor(table: LookupTable, storeMetadata: boolean) {
    this.table = table
    this.varStorage = new VarStorage(storeMetadata, this.initialNondetPicks)
  }

  /**
   * Adds a variable to the var storage if it is not there yet.
   *
   * @param id
   * @param name
   */
  discoverVar(id: bigint, name: string) {
    // Keep the key as simple as possible
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

  /**
   * Gets the register for a variable by its id and the namespaces in scope (tracked by this builder).
   *
   * @param def - The variable to get the register for.
   *
   * @returns the register for the variable
   */
  getVar(def: QuintVar): NamedRegister {
    const key = [def.id, ...this.namespaces].join('#')
    const result = this.varStorage.vars.get(key)
    if (!result) {
      this.discoverVar(def.id, def.name)
      return this.varStorage.vars.get(key)!
    }

    return result
  }

  /**
   * Gets the register for the next state of a variable by its id and the namespaces in scope (tracked by this builder).
   *
   * @param id - The identifier of the variable.
   *
   * @returns the register for the next state of the variable
   */
  getNextVar(id: bigint): NamedRegister {
    const key = [id, ...this.namespaces].join('#')
    const result = this.varStorage.nextVars.get(key)
    if (!result) {
      throw new Error(`Variable not found: ${key}`)
    }

    return result
  }

  /**
   * Gets the register for a constant by its id and the instances in scope (tracked by this builder).
   *
   * @param id - The identifier of the constant.
   * @param name - The constant name to be used in error messages.
   *
   * @returns the register for the constant
   */
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

/* Bulding functionality is given by functions that take a builder instead of Builder methods.
 * This should help separating responsability and splitting this into multiple files if ever needed */

/**
 * Builds an evaluation function for a given Quint expression.
 *
 * This function first checks if the expression has already been memoized. If it has,
 * it returns the memoized evaluation function. If not, it builds the core evaluation
 * function for the expression and wraps it to handle errors and memoization.
 *
 * @param builder - The Builder instance used to construct the evaluation function.
 * @param expr - The Quint expression to evaluate.
 *
 * @returns An evaluation function that takes a context and returns either a QuintError or a RuntimeValue.
 */
export function buildExpr(builder: Builder, expr: QuintEx): EvalFunction {
  if (builder.memo.has(expr.id)) {
    return builder.memo.get(expr.id)!
  }
  const exprEval = buildExprCore(builder, expr)
  const wrappedEval: EvalFunction = ctx => {
    try {
      // This is where we add the reference to the error, if it is not already there.
      // This way, we don't need to worry about references anywhere else :)
      return exprEval(ctx).mapLeft(err => (err.reference === undefined ? { ...err, reference: expr.id } : err))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error'
      return left({ code: 'QNT501', message: message, reference: expr.id })
    }
  }
  builder.memo.set(expr.id, wrappedEval)
  return wrappedEval
}

/**
 * Builds an evaluation function for a given definition.
 *
 * This function first checks if the definition has already been memoized. If it has,
 * it returns the memoized evaluation function. If the definition is imported from an instance,
 * it builds the evaluation function under the context of the instance. Otherwise, it builds the
 * core evaluation function for the definition and wraps it to handle errors and memoization.
 *
 * @param builder - The Builder instance used to construct the evaluation function.
 * @param def - The LookupDefinition to evaluate.
 *
 * @returns An evaluation function that takes a context and returns either a QuintError or a RuntimeValue.
 */
export function buildDef(builder: Builder, def: LookupDefinition): EvalFunction {
  if (!def.importedFrom || def.importedFrom.kind !== 'instance') {
    return buildDefWithMemo(builder, def)
  }

  return buildUnderDefContext(builder, def, () => buildDefWithMemo(builder, def))
}

/**
 * Given an arrow that builds something, wrap it in modifications over the builder so it has the proper context.
 * Specifically, this includes instance overrides in context so that the build function use the right registers
 * for the instance if it originated from an instance.
 *
 * @param builder - The builder instance.
 * @param def - The definition for which the context is being built.
 * @param buildFunction - The function that builds the EvalFunction.
 *
 * @returns the result of buildFunction, evaluated under the right context.
 */
function buildUnderDefContext(
  builder: Builder,
  def: LookupDefinition,
  buildFunction: () => EvalFunction
): EvalFunction {
  if (!def.importedFrom || def.importedFrom.kind !== 'instance') {
    // Nothing to worry about if there are no instances involved
    return buildFunction()
  }

  // This originates from an instance, so we need to handle overrides
  const instance = def.importedFrom

  // Save how the builder was before so we can restore it after
  const memoBefore = builder.memo
  const namespacesBefore = builder.namespaces

  // We need separate memos for each instance.
  // For example, if N is a constant, the expression N + 1 can have different values for different instances.
  // We re-use the same memo for the same instance. So, let's check if there is an existing memo,
  // or create and save a new one
  if (builder.memoByInstance.has(instance.id)) {
    builder.memo = builder.memoByInstance.get(instance.id)!
  } else {
    builder.memo = new Map()
    builder.memoByInstance.set(instance.id, builder.memo)
  }

  // We also need to update the namespaces to include the instance's namespaces.
  // So, if variable x is updated, we update the instance's x, i.e. my_instance::my_module::x
  builder.namespaces = List(def.namespaces)

  // Pre-compute as much as possible for the overrides: find the registers and find the expressions to evaluate
  // so we don't need to look that up in runtime
  const overrides: [Register, EvalFunction][] = instance.overrides.map(([param, expr]) => {
    const id = builder.table.get(param.id)!.id
    const register = builder.registerForConst(id, param.name)

    // Build the expr as a pure val def so it gets properly cached
    const purevalEval = buildDef(builder, { kind: 'def', qualifier: 'pureval', expr, name: param.name, id: param.id })
    return [register, purevalEval]
  })

  // Here, we have the right context to build the function. That is, all constants are pointing to the right registers,
  // and all namespaces are set for unambiguous variable access and update.
  const result = buildFunction()

  // Restore the builder to its previous state
  builder.namespaces = namespacesBefore
  builder.memo = memoBefore

  // And then, in runtime, we only need to evaluate the override expressions, update the respective registers
  // and then call the function that was built
  return ctx => {
    overrides.forEach(([register, evaluate]) => (register.value = evaluate(ctx)))
    return result(ctx)
  }
}

/**
 * Given a lookup definition, build the evaluation function for it, without worring about memoization or error handling.
 *
 * @param builder - The builder instance.
 * @param def - The definition for which the evaluation function is being built.
 *
 * @returns the evaluation function for the given definition.
 */
function buildDefCore(builder: Builder, def: LookupDefinition): EvalFunction {
  switch (def.kind) {
    case 'def': {
      if (def.qualifier === 'action') {
        // Create an app to be recorded
        const app: QuintApp = { id: def.id, kind: 'app', opcode: def.name, args: [] }

        const body = buildExpr(builder, def.expr)
        return (ctx: Context) => {
          if (def.expr.kind !== 'lambda') {
            // Lambdas are recorded when they are called, no need to record them here
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

      if (def.expr.kind === 'lambda' || def.depth === undefined || def.depth === 0) {
        // We need to avoid scoped caching in lambdas or top-level expressions
        // We still have memoization. This caching is special for scoped defs (let-ins)
        return buildExpr(builder, def.expr)
      }

      // Else, we are dealing with a scoped value.
      // We need to cache it, so every time we access it, it has the same value.
      const cachedValue = builder.scopedCachedValues.get(def.id)!

      const bodyEval = buildExpr(builder, def.expr)
      if (def.qualifier === 'nondet') {
        // Create an entry in the map for this nondet pick,
        // as we want the resulting record to be the same at every state.
        // Value is optional, and starts with undefined
        builder.initialNondetPicks.set(def.name, undefined)
      }

      return ctx => {
        if (cachedValue.value === undefined) {
          cachedValue.value = bodyEval(ctx)
        }

        if (def.qualifier === 'nondet') {
          cachedValue.value
            .map(value => ctx.varStorage.nondetPicks.set(def.name, value))
            .mapLeft(_ => ctx.varStorage.nondetPicks.set(def.name, undefined))
        }

        return cachedValue.value
      }
    }
    case 'param': {
      // Every parameter has a single register, and we just change this register's value before evaluating the body
      // So, a reference to a parameter simply evaluates to the value of the register.
      const register = builder.paramRegistry.get(def.id)
      if (!register) {
        const reg: Register = { value: left({ code: 'QNT501', message: `Parameter ${def.name} not set` }) }
        builder.paramRegistry.set(def.id, reg)
        return _ => reg.value
      }
      return _ => register.value
    }

    case 'var': {
      // Every variable has a single register, and we just change this register's value at each state
      // So, a reference to a variable simply evaluates to the value of the register.
      const register = builder.getVar(def)
      return _ => {
        return register.value
      }
    }
    case 'const': {
      // Every constant has a single register, and we just change this register's value when overrides are present
      // So, a reference to a constant simply evaluates to the value of the register.
      const register = builder.registerForConst(def.id, def.name)
      return _ => register.value
    }
    default:
      return _ => left({ code: 'QNT000', message: `Not implemented for def kind ${def.kind}` })
  }
}

/**
 * Builds a definition with memoization and caching.
 * - Memoization: use the same built function for the same definition.
 * - Caching: for top-level value definitions, cache the resulting value being aware of variable changes.
 *
 * @param builder - The builder instance.
 * @param def - The definition for which the evaluation function is being built.
 *
 * @returns the evaluation function for the given definition.
 */
function buildDefWithMemo(builder: Builder, def: LookupDefinition): EvalFunction {
  if (builder.memo.has(def.id)) {
    return builder.memo.get(def.id)!
  }

  const defEval = buildDefCore(builder, def)

  // For top-level value definitions, we can cache the resulting value, as long as we are careful with state changes.
  const statefulCachingCondition =
    def.kind === 'def' &&
    (def.qualifier === 'pureval' || def.qualifier === 'val') &&
    (def.depth === undefined || def.depth === 0)

  if (!statefulCachingCondition) {
    // Only use memo, no runtime caching
    builder.memo.set(def.id, defEval)
    return defEval
  }

  // PS: Since we memoize things separately per instance, we can store even values that depend on constants

  // Construct a cached value object (a register with optional value)
  const cachedValue: CachedValue = { value: undefined }
  if (def.qualifier === 'val') {
    // This definition may use variables, so we need to clear the cache when they change
    builder.varStorage.cachesToClear.push(cachedValue)
  }
  // Wrap the evaluation function with caching
  const wrappedEval: EvalFunction = ctx => {
    if (cachedValue.value === undefined) {
      cachedValue.value = defEval(ctx)
    }
    return cachedValue.value
  }
  builder.memo.set(def.id, wrappedEval)
  return wrappedEval
}

/**
 * Given an expression, build the evaluation function for it, without worring about memoization or error handling.
 *
 * @param builder - The builder instance.
 * @param expr - The expression for which the evaluation function is being built.
 *
 * @returns the evaluation function for the given expression.
 */
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
        // FIXME: If this refers to a builtin operator, we need to return it as an arrow (see #1332)
        return builtinValue(expr.name)
      }
      return buildDef(builder, def)
    }
    case 'app': {
      if (expr.opcode === 'assign') {
        // Assign is too special, so we handle it separately.
        // We need to build things under the context of the variable being assigned, as it may come from an instance,
        // and that changed everything
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

      // If the operator is a lazy operator, we can't evaluate the arguments before evaluating application
      if (lazyOps.includes(expr.opcode)) {
        const op = lazyBuiltinLambda(expr.opcode)
        return ctx => op(ctx, args)
      }

      // Otherwise, this is either a normal (eager) builtin, or an user-defined operator.
      // For both, we first evaluate the arguments and then apply the operator.

      const operatorFunction = buildApp(builder, expr)
      const userDefined = builder.table.has(expr.id)

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

        const result = operatorFunction(ctx, argValues)
        if (userDefined) {
          ctx.recorder.onUserOperatorReturn(expr, argValues, result)
        }
        return result
      }
    }
    case 'let': {
      if (expr.opdef.qualifier === 'nondet') {
        // Special treatment
        if (expr.opdef.expr.kind !== 'app') {
          // impossible
          throw new Error('Impossible case: nondet let expression is not an app')
        }

        const setEval = buildExpr(builder, expr.opdef.expr.args[0])

        let cache: CachedValue = { value: undefined }
        builder.scopedCachedValues.set(expr.opdef.id, cache)
        builder.memo.set(expr.opdef.id, _ => cache.value!)
        const bodyEval = buildExpr(builder, expr.expr)

        return ctx => {
          // TODO: if empty set, return false
          return setEval(ctx).chain(set => {
            if (set.cardinality().unwrap() === 0n) {
              return right(rv.mkBool(false))
            }

            const bounds = set.bounds()
            const positions: Either<QuintError, bigint[]> = mergeInMany(
              bounds.map((b): Either<QuintError, bigint> => {
                if (b.isJust()) {
                  const sz = b.value

                  if (sz === 0n) {
                    return left({ code: 'QNT509', message: `Applied oneOf to an empty set` })
                  }
                  return right(ctx.rand(sz))
                } else {
                  // An infinite set, pick an integer from the range [-2^255, 2^255).
                  // Note that pick on Nat uses the absolute value of the passed integer.
                  // TODO: make it a configurable parameter:
                  // https://github.com/informalsystems/quint/issues/279
                  return right(-(2n ** 255n) + ctx.rand(2n ** 256n))
                }
              })
            ).mapLeft(errors => errors[0])

            let result: Either<QuintError, RuntimeValue> = right(rv.mkBool(false))
            let newPositions = [...positions.unwrap()]

            function increment(positions: bigint[], bounds: bigint[]): bigint[] {
              const newPositions = [...positions]
              for (let i = newPositions.length - 1; i >= 0; i--) {
                if (newPositions[i] < bounds[i] - 1n) {
                  newPositions[i]++
                  return newPositions
                } else {
                  newPositions[i] = 0n
                }
              }
              return newPositions
            }

            do {
              const pickedValue = set.pick(newPositions.values())
              cache.value = pickedValue
              result = bodyEval(ctx)
              cache.value = undefined
              newPositions = increment(
                newPositions,
                bounds.map(b => b.unwrap())
              )
            } while (
              should_retry_nondet(bounds) &&
              result.isRight() &&
              isEqual(result.value, rv.mkBool(false)) &&
              !isEqual(newPositions, positions.unwrap())
            )

            return result
          })
        }
      }

      // First, we create a cached value (a register with optional value) for the definition in this let expression
      let cachedValue = builder.scopedCachedValues.get(expr.opdef.id)
      if (!cachedValue) {
        // TODO: check if either this is always the case or never the case.
        cachedValue = { value: undefined }
        builder.scopedCachedValues.set(expr.opdef.id, cachedValue)
      }
      // Then, we build the expression for the let body. It will use the lookup table and, every time it needs the value
      // for the definition under the let, it will use the cached value (or eval a new value and store it).
      const bodyEval = buildExpr(builder, expr.expr)
      return ctx => {
        const result = bodyEval(ctx)
        // After evaluating the whole let expression, we clear the cached value, as it is no longer in scope.
        // The next time the whole let expression is evaluated, the definition will be re-evaluated.
        cachedValue!.value = undefined
        return result
      }
    }
  }
}

/**
 * Builds the application function for a given Quint application.
 *
 * This function first checks if the application corresponds to a user-defined operator.
 * If it does, it retrieves the corresponding evaluation function. If the operator is a built-in,
 * it retrieves the built-in lambda function. The resulting function evaluates the operator
 * with the given context and arguments.
 *
 * @param builder - The Builder instance
 * @param app - The Quint application expression to evaluate.
 *
 * @returns A function that takes a context and arguments, and returns either a QuintError or a RuntimeValue.
 */
function buildApp(
  builder: Builder,
  app: QuintApp
): (ctx: Context, args: RuntimeValue[]) => Either<QuintError, RuntimeValue> {
  const def = builder.table.get(app.id)!
  if (!def) {
    // If it is not in the lookup table, it must be a builtin operator
    return builtinLambda(app.opcode)
  }

  const defEval = buildDef(builder, def)
  return (ctx, args) => {
    return defEval(ctx).chain(lambda => {
      const arrow = lambda.toArrow()
      return arrow(ctx, args)
    })
  }
}

/**
 * Constructs a fully qualified name by combining the given name with the namespaces.
 *
 * The namespaces are reversed and joined with the name using the "::" delimiter.
 *
 * @param name - The name to be qualified.
 * @param namespaces - A list of namespaces to be included in the fully qualified name.
 *
 * @returns The fully qualified name as a string.
 */
export function nameWithNamespaces(name: string, namespaces: List<string>): string {
  const revertedNamespaces = namespaces.reverse()
  return revertedNamespaces.push(name).join('::')
}

const RETRY_NONDET_SMALLER_THAN = BigInt(process.env.RETRY_NONDET_SMALLER_THAN ?? '100')

function should_retry_nondet(bounds: Maybe<bigint>[]): boolean {
  return bounds.every(b => {
    if (b.isJust()) {
      return b.value < RETRY_NONDET_SMALLER_THAN
    } else {
      return false
    }
  })
}
