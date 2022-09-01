/*
 * Runtime values that are internally produced by the simulator.
  *
  * This is an internal implementation module. Everything in it may change in
  * the future versions. The discussion below is intended for the developers of
  * the simulator, not for its end users.
 *
 * In case of Boolean and integer values, runtime values are simply wrappers
 * around boolean and bigint. The difference becomes noticeable when we are
 * dealing with data structures such as: sets, intervals, powersets, and sets
 * of maps. At the surface level, they all behave as iterable collections.
 * However, all combinations of these data structures are admitted, e.g.,
 * `set(1, 2, 3) == 1.to(3)` is a legal TNT expression. Although we could
 * always expand all set operators into sets represented via an immutable set
 * (provided by immutable.Set), this may lead to extremely inefficient
 * computations. For example, `1.to(2^64).contains(25)` should be trivial to
 * compute, since we know that 25 lies within the interval `[1, 2^64]`. A naive
 * simulator would first expand `1.to(2^64)` to the set of 2^64 elements, which
 * would simply run out of memory.
 *
 * To this end, we introduce different classes for various set representations:
 *
 *  - RuntimeValueSet is the "normal-form" representation via enumeration. It
 *  is implemented with Set of immutable-js, which is a perfect fit for this
 *  task.
 *
 *  - RuntimeValueInterval is the interval representation via a pair of
 *  integers [first, last]. This class behaves as a set wherever possible. It
 *  has optimized implementations of `contains`, `isSubset`, and `equals`
 *  (technically, `equals` is implemented in RuntimeValueBase).
 *
 *  - RuntimeValuePowerset: TBD
 *
 *  - RuntimeValueMapSet: TBD
 *
 *
 * Importantly, it should be always possible to convert other set
 * representations to enumerative sets (backed with `RuntimeValueSet`): Many
 * set operators have meaningful semantics only in enumerative sets. For
 * example, consider `1.to(3).union(10.to(15))` can be only defined by
 * enumeration, not in terms of intervals. Hence, every runtime value has the
 * method `toSet()` that produces an immutable.Set. The algebraic set
 * operations can be easily performed via the corresponding methods of
 * `immutable.Set`.
 *
 * Moreover, some TNT expressions force us to fall back on the enumerative set
 * representation. For example, set(set(1, 2, 3), 1.to(3)) is equivalent to the
 * set `set(set(1, 2, 3))`. If we did not normalize `1.to(3)` to `set(1, 2,
 * 3)`, we would produce a set that would not be considered equal to
 * `set(set(1, 2, 3))`. This is because implementations of sets utilize hashes,
 * which would be different in the enumerative and interval representations.
 *
 * The operator `contains` may seem to be too specialized for introducing the
 * whole new layer of abstraction. However, it is deeply rooted in the
 * semantics of TNT, which, similar to TLA+, heavily utilizes set operators.
 * In the future, we will extend runtime values with the method `guess`, which
 * would draw a random value from a set. There, the efficiency of special
 * representations will become obvious.
 *
 * Igor Konnov, 2022
 *
 * Copyright (c) Informal Systems 2022. All rights reserved. Licensed under
 * the Apache 2.0. See License.txt in the project root for license
 * information.
 */

import { Set, ValueObject, is as immutableIs } from 'immutable'

import { expressionToString } from '../../IRprinting'

import { EvalResult } from '../runtime'
import { TntEx } from '../../tntIr'

/** The default entry point of this module */
export default rv

/**
 * A factory of runtime values that should be used to instantiate new values.
 */
export const rv = {
  /**
   * Make a runtime value that represents a Boolean.
   *
   * @param value a Boolean value
   * @return a new runtime value that carries the Boolean value
   */
  mkBool: (value: boolean): RuntimeValue => {
    return new RuntimeValueBool(value)
  },

  /**
   * Make a runtime value that represents an integer.
   *
   * @param value an integer value
   * @return a new runtime value that carries the integer value
   */
  mkInt: (value: bigint): RuntimeValue => {
    return new RuntimeValueInt(value)
  },

  /**
   * Make a runtime value that represents a set via an immutable set.
   *
   * @param elems an iterable collection of runtime values
   * @return a new runtime value that represents
   * the immutable set of normalized elements
   */
  mkSet: (elems: Iterable<RuntimeValue>): RuntimeValue => {
    // Normalize the elements, before adding them to the set.
    // Otherwise, it may not behave as a set.
    // For example, set(set(1, 2), 1.to(2)) should be treated as set(set(1, 2)).
    let set = Set.of<RuntimeValue>()
    for (const e of elems) {
      set = set.add(e.normalForm())
    }

    return new RuntimeValueSet(set)
  },

  /**
   * Make a runtime value that represents an integer interval as a pair
   * of big integers. This interval may be converted to an immutable set
   * via `this#toSet()`.
   *
   * @param first the minimal point of the interval (inclusive)
   * @param last the maximal poitn of the interval (inclusive)
   * @return a new runtime value that the interval
   */
  mkInterval: (first: bigint, last: bigint): RuntimeValue => {
    return new RuntimeValueInterval(first, last)
  },
}

/**
 * A runtime value produced and consumed by the simulator. The structure of
 * the runtime values is not exposed to the users.
 *
 * Since runtime values are internal to the simulator, we implement the
 * set-like operations over all runtime values. This simplifies the simulator
 * code, as it does not have to distinguish between iterable values and
 * non-iterable ones. Of course, this may lead to ill-typed operations. Type
 * correctness of the input must be checked by the type checker.
 */
export interface RuntimeValue
  extends EvalResult, ValueObject, Iterable<RuntimeValue> {

  /**
   * Can the runtime value behave like a set? Effectively, this means that the
   * value returns a sequence of elements, when it is iterated over.
   */
isSetLike: boolean

  /**
   * Transform this runtime value into the normal form, so it can be
   * added to an immutable set:
   *
   *  - integers and literals are already in the normal form,
   *  - immutable sets are in the normal form,
   *  - intervals and powersets are converted to immutable sets.
   */
  normalForm (): RuntimeValue

  /**
   * If the result is set-like, transform it to an immutable
   * set via iteration. Otherwise, return an empty set.
   * This is useful for special sets such as intervals.
   *
   * @return an immutable set of results
   * (probably much larger than the original object)
   */
  toSet (): Set<RuntimeValue>

  /**
   * If the result contains a Boolean value, return it. Otherwise, return false.
   *
   * @return the stored Boolean value (if it's Boolean), or false.
   */
  toBool (): boolean

  /**
   * If the result contains an integer value, return it. Otherwise, return 0n.
   *
   * @return the stored integer value (if it's integer) or 0n.
   */
  toInt (): bigint

  /**
    * If the result is set-like, does it contain contain a value?
    * If the result is not set-like, return false.
    *
    * @param elem evaluation result to check for membership
    * @return true, if `value` appears in the result
    */
  contains (value: RuntimeValue): boolean

  /**
    * If this runtime value is set-like, does it contain all elements of
    * another set-like runtime value?
    *
    * @param superset set-like collection of runtime values
    * @result true if all elements of this are included
    * or equal to the elements of `superset`
    */
  isSubset (superset: RuntimeValue): boolean
}

/**
 * The default implementation of the common methods.
 * This implementation is internal to the module.
 */
abstract class RuntimeValueBase implements RuntimeValue {
  isSetLike: boolean

  constructor (isSetLike: boolean) {
    this.isSetLike = isSetLike
  }

  [Symbol.iterator] () {
    // produce an empty iterator by default
    return {
      next (): IteratorResult<RuntimeValue> {
        return { done: true, value: undefined }
      },
    }
  }

  normalForm (): RuntimeValue {
    if (!this.isSetLike) {
      // Booleans and integers are in the normal form
      return this
    } else {
      return new RuntimeValueSet(this.toSet())
    }
  }

  toSet (): Set<RuntimeValue> {
    // the default transformation to a set is done via iteration
    let set = Set.of<RuntimeValue>()
    for (const e of this) {
      set = set.add(e.normalForm())
    }
    return set
  }

  toBool (): boolean {
    if (this instanceof RuntimeValueBool) {
      return (this as RuntimeValueBool).value
    } else {
      return false
    }
  }

  toInt (): bigint {
    if (this instanceof RuntimeValueInt) {
      return (this as RuntimeValueInt).value
    } else {
      return 0n
    }
  }

  contains (elem: RuntimeValue): boolean {
    // the default search is done via iteration, which is the worst case
    let found = false
    // the element may be in a special form (e.g., an interval), normalize
    const elemNorm = elem.normalForm()
    for (const other of this) {
      if (other.equals(elemNorm)) {
        found = true
      }
    }

    return found
  }

  isSubset (superset: RuntimeValue): boolean {
    // Do O(m * n) tests, where m and n are the cardinalities of lhs and rhs.
    // Maybe we should use a cardinality test, when it's possible.
    for (const e of this) {
      if (!superset.contains(e)) {
        return false
      }
    }

    return true
  }

  equals (other: unknown): boolean {
    if (typeof other !== 'object' || other === null) {
      return false
    }
    if (!(other instanceof RuntimeValueBase)) {
      return false
    }
    if (this instanceof RuntimeValueBool && other instanceof RuntimeValueBool) {
      return this.value === other.value
    }
    if (this instanceof RuntimeValueInt && other instanceof RuntimeValueInt) {
      return this.value === other.value
    }
    if (this instanceof RuntimeValueSet && other instanceof RuntimeValueSet) {
      return immutableIs(this.set, other.set)
    }
    if (this instanceof RuntimeValueInterval &&
        other instanceof RuntimeValueInterval) {
      return this.first === other.first && this.last === other.last
    }
    if (this.isSetLike && other.isSetLike) {
      // for instance, an interval and an explicit set
      return immutableIs(this.toSet(), other.toSet())
    }

    return false
  }

  hashCode (): number {
    // The default implementation,
    // to make it compatible with RuntimeValue and ValueObject.
    return 0
  }

  toTntEx (): TntEx {
    // the default implementation, to make it compatible with RuntimeValue
    return {
      id: 0n,
      kind: 'bool',
      value: false,
    }
  }
}

/**
 * A Boolean runtime value. This is an internal class.
 */
class RuntimeValueBool extends RuntimeValueBase implements RuntimeValue {
  value: boolean

  constructor (value: boolean) {
    super(false)
    this.value = value
  }

  hashCode (): number {
    return this.value ? 1 : 0
  }

  toTntEx (): TntEx {
    return {
      id: 0n,
      kind: 'bool',
      value: this.value,
    }
  }
}

/**
 * An integer (bigint) runtime value. This is an internal class.
 */
class RuntimeValueInt extends RuntimeValueBase implements ValueObject {
  value: bigint

  constructor (value: bigint) {
    super(false)
    this.value = value
  }

  hashCode (): number {
    // wrap to a 32-bit unsigned integer and convert to a number
    return Number(BigInt.asUintN(32, this.value))
  }

  toTntEx (): TntEx {
    return {
      id: 0n,
      kind: 'int',
      value: this.value,
    }
  }
}

/**
 * A set of runtime values represented via an immutable set.
 * This is an internal class.
 */
class RuntimeValueSet extends RuntimeValueBase implements RuntimeValue {
  set: Set<RuntimeValue>

  constructor (set: Set<RuntimeValue>) {
    super(true)
    this.set = set
  }

  [Symbol.iterator] () {
    return this.set[Symbol.iterator]()
  }

  hashCode (): number {
    return this.set.hashCode()
  }

  isSubset (superset: RuntimeValue): boolean {
    if (superset instanceof RuntimeValueSet) {
      // do a (hopefully) less expensive test
      return this.set.isSubset(superset.set)
    } else {
      // do the default test via iteration
      return super.isSubset(superset)
    }
  }

  toSet (): Set<RuntimeValue> {
    return this.set
  }

  contains (elem: RuntimeValue): boolean {
    // do a (hopefully) less expensive test
    return this.set.includes(elem.normalForm())
  }

  toTntEx (): TntEx {
    // Sets are tricky, as we have to normalize them when producing TntEx.
    // The most common normal form is the one that sorts sets according
    // to their string representation. Instead of computing the string
    // representation multiple times, we cache it in `__str` and then forget it.
    function cacheStr (e: TntEx) {
      return {
        ...e,
        __str: expressionToString(e),
      }
    }
    // Normalize the elements by sorting them
    const elems: (TntEx & { __str?: string })[] =
      this.set
        .map(e => e.toTntEx())
        .map(cacheStr)
        .toArray()
        .sort((e1, e2) => e1.__str.localeCompare(e2.__str))
    // erase the string cache
    elems.forEach(e => delete e.__str)
    // return the expression set(...elems)
    return {
      id: 0n,
      kind: 'app',
      opcode: 'set',
      args: elems,
    }
  }
}

/**
 * A set of runtime values represented via an integer interval.
 * This is an internal class.
 */
class RuntimeValueInterval extends RuntimeValueBase implements RuntimeValue {
  first: bigint
  last: bigint

  constructor (first: bigint, last: bigint) {
    super(true)
    if (last >= first) {
      this.first = first
      this.last = last
    } else {
      // the interval is empty, normalize it
      this.first = 1n
      this.last = 0n
    }
  }

  [Symbol.iterator] () {
    return new IntervalIterator(this.first, this.last)
  }

  hashCode (): number {
    // wrap the sum to a 32-bit unsigned integer and convert to a number
    return Number(BigInt.asUintN(32, this.first + this.last))
  }

  contains (elem: RuntimeValue): boolean {
    if (elem instanceof RuntimeValueInt) {
      return this.first <= elem.value && elem.value <= this.last
    } else {
      return false
    }
  }

  isSubset (superset: RuntimeValue): boolean {
    if (superset instanceof RuntimeValueInterval) {
      return this.first >= superset.first && this.last <= superset.last
    } else {
      // fall back to the general implementation
      return super.isSubset(superset)
    }
  }

  toTntEx (): TntEx {
    // simply enumerate the values in the interval first..last
    const elems: TntEx[] = []
    for (const i of this) {
      elems.push(i.toTntEx())
    }
    // return the expression set(...elems)
    return {
      id: 0n,
      kind: 'app',
      opcode: 'set',
      args: elems,
    }
  }
}

/**
 * An iterator over integer runtime values from a range.
 * This is an internal class.
 */
class IntervalIterator implements Iterator<RuntimeValue> {
  private current: bigint
  private end: bigint

  constructor (first: bigint, last: bigint) {
    this.current = first
    this.end = last
  }

  next (): IteratorResult<RuntimeValue> {
    if (this.current <= this.end) {
      return {
        done: false,
        value: new RuntimeValueInt(this.current++),
      }
    } else {
      return { done: true, value: undefined }
    }
  }
}
