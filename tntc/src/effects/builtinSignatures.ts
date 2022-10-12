import { Signature } from './base'
import { parseEffectOrThrow } from './parser'
import { effectToString } from './printing'
import { simplify } from './simplification'

export function getSignatures (): Map<string, Signature> {
  return new Map<string, Signature>(fixedAritySignatures.concat(multipleAritySignatures))
}

const literals = ['Nat', 'Int', 'Bool'].map(name => ({ name: name, effect: 'Pure' }))
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
  { name: 'fold', effect: '(Read[r1], Read[r2], (Read[r2], Read[r1]) => Read[r3, r4]) => Read[r1, r2, r3, r4]' },
  { name: 'powerset', effect: '(Read[r1]) => Read[r1]' },
  { name: 'flatten', effect: '(Read[r1]) => Read[r1]' },
  { name: 'allLists', effect: '(Read[r1]) => Read[r1]' },
  { name: 'choose_some', effect: '(Read[r1]) => Read[r1]' },
  { name: 'isFinite', effect: '(Read[r1]) => Read[r1]' },
  { name: 'cardinality', effect: '(Read[r1]) => Read[r1]' },
]

const mapOperators = [
  { name: 'get', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'keys', effect: '(Read[r1]) => Read[r1]' },
  { name: 'mapOf', effect: '(Read[r1], (Read[r1]) => Read[r2]) => Read[r1, r2]' },
  { name: 'setToMap', effect: '(Read[r1]) => Read[r1]' },
  { name: 'setOfMaps', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'update', effect: '(Read[r1], Read[r2], Read[r3]) => Read[r1, r2, r3]' },
  { name: 'updateAs', effect: '(Read[r1], Read[r2], (Read[r1]) => Read[r3]) => Read[r1, r2, r3]' },
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
  { name: 'stutter', effect: '(Read[r] & Update[u], Read[v]) => Temporal[r, u, v]' },
  { name: 'nostutter', effect: '(Read[r] & Update[u], Read[v]) => Temporal[r, u, v]' },
  // Enabled: Should we do this? https://github.com/informalsystems/tnt/discussions/109
  // Or should the result be temporal?
  { name: 'enabled', effect: '(Read[r1] & Update[u1]) => Read[r1]' },
  { name: 'weakFair', effect: '(Read[r] & Update[u], Read[v]) => Temporal[r, u, v]' },
  { name: 'strongFair', effect: '(Read[r] & Update[u], Read[v]) => Temporal[r, u, v]' },
]

const otherOperators = [
  { name: 'assign', effect: '(Read[r1], Read[r2]) => Read[r2] & Update[r1]' },
  { name: 'ite', effect: '(Read[r1], Read[r2] & Update[u], Read[r3] & Update[u]) => Read[r1, r2, r3] & Update[u]' },
]

const readManyEffect = (arity: number) => {
  const rs = Array.from(Array(arity).keys()).map(i => `r${i}`)
  const ts = Array.from(Array(arity).keys()).map(i => `tr${i}`)
  const args = rs.map(r => `Read[${r}] & Temporal[t${r}]`)
  return parseEffectOrThrow(`(${args.join(', ')}) => Read[${rs.join(', ')}] & Temporal[${ts.join(', ')}]`)
}
const multipleAritySignatures: [string, Signature][] = [
  ['list', readManyEffect],
  ['set', readManyEffect],
  ['rec', readManyEffect],
  ['tup', readManyEffect],
  ['tuples', readManyEffect],
  ['and', readManyEffect],
  ['or', readManyEffect],
  ['match', (arity: number) => {
    const rs = Array.from(Array((arity - 1) / 2).keys()).map(i => `r${i}`)
    const args = rs.map(r => `Pure, (Pure) => Read[${r}]`)
    return parseEffectOrThrow(`(Read[r], ${args.join(', ')}) => Read[${rs.join(', ')}]`)
  }],
  ['actionAll', (arity: number) => {
    const indexes = Array.from(Array(arity).keys())

    const args = indexes.map(i => `Read[r${i}] & Update[u${i}]`)
    const rs = indexes.map(i => `r${i}`).join(', ')
    const us = indexes.map(i => `u${i}`).join(', ')
    return parseEffectOrThrow(`(${args.join(', ')}) => Read[${rs}] & Update[${us}]`)
  }],
  ['actionAny', (arity: number) => {
    const indexes = Array.from(Array(arity).keys())

    const args = indexes.map(i => `Read[r${i}] & Update[u]`)
    const rs = indexes.map(i => `r${i}`).join(', ')
    return parseEffectOrThrow(`(${args.join(', ')}) => Read[${rs}] & Update[u]`)
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
  const simplified = simplify(e)
  if (simplified.isRight()) {
    return simplified.value
  } else {
    throw new Error(`Couldn't simplify builtin effect: ${effectToString(e)}`)
  }
}) as Signature])
