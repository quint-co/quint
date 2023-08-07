/*
 * Compiler of Quint expressions and definitions to Computable values
 * that can be evaluated in the runtime.
 *
 * Igor Konnov, Gabriela Moreira, 2022-2023
 *
 * Copyright (c) Informal Systems 2022-2023. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import { strict as assert } from 'assert'
import { Maybe, just, merge, none } from '@sweet-monads/maybe'
import { List, OrderedMap, Set } from 'immutable'

import { LookupTable } from '../../names/base'
import { IRVisitor } from '../../IRVisitor'
import { TypeScheme } from '../../types/base'
import {
  Callable,
  Computable,
  ComputableKind,
  EvalResult,
  Register,
  fail,
  kindName,
  mkCallable,
  mkRegister,
} from '../runtime'

import { ExecutionListener } from '../trace'

import * as ir from '../../quintIr'

import { RuntimeValue, rv } from './runtimeValue'
import { ErrorCode } from '../../quintError'

import { lastTraceName } from '../compile'
import { unreachable } from '../../util'

const specialNames = ['q::input', 'q::runResult', 'q::nruns', 'q::nsteps', 'q::init', 'q::next', 'q::inv']

/**
 * Returns a Map containing the built-in Computable objects for the Quint language.
 * These include the callable objects for Bool, Int, and Nat.
 *
 * @returns a Map containing the built-in Computable objects.
 */
export function builtinContext() {
  return new Map<string, Computable>([
    [kindName('callable', 'Bool'), mkCallable([], mkConstComputable(rv.mkSet([rv.mkBool(false), rv.mkBool(true)])))],
    [kindName('callable', 'Int'), mkCallable([], mkConstComputable(rv.mkInfSet('Int')))],
    [kindName('callable', 'Nat'), mkCallable([], mkConstComputable(rv.mkInfSet('Nat')))],
  ])
}

/**
 * Represents the state of evaluation of Quint code.
 * All the fields are mutated by CompilerVisitor, either directly, or via calls.
 */
export interface EvaluationState {
  // The context of the evaluation, containing the Computable objects.
  context: Map<string, Computable>
  // The list of variables in the current state.
  vars: Register[]
  // The list of variables in the next state.
  nextVars: Register[]
  // The list of shadow variables.
  shadowVars: Register[]
  // The error tracker for the evaluation to store errors on callbacks.
  errorTracker: CompilerErrorTracker
  // The execution listener that the compiled code uses to report execution info.
  listener: ExecutionListener
}

/**
 * Creates a new EvaluationState object.
 *
 * @returns a new EvaluationState object.
 */
export class CompilerErrorTracker {
  // messages that are produced during compilation
  compileErrors: ir.IrErrorMessage[] = []
  // messages that get populated as the compiled code is executed
  runtimeErrors: ir.IrErrorMessage[] = []

  addCompileError(id: bigint, msg: string) {
    this.compileErrors.push({ explanation: msg, refs: [id] })
  }

  addRuntimeError(id: bigint, msg: string) {
    this.runtimeErrors.push({ explanation: msg, refs: [id] })
  }
}

/**
 * Creates a new EvaluationState object with the initial state of the evaluation.
 *
 * @returns a new EvaluationState object with the lastTrace shadow variable register
 */
export function newEvaluationState(listener: ExecutionListener): EvaluationState {
  const state: EvaluationState = {
    context: builtinContext(),
    vars: [],
    nextVars: [],
    shadowVars: [],
    errorTracker: new CompilerErrorTracker(),
    listener: listener,
  }

  // Initialize compiler state
  const lastTrace = mkRegister('shadow', lastTraceName, just(rv.mkList([])), () =>
    state.errorTracker.addRuntimeError(0n, 'q::lastTrace is not set')
  )
  state.shadowVars.push(lastTrace)
  state.context.set(kindName(lastTrace.kind, lastTrace.name), lastTrace)

  return state
}

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
  // types assigned to expressions and definitions
  private types: Map<bigint, TypeScheme>
  // the stack of computable values
  private compStack: Computable[] = []
  // The map of identifiers (and sometimes, names) to their compiled values:
  //  - wrappers around RuntimeValue
  //  - an instance of Register
  //  - an instance of Callable.
  // The keys should be constructed via `kindName`.
  private context: Map<string, Computable>

  // all variables declared during compilation
  private vars: Register[]
  // the registers allocated for the next-state values of vars
  private nextVars: Register[]
  // shadow variables that are used by the simulator
  private shadowVars: Register[]
  // keeps errors in a state
  private errorTracker: CompilerErrorTracker
  // pre-initialized random number generator
  private rand
  // execution listener
  private execListener: ExecutionListener
  // the current depth of operator definitions: top-level defs are depth 0
  private definitionDepth: number = 0

  constructor(
    lookupTable: LookupTable,
    types: Map<bigint, TypeScheme>,
    rand: (bound: bigint) => bigint,
    evaluationState: EvaluationState
  ) {
    this.lookupTable = lookupTable
    this.types = types
    this.rand = rand

    this.context = evaluationState.context
    this.vars = evaluationState.vars
    this.nextVars = evaluationState.nextVars
    this.shadowVars = evaluationState.shadowVars
    this.errorTracker = evaluationState.errorTracker
    this.execListener = evaluationState.listener
  }

  /**
   * Get the compiler state.
   */
  getEvaluationState(): EvaluationState {
    return {
      context: this.context,
      vars: this.vars,
      nextVars: this.nextVars,
      shadowVars: this.shadowVars,
      errorTracker: this.errorTracker,
      listener: this.execListener,
    }
  }

  /**
   * Get the compiled context.
   */
  getContext(): Map<string, Computable> {
    return this.context
  }

  /**
   * Get the names of the compiled variables.
   */
  getVars(): string[] {
    return this.vars.map(r => r.name)
  }

  /**
   * Get the names of the shadow variables.
   */
  getShadowVars(): string[] {
    return this.shadowVars.map(r => r.name)
  }

  /**
   * Get the array of compile errors, which changes as the code gets executed.
   */
  getCompileErrors(): ir.IrErrorMessage[] {
    return this.errorTracker.compileErrors
  }

  /**
   * Get the array of runtime errors, which changes as the code gets executed.
   */
  getRuntimeErrors(): ir.IrErrorMessage[] {
    return this.errorTracker.runtimeErrors
  }

  enterOpDef(_: ir.QuintOpDef) {
    this.definitionDepth++
  }

  exitOpDef(opdef: ir.QuintOpDef) {
    this.definitionDepth--
    // Either a runtime value, or a def, action, etc.
    // All of them are compiled to callables, which may have zero parameters.
    let boundValue = this.compStack.pop()
    if (boundValue === undefined) {
      this.errorTracker.addCompileError(opdef.id, `No expression for ${opdef.name} on compStack`)
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
      boundValue = {
        eval: () => {
          this.execListener.onUserOperatorCall(app)
          const r = unwrappedValue.eval()
          this.execListener.onUserOperatorReturn(app, [], r)
          return r
        },
      }
    }

    if (this.definitionDepth === 0 && opdef.qualifier === 'pureval') {
      // a pure value may be cached, once evaluated
      const originalEval = boundValue.eval
      let cache: Maybe<EvalResult> | undefined = undefined
      boundValue.eval = (): Maybe<EvalResult> => {
        if (cache !== undefined) {
          return cache
        } else {
          cache = originalEval()
          return cache
        }
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
      this.errorTracker.addCompileError(letDef.opdef.id, `No expression for ${letDef.opdef.name} on compStack`)
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
    exprUnderLet.eval = function (): Maybe<EvalResult> {
      const cachedValue = boundValueEval()
      boundValue.eval = function () {
        return cachedValue
      }
      // compute the result and immediately reset the cache
      const result = undecoratedEval()
      boundValue.eval = boundValueEval
      return result
    }
  }

  exitConst(cdef: ir.QuintConst) {
    // all constants should be instantiated before running the simulator
    const code: ErrorCode = 'QNT500'
    const msg = `${code}: Uninitialized const ${cdef.name}. Use: import <moduleName>(${cdef.name}=<value>).*`
    this.errorTracker.addCompileError(cdef.id, msg)
  }

  exitVar(vardef: ir.QuintVar) {
    const varName = vardef.name
    // simply introduce two registers:
    //  one for the variable, and
    //  one for its next-state version
    const prevRegister = mkRegister('var', varName, none(), () =>
      this.errorTracker.addRuntimeError(vardef.id, `Variable ${varName} is not set`)
    )
    this.vars.push(prevRegister)
    // at the moment, we have to refer to variables both via id and name
    this.context.set(kindName('var', varName), prevRegister)
    this.context.set(kindName('var', vardef.id), prevRegister)
    const nextRegister = mkRegister('nextvar', varName, none(), () =>
      this.errorTracker.addRuntimeError(vardef.id, `${varName}' is not set`)
    )
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
    // The name belongs to one of the objects:
    // a shadow variable, a variable, an argument, a callable.
    // The order is important, as defines the name priority.
    const comp =
      this.contextGet(name.name, ['shadow']) ??
      this.contextLookup(name.id, ['arg', 'var', 'callable']) ??
      // a backup case for Nat, Int, and Bool, and special names such as q::input
      this.contextGet(name.name, ['arg', 'callable'])
    if (comp) {
      // this name has an associated computable object already
      this.compStack.push(comp)
    } else {
      // this should not happen, due to the name resolver
      this.errorTracker.addCompileError(name.id, `Name ${name.name} not found`)
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
              this.errorTracker.addCompileError(app.id, 'Operator next(...) needs one argument')
              this.compStack.push(fail)
            }
          }
          break

        case 'assign':
          this.translateAssign(app.id)
          break

        case 'eq':
          this.applyFun(app.id, 2, (x, y) => just(rv.mkBool(x.equals(y))))
          break

        case 'neq':
          this.applyFun(app.id, 2, (x, y) => just(rv.mkBool(!x.equals(y))))
          break

        // conditional
        case 'ite':
          this.translateIfThenElse(app.id)
          break

        // Booleans
        case 'not':
          this.applyFun(app.id, 1, p => just(rv.mkBool(!p.toBool())))
          break

        case 'and':
          // a conjunction over expressions is lazy
          this.translateBoolOp(app, just(rv.mkBool(true)), (_, r) => (!r ? just(rv.mkBool(false)) : none()))
          break

        case 'actionAll':
          this.translateAllOrThen(app)
          break

        case 'or':
          // a disjunction over expressions is lazy
          this.translateBoolOp(app, just(rv.mkBool(false)), (_, r) => (r ? just(rv.mkBool(true)) : none()))
          break

        case 'actionAny':
          this.translateOrAction(app)
          break

        case 'implies':
          // an implication is lazy
          this.translateBoolOp(app, just(rv.mkBool(false)), (n, r) => (n == 0 && !r ? just(rv.mkBool(true)) : none()))
          break

        case 'iff':
          this.applyFun(app.id, 2, (p, q) => just(rv.mkBool(p.toBool() === q.toBool())))
          break

        // integers
        case 'iuminus':
          this.applyFun(app.id, 1, n => just(rv.mkInt(-n.toInt())))
          break

        case 'iadd':
          this.applyFun(app.id, 2, (p, q) => just(rv.mkInt(p.toInt() + q.toInt())))
          break

        case 'isub':
          this.applyFun(app.id, 2, (p, q) => just(rv.mkInt(p.toInt() - q.toInt())))
          break

        case 'imul':
          this.applyFun(app.id, 2, (p, q) => just(rv.mkInt(p.toInt() * q.toInt())))
          break

        case 'idiv':
          this.applyFun(app.id, 2, (p, q) => {
            if (q.toInt() !== 0n) {
              return just(rv.mkInt(p.toInt() / q.toInt()))
            } else {
              this.errorTracker.addRuntimeError(app.id, 'Division by zero')
              return none()
            }
          })
          break

        case 'imod':
          this.applyFun(app.id, 2, (p, q) => just(rv.mkInt(p.toInt() % q.toInt())))
          break

        case 'ipow':
          this.applyFun(app.id, 2, (p, q) => {
            if (q.toInt() == 0n && p.toInt() == 0n) {
              this.errorTracker.addRuntimeError(app.id, '0^0 is undefined')
            } else if (q.toInt() < 0n) {
              this.errorTracker.addRuntimeError(app.id, 'i^j is undefined for j < 0')
            } else {
              return just(rv.mkInt(p.toInt() ** q.toInt()))
            }
            return none()
          })
          break

        case 'igt':
          this.applyFun(app.id, 2, (p, q) => just(rv.mkBool(p.toInt() > q.toInt())))
          break

        case 'ilt':
          this.applyFun(app.id, 2, (p, q) => just(rv.mkBool(p.toInt() < q.toInt())))
          break

        case 'igte':
          this.applyFun(app.id, 2, (p, q) => just(rv.mkBool(p.toInt() >= q.toInt())))
          break

        case 'ilte':
          this.applyFun(app.id, 2, (p, q) => just(rv.mkBool(p.toInt() <= q.toInt())))
          break

        case 'Tup':
          // Construct a tuple from an array of values
          this.applyFun(app.id, app.args.length, (...values: RuntimeValue[]) => just(rv.mkTuple(values)))
          break

        case 'item':
          // Access a tuple: tuples are 1-indexed, that is, _1, _2, etc.
          this.applyFun(app.id, 2, (tuple, idx) => this.getListElem(app.id, tuple.toList(), Number(idx.toInt()) - 1))
          break

        case 'tuples':
          // Construct a cross product
          this.applyFun(app.id, app.args.length, (...sets: RuntimeValue[]) => just(rv.mkCrossProd(sets)))
          break

        case 'List':
          // Construct a list from an array of values
          this.applyFun(app.id, app.args.length, (...values: RuntimeValue[]) => just(rv.mkList(values)))
          break

        case 'range':
          this.applyFun(app.id, 2, (start, end) => {
            const [s, e] = [Number(start.toInt()), Number(end.toInt())]
            if (s <= e) {
              const arr: RuntimeValue[] = []
              for (let i = s; i < e; i++) {
                arr.push(rv.mkInt(BigInt(i)))
              }
              return just(rv.mkList(arr))
            } else {
              this.errorTracker.addRuntimeError(app.id, `range(${s}, ${e}) is out of bounds`)
              return none()
            }
          })
          break

        case 'nth':
          // Access a list
          this.applyFun(app.id, 2, (list, idx) => this.getListElem(app.id, list.toList(), Number(idx.toInt())))
          break

        case 'replaceAt':
          this.applyFun(app.id, 3, (list, idx, value) =>
            this.updateList(app.id, list.toList(), Number(idx.toInt()), value)
          )
          break

        case 'head':
          this.applyFun(app.id, 1, list => this.getListElem(app.id, list.toList(), 0))
          break

        case 'tail':
          this.applyFun(app.id, 1, list => {
            const l = list.toList()
            if (l.size > 0) {
              return this.sliceList(app.id, l, 1, l.size)
            } else {
              this.errorTracker.addRuntimeError(app.id, 'Applied tail to an empty list')
              return none()
            }
          })
          break

        case 'slice':
          this.applyFun(app.id, 3, (list, start, end) => {
            const [l, s, e] = [list.toList(), Number(start.toInt()), Number(end.toInt())]
            if (s >= 0 && s <= l.size && e <= l.size && e >= s) {
              return this.sliceList(app.id, l, s, e)
            } else {
              this.errorTracker.addRuntimeError(app.id, `slice(..., ${s}, ${e}) applied to a list of size ${l.size}`)
              return none()
            }
          })
          break

        case 'length':
          this.applyFun(app.id, 1, list => just(rv.mkInt(BigInt(list.toList().size))))
          break

        case 'append':
          this.applyFun(app.id, 2, (list, elem) => just(rv.mkList(list.toList().push(elem))))
          break

        case 'concat':
          this.applyFun(app.id, 2, (list1, list2) => just(rv.mkList(list1.toList().concat(list2.toList()))))
          break

        case 'indices':
          this.applyFun(app.id, 1, list => just(rv.mkInterval(0n, BigInt(list.toList().size - 1))))
          break

        case 'Rec':
          // Construct a record
          this.applyFun(app.id, app.args.length, (...values: RuntimeValue[]) => {
            const keys = values.filter((e, i) => i % 2 === 0).map(k => k.toStr())
            const map: OrderedMap<string, RuntimeValue> = keys.reduce((map, key, i) => {
              const v = values[2 * i + 1]
              return v ? map.set(key, v) : map
            }, OrderedMap<string, RuntimeValue>())
            return just(rv.mkRecord(map))
          })
          break

        case 'field':
          // Access a record via the field name
          this.applyFun(app.id, 2, (rec, fieldName) => {
            const name = fieldName.toStr()
            const fieldValue = rec.toOrderedMap().get(name)
            if (fieldValue) {
              return just(fieldValue)
            } else {
              this.errorTracker.addRuntimeError(app.id, `Accessing a missing record field ${name}`)
              return none()
            }
          })
          break

        case 'fieldNames':
          this.applyFun(app.id, 1, rec => {
            const keysAsRuntimeValues = rec
              .toOrderedMap()
              .keySeq()
              .map(key => rv.mkStr(key))
            return just(rv.mkSet(keysAsRuntimeValues))
          })
          break

        case 'with':
          // update a record
          this.applyFun(app.id, 3, (rec, fieldName, fieldValue) => {
            const oldMap = rec.toOrderedMap()
            const key = fieldName.toStr()
            if (oldMap.has(key)) {
              const newMap = rec.toOrderedMap().set(key, fieldValue)
              return just(rv.mkRecord(newMap))
            } else {
              this.errorTracker.addRuntimeError(app.id, `Called 'with' with a non-existent key ${key}`)
              return none()
            }
          })
          break

        case 'Set':
          // Construct a set from an array of values.
          this.applyFun(app.id, app.args.length, (...values: RuntimeValue[]) => just(rv.mkSet(values)))
          break

        case 'powerset':
          this.applyFun(app.id, 1, (baseset: RuntimeValue) => just(rv.mkPowerset(baseset)))
          break

        case 'contains':
          this.applyFun(app.id, 2, (set, value) => just(rv.mkBool(set.contains(value))))
          break

        case 'in':
          this.applyFun(app.id, 2, (value, set) => just(rv.mkBool(set.contains(value))))
          break

        case 'subseteq':
          this.applyFun(app.id, 2, (l, r) => just(rv.mkBool(l.isSubset(r))))
          break

        case 'union':
          this.applyFun(app.id, 2, (l, r) => just(rv.mkSet(l.toSet().union(r.toSet()))))
          break

        case 'intersect':
          this.applyFun(app.id, 2, (l, r) => just(rv.mkSet(l.toSet().intersect(r.toSet()))))
          break

        case 'exclude':
          this.applyFun(app.id, 2, (l, r) => just(rv.mkSet(l.toSet().subtract(r.toSet()))))
          break

        case 'size':
          this.applyFun(app.id, 1, set => set.cardinality().map(rv.mkInt))
          break

        case 'isFinite':
          // at the moment, we support only finite sets, so just return true
          this.applyFun(app.id, 1, _set => just(rv.mkBool(true)))
          break

        case 'to':
          this.applyFun(app.id, 2, (i, j) => just(rv.mkInterval(i.toInt(), j.toInt())))
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
            return just(rv.mkSet(setOfSets.flatten(1) as Set<RuntimeValue>))
          })
          break

        case 'get':
          // Get a map value
          this.applyFun(app.id, 2, (map, key) => {
            const value = map.toMap().get(key.normalForm())
            if (value) {
              return just(value)
            } else {
              // Should we print the key? It may be a complex expression.
              this.errorTracker.addRuntimeError(app.id, "Called 'get' with a non-existing key")
              return none()
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
              return just(rv.fromMap(newMap))
            } else {
              this.errorTracker.addRuntimeError(app.id, "Called 'set' with a non-existing key")
              return none()
            }
          })
          break

        case 'put':
          // add a value to a map
          this.applyFun(app.id, 3, (map, key, newValue) => {
            const normalKey = key.normalForm()
            const asMap = map.toMap()
            const newMap = asMap.set(normalKey, newValue)
            return just(rv.fromMap(newMap))
          })
          break

        case 'setBy': {
          // Update a map value via a lambda
          const fun = this.compStack.pop() ?? fail
          this.applyFun(app.id, 2, (map, key) => {
            const normalKey = key.normalForm()
            const asMap = map.toMap()
            if (asMap.has(normalKey)) {
              return fun.eval([just(asMap.get(normalKey))]).map(newValue => {
                const newMap = asMap.set(normalKey, newValue as RuntimeValue)
                return rv.fromMap(newMap)
              })
            } else {
              this.errorTracker.addRuntimeError(app.id, "Called 'setBy' with a non-existing key")
              return none()
            }
          })
          break
        }

        case 'keys':
          // map keys as a set
          this.applyFun(app.id, 1, map => {
            return just(rv.mkSet(map.toMap().keys()))
          })
          break

        case 'oneOf':
          this.applyOneOf(app.id)
          break

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
          this.applyFun(app.id, app.args.length, (...pairs: any[]) => just(rv.mkMap(pairs)))
          break

        case 'setToMap':
          this.applyFun(app.id, 1, (set: RuntimeValue) =>
            just(
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
            return just(rv.mkMapSet(dom, rng))
          })
          break

        case 'then':
          this.translateAllOrThen(app)
          break

        case 'fail':
          this.applyFun(app.id, 1, result => {
            return just(rv.mkBool(!result.toBool()))
          })
          break

        case 'assert':
          this.applyFun(app.id, 1, cond => {
            if (!cond.toBool()) {
              this.errorTracker.addRuntimeError(app.id, 'Assertion failed')
              return none()
            }
            return just(cond)
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

        // standard unary operators that are not handled by REPL
        case 'allLists':
        case 'chooseSome':
        case 'always':
        case 'eventually':
        case 'enabled':
          this.applyFun(app.id, 1, _ => {
            this.errorTracker.addRuntimeError(app.id, `Runtime does not support the built-in operator '${app.opcode}'`)
            return none()
          })
          break

        // builtin operators that are not handled by REPL
        case 'unionMatch':
        case 'orKeep':
        case 'mustChange':
        case 'weakFair':
        case 'strongFair':
          this.applyFun(app.id, 2, _ => {
            this.errorTracker.addRuntimeError(app.id, `Runtime does not support the built-in operator '${app.opcode}'`)
            return none()
          })
          break

        default:
          unreachable(app.opcode)
      }
    }
  }

  private applyUserDefined(app: ir.QuintApp) {
    const onError = (sourceId: bigint, msg: string): void => {
      this.errorTracker.addCompileError(sourceId, msg)
      this.compStack.push(fail)
    }

    // look up for the operator to see, whether it's just an operator, or a parameter
    const lookupEntry = this.lookupTable.get(app.id)
    if (lookupEntry === undefined) {
      return onError(app.id, `Called unknown operator ${app.opcode}`)
    }

    // retrieve the operator type to see, whether tuples should be unpacked
    const operScheme = this.types.get(lookupEntry.reference)
    if (operScheme === undefined) {
      return onError(app.id, `No type for ${app.opcode}`)
    }

    if (operScheme.type.kind !== 'oper') {
      return onError(app.id, `Expected ${app.opcode} to be an operator`)
    }

    // this function gives us access to the compiled operator later
    let callableRef: () => Maybe<Callable>

    if (lookupEntry === undefined || lookupEntry.kind !== 'param') {
      // The common case: the operator has been defined elsewhere.
      // We simply look up for the operator and return it via callableRef.
      const callable = this.contextLookup(app.id, ['callable']) as Callable
      if (callable === undefined || callable.nparams === undefined) {
        return onError(app.id, `Called unknown operator ${app.opcode}`)
      }
      callableRef = () => just(callable)
    } else {
      // The operator is a parameter of another operator.
      // We do not have access to the operator yet.
      let register = this.contextLookup(app.id, ['arg']) as Register
      if (register === undefined) {
        return onError(app.id, `Parameter ${app.opcode} is not found`)
      }
      // every time we need a Callable, we retrieve it from the register
      callableRef = () => {
        return register.registerValue.map(v => v as Callable)
      }
    }
    // nparams === nargs, unless a tuple is passed to an n-ary operator.
    const nparams = operScheme.type.args.length
    const nargs = app.args.length

    const nactual = this.compStack.length
    if (nactual < nargs) {
      return onError(app.id, `Expected ${nargs} arguments for ${app.opcode}, found: ${nactual}`)
    } else {
      // pop nargs elements of the compStack
      const args = this.compStack.splice(-nargs, nargs)
      // Produce the new computable value.
      // This code is similar to applyFun, but it calls the listener before
      const comp = {
        eval: (): Maybe<RuntimeValue> => {
          this.execListener.onUserOperatorCall(app)
          // compute the values of the arguments at this point
          const merged = merge(args.map(a => a.eval()))
          const callable = callableRef()
          if (merged.isNone() || callable.isNone()) {
            this.execListener.onUserOperatorReturn(app, [], none())
            return none()
          }
          return merged
            .map(values => {
              // if they are all defined, check whether unpacking is needed
              let actualArgs: RuntimeValue[] = values as RuntimeValue[]
              if (nparams > nargs && nargs === 1) {
                // unpack the tuple
                actualArgs = [...actualArgs[0]]
              }

              const result = callable.value.eval(actualArgs.map(just)) as Maybe<RuntimeValue>
              this.execListener.onUserOperatorReturn(app, actualArgs, result)
              return result
            })
            .join()
        },
      }
      this.compStack.push(comp)
    }
  }

  enterLambda(lam: ir.QuintLambda) {
    // introduce a register for every parameter
    lam.params.forEach(p => {
      const register = mkRegister('arg', p.name, none(), () => `Parameter ${p} is not set`)
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
        this.errorTracker.addCompileError(p.id, `Parameter ${p.name} not found`)
      }
    })

    const lambdaBody = this.compStack.pop()
    if (lambdaBody) {
      this.compStack.push(mkCallable(registers, lambdaBody))
    } else {
      this.errorTracker.addCompileError(lam.id, 'Compilation of lambda failed')
    }
  }

  private translateAssign(sourceId: bigint): void {
    if (this.compStack.length < 2) {
      this.errorTracker.addCompileError(sourceId, `Assignment '=' needs two arguments`)
      return
    }
    const [register, rhs] = this.compStack.splice(-2)
    const name = (register as Register).name
    if (name === undefined) {
      this.errorTracker.addCompileError(sourceId, `Assignment '=' applied to a non-variable`)
      this.compStack.push(fail)
      return
    }

    const nextvar = this.contextGet(name, ['nextvar']) as Register
    if (nextvar) {
      this.compStack.push(rhs)
      this.applyFun(sourceId, 1, value => {
        nextvar.registerValue = just(value)
        return just(rv.mkBool(true))
      })
    } else {
      this.errorTracker.addCompileError(sourceId, `Undefined next variable in ${name} = ...`)
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
    mapResultAndElems: (_array: Array<[RuntimeValue, RuntimeValue]>) => RuntimeValue
  ): void {
    if (this.compStack.length < 2) {
      this.errorTracker.addCompileError(sourceId, 'Not enough arguments')
      return
    }
    // lambda translated to Callable
    const callable = this.compStack.pop() as Callable
    // apply the lambda to a single element of the set
    const evaluateElem = function (elem: RuntimeValue): Maybe<[RuntimeValue, RuntimeValue]> {
      let actualArgs: RuntimeValue[]
      if (callable.nparams === 1) {
        // store the set element in the register
        actualArgs = [elem]
      } else {
        // unpack a tuple and store its elements in the registers
        actualArgs = [...elem]
        if (actualArgs.length !== callable.nparams) {
          return none()
        }
      }
      // evaluate the predicate against the actual arguments.
      const result = callable.eval(actualArgs.map(just))
      return result.map(result => [result as RuntimeValue, elem])
    }
    this.applyFun(sourceId, 1, (iterable: Iterable<RuntimeValue>): Maybe<RuntimeValue> => {
      return flatMap(iterable, evaluateElem).map(rs => mapResultAndElems(rs))
    })
  }

  /**
   * Translate one of the operators: fold, foldl, and foldr.
   */
  private applyFold(sourceId: bigint, order: 'fwd' | 'rev'): void {
    if (this.compStack.length < 3) {
      this.errorTracker.addCompileError(sourceId, 'Not enough arguments for fold')
      return
    }
    // extract two arguments from the call stack and keep the set
    const callable = this.compStack.pop() as Callable
    // this method supports only 2-argument callables
    assert(callable.nparams === 2)
    // compile the computation of the initial value
    const initialComp = this.compStack.pop() ?? fail
    // the register number depends on the traversal order
    const accumIndex = order == 'fwd' ? 0 : 1
    // keep the iteration values in args
    const args: Maybe<EvalResult>[] = [none(), none()]
    // apply the lambda to a single element of the set
    const evaluateElem = function (elem: RuntimeValue): Maybe<EvalResult> {
      // The accumulator should have been set in the previous iteration.
      // Set the other register to the element.
      args[1 - accumIndex] = just(elem)
      const result = callable.eval(args)
      // save the result for the next iteration
      args[accumIndex] = result
      return result
    }
    // iterate over the iterable (a set or a list)
    this.applyFun(sourceId, 1, (iterable: Iterable<RuntimeValue>): Maybe<any> => {
      return initialComp
        .eval()
        .map(initialValue => {
          // save the initial value
          args[accumIndex] = just(initialValue)
          // fold the iterable
          return flatForEach(order, iterable, just(initialValue), evaluateElem)
        })
        .join()
    })
  }

  // pop nargs computable values, pass them the 'fun' function, and
  // push the combined computable value on the stack
  private applyFun(sourceId: bigint, nargs: number, fun: (..._args: RuntimeValue[]) => Maybe<RuntimeValue>) {
    if (this.compStack.length < nargs) {
      this.errorTracker.addCompileError(sourceId, 'Not enough arguments')
    } else {
      // pop nargs elements of the compStack
      const args = this.compStack.splice(-nargs, nargs)
      // produce the new computable value
      const comp = {
        eval: (): Maybe<RuntimeValue> => {
          try {
            // compute the values of the arguments at this point
            const values = args.map(a => a.eval())
            // if they are all defined, apply the function 'fun' to the arguments
            return merge(values)
              .map(vs => fun(...vs.map(v => v as RuntimeValue)))
              .join()
          } catch (error) {
            const msg = error instanceof Error ? error.message : 'unknown error'
            this.errorTracker.addRuntimeError(sourceId, msg)
            return none()
          }
        },
      }
      this.compStack.push(comp)
    }
  }

  // if-then-else requires special treatment,
  // as it should not evaluate both arms
  private translateIfThenElse(sourceId: bigint) {
    if (this.compStack.length < 3) {
      this.errorTracker.addCompileError(sourceId, 'Not enough arguments')
    } else {
      // pop 3 elements of the compStack
      const [cond, thenArm, elseArm] = this.compStack.splice(-3, 3)
      // produce the new computable value
      const comp = {
        eval: () => {
          // compute the values of the arguments at this point
          const v = cond.eval().map(pred => (pred.equals(rv.mkBool(true)) ? thenArm.eval() : elseArm.eval()))
          return v.join()
        },
      }
      this.compStack.push(comp)
    }
  }

  // compute all { ... } or A.then(B)...then(E) for a chain of actions
  private chainAllOrThen(actions: Computable[], kind: 'all' | 'then'): Maybe<EvalResult> {
    // save the values of the next variables, as actions may update them
    const savedValues = this.snapshotNextVars()
    const savedTrace = this.trace()
    let result: Maybe<EvalResult> = just(rv.mkBool(true))
    // Evaluate arguments iteratively.
    // Stop as soon as one of the arguments returns false.
    // This is a form of Boolean short-circuiting.
    let nactionsLeft = actions.length
    for (const action of actions) {
      nactionsLeft--
      result = action.eval()
      if (result.isNone() || !(result.value as RuntimeValue).toBool()) {
        // As soon as one of the arguments does not evaluate to true,
        // break out of the loop.
        // Restore the values of the next variables,
        // as evaluation was not successful.
        this.recoverNextVars(savedValues)
        this.resetTrace(savedTrace.map(rv.mkList))
        break
      }

      // switch to the next frame, when implementing A.then(B)
      if (kind === 'then' && nactionsLeft > 0) {
        this.shiftVars()
        this.extendTrace()
      }
    }

    return result
  }

  // translate all { A, ..., C } or A.then(B)
  private translateAllOrThen(app: ir.QuintApp): void {
    if (this.compStack.length < app.args.length) {
      this.errorTracker.addCompileError(app.id, `Not enough arguments on stack for "${app.opcode}"`)
      return
    }
    const args = this.compStack.splice(-app.args.length)

    const kind = app.opcode === 'then' ? 'then' : 'all'
    const lazyCompute = () => this.chainAllOrThen(args, kind)

    this.compStack.push(mkFunComputable(lazyCompute))
  }

  // translate A.repeated(i)
  //
  // TODO: Soon to be removed: https://github.com/informalsystems/quint/issues/848
  private translateRepeated(app: ir.QuintApp): void {
    if (this.compStack.length < 2) {
      this.errorTracker.addCompileError(app.id, `Not enough arguments on stack for "${app.opcode}"`)
      return
    }
    const [action, niterations] = this.compStack.splice(-2)

    const lazyCompute = () => {
      // compute the number of iterations and repeat 'action' that many times
      return niterations
        .eval()
        .map(num => {
          const n = Number((num as RuntimeValue).toInt())
          return this.chainAllOrThen(new Array(n).fill(action), 'then')
        })
        .join()
    }

    this.compStack.push(mkFunComputable(lazyCompute))
  }

  // translate n.reps(A)
  private translateReps(app: ir.QuintApp): void {
    if (this.compStack.length < 2) {
      this.errorTracker.addCompileError(app.id, `Not enough arguments on stack for "${app.opcode}"`)
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
                return action.eval([just(rv.mkInt(BigInt(i)))])
              },
            }
          })
          return this.chainAllOrThen(actions, 'then')
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
    defaultValue: Maybe<EvalResult>,
    shortCircuit: (no: number, r: boolean) => Maybe<EvalResult>
  ): void {
    if (this.compStack.length < app.args.length) {
      this.errorTracker.addCompileError(app.id, `Not enough arguments on stack for "${app.opcode}"`)
      return
    }
    const args = this.compStack.splice(-app.args.length)

    const lazyCompute = () => {
      let result: Maybe<EvalResult> = defaultValue
      // Evaluate arguments iteratively.
      // Stop as soon as shortCircuit tells us to stop.
      let no = 0
      for (const arg of args) {
        // either the argument is evaluated to a Boolean, or fails
        result = arg.eval()
        if (result.isNone()) {
          return none()
        }

        // if shortCircuit returns a value, return the value immediately
        const b = shortCircuit(no, (result.value as RuntimeValue).toBool())
        if (b.isJust()) {
          return b
        }
        no += 1
      }

      return result
    }

    this.compStack.push(mkFunComputable(lazyCompute))
  }

  // translate any { A, ..., C }
  private translateOrAction(app: ir.QuintApp): void {
    if (this.compStack.length < app.args.length) {
      this.errorTracker.addCompileError(app.id, 'Not enough arguments on stack for "any"')
      return
    }
    const args = this.compStack.splice(-app.args.length)

    // According to the semantics of action-level disjunctions,
    // we have to find out which branches are enabled and pick one of them
    // non-deterministically. Instead of modeling non-determinism,
    // we use a random number generator. This may change in the future.
    const lazyCompute = () => {
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
        const result = arg.eval().or(just(rv.mkBool(false)))
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
        return just(rv.mkBool(false))
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
      return just(rv.mkBool(true))
    }

    this.compStack.push(mkFunComputable(lazyCompute))
  }

  // Apply the operator oneOf
  private applyOneOf(sourceId: bigint) {
    this.applyFun(sourceId, 1, set => {
      const bounds = set.bounds()
      const positions: bigint[] = bounds.map(b => {
        return (
          b
            .map(sz => {
              if (sz === 0n) {
                this.errorTracker.addRuntimeError(sourceId, `Applied oneOf to an empty set`)
              }
              return this.rand(sz)
            })
            // An infinite set, pick an integer from the range [-2^255, 2^255).
            // Note that pick on Nat uses the absolute value of the passed integer.
            // TODO: make it a configurable parameter:
            // https://github.com/informalsystems/quint/issues/279
            .or(just(-(2n ** 255n) + this.rand(2n ** 256n)))
            .unwrap()
        )
      })

      return set.pick(positions.values())
    })
  }

  private test(sourceId: bigint) {
    if (this.compStack.length < 5) {
      this.errorTracker.addCompileError(sourceId, 'Not enough arguments on stack for "q::test"')
      return
    }

    const [nruns, nsteps, init, next, inv] = this.compStack.splice(-5)
    this.runTestSimulation(nruns, nsteps, init, next, inv)
  }

  private testOnce(sourceId: bigint) {
    if (this.compStack.length < 4) {
      this.errorTracker.addCompileError(sourceId, 'Not enough arguments on stack for "q::testOnce"')
      return
    }

    const [nsteps, init, next, inv] = this.compStack.splice(-4)
    const nruns = mkConstComputable(rv.mkInt(1n))
    this.runTestSimulation(nruns, nsteps, init, next, inv)
  }

  // The simulator core: produce multiple random runs
  // and check the given state invariant (state assertion).
  //
  // Technically, this is similar to the implementation of folds.
  // However, it also restores the state and saves a trace, if there is any.
  private runTestSimulation(
    nrunsComp: Computable,
    nstepsComp: Computable,
    init: Computable,
    next: Computable,
    inv: Computable
  ) {
    const doRun = (): Maybe<EvalResult> => {
      return merge([nrunsComp, nstepsComp].map(c => c.eval()))
        .map(([nrunsRes, nstepsRes]) => {
          const isTrue = (res: Maybe<EvalResult>) => {
            return !res.isNone() && (res.value as RuntimeValue).toBool() === true
          }
          // a failure flag for the case a runtime error is found
          let failure = false
          // the value to be returned in the end of evaluation
          let errorFound = false
          // save the registers to recover them later
          const vars = this.snapshotVars()
          const nextVars = this.snapshotNextVars()
          // do multiple runs, stop at the first failing run
          const nruns = (nrunsRes as RuntimeValue).toInt()
          for (let runNo = 0; !errorFound && !failure && runNo < nruns; runNo++) {
            this.execListener.onRunCall()
            this.resetTrace()
            // check Init()
            const initApp: ir.QuintApp = { id: 0n, kind: 'app', opcode: 'q::initAndInvariant', args: [] }
            this.execListener.onUserOperatorCall(initApp)
            const initResult = init.eval()
            failure = initResult.isNone() || failure
            if (!isTrue(initResult)) {
              this.execListener.onUserOperatorReturn(initApp, [], initResult)
            } else {
              // The initial action evaluates to true.
              // Our guess of values was good.
              this.shiftVars()
              this.extendTrace()
              // check the invariant Inv
              const invResult = inv.eval()
              this.execListener.onUserOperatorReturn(initApp, [], initResult)
              failure = invResult.isNone() || failure
              if (!isTrue(invResult)) {
                errorFound = true
              } else {
                // check all { Next(), shift(), Inv } in a loop
                const nsteps = (nstepsRes as RuntimeValue).toInt()
                for (let i = 0; !errorFound && !failure && i < nsteps; i++) {
                  const nextApp: ir.QuintApp = {
                    id: 0n,
                    kind: 'app',
                    opcode: 'q::stepAndInvariant',
                    args: [],
                  }
                  this.execListener.onUserOperatorCall(nextApp)
                  const nextResult = next.eval()
                  failure = nextResult.isNone() || failure
                  if (isTrue(nextResult)) {
                    this.shiftVars()
                    this.extendTrace()
                    errorFound = !isTrue(inv.eval())
                    this.execListener.onUserOperatorReturn(nextApp, [], nextResult)
                  } else {
                    // Otherwise, the run cannot be extended.
                    // In some cases, this may indicate a deadlock.
                    // Since we are doing random simulation, it is very likely
                    // that we have not generated good values for extending
                    // the run. Hence, do not report an error here, but simply
                    // drop the run. Otherwise, we would have a lot of false
                    // positives, which look like deadlocks but they are not.
                    this.execListener.onUserOperatorReturn(nextApp, [], nextResult)
                    this.execListener.onRunReturn(just(rv.mkBool(true)), this.trace().or(just(rv.mkList([]))).value)
                    break
                  }
                }
              }
            }
            const outcome = !failure ? just(rv.mkBool(!errorFound)) : none()
            this.execListener.onRunReturn(outcome, this.trace().or(just(rv.mkList([]))).value)
            // recover the state variables
            this.recoverVars(vars)
            this.recoverNextVars(nextVars)
          } // end of a single random run

          // finally, return true, if no error was found
          return !failure ? just(rv.mkBool(!errorFound)) : none()
        })
        .join()
    }
    this.compStack.push(mkFunComputable(doRun))
  }

  private trace() {
    let trace = this.shadowVars.find(r => r.name === lastTraceName)
    return trace ? trace.registerValue.map(t => t.toList()) : none()
  }

  private resetTrace(value: Maybe<RuntimeValue> = just(rv.mkList([]))) {
    let trace = this.shadowVars.find(r => r.name === lastTraceName)
    if (trace) {
      trace.registerValue = value
    }
  }

  private extendTrace() {
    let trace = this.shadowVars.find(r => r.name === lastTraceName)
    if (trace) {
      const extended = this.trace().map(t => rv.mkList(t.push(this.varsToRecord())))
      trace.registerValue = extended
    }
  }

  // convert the current variable values to a record
  private varsToRecord() {
    const map: [string, RuntimeValue][] = this.vars
      .filter(r => r.registerValue.isJust())
      .map(r => [r.name, r.registerValue.value as RuntimeValue])
    return rv.mkRecord(map)
  }

  private shiftVars() {
    this.recoverVars(this.snapshotNextVars())
    this.nextVars.forEach(r => (r.registerValue = none()))
  }

  // save the values of the vars into an array
  private snapshotVars(): Maybe<RuntimeValue>[] {
    return this.vars.map(r => r.registerValue)
  }

  // save the values of the next vars into an array
  private snapshotNextVars(): Maybe<RuntimeValue>[] {
    return this.nextVars.map(r => r.registerValue)
  }

  // load the values of the variables from an array
  private recoverVars(values: Maybe<RuntimeValue>[]) {
    this.vars.forEach((r, i) => (r.registerValue = values[i]))
  }

  // load the values of the next variables from an array
  private recoverNextVars(values: Maybe<RuntimeValue>[]) {
    this.nextVars.forEach((r, i) => (r.registerValue = values[i]))
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
      const refId = vdef.reference!
      for (const k of kinds) {
        const value = this.context.get(kindName(k, refId))
        if (value) {
          return value
        }
      }
    }

    return undefined
  }

  // Access a list via an index
  private getListElem(sourceId: bigint, list: List<RuntimeValue>, idx: number) {
    if (idx >= 0n && idx < list.size) {
      const elem = list.get(Number(idx))
      return elem ? just(elem) : none()
    } else {
      this.errorTracker.addRuntimeError(sourceId, `Out of bounds, nth(${idx})`)
      return none()
    }
  }

  // Update a list via an index
  private updateList(sourceId: bigint, list: List<RuntimeValue>, idx: number, value: RuntimeValue) {
    if (idx >= 0n && idx < list.size) {
      return just(rv.mkList(list.set(Number(idx), value)))
    } else {
      this.errorTracker.addRuntimeError(sourceId, `Out of bounds, replaceAt(..., ${idx}, ...)`)
      return none()
    }
  }

  // slice a list
  private sliceList(sourceId: bigint, list: List<RuntimeValue>, start: number, end: number) {
    return just(rv.mkList(list.slice(start, end)))
  }
}

// make a `Computable` that always returns a given runtime value
function mkConstComputable(value: RuntimeValue) {
  return {
    eval: () => {
      return just<any>(value)
    },
  }
}

// make a `Computable` that always returns a given runtime value
function mkFunComputable(fun: () => Maybe<EvalResult>) {
  return {
    eval: () => {
      return fun()
    },
  }
}

/**
 * Apply `f` to every element of `iterable` and either:
 *
 *  - return `none`, if one of the results is `none`, or
 *  - return `just` of the unpacked results.
 */
function flatMap<T, R>(iterable: Iterable<T>, f: (_arg: T) => Maybe<R>): Maybe<Array<R>> {
  const results: R[] = []
  for (const arg of iterable) {
    const res = f(arg)
    if (res.isNone()) {
      return none<Array<R>>()
    } else {
      const { value } = res
      results.push(value)
    }
  }

  return just(results)
}

/**
 * Apply `f` to every element of `iterable` and either:
 *
 *  - return `none`, if one of the results is `none`, or
 *  - return `just` of the last result.
 */
function flatForEach<T, R>(
  order: 'fwd' | 'rev',
  iterable: Iterable<T>,
  init: Maybe<R>,
  f: (_arg: T) => Maybe<R>
): Maybe<R> {
  let result: Maybe<R> = init
  // if the reverse order is required, reverse the array
  const iter = order === 'fwd' ? iterable : Array(...iterable).reverse()
  for (const arg of iter) {
    result = f(arg)
    if (result.isNone()) {
      return result
    }
  }

  return result
}
