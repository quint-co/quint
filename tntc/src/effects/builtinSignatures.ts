import { Effect } from './base'
import { parseEffectOrThrow } from './parser'

export type Signature = (arity: number) => Effect

export function getSignatures (): Map<string, Signature> {
  const signatures = new Map<string, Signature>()
  const builtInSignatures = [
    { name: 'Int', effect: 'Pure' },
    { name: 'iadd', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
    { name: 'not', effect: '(Read[r1]) => Read[r1]' },
    { name: 'neq', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
    { name: 'eq', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
    { name: 'of', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
    { name: 'append', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
    { name: 'andExpr', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
    { name: 'orAction', effect: '(Read[r1] & Update[u], Read[r2] & Update[u]) => Read[r1, r2] & Update[u]' },
    { name: 'assign', effect: '(Read[r1], Read[r2] & Update[u2]) => Read[r2] & Update[r1, u2]' },
    { name: 'guess', effect: '(Read[r1], (Pure) => Read[r2] & Update[u]) => Read[r1, r2] & Update[u]' },
    { name: 'ite', effect: '(Read[r1], Read[r2] & Update[u], Read[r3] & Update[u]) => Read[r1, r2, r3] & Update[u]' },
    { name: 'exists', effect: '(Read[r1], (Pure) => Read[r2]) => Read[r1, r2]' },
    { name: 'forall', effect: '(Read[r1], (Pure) => Read[r2]) => Read[r1, r2]' },
    { name: 'field', effect: '(Read[r], Pure) => Read[r]' },
    { name: 'foldl', effect: '(Read[r1], Read[r2], (Pure, Pure) => Read[r3]) => Read[r1, r2, r3]' },
    { name: 'replaceAt', effect: '(Read[r1], Read[r2], Read[r3]) => Read[r1, r2, r3]' },
    { name: 'mapOf', effect: '(Read[r1], (Pure) => Read[r2]) => Read[r1, r2]' },
    { name: 'filter', effect: '(Read[r1], (Pure) => Read[r2]) => Read[r1, r2]' },
    { name: 'to', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
    { name: 'item', effect: '(Read[r1], Pure) => Read[r1]' },
    // Should we do this? https://github.com/informalsystems/tnt/discussions/109
    { name: 'enabled', effect: '(Read[r1] & Update[u1]) => Read[r1]' },
  ]

  const readManyEffect = (arity: number) => {
    const rs = Array.from(Array(arity).keys()).map(i => `r${i}`)
    const args = rs.map(r => `Read[${r}]`)
    return parseEffectOrThrow(`(${args.join(', ')}) => Read[${rs.join(', ')}]`)
  }
  const multipleAritySignatures = [
    {
      name: 'seq',
      effect: readManyEffect,
    },
    {
      name: 'set',
      effect: readManyEffect,
    },
    {
      name: 'record',
      effect: readManyEffect,
    },
    {
      name: 'tuple',
      effect: readManyEffect,
    },
    {
      name: 'tuples',
      effect: readManyEffect,
    },
    {
      name: 'match',
      effect: (arity: number) => {
        const rs = Array.from(Array((arity - 1) / 2).keys()).map(i => `r${i}`)
        const args = rs.map(r => `Pure, (Pure) => Read[${r}]`)
        return parseEffectOrThrow(`(Read[r], ${args.join(', ')}) => Read[${rs.join(', ')}]`)
      },
    },
    {
      name: 'andAction',
      effect: (arity: number) => {
        const indexes = Array.from(Array(arity).keys())

        const args = indexes.map(i => `Read[r${i}] & Update[u${i}]`)
        const rs = indexes.map(i => `r${i}`).join(', ')
        const us = indexes.map(i => `u${i}`).join(', ')
        return parseEffectOrThrow(`(${args.join(', ')}) => Read[${rs}] & Update[${us}]`)
      }
    },
  ]

  builtInSignatures.forEach(sig => signatures.set(sig.name, (_) => parseEffectOrThrow(sig.effect)))
  multipleAritySignatures.forEach(sig => signatures.set(sig.name, sig.effect))

  return signatures
}
