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
 *  - RuntimeValuePowerset: to compactly represent powersets.
 *
 *  - RuntimeValueMapSet: to compactly represent a set of functions.
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
 *
 * Igor Konnov, 2022
 *
 * Copyright (c) Informal Systems 2022. All rights reserved. Licensed under
 * the Apache 2.0. See License.txt in the project root for license
 * information.
 */

import {
  Set, List, ValueObject, OrderedMap, Map, hash, is as immutableIs
} from 'immutable'

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
   * Make a runtime value that represents a string.
   *
   * @param value a string
   * @return a new runtime value that carries the string
   */
  mkStr: (value: string): RuntimeValue => {
    return new RuntimeValueStr(value)
  },

  /**
   * Make a runtime value that represents a tuple.
   *
   * @param value an iterable collection of runtime values
   * @return a new runtime value that carries the tuple
   */
  mkTuple: (elems: Iterable<RuntimeValue>): RuntimeValue => {
    return new RuntimeValueTupleOrList('tup', List(elems))
  },

  /**
   * Make a runtime value that represents a list.
   *
   * @param value an iterable collection of runtime values
   * @return a new runtime value that carries the list
   */
  mkList: (elems: Iterable<RuntimeValue>): RuntimeValue => {
    return new RuntimeValueTupleOrList('list', List(elems))
  },

  /**
   * Make a runtime value that represents a record.
   *
   * @param value an iterable collection of pairs of strings and runtime values
   * @return a new runtime value that carries the record
   */
  mkRecord: (elems: Iterable<[string, RuntimeValue]>): RuntimeValue => {
    return new RuntimeValueRecord(OrderedMap(elems))
  },

  /**
   * Make a runtime value that represents a map.
   *
   * @param value an iterable collection of pairs of runtime values
   * @return a new runtime value that carries the map
   */
  mkMap: (elems: Iterable<[RuntimeValue, RuntimeValue]>): RuntimeValue => {
    // convert the keys to the normal form, as they are hashed
    const arr: [RuntimeValue, RuntimeValue][] =
      Array.from(elems).map(([k, v]) => [k.normalForm(), v])
    return new RuntimeValueMap(Map(arr))
  },

  /**
   * Make a runtime value that represents a map, using a Map.
   *
   * @param value an iterable collection of pairs of runtime values
   * @return a new runtime value that carries the map
   */
  fromMap: (map: Map<RuntimeValue, RuntimeValue>): RuntimeValue => {
    // convert the keys to the normal form, as they are hashed
    return new RuntimeValueMap(map)
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
   * Make a runtime value that represents either Nat or Int.
   *
   * @param set kind (Nat or Int)
   * @return a new runtime value that carries the infinite set
   */
  mkInfSet: (kind: 'Nat' | 'Int'): RuntimeValue => {
    return new RuntimeValueInfSet(kind)
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

  /**
   * Make a runtime value that represents a cross product of sets.
   *
   * @param value an iterable collection of runtime values
   * @return a new runtime value that carries the tuple
   */
  mkCrossProd: (sets: RuntimeValue[]): RuntimeValue => {
    return new RuntimeValueCrossProd(sets)
  },

  /**
   * Make a runtime value that represents a set of maps.
   *
   * @param domainSet the set that stores the map domain
   * @param rangeSet the set that stores the map range
   * @return a new runtime value that carries the set of maps
   */
  mkMapSet: (domainSet: RuntimeValue, rangeSet: RuntimeValue): RuntimeValue => {
    return new RuntimeValueMapSet(domainSet, rangeSet)
  },

  /**
   * Make a runtime value that represents a powerset.
   *
   * @param the baseset
   * @return a new runtime value that represents the powerset of the baseset
   */
  mkPowerset: (baseSet: RuntimeValue): RuntimeValue => {
    return new RuntimeValuePowerset(baseSet)
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
   * If the result is a tuple or a list, transform it to an immutable list of
   * values.  Otherwise, return an empty list.
   *
   * @return an immutable list of results
   */
  toList (): List<RuntimeValue>

  /**
   * If the result is a map, transform it to a map of values.
   * Otherwise, return an empty map.
   *
   * @return an immutable map of key-values
   */
  toMap (): Map<RuntimeValue, RuntimeValue>

  /**
   * If the result is a record, transform it to a map of values.
   * Otherwise, return an empty map.
   *
   * @return an immutable map of key-values
   */
  toOrderedMap (): OrderedMap<string, RuntimeValue>

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
   * If the result contains a string value, return it.
   *
   * @return the stored string value.
   */
  toStr (): string

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

  /**
   * If this runtime value is set-like, pick one of its elements using the
   * position argument as the input. Note that the position is not the index
   * of the element under some stable ordering. Rather, it is a number in the range
   * [0, 1). It can be used to pick elements from infinite sets such as Int and Nat.
   *
   * TODO: reconsider this API. Perhaps, just use a bigint, which encodes either
   * the index up to the cardinality, or the position in an infinite set (Nat, Int).
   */
  pick (position: number): RuntimeValue | undefined

  /**
   * If this runtime value is set-like, return the number of its elements,
   * unless its infinite. If the set is infinite, throw an exception,
   * as there is no way to efficiently deal with infinite cardinalities.
   *
   * @return the number of set elements, if the set is finite,
   * or throw Error, if the set is infinite
   */

  cardinality (): number
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
    // tuples override this method
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

  toList (): List<RuntimeValue> {
    if (this instanceof RuntimeValueTupleOrList) {
      return this.list
    } else {
      return List()
    }
  }

  toOrderedMap (): OrderedMap<string, RuntimeValue> {
    if (this instanceof RuntimeValueRecord) {
      return this.map
    } else {
      return OrderedMap()
    }
  }

  toMap (): Map<RuntimeValue, RuntimeValue> {
    if (this instanceof RuntimeValueMap) {
      return this.map
    } else {
      return Map()
    }
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

  toStr (): string {
    if (this instanceof RuntimeValueStr) {
      return (this as RuntimeValueStr).value
    } else {
      return ''
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
    if (this instanceof RuntimeValueStr && other instanceof RuntimeValueStr) {
      return this.value === other.value
    }
    if (this instanceof RuntimeValueTupleOrList &&
        other instanceof RuntimeValueTupleOrList) {
      return this.kind === other.kind && this.list.equals(other.list)
    }
    if (this instanceof RuntimeValueRecord &&
        other instanceof RuntimeValueRecord) {
      return this.map.equals(other.map)
    }
    if (this instanceof RuntimeValueSet && other instanceof RuntimeValueSet) {
      return immutableIs(this.set, other.set)
    }
    if (this instanceof RuntimeValueMap && other instanceof RuntimeValueMap) {
      return immutableIs(this.map, other.map)
    }
    if (this instanceof RuntimeValueInterval &&
        other instanceof RuntimeValueInterval) {
      return this.first === other.first && this.last === other.last
    }
    if (this instanceof RuntimeValueCrossProd &&
        other instanceof RuntimeValueCrossProd) {
      const size = this.sets.length
      if (size !== other.sets.length) {
        return false
      } else {
        for (let i = 0; i < size; i++) {
          if (!this.sets[i].equals(other.sets[i])) {
            return false
          }
        }
        return true
      }
    }
    if (this instanceof RuntimeValuePowerset &&
        other instanceof RuntimeValuePowerset) {
      return this.baseSet.equals(other.baseSet)
    }
    if (this instanceof RuntimeValueMapSet &&
        other instanceof RuntimeValueMapSet) {
      return this.domainSet.equals(other.domainSet) &&
        this.rangeSet.equals(other.rangeSet)
    }
    if (this instanceof RuntimeValueInfSet) {
      return (other instanceof RuntimeValueInfSet)
        ? this.kind === other.kind
        : false
    }
    if (other instanceof RuntimeValueInfSet) {
      return (this instanceof RuntimeValueInfSet)
        ? this.kind === other.kind
        : false
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

  pick (position: number): RuntimeValue | undefined {
    return undefined
  }

  cardinality () {
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
 * An immutable string runtime value. This is an internal class.
 */
class RuntimeValueStr extends RuntimeValueBase implements ValueObject {
  value: string

  constructor (value: string) {
    super(false)
    this.value = value
  }

  hashCode (): number {
    return hash(this.value)
  }

  toTntEx (): TntEx {
    return {
      id: 0n,
      kind: 'str',
      value: this.value,
    }
  }
}

type TupleOrList = 'tup' | 'list'

/**
 * A set of runtime values represented via an immutable List.
 * This is an internal class.
 */
class RuntimeValueTupleOrList extends RuntimeValueBase implements RuntimeValue {
  kind: TupleOrList
  list: List<RuntimeValue>

  constructor (kind: TupleOrList, values: List<RuntimeValue>) {
    super(true)
    this.kind = kind
    this.list = values
  }

  [Symbol.iterator] () {
    return this.list[Symbol.iterator]()
  }

  normalForm (): RuntimeValue {
    const normalizedValues: RuntimeValue[] = []
    for (const e of this.list) {
      normalizedValues.push(e.normalForm())
    }
    return new RuntimeValueTupleOrList(this.kind, List(normalizedValues))
  }

  hashCode (): number {
    return this.list.hashCode()
  }

  toTntEx (): TntEx {
    // simply enumerate the values
    const elems: TntEx[] = []
    for (const e of this.list) {
      elems.push(e.toTntEx())
    }
    // return the expression tup(...elems)
    return {
      id: 0n,
      kind: 'app',
      opcode: (this.kind === 'tup') ? 'tup' : 'list',
      args: elems,
    }
  }
}

/**
 * A set of runtime values represented via an immutable ordered Map.
 * This is an internal class.
 */
class RuntimeValueRecord extends RuntimeValueBase implements RuntimeValue {
  map: OrderedMap<string, RuntimeValue>

  constructor (values: OrderedMap<string, RuntimeValue>) {
    super(true)
    this.map = values
  }

  normalForm (): RuntimeValue {
    const normalizedMap: OrderedMap<string, RuntimeValue> =
        this.map.map((v, k) => v.normalForm())
    return new RuntimeValueRecord(normalizedMap)
  }

  hashCode (): number {
    return this.map.hashCode()
  }

  toTntEx (): TntEx {
    // simply enumerate the values
    const elems: TntEx[] = []
    for (const [key, value] of this.map) {
      elems.push({ id: 0n, kind: 'str', value: key })
      elems.push(value.toTntEx())
    }
    // return the expression rec(...elems)
    return {
      id: 0n,
      kind: 'app',
      opcode: 'rec',
      args: elems,
    }
  }
}

/**
 * A set of runtime values represented via an immutable Map.
 * This is an internal class.
 */
class RuntimeValueMap extends RuntimeValueBase implements RuntimeValue {
  map: Map<RuntimeValue, RuntimeValue>

  constructor (keyValues: Map<RuntimeValue, RuntimeValue>) {
    super(true)
    this.map = keyValues
  }

  normalForm (): RuntimeValue {
    const normalizedMap: OrderedMap<RuntimeValue, RuntimeValue> =
        this.map.mapEntries(([k, v]) => [k.normalForm(), v.normalForm()])
    return new RuntimeValueMap(normalizedMap)
  }

  hashCode (): number {
    return this.map.hashCode()
  }

  toTntEx (): TntEx {
    // convert to a set of pairs and use its normal form
    const pairs: RuntimeValueTupleOrList[] = this.map.toArray().map(([k, v]) =>
      new RuntimeValueTupleOrList('tup', List([k, v]))
    )
    const set = new RuntimeValueSet(Set(pairs)).toTntEx()
    if (set.kind === 'app') {
      // return the expression mapOf(pairs)
      return {
        id: 0n,
        kind: 'app',
        opcode: 'mapOf',
        args: set.args,
      }
    } else {
      throw new Error('Expected a set, found: ' + set.kind)
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

  pick (position: number): RuntimeValue | undefined {
    // compute the element index based on the position
    let index = positionToIndex(position, this.set.size)
    // Iterate over the set elements,
    // since the set is not indexed, find the first element that goes over
    // the index number. This is probably the most efficient way of doing it
    // without creating intermediate objects in memory.
    for (const e of this) {
      if (index <= 0) {
        return e
      }
      index -= 1
    }

    return undefined
  }

  cardinality () {
    return this.set.size
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
    const start = this.first
    const end = this.last
    function * gen (): Generator<RuntimeValue> {
      for (let i = start; i <= end; i++) {
        yield new RuntimeValueInt(i)
      }
    }

    return gen()
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

  pick (position: number): RuntimeValue | undefined {
    if (this.last < this.first) {
      return undefined
    } else {
      const size = Number(this.last - this.first + 1n)
      const index = positionToIndex(position, size)
      return new RuntimeValueInt(this.first + BigInt(index))
    }
  }

  cardinality () {
    return Number(this.last - this.first) + 1
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
 * A set of runtime values represented via a cross-product of sets.
 * This is an internal class.
 */
class RuntimeValueCrossProd
  extends RuntimeValueBase implements RuntimeValue {
  // components of the cross-product, must be set-like
  sets: RuntimeValue[]

  constructor (sets: RuntimeValue[]) {
    super(true)
    this.sets = sets
  }

  [Symbol.iterator] () {
    // convert every set-like value to an array
    const arrays: RuntimeValue[][] =
      this.sets.map(set => Array.from(set))
    const existsEmptySet = arrays.some(arr => arr.length === 0)

    const nindices = arrays.length
    function * gen () {
      if (existsEmptySet) {
        // yield nothing as an empty set produces the empty product
        return
      }
      // Our iterator is an array of indices.
      // An ith index must be in the range [0, arrays[i].length).
      const indices: number[] = Array(nindices).fill(0)
      indices[0] = -1
      let done = false
      while (!done) {
        // try to increment one of the counters, starting with the first one
        done = true
        for (let i = 0; i < nindices; i++) {
          // similar to how we do increment in binary,
          // try to increase a position, wrapping to 0, if overfull
          if (++indices[i] >= arrays[i].length) {
            // wrap around and continue
            indices[i] = 0
          } else {
            // increment worked, there is a next element
            done = false
            break
          }
        }

        if (!done) {
          // yield a tuple that is produced with the counters
          const nextElem: RuntimeValue[] = []
          for (let i = 0; i < nindices; i++) {
            nextElem.push(arrays[i][indices[i]])
          }
          yield new RuntimeValueTupleOrList('tup', List(nextElem))
        }
      }
    }

    return gen()
  }

  hashCode (): number {
    let hash = 0
    for (const c of this.sets) {
      hash += c.hashCode()
    }
    return hash
  }

  contains (elem: RuntimeValue): boolean {
    if (elem instanceof RuntimeValueTupleOrList) {
      if (elem.list.size !== this.sets.length) {
        return false
      } else {
        let i = 0
        for (const e of elem.list) {
          if (!this.sets[i].contains(e)) {
            return false
          }
          i++
        }
        return true
      }
    } else {
      return false
    }
  }

  isSubset (superset: RuntimeValue): boolean {
    if (superset instanceof RuntimeValueCrossProd) {
      const size = this.sets.length
      if (superset.sets.length !== size) {
        return false
      } else {
        for (let i = 0; i < size; i++) {
          if (!this.sets[i].isSubset(superset.sets[i])) {
            return false
          }
        }
        return true
      }
    } else {
      // fall back to the general implementation
      return super.isSubset(superset)
    }
  }

  cardinality () {
    return this.sets.reduce((n, set) => set.cardinality() * n, 1)
  }

  pick (position: number): RuntimeValue | undefined {
    let index = Math.floor(position * this.cardinality())
    const elems: RuntimeValue[] = []
    for (const set of this.sets) {
      const card = set.cardinality()
      const elem = set.pick((index % card) / card)
      if (card <= 0) {
        return undefined
      } else {
        index = index / card
      }
      if (elem) {
        elems.push(elem)
      } else {
        return undefined
      }
    }

    return new RuntimeValueTupleOrList('tup', List.of(...elems))
  }

  toTntEx (): TntEx {
    // simply enumerate the values
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
 * A set of runtime values represented via powersets.
 * This is an internal class.
 */
class RuntimeValuePowerset
  extends RuntimeValueBase implements RuntimeValue {
  // the base set
  baseSet: RuntimeValue

  constructor (baseSet: RuntimeValue) {
    super(true)
    this.baseSet = baseSet
  }

  [Symbol.iterator] () {
    const nsets = this.cardinality()
    // copy fromIndex, as gen does not have access to this.
    const fromIndex = (i: number): RuntimeValue => this.fromIndex(i)
    function * gen () {
      // Generate `nsets` sets by using number increments.
      // Note that 2 ** 0 == 1.
      for (let i = 0; i < nsets; i++) {
        yield fromIndex(i)
      }
    }

    return gen()
  }

  hashCode (): number {
    return this.baseSet.hashCode()
  }

  contains (elem: RuntimeValue): boolean {
    if (!elem.isSetLike) {
      return false
    }

    for (const e of elem) {
      if (!this.baseSet.contains(e)) {
        return false
      }
    }

    return true
  }

  isSubset (superset: RuntimeValue): boolean {
    if (superset instanceof RuntimeValuePowerset) {
      return this.baseSet.isSubset(superset.baseSet)
    } else {
      // fall back to the general implementation
      return super.isSubset(superset)
    }
  }

  cardinality () {
    return 2 ** this.baseSet.cardinality()
  }

  pick (position: number): RuntimeValue | undefined {
    const index = Math.floor(position * this.cardinality())
    return this.fromIndex(index)
  }

  toTntEx (): TntEx {
    // simply enumerate the values
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

  // Convert the global index i to bits, which define membership.
  // By interactively dividing the index by 2 and
  // taking its remainder.
  private fromIndex (index: number): RuntimeValue {
    const elems: RuntimeValue[] = []
    let bits = index
    for (const elem of this.baseSet) {
      const isMem = (bits % 2) === 1
      bits = Math.floor(bits / 2)
      if (isMem) {
        elems.push(elem)
      }
    }
    return rv.mkSet(elems)
  }
}

/**
 * A set of runtime values represented via a set of maps.
 * This is an internal class.
 */
class RuntimeValueMapSet
  extends RuntimeValueBase implements RuntimeValue {
  // components of the cross-product, must be set-like
  domainSet: RuntimeValue
  rangeSet: RuntimeValue

  constructor (domainSet: RuntimeValue, rangeSet: RuntimeValue) {
    super(true)
    this.domainSet = domainSet
    this.rangeSet = rangeSet
  }

  [Symbol.iterator] () {
    // convert the domain and range to arrays
    const domainArr = Array.from(this.domainSet)
    const rangeArr = Array.from(this.rangeSet)

    // The below code is an adaptation of RuntimeValueCrossProd.
    // Can we generalize both?
    const nindices = domainArr.length
    const nvalues = rangeArr.length
    function * gen () {
      if (domainArr.length === 0 || rangeArr.length === 0) {
        // yield nothing as an empty set produces the empty product
        return
      }
      // generate `nmaps` maps by using number increments
      const nmaps = nvalues ** nindices
      for (let i = 0; i < nmaps; i++) {
        const pairs: [RuntimeValue, RuntimeValue][] = []
        // Convert the global index i to digits of a nvalues-based number.
        // By interactively dividing the index by the base and
        // taking its remainder.
        let index = i
        for (let k = 0; k < nindices; k++) {
          pairs.push([domainArr[k], rangeArr[index % nvalues]])
          index = Math.floor(index / nvalues)
        }
        yield rv.mkMap(pairs)
      }
    }

    return gen()
  }

  hashCode (): number {
    return this.domainSet.hashCode() + this.rangeSet.hashCode()
  }

  contains (elem: RuntimeValue): boolean {
    if (elem instanceof RuntimeValueMap) {
      return this.domainSet.equals(rv.mkSet(elem.map.keys())) &&
        elem.map.find((v) =>
          !this.rangeSet.contains(v.normalForm())) === undefined
    } else {
      return false
    }
  }

  isSubset (superset: RuntimeValue): boolean {
    if (superset instanceof RuntimeValueMapSet) {
      return this.domainSet.equals(superset.domainSet) &&
        this.rangeSet.isSubset(superset.rangeSet)
    } else {
      // fall back to the general implementation
      return super.isSubset(superset)
    }
  }

  cardinality () {
    return this.rangeSet.cardinality() ** this.domainSet.cardinality()
  }

  pick (position: number): RuntimeValue | undefined {
    let index = Math.floor(position * Number(this.cardinality()))
    const keyValues: [RuntimeValue, RuntimeValue][] = []
    const domainSize = this.domainSet.cardinality()
    const rangeSize = this.rangeSet.cardinality()
    if (domainSize === 0 || rangeSize === 0) {
      return undefined
    }

    for (let i = 0; i < domainSize; i++) {
      const key = this.domainSet.pick((i % domainSize) / domainSize)
      const value = this.rangeSet.pick((index % rangeSize) / rangeSize)
      index = index / rangeSize
      if (key && value) {
        keyValues.push([key, value])
      } else {
        return undefined
      }
    }

    return rv.mkMap(keyValues)
  }

  toTntEx (): TntEx {
    // simply enumerate the values
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

// convert a position in [0, 1) to the index in a collection of `size` elements
function positionToIndex (position: number, size: number) {
  return (position < 0.0 || position >= 1.0)
    ? 0
    : Math.floor(position * size)
}

/**
 * An infinite set such as Nat or Int. Since we cannot enumerate infinite
 * sets, the support for them is very limited.
 * This is an internal class.
 */
class RuntimeValueInfSet extends RuntimeValueBase implements RuntimeValue {
  kind: 'Nat' | 'Int'

  constructor (kind: 'Nat' | 'Int') {
    super(true)
    this.kind = kind
  }

  [Symbol.iterator] (): Iterator<RuntimeValue> {
    throw new Error(`Infinite set ${this.kind} is non-enumerable`)
  }

  hashCode (): number {
    // the hash codes for Nat and Int are a bit arbitrary, so we make them huge
    return (this.kind === 'Nat')
      ? Number.MAX_SAFE_INTEGER - 1
      : Number.MAX_SAFE_INTEGER
  }

  isSubset (superset: RuntimeValue): boolean {
    if (superset instanceof RuntimeValueInfSet) {
      return this.kind !== 'Int' || superset.kind !== 'Nat'
    } else {
      return false
    }
  }

  toSet (): Set<RuntimeValue> {
    throw new Error(`Infinite set ${this.kind} is non-enumerable`)
  }

  contains (elem: RuntimeValue): boolean {
    if (elem instanceof RuntimeValueInt) {
      return (this.kind === 'Int') ? true : elem.value >= 0
    } else {
      return false
    }
  }

  pick (position: number): RuntimeValue | undefined {
    // We cannot produce a random big integer.
    // Currently, we constrain integers to 32-bit integers.
    // In the future, we will let the user to define their own range.
    if (this.kind === 'Nat') {
      return rv.mkInt(BigInt(Math.floor(position * (2 ** 32))))
    } else {
      return rv.mkInt(BigInt(Math.floor(position * (2 ** 32) - (2 ** 31))))
    }
  }

  cardinality (): number {
    throw new Error(`The cardinality of an infinite set ${this.kind} is not a number`)
  }

  toTntEx (): TntEx {
    // return the built-in name
    return {
      id: 0n,
      kind: 'name',
      name: this.kind,
    }
  }
}
