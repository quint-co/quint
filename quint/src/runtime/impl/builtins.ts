/* ----------------------------------------------------------------------------------
 * Copyright 2022-2024 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Definitions on how to evaluate Quint builtin operators and values.
 *
 * The definitions are heavily based on the original `compilerImpl.ts` file written by Igor Konnov.
 *
 * @author Igor Konnov, Gabriela Moreira
 *
 * @module
 */

import { Either, left, right } from '@sweet-monads/either'
import { QuintError } from '../../quintError'
import { List, Map, Range, Set } from 'immutable'
import { isFalse, isTrue } from './evaluator'
import { Context } from './Context'
import { RuntimeValue, rv } from './runtimeValue'
import { chunk, times } from 'lodash'
import { expressionToString } from '../../ir/IRprinting'
import { zerog } from '../../idGenerator'
import { QuintApp } from '../../ir/quintIr'
import { prettyQuintEx, terminalWidth } from '../../graphics'
import { format } from '../../prettierimp'
import { EvalFunction } from './builder'

/**
 * Evaluates the given Quint builtin value by its name.
 *
 * This function is responsible for handling the evaluation of builtin values
 * (operators that do not take parameters). It returns an `EvalFunction`
 * which, when executed, provides the corresponding `RuntimeValue` or an error.
 *
 * The supported builtin values are:
 * - 'Bool': Returns a set containing boolean values `true` and `false`.
 * - 'Int': Returns an infinite set representing all integers.
 * - 'Nat': Returns an infinite set representing all natural numbers.
 * - 'q::lastTrace': Returns the list of the last trace from the context.
 *
 * If the provided name does not match any of the supported builtin values,
 * it returns an error indicating the unknown builtin.
 *
 * @param name - The name of the builtin value to evaluate.
 * @returns An `EvalFunction` that evaluates to the corresponding `RuntimeValue` or an error.
 */
export function builtinValue(name: string): EvalFunction {
  switch (name) {
    case 'Bool':
      return _ => right(rv.mkSet([rv.mkBool(false), rv.mkBool(true)]))
    case 'Int':
      return _ => right(rv.mkInfSet('Int'))
    case 'Nat':
      return _ => right(rv.mkInfSet('Nat'))
    case 'q::lastTrace':
      return ctx => right(rv.mkList(ctx.trace.get()))
    default:
      return _ => left({ code: 'QNT404', message: `Unknown builtin ${name}` })
  }
}

/**
 * A list of operators that must be evaluated lazily.
 *  These operators cannot have their arguments evaluated before their own evaluation for various reasons:
 * - Short-circuit operators (e.g., `and`, `or`, `implies`) where evaluation stops as soon as the result is determined.
 * - Conditional operators (e.g., `ite`, `matchVariant`) where only certain arguments are evaluated based on conditions.
 * - Repetition operators (e.g., `reps`) where the number of repetitions is unknown before evaluation.
 * - Operators that interact with state variables in a special way (e.g., `assign`, `next`).
 * - Operators where we can save resources (e.g., using `#pick()` in `oneOf` instead of enumerating the set).
 */
export const lazyOps = [
  'assign',
  'actionAny',
  'actionAll',
  'ite',
  'matchVariant',
  'oneOf',
  'and',
  'or',
  'next',
  'implies',
  'then',
  'reps',
  'expect',
]

/**
 * Evaluates the given lazy builtin operator by its name.
 *
 * This function handles the evaluation of lazy builtin operators,
 * which require special handling as described in the `lazyOps` documentation.
 * It returns a function that takes a context and a list of evaluation functions,
 * and returns the result of evaluating the operator.
 *
 * If the provided operator does not match any of the supported lazy operators,
 * it returns an error indicating the unknown operator.
 *
 * @param op - The name of the lazy builtin operator to evaluate.
 * @returns A function that evaluates the operator with the given context and arguments.
 */
export function lazyBuiltinLambda(
  op: string
): (ctx: Context, args: EvalFunction[]) => Either<QuintError, RuntimeValue> {
  switch (op) {
    case 'and':
      // Short-circuit logical AND
      return (ctx, args) => {
        for (const arg of args) {
          const result = arg(ctx)
          if (!isTrue(result)) {
            return result
          }
        }
        return right(rv.mkBool(true))
      }
    case 'or':
      // Short-circuit logical OR
      return (ctx, args) => {
        for (const arg of args) {
          const result = arg(ctx)
          if (!isFalse(result)) {
            return result
          }
        }
        return right(rv.mkBool(false))
      }
    case 'implies':
      // Short-circuit logical implication
      return (ctx, args) => {
        return args[0](ctx).chain(l => {
          if (!l.toBool()) {
            return right(rv.mkBool(true))
          }

          return args[1](ctx)
        })
      }

    case 'actionAny': {
      // Executes the first enabled action from a randomized list of actions.
      // Returns false if no enabled actions are found.
      const app: QuintApp = { id: 0n, kind: 'app', opcode: 'actionAny', args: [] }
      return (ctx, args) => {
        const nextVarsSnapshot = ctx.varStorage.snapshot()

        // Create array of indices and shuffle them
        const indices = Array.from(args.keys())
        // Fisher-Yates shuffle algorithm
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Number(ctx.rand(BigInt(i + 1)))
          // Swap: indices[i] <--> indices[j]
          ;[indices[i], indices[j]] = [indices[j], indices[i]]
        }

        // Try actions in shuffled order until we find one that's enabled
        for (const i of indices) {
          // Reset state for each attempt
          ctx.varStorage.actionTaken = undefined
          ctx.varStorage.nondetPicks.forEach((_, key) => {
            ctx.varStorage.nondetPicks.set(key, undefined)
          })

          ctx.recorder.onAnyOptionCall(app, i)
          const result = args[i](ctx)
          ctx.recorder.onAnyOptionReturn(app, i)

          if (result.isLeft()) {
            return result
          }

          if (result.value.toBool()) {
            // Found an enabled action - record it and return true
            const successor = ctx.varStorage.snapshot()
            ctx.recorder.onAnyReturn(args.length, i)
            ctx.varStorage.recoverSnapshot(successor)
            return right(rv.mkBool(true))
          }

          // Reset state before trying next action
          ctx.varStorage.recoverSnapshot(nextVarsSnapshot)
        }

        // No enabled actions found
        ctx.recorder.onAnyReturn(args.length, -1)
        ctx.varStorage.recoverSnapshot(nextVarsSnapshot)
        return right(rv.mkBool(false))
      }
    }
    case 'actionAll':
      // Executes all of the given actions, or none of them if any of them results in false.
      return (ctx, args) => {
        const nextVarsSnapshot = ctx.varStorage.snapshot()
        for (const action of args) {
          const result = action(ctx)

          if (result.isLeft()) {
            return result
          }

          if (isFalse(result)) {
            ctx.varStorage.recoverSnapshot(nextVarsSnapshot)
            return right(rv.mkBool(false))
          }
        }
        return right(rv.mkBool(true))
      }
    case 'ite':
      // if-then-else
      return (ctx, args) => {
        return args[0](ctx).chain(condition => {
          return condition.toBool() ? args[1](ctx) : args[2](ctx)
        })
      }

    case 'matchVariant':
      // Pattern matching on variants
      return (ctx, args) => {
        const matchedEx = args[0]
        return matchedEx(ctx).chain(expr => {
          const [label, value] = expr.toVariant()

          const cases = args.slice(1)

          const caseForVariant = chunk(cases, 2).find(([caseLabel, _caseElim]) => {
            const l = caseLabel(ctx).unwrap().toStr()
            return l === '_' || l === label
          })

          if (!caseForVariant) {
            return left({ code: 'QNT505', message: `No match for variant ${label}` })
          }

          const [_caseLabel, caseElim] = caseForVariant
          return caseElim(ctx).chain(elim => elim.toArrow()(ctx, [value]))
        })
      }

    case 'then':
      // Compose two actions, executing the second one only if the first one results in true.
      return (ctx, args) => {
        const oldState = ctx.varStorage.asRecord()
        return args[0](ctx).chain(firstResult => {
          if (!firstResult.toBool()) {
            return left({
              code: 'QNT513',
              message: 'Cannot continue in `then` because the highlighted expression evaluated to false',
            })
          }

          ctx.shift()
          const newState = ctx.varStorage.asRecord()
          ctx.recorder.onNextState(oldState, newState)

          return args[1](ctx)
        })
      }
    case 'reps':
      // Repeats the given action n times, stopping if the action evaluates to false.
      return (ctx, args) => {
        return args[0](ctx).chain(n => {
          let result: Either<QuintError, RuntimeValue> = right(rv.mkBool(true))
          for (let i = 0; i < Number(n.toInt()); i++) {
            result = args[1](ctx).chain(value => value.toArrow()(ctx, [rv.mkInt(i)]))
            if (result.isLeft()) {
              return result
            }

            if (isFalse(result)) {
              return left({
                code: 'QNT513',
                message: `Reps loop could not continue after iteration #${i + 1} evaluated to false`,
              })
            }

            // Don't shift after the last one
            if (i < Number(n.toInt()) - 1) {
              ctx.shift()
            }
          }
          return result
        })
      }
    case 'expect':
      // Translate A.expect(P):
      //  - Evaluate A.
      //  - When A's result is 'false', emit a runtime error.
      //  - When A's result is 'true':
      //    - Commit the variable updates: Shift the primed variables to unprimed.
      //    - Evaluate `P`.
      //    - If `P` evaluates to `false`, emit a runtime error (similar to `assert`).
      //    - If `P` evaluates to `true`, rollback to the previous state and return `true`.
      return (ctx, args) => {
        const result: Either<QuintError, RuntimeValue> = args[0](ctx).chain(action => {
          if (!action.toBool()) {
            return left({ code: 'QNT508', message: 'Cannot continue to "expect"' })
          }

          const nextVarsSnapshot = ctx.varStorage.snapshot()
          ctx.shift()
          return args[1](ctx).chain(expectation => {
            ctx.varStorage.recoverSnapshot(nextVarsSnapshot)
            ctx.trace.dropLast()

            if (!expectation.toBool()) {
              return left({ code: 'QNT508', message: 'Expect condition does not hold true' })
            }

            return right(rv.mkBool(true))
          })
        })
        return result
      }

    default:
      return () => left({ code: 'QNT000', message: 'Unknown stateful op' })
  }
}

/**
 * Evaluates the given builtin operator by its name.
 *
 * This function handles the evaluation of builtin operators,
 * which require the arguments to be pre-evaluated. It returns
 * a function that takes a context and a list of runtime values,
 * and returns the result of evaluating the operator.
 *
 * If the provided operator does not match any of the supported operators,
 * it returns an error indicating the unknown operator.
 *
 * @param op - The name of the builtin operator to evaluate.
 * @returns A function that evaluates the operator with the given context and arguments.
 */
export function builtinLambda(op: string): (ctx: Context, args: RuntimeValue[]) => Either<QuintError, RuntimeValue> {
  switch (op) {
    case 'Set':
      // Constructs a set from the given arguments.
      return (_, args) => right(rv.mkSet(args))
    case 'Rec':
      // Constructs a record from the given arguments. Arguments are lists like [key1, value1, key2, value2, ...]
      return (_, args) => right(rv.mkRecord(Map(chunk(args, 2).map(([k, v]) => [k.toStr(), v]))))
    case 'List':
      // Constructs a list from the given arguments.
      return (_, args) => right(rv.mkList(List(args)))
    case 'Tup':
      // Constructs a tuple from the given arguments.
      return (_, args) => right(rv.mkTuple(List(args)))
    case 'Map':
      // Constructs a map from the given arguments. Arguments are lists like [[key1, value1], [key2, value2], ...]
      return (_, args) => right(rv.mkMap(args.map(kv => kv.toTuple2())))
    case 'variant':
      // Constructs a variant from the given arguments.
      return (_, args) => right(rv.mkVariant(args[0].toStr(), args[1]))
    case 'not':
      // Logical negation
      return (_, args) => right(rv.mkBool(!args[0].toBool()))
    case 'iff':
      // Logical equivalence/bi-implication
      return (_, args) => right(rv.mkBool(args[0].toBool() === args[1].toBool()))
    case 'eq':
      // Equality
      return (_, args) => right(rv.mkBool(args[0].equals(args[1])))
    case 'neq':
      // Inequality
      return (_, args) => right(rv.mkBool(!args[0].equals(args[1])))
    case 'iadd':
      // Integer addition
      return (_, args) => right(rv.mkInt(args[0].toInt() + args[1].toInt()))
    case 'isub':
      // Integer subtraction
      return (_, args) => right(rv.mkInt(args[0].toInt() - args[1].toInt()))
    case 'imul':
      // Integer multiplication
      return (_, args) => right(rv.mkInt(args[0].toInt() * args[1].toInt()))
    case 'idiv':
      // Integer division
      return (_, args) => {
        const divisor = args[1].toInt()
        if (divisor === 0n) {
          return left({ code: 'QNT503', message: `Division by zero` })
        }
        return right(rv.mkInt(args[0].toInt() / divisor))
      }
    case 'imod':
      // Integer modulus
      return (_, args) => right(rv.mkInt(args[0].toInt() % args[1].toInt()))
    case 'ipow':
      // Integer exponentiation
      return (_, args) => {
        const base = args[0].toInt()
        const exp = args[1].toInt()
        if (base === 0n && exp === 0n) {
          return left({ code: 'QNT503', message: `0^0 is undefined` })
        }
        if (exp < 0n) {
          return left({ code: 'QNT503', message: 'i^j is undefined for j < 0' })
        }

        return right(rv.mkInt(base ** exp))
      }
    case 'iuminus':
      // Integer unary minus
      return (_, args) => right(rv.mkInt(-args[0].toInt()))
    case 'ilt':
      // Integer less than
      return (_, args) => right(rv.mkBool(args[0].toInt() < args[1].toInt()))
    case 'ilte':
      // Integer less than or equal to
      return (_, args) => right(rv.mkBool(args[0].toInt() <= args[1].toInt()))
    case 'igt':
      // Integer greater than
      return (_, args) => right(rv.mkBool(args[0].toInt() > args[1].toInt()))
    case 'igte':
      // Integer greater than or equal to
      return (_, args) => right(rv.mkBool(args[0].toInt() >= args[1].toInt()))

    case 'item':
      // Access a tuple: tuples are 1-indexed, that is, _1, _2, etc.
      return (_, args) => {
        return getListElem(args[0].toList(), Number(args[1].toInt()) - 1)
      }
    case 'tuples':
      // A set of all possible tuples from the elements of the respective given sets.
      return (_, args) => right(rv.mkCrossProd(args))

    case 'range':
      // Constructs a list of integers from start to end.
      return (_, args) => {
        const start = Number(args[0].toInt())
        const end = Number(args[1].toInt())
        return right(rv.mkList(List(Range(start, end).map(rv.mkInt))))
      }

    case 'nth':
      // List access
      return (_, args) => getListElem(args[0].toList(), Number(args[1].toInt()))

    case 'replaceAt':
      // Replace an element at a given index in a list.
      return (_, args) => {
        const list = args[0].toList()
        const idx = Number(args[1].toInt())
        if (idx < 0 || idx >= list.size) {
          return left({ code: 'QNT510', message: `Out of bounds, replaceAt(${idx})` })
        }

        return right(rv.mkList(list.set(idx, args[2])))
      }

    case 'head':
      // Get the first element of a list. Not allowed in empty lists.
      return (_, args) => {
        const list = args[0].toList()
        if (list.size === 0) {
          return left({ code: 'QNT505', message: `Called 'head' on an empty list` })
        }
        return right(list.first()!)
      }

    case 'tail':
      // Get the tail (all elements but the head) of a list. Not allowed in empty lists.
      return (_, args) => {
        const list = args[0].toList()
        if (list.size === 0) {
          return left({ code: 'QNT505', message: `Called 'tail' on an empty list` })
        }
        return right(rv.mkList(list.rest()))
      }

    case 'slice':
      // Get a sublist of a list from start to end.
      return (_, args) => {
        const list = args[0].toList()
        const start = Number(args[1].toInt())
        const end = Number(args[2].toInt())
        if (start < 0 || start > end || end > list.size) {
          return left({
            code: 'QNT506',
            message: `slice(..., ${start}, ${end}) applied to a list of size ${list.size}`,
          })
        }

        return right(rv.mkList(list.slice(start, end)))
      }

    case 'length':
      // The length of a list.
      return (_, args) => right(rv.mkInt(args[0].toList().size))
    case 'append':
      // Append an element to a list.
      return (_, args) => right(rv.mkList(args[0].toList().push(args[1])))
    case 'concat':
      // Concatenate two lists.
      return (_, args) => right(rv.mkList(args[0].toList().concat(args[1].toList())))
    case 'indices':
      // A set with the indices of a list.
      return (_, args) => right(rv.mkInterval(0n, args[0].toList().size - 1))

    case 'field':
      // Access a field in a record.
      return (_, args) => {
        const field = args[1].toStr()
        const result = args[0].toOrderedMap().get(field)
        return result ? right(result) : left({ code: 'QNT501', message: `Accessing a missing record field ${field}` })
      }

    case 'fieldNames':
      // A set with the field names of a record.
      return (_, args) => right(rv.mkSet(args[0].toOrderedMap().keySeq().map(rv.mkStr)))

    case 'with':
      // Replace a field value in a record.
      return (_, args) => {
        const record = args[0].toOrderedMap()
        const field = args[1].toStr()
        const value = args[2]

        if (!record.has(field)) {
          return left({ code: 'QNT501', message: `Called 'with' with a non-existent field ${field}` })
        }

        return right(rv.mkRecord(record.set(field, value)))
      }

    case 'powerset':
      // The powerset of a set.
      return (_, args) => right(rv.mkPowerset(args[0]))
    case 'contains':
      // Check if a set contains an element.
      return (_, args) => right(rv.mkBool(args[0].contains(args[1])))
    case 'in':
      // Check if an element is in a set.
      return (_, args) => right(rv.mkBool(args[1].contains(args[0])))
    case 'subseteq':
      // Check if a set is a subset of another set.
      return (_, args) => right(rv.mkBool(args[0].isSubset(args[1])))
    case 'exclude':
      // Set difference.
      return (_, args) => right(rv.mkSet(args[0].toSet().subtract(args[1].toSet())))
    case 'union':
      // Set union.
      return (_, args) => right(rv.mkSet(args[0].toSet().union(args[1].toSet())))
    case 'intersect':
      // Set intersection.
      return (_, args) => right(rv.mkSet(args[0].toSet().intersect(args[1].toSet())))
    case 'size':
      // The size of a set.
      return (_, args) => args[0].cardinality().map(rv.mkInt)
    case 'isFinite':
      // at the moment, we support only finite sets, so just return true
      return _args => right(rv.mkBool(true))

    case 'to':
      // Construct a set of integers from a to b.
      return (_, args) => right(rv.mkInterval(args[0].toInt(), args[1].toInt()))
    case 'fold':
      // Fold a set
      return (ctx, args) => applyFold('fwd', args[0].toSet(), args[1], arg => args[2].toArrow()(ctx, arg))
    case 'foldl':
      // Fold a list from left to right.
      return (ctx, args) => applyFold('fwd', args[0].toList(), args[1], arg => args[2].toArrow()(ctx, arg))
    case 'foldr':
      // Fold a list from right to left.
      return (ctx, args) => applyFold('rev', args[0].toList(), args[1], arg => args[2].toArrow()(ctx, arg))

    case 'flatten':
      // Flatten a set of sets.
      return (_, args) => {
        const s = args[0].toSet().map(s => s.toSet())
        return right(rv.mkSet(s.flatten(1) as Set<RuntimeValue>))
      }

    case 'get':
      // Get a value from a map.
      return (_, args) => {
        const map = args[0].toMap()
        const key = args[1].normalForm()
        const value = map.get(key)
        if (value) {
          return right(value)
        }

        // Else, the key does not exist. Construct an informative error message.
        const requestedKey = expressionToString(key.toQuintEx(zerog))
        const existingKeys = map
          .toMap()
          .keySeq()
          .map(k => expressionToString(k.toQuintEx(zerog)))
          .join(', ')

        return left({
          code: 'QNT507',
          message: `Called 'get' with a non-existing key. Key is ${requestedKey}. Map has keys: ${existingKeys}`,
        })
      }

    case 'set':
      // Set a value for an existing key in a map.
      return (_, args) => {
        const map = args[0].toMap()
        const key = args[1].normalForm()
        if (!map.has(key)) {
          return left({ code: 'QNT507', message: "Called 'set' with a non-existing key" })
        }
        const value = args[2]
        return right(rv.fromMap(map.set(key, value)))
      }

    case 'put':
      // Set a value for any key in a map.
      return (_, args) => {
        const map = args[0].toMap()
        const key = args[1].normalForm()
        const value = args[2]
        return right(rv.fromMap(map.set(key, value)))
      }

    case 'setBy':
      // Set a value for an existing key in a map using a lambda over the current value.
      return (ctx, args) => {
        const map = args[0].toMap()
        const key = args[1].normalForm()
        if (!map.has(key)) {
          return left({ code: 'QNT507', message: `Called 'setBy' with a non- existing key ${key}` })
        }

        const value = map.get(key)!
        const lam = args[2].toArrow()
        return lam(ctx, [value]).map(v => rv.fromMap(map.set(key, v)))
      }

    case 'keys':
      // A set with the keys of a map.
      return (_, args) => right(rv.mkSet(args[0].toMap().keys()))

    case 'exists':
      // Check if a predicate holds for some element in a set.
      return (ctx, args) =>
        applyLambdaToSet(ctx, args[1], args[0]).map(values => rv.mkBool(values.some(v => v.toBool()) === true))

    case 'forall':
      // Check if a predicate holds for all elements in a set.
      return (ctx, args) =>
        applyLambdaToSet(ctx, args[1], args[0]).map(values => rv.mkBool(values.every(v => v.toBool()) === true))

    case 'map':
      // Map a lambda over a set.
      return (ctx, args) => {
        return applyLambdaToSet(ctx, args[1], args[0]).map(values => rv.mkSet(values))
      }

    case 'filter':
      // Filter a set using a lambda.
      return (ctx, args) => {
        const set = args[0].toSet()
        const lam = args[1].toArrow()

        return filterElementsWithLambda(ctx, set, lam).map(result => rv.mkSet(result))
      }

    case 'select':
      // Filter a list using a lambda
      return (ctx, args) => {
        const list = args[0].toList()
        const lam = args[1].toArrow()

        return filterElementsWithLambda(ctx, list, lam).map(result => rv.mkList(result))
      }

    case 'mapBy':
      // Construct a map by applying a lambda to the values of a set.
      return (ctx, args) => {
        const lambda = args[1].toArrow()
        const keys = args[0].toSet()
        const results: [RuntimeValue, RuntimeValue][] = []

        for (const key of keys) {
          const value = lambda(ctx, [key])
          if (value.isLeft()) {
            return value
          }
          results.push([key.normalForm(), value.value])
        }

        return right(rv.fromMap(Map(results)))
      }

    case 'setToMap':
      // Convert a set of key-value tuples to a map.
      return (_, args) => {
        const set = args[0].toSet()
        return right(rv.mkMap(Map(set.map(s => s.toTuple2()))))
      }

    case 'setOfMaps':
      // A set of all possible maps with keys and values from the given sets.
      return (_, args) => right(rv.mkMapSet(args[0], args[1]))

    case 'fail':
      // Expect a value to be false
      return (_, args) => right(rv.mkBool(!args[0].toBool()))
    case 'assert':
      // Expect a value to be true, returning a runtime error if it is not
      return (_, args) => (args[0].toBool() ? right(args[0]) : left({ code: 'QNT508', message: `Assertion failed` }))

    case 'allListsUpTo':
      // Generate all lists of length up to the given number, from a set
      return (_, args) => {
        const set = args[0].toSet()
        let lists: Set<RuntimeValue[]> = Set([[]])
        let last_lists: Set<RuntimeValue[]> = Set([[]])
        times(Number(args[1].toInt())).forEach(_length => {
          // Generate all lists of length `length` from the set
          const new_lists: Set<RuntimeValue[]> = set.toSet().flatMap(value => {
            // for each value in the set, append it to all lists of length `length - 1`
            return last_lists.map(list => list.concat(value))
          })

          lists = lists.merge(new_lists)
          last_lists = new_lists
        })

        return right(rv.mkSet(lists.map(list => rv.mkList(list)).toOrderedSet()))
      }
    case 'getOnlyElement':
      // Get the only element of a set, or an error if the set is empty or has more than one element.
      return (_, args) => {
        const set = args[0].toSet()
        if (set.size !== 1) {
          return left({
            code: 'QNT505',
            message: `Called 'getOnlyElement' on a set with ${set.size} elements. Make sure the set has exactly one element.`,
          })
        }

        return right(set.first())
      }

    case 'q::debug':
      // Print a value to the console, and return it
      return (_, args) => {
        let columns = terminalWidth()
        let valuePretty = format(columns, 0, prettyQuintEx(args[1].toQuintEx(zerog)))
        console.log('>', args[0].toStr(), valuePretty.toString())
        return right(args[1])
      }

    // standard unary operators that are not handled by REPL
    case 'allLists':
    case 'chooseSome':
    case 'always':
    case 'eventually':
    case 'enabled':
      return _ => left({ code: 'QNT501', message: `Runtime does not support the built -in operator '${op}'` })

    // builtin operators that are not handled by REPL
    case 'orKeep':
    case 'mustChange':
    case 'weakFair':
    case 'strongFair':
      return _ => left({ code: 'QNT501', message: `Runtime does not support the built -in operator '${op}'` })

    default:
      return () => left({ code: 'QNT000', message: `Unknown builtin ${op}` })
  }
}

/**
 * Applies a lambda function to each element in a set.
 *
 * If the lambda function returns an error for any element, the function
 * will return that error immediately.
 *
 * @param ctx - The context in which to evaluate the lambda function.
 * @param lambda - The lambda function to apply to each element in the set.
 * @param set - The set of elements to which the lambda function will be applied.
 * @returns A set of the results of applying the lambda function to each element in the set,
 *          or an error if the lambda function returns an error for any element.
 */
function applyLambdaToSet(
  ctx: Context,
  lambda: RuntimeValue,
  set: RuntimeValue
): Either<QuintError, Set<RuntimeValue>> {
  const f = lambda.toArrow()
  const elements = set.toSet()
  const results = []

  // Apply using a for so we exit early if we get a left
  for (const element of elements) {
    const result = f(ctx, [element])
    if (result.isLeft()) {
      return left(result.value)
    }
    results.push(result.value)
  }

  return right(Set(results))
}

/**
 * Filters elements of an iterable using a lambda function.
 *
 * If the lambda function returns an error for any element, the function
 * will return that error immediately.
 *
 * @param ctx - The context in which to evaluate the lambda function.
 * @param elements - The iterable of elements to be filtered.
 * @param lam - The lambda function to apply to each element in the iterable.
 * @returns An array of elements for which the lambda function returns true,
 *          or an error if the lambda function returns an error for any element.
 */
function filterElementsWithLambda(
  ctx: Context,
  elements: Iterable<RuntimeValue>,
  lam: (ctx: Context, args: RuntimeValue[]) => Either<QuintError, RuntimeValue>
): Either<QuintError, RuntimeValue[]> {
  const result = []
  for (const element of elements) {
    const value = lam(ctx, [element])
    if (value.isLeft()) {
      return left(value.value)
    }
    if (value.value.toBool()) {
      result.push(element)
    }
  }
  return right(result)
}

/**
 * Applies a fold (reduce) operation to an iterable using a lambda function.
 *
 * If the lambda function returns an error for any pair of elements, the function
 * will return that error immediately.
 *
 * @param order - The order in which to apply the fold ('fwd' for forward, 'rev' for reverse).
 * @param iterable - The iterable of elements to be folded.
 * @param initial - The initial value for the fold operation.
 * @param lambda - The lambda function to apply to each pair of elements.
 * @returns The accumulated result of applying the lambda function to the elements of the iterable,
 *          or an error if the lambda function returns an error for any pair of elements.
 */
function applyFold(
  order: 'fwd' | 'rev',
  iterable: Iterable<RuntimeValue>,
  initial: RuntimeValue,
  lambda: (args: RuntimeValue[]) => Either<QuintError, RuntimeValue>
): Either<QuintError, RuntimeValue> {
  const reducer = (acc: Either<QuintError, RuntimeValue>, val: RuntimeValue) => {
    return acc.chain(accValue => {
      if (order === 'fwd') {
        return lambda([accValue, val])
      } else {
        return lambda([val, accValue])
      }
    })
  }

  const array = Array.from(iterable)
  if (order === 'fwd') {
    return array.reduce(reducer, right(initial))
  } else {
    return array.reduceRight(reducer, right(initial))
  }
}

/**
 * Accesses an element in a list by its index.
 *
 * @param list - The list of elements.
 * @param idx - The index of the element to access.
 * @returns The element at the specified index, or an error if the index is out of bounds.
 */
function getListElem(list: List<RuntimeValue>, idx: number): Either<QuintError, RuntimeValue> {
  if (idx >= 0n && idx < list.size) {
    const elem = list.get(Number(idx))
    if (elem) {
      return right(elem)
    }
  }

  return left({ code: 'QNT510', message: `Out of bounds, nth(${idx})` })
}
