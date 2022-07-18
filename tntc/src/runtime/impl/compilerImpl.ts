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
import { just, merge } from '@sweet-monads/maybe'

import { IRVisitor } from '../../IRVisitor'
import { Computable } from '../runtime'
import * as ir from '../../tntIr'

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
  // the map of definition and variable names to translated values
  private nameToComputable: Map<string, Computable> = new Map<string, Computable>()

  /**
   * Get a computable assigned to a name.
   *
   * @param name the definition name
   * @return the Computable value assigned to the name, or undefined
   */
  findByName (name: string) {
    return this.nameToComputable.get(name)
  }

  exitOpDef (opdef: ir.TntOpDef) {
    // for now, we handle only 'val'
    assert(opdef.qualifier === 'val', `Expected 'val', found: ${opdef.qualifier}`)
    const defBody = this.compStack.pop()
    assert(defBody, `No expression for ${opdef.name} on compStack`)
    this.nameToComputable.set(opdef.name, defBody)
  }

  enterLiteral (expr: ir.TntBool | ir.TntInt | ir.TntStr) {
    const comp = {
      eval: () => {
        return just<any>(expr.value)
      },
    }

    this.compStack.push(comp)
  }

  enterName (name: ir.TntName) {
    const comp = this.nameToComputable.get(name.name)
    // this may happen, see: https://github.com/informalsystems/tnt/issues/129
    assert(comp, `Name ${name.name} not found (out of order?)`)
    this.compStack.push(comp)
  }

  exitApp (app: ir.TntApp) {
    switch (app.opcode) {
      case 'eq':
        // Equality is a very general operator.
        // In the current implementation,
        // it would only work for scalar values: Booleans and integers.
        this.combineExprs(2, (x: any, y: any) => x === y)
        break

      case 'neq':
        // For the moment, we are using the JS inequality.
        // In the future, we should negate the more general form of equality.
        this.combineExprs(2, (x: any, y: any) => x !== y)
        break

      // conditional
      case 'ite':
        this.translateIfThenElse()
        break

      // Booleans
      case 'not':
        this.combineExprs(1, (p: Boolean) => !p)
        break

      case 'and':
        this.combineExprs(2, (p: Boolean, q: Boolean) => p && q)
        break

      case 'or':
        this.combineExprs(2, (p: Boolean, q: Boolean) => p || q)
        break

      case 'implies':
        this.combineExprs(2, (p: Boolean, q: Boolean) => !p || q)
        break

      case 'iff':
        this.combineExprs(2, (p: Boolean, q: Boolean) => p === q)
        break

      // integers
      case 'iuminus':
        this.combineExprs(1, (n: bigint) => -n)
        break

      case 'iadd':
        this.combineExprs(2, (i: bigint, j: bigint) => i + j)
        break

      case 'isub':
        this.combineExprs(2, (i: bigint, j: bigint) => i - j)
        break

      case 'imul':
        this.combineExprs(2, (i: bigint, j: bigint) => i * j)
        break

      case 'idiv':
        this.combineExprs(2, (i: bigint, j: bigint) => i / j)
        break

      case 'imod':
        this.combineExprs(2, (i: bigint, j: bigint) => i % j)
        break

      case 'ipow':
        this.combineExprs(2, (i: bigint, j: bigint) => i ** j)
        break

      case 'igt':
        this.combineExprs(2, (i: bigint, j: bigint) => i > j)
        break

      case 'ilt':
        this.combineExprs(2, (i: bigint, j: bigint) => i < j)
        break

      case 'igte':
        this.combineExprs(2, (i: bigint, j: bigint) => i >= j)
        break

      case 'ilte':
        this.combineExprs(2, (i: bigint, j: bigint) => i <= j)
        break

      default:
        throw new Error(`Translation of ${app.opcode} is not implemented`)
    }
  }

  // pop nargs computable values, pass them the 'fun' function, and
  // push the combined computable value on the stack
  private combineExprs (nargs: number, fun: (...args: any[]) => any) {
    if (this.compStack.length >= nargs) {
      // pop nargs elements of the compStack
      const args = this.compStack.splice(-nargs, nargs)
      // produce the new computable value
      const comp = {
        eval: () => {
          // compute the values of the arguments at this point
          const values = args.map(a => a.eval())
          // if they are all defined, apply the function 'fun' to the arguments
          return merge(values).map(vs => fun(...vs))
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
            cond.eval().map(pred => pred ? thenArm.eval() : elseArm.eval())
          return v.join()
        },
      }
      this.compStack.push(comp)
    } else {
      throw new Error('Not enough arguments on the stack')
    }
  }
}
