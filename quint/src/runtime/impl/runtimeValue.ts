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
 * `set(1, 2, 3) == 1.to(3)` is a legal Quint expression. Although we could
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
 * Moreover, some Quint expressions force us to fall back on the enumerative set
 * representation. For example, set(set(1, 2, 3), 1.to(3)) is equivalent to the
 * set `set(set(1, 2, 3))`. If we did not normalize `1.to(3)` to `set(1, 2,
 * 3)`, we would produce a set that would not be considered equal to
 * `set(set(1, 2, 3))`. This is because implementations of sets utilize hashes,
 * which would be different in the enumerative and interval representations.
 *
 * The operator `contains` may seem to be too specialized for introducing the
 * whole new layer of abstraction. However, it is deeply rooted in the
 * semantics of Quint, which, similar to TLA+, heavily utilizes set operators.
 *
 * Igor Konnov, 2022
 *
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 */

import { Map as ImmutableMap, List, OrderedMap, Set, ValueObject, hash, is as immutableIs } from 'immutable'
import { Maybe, just, merge, none } from '@sweet-monads/maybe'
import { strict as assert } from 'assert'

import { IdGenerator, zerog } from '../../idGenerator'
import { expressionToString } from '../../ir/IRprinting'

import { EvalResult } from '../runtime'
import { QuintEx, QuintLambdaParameter, QuintName } from '../../ir/quintIr'
import { QuintError, quintErrorToString } from '../../quintError'
import { Either, left, mergeInMany, right } from '@sweet-monads/either'
import { toMaybe } from './base'
import { EvalFunction } from './compiler'
import { Context, Register } from './Context'

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
  mkInt: (value: bigint | number): RuntimeValue => {
    return new RuntimeValueInt(BigInt(value))
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
    return new RuntimeValueTupleOrList('Tup', List(elems))
  },

  /**
   * Make a runtime value that represents a list.
   *
   * @param value an iterable collection of runtime values
   * @return a new runtime value that carries the list
   */
  mkList: (elems: Iterable<RuntimeValue>): RuntimeValue => {
    return new RuntimeValueTupleOrList('List', List(elems))
  },

  /**
   * Make a runtime value that represents a record.
   *
   * @param value an iterable collection of pairs of strings and runtime values
   * @return a new runtime value that carries the record
   */
  mkRecord: (elems: Iterable<[string, RuntimeValue]>): RuntimeValue => {
    return new RuntimeValueRecord(OrderedMap(elems).sortBy((_v, k) => k))
  },

  /**
   * Make a runtime value that represents a variant value of a sum type.
   *
   * @param label a string reperenting the variant's label
   * @param value the value held by the variant
   * @return a new runtime value that represents the variant
   */
  mkVariant: (label: string, value: RuntimeValue): RuntimeValue => {
    return new RuntimeValueVariant(label, value)
  },
  /**
   * Make a runtime value that represents a map.
   *
   * @param value an iterable collection of pairs of runtime values
   * @return a new runtime value that carries the map
   */
  mkMap: (elems: Iterable<[RuntimeValue, RuntimeValue]>): RuntimeValue => {
    // convert the keys to the normal form, as they are hashed
    const arr: [RuntimeValue, RuntimeValue][] = Array.from(elems).map(([k, v]) => [k.normalForm(), v])
    return new RuntimeValueMap(ImmutableMap(arr))
  },

  /**
   * Make a runtime value that represents a map, using a Map.
   *
   * @param value an iterable collection of pairs of runtime values
   * @return a new runtime value that carries the map
   */
  fromMap: (map: ImmutableMap<RuntimeValue, RuntimeValue>): RuntimeValue => {
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
  mkInterval: (first: bigint | number, last: bigint | number): RuntimeValue => {
    return new RuntimeValueInterval(BigInt(first), BigInt(last))
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

  /**
   * Make a runtime value that represents a lambda.
   *
   * @param params the lambda parameters
   * @param body the lambda body expression
   * @returns a runtime value of lambda
   */
  mkLambda: (params: QuintLambdaParameter[], body: EvalFunction, paramRegistry: Map<bigint, Register>) => {
    const registers = params.map(param => {
      const register = paramRegistry.get(param.id)!
      if (!register) {
        const reg: Register = { value: left({ code: 'QNT501', message: `Parameter ${param.name} not set` }) }
        paramRegistry.set(param.id, reg)
        return reg
      }

      return register
    })

    return new RuntimeValueLambda(body, registers)
  },

  fromQuintEx: (ex: QuintEx): RuntimeValue => {
    const v = fromQuintEx(ex)
    if (v.isJust()) {
      return v.value
    } else {
      throw new Error(`Cannot convert ${expressionToString(ex)} to a runtime value`)
    }
  },

  toQuintEx: (value: RuntimeValue): QuintEx => {
    return value.toQuintEx(zerog)
  },
}

/** The default entry point of this module */
export default rv

/**
 * Get a ground expression, that is, an expression
 * that contains only literals and constructors, and
 * convert it to a runtime value.
 *
 * @param ex the expression to convert
 * @returns the runtime value that encodes the expression
 */
export function fromQuintEx(ex: QuintEx): Maybe<RuntimeValue> {
  switch (ex.kind) {
    case 'bool':
      return just(rv.mkBool(ex.value))

    case 'int':
      return just(rv.mkInt(ex.value))

    case 'str':
      return just(rv.mkStr(ex.value))

    case 'app':
      switch (ex.opcode) {
        case 'Set':
          return merge(ex.args.map(fromQuintEx)).map(rv.mkSet)

        case 'Map': {
          const pairs: Maybe<[RuntimeValue, RuntimeValue][]> = merge(
            ex.args.map(arg => {
              assert(arg.kind === 'app', `Expected Tup(...), found: ${arg.kind}`)
              assert(arg.opcode === 'Tup', `Expected Tup(...), found: ${arg.opcode}`)
              assert(arg.args.length === 2, `Expected a 2-element Tup(...), found: ${arg.args.length} elements`)
              return merge([fromQuintEx(arg.args[0]), fromQuintEx(arg.args[1])])
            })
          )
          return pairs.map(rv.mkMap)
        }

        case 'Tup':
          return merge(ex.args.map(fromQuintEx)).map(rv.mkTuple)

        case 'List':
          return merge(ex.args.map(fromQuintEx)).map(rv.mkList)

        case 'Rec': {
          const pairs: [string, RuntimeValue][] = []
          for (let i = 0; i < ex.args.length / 2; i++) {
            const keyEx = ex.args[2 * i]
            const key: string = keyEx.kind === 'str' ? keyEx.value : ''
            const v: Maybe<RuntimeValue> = fromQuintEx(ex.args[2 * i + 1])
            if (v.isJust()) {
              pairs.push([key, v.value])
            } else {
              return none()
            }
          }
          return just(rv.mkRecord(pairs))
        }

        case 'variant': {
          const label = (ex.args[0] as QuintName).name
          return fromQuintEx(ex.args[1]).map(v => rv.mkVariant(label, v))
        }

        default:
          // no other case should be possible
          return none()
      }

    case 'lambda':
      // We don't have enough information to convert lambdas directly
      return none()

    default:
      // no other case should be possible
      return none()
  }
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
export interface RuntimeValue extends EvalResult, ValueObject, Iterable<RuntimeValue> {
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
  normalForm(): RuntimeValue

  /**
   * If the result is set-like, transform it to an immutable
   * set via iteration. Otherwise, return an empty set.
   * This is useful for special sets such as intervals.
   *
   * @return an immutable set of results
   * (probably much larger than the original object)
   */
  toSet(): Set<RuntimeValue>

  /**
   * If the result is a tuple or a list, transform it to an immutable list of
   * values.  Otherwise, return an empty list.
   *
   * @return an immutable list of results
   */
  toList(): List<RuntimeValue>

  /**
   * If the result is a map, transform it to a map of values.
   * Otherwise, return an empty map.
   *
   * @return an immutable map of key-values
   */
  toMap(): ImmutableMap<RuntimeValue, RuntimeValue>

  /**
   * If the result is a record, transform it to a map of values.
   * Otherwise, return an empty map.
   *
   * @return an immutable map of key-values
   */
  toOrderedMap(): OrderedMap<string, RuntimeValue>

  /**
   * If the result contains a Boolean value, return it. Otherwise, return false.
   *
   * @return the stored Boolean value (if it's Boolean), or false.
   */
  toBool(): boolean

  /**
   * If the result contains an integer value, return it. Otherwise, return 0n.
   *
   * @return the stored integer value (if it's integer) or 0n.
   */
  toInt(): bigint

  /**
   * If the result contains a string value, return it.
   *
   * @return the stored string value.
   */
  toStr(): string

  /**
   * If the result is a 2-tuple, return it. Otherwise, throw an error.
   *
   * @return the stored 2-tuple value.
   */
  toTuple2(): [RuntimeValue, RuntimeValue]

  /**
   * If the result is a lambda, use the context to build an arrow function and return it. Otherwise, throw an error.
   *
   * @return the arrow function that represents the lambda.
   */
  toArrow(): (ctx: Context, args: RuntimeValue[]) => Either<QuintError, RuntimeValue>

  /**
   * If the result is a variant, return the label and the value.
   *
   * @return the label and the value of the variant.
   */
  toVariant(): [string, RuntimeValue]

  /**
   * If the result is set-like, does it contain contain a value?
   * If the result is not set-like, return false.
   *
   * @param elem evaluation result to check for membership
   * @return true, if `value` appears in the result
   */
  contains(_value: RuntimeValue): boolean

  /**
   * If this runtime value is set-like, does it contain all elements of
   * another set-like runtime value?
   *
   * @param superset set-like collection of runtime values
   * @result true if all elements of this are included
   * or equal to the elements of `superset`
   */
  isSubset(_superset: RuntimeValue): boolean

  /**
   * If this runtime value is set-like, pick one of its elements using the
   * position as returned by the `positions` iterator. Importantly,
   * `pick` may use the iterator for picking from element sets,
   * e.g., think of `Set(Set(2, 3, 4))`. Hence, the iterator is modified
   * by pick in place. Also, see #bounds().
   */
  pick(positions: Iterator<bigint>): Either<QuintError, RuntimeValue>

  /**
   * If this runtime value is set-line, compute the bounds for all subsets,
   * as a flat array. A none() value indicates infinity, whereas
   * just(n) indicates set cardinality. For example:
   *
   *  - bounds for Set(1, 2) is [just(2)],
   *  - bounds for Int is [none()]
   *  - bounds for 1.to(3).setOfMaps(3.to(6)) is [just(4), just(4), just(4)],
   *  - bounds for 1.to(3).setOfMaps(Int) is [none(), none(), none()].
   */
  bounds(): Maybe<bigint>[]

  /**
   * If this runtime value is set-like, return the number of its elements,
   * unless its infinite. If the set is infinite, throw an exception,
   * as there is no way to efficiently deal with infinite cardinalities.
   *
   * @return just the number of set elements, if the set is finite,
   * or none(), if the set is infinite
   */

  cardinality(): Either<QuintError, bigint>
}

/**
 * The default implementation of the common methods.
 * This implementation is internal to the module.
 */
abstract class RuntimeValueBase implements RuntimeValue {
  isSetLike: boolean

  constructor(isSetLike: boolean) {
    this.isSetLike = isSetLike
  }

  [Symbol.iterator]() {
    // produce an empty iterator by default
    return {
      next(): IteratorResult<RuntimeValue> {
        return { done: true, value: undefined }
      },
    }
  }

  normalForm(): RuntimeValue {
    // tuples override this method
    if (!this.isSetLike) {
      // Booleans and integers are in the normal form
      return this
    } else {
      return new RuntimeValueSet(this.toSet())
    }
  }

  toSet(): Set<RuntimeValue> {
    if (this.isSetLike) {
      // the default transformation to a set is done via iteration
      let set = Set.of<RuntimeValue>()
      for (const e of this) {
        set = set.add(e.normalForm())
      }
      return set
    } else {
      throw new Error('Expected a set-like value')
    }
  }

  toList(): List<RuntimeValue> {
    if (this instanceof RuntimeValueTupleOrList) {
      return this.list
    } else {
      throw new Error('Expected a list value')
    }
  }

  toOrderedMap(): OrderedMap<string, RuntimeValue> {
    if (this instanceof RuntimeValueRecord) {
      return this.map
    } else {
      throw new Error(`Expected a record value but got ${expressionToString(this.toQuintEx(zerog))}`)
    }
  }

  toMap(): ImmutableMap<RuntimeValue, RuntimeValue> {
    if (this instanceof RuntimeValueMap) {
      return this.map
    } else {
      throw new Error('Expected a map value')
    }
  }

  toBool(): boolean {
    if (this instanceof RuntimeValueBool) {
      return (this as RuntimeValueBool).value
    } else {
      throw new Error('Expected a Boolean value')
    }
  }

  toInt(): bigint {
    if (this instanceof RuntimeValueInt) {
      return (this as RuntimeValueInt).value
    } else {
      throw new Error(`Expected an integer value, got ${expressionToString(this.toQuintEx(zerog))}`)
    }
  }

  toStr(): string {
    if (this instanceof RuntimeValueStr) {
      return (this as RuntimeValueStr).value
    } else {
      throw new Error('Expected a string value')
    }
  }

  toTuple2(): [RuntimeValue, RuntimeValue] {
    if (this instanceof RuntimeValueTupleOrList) {
      const list = this.list

      if (list.size === 2) {
        return [list.get(0)!, list.get(1)!]
      }
    }
    throw new Error('Expected a 2-tuple')
  }

  toArrow(): (ctx: Context, args: RuntimeValue[]) => Either<QuintError, RuntimeValue> {
    if (!(this instanceof RuntimeValueLambda)) {
      throw new Error('Expected a lambda value')
    }

    const lam = this as RuntimeValueLambda

    return (ctx: Context, args: RuntimeValue[]) => {
      if (lam.registers.length !== args.length) {
        return left({
          code: 'QNT506',
          message: `Lambda expects ${lam.registers.length} arguments, but got ${args.length}`,
        })
      }

      lam.registers.forEach((reg, i) => {
        reg.value = right(args[i])
      })

      return lam.body(ctx)
    }
  }

  toVariant(): [string, RuntimeValue] {
    if (this instanceof RuntimeValueVariant) {
      return [(this as RuntimeValueVariant).label, (this as RuntimeValueVariant).value]
    } else {
      throw new Error('Expected a variant value')
    }
  }

  contains(elem: RuntimeValue): boolean {
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

  isSubset(superset: RuntimeValue): boolean {
    // Do O(m * n) tests, where m and n are the cardinalities of lhs and rhs.
    // Maybe we should use a cardinality test, when it's possible.
    for (const e of this) {
      if (!superset.contains(e)) {
        return false
      }
    }

    return true
  }

  equals(other: unknown): boolean {
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
    if (this instanceof RuntimeValueTupleOrList && other instanceof RuntimeValueTupleOrList) {
      return this.kind === other.kind && this.list.equals(other.list)
    }
    if (this instanceof RuntimeValueRecord && other instanceof RuntimeValueRecord) {
      return this.map.equals(other.map)
    }
    if (this instanceof RuntimeValueVariant && other instanceof RuntimeValueVariant) {
      return this.label === other.label && this.value.equals(other.value)
    }

    if (this instanceof RuntimeValueSet && other instanceof RuntimeValueSet) {
      return immutableIs(this.set, other.set)
    }
    if (this instanceof RuntimeValueMap && other instanceof RuntimeValueMap) {
      return immutableIs(this.map, other.map)
    }
    if (this instanceof RuntimeValueInterval && other instanceof RuntimeValueInterval) {
      return this.first === other.first && this.last === other.last
    }
    if (this instanceof RuntimeValueCrossProd && other instanceof RuntimeValueCrossProd) {
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
    if (this instanceof RuntimeValuePowerset && other instanceof RuntimeValuePowerset) {
      return this.baseSet.equals(other.baseSet)
    }
    if (this instanceof RuntimeValueMapSet && other instanceof RuntimeValueMapSet) {
      return this.domainSet.equals(other.domainSet) && this.rangeSet.equals(other.rangeSet)
    }
    if (this instanceof RuntimeValueInfSet) {
      return other instanceof RuntimeValueInfSet ? this.kind === other.kind : false
    }
    if (other instanceof RuntimeValueInfSet) {
      return this instanceof RuntimeValueInfSet ? this.kind === other.kind : false
    }
    if (this.isSetLike && other.isSetLike) {
      // for instance, an interval and an explicit set
      return immutableIs(this.toSet(), other.toSet())
    }

    return false
  }

  hashCode(): number {
    // The default implementation,
    // to make it compatible with RuntimeValue and ValueObject.
    return 0
  }

  pick(_positions: Iterator<bigint>): Either<QuintError, RuntimeValue> {
    return left({ code: 'QNT501', message: '.pick() not implemented' })
  }

  bounds(): Maybe<bigint>[] {
    return []
  }

  cardinality(): Either<QuintError, bigint> {
    return right(0n)
  }

  toQuintEx(gen: IdGenerator): QuintEx {
    // the default implementation, to make it compatible with RuntimeValue
    return {
      id: gen.nextId(),
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

  constructor(value: boolean) {
    super(false)
    this.value = value
  }

  hashCode(): number {
    return this.value ? 1 : 0
  }

  toQuintEx(gen: IdGenerator): QuintEx {
    return {
      id: gen.nextId(),
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

  constructor(value: bigint) {
    super(false)
    this.value = value
  }

  hashCode(): number {
    // wrap to a 32-bit unsigned integer and convert to a number
    return Number(BigInt.asUintN(32, this.value))
  }

  toQuintEx(gen: IdGenerator): QuintEx {
    return {
      id: gen.nextId(),
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

  constructor(value: string) {
    super(false)
    this.value = value
  }

  hashCode(): number {
    return hash(this.value)
  }

  toQuintEx(gen: IdGenerator): QuintEx {
    return {
      id: gen.nextId(),
      kind: 'str',
      value: this.value,
    }
  }
}

type TupleOrList = 'Tup' | 'List'

/**
 * A set of runtime values represented via an immutable List.
 * This is an internal class.
 */
class RuntimeValueTupleOrList extends RuntimeValueBase implements RuntimeValue {
  kind: TupleOrList
  list: List<RuntimeValue>

  constructor(kind: TupleOrList, values: List<RuntimeValue>) {
    super(true)
    this.kind = kind
    this.list = values
  }

  [Symbol.iterator]() {
    return this.list[Symbol.iterator]()
  }

  normalForm(): RuntimeValue {
    const normalizedValues: RuntimeValue[] = []
    for (const e of this.list) {
      normalizedValues.push(e.normalForm())
    }
    return new RuntimeValueTupleOrList(this.kind, List(normalizedValues))
  }

  hashCode(): number {
    return this.list.hashCode()
  }

  toQuintEx(gen: IdGenerator): QuintEx {
    // simply enumerate the values
    const elems: QuintEx[] = []
    for (const e of this.list) {
      elems.push(e.toQuintEx(gen))
    }
    // return the expression tup(...elems)
    return {
      id: gen.nextId(),
      kind: 'app',
      opcode: this.kind,
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

  constructor(values: OrderedMap<string, RuntimeValue>) {
    super(true)
    this.map = values
  }

  normalForm(): RuntimeValue {
    const normalizedMap: OrderedMap<string, RuntimeValue> = this.map.map((v, _k) => v.normalForm())
    return new RuntimeValueRecord(normalizedMap)
  }

  hashCode(): number {
    return this.map.hashCode()
  }

  toQuintEx(gen: IdGenerator): QuintEx {
    // simply enumerate the values
    const elems: QuintEx[] = []
    for (const [key, value] of this.map) {
      elems.push({ id: gen.nextId(), kind: 'str', value: key })
      elems.push(value.toQuintEx(gen))
    }
    // return the expression Rec(...elems)
    return {
      id: gen.nextId(),
      kind: 'app',
      opcode: 'Rec',
      args: elems,
    }
  }
}

export class RuntimeValueVariant extends RuntimeValueBase implements RuntimeValue {
  label: string
  value: RuntimeValue

  constructor(label: string, value: RuntimeValue) {
    super(false) // Not a "set-like" value
    this.label = label
    this.value = value
  }

  hashCode() {
    return hash(this.value) + this.value.hashCode()
  }

  toQuintEx(gen: IdGenerator): QuintEx {
    return {
      id: gen.nextId(),
      kind: 'app',
      opcode: 'variant',
      args: [{ id: gen.nextId(), kind: 'str', value: this.label }, this.value.toQuintEx(gen)],
    }
  }
}
/**
 * A set of runtime values represented via an immutable Map.
 * This is an internal class.
 */
class RuntimeValueMap extends RuntimeValueBase implements RuntimeValue {
  map: ImmutableMap<RuntimeValue, RuntimeValue>

  constructor(keyValues: ImmutableMap<RuntimeValue, RuntimeValue>) {
    super(true)
    this.map = keyValues
  }

  normalForm(): RuntimeValue {
    const normalizedMap: OrderedMap<RuntimeValue, RuntimeValue> = this.map.mapEntries(([k, v]) => [
      k.normalForm(),
      v.normalForm(),
    ])
    return new RuntimeValueMap(normalizedMap)
  }

  hashCode(): number {
    return this.map.hashCode()
  }

  toQuintEx(gen: IdGenerator): QuintEx {
    // convert to a set of pairs and use its normal form
    const pairs: RuntimeValueTupleOrList[] = this.map
      .toArray()
      .map(([k, v]) => new RuntimeValueTupleOrList('Tup', List([k, v])))
    const set = new RuntimeValueSet(Set(pairs)).toQuintEx(gen)
    if (set.kind === 'app') {
      // return the expression Map(pairs)
      return {
        id: gen.nextId(),
        kind: 'app',
        opcode: 'Map',
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

  constructor(set: Set<RuntimeValue>) {
    super(true)
    this.set = set
  }

  [Symbol.iterator]() {
    return this.set[Symbol.iterator]()
  }

  hashCode(): number {
    return this.set.hashCode()
  }

  isSubset(superset: RuntimeValue): boolean {
    if (superset instanceof RuntimeValueSet) {
      // do a (hopefully) less expensive test
      return this.set.isSubset(superset.set)
    } else {
      // do the default test via iteration
      return super.isSubset(superset)
    }
  }

  toSet(): Set<RuntimeValue> {
    return this.set
  }

  contains(elem: RuntimeValue): boolean {
    // do a (hopefully) less expensive test
    return this.set.includes(elem.normalForm())
  }

  pick(positions: Iterator<bigint>): Either<QuintError, RuntimeValue> {
    const next = positions.next()
    assert(!next.done, 'Internal error: too few positions. Report a bug.')
    let index = next.value
    // Iterate over the set elements,
    // since the set is not indexed, find the first element that goes over
    // the index number. This is probably the most efficient way of doing it
    // without creating intermediate objects in memory.
    for (const e of this) {
      if (index <= 0) {
        return right(e)
      }
      index -= 1n
    }

    // Not sure if this can happen
    return left({ code: 'QNT501', message: 'Index out of bounds' })
  }

  bounds(): Maybe<bigint>[] {
    return [toMaybe(this.cardinality())]
  }

  cardinality() {
    return right(BigInt(this.set.size))
  }

  toQuintEx(gen: IdGenerator): QuintEx {
    // Sets are tricky, as we have to normalize them when producing QuintEx.
    // The most common normal form is the one that sorts sets according
    // to their string representation. Instead of computing the string
    // representation multiple times, we cache it in `__str` and then forget it.
    function cacheStr(e: QuintEx) {
      return {
        ...e,
        __str: expressionToString(e),
      }
    }
    // Normalize the elements by sorting them
    const elems: (QuintEx & { __str?: string })[] = this.set
      .map(e => e.toQuintEx(gen))
      .map(cacheStr)
      .toArray()
      .sort((e1, e2) => e1.__str.localeCompare(e2.__str))
    // erase the string cache
    elems.forEach(e => delete e.__str)
    // return the expression Set(...elems)
    return {
      id: gen.nextId(),
      kind: 'app',
      opcode: 'Set',
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

  constructor(first: bigint, last: bigint) {
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

  [Symbol.iterator]() {
    const start = this.first
    const end = this.last
    function* g(): Generator<RuntimeValue> {
      for (let i = start; i <= end; i++) {
        yield new RuntimeValueInt(i)
      }
    }

    return g()
  }

  hashCode(): number {
    // wrap the sum to a 32-bit unsigned integer and convert to a number
    return Number(BigInt.asUintN(32, this.first + this.last))
  }

  contains(elem: RuntimeValue): boolean {
    if (elem instanceof RuntimeValueInt) {
      return this.first <= elem.value && elem.value <= this.last
    } else {
      return false
    }
  }

  isSubset(superset: RuntimeValue): boolean {
    if (superset instanceof RuntimeValueInterval) {
      return this.first >= superset.first && this.last <= superset.last
    } else {
      // fall back to the general implementation
      return super.isSubset(superset)
    }
  }

  pick(positions: Iterator<bigint>): Either<QuintError, RuntimeValue> {
    const next = positions.next()
    assert(!next.done, 'Internal error: too few positions. Report a bug.')
    const index = next.value
    assert(
      index >= 0 || index <= this.last - this.first,
      `Internal error: index ${index} is out of bounds [${this.first}, ${this.last}]. Report a bug.`
    )
    if (this.last < this.first) {
      return left({ code: 'QNT501', message: 'Index out of bounds' })
    } else {
      return right(new RuntimeValueInt(this.first + BigInt(index)))
    }
  }

  bounds(): Maybe<bigint>[] {
    return [toMaybe(this.cardinality())]
  }

  cardinality() {
    return right(BigInt(this.last - this.first) + 1n)
  }

  toQuintEx(gen: IdGenerator): QuintEx {
    // simply enumerate the values in the interval first..last
    const elems: QuintEx[] = []
    for (const i of this) {
      elems.push(i.toQuintEx(gen))
    }
    // return the expression Set(...elems)
    return {
      id: gen.nextId(),
      kind: 'app',
      opcode: 'Set',
      args: elems,
    }
  }
}

/**
 * A set of runtime values represented via a cross-product of sets.
 * This is an internal class.
 */
class RuntimeValueCrossProd extends RuntimeValueBase implements RuntimeValue {
  // components of the cross-product, must be set-like
  sets: RuntimeValue[]

  constructor(sets: RuntimeValue[]) {
    super(true)
    this.sets = sets
  }

  [Symbol.iterator]() {
    // convert every set-like value to an array
    const arrays: RuntimeValue[][] = this.sets.map(set => Array.from(set))
    const existsEmptySet = arrays.some(arr => arr.length === 0)

    const nindices = arrays.length
    function* gen() {
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
          yield new RuntimeValueTupleOrList('Tup', List(nextElem))
        }
      }
    }

    return gen()
  }

  hashCode(): number {
    let hash = 0
    for (const c of this.sets) {
      hash += c.hashCode()
    }
    return hash
  }

  contains(elem: RuntimeValue): boolean {
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

  isSubset(superset: RuntimeValue): boolean {
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

  cardinality(): Either<QuintError, bigint> {
    return mergeInMany(this.sets.map(s => s.cardinality()))
      .map(cards => cards.reduce((n, card) => n * card, 1n))
      .mapLeft((errors): QuintError => {
        return { code: 'QNT501', message: errors.map(quintErrorToString).join('\n') }
      })
  }

  pick(positions: Iterator<bigint>): Either<QuintError, RuntimeValue> {
    const elems: Either<QuintError, RuntimeValue[]> = mergeInMany(
      this.sets.map(elemSet => elemSet.pick(positions))
    ).mapLeft((errors): QuintError => {
      return { code: 'QNT501', message: errors.map(quintErrorToString).join('\n') }
    })

    return elems.map(es => new RuntimeValueTupleOrList('Tup', List.of(...es)))
  }

  bounds(): Maybe<bigint>[] {
    return this.sets.map(elemSet => toMaybe(elemSet.cardinality()))
  }

  toQuintEx(gen: IdGenerator): QuintEx {
    // simply enumerate the values
    const elems: QuintEx[] = []
    for (const i of this) {
      elems.push(i.toQuintEx(gen))
    }
    // return the expression Set(...elems)
    return {
      id: gen.nextId(),
      kind: 'app',
      opcode: 'Set',
      args: elems,
    }
  }
}

/**
 * A set of runtime values represented via powersets.
 * This is an internal class.
 */
class RuntimeValuePowerset extends RuntimeValueBase implements RuntimeValue {
  // the base set
  baseSet: RuntimeValue

  constructor(baseSet: RuntimeValue) {
    super(true)
    this.baseSet = baseSet
  }

  [Symbol.iterator]() {
    const nsets = this.cardinality().unwrap()
    // copy fromIndex, as gen does not have access to this.
    const fromIndex = (i: bigint): RuntimeValue => this.fromIndex(i)
    function* gen() {
      // Generate `nsets` sets by using number increments.
      // Note that 2 ** 0 == 1.
      for (let i = 0n; i < nsets; i++) {
        yield fromIndex(i)
      }
    }

    return gen()
  }

  hashCode(): number {
    return this.baseSet.hashCode()
  }

  contains(elem: RuntimeValue): boolean {
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

  isSubset(superset: RuntimeValue): boolean {
    if (superset instanceof RuntimeValuePowerset) {
      return this.baseSet.isSubset(superset.baseSet)
    } else {
      // fall back to the general implementation
      return super.isSubset(superset)
    }
  }

  cardinality(): Either<QuintError, bigint> {
    return this.baseSet.cardinality().map(c => 2n ** c)
  }

  pick(positions: Iterator<bigint>): Either<QuintError, RuntimeValue> {
    const next = positions.next()
    assert(!next.done, 'Internal error: too few positions. Report a bug.')
    return this.cardinality().map(_ => this.fromIndex(next.value))
  }

  bounds(): Maybe<bigint>[] {
    return [toMaybe(this.cardinality())]
  }

  toQuintEx(gen: IdGenerator): QuintEx {
    // simply enumerate the values
    const elems: QuintEx[] = []
    for (const i of this) {
      elems.push(i.toQuintEx(gen))
    }
    // return the expression Set(...elems)
    return {
      id: gen.nextId(),
      kind: 'app',
      opcode: 'Set',
      args: elems,
    }
  }

  // Convert the global index i to bits, which define membership.
  // By interactively dividing the index by 2 and
  // taking its remainder.
  private fromIndex(index: bigint): RuntimeValue {
    const elems: RuntimeValue[] = []
    let bits = index
    for (const elem of this.baseSet) {
      const isMem = bits % 2n === 1n
      bits = bits / 2n
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
class RuntimeValueMapSet extends RuntimeValueBase implements RuntimeValue {
  // components of the cross-product, must be set-like
  domainSet: RuntimeValue
  rangeSet: RuntimeValue

  constructor(domainSet: RuntimeValue, rangeSet: RuntimeValue) {
    super(true)
    this.domainSet = domainSet
    this.rangeSet = rangeSet
  }

  [Symbol.iterator]() {
    // convert the domain and range to arrays
    const domainArr = Array.from(this.domainSet)
    const rangeArr = Array.from(this.rangeSet)

    // The below code is an adaptation of RuntimeValueCrossProd.
    // Can we generalize both?
    const nindices = domainArr.length
    const nvalues = rangeArr.length
    function* gen() {
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

  hashCode(): number {
    return this.domainSet.hashCode() + this.rangeSet.hashCode()
  }

  contains(elem: RuntimeValue): boolean {
    if (elem instanceof RuntimeValueMap) {
      return (
        this.domainSet.equals(rv.mkSet(elem.map.keys())) &&
        elem.map.find(v => !this.rangeSet.contains(v.normalForm())) === undefined
      )
    } else {
      return false
    }
  }

  isSubset(superset: RuntimeValue): boolean {
    if (superset instanceof RuntimeValueMapSet) {
      return this.domainSet.equals(superset.domainSet) && this.rangeSet.isSubset(superset.rangeSet)
    } else {
      // fall back to the general implementation
      return super.isSubset(superset)
    }
  }

  cardinality(): Either<QuintError, bigint> {
    return mergeInMany([this.rangeSet.cardinality(), this.domainSet.cardinality()])
      .map(([rc, dc]) => rc ** dc)
      .mapLeft((errors): QuintError => {
        return { code: 'QNT501', message: errors.map(quintErrorToString).join('\n') }
      })
  }

  pick(positions: Iterator<bigint>): Either<QuintError, RuntimeValue> {
    const domainSizeResult = this.domainSet.cardinality()
    const rangeSizeResult = this.rangeSet.cardinality()
    if (domainSizeResult.isLeft()) {
      // we cannot generate maps over infinite domains
      return left(domainSizeResult.value)
    }

    const domainSize = domainSizeResult.value
    if (domainSize === 0n || (rangeSizeResult.isRight() && rangeSizeResult.value === 0n)) {
      // the set of maps is empty, no way to pick a value
      return left({ code: 'QNT501', message: 'Empty set of maps' })
    }

    const keyValues: [RuntimeValue, RuntimeValue][] = []
    for (const key of this.domainSet) {
      const valueOrNone = this.rangeSet.pick(positions)
      if (valueOrNone.isRight()) {
        keyValues.push([key, valueOrNone.value])
      } else {
        return valueOrNone
      }
    }

    return right(rv.mkMap(keyValues))
  }

  bounds(): Maybe<bigint>[] {
    const domainSizeOrNone = toMaybe(this.domainSet.cardinality())
    assert(
      domainSizeOrNone.isJust() && domainSizeOrNone.value <= Number.MAX_SAFE_INTEGER,
      `Domain size is over ${Number.MAX_SAFE_INTEGER}`
    )
    const sz = Number(domainSizeOrNone.value)
    return Array(sz).fill(toMaybe(this.rangeSet.cardinality()))
  }

  toQuintEx(gen: IdGenerator): QuintEx {
    // simply enumerate the values
    const elems: QuintEx[] = []
    for (const i of this) {
      elems.push(i.toQuintEx(gen))
    }
    // return the expression set(...elems)
    return {
      id: gen.nextId(),
      kind: 'app',
      opcode: 'Set',
      args: elems,
    }
  }
}

/**
 * An infinite set such as Nat or Int. Since we cannot enumerate infinite
 * sets, the support for them is very limited.
 * This is an internal class.
 */
class RuntimeValueInfSet extends RuntimeValueBase implements RuntimeValue {
  kind: 'Nat' | 'Int'

  constructor(kind: 'Nat' | 'Int') {
    super(true)
    this.kind = kind
  }

  [Symbol.iterator](): Iterator<RuntimeValue> {
    throw new Error(`Infinite set ${this.kind} is non-enumerable`)
  }

  hashCode(): number {
    // the hash codes for Nat and Int are a bit arbitrary, so we make them huge
    return this.kind === 'Nat' ? Number.MAX_SAFE_INTEGER - 1 : Number.MAX_SAFE_INTEGER
  }

  isSubset(superset: RuntimeValue): boolean {
    if (superset instanceof RuntimeValueInfSet) {
      return this.kind !== 'Int' || superset.kind !== 'Nat'
    } else {
      return false
    }
  }

  toSet(): Set<RuntimeValue> {
    throw new Error(`Infinite set ${this.kind} is non-enumerable`)
  }

  contains(elem: RuntimeValue): boolean {
    if (elem instanceof RuntimeValueInt) {
      return this.kind === 'Int' ? true : elem.value >= 0
    } else {
      return false
    }
  }

  pick(positions: Iterator<bigint>): Either<QuintError, RuntimeValue> {
    // Simply return the position. The actual range is up to the caller,
    // as Int and Nat do not really care about the ranges.
    const next = positions.next()
    assert(!next.done, 'Internal error: too few positions. Report a bug.')
    if (this.kind === 'Int') {
      // Simply return the position. It's up to the caller to pick the position.
      return right(rv.mkInt(next.value))
    } else {
      // Nat: return the absolute value of the position.
      const p = next.value
      return right(rv.mkInt(p >= 0n ? p : -p))
    }
  }

  bounds(): Maybe<bigint>[] {
    // it's an infinite set, so we return none() to indicate an infinite set
    return [none()]
  }

  cardinality(): Either<QuintError, bigint> {
    return left({ code: 'QNT514', message: `Cardinality of ${this.kind} is infinite` })
  }

  toQuintEx(gen: IdGenerator): QuintEx {
    // return the built-in name
    return {
      id: gen.nextId(),
      kind: 'name',
      name: this.kind,
    }
  }
}

/**
 * A lambda operator as a runtime value. Technically, it should not be a value
 * in Quint/TLA+. However, we have to carry lambdas when evaluating higher-order
 * operators.
 *
 * RuntimeValueLambda cannot be compared with other values.
 */
export class RuntimeValueLambda extends RuntimeValueBase implements RuntimeValue {
  body: EvalFunction
  registers: Register[]

  constructor(body: EvalFunction, registers: Register[]) {
    super(false)
    this.body = body
    this.registers = registers
  }

  toQuintEx(gen: IdGenerator): QuintEx {
    // We produce a mock Quint expression.
    // It is not going to be used,
    // as the lambdas are passed only inside the simulator.
    return {
      id: gen.nextId(),
      kind: 'lambda',
      params: Array.from(this.registers.keys()).map(i => {
        return { id: gen.nextId(), name: `_a${i}` }
      }),
      qualifier: 'def',
      expr: {
        kind: 'str',
        value: `lambda_${this.registers.length}_params`,
        id: gen.nextId(),
      },
    }
  }
}
