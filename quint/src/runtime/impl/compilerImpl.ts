/*
 * Compiler of Quint expressions and definitions to Computable values
 * that can be evaluated in the runtime.
 *
 * Igor Konnov, Gabriela Moreira, 2022-2024
 *
 * Copyright 2022-2024 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 */

import { strict as assert } from 'assert'
import { Maybe, just, none } from '@sweet-monads/maybe'
import { OrderedMap, Set } from 'immutable'
import { Presets, SingleBar } from 'cli-progress'

import { LookupTable } from '../../names/base'
import { IRVisitor } from '../../ir/IRVisitor'
import {
  Callable,
  Computable,
  ComputableKind,
  EvaluationResult,
  Register,
  fail,
  kindName,
  mkCallable,
  mkRegister,
} from '../runtime'

import { ExecutionListener } from '../trace'

import * as ir from '../../ir/quintIr'

import { RuntimeValue, RuntimeValueLambda, RuntimeValueVariant, rv } from './runtimeValue'
import { Trace } from './trace'
import { ErrorCode, QuintError, quintErrorToString } from '../../quintError'

import { inputDefName, lastTraceName } from '../compile'
import { prettyQuintEx, terminalWidth } from '../../graphics'
import { format } from '../../prettierimp'
import { unreachable } from '../../util'
import { zerog } from '../../idGenerator'
import { chunk, times } from 'lodash'
import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import { applyBoolOp, applyFold, applyFun, getListElem, mapLambdaThenReduce } from './operatorEvaluator'
import {
  CompilerErrorTracker,
  EvaluationState,
  mkConstComputable,
  mkFunComputable,
  specialNames,
  toMaybe,
} from './base'
import { updateList } from './operatorEvaluator'
import { sliceList } from './operatorEvaluator'

/**
 * Compiler visitor turns Quint definitions and expressions into Computable
 * objects, essentially, lazy JavaScript objects. Importantly, it does not do
 * any evaluation during the translation and thus delegates the actual
 * computation to the JavaScript engine. Since many of Quint operators may be
 * computationally expensive, it is crucial to maintain this separation of
 * compilation vs. computation.
 *
 * This class does not do any dynamic type checking, assuming that the type
 * checker will be run before the translation in the future. As we do not have
 * the type checker yet, computations may fail with weird JavaScript errors.
 */
export class CompilerVisitor implements IRVisitor {
  // the lookup table to use for the module
  private lookupTable: LookupTable
  // the stack of computable values
  private compStack: Computable[] = []
  // The map of identifiers (and sometimes, names) to their compiled values:
  //  - wrappers around RuntimeValue
  //  - an instance of Register
  //  - an instance of Callable.
  // The keys should be constructed via `kindName`.
  context: Map<string, Computable>

  // all variables declared during compilation
  private vars: Register[]
  // the registers allocated for the next-state values of vars
  private nextVars: Register[]
  // keeps errors in a state
  private errorTracker: CompilerErrorTracker
  // pre-initialized random number generator
  private rand
  // execution listener
  private execListener: ExecutionListener
  // a tracker for the current execution trace
  private trace: Trace

  // whether to track `actionTaken` and `nondetPicks`
  private storeMetadata: boolean
  // the chosen action in the last `any` evaluation
  private actionTaken: Maybe<RuntimeValue> = none()
  // a record with nondet definition names as fields and their last chosen value as values
  private nondetPicks: RuntimeValue // initialized at constructor

  // the current depth of operator definitions: top-level defs are depth 0
  // FIXME(#1279): The walk* functions update this value, but they need to be
  // initialized to -1 here for that to work on all scenarios.
  definitionDepth: number = -1

  constructor(
    lookupTable: LookupTable,
    rand: (bound: bigint) => bigint,
    evaluationState: EvaluationState,
    storeMetadata: boolean
  ) {
    this.lookupTable = lookupTable
    this.rand = rand
    this.storeMetadata = storeMetadata

    this.context = evaluationState.context
    this.vars = evaluationState.vars
    this.nextVars = evaluationState.nextVars
    this.errorTracker = evaluationState.errorTracker
    this.execListener = evaluationState.listener
    this.trace = evaluationState.trace

    this.nondetPicks = this.emptyNondetPicks()
  }

  /**
   * Get the compiler state.
   */
  getEvaluationState(): EvaluationState {
    return {
      context: this.context,
      vars: this.vars,
      nextVars: this.nextVars,
      errorTracker: this.errorTracker,
      listener: this.execListener,
      trace: this.trace,
    }
  }

  /**
   * Get the names of the compiled variables.
   */
  getVars(): string[] {
    return this.vars.map(r => r.name)
  }

  /**
   * Get the array of compile errors, which changes as the code gets executed.
   */
  getCompileErrors(): QuintError[] {
    return this.errorTracker.compileErrors
  }

  /**
   * Get the array of runtime errors, which changes as the code gets executed.
   */
  getRuntimeErrors(): QuintError[] {
    return this.errorTracker.runtimeErrors
  }

  exitOpDef(opdef: ir.QuintOpDef) {
    // Either a runtime value, or a def, action, etc.
    // All of them are compiled to callables, which may have zero parameters.
    let boundValue = this.compStack.pop() as Callable
    if (boundValue === undefined) {
      this.errorTracker.addCompileError(opdef.id, 'QNT501', `No expression for ${opdef.name} on compStack`)
      return
    }

    if (opdef.qualifier === 'action' && opdef.expr.kind !== 'lambda') {
      // A nullary action like `init` or `step`.
      // It is not handled via applyUserDefined.
      // Wrap this value with the listener calls.
      // Importantly, we do not touch the original boundValue, but decorate it.
      // Consider the following definitions:
      //   action input1 = step
      //   action input2 = step
      //
      // Both input1 and input2 wrap step, but in their individual computables.
      const unwrappedValue = boundValue
      const app: ir.QuintApp = { id: opdef.id, kind: 'app', opcode: opdef.name, args: [] }
      const evalApp: ir.QuintApp = { id: 0n, kind: 'app', opcode: '_', args: [app] }
      boundValue = {
        eval: () => {
          if (this.actionTaken.isNone()) {
            this.actionTaken = just(rv.mkStr(opdef.name))
          }

          if (app.opcode === inputDefName) {
            this.execListener.onUserOperatorCall(evalApp)
            // do not call onUserOperatorReturn on '_' later, as it may span over multiple frames
          } else {
            this.execListener.onUserOperatorCall(app)
          }
          const r = unwrappedValue.eval()
          this.execListener.onUserOperatorReturn(app, [], toMaybe(r))
          return r
        },
        nparams: unwrappedValue.nparams,
      }
    }

    if (this.definitionDepth === 0 && opdef.qualifier === 'pureval') {
      // a pure value may be cached, once evaluated
      const originalEval = boundValue.eval
      let cache: EvaluationResult | undefined = undefined
      boundValue.eval = () => {
        if (cache !== undefined) {
          return cache
        } else {
          cache = originalEval()
          return cache
        }
      }
    }

    if (opdef.qualifier === 'action' && opdef.expr.kind === 'lambda') {
      const unwrappedValue = boundValue
      boundValue = {
        eval: (args?: Either<QuintError, any>[]) => {
          if (this.actionTaken.isNone()) {
            this.actionTaken = just(rv.mkStr(opdef.name))
          }

          return unwrappedValue.eval(args)
        },
        nparams: unwrappedValue.nparams,
      }
    }

    const kname = kindName('callable', opdef.id)
    // bind the callable from the stack
    this.context.set(kname, boundValue)

    if (specialNames.includes(opdef.name)) {
      // bind the callable under its name as well
      this.context.set(kindName('callable', opdef.name), boundValue)
    }
  }

  exitLet(letDef: ir.QuintLet) {
    // When dealing with a `val` or `nondet`, freeze the callable under
    // the let definition. Otherwise, forms like 'nondet x = oneOf(S); A'
    // may produce multiple values for the same name 'x'
    // inside a single evaluation of A.
    // In case of `val`, this is simply an optimization.
    const qualifier = letDef.opdef.qualifier
    if (qualifier !== 'val' && qualifier !== 'nondet') {
      // a non-constant value, ignore
      return
    }

    // get the expression that is evaluated in the context of let.
    const exprUnderLet = this.compStack.slice(-1).pop()
    if (exprUnderLet === undefined) {
      this.errorTracker.addCompileError(
        letDef.opdef.id,
        'QNT501',
        `No expression for ${letDef.opdef.name} on compStack`
      )
      return
    }

    const kname = kindName('callable', letDef.opdef.id)
    const boundValue = this.context.get(kname) ?? fail
    // Override the behavior of the expression under let:
    // It precomputes the bound value and uses it in the evaluation.
    // Once the evaluation is done, the value is reset, so that
    // a new random value may be produced later.
    const undecoratedEval = exprUnderLet.eval
    const boundValueEval = boundValue.eval
    exprUnderLet.eval = () => {
      const cachedValue = boundValueEval()
      boundValue.eval = function () {
        return cachedValue
      }
      // compute the result and immediately reset the cache
      const result = undecoratedEval()

      // Store the nondet picks after evaluation as we want to collect them while we move up the IR tree,
      // to make sure all nondet values in scenarios like this are collected:
      // action step = any {
      //    someAction,
      //    nondet time = oneOf(times)
      //    timeRelatedAction(time)
      // }
      //
      // action timeRelatedAction(time) = any { AdvanceTime(time), RevertTime(time) }

      if (result.isRight() && qualifier === 'nondet') {
        // A nondet value was just defined, save it in the nondetPicks record.
        const value = rv.mkVariant('Some', cachedValue.value as RuntimeValue)
        this.nondetPicks = rv.mkRecord(this.nondetPicks.toOrderedMap().set(letDef.opdef.name, value))
      }
      boundValue.eval = boundValueEval
      return result
    }
  }

  exitConst(cdef: ir.QuintConst) {
    // all constants should be instantiated before running the simulator
    const code: ErrorCode = 'QNT500'
    const msg = `Uninitialized const ${cdef.name}. Use: import <moduleName>(${cdef.name}=<value>).*`
    this.errorTracker.addCompileError(cdef.id, code, msg)
  }

  exitVar(vardef: ir.QuintVar) {
    const varName = vardef.name

    // In the process of incremental compilation, we might revisit the same var
    // definition. Don't overwrite the register if that happens. In some cases
    // (with instances), the variable can have a different ID, but the same
    // name. In that case, we assign the register with that name for the new ID.
    if (this.context.has(kindName('var', varName))) {
      const register = this.context.get(kindName('var', varName))!
      this.context.set(kindName('var', vardef.id), register)

      if (this.context.has(kindName('nextvar', varName))) {
        const register = this.context.get(kindName('nextvar', varName))!
        this.context.set(kindName('nextvar', vardef.id), register)
      }

      return
    }

    // simply introduce two registers:
    //  one for the variable, and
    //  one for its next-state version
    const prevRegister = mkRegister('var', varName, none(), {
      code: 'QNT502',
      message: `Variable ${varName} is not set`,
      reference: vardef.id,
    })
    this.vars.push(prevRegister)
    // at the moment, we have to refer to variables both via id and name
    this.context.set(kindName('var', varName), prevRegister)
    this.context.set(kindName('var', vardef.id), prevRegister)
    const nextRegister = mkRegister('nextvar', varName, none(), {
      code: 'QNT502',
      message: `${varName}' is not set`,
      reference: vardef.id,
    })
    this.nextVars.push(nextRegister)
    // at the moment, we have to refer to variables both via id and name
    this.context.set(kindName('nextvar', varName), nextRegister)
    this.context.set(kindName('nextvar', vardef.id), nextRegister)
  }

  enterLiteral(expr: ir.QuintBool | ir.QuintInt | ir.QuintStr) {
    switch (expr.kind) {
      case 'bool':
        this.compStack.push(mkConstComputable(rv.mkBool(expr.value)))
        break

      case 'int':
        this.compStack.push(mkConstComputable(rv.mkInt(expr.value)))
        break

      case 'str':
        this.compStack.push(mkConstComputable(rv.mkStr(expr.value)))
        break

      default:
        unreachable(expr)
    }
  }

  enterName(name: ir.QuintName) {
    if (name.name === lastTraceName) {
      this.compStack.push(mkConstComputable(rv.mkList(this.trace.get())))
      return
    }
    // The name belongs to one of the objects:
    // a shadow variable, a variable, an argument, a callable.
    // The order is important, as defines the name priority.
    const comp =
      this.contextLookup(name.id, ['arg', 'var', 'callable']) ??
      // a backup case for Nat, Int, and Bool, and special names such as q::input
      this.contextGet(name.name, ['arg', 'callable'])
    if (comp) {
      // this name has an associated computable object already
      this.compStack.push(comp)
    } else {
      // this should not happen, due to the name resolver
      this.errorTracker.addCompileError(name.id, 'QNT502', `Name ${name.name} not found`)
      this.compStack.push(fail)
    }
  }

  exitApp(app: ir.QuintApp) {
    if (!ir.isQuintBuiltin(app)) {
      this.applyUserDefined(app)
    } else {
      switch (app.opcode) {
        case 'next':
          {
            const register = this.compStack.pop()
            if (register) {
              const name = (register as Register).name
              const nextvar = this.contextGet(name, ['nextvar'])
              this.compStack.push(nextvar ?? fail)
            } else {
              this.errorTracker.addCompileError(app.id, 'QNT502', 'Operator next(...) needs one argument')
              this.compStack.push(fail)
            }
          }
          break

        case 'assign':
          this.translateAssign(app.id)
          break

        case 'eq':
          this.applyFun(app.id, 2, (x, y) => right(rv.mkBool(x.equals(y))))
          break

        case 'neq':
          this.applyFun(app.id, 2, (x, y) => right(rv.mkBool(!x.equals(y))))
          break

        // conditional
        case 'ite':
          this.translateIfThenElse(app.id)
          break

        // Booleans
        case 'not':
          this.applyFun(app.id, 1, p => right(rv.mkBool(!p.toBool())))
          break

        case 'and':
          // a conjunction over expressions is lazy
          this.translateBoolOp(app, rv.mkBool(true), (_, r) => (!r ? rv.mkBool(false) : undefined))
          break

        case 'actionAll':
          this.translateAllOrThen(app)
          break

        case 'or':
          // a disjunction over expressions is lazy
          this.translateBoolOp(app, rv.mkBool(false), (_, r) => (r ? rv.mkBool(true) : undefined))
          break

        case 'actionAny':
          this.translateOrAction(app)
          break

        case 'implies':
          // an implication is lazy
          this.translateBoolOp(app, rv.mkBool(false), (n, r) => (n == 0 && !r ? rv.mkBool(true) : undefined))
          break

        case 'iff':
          this.applyFun(app.id, 2, (p, q) => right(rv.mkBool(p.toBool() === q.toBool())))
          break

        // integers
        case 'iuminus':
          this.applyFun(app.id, 1, n => right(rv.mkInt(-n.toInt())))
          break

        case 'iadd':
          this.applyFun(app.id, 2, (p, q) => right(rv.mkInt(p.toInt() + q.toInt())))
          break

        case 'isub':
          this.applyFun(app.id, 2, (p, q) => right(rv.mkInt(p.toInt() - q.toInt())))
          break

        case 'imul':
          this.applyFun(app.id, 2, (p, q) => right(rv.mkInt(p.toInt() * q.toInt())))
          break

        case 'idiv':
          this.applyFun(app.id, 2, (p, q) => {
            if (q.toInt() !== 0n) {
              return right(rv.mkInt(p.toInt() / q.toInt()))
            } else {
              return left({ code: 'QNT503', message: 'Division by zero', reference: app.id })
            }
          })
          break

        case 'imod':
          this.applyFun(app.id, 2, (p, q) => right(rv.mkInt(p.toInt() % q.toInt())))
          break

        case 'ipow':
          this.applyFun(app.id, 2, (p, q) => {
            if (q.toInt() == 0n && p.toInt() == 0n) {
              return left({ code: 'QNT503', message: '0^0 is undefined', reference: app.id })
            } else if (q.toInt() < 0n) {
              return left({ code: 'QNT503', message: 'i^j is undefined for j < 0', reference: app.id })
            } else {
              return right(rv.mkInt(p.toInt() ** q.toInt()))
            }
          })
          break

        case 'igt':
          this.applyFun(app.id, 2, (p, q) => right(rv.mkBool(p.toInt() > q.toInt())))
          break

        case 'ilt':
          this.applyFun(app.id, 2, (p, q) => right(rv.mkBool(p.toInt() < q.toInt())))
          break

        case 'igte':
          this.applyFun(app.id, 2, (p, q) => right(rv.mkBool(p.toInt() >= q.toInt())))
          break

        case 'ilte':
          this.applyFun(app.id, 2, (p, q) => right(rv.mkBool(p.toInt() <= q.toInt())))
          break

        case 'Tup':
          // Construct a tuple from an array of values
          this.applyFun(app.id, app.args.length, (...values: RuntimeValue[]) => right(rv.mkTuple(values)))
          break

        case 'item':
          // Access a tuple: tuples are 1-indexed, that is, _1, _2, etc.
          this.applyFun(app.id, 2, (tuple, idx) => getListElem(tuple.toList(), Number(idx.toInt()) - 1))
          break

        case 'tuples':
          // Construct a cross product
          this.applyFun(app.id, app.args.length, (...sets: RuntimeValue[]) => right(rv.mkCrossProd(sets)))
          break

        case 'List':
          // Construct a list from an array of values
          this.applyFun(app.id, app.args.length, (...values: RuntimeValue[]) => right(rv.mkList(values)))
          break

        case 'range':
          this.applyFun(app.id, 2, (start, end) => {
            const [s, e] = [Number(start.toInt()), Number(end.toInt())]
            if (s <= e) {
              const arr: RuntimeValue[] = []
              for (let i = s; i < e; i++) {
                arr.push(rv.mkInt(BigInt(i)))
              }
              return right(rv.mkList(arr))
            } else {
              return left({ code: 'QNT504', message: `range(${s}, ${e}) is out of bounds` })
            }
          })
          break

        case 'nth':
          // Access a list
          this.applyFun(app.id, 2, (list, idx) => getListElem(list.toList(), Number(idx.toInt())))
          break

        case 'replaceAt':
          this.applyFun(app.id, 3, (list, idx, value) => updateList(list.toList(), Number(idx.toInt()), value))
          break

        case 'head':
          this.applyFun(app.id, 1, list => getListElem(list.toList(), 0))
          break

        case 'tail':
          this.applyFun(app.id, 1, list => {
            const l = list.toList()
            if (l.size > 0) {
              return sliceList(l, 1, l.size)
            } else {
              return left({ code: 'QNT505', message: 'Applied tail to an empty list' })
            }
          })
          break

        case 'slice':
          this.applyFun(app.id, 3, (list, start, end) => {
            const [l, s, e] = [list.toList(), Number(start.toInt()), Number(end.toInt())]
            if (s >= 0 && s <= l.size && e <= l.size && e >= s) {
              return sliceList(l, s, e)
            } else {
              return left({ code: 'QNT506', message: `slice(..., ${s}, ${e}) applied to a list of size ${l.size}` })
            }
          })
          break

        case 'length':
          this.applyFun(app.id, 1, list => right(rv.mkInt(BigInt(list.toList().size))))
          break

        case 'append':
          this.applyFun(app.id, 2, (list, elem) => right(rv.mkList(list.toList().push(elem))))
          break

        case 'concat':
          this.applyFun(app.id, 2, (list1, list2) => right(rv.mkList(list1.toList().concat(list2.toList()))))
          break

        case 'indices':
          this.applyFun(app.id, 1, list => right(rv.mkInterval(0n, BigInt(list.toList().size - 1))))
          break

        case 'Rec':
          // Construct a record
          this.applyFun(app.id, app.args.length, (...values: RuntimeValue[]) => {
            const keys = values.filter((e, i) => i % 2 === 0).map(k => k.toStr())
            const map: OrderedMap<string, RuntimeValue> = keys.reduce((map, key, i) => {
              const v = values[2 * i + 1]
              return v ? map.set(key, v) : map
            }, OrderedMap<string, RuntimeValue>())
            return right(rv.mkRecord(map))
          })
          break

        case 'field':
          // Access a record via the field name
          this.applyFun(app.id, 2, (rec, fieldName) => {
            const name = fieldName.toStr()
            const fieldValue = rec.toOrderedMap().get(name)
            if (fieldValue) {
              return right(fieldValue)
            } else {
              return left({ code: 'QNT501', message: `Accessing a missing record field ${name}` })
            }
          })
          break

        case 'fieldNames':
          this.applyFun(app.id, 1, rec => {
            const keysAsRuntimeValues = rec
              .toOrderedMap()
              .keySeq()
              .map(key => rv.mkStr(key))
            return right(rv.mkSet(keysAsRuntimeValues))
          })
          break

        case 'with':
          // update a record
          this.applyFun(app.id, 3, (rec, fieldName, fieldValue) => {
            const oldMap = rec.toOrderedMap()
            const key = fieldName.toStr()
            if (oldMap.has(key)) {
              const newMap = rec.toOrderedMap().set(key, fieldValue)
              return right(rv.mkRecord(newMap))
            } else {
              return left({ code: 'QNT501', message: `Called 'with' with a non-existent key ${key}` })
            }
          })
          break

        case 'variant':
          // Construct a variant of a sum type.
          this.applyFun(app.id, 2, (labelName, value) => right(rv.mkVariant(labelName.toStr(), value)))
          break

        case 'matchVariant':
          this.applyFun(app.id, app.args.length, (variantExpr, ...cases) => {
            // Type checking ensures that this is a variant expression
            assert(variantExpr instanceof RuntimeValueVariant, 'invalid value in match expression')
            const label = variantExpr.label
            const value = variantExpr.value

            // Find the eliminator marked with the variant's label
            let result: EvaluationResult | undefined
            for (const [caseLabel, caseElim] of chunk(cases, 2)) {
              const caseLabelStr = caseLabel.toStr()
              if (caseLabelStr === '_' || caseLabelStr === label) {
                // Type checking ensures the second item of each case is a lambda
                assert(caseElim instanceof RuntimeValueLambda, 'invalid eliminator in match expression')
                const eliminator = caseElim as RuntimeValueLambda
                result = eliminator.eval([right(value)]).map(r => r as RuntimeValue)
                break
              }
            }
            // Type checking ensures we have cases for every possible variant of a sum type.
            assert(result, 'non-exhaustive match expression')

            return result
          })
          break

        case 'Set':
          // Construct a set from an array of values.
          this.applyFun(app.id, app.args.length, (...values: RuntimeValue[]) => right(rv.mkSet(values)))
          break

        case 'powerset':
          this.applyFun(app.id, 1, (baseset: RuntimeValue) => right(rv.mkPowerset(baseset)))
          break

        case 'contains':
          this.applyFun(app.id, 2, (set, value) => right(rv.mkBool(set.contains(value))))
          break

        case 'in':
          this.applyFun(app.id, 2, (value, set) => right(rv.mkBool(set.contains(value))))
          break

        case 'subseteq':
          this.applyFun(app.id, 2, (l, r) => right(rv.mkBool(l.isSubset(r))))
          break

        case 'union':
          this.applyFun(app.id, 2, (l, r) => right(rv.mkSet(l.toSet().union(r.toSet()))))
          break

        case 'intersect':
          this.applyFun(app.id, 2, (l, r) => right(rv.mkSet(l.toSet().intersect(r.toSet()))))
          break

        case 'exclude':
          this.applyFun(app.id, 2, (l, r) => right(rv.mkSet(l.toSet().subtract(r.toSet()))))
          break

        case 'size':
          this.applyFun(app.id, 1, set => set.cardinality().map(rv.mkInt))
          break

        case 'isFinite':
          // at the moment, we support only finite sets, so just return true
          this.applyFun(app.id, 1, _set => right(rv.mkBool(true)))
          break

        case 'to':
          this.applyFun(app.id, 2, (i, j) => right(rv.mkInterval(i.toInt(), j.toInt())))
          break

        case 'fold':
          this.applyFold(app.id, 'fwd')
          break

        case 'foldl':
          this.applyFold(app.id, 'fwd')
          break

        case 'foldr':
          this.applyFold(app.id, 'rev')
          break

        case 'flatten':
          this.applyFun(app.id, 1, set => {
            // unpack the sets from runtime values
            const setOfSets = set.toSet().map(e => e.toSet())
            // and flatten the set of sets via immutable-js
            return right(rv.mkSet(setOfSets.flatten(1) as Set<RuntimeValue>))
          })
          break

        case 'get':
          // Get a map value
          this.applyFun(app.id, 2, (map, key) => {
            const value = map.toMap().get(key.normalForm())
            if (value) {
              return right(value)
            } else {
              // Should we print the key? It may be a complex expression.
              return left({ code: 'QNT507', message: "Called 'get' with a non-existing key" })
            }
          })
          break

        case 'set':
          // Update a map value
          this.applyFun(app.id, 3, (map, key, newValue) => {
            const normalKey = key.normalForm()
            const asMap = map.toMap()
            if (asMap.has(normalKey)) {
              const newMap = asMap.set(normalKey, newValue)
              return right(rv.fromMap(newMap))
            } else {
              return left({ code: 'QNT507', message: "Called 'set' with a non-existing key" })
            }
          })
          break

        case 'put':
          // add a value to a map
          this.applyFun(app.id, 3, (map, key, newValue) => {
            const normalKey = key.normalForm()
            const asMap = map.toMap()
            const newMap = asMap.set(normalKey, newValue)
            return right(rv.fromMap(newMap))
          })
          break

        case 'setBy': {
          // Update a map value via a lambda
          const fun = this.compStack.pop() ?? fail
          this.applyFun(app.id, 2, (map, key) => {
            const normalKey = key.normalForm()
            const asMap = map.toMap()
            if (asMap.has(normalKey)) {
              return fun.eval([right(asMap.get(normalKey))]).map(newValue => {
                const newMap = asMap.set(normalKey, newValue as RuntimeValue)
                return rv.fromMap(newMap)
              })
            } else {
              return left({ code: 'QNT507', message: "Called 'setBy' with a non-existing key" })
            }
          })
          break
        }

        case 'keys':
          // map keys as a set
          this.applyFun(app.id, 1, map => {
            return right(rv.mkSet(map.toMap().keys()))
          })
          break

        case 'oneOf':
          this.applyOneOf(app.id)
          break

        case 'generate':
          return left({ code: 'QNT515', message: "Operator 'generate' is not supported by the random simulator" })

        case 'exists':
          this.mapLambdaThenReduce(app.id, set => rv.mkBool(set.find(([result, _]) => result.toBool()) !== undefined))
          break

        case 'forall':
          this.mapLambdaThenReduce(app.id, set => rv.mkBool(set.find(([result, _]) => !result.toBool()) === undefined))
          break

        case 'map':
          this.mapLambdaThenReduce(app.id, array => rv.mkSet(array.map(([result, _]) => result)))
          break

        case 'filter':
          this.mapLambdaThenReduce(app.id, arr => rv.mkSet(arr.filter(([r, _]) => r.toBool()).map(([_, e]) => e)))
          break

        case 'select':
          this.mapLambdaThenReduce(app.id, arr => rv.mkList(arr.filter(([r, _]) => r.toBool()).map(([_, e]) => e)))
          break

        case 'mapBy':
          this.mapLambdaThenReduce(app.id, arr => rv.mkMap(arr.map(([v, k]) => [k, v])))
          break

        case 'Map':
          this.applyFun(app.id, app.args.length, (...pairs: any[]) => right(rv.mkMap(pairs)))
          break

        case 'setToMap':
          this.applyFun(app.id, 1, (set: RuntimeValue) =>
            right(
              rv.mkMap(
                set.toSet().map(p => {
                  const arr = p.toList().toArray()
                  return [arr[0], arr[1]]
                })
              )
            )
          )
          break

        case 'setOfMaps':
          this.applyFun(app.id, 2, (dom, rng) => {
            return right(rv.mkMapSet(dom, rng))
          })
          break

        case 'then':
          this.translateAllOrThen(app)
          break

        case 'fail':
          this.applyFun(app.id, 1, result => {
            return right(rv.mkBool(!result.toBool()))
          })
          break

        case 'expect':
          this.translateExpect(app)
          break

        case 'assert':
          this.applyFun(app.id, 1, cond => {
            if (!cond.toBool()) {
              return left({ code: 'QNT508', message: 'Assertion failed', reference: app.id })
            }
            return right(cond)
          })
          break

        case 'reps':
          this.translateReps(app)
          break

        case 'q::test':
          // the special operator that runs random simulation
          this.test(app.id)
          break

        case 'q::testOnce':
          // the special operator that runs random simulation
          this.testOnce(app.id)
          break

        case 'q::debug':
          this.applyFun(app.id, 2, (msg, value) => {
            let columns = terminalWidth()
            let valuePretty = format(columns, 0, prettyQuintEx(value.toQuintEx(zerog)))
            console.log('>', msg.toStr(), valuePretty.toString())
            return right(value)
          })
          break

        case 'allListsUpTo':
          this.applyFun(app.id, 2, (set: RuntimeValue, max_length: RuntimeValue) => {
            let lists: Set<RuntimeValue[]> = Set([[]])
            let last_lists: Set<RuntimeValue[]> = Set([[]])
            times(Number(max_length.toInt())).forEach(_length => {
              // Generate all lists of length `length` from the set
              const new_lists: Set<RuntimeValue[]> = set.toSet().flatMap(value => {
                // for each value in the set, append it to all lists of length `length - 1`
                return last_lists.map(list => list.concat(value))
              })

              lists = lists.merge(new_lists)
              last_lists = new_lists
            })

            return right(rv.mkSet(lists.map(list => rv.mkList(list)).toOrderedSet()))
          })
          break

        // standard unary operators that are not handled by REPL
        case 'allLists':
        case 'chooseSome':
        case 'always':
        case 'eventually':
        case 'enabled':
          this.applyFun(app.id, 1, _ => {
            return left({ code: 'QNT501', message: `Runtime does not support the built-in operator '${app.opcode}'` })
          })
          break

        // builtin operators that are not handled by REPL
        case 'orKeep':
        case 'mustChange':
        case 'weakFair':
        case 'strongFair':
          this.applyFun(app.id, 2, _ => {
            return left({ code: 'QNT501', message: `Runtime does not support the built-in operator '${app.opcode}'` })
          })
          break

        default:
          unreachable(app.opcode)
      }
    }
  }

  private applyUserDefined(app: ir.QuintApp) {
    const onError = (sourceId: bigint, msg: string): void => {
      const error: EvaluationResult = left({ code: 'QNT501', message: msg, reference: sourceId })
      this.errorTracker.addCompileError(sourceId, 'QNT501', msg)
      this.compStack.push({ eval: () => error })
    }

    // look up for the operator to see, whether it's just an operator, or a parameter
    const lookupEntry = this.lookupTable.get(app.id)
    if (lookupEntry === undefined) {
      return onError(app.id, `Called unknown operator ${app.opcode}`)
    }

    // this function gives us access to the compiled operator later
    let callableRef: () => Either<QuintError, Callable>

    if (lookupEntry.kind !== 'param') {
      // The common case: the operator has been defined elsewhere.
      // We simply look up for the operator and return it via callableRef.
      const callable = this.contextLookup(app.id, ['callable']) as Callable
      if (callable === undefined || callable.nparams === undefined) {
        return onError(app.id, `Called unknown operator ${app.opcode}`)
      }
      callableRef = () => right(callable)
    } else {
      // The operator is a parameter of another operator.
      // We do not have access to the operator yet.
      let register = this.contextLookup(app.id, ['arg']) as Register
      if (register === undefined) {
        return onError(app.id, `Parameter ${app.opcode} is not found`)
      }
      // every time we need a Callable, we retrieve it from the register
      callableRef = () => {
        const result = register.registerValue.map(v => v as Callable)
        if (result.isJust()) {
          return right(result.value)
        } else {
          return left({ code: 'QNT501', message: `Parameter ${app.opcode} is not set` })
        }
      }
    }

    const nargs = app.args.length // === operScheme.type.args.length
    const nactual = this.compStack.length
    if (nactual < nargs) {
      return onError(app.id, `Expected ${nargs} arguments for ${app.opcode}, found: ${nactual}`)
    } else {
      // pop nargs elements of the compStack
      const args = this.compStack.splice(-nargs, nargs)
      // Produce the new computable value.
      // This code is similar to applyFun, but it calls the listener before
      const comp = {
        eval: () => {
          this.execListener.onUserOperatorCall(app)
          // compute the values of the arguments at this point
          const values = args.map(arg => arg.eval())
          const result = callableRef().chain(callable => {
            return callable.eval(values)
          })
          mergeInMany(values).map(vs => this.execListener.onUserOperatorReturn(app, vs, toMaybe(result)))
          return result
        },
      }
      this.compStack.push(comp)
    }
  }

  enterLambda(lam: ir.QuintLambda) {
    // introduce a register for every parameter
    lam.params.forEach(p => {
      const register = mkRegister('arg', p.name, none(), {
        code: 'QNT501',
        message: `Parameter ${p} is not set`,
        reference: p.id,
      })
      this.context.set(kindName('arg', p.id), register)

      if (specialNames.includes(p.name)) {
        this.context.set(kindName('arg', p.name), register)
      }
    })
    // After this point, the body of the lambda gets compiled.
    // The body of the lambda may refer to the parameter via names,
    // which are stored in the registers we've just created.
  }

  exitLambda(lam: ir.QuintLambda) {
    // The expression on the stack is the body of the lambda.
    // Transform it to Callable together with the registers.
    const registers: Register[] = []
    lam.params.forEach(p => {
      const id = specialNames.includes(p.name) ? p.name : p.id

      const key = kindName('arg', id)
      const register = this.contextGet(id, ['arg']) as Register

      if (register && register.registerValue) {
        this.context.delete(key)
        registers.push(register)
      } else {
        this.errorTracker.addCompileError(p.id, 'QNT501', `Parameter ${p.name} not found`)
      }
    })

    const lambdaBody = this.compStack.pop()
    if (lambdaBody) {
      this.compStack.push(mkCallable(registers, lambdaBody))
    } else {
      this.errorTracker.addCompileError(lam.id, 'QNT501', 'Compilation of lambda failed')
    }
  }

  private translateAssign(sourceId: bigint): void {
    if (this.compStack.length < 2) {
      this.errorTracker.addCompileError(sourceId, 'QNT501', `Assignment '=' needs two arguments`)
      return
    }
    const [register, rhs] = this.compStack.splice(-2)
    const name = (register as Register).name
    if (name === undefined) {
      this.errorTracker.addCompileError(sourceId, 'QNT501', `Assignment '=' applied to a non-variable`)
      this.compStack.push(fail)
      return
    }

    const nextvar = this.contextGet(name, ['nextvar']) as Register
    if (nextvar) {
      this.compStack.push(rhs)
      this.applyFun(sourceId, 1, value => {
        nextvar.registerValue = just(value)
        return right(rv.mkBool(true))
      })
    } else {
      this.errorTracker.addCompileError(sourceId, 'QNT502', `Undefined next variable in ${name} = ...`)
      this.compStack.push(fail)
    }
  }

  /**
   * A generalized application of a one-argument Callable to a set-like
   * runtime value, as required by `exists`, `forall`, `map`, and `filter`.
   *
   * This method expects `compStack` to look like follows:
   *
   *  - `(top)` translated lambda, as `Callable`.
   *
   *  - `(top - 1)`: a set-like value to iterate over, as `Computable`.
   *
   * The method evaluates the Callable for each element of the iterable value
   * and either produces `none`, if evaluation failed for one of the elements,
   * or it applies `mapResultAndElems` to the pairs that consists of the Callable
   * result and the original element of the iterable value.
   * The final result is stored on the stack.
   */
  private mapLambdaThenReduce(
    sourceId: bigint,
    reduceFunction: (_array: Array<[RuntimeValue, RuntimeValue]>) => RuntimeValue
  ): void {
    this.popArgs(2)
      .map(args => mapLambdaThenReduce(sourceId, reduceFunction, args))
      .map(comp => this.compStack.push(comp))
      .mapLeft(e => this.errorTracker.addRuntimeError(sourceId, e))
  }

  /**
   * Translate one of the operators: fold, foldl, and foldr.
   */
  private applyFold(sourceId: bigint, order: 'fwd' | 'rev'): void {
    this.popArgs(3)
      .map(args => applyFold(order, args))
      .map(comp => this.compStack.push(comp))
      .mapLeft(e => this.errorTracker.addRuntimeError(sourceId, e))
  }

  // pop nargs computable values, pass them the 'fun' function, and
  // push the combined computable value on the stack
  private applyFun(sourceId: bigint, nargs: number, fun: (..._args: RuntimeValue[]) => EvaluationResult) {
    this.popArgs(nargs)
      .map(args => applyFun(sourceId, fun, args))
      .map(comp => this.compStack.push(comp))
      .mapLeft(e => this.errorTracker.addRuntimeError(sourceId, e))
  }

  private popArgs(nargs: number): Either<QuintError, Computable[]> {
    if (this.compStack.length < nargs) {
      return left({ code: 'QNT501', message: 'Not enough arguments' })
    }
    return right(this.compStack.splice(-nargs, nargs))
  }

  // if-then-else requires special treatment,
  // as it should not evaluate both arms
  private translateIfThenElse(sourceId: bigint) {
    if (this.compStack.length < 3) {
      this.errorTracker.addCompileError(sourceId, 'QNT501', 'Not enough arguments')
    } else {
      // pop 3 elements of the compStack
      const [cond, thenArm, elseArm] = this.compStack.splice(-3, 3)
      // produce the new computable value
      const comp = {
        eval: () => {
          // compute the values of the arguments at this point
          // TODO: register errors
          const v = cond.eval().map(pred => (pred.equals(rv.mkBool(true)) ? thenArm.eval() : elseArm.eval()))
          return v.join()
        },
      }
      this.compStack.push(comp)
    }
  }

  /**
   *  Compute all { ... } or A.then(B)...then(E) for a chain of actions.
   * @param actions actions as computable to execute
   * @param kind is it 'all { ... }' or 'A.then(B)'?
   * @param actionId given the action index, return the id that produced this action
   * @returns evaluation result
   */
  private chainAllOrThen(
    actions: Computable[],
    kind: 'all' | 'then',
    actionId: (idx: number) => bigint
  ): EvaluationResult {
    // save the values of the next variables, as actions may update them
    const savedValues = this.snapshotNextVars()
    const savedTrace = this.trace.get()

    let result: EvaluationResult = right(rv.mkBool(true))
    // Evaluate arguments iteratively.
    // Stop as soon as one of the arguments returns false.
    // This is a form of Boolean short-circuiting.
    let nactionsLeft = actions.length
    for (const action of actions) {
      nactionsLeft--
      result = action.eval()
      const isFalse = result.isRight() && !(result.value as RuntimeValue).toBool()
      if (result.isLeft() || isFalse) {
        // As soon as one of the arguments does not evaluate to true,
        // break out of the loop.
        // Restore the values of the next variables,
        // as evaluation was not successful.
        this.recoverNextVars(savedValues)
        this.trace.reset(savedTrace)

        if (kind === 'then' && nactionsLeft > 0 && isFalse) {
          // Cannot extend a run. Emit an error message.
          const actionNo = actions.length - (nactionsLeft + 1)
          result = left({
            code: 'QNT513',
            message: `Cannot continue in A.then(B), A evaluates to 'false'`,
            reference: actionId(actionNo),
          })
          return result
        } else {
          return result
        }
      }

      // switch to the next frame, when implementing A.then(B)
      if (kind === 'then' && nactionsLeft > 0) {
        const oldState: RuntimeValue = this.varsToRecord()
        this.shiftVars()
        const newState: RuntimeValue = this.varsToRecord()
        this.trace.extend(newState)
        this.execListener.onNextState(oldState, newState)
      }
    }

    return result
  }

  // translate all { A, ..., C } or A.then(B)
  private translateAllOrThen(app: ir.QuintApp): void {
    const kind = app.opcode === 'then' ? 'then' : 'all'

    this.popArgs(app.args.length)
      .map(args => {
        const lazyComputable = () => this.chainAllOrThen(args, kind, idx => app.args[idx].id)
        return this.compStack.push(mkFunComputable(lazyComputable))
      })
      .mapLeft(e => this.errorTracker.addRuntimeError(app.id, e))
  }

  // Translate A.expect(P):
  //  - Evaluate A.
  //  - When A's result is 'false', emit a runtime error.
  //  - When A's result is 'true':
  //    - Commit the variable updates: Shift the primed variables to unprimed.
  //    - Evaluate `P`.
  //    - If `P` evaluates to `false`, emit a runtime error (similar to `assert`).
  //    - If `P` evaluates to `true`, rollback to the previous state and return `true`.
  private translateExpect(app: ir.QuintApp): void {
    // The code below is an adaption of chainAllOrThen.
    // If someone finds how to nicely combine both, please refactor.
    if (this.compStack.length !== 2) {
      this.errorTracker.addCompileError(app.id, 'QNT501', `Not enough arguments on stack for "${app.opcode}"`)
      return
    }
    const [action, pred] = this.compStack.splice(-2)
    const lazyCompute = (): EvaluationResult => {
      const savedNextVars = this.snapshotNextVars()
      const savedTrace = this.trace.get()
      const actionResult = action.eval()
      if (actionResult.isLeft() || !(actionResult.value as RuntimeValue).toBool()) {
        // 'A' evaluates to 'false', or produces an error.
        // Restore the values of the next variables.
        this.recoverNextVars(savedNextVars)
        this.trace.reset(savedTrace)
        // expect emits an error when the run could not finish
        return left({ code: 'QNT508', message: 'Cannot continue to "expect"', reference: app.args[0].id })
      } else {
        const savedVarsAfterAction = this.snapshotVars()
        const savedNextVarsAfterAction = this.snapshotNextVars()
        const savedTraceAfterAction = this.trace.get()
        // Temporarily, switch to the next frame, to make a look-ahead evaluation.
        // For example, if `x == 1` and `x' == 2`, we would have `x == 2` and `x'` would be undefined.
        this.shiftVars()
        // evaluate P
        const predResult = pred.eval()
        // Recover the assignments to unprimed and primed variables.
        // E.g., we recover variables to `x == 1` and `x' == 2` in the above example.
        // This lets us combine the result of `expect` with other actions via `then`.
        // For example: `A.expect(P).then(B)`.
        this.recoverVars(savedVarsAfterAction)
        this.recoverNextVars(savedNextVarsAfterAction)
        this.trace.reset(savedTraceAfterAction)
        if (predResult.isLeft() || !(predResult.value as RuntimeValue).toBool()) {
          return left({ code: 'QNT508', message: 'Expect condition does not hold true', reference: app.args[1].id })
        }
        return predResult
      }
    }

    this.compStack.push(mkFunComputable(lazyCompute))
  }

  // translate n.reps(A)
  private translateReps(app: ir.QuintApp): void {
    if (this.compStack.length < 2) {
      this.errorTracker.addCompileError(app.id, 'QNT501', `Not enough arguments on stack for "${app.opcode}"`)
      return
    }
    const [niterations, action] = this.compStack.splice(-2)

    const lazyCompute = () => {
      // compute the number of iterations and repeat 'action' that many times
      return niterations
        .eval()
        .map(num => {
          const n = Number((num as RuntimeValue).toInt())
          const indices = [...Array(n).keys()]
          const actions = indices.map(i => {
            return {
              eval: () => {
                return action.eval([right(rv.mkInt(BigInt(i)))])
              },
            }
          })
          // In case the case of reps, we have multiple copies of the same action.
          // This is why all occurrences have the same id.
          return this.chainAllOrThen(actions, 'then', _ => app.args[1].id)
        })
        .join()
    }

    this.compStack.push(mkFunComputable(lazyCompute))
  }

  // translate one of the Boolean operators with short-circuiting:
  //  - or  { A, ..., C }
  //  - and { A, ..., C }
  //  - A implies B
  private translateBoolOp(
    app: ir.QuintApp,
    defaultValue: RuntimeValue,
    shortCircuit: (no: number, r: boolean) => RuntimeValue | undefined
  ): void {
    this.popArgs(app.args.length)
      .map(args => applyBoolOp(defaultValue, shortCircuit, args))
      .map(comp => this.compStack.push(comp))
      .mapLeft(e => this.errorTracker.addRuntimeError(app.id, e))
  }

  // translate any { A, ..., C }
  private translateOrAction(app: ir.QuintApp): void {
    if (this.compStack.length < app.args.length) {
      this.errorTracker.addCompileError(app.id, 'QNT501', 'Not enough arguments on stack for "any"')
      return
    }
    const args = this.compStack.splice(-app.args.length)

    // According to the semantics of action-level disjunctions,
    // we have to find out which branches are enabled and pick one of them
    // non-deterministically. Instead of modeling non-determinism,
    // we use a random number generator. This may change in the future.
    const lazyCompute = () => {
      // on `any`, we reset the action taken as the goal is to save the last
      // action picked in an `any` call
      this.actionTaken = none()
      // we also reset nondet picks as they are collected when we move up the
      // tree, and this is now a leaf
      this.nondetPicks = this.emptyNondetPicks()

      // save the values of the next variables, as actions may update them
      const valuesBefore = this.snapshotNextVars()
      // we store the potential successor values in this array
      const successors: Maybe<RuntimeValue>[][] = []
      const successorIndices: number[] = []
      // Evaluate arguments iteratively.
      args.forEach((arg, i) => {
        this.recoverNextVars(valuesBefore)
        // either the argument is evaluated to false, or fails
        this.execListener.onAnyOptionCall(app, i)
        const result = arg.eval().or(right(rv.mkBool(false)))
        const boolResult = (result.unwrap() as RuntimeValue).toBool()
        this.execListener.onAnyOptionReturn(app, i)
        // if this arm evaluates to true, save it in the candidates
        if (boolResult === true) {
          successors.push(this.snapshotNextVars())
          successorIndices.push(i)
        }
      })

      const ncandidates = successors.length
      let choice
      if (ncandidates === 0) {
        // no successor: restore the state and return false
        this.recoverNextVars(valuesBefore)
        this.execListener.onAnyReturn(args.length, -1)
        return right(rv.mkBool(false))
      } else if (ncandidates === 1) {
        // There is exactly one successor, the execution is deterministic.
        // No need for randomization. This may reduce the number of tests.
        choice = 0
      } else {
        // randomly pick a successor and return true
        choice = Number(this.rand(BigInt(ncandidates)))
      }

      this.recoverNextVars(successors[choice])
      this.execListener.onAnyReturn(args.length, successorIndices[choice])
      return right(rv.mkBool(true))
    }

    this.compStack.push(mkFunComputable(lazyCompute))
  }

  // Apply the operator oneOf
  private applyOneOf(sourceId: bigint) {
    this.applyFun(sourceId, 1, set => {
      const bounds = set.bounds()
      const positions: Either<QuintError, bigint[]> = mergeInMany(
        bounds.map((b): Either<QuintError, bigint> => {
          if (b.isJust()) {
            const sz = b.value

            if (sz === 0n) {
              return left({ code: 'QNT509', message: `Applied oneOf to an empty set` })
            }
            return right(this.rand(sz))
          } else {
            // An infinite set, pick an integer from the range [-2^255, 2^255).
            // Note that pick on Nat uses the absolute value of the passed integer.
            // TODO: make it a configurable parameter:
            // https://github.com/informalsystems/quint/issues/279
            return right(-(2n ** 255n) + this.rand(2n ** 256n))
          }
        })
      ).mapLeft(errors => ({ code: 'QNT501', message: errors.map(quintErrorToString).join('\n') }))

      return positions.chain(ps => set.pick(ps.values()))
    })
  }

  private test(sourceId: bigint) {
    if (this.compStack.length < 6) {
      this.errorTracker.addCompileError(sourceId, 'QNT501', 'Not enough arguments on stack for "q::test"')
      return
    }

    const [nruns, nsteps, ntraces, init, next, inv] = this.compStack.splice(-6)
    this.runTestSimulation(nruns, nsteps, ntraces, init, next, inv)
  }

  private testOnce(sourceId: bigint) {
    if (this.compStack.length < 5) {
      this.errorTracker.addCompileError(sourceId, 'QNT501', 'Not enough arguments on stack for "q::testOnce"')
      return
    }

    const [nsteps, ntraces, init, next, inv] = this.compStack.splice(-5)
    const nruns = mkConstComputable(rv.mkInt(1n))
    this.runTestSimulation(nruns, nsteps, ntraces, init, next, inv)
  }

  // The simulator core: produce multiple random runs
  // and check the given state invariant (state assertion).
  //
  // Technically, this is similar to the implementation of folds.
  // However, it also restores the state and saves a trace, if there is any.
  private runTestSimulation(
    nrunsComp: Computable,
    nstepsComp: Computable,
    ntracesComp: Computable,
    init: Computable,
    next: Computable,
    inv: Computable
  ) {
    const doRun = (): EvaluationResult => {
      return mergeInMany([nrunsComp, nstepsComp, ntracesComp].map(c => c.eval()))
        .mapLeft((errors): QuintError => {
          return { code: 'QNT501', message: errors.map(quintErrorToString).join('\n') }
        })
        .chain(([nrunsRes, nstepsRes, nTracesRes]) => {
          const isTrue = (res: EvaluationResult) => {
            return !res.isLeft() && (res.value as RuntimeValue).toBool() === true
          }
          // a failure flag for the case a runtime error is found
          let failure = false
          // counter for errors found
          let errorsFound = 0
          // save the registers to recover them later
          const vars = this.snapshotVars()
          const nextVars = this.snapshotNextVars()
          // do multiple runs, stop at the first failing run
          const nruns = (nrunsRes as RuntimeValue).toInt()
          const ntraces = (nTracesRes as RuntimeValue).toInt()

          const bar = new SingleBar(
            {
              clearOnComplete: true,
              forceRedraw: true,
              format: 'Running... [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} samples',
            },
            Presets.rect
          )

          bar.start(Number(nruns), 0)

          for (let runNo = 0; errorsFound < ntraces && !failure && runNo < nruns; runNo++) {
            bar.update(runNo)

            this.execListener.onRunCall()
            this.trace.reset()
            // check Init()
            const initApp: ir.QuintApp = { id: 0n, kind: 'app', opcode: 'q::initAndInvariant', args: [] }
            this.execListener.onUserOperatorCall(initApp)
            const initResult = init.eval()
            failure = initResult.isLeft() || failure
            if (!isTrue(initResult)) {
              this.execListener.onUserOperatorReturn(initApp, [], toMaybe(initResult))
            } else {
              // The initial action evaluates to true.
              // Our guess of values was good.
              this.shiftVars()
              this.trace.extend(this.varsToRecord())
              // check the invariant Inv
              const invResult = inv.eval()
              this.execListener.onUserOperatorReturn(initApp, [], toMaybe(initResult))
              failure = invResult.isLeft() || failure
              if (!isTrue(invResult)) {
                errorsFound++
              } else {
                // check all { Next(), shift(), Inv } in a loop
                const nsteps = (nstepsRes as RuntimeValue).toInt()
                for (let i = 0; errorsFound < ntraces && !failure && i < nsteps; i++) {
                  const nextApp: ir.QuintApp = {
                    id: 0n,
                    kind: 'app',
                    opcode: 'q::stepAndInvariant',
                    args: [],
                  }
                  this.execListener.onUserOperatorCall(nextApp)
                  const nextResult = next.eval()
                  failure = nextResult.isLeft() || failure
                  if (isTrue(nextResult)) {
                    this.shiftVars()
                    this.trace.extend(this.varsToRecord())
                    errorsFound += isTrue(inv.eval()) ? 0 : 1
                    this.execListener.onUserOperatorReturn(nextApp, [], toMaybe(nextResult))
                  } else {
                    // Otherwise, the run cannot be extended.
                    // In some cases, this may indicate a deadlock.
                    // Since we are doing random simulation, it is very likely
                    // that we have not generated good values for extending
                    // the run. Hence, do not report an error here, but simply
                    // drop the run. Otherwise, we would have a lot of false
                    // positives, which look like deadlocks but they are not.
                    this.execListener.onUserOperatorReturn(nextApp, [], toMaybe(nextResult))
                    this.execListener.onRunReturn(just(rv.mkBool(true)), this.trace.get())
                    break
                  }
                }
              }
            }
            const outcome = !failure ? just(rv.mkBool(errorsFound == 0)) : none()
            this.execListener.onRunReturn(outcome, this.trace.get())
            // recover the state variables
            this.recoverVars(vars)
            this.recoverNextVars(nextVars)
          } // end of a single random run

          bar.stop()

          // finally, return true, if no error was found
          return !failure ? right(rv.mkBool(errorsFound == 0)) : left({ code: 'QNT501', message: 'Simulation failure' })
        })
    }
    this.compStack.push(mkFunComputable(doRun))
  }

  // convert the current variable values to a record
  private varsToRecord(): RuntimeValue {
    const map: [string, RuntimeValue][] = this.vars
      .filter(r => r.registerValue.isJust())
      .map(r => [r.name, r.registerValue.value as RuntimeValue])

    if (this.storeMetadata) {
      if (this.actionTaken.isJust()) {
        map.push(['action_taken', this.actionTaken.value!])
        map.push(['nondet_picks', this.nondetPicks])
      }
    }

    return rv.mkRecord(map)
  }

  private shiftVars() {
    this.recoverVars(this.snapshotNextVars())
    this.nextVars.forEach(r => (r.registerValue = none()))
  }

  // save the values of the vars into an array
  private snapshotVars(): Maybe<RuntimeValue>[] {
    return this.vars.map(r => r.registerValue).concat([this.actionTaken, just(this.nondetPicks)])
  }

  // save the values of the next vars into an array
  private snapshotNextVars(): Maybe<RuntimeValue>[] {
    return this.nextVars.map(r => r.registerValue).concat([this.actionTaken, just(this.nondetPicks)])
  }

  // load the values of the variables from an array
  private recoverVars(values: Maybe<RuntimeValue>[]) {
    this.vars.forEach((r, i) => (r.registerValue = values[i]))
    this.actionTaken = values[this.vars.length] ?? none()
    this.nondetPicks = values[this.vars.length + 1].unwrap()
  }

  // load the values of the next variables from an array
  private recoverNextVars(values: Maybe<RuntimeValue>[]) {
    this.nextVars.forEach((r, i) => (r.registerValue = values[i]))
    this.actionTaken = values[this.vars.length] ?? none()
    this.nondetPicks = values[this.vars.length + 1].unwrap()
  }

  // The initial value of nondet picks should already have record fields for all
  // nondet values so the type of `nondet_picks` is the same throughout the
  // trace. The field values are initialized as None.
  private emptyNondetPicks() {
    const nondetNames = [...this.lookupTable.values()]
      .filter(d => d.kind === 'def' && d.qualifier === 'nondet')
      .map(d => d.name)
    return rv.mkRecord(OrderedMap(nondetNames.map(n => [n, rv.mkVariant('None', rv.mkTuple([]))])))
  }

  private contextGet(name: string | bigint, kinds: ComputableKind[]) {
    for (const k of kinds) {
      const value = this.context.get(kindName(k, name))
      if (value) {
        return value
      }
    }

    return undefined
  }

  private contextLookup(id: bigint, kinds: ComputableKind[]) {
    const vdef = this.lookupTable.get(id)
    if (vdef) {
      const refId = vdef.id!
      for (const k of kinds) {
        const value = this.context.get(kindName(k, refId))
        if (value) {
          return value
        }
      }
    }

    return undefined
  }
}
