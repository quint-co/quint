/*
 * Runtime environment for TNT. This runtime environment is designed for the
 * following purposes:
 *
 *  - Give the language user fast feedback via interpretation of expressions.
 *  - Let the user simulate their specification similar to property-based testing.
 *
 * Igor Konnov, 2022
 *
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 */

import { Maybe, none } from '@sweet-monads/maybe'

import { ValueObject } from 'immutable'

import { TntEx } from '../tntIr'

/**
 * Evaluation result.
 * The implementation details are hidden behind this interface.
 */
export interface EvalResult extends ValueObject {
  /**
   * Convert an evaluation result to TNT.
   *
   * This function always returns sets in the normalized representation,
   * that is, in `set(elements)`, the elements are ordered according to their
   * string representation. As sorting via strings may be slow, we do not
   * recommend using `toTntEx` in computation-intensive code.
   *
   * @return this evaluation result converted to TNT expression.
   */
  toTntEx(): TntEx
}

/**
 * An object that can be evaluated by the runtime. Normally, it is constructed
 * from a TNT expression, but it does not have to.
 */
export interface Computable {
  /**
   * The simplest form of evaluation. Just compute the value.
   * This method may return none, if a computation error happens during
   * evaluation.
   */
  eval: () => Maybe<EvalResult>
}

/**
 * The kind of a computable.
 */
export type ComputableKind =
  'val' | 'var' | 'nextvar' | 'arg' | 'callable' | 'shadow'

/**
 * Create a key that encodes its name and kind. This is only useful for
 * storing registers in a map, as JS objects are hard to use as keys.
 * In a good language, we would use (kind, name), but not in JS.
 */
export const kindName = (kind: ComputableKind, name: string): string => {
  return `${kind}:${name}`
}

/**
 * A computable that evaluates to the value of a readable/writeable register.
 */
export interface Register extends Computable {
  // register name
  name: string
  // register kind
  kind: ComputableKind
  // register is a placeholder where iterators can put their values
  registerValue: Maybe<any>
}

/**
 * Create an object that implements Register.
 */
export function mkRegister
(kind: ComputableKind, registerName: string, initValue: Maybe<any>): Register {
  return {
    name: registerName,
    kind: kind,
    registerValue: initValue,
    // computing a register just evaluates to the contents that it stores
    eval: function () {
      return this.registerValue
    },
  }
}

/**
 * A callable value like an operator definition.  Its body us computable, but
 * one has to first set the registers that store the values of the callable's
 * parameters.
 */
export interface Callable extends Computable {
  registers: Register[]
}

/**
 * Create an object that implements Callable.
 */
export function mkCallable (registers: Register[], body: Computable): Callable {
  return {
    registers: registers,
    eval: () => {
      return body.eval()
    },
  }
}

/**
 * An implementation of Computable that always fails.
 */
export const fail = {
  eval: () => {
    return none<EvalResult>()
  },
}

/**
 * An error produced during execution.
 */
export interface ExecError {
  msg: string,
  sourceAndLoc: string | undefined,
}

/**
 * An error handler that is called on any kind of error that is happening
 * during execution.
 */
export type ExecErrorHandler = (error: ExecError) => void;
