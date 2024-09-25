/* ----------------------------------------------------------------------------------
 * Copyright 2022 Informal Systems
 * Licensed under the Apache License, Version 2.0.
 * See LICENSE in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Type signatures for built-in operators
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { parseTypeOrThrow } from './parser'
import { typeNames } from '../ir/quintTypes'
import { Signature, TypeScheme } from './base'
import { times } from 'lodash'
import { QuintBuiltinOpcode } from '../ir/quintIr'

export function getSignatures(): Map<string, Signature> {
  return new Map<string, Signature>(fixedAritySignatures.concat(multipleAritySignatures))
}

// NOTE: Signatures operations over products (records and tuples) and sums
// (enums/disjoint unions/variants) cannot be precisely defined with this
// syntax, because they are "exotic", in the sense that they represent basic
// language constructions that cannot be represented in the type system of the
// language itself.
//
// Their types are handled directly with constraints in specialConstraints.ts.

const literals = [
  { name: 'Nat', type: 'Set[int]' },
  { name: 'Int', type: 'Set[int]' },
  { name: 'Bool', type: 'Set[bool]' },
]

const booleanOperators = [
  { name: 'eq', type: '(a, a) => bool' },
  { name: 'neq', type: '(a, a) => bool' },
  { name: 'iff', type: '(bool, bool) => bool' },
  { name: 'implies', type: '(bool, bool) => bool' },
  { name: 'not', type: '(bool) => bool' },
]

const setOperators = [
  { name: 'exists', type: '(Set[a], (a) => bool) => bool' },
  { name: 'forall', type: '(Set[a], (a) => bool) => bool' },
  { name: 'in', type: '(a, Set[a]) => bool' },
  { name: 'contains', type: '(Set[a], a) => bool' },
  { name: 'union', type: '(Set[a], Set[a]) => Set[a]' },
  { name: 'intersect', type: '(Set[a], Set[a]) => Set[a]' },
  { name: 'exclude', type: '(Set[a], Set[a]) => Set[a]' },
  { name: 'subseteq', type: '(Set[a], Set[a]) => bool' },
  { name: 'filter', type: '(Set[a], (a) => bool) => Set[a]' },
  { name: 'map', type: '(Set[a], (a) => b) => Set[b]' },
  { name: 'fold', type: '(Set[a], b, (b, a) => b) => b' },
  { name: 'powerset', type: '(Set[a]) => Set[Set[a]]' },
  { name: 'flatten', type: '(Set[Set[a]]) => Set[a]' },
  { name: 'allLists', type: '(Set[a]) => Set[List[a]]' },
  { name: 'allListsUpTo', type: '(Set[a], int) => Set[List[a]]' },
  { name: 'chooseSome', type: '(Set[a]) => a' },
  { name: 'oneOf', type: '(Set[a]) => a' },
  { name: 'isFinite', type: '(Set[a]) => bool' },
  { name: 'size', type: '(Set[a]) => int' },
]

const mapOperators = [
  { name: 'get', type: '(a -> b, a) => b' },
  { name: 'keys', type: '(a -> b) => Set[a]' },
  { name: 'mapBy', type: '(Set[a], (a) => b) => a -> b' },
  { name: 'setToMap', type: '(Set[(a, b)]) => (a -> b)' },
  { name: 'setOfMaps', type: '(Set[a], Set[b]) => Set[a -> b]' },
  { name: 'set', type: '(a -> b, a, b) => a -> b' },
  { name: 'setBy', type: '(a -> b, a, (b) => b) => a -> b' },
  { name: 'put', type: '(a -> b, a, b) => a -> b' },
]

const listOperators = [
  { name: 'append', type: '(List[a], a) => List[a]' },
  { name: 'concat', type: '(List[a], List[a]) => List[a]' },
  { name: 'head', type: '(List[a]) => a' },
  { name: 'tail', type: '(List[a]) => List[a]' },
  { name: 'length', type: '(List[a]) => int' },
  { name: 'nth', type: '(List[a], int) => a' },
  { name: 'indices', type: '(List[a]) => Set[int]' },
  { name: 'replaceAt', type: '(List[a], int, a) => List[a]' },
  { name: 'slice', type: '(List[a], int, int) => List[a]' },
  { name: 'range', type: '(int, int) => List[int]' },
  { name: 'select', type: '(List[a], (a) => bool) => List[a]' },
  { name: 'foldl', type: '(List[a], b, (b, a) => b) => b' },
  { name: 'foldr', type: '(List[a], b, (a, b) => b) => b' },
]

const integerOperators = [
  { name: 'iadd', type: '(int, int) => int' },
  { name: 'isub', type: '(int, int) => int' },
  { name: 'imul', type: '(int, int) => int' },
  { name: 'idiv', type: '(int, int) => int' },
  { name: 'imod', type: '(int, int) => int' },
  { name: 'ipow', type: '(int, int) => int' },
  { name: 'ilt', type: '(int, int) => bool' },
  { name: 'igt', type: '(int, int) => bool' },
  { name: 'ilte', type: '(int, int) => bool' },
  { name: 'igte', type: '(int, int) => bool' },
  { name: 'to', type: '(int, int) => Set[int]' },
  { name: 'iuminus', type: '(int) => int' },
  { name: 'generate', type: '(int, a) => a' },
]
const temporalOperators = [
  { name: 'always', type: '(bool) => bool' },
  { name: 'eventually', type: '(bool) => bool' },
  { name: 'next', type: '(a) => a' },
  { name: 'orKeep', type: '(bool, a) => bool' },
  { name: 'mustChange', type: '(bool, a) => bool' },
  // Should we do this? https://github.com/informalsystems/quint/discussions/109
  { name: 'enabled', type: '(bool) => bool' },
  { name: 'weakFair', type: '(bool, a) => bool' },
  { name: 'strongFair', type: '(bool, a) => bool' },
]

const otherOperators = [
  { name: 'assign', type: '(a, a) => bool' },
  { name: 'ite', type: '(bool, a, a) => a' },
  { name: 'then', type: '(bool, bool) => bool' },
  { name: 'expect', type: '(bool, bool) => bool' },
  { name: 'reps', type: '(int, int => bool) => bool' },
  { name: 'fail', type: '(bool) => bool' },
  { name: 'assert', type: '(bool) => bool' },
  { name: 'q::debug', type: '(str, a) => a' },
  { name: 'q::lastTrace', type: 'List[a]' },
  { name: 'q::test', type: '(int, int, int, bool, bool, bool) => bool' },
  { name: 'q::testOnce', type: '(int, int, bool, bool, bool) => bool' },
]

function uniformArgsWithResult(argsType: string, resultType: string): Signature {
  return (arity: number) => {
    const args = times(arity, () => argsType)
    return parseAndQuantify(`(${args.join(', ')}) => ${resultType}`)
  }
}

const multipleAritySignatures: [QuintBuiltinOpcode, Signature][] = [
  ['List', uniformArgsWithResult('a', 'List[a]')],
  ['Set', uniformArgsWithResult('a', 'Set[a]')],
  ['Map', uniformArgsWithResult('(a, b)', 'a -> b')],
  ['and', uniformArgsWithResult('bool', 'bool')],
  ['actionAll', uniformArgsWithResult('bool', 'bool')],
  ['or', uniformArgsWithResult('bool', 'bool')],
  ['actionAny', uniformArgsWithResult('bool', 'bool')],
  [
    'matchVariant',
    (arity: number) => {
      const args = times((arity - 1) / 2, () => 'str, (a) => b')
      return parseAndQuantify(`(a, ${args.join(', ')}) => b`)
    },
  ],
  [
    'tuples',
    (arity: number) => {
      const ts = times(arity, i => `t${i}`)
      const args = ts.map(t => `Set[${t}]`)
      const tupleType = `(${ts.join(', ')})`
      return parseAndQuantify(`(${args.join(', ')}) => Set[${tupleType}]`)
    },
  ],
]

const fixedAritySignatures: [string, Signature][] = [
  literals,
  booleanOperators,
  setOperators,
  mapOperators,
  listOperators,
  integerOperators,
  temporalOperators,
  otherOperators,
]
  .flat()
  .map(sig => [sig.name, (_: number) => parseAndQuantify(sig.type)])

function parseAndQuantify(typeString: string): TypeScheme {
  const t = parseTypeOrThrow(typeString)
  return {
    type: t,
    ...typeNames(t),
  }
}
