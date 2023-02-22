/* ----------------------------------------------------------------------------------
 * Copyright (c) Informal Systems 2022. All rights reserved.
 * Licensed under the Apache 2.0.
 * See License.txt in the project root for license information.
 * --------------------------------------------------------------------------------- */

/**
 * Effect signatures for built-in operators
 *
 * @author Gabriela Moreira
 *
 * @module
 */

import { EffectScheme, Signature, effectNames } from './base'
import { parseEffectOrThrow } from './parser'
import { simplify } from './simplification'
import { range, times, zip } from 'lodash'

export function getSignatures(): Map<string, Signature> {
  return new Map<string, Signature>(fixedAritySignatures.concat(multipleAritySignatures))
}

const literals = ['Nat', 'Int', 'Bool'].map(name => ({ name, effect: 'Pure' }))

function parseAndQuantify(effectString: string): EffectScheme {
  const e = parseEffectOrThrow(effectString)
  return {
    effect: e,
    ...effectNames(e),
  }
}

const booleanOperators = [
  { name: 'eq', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'neq', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'not', effect: '(Read[r1] & Temporal[t1]) => Read[r1] & Temporal[t1]' },
  { name: 'iff', effect: '(Read[r1] & Temporal[t1], Read[r2] & Temporal[t2]) => Read[r1, r2] & Temporal[t1, t2]' },
  { name: 'implies', effect: '(Read[r1] & Temporal[t1], Read[r2] & Temporal[t2]) => Read[r1, r2] & Temporal[t1, t2]' },
]

const setOperators = [
  { name: 'guess', effect: '(Read[r1], (Read[r1]) => Read[r2] & Update[u]) => Read[r1, r2] & Update[u]' },
  { name: 'exists', effect: '(Read[r1] & Temporal[t1], (Read[r1] & Temporal[t1]) => Read[r2] & Temporal[t2]) => Read[r1, r2] & Temporal[t1, t2]' },
  { name: 'forall', effect: '(Read[r1] & Temporal[t1], (Read[r1] & Temporal[t1]) => Read[r2] & Temporal[t2]) => Read[r1, r2] & Temporal[t1, t2]' },
  { name: 'in', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'contains', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'notin', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'union', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'intersect', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'exclude', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'subseteq', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'filter', effect: '(Read[r1], (Read[r1]) => Read[r2]) => Read[r1, r2]' },
  { name: 'map', effect: '(Read[r1], (Read[r1]) => Read[r2]) => Read[r1, r2]' },
  { name: 'fold', effect: '(Read[r1], Read[r2], (Read[r2], Read[r1]) => Read[r3]) => Read[r1, r2, r3]' },
  { name: 'powerset', effect: '(Read[r1]) => Read[r1]' },
  { name: 'flatten', effect: '(Read[r1]) => Read[r1]' },
  { name: 'allLists', effect: '(Read[r1]) => Read[r1]' },
  { name: 'chooseSome', effect: '(Read[r1]) => Read[r1]' },
  { name: 'oneOf', effect: '(Read[r1]) => Read[r1]' },
  { name: 'isFinite', effect: '(Read[r1]) => Read[r1]' },
  { name: 'size', effect: '(Read[r1]) => Read[r1]' },
]

const mapOperators = [
  { name: 'get', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'keys', effect: '(Read[r1]) => Read[r1]' },
  { name: 'mapBy', effect: '(Read[r1], (Read[r1]) => Read[r2]) => Read[r1, r2]' },
  { name: 'setToMap', effect: '(Read[r1]) => Read[r1]' },
  { name: 'setOfMaps', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'set', effect: '(Read[r1], Read[r2], Read[r3]) => Read[r1, r2, r3]' },
  { name: 'setBy', effect: '(Read[r1], Read[r2], (Read[r1]) => Read[r3]) => Read[r1, r2, r3]' },
  { name: 'put', effect: '(Read[r1], Read[r2], Read[r3]) => Read[r1, r2, r3]' },
]

const recordOperators = [
  // Keys should be pure, as we don't allow dynamic key access.
  { name: 'field', effect: '(Read[r], Pure) => Read[r]' },
  { name: 'fieldNames', effect: '(Read[r]) => Read[r]' },
  { name: 'with', effect: '(Read[r1], Pure, Read[r2]) => Read[r1, r2]' },
]

const tupleOperators = [
  // Indexes for tuples should be pure, as we don't allow dynamic tuple access.
  { name: 'item', effect: '(Read[r1], Pure) => Read[r1]' },
]

const listOperators = [
  { name: 'append', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'concat', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'head', effect: '(Read[r1]) => Read[r1]' },
  { name: 'tail', effect: '(Read[r1]) => Read[r1]' },
  { name: 'length', effect: '(Read[r1]) => Read[r1]' },
  { name: 'nth', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'indices', effect: '(Read[r1]) => Read[r1]' },
  { name: 'replaceAt', effect: '(Read[r1], Read[r2], Read[r3]) => Read[r1, r2, r3]' },
  { name: 'slice', effect: '(Read[r1], Read[r2], Read[r3]) => Read[r1, r2, r3]' },
  { name: 'range', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'select', effect: '(Read[r1], (Read[r1]) => Read[r2]) => Read[r1, r2]' },
  { name: 'foldl', effect: '(Read[r1], Read[r2], (Read[r2], Read[r1]) => Read[r3]) => Read[r1, r2, r3]' },
  { name: 'foldr', effect: '(Read[r1], Read[r2], (Read[r1], Read[r2]) => Read[r3]) => Read[r1, r2, r3]' },
]

const integerOperators = [
  { name: 'iadd', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'isub', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'iuminus', effect: '(Read[r1]) => Read[r1]' },
  { name: 'imul', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'idiv', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'imod', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'ipow', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'ilt', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'igt', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'ilte', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'igte', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'to', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
]

const temporalOperators = [
  { name: 'always', effect: '(Read[r] & Temporal[t]) => Temporal[r, t]' },
  { name: 'eventually', effect: '(Read[r] & Temporal[t]) => Temporal[r, t]' },
  { name: 'next', effect: '(Read[r]) => Temporal[r]' },
  { name: 'orKeep', effect: '(Read[r] & Update[u], Read[v]) => Temporal[r, u, v]' },
  { name: 'mustChange', effect: '(Read[r] & Update[u], Read[v]) => Temporal[r, u, v]' },
  // Enabled: Should we do this? https://github.com/informalsystems/quint/discussions/109
  // Or should the result be temporal?
  { name: 'enabled', effect: '(Read[r1] & Update[u1]) => Read[r1]' },
  { name: 'weakFair', effect: '(Read[r] & Update[u], Read[v]) => Temporal[r, u, v]' },
  { name: 'strongFair', effect: '(Read[r] & Update[u], Read[v]) => Temporal[r, u, v]' },
]

const otherOperators = [
  { name: 'assign', effect: '(Read[r1], Read[r2]) => Read[r2] & Update[r1]' },
  { name: 'then', effect: '(Read[r1] & Update[u], Read[r2] & Update[u]) => Read[r] & Update[u]' },
  { name: 'repeated',
    effect: '(Read[r] & Update[u], Pure) => Read[r] & Update[u]' },
  { name: 'fail',
    effect: '(Read[r] & Update[u]) => Read[r] & Update[u]' },
  { name: 'assert', effect: '(Read[r]) => Read[r]' },
  { name: 'ite', effect: '(Read[r1], Read[r2] & Update[u], Read[r3] & Update[u]) => Read[r1, r2, r3] & Update[u]' },
]

const readManyEffect = (arity: number) => {
  const readVars = times(arity, i => `r${i}`)
  const args = readVars.map(r => `Read[${r}]`)
  return parseAndQuantify(`(${args.join(', ')}) => Read[${readVars.join(', ')}]`)
}

const readAndTemporalManyEffect = (arity: number) => {
  const readVars = times(arity, i => `r${i}`)
  const temporalVars = times(arity, i => `t${i}`)
  const args = zip(readVars, temporalVars).map(([r, t]) => `Read[${r}] & Temporal[${t}]`)
  return parseAndQuantify(`(${args.join(', ')}) => Read[${readVars.join(', ')}] & Temporal[${temporalVars.join(', ')}]`)
}

const multipleAritySignatures: [string, Signature][] = [
  ['List', readManyEffect],
  ['Set', readManyEffect],
  ['Map', readManyEffect],
  ['Rec', readManyEffect],
  ['Tup', readManyEffect],
  ['tuples', readManyEffect],
  ['and', readAndTemporalManyEffect],
  ['or', readAndTemporalManyEffect],
  ['unionMatch', (arity: number) => {
    const readVars = times((arity - 1) / 2, i => `r${i}`)
    const args = readVars.map(r => `Pure, (Pure) => Read[${r}]`)
    return parseAndQuantify(`(Read[r], ${args.join(', ')}) => Read[${readVars.join(', ')}]`)
  }],
  ['actionAll', (arity: number) => {
    const indexes = range(arity)

    const args = indexes.map(i => `Read[r${i}] & Update[u${i}]`)
    const readVars = indexes.map(i => `r${i}`).join(', ')
    const updateVars = indexes.map(i => `u${i}`).join(', ')
    return parseAndQuantify(`(${args.join(', ')}) => Read[${readVars}] & Update[${updateVars}]`)
  }],
  ['actionAny', (arity: number) => {
    const indexes = range(arity)

    const args = indexes.map(i => `Read[r${i}] & Update[u]`)
    const readVars = indexes.map(i => `r${i}`).join(', ')
    return parseAndQuantify(`(${args.join(', ')}) => Read[${readVars}] & Update[u]`)
  }],
]

const fixedAritySignatures: [string, Signature][] = [
  literals,
  booleanOperators,
  setOperators,
  mapOperators,
  recordOperators,
  tupleOperators,
  listOperators,
  integerOperators,
  temporalOperators,
  otherOperators,
].flat().map(sig => [sig.name, ((_: number) => {
  const e = parseEffectOrThrow(sig.effect)
  const simplifiedEffect = simplify(e)
  return { ...effectNames(simplifiedEffect), effect: simplifiedEffect }
}) as Signature])
