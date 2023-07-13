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

import { ComponentKind, Effect, EffectComponent, EffectScheme, Entity, Signature, effectNames, toScheme } from './base'
import { parseEffectOrThrow } from './parser'
import { range, times } from 'lodash'

export function getSignatures(): Map<string, Signature> {
  return new Map<string, Signature>(fixedAritySignatures.concat(multipleAritySignatures))
}

function parseAndQuantify(effectString: string): EffectScheme {
  const e = parseEffectOrThrow(effectString)
  return { effect: e, ...effectNames(e) }
}

/** Generate a name for an entity variable of certain component kind:
 * r0, r1, r2, ... for read components
 * t0, t1, t2, ... for temporal components
 * u0, u1, u2, ... for update components
 */
function nameForVariable(kind: ComponentKind, i: number) {
  const prefixByComponentKind = new Map<ComponentKind, string>([
    ['read', 'r'],
    ['temporal', 't'],
    ['update', 'u'],
  ])

  return `${prefixByComponentKind.get(kind)!}${i}`
}

/**
 * Builds a signature that propagates components of the given kinds
 *
 * Example: propagateComponents(['read', 'temporal'])(2) results in
 * (Read[r1] & Temporal[t1], Read[r2] & Temporal[t2]) => Read[r1, r2] & Temporal[t1, t2]
 *
 * @param kinds the kinds of components to propagate
 * @returns an arrow function taking arity and returning the effect for that arity
 */
function propagateComponents(kinds: ComponentKind[]): (arity: number) => EffectScheme {
  return (arity: number) => {
    const params: Effect[] = times(arity, i => {
      const components: EffectComponent[] = kinds.map(kind => {
        return { kind: kind, entity: { kind: 'variable', name: nameForVariable(kind, i + 1) } }
      })

      return { kind: 'concrete', components: components }
    })

    const resultComponents: EffectComponent[] = kinds.map(kind => {
      const names = times(arity, i => nameForVariable(kind, i + 1))
      const entities: Entity[] = names.map(name => ({ kind: 'variable', name }))
      return { kind: kind, entity: { kind: 'union', entities } }
    })

    const result: Effect = { kind: 'concrete', components: resultComponents }
    const effect: Effect = { kind: 'arrow', params: params, result: result }

    return { effect, ...effectNames(effect) }
  }
}

/**
 * Builds a signature that propagates components of the given kinds, including a lambda parameter
 * for the last argument
 *
 * Used in operators like `map`, `filter` and `fold`
 *
 * Example: propagationWithLambda(['read', 'temporal'])(2) results in
 * (Read[r1] & Temporal[t1], (Read[r1] & Temporal[t1]) => Read[r2] & Temporal[t2]) => Read[r1, r2] & Temporal[t1, t2]
 *
 * @param kinds the kinds of components to propagate
 * @returns an arrow function taking arity and returning the effect for that arity
 */
function propagationWithLambda(kinds: ComponentKind[]): (arity: number) => EffectScheme {
  return (arity: number) => {
    const params: Effect[] = times(arity - 1, i => {
      const components: EffectComponent[] = kinds.map(kind => {
        return { kind: kind, entity: { kind: 'variable', name: nameForVariable(kind, i + 1) } }
      })

      return { kind: 'concrete', components: components }
    })

    const lambdaResult: Effect = {
      kind: 'concrete',
      components: kinds.map(kind => {
        return { kind: kind, entity: { kind: 'variable', name: nameForVariable(kind, arity) } }
      }),
    }

    const lambda: Effect = { kind: 'arrow', params, result: lambdaResult }

    const resultComponents: EffectComponent[] = kinds.map(kind => {
      const names = times(arity, i => nameForVariable(kind, i + 1))
      const entities: Entity[] = names.map(name => ({ kind: 'variable', name }))
      return { kind: kind, entity: { kind: 'union', entities } }
    })

    const result: Effect = { kind: 'concrete', components: resultComponents }

    const effect: Effect = { kind: 'arrow', params: params.concat(lambda), result }
    return { effect, ...effectNames(effect) }
  }
}

export const standardPropagation = propagateComponents(['read', 'temporal'])

const literals = ['Nat', 'Int', 'Bool'].map(name => ({ name, effect: toScheme({ kind: 'concrete', components: [] }) }))
const booleanOperators = [
  { name: 'eq', effect: standardPropagation(2) },
  { name: 'neq', effect: standardPropagation(2) },
  { name: 'not', effect: standardPropagation(1) },
  { name: 'iff', effect: standardPropagation(2) },
  { name: 'implies', effect: standardPropagation(2) },
]

const setOperators = [
  { name: 'exists', effect: propagationWithLambda(['read', 'temporal'])(2) },
  { name: 'forall', effect: propagationWithLambda(['read', 'temporal'])(2) },
  { name: 'in', effect: standardPropagation(2) },
  { name: 'contains', effect: standardPropagation(2) },
  { name: 'union', effect: standardPropagation(2) },
  { name: 'intersect', effect: standardPropagation(2) },
  { name: 'exclude', effect: standardPropagation(2) },
  { name: 'subseteq', effect: standardPropagation(2) },
  { name: 'filter', effect: propagationWithLambda(['read', 'temporal'])(2) },
  { name: 'map', effect: propagationWithLambda(['read', 'temporal'])(2) },
  { name: 'fold', effect: propagationWithLambda(['read', 'temporal'])(3) },
  { name: 'powerset', effect: standardPropagation(1) },
  { name: 'flatten', effect: standardPropagation(1) },
  { name: 'allLists', effect: standardPropagation(1) },
  { name: 'chooseSome', effect: standardPropagation(1) },
  { name: 'oneOf', effect: standardPropagation(1) },
  { name: 'isFinite', effect: standardPropagation(1) },
  { name: 'size', effect: standardPropagation(1) },
]

const mapOperators = [
  { name: 'get', effect: standardPropagation(2) },
  { name: 'keys', effect: standardPropagation(1) },
  { name: 'mapBy', effect: propagationWithLambda(['read', 'temporal'])(2) },
  { name: 'setToMap', effect: standardPropagation(1) },
  { name: 'setOfMaps', effect: standardPropagation(2) },
  { name: 'set', effect: standardPropagation(3) },
  { name: 'setBy', effect: parseAndQuantify('(Read[r1], Read[r2], (Read[r1]) => Read[r3]) => Read[r1, r2, r3]') },
  { name: 'put', effect: standardPropagation(3) },
]

const recordOperators = [
  // Keys should be pure, as we don't allow dynamic key access.
  { name: 'field', effect: parseAndQuantify('(Read[r], Pure) => Read[r]') },
  { name: 'fieldNames', effect: parseAndQuantify('(Read[r]) => Read[r]') },
  { name: 'with', effect: parseAndQuantify('(Read[r1], Pure, Read[r2]) => Read[r1, r2]') },
]

const tupleOperators = [
  // Indexes for tuples should be pure, as we don't allow dynamic tuple access.
  { name: 'item', effect: parseAndQuantify('(Read[r1], Pure) => Read[r1]') },
]

const listOperators = [
  { name: 'append', effect: standardPropagation(2) },
  { name: 'concat', effect: standardPropagation(2) },
  { name: 'head', effect: standardPropagation(1) },
  { name: 'tail', effect: standardPropagation(1) },
  { name: 'length', effect: standardPropagation(1) },
  { name: 'nth', effect: standardPropagation(2) },
  { name: 'indices', effect: standardPropagation(1) },
  { name: 'replaceAt', effect: standardPropagation(3) },
  { name: 'slice', effect: standardPropagation(3) },
  { name: 'range', effect: standardPropagation(2) },
  { name: 'select', effect: propagationWithLambda(['read', 'temporal'])(2) },
  { name: 'foldl', effect: propagationWithLambda(['read', 'temporal'])(3) },
  { name: 'foldr', effect: propagationWithLambda(['read', 'temporal'])(3) },
]

const integerOperators = [
  { name: 'iadd', effect: standardPropagation(2) },
  { name: 'isub', effect: standardPropagation(2) },
  { name: 'iuminus', effect: standardPropagation(1) },
  { name: 'imul', effect: standardPropagation(2) },
  { name: 'idiv', effect: standardPropagation(2) },
  { name: 'imod', effect: standardPropagation(2) },
  { name: 'ipow', effect: standardPropagation(2) },
  { name: 'ilt', effect: standardPropagation(2) },
  { name: 'igt', effect: standardPropagation(2) },
  { name: 'ilte', effect: standardPropagation(2) },
  { name: 'igte', effect: standardPropagation(2) },
  { name: 'to', effect: standardPropagation(2) },
]

const temporalOperators = [
  { name: 'always', effect: parseAndQuantify('(Read[r] & Temporal[t]) => Temporal[r, t]') },
  { name: 'eventually', effect: parseAndQuantify('(Read[r] & Temporal[t]) => Temporal[r, t]') },
  { name: 'next', effect: parseAndQuantify('(Read[r]) => Temporal[r]') },
  { name: 'orKeep', effect: parseAndQuantify('(Read[r] & Update[u], Read[v]) => Temporal[r, u, v]') },
  { name: 'mustChange', effect: parseAndQuantify('(Read[r] & Update[u], Read[v]) => Temporal[r, u, v]') },
  // Enabled: Should we do this? https://github.com/informalsystems/quint/discussions/109
  // Or should the result be temporal?
  { name: 'enabled', effect: parseAndQuantify('(Read[r1] & Update[u1]) => Read[r1]') },
  { name: 'weakFair', effect: parseAndQuantify('(Read[r] & Update[u], Read[v]) => Temporal[r, u, v]') },
  { name: 'strongFair', effect: parseAndQuantify('(Read[r] & Update[u], Read[v]) => Temporal[r, u, v]') },
]

const otherOperators = [
  { name: 'assign', effect: parseAndQuantify('(Read[r1], Read[r2]) => Read[r2] & Update[r1]') },
  { name: 'then', effect: parseAndQuantify('(Read[r1] & Update[u], Read[r2] & Update[u]) => Read[r] & Update[u]') },
  { name: 'reps', effect: parseAndQuantify('(Pure, (Read[r1]) => Read[r2] & Update[u]) => Read[r1, r2] & Update[u]') },
  { name: 'fail', effect: propagateComponents(['read', 'update'])(1) },
  { name: 'assert', effect: propagateComponents(['read'])(1) },
  {
    name: 'ite',
    effect: parseAndQuantify('(Read[r1], Read[r2] & Update[u], Read[r3] & Update[u]) => Read[r1, r2, r3] & Update[u]'),
  },
]

const multipleAritySignatures: [string, Signature][] = [
  ['List', standardPropagation],
  ['Set', standardPropagation],
  ['Map', standardPropagation],
  ['Rec', standardPropagation],
  ['Tup', standardPropagation],
  ['tuples', standardPropagation],
  ['and', standardPropagation],
  ['or', standardPropagation],
  [
    'unionMatch',
    (arity: number) => {
      const readVars = times((arity - 1) / 2, i => `r${i}`)
      const args = readVars.map(r => `Pure, (Pure) => Read[${r}]`)
      return parseAndQuantify(`(Read[r], ${args.join(', ')}) => Read[${readVars.join(', ')}]`)
    },
  ],
  [
    'actionAll',
    (arity: number) => {
      const indexes = range(arity)

      const args = indexes.map(i => `Read[r${i}] & Update[u${i}]`)
      const readVars = indexes.map(i => `r${i}`).join(', ')
      const updateVars = indexes.map(i => `u${i}`).join(', ')
      return parseAndQuantify(`(${args.join(', ')}) => Read[${readVars}] & Update[${updateVars}]`)
    },
  ],
  ['actionAll', propagateComponents(['read', 'update'])],
  [
    'actionAny',
    (arity: number) => {
      const indexes = range(arity)

      const args = indexes.map(i => `Read[r${i}] & Update[u]`)
      const readVars = indexes.map(i => `r${i}`).join(', ')
      return parseAndQuantify(`(${args.join(', ')}) => Read[${readVars}] & Update[u]`)
    },
  ],
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
]
  .flat()
  .map(sig => [
    sig.name,
    (_: number) => {
      return sig.effect
    },
  ])
