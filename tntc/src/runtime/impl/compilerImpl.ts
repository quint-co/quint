/*
 * Compiler to Computable values (in the runtime).
 *
 * Igor Konnov, 2022
 *
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import { strict as assert } from 'assert'
import { Maybe, none, just, merge } from '@sweet-monads/maybe'
import { Set } from 'immutable'

import { IRVisitor } from '../../IRVisitor'
import { Computable } from '../runtime'

import * as ir from '../../tntIr'

import { rv, RuntimeValue } from './runtimeValue'

/**
 * Compiler visitor turns TNT definitions and expressions into Computable
 * objects, essentially, lazy JavaScript functions. Importantly, it does not do
 * any evaluation during the translation and thus delegates the actual
 * computation to the JavaScript engine. Since many of TNT operators may be
 * computationally expensive, it is crucial to maintain this separation of
 * compilation vs. computation.
 *
 * This class does not do any dynamic type checking, assuming that the type checker
 * will be run before the translation in the future. As we do not have the type
 * checker yet, computations may fail with weird JavaScript errors.
 */
export class CompilerVisitor implements IRVisitor {
  // the stack of computable values
  private compStack: Computable[] = []
  // the map of definition and variable names
  // as well as of definition parameters to translated values
  private context: Map<string, Computable> = new Map<string, Computable>()

  /**
   * Get a computable assigned to a name.
   *
   * @param name the definition name
   * @return the Computable value assigned to the name, or undefined
   */
  findByName (name: string) {
    return this.context.get(name)
  }

  exitOpDef (opdef: ir.TntOpDef) {
    // for now, we handle only 'val'
    assert(opdef.qualifier === 'val', `Expected 'val', found: ${opdef.qualifier}`)
    const defBody = this.compStack.pop()
    assert(defBody, `No expression for ${opdef.name} on compStack`)
    this.context.set(opdef.name, defBody)
  }

  enterLiteral (expr: ir.TntBool | ir.TntInt | ir.TntStr) {
    switch (expr.kind) {
      case 'bool':
        this.compStack.push(this.mkConstComputable(rv.mkBool(expr.value)))
        break

      case 'int':
        this.compStack.push(this.mkConstComputable(rv.mkInt(expr.value)))
        break

      case 'str':
        throw new Error(`Found ${expr}, strings are not supported`)
    }
  }

  enterName (name: ir.TntName) {
    const comp = this.context.get(name.name)
    // this may happen, see: https://github.com/informalsystems/tnt/issues/129
    assert(comp, `Name ${name.name} not found (out of order?)`)
    this.compStack.push(comp)
  }

  exitApp (app: ir.TntApp) {
    switch (app.opcode) {
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
        this.applyFun(2, (p, q) => just(rv.mkBool(p.toBool() && q.toBool())))
        break

      case 'or':
        this.applyFun(2, (p, q) => just(rv.mkBool(p.toBool() || q.toBool())))
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

      case 'to':
        this.applyFun(2, (i, j) => just(rv.mkInterval(i.toInt(), j.toInt())))
        break

      case 'flatten':
        this.applyFun(1, set => {
          // unpack the sets from runtime values
          const setOfSets = set.toSet().map(e => e.toSet())
          // and flatten the set of sets via immutable-js
          return just(rv.mkSet(setOfSets.flatten(1) as Set<RuntimeValue>))
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

      default:
        throw new Error(`Translation of ${app.opcode} is not implemented`)
    }
  }

  enterLambda (lam: ir.TntLambda) {
    // introduce a register for every parameter
    lam.params.forEach(p => {
      const paramRegister = {
        // register is a placeholder where iterators can store their values
        register: none<any>(),
        // computing a register just evaluates to the contents that it stores
        eval: function () {
          return this.register
        },
      }
      this.context.set(p, paramRegister)
    })
    // After this point, the body of the lambda gets compiled.
    // The body of the lambda may refer to the parameter via names,
    // which are stored in the registers we've just created.
  }

  exitLambda (lam: ir.TntLambda) {
    // The expression on the stack is the body of the lambda.
    // However, we have to populate the registers before we can evaluate the expression.
    // Move each parameter register from the context to the computation stack.
    lam.params.forEach(p => {
      const comp = this.context.get(p)
      if (comp !== undefined) {
        this.compStack.push(comp)
        this.context.delete(p)
      } else {
        throw new Error(`Corrupted lambda context, parameter ${p} not found`)
      }
    })
  }

  /**
    * A generalized application of a one-argument lambda expression to a set-like
    * runtime value, as required by `exists`, `forall`, `map`, and `filter`.
    *
    * This method expects `compStack` to look like follows:
    *
    *  - `(top)` the register object, of type `Computable & WithRegister`, is
    *    used to hold each value to which the lambda will be applied as we iterate
    *    through the elements .
    *
    *  - `(top - 1)`: the lambda body, as `Computable`.
    *
    *  - `(top - 2)`: a set-like value to iterate over, as `Computable`.
    *
    * The method evaluates the lambda body for each element of the iterable value
    * and * either produces `none`, if evaluation failed for one of the elements,
    * or it applies `mapResultAndElems` to the pairs that consists of the lambda
    * result and the original element of the iterable value.
    * The final result is stored on the stack.
    */
  private mapLambdaThenReduce
  (mapResultAndElems:
      (array: Array<[RuntimeValue, RuntimeValue]>) => RuntimeValue): void {
    if (this.compStack.length <= 2) {
      throw new Error('Not enough parameters on compStack')
    }
    // the lambda parameter, which is a register that we iteratively
    // set to each element of the set as the lambda is applied
    const param = this.compStack.pop() as Computable & WithRegister<any>
    // the body of the lambda
    const lambdaBody = this.compStack.pop()
    if (lambdaBody !== undefined) {
      // apply the lambda to a single element of the set
      const evaluateElem = function (elem: RuntimeValue):
          Maybe<[RuntimeValue, RuntimeValue]> {
        // store the set element in the register
        param.register = just(elem)
        // evaluate the predicate using the register
        // (cast the result to RuntimeValue, as we use runtime values)
        const result = lambdaBody.eval().map(e => e as RuntimeValue)
        return result.map(result => [result, elem])
      }
      this.applyFun(1, (set: Iterable<RuntimeValue>): Maybe<RuntimeValue> => {
        return flatMap(set, evaluateElem).map(rs => mapResultAndElems(rs))
      })
    } // else: impossible due to the test in the beginning
  }

  // make a `Computable` that always returns a given runtime value
  private mkConstComputable (value: RuntimeValue) {
    return {
      eval: () => {
        return just<any>(value)
      },
    }
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
}

// a computable value with register
interface WithRegister<T> {
  // register is a placeholder where iterators can put their values
  register: Maybe<T>
}

/**
 * Apply `f` to every element of `iterable` and either:
 *
 *  - return `none`, if one of the results in `none`, or
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
