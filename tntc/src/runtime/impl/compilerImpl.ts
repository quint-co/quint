/*
 * Compiler of TNT expressions and definitions to Computable values
 * that can be evaluated in the runtime.
 *
 * Igor Konnov, 2022
 *
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import { strict as assert } from 'assert'
import { Maybe, none, just, merge } from '@sweet-monads/maybe'
import { Set, List, OrderedMap } from 'immutable'

import { IRVisitor } from '../../IRVisitor'
import {
  Computable, EvalResult, Register, Callable, ComputableKind,
  kindName, fail, mkCallable, mkRegister
} from '../runtime'

import * as ir from '../../tntIr'

import { rv, RuntimeValue } from './runtimeValue'

import { lastTraceName } from '../compile'

/**
 * Compiler visitor turns TNT definitions and expressions into Computable
 * objects, essentially, lazy JavaScript objects. Importantly, it does not do
 * any evaluation during the translation and thus delegates the actual
 * computation to the JavaScript engine. Since many of TNT operators may be
 * computationally expensive, it is crucial to maintain this separation of
 * compilation vs. computation.
 *
 * This class does not do any dynamic type checking, assuming that the type
 * checker will be run before the translation in the future. As we do not have
 * the type checker yet, computations may fail with weird JavaScript errors.
 */
export class CompilerVisitor implements IRVisitor {
  // the stack of computable values
  private compStack: Computable[] = []
  // The map of names to their computable values:
  //  - wrappers around RuntimeValue
  //  - an instance of Register
  //  - an instance of Callable
  private context: Map<string, Computable> = new Map<string, Computable>()

  // all variables declared during compilation
  private vars: Register[] = []
  // the registers allocated for the next-state values of vars
  private nextVars: Register[] = []
  // shadow variables that are used by the simulator
  private shadowVars: Register[] = []

  constructor () {
    const lastTrace = mkRegister('shadow', lastTraceName, none())
    this.shadowVars.push(lastTrace)
    this.context.set(kindName(lastTrace.kind, lastTrace.name), lastTrace)
  }

  /**
   * Get the compiled context.
   */
  getContext (): Map<string, Computable> {
    return this.context
  }

  /**
   * Get the names of the compiled variables.
   */
  getVars (): string[] {
    return this.vars.map(r => r.name)
  }

  /**
   * Get the names of the shadow variables.
   */
  getShadowVars (): string[] {
    return this.shadowVars.map(r => r.name)
  }

  exitOpDef (opdef: ir.TntOpDef) {
    // either a runtime value (if val), or a callable (if def, action, etc.)
    const value = this.compStack.pop()
    assert(value, `No expression for ${opdef.name} on compStack`)
    this.context.set(kindName('callable', opdef.name), value)
  }

  exitVar (vardef: ir.TntVar) {
    // simply introduce two registers:
    //  one for the variable, and
    //  one for its next-state version
    const prevRegister = mkRegister('var', vardef.name, none())
    this.vars.push(prevRegister)
    this.context.set(kindName('var', vardef.name), prevRegister)
    const nextRegister = mkRegister('nextvar', vardef.name, none())
    this.nextVars.push(nextRegister)
    this.context.set(kindName('nextvar', nextRegister.name), nextRegister)
  }

  enterLiteral (expr: ir.TntBool | ir.TntInt | ir.TntStr) {
    switch (expr.kind) {
      case 'bool':
        this.compStack.push(mkConstComputable(rv.mkBool(expr.value)))
        break

      case 'int':
        this.compStack.push(mkConstComputable(rv.mkInt(expr.value)))
        break

      case 'str':
        this.compStack.push(mkConstComputable(rv.mkStr(expr.value)))
    }
  }

  enterName (name: ir.TntName) {
    // The name belongs to one of the objects:
    // a shadow variable, a variable, an argument, a callable.
    // The order is important, as defines the name priority.
    const comp = this.contextGet(name.name, ['shadow', 'var', 'arg', 'callable'])
    // this may happen, see: https://github.com/informalsystems/tnt/issues/129
    assert(comp, `Name ${name.name} not found (out of order?)`)
    this.compStack.push(comp)
  }

  exitApp (app: ir.TntApp) {
    switch (app.opcode) {
      case 'next': {
        const register = this.compStack.pop()
        if (register) {
          const name = (register as Register).name
          const nextvar = this.contextGet(name, ['nextvar'])
          this.compStack.push(nextvar ?? fail)
        } else {
          this.compStack.push(fail)
        }
        break
      }

      case 'assign': {
        assert(this.compStack.length >= 2, 'Not enough arguments on stack')
        const [register, rhs] = this.compStack.splice(-2)
        const name = (register as Register).name
        const nextvar = this.contextGet(name, ['nextvar']) as Register
        if (nextvar) {
          this.compStack.push(rhs)
          this.applyFun(1, (value) => {
            nextvar.registerValue = just(value)
            return just(rv.mkBool(true))
          })
        } else {
          this.compStack.push(fail)
        }
        break
      }

      case 'shift':
        this.compStack.push({
          eval: () => {
            this.shiftVars()
            return just<any>(rv.mkBool(true))
          },
        })
        break

      case 'eq':
        this.applyFun(2, (x, y) => just(rv.mkBool(x.equals(y))))
        break

      case 'neq':
        this.applyFun(2, (x, y) => just(rv.mkBool(!x.equals(y))))
        break

      // conditional
      case 'ite':
        this.translateIfThenElse()
        break

      // Booleans
      case 'not':
        this.applyFun(1, p => just(rv.mkBool(!p.toBool())))
        break

      case 'and':
        // a conjunction over expressions is lazy
        this.translateAnd(app)
        break

      case 'actionAll':
        this.translateAndAction(app)
        break

      case 'or':
        // a disjunction over expressions is lazy
        this.translateOr(app)
        break

      case 'actionAny':
        this.translateOrAction(app)
        break

      case 'implies':
        this.applyFun(2, (p, q) => just(rv.mkBool(!p.toBool() || q.toBool())))
        break

      case 'iff':
        this.applyFun(2, (p, q) => just(rv.mkBool(p.toBool() === q.toBool())))
        break

      // integers
      case 'iuminus':
        this.applyFun(1, n => just(rv.mkInt(-n.toInt())))
        break

      case 'iadd':
        this.applyFun(2, (p, q) => just(rv.mkInt(p.toInt() + q.toInt())))
        break

      case 'isub':
        this.applyFun(2, (p, q) => just(rv.mkInt(p.toInt() - q.toInt())))
        break

      case 'imul':
        this.applyFun(2, (p, q) => just(rv.mkInt(p.toInt() * q.toInt())))
        break

      case 'idiv':
        this.applyFun(2, (p, q) => just(rv.mkInt(p.toInt() / q.toInt())))
        break

      case 'imod':
        this.applyFun(2, (p, q) => just(rv.mkInt(p.toInt() % q.toInt())))
        break

      case 'ipow':
        this.applyFun(2, (p, q) => just(rv.mkInt(p.toInt() ** q.toInt())))
        break

      case 'igt':
        this.applyFun(2, (p, q) => just(rv.mkBool(p.toInt() > q.toInt())))
        break

      case 'ilt':
        this.applyFun(2, (p, q) => just(rv.mkBool(p.toInt() < q.toInt())))
        break

      case 'igte':
        this.applyFun(2, (p, q) => just(rv.mkBool(p.toInt() >= q.toInt())))
        break

      case 'ilte':
        this.applyFun(2, (p, q) => just(rv.mkBool(p.toInt() <= q.toInt())))
        break

      case 'tup':
        // Construct a tuple from an array of values
        this.applyFun(app.args.length,
          (...values: RuntimeValue[]) => just(rv.mkTuple(values)))
        break

      case 'item':
        // Access a tuple: tuples are 1-indexed, that is, _1, _2, etc.
        this.applyFun(2,
          (tuple, idx) => getListElem(tuple.toList(), idx.toInt() - 1n))
        break

      case 'tuples':
        // Construct a cross product
        this.applyFun(app.args.length,
          (...sets: RuntimeValue[]) => just(rv.mkCrossProd(sets)))
        break

      case 'list':
        // Construct a list from an array of values
        this.applyFun(app.args.length,
          (...values: RuntimeValue[]) => just(rv.mkList(values)))
        break

      case 'nth':
        // Access a list
        this.applyFun(2, (list, idx) => getListElem(list.toList(), idx.toInt()))
        break

      case 'replaceAt':
        this.applyFun(3,
          (list, idx, value) => updateList(list.toList(), idx.toInt(), value))
        break

      case 'head':
        this.applyFun(1, (list) => getListElem(list.toList(), 0n))
        break

      case 'tail':
        this.applyFun(1, (list) => {
          const l = list.toList()
          return (l.size > 0) ? sliceList(l, 1n, BigInt(l.size - 1)) : none()
        })
        break

      case 'slice':
        this.applyFun(3, (list, start, end) => {
          const [l, s, e] = [list.toList(), start.toInt(), end.toInt()]
          return (s >= 0 && e < l.size) ? sliceList(l, s, e) : none()
        })
        break

      case 'length':
        this.applyFun(1, list => just(rv.mkInt(BigInt(list.toList().size))))
        break

      case 'append':
        this.applyFun(2,
          (list, elem) => just(rv.mkList(list.toList().push(elem))))
        break

      case 'concat':
        this.applyFun(2,
          (list1, list2) => just(rv.mkList(list1.toList().concat(list2.toList()))))
        break

      case 'indices':
        this.applyFun(1, list => just(rv.mkInterval(0n, BigInt(list.toList().size - 1))))
        break

      case 'rec':
        // Construct a record
        this.applyFun(app.args.length,
          (...values: RuntimeValue[]) => {
            const keys = values
              .filter((e, i) => i % 2 === 0)
              .map(k => k.toStr())
            const map: OrderedMap<string, RuntimeValue> =
              keys.reduce((map, key, i) => {
                const v = values[2 * i + 1]
                return v ? map.set(key, v) : map
              },
              OrderedMap<string, RuntimeValue>())
            return just(rv.mkRecord(map))
          })
        break

      case 'field':
        // Access a record via the field name
        this.applyFun(2, (rec, fieldName) => {
          const fieldValue = rec.toOrderedMap().get(fieldName.toStr())
          return fieldValue ? just(fieldValue) : none()
        })
        break

      case 'fieldNames':
        this.applyFun(1, rec => {
          const keysAsRuntimeValues =
            rec.toOrderedMap().keySeq().map(key => rv.mkStr(key))
          return just(rv.mkSet(keysAsRuntimeValues))
        })
        break

      case 'with':
        // update a record
        this.applyFun(3, (rec, fieldName, fieldValue) => {
          const oldMap = rec.toOrderedMap()
          const key = fieldName.toStr()
          if (oldMap.has(key)) {
            const newMap = rec.toOrderedMap().set(fieldName.toStr(), fieldValue)
            return just(rv.mkRecord(newMap))
          } else {
            return none()
          }
        })
        break

      case 'set':
        // Construct a set from an array of values.
        this.applyFun(app.args.length,
          (...values: RuntimeValue[]) => just(rv.mkSet(values)))
        break

      case 'contains':
        this.applyFun(2, (set, value) => just(rv.mkBool(set.contains(value))))
        break

      case 'in':
        this.applyFun(2, (value, set) => just(rv.mkBool(set.contains(value))))
        break

      case 'subseteq':
        this.applyFun(2, (l, r) => just(rv.mkBool(l.isSubset(r))))
        break

      case 'union':
        this.applyFun(2, (l, r) => just(rv.mkSet(l.toSet().union(r.toSet()))))
        break

      case 'intersect':
        this.applyFun(2, (l, r) => just(rv.mkSet(l.toSet().intersect(r.toSet()))))
        break

      case 'exclude':
        this.applyFun(2, (l, r) => just(rv.mkSet(l.toSet().subtract(r.toSet()))))
        break

      case 'cardinality':
        this.applyFun(1, set => just(rv.mkInt(BigInt(set.cardinality()))))
        break

      case 'isFinite':
        // at the moment, we support only finite sets, so just return true
        this.applyFun(1, set => just(rv.mkBool(true)))
        break

      case 'to':
        this.applyFun(2, (i, j) => just(rv.mkInterval(i.toInt(), j.toInt())))
        break

      case 'fold':
        this.applyFold('fwd')
        break

      case 'foldl':
        this.applyFold('fwd')
        break

      case 'foldr':
        this.applyFold('rev')
        break

      case 'guess':
        this.applyGuess()
        break

      case 'flatten':
        this.applyFun(1, set => {
          // unpack the sets from runtime values
          const setOfSets = set.toSet().map(e => e.toSet())
          // and flatten the set of sets via immutable-js
          return just(rv.mkSet(setOfSets.flatten(1) as Set<RuntimeValue>))
        })
        break

      case 'get':
        // Get a map value
        this.applyFun(2, (map, key) => {
          const value = map.toMap().get(key.normalForm())
          return value ? just(value) : none()
        })
        break

      case 'update':
        // Update a map value
        this.applyFun(3, (map, key, newValue) => {
          const normalKey = key.normalForm()
          const asMap = map.toMap()
          if (asMap.has(normalKey)) {
            const newMap = asMap.set(normalKey, newValue)
            return just(rv.fromMap(newMap))
          } else {
            return none()
          }
        })
        break

      case 'put':
        // add a value to a map
        this.applyFun(3, (map, key, newValue) => {
          const normalKey = key.normalForm()
          const asMap = map.toMap()
          const newMap = asMap.set(normalKey, newValue)
          return just(rv.fromMap(newMap))
        })
        break

      case 'updateAs': {
        // Update a map value via a lambda
        const fun = this.compStack.pop() ?? fail
        this.applyFun(2, (map, key) => {
          const normalKey = key.normalForm()
          const asMap = map.toMap()
          if (asMap.has(normalKey)) {
            (fun as Callable).registers[0].registerValue =
              just(asMap.get(normalKey))
            return fun.eval().map((newValue) => {
              const newMap = asMap.set(normalKey, newValue as RuntimeValue)
              return rv.fromMap(newMap)
            })
          } else {
            return none()
          }
        })
        break
      }

      case 'keys':
        // map keys as a set
        this.applyFun(1, (map) => {
          return just(rv.mkSet(map.toMap().keys()))
        })
        break

      case 'exists':
        this.mapLambdaThenReduce(
          set =>
            rv.mkBool(set.find(([result, _]) => result.toBool()) !== undefined)
        )
        break

      case 'forall':
        this.mapLambdaThenReduce(
          set =>
            rv.mkBool(set.find(([result, _]) => !result.toBool()) === undefined)
        )
        break

      case 'map':
        this.mapLambdaThenReduce(
          array => rv.mkSet(array.map(([result, _]) => result))
        )
        break

      case 'filter':
        this.mapLambdaThenReduce(
          arr =>
            rv.mkSet(arr
              .filter(([r, e]) => r.toBool())
              .map(([r, e]) => e))
        )
        break

      case 'select':
        this.mapLambdaThenReduce(
          arr =>
            rv.mkList(arr
              .filter(([r, e]) => r.toBool())
              .map(([r, e]) => e))
        )
        break

      case 'mapOf':
        this.mapLambdaThenReduce(arr =>
          rv.mkMap(arr.map(([v, k]) => [k, v]))
        )
        break

      case 'setToMap':
        this.applyFun(1, (set: RuntimeValue) =>
          just(rv.mkMap(set.toSet().map(p => {
            const arr = p.toList().toArray()
            return [arr[0], arr[1]]
          })))
        )
        break

      case 'setOfMaps':
        this.applyFun(2, (dom, rng) => {
          return just(rv.mkMapSet(dom, rng))
        })
        break

      case '_test':
        // the special operator that runs random simulation
        this.test()
        break

      default: {
        this.applyUserDefined(app)
      }
    }
  }

  private applyUserDefined (app: ir.TntApp) {
    const callable =
      this.contextGet(app.opcode, ['callable', 'arg']) as Callable
    if (callable === undefined || callable.registers === undefined) {
      // The error should be reported via a callback:
      // TODO: https://github.com/informalsystems/tnt/issues/191
      console.error(`${app.opcode} is not supported`)
      this.compStack.push(fail)
    } else {
      if (this.compStack.length < callable.registers.length) {
        const msg = `Not enough arguments for ${app.opcode} on the stack`
        throw new Error(msg)
      }
      this.applyFun(callable.registers.length,
        (...args: RuntimeValue[]) => {
          for (let i = 0; i < args.length; i++) {
            callable.registers[i].registerValue = just(args[i])
          }
          return callable.eval() as Maybe<RuntimeValue>
        }
      )
    }
  }

  enterLambda (lam: ir.TntLambda) {
    // introduce a register for every parameter
    lam.params.forEach(p =>
      this.context.set(kindName('arg', p), mkRegister('arg', p, none())))
    // After this point, the body of the lambda gets compiled.
    // The body of the lambda may refer to the parameter via names,
    // which are stored in the registers we've just created.
  }

  exitLambda (lam: ir.TntLambda) {
    // The expression on the stack is the body of the lambda.
    // Transform it to Callable together with the registers.
    const registers: Register[] = []
    lam.params.forEach(p => {
      const key = kindName('arg', p)
      const register = this.contextGet(p, ['arg']) as Register
      assert(register && register.registerValue,
             `Expected a register ${p} on the stack`)
      this.context.delete(key)
      registers.push(register)
    })

    const lambdaBody = this.compStack.pop()
    assert(lambdaBody, 'Expected the body of a lambda on the stack')
    this.compStack.push(mkCallable(registers, lambdaBody))
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
  private mapLambdaThenReduce
  (mapResultAndElems:
      (array: Array<[RuntimeValue, RuntimeValue]>) => RuntimeValue): void {
    if (this.compStack.length < 2) {
      throw new Error('Not enough parameters on compStack')
    }
    // lambda translated to Callable
    const callable = this.compStack.pop() as Callable
    // this method supports only 1-argument callables
    assert(callable.registers.length === 1)
    // apply the lambda to a single element of the set
    const evaluateElem = function (elem: RuntimeValue):
        Maybe<[RuntimeValue, RuntimeValue]> {
      // store the set element in the register
      callable.registers[0].registerValue = just(elem)
      // evaluate the predicate using the register
      // (cast the result to RuntimeValue, as we use runtime values)
      const result = callable.eval().map(e => e as RuntimeValue)
      return result.map(result => [result, elem])
    }
    this.applyFun(1, (iterable: Iterable<RuntimeValue>): Maybe<RuntimeValue> => {
      return flatMap(iterable, evaluateElem).map(rs => mapResultAndElems(rs))
    })
  }

  /**
   * Translate one of the operators: fold, foldl, and foldr.
   */
  private applyFold (order: 'fwd' | 'rev'): void {
    if (this.compStack.length < 3) {
      throw new Error('Not enough parameters on compStack')
    }
    // extract two arguments from the call stack and keep the set
    const callable = this.compStack.pop() as Callable
    // this method supports only 2-argument callables
    assert(callable.registers.length === 2)
    // compile the computation of the initial value
    const initialComp = this.compStack.pop() ?? fail
    // apply the lambda to a single element of the set
    const evaluateElem = function (elem: RuntimeValue): Maybe<EvalResult> {
      // The accumulator should have been set in the previous iteration.
      // Set the first register to the element.
      callable.registers[1].registerValue = just(elem)
      const result = callable.eval()
      // save the result for the next iteration
      callable.registers[0].registerValue = result
      return result
    }
    // iterate over the iterable (a set or a list)
    this.applyFun(1, (iterable: Iterable<RuntimeValue>): Maybe<any> => {
      return initialComp.eval().map(initialValue => {
        // save the initial value on the 0th register
        callable.registers[0].registerValue = just(initialValue)
        // fold the iterable
        return flatForEach(order, iterable, just(initialValue), evaluateElem)
      }).join()
    })
  }

  // pop nargs computable values, pass them the 'fun' function, and
  // push the combined computable value on the stack
  private applyFun
  (nargs: number, fun: (...args: RuntimeValue[]) => Maybe<RuntimeValue>) {
    if (this.compStack.length >= nargs) {
      // pop nargs elements of the compStack
      const args = this.compStack.splice(-nargs, nargs)
      // produce the new computable value
      const comp = {
        eval: (): Maybe<RuntimeValue> => {
          // compute the values of the arguments at this point
          const values = args.map(a => a.eval())
          // if they are all defined, apply the function 'fun' to the arguments
          return merge(values)
            .map(vs => fun(...vs.map(v => v as RuntimeValue))).join()
        },
      }
      this.compStack.push(comp)
    } else {
      throw new Error('Not enough arguments on the stack')
    }
  }

  // if-then-else requires special treatment,
  // as it should not evaluate both arms
  private translateIfThenElse () {
    if (this.compStack.length >= 3) {
      // pop 3 elements of the compStack
      const [cond, thenArm, elseArm] = this.compStack.splice(-3, 3)
      // produce the new computable value
      const comp = {
        eval: () => {
          // compute the values of the arguments at this point
          const v =
            cond.eval().map(pred => pred.equals(rv.mkBool(true))
              ? thenArm.eval()
              : elseArm.eval())
          return v.join()
        },
      }
      this.compStack.push(comp)
    } else {
      throw new Error('Not enough arguments on the stack')
    }
  }

  // translate and { A, ..., C }
  private translateAnd (app: ir.TntApp) {
    assert(this.compStack.length >= app.args.length,
      'Not enough arguments on stack for "and"')
    const args = this.compStack.splice(-app.args.length)

    const lazyCompute = () => {
      let result: Maybe<EvalResult> = just(rv.mkBool(true))
      // Evaluate arguments iteratively.
      // Stop as soon as one of the arguments returns false.
      // This is a form of Boolean short-circuiting.
      for (const arg of args) {
        // either the argument is evaluated to false, or fails
        result = arg.eval().or(just(rv.mkBool(false)))
        const boolResult = (result.unwrap() as RuntimeValue).toBool()
        // as soon as one of the arguments evaluates to false,
        // break out of the loop
        if (boolResult === false) {
          break
        }
      }

      return result
    }

    this.compStack.push(mkFunComputable(lazyCompute))
  }

  // translate all { A, ..., C }
  private translateAndAction (app: ir.TntApp) {
    assert(this.compStack.length >= app.args.length,
      'Not enough arguments on stack for "actionAll"')
    const args = this.compStack.splice(-app.args.length)

    const lazyCompute = () => {
      // save the values of the next variables, as actions may update them
      const savedValues = this.snapshotNextVars()
      let result: Maybe<EvalResult> = just(rv.mkBool(true))
      // Evaluate arguments iteratively.
      // Stop as soon as one of the arguments returns false.
      // This is a form of Boolean short-circuiting.
      for (const arg of args) {
        // either the argument is evaluated to false, or fails
        result = arg.eval().or(just(rv.mkBool(false)))
        const boolResult = (result.unwrap() as RuntimeValue).toBool()
        // as soon as one of the arguments evaluates to false,
        // break out of the loop
        if (boolResult === false) {
          // restore the values of the next variables,
          // as evaluation was not successful
          this.recoverNextVars(savedValues)
          break
        }
      }

      return result
    }

    this.compStack.push(mkFunComputable(lazyCompute))
  }

  // translate or { A, ..., C }
  private translateOr (app: ir.TntApp) {
    assert(this.compStack.length >= app.args.length,
      'Not enough arguments on stack for "or"')
    const args = this.compStack.splice(-app.args.length)

    const lazyCompute = () => {
      let result: Maybe<EvalResult> = just(rv.mkBool(false))
      // Evaluate arguments iteratively.
      // Stop as soon as one of the arguments returns true.
      // This is a form of Boolean short-circuiting.
      for (const arg of args) {
        // either the argument is evaluated to false, or fails
        result = arg.eval().or(just(rv.mkBool(false)))
        const boolResult = (result.unwrap() as RuntimeValue).toBool()
        // as soon as one of the arguments evaluates to false,
        // break out of the loop
        if (boolResult === true) {
          break
        }
      }

      return result
    }

    this.compStack.push(mkFunComputable(lazyCompute))
  }

  // translate any { A, ..., C }
  private translateOrAction (app: ir.TntApp) {
    assert(this.compStack.length >= app.args.length,
      'Not enough arguments on stack for "actionAny"')
    const args = this.compStack.splice(-app.args.length)

    // According to the semantics of action-level disjunctions,
    // we have to find out which branches are enabled and pick one of them
    // non-deterministically. Instead of modeling non-determinism,
    // we use a random number generator. This may change in the future.
    const lazyCompute = () => {
      // save the values of the next variables, as actions may update them
      const valuesBefore = this.snapshotNextVars()
      // we store the potential successor values in this array
      const successors = []
      // Evaluate arguments iteratively.
      for (const arg of args) {
        this.recoverNextVars(valuesBefore)
        // either the argument is evaluated to false, or fails
        const result = arg.eval().or(just(rv.mkBool(false)))
        const boolResult = (result.unwrap() as RuntimeValue).toBool()
        // if this arm evaluates to true, save it in the candidates
        if (boolResult === true) {
          successors.push(this.snapshotNextVars())
        }
      }

      const ncandidates = successors.length
      if (ncandidates === 0) {
        // no successor: restore the state and return false
        this.recoverNextVars(valuesBefore)
        return just(rv.mkBool(false))
      } else {
        // randomly pick a successor and return true
        // https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
        const choice = Math.floor(Math.random() * ncandidates)
        this.recoverNextVars(successors[choice])
        return just(rv.mkBool(true))
      }
    }

    this.compStack.push(mkFunComputable(lazyCompute))
  }

  // apply the operator guess
  private applyGuess () {
    if (this.compStack.length < 2) {
      throw new Error('Not enough arguments on the stack')
    }

    const [setComp, fun] = this.compStack.splice(-2)
    const comp = {
      eval: (): Maybe<EvalResult> => {
        // compute the values of the arguments at this point
        return setComp.eval().map(set => {
          const callable = fun as Callable
          // randomly pick an element
          const elem = (set as RuntimeValue).pick(Math.random())
          callable.registers[0].registerValue = just(elem)
          return callable.eval()
        }).join()
      },
    }
    this.compStack.push(comp)
  }

  // The simulator core: produce multiple random runs
  // and check the given state invariant (state assertion).
  //
  // Technically, this is similar to the implementation of folds.
  // However, it also restores the state and saves a trace, if there is any.
  private test () {
    if (this.compStack.length < 5) {
      throw new Error('Not enough arguments on the stack')
    }

    // convert the current variable values to a record
    const varsToRecord = () => {
      const map: [string, RuntimeValue][] =
        this.vars
          .filter(r => r.registerValue.isJust())
          .map(r => [r.name, r.registerValue.value as RuntimeValue])
      return rv.mkRecord(map)
    }

    const args = this.compStack.splice(-5)
    // run simulation when invoked
    const doRun = (): Maybe<EvalResult> => {
      return merge(args.map(e => e.eval()))
        .map(([nrunsRes, nstepsRes, initRes, nextRes, invRes]) => {
          const isTrue = (res: Maybe<EvalResult>) => {
            return !res.isNone() &&
              (res.value as RuntimeValue).toBool() === true
          }
          // the trace collected during the run
          let trace: RuntimeValue[] = []
          // the value to be returned in the end of evaluation
          let errorFound = false
          // save the registers to recover them later
          const vars = this.snapshotVars()
          const nextVars = this.snapshotNextVars()
          // do multiple runs, stop at the first failing run
          const nruns = (nrunsRes as RuntimeValue).toInt()
          for (let runNo = 0; !errorFound && runNo < nruns; runNo++) {
            trace = []
            // check Init()
            const initName = (initRes as RuntimeValue).toStr()
            const init = this.contextGet(initName, ['callable']) ?? fail
            if (!isTrue(init.eval())) {
              errorFound = true
            } else {
              this.shiftVars()
              trace.push(varsToRecord())
              // check the invariant Inv
              const invName = (invRes as RuntimeValue).toStr()
              const inv = (this.contextGet(invName, ['callable']) ?? fail)
              if (!isTrue(inv.eval())) {
                errorFound = true
              } else {
                // check all { Next(), shift(), Inv } in a loop
                const nsteps = (nstepsRes as RuntimeValue).toInt()
                const nextName = (nextRes as RuntimeValue).toStr()
                const next = (this.contextGet(nextName, ['callable']) ?? fail)
                for (let i = 0; !errorFound && i < nsteps; i++) {
                  if (isTrue(next.eval())) {
                    this.shiftVars()
                    trace.push(varsToRecord())
                    errorFound = !isTrue(inv.eval())
                  } else {
                    // The run cannot be extended.
                    // In some cases, this may indicate a deadlock.
                    // Since we are doing random simulation, it is very likely
                    // that we have not generated good values for extending
                    // the run. Hence, do not report an error here, but simply
                    // drop the run. Otherwise, we would have a lot of false
                    // positives, which look like deadlocks but they are not.
                    break
                  }
                }
              }
            }
            // recover the state variables
            this.recoverVars(vars)
            this.recoverNextVars(nextVars)
          } // end of a single random run
          // save the trace (there are a few shadow variables, hence, the loop)
          this.shadowVars.forEach(r => {
            if (r.name === lastTraceName) {
              r.registerValue = just(rv.mkList(trace))
            }
          })
          // finally, return true, if no error was found
          return just(rv.mkBool(!errorFound))
        }).join()
    }
    this.compStack.push(mkFunComputable(doRun))
  }

  private shiftVars () {
    this.recoverVars(this.snapshotNextVars())
    this.nextVars.forEach(r => r.registerValue = none())
  }

  // save the values of the vars into an array
  private snapshotVars (): Maybe<RuntimeValue>[] {
    return this.vars.map(r => r.registerValue)
  }

  // save the values of the next vars into an array
  private snapshotNextVars (): Maybe<RuntimeValue>[] {
    return this.nextVars.map(r => r.registerValue)
  }

  // load the values of the variables from an array
  private recoverVars (values: Maybe<RuntimeValue>[]) {
    this.vars.forEach((r, i) => r.registerValue = values[i])
  }

  // load the values of the next variables from an array
  private recoverNextVars (values: Maybe<RuntimeValue>[]) {
    this.nextVars.forEach((r, i) => r.registerValue = values[i])
  }

  private contextGet (name: string, kinds: ComputableKind[]) {
    for (const k of kinds) {
      const value = this.context.get(kindName(k, name))
      if (value) {
        return value
      }
    }

    return undefined
  }
}

// Access a list via an index
function getListElem (list: List<RuntimeValue>, idx: bigint) {
  if (idx >= 0n && idx < list.size) {
    const elem = list.get(Number(idx))
    return elem ? just(elem) : none()
  } else {
    return none()
  }
}

// Update a list via an index
function updateList (list: List<RuntimeValue>, idx: bigint, value: RuntimeValue) {
  if (idx >= 0n && idx < list.size) {
    return just(rv.mkList(list.set(Number(idx), value)))
  } else {
    return none()
  }
}

// slice a list
function sliceList (list: List<RuntimeValue>, start: bigint, end: bigint) {
  return just(rv.mkList(list.slice(Number(start), Number(end) + 1)))
}

// make a `Computable` that always returns a given runtime value
function mkConstComputable (value: RuntimeValue) {
  return {
    eval: () => {
      return just<any>(value)
    },
  }
}

// make a `Computable` that always returns a given runtime value
function mkFunComputable (fun: () => Maybe<EvalResult>) {
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
function flatMap<T, R>
(iterable: Iterable<T>, f: (arg: T) => Maybe<R>): Maybe<Array<R>> {
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
function flatForEach<T, R>
(order: 'fwd' | 'rev',
  iterable: Iterable<T>, init: Maybe<R>, f: (arg: T) => Maybe<R>): Maybe<R> {
  let result: Maybe<R> = init
  // if the reverse order is required, reverse the array
  const iter = (order === 'fwd') ? iterable : Array(...iterable).reverse()
  for (const arg of iter) {
    result = f(arg)
    if (result.isNone()) {
      return result
    }
  }

  return result
}
