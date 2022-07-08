import { Effect } from './base'
import { parseEffectOrThrow } from './parser'

export type Signature = (arity: number) => Effect

export function getSignatures (): Map<string, Signature> {
  return new Map<string, Signature>(fixedAritySignatures.concat(multipleAritySignatures))
}

const fixedAritySignatures = [literals, booleanOperators, setOperators, mapOperators, recordOperators, tupleOperators, listOperators, integerOperators, otherOperators]
  .flatMap(sig => [sig.name, (_) => parseEffectOrThrow(sig.effect)]) as const

const literals = ['Nat', 'Int', 'Bool'].map(name => ({ name: name, effect: 'Pure' }))
const booleanOperators = [
  { name: 'eq', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'neq', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'not', effect: '(Read[r1]) => Read[r1]' },
  { name: 'and', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'or', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'iff', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'implies', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
]

const setOperators = [
  { name: 'guess', effect: '(Read[r1], (Read[p]) => Read[r2] & Update[u]) => Read[r1, p, r2] & Update[u]' },
  { name: 'exists', effect: '(Read[r1], (Read[p]) => Read[r2]) => Read[r1, p, r2]' },
  { name: 'forall', effect: '(Read[r1], (Read[p]) => Read[r2]) => Read[r1, p, r2]' },
  { name: 'in', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'contains', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'notin', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'union', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'intersect', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'exclude', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'subseteq', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'filter', effect: '(Read[r1], (Read[p]) => Read[r2]) => Read[r1, p, r2]' },
  { name: 'map', effect: '(Read[r1], (Read[p]) => Read[r2]) => Read[r1, p, r2]' },
  { name: 'foldl', effect: '(Read[r1], Read[r2], (Read[p1], Read[p2]) => Read[p1, p2]) => Read[r1, r2, p1, p2]' },
  { name: 'powerset', effect: '(Read[r1]) => Read[r1]' },
  { name: 'flatten', effect: '(Read[r1]) => Read[r1]' },
  { name: 'seqs', effect: '(Read[r1]) => Read[r1]' },
  { name: 'choose_some', effect: '(Read[r1]) => Read[r1]' },
  { name: 'isFinite', effect: '(Read[r1]) => Read[r1]' },
  { name: 'cardinality', effect: '(Read[r1]) => Read[r1]' },
]

const mapOperators = [
  { name: 'get', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'keys', effect: '(Read[r1]) => Read[r1]' },
  { name: 'mapOf', effect: '(Read[r1], (Read[p]) => Read[r2]) => Read[r1, p, r2]' },
  { name: 'setOfMaps', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
  { name: 'update', effect: '(Read[r1], Read[r2], Read[r3]) => Read[r1, r2, r3]' },
  { name: 'updateAs', effect: '(Read[r1], Read[r2], (Read[p]) => Read[r3]) => Read[r1, r2, p, r3]' },
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
  { name: 'select', effect: '(Read[r1], (Read[p]) => Read[r2]) => Read[r1, p, r2]' },
  { name: 'foldl', effect: '(Read[r1], Read[r2], (Read[p1], Read[p2]) => Read[r3]) => Read[r1, r2, p1, p2 r3]' },
  { name: 'foldr', effect: '(Read[r1], Read[r2], (Read[p1], Read[p2]) => Read[r3]) => Read[r1, r2, p1, p2 r3]' },
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

const otherOperators = [
  { name: 'assign', effect: '(Read[r1], Read[r2] & Update[u2]) => Read[r2] & Update[r1, u2]' },
  { name: 'ite', effect: '(Read[r1], Read[r2] & Update[u], Read[r3] & Update[u]) => Read[r1, r2, r3] & Update[u]' },
  // Should we do this? https://github.com/informalsystems/tnt/discussions/109
  { name: 'enabled', effect: '(Read[r1] & Update[u1]) => Read[r1]' },
]

const readManyEffect = (arity: number) => {
  const rs = Array.from(Array(arity).keys()).map(i => `r${i}`)
  const args = rs.map(r => `Read[${r}]`)
  return parseEffectOrThrow(`(${args.join(', ')}) => Read[${rs.join(', ')}]`)
}
const multipleAritySignatures = [
  ['seq', readManyEffect],
  ['set', readManyEffect],
  ['record', readManyEffect],
  ['tuple', readManyEffect],
  ['tuples', readManyEffect],
  ['andExpr', readManyEffect],
  ['orExpr', readManyEffect],
  ['match', (arity: number) => {
    const rs = Array.from(Array((arity - 1) / 2).keys()).map(i => `r${i}`)
    const args = rs.map(r => `Pure, (Read[p]) => Read[p, ${r}]`)
    return parseEffectOrThrow(`(Read[r], ${args.join(', ')}) => Read[${rs.join(', ')}]`)
  }],
  ['andAction', (arity: number) => {
    const indexes = Array.from(Array(arity).keys())

    const args = indexes.map(i => `Read[r${i}] & Update[u${i}]`)
    const rs = indexes.map(i => `r${i}`).join(', ')
    const us = indexes.map(i => `u${i}`).join(', ')
    return parseEffectOrThrow(`(${args.join(', ')}) => Read[${rs}] & Update[${us}]`)
  }],
  ['orAction', (arity: number) => {
    const indexes = Array.from(Array(arity).keys())

    const args = indexes.map(i => `Read[r${i}] & Update[u]`)
    const rs = indexes.map(i => `r${i}`).join(', ')
    return parseEffectOrThrow(`(${args.join(', ')}) => Read[${rs}] & Update[u]`)
  }],
]
