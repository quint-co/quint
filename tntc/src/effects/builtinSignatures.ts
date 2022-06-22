import { Effect } from './base'
import { parseEffectOrThrow } from './parser'

export type Signature = (arity: number) => Effect

export function getSignatures (): Map<string, Signature> {
  const signatures = new Map<string, Signature>()
  const builtInSignatures = [
    { name: 'Int', effect: 'Pure' },
    { name: 'iadd', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
    { name: 'neq', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
    { name: 'eq', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
    { name: 'of', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
    { name: 'append', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
    { name: 'andAction', effect: '(Read[r1] & Update[u1], Read[r2] & Update[u2]) => Read[r1, r2] & Update[u1, u2]' },
    { name: 'andExpr', effect: '(Read[r1], Read[r2]) => Read[r1, r2]' },
    { name: 'orAction', effect: '(Read[r1] & Update[u], Read[r2] & Update[u]) => Read[r1, r2] & Update[u]' },
    { name: 'assign', effect: '(Read[r1], Read[r2] & Update[u2]) => Read[r2] & Update[r1, u2]' },
    { name: 'guess', effect: '(Read[r1], (Pure) => Read[r2] & Update[u]) => Read[r1, r2] & Update[u]' },
    { name: 'field', effect: '(Read[r], Pure) => Read[r]' },
    { name: 'foldl', effect: '(Read[r1], Read[r2], (Pure, Pure) => Read[r3]) => Read[r1, r2, r3]' },
    { name: 'replaceAt', effect: '(Read[r1], Read[r2], Read[r3]) => Read[r1, r2, r3]' },
  ]
  const multipleAritySignatures = [
    {
      name: 'seq',
      effect: (arity: number) => {
        const rs = Array.from(Array(arity).keys()).map(i => `r${i}`)
        const args = rs.map(r => `Read[${r}]`)
        return parseEffectOrThrow(`(${args.join(', ')}) => Read[${rs.join(', ')}]`)
      },
    },
    {
      name: 'record',
      effect: (arity: number) => {
        const rs = Array.from(Array(arity / 2).keys()).map(i => `r${i}`)
        const args = rs.map(r => `Pure, Read[${r}]`)
        return parseEffectOrThrow(`(${args.join(', ')}) => Read[${rs.join(', ')}]`)
      },
    },
    {
      name: 'match',
      effect: (arity: number) => {
        const rs = Array.from(Array((arity - 1) / 2).keys()).map(i => `r${i}`)
        const args = rs.map(r => `Pure, (Pure) => Read[${r}]`)
        return parseEffectOrThrow(`(Read[r], ${args.join(', ')}) => Read[${rs.join(', ')}]`)
      },
    },
  ]

  builtInSignatures.forEach(sig => signatures.set(sig.name, (_) => parseEffectOrThrow(sig.effect)))
  multipleAritySignatures.forEach(sig => signatures.set(sig.name, sig.effect))

  return signatures
}
