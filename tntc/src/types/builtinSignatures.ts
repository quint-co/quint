import { parseTypeOrThrow } from './parser'
import { typeNames } from '../tntTypes'
import { Signature, TypeScheme } from './base'

export function getSignatures (): Map<string, Signature> {
  return new Map<string, Signature>(fixedAritySignatures.concat(multipleAritySignatures))
}

const literals = [
  { name: 'Nat', type: 'set(int)' },
  { name: 'Int', type: 'set(int)' },
  { name: 'Bool', type: 'set(bool)' },
]

const booleanOperators = [
  { name: 'eq', type: '(a, a) => bool' },
  { name: 'neq', type: '(a, a) => bool' },
  { name: 'iff', type: '(bool, bool) => bool' },
  { name: 'implies', type: '(bool, bool) => bool' },
  { name: 'not', type: '(bool) => bool' },
]

const setOperators = [
  { name: 'guess', type: '(set(a), (a) => bool) => bool' },
  { name: 'exists', type: '(set(a), (a) => bool) => bool' },
  { name: 'forall', type: '(set(a), (a) => bool) => bool' },
  { name: 'in', type: '(a, set(a)) => bool' },
  { name: 'contains', type: '(set(a), a) => bool' },
  { name: 'notin', type: '(a, set(a)) => bool' },
  { name: 'union', type: '(set(a), set(a)) => set(a)' },
  { name: 'intersect', type: '(set(a), set(a)) => set(a)' },
  { name: 'exclude', type: '(set(a), set(a)) => set(a)' },
  { name: 'subseteq', type: '(set(a), set(a)) => bool' },
  { name: 'filter', type: '(set(a), (a) => bool) => set(a)' },
  { name: 'map', type: '(set(a), (a) => b) => set(b)' },
  { name: 'fold', type: '(set(a), b, (b, a) => b) => b' },
  { name: 'powerset', type: '(set(a)) => set(set(a))' },
  { name: 'flatten', type: '(set(set(a))) => set(a)' },
  { name: 'allLists', type: '(set(a)) => list(a)' },
  { name: 'choose_some', type: '(set(a)) => a' },
  { name: 'isFinite', type: '(set(a)) => bool' },
  { name: 'size', type: '(set(a)) => int' },
]

const mapOperators = [
  { name: 'get', type: '(a -> b, a) => b' },
  { name: 'keys', type: '(a -> b) => set(a)' },
  { name: 'mapBy', type: '(set(a), (a) => b) => a -> b' },
  { name: 'setToMap', type: '(set((a, b))) => (a -> b)' },
  { name: 'setOfMaps', type: '(set(a), set(b)) => set(a -> b)' },
  { name: 'update', type: '(a -> b, a, b) => a -> b' },
  { name: 'updateAs', type: '(a -> b, a, (b) => b) => a -> b' },
  { name: 'put', type: '(a -> b, a, b) => a -> b' },
]

// FIXME: Make record and tuple signatures more strict once row types are implemented
const recordOperators = [
  { name: 'field', type: '(a, str) => b' },
  { name: 'fieldNames', type: '(a) => set(str)' },
  { name: 'with', type: '(a, str, b) => a' },
]

const tupleOperators = [
  { name: 'item', type: '(a, int) => b' },
]

const listOperators = [
  { name: 'append', type: '(list(a), a) => list(a)' },
  { name: 'concat', type: '(list(a), list(a)) => list(a)' },
  { name: 'head', type: '(list(a)) => a' },
  { name: 'tail', type: '(list(a)) => list(a)' },
  { name: 'length', type: '(list(a)) => int' },
  { name: 'nth', type: '(list(a), int) => a' },
  { name: 'indices', type: '(list(a)) => set(int)' },
  { name: 'replaceAt', type: '(list(a), int, a) => list(a)' },
  { name: 'slice', type: '(list(a), int, int) => list(a)' },
  { name: 'range', type: '(int, int) => list(int)' },
  { name: 'select', type: '(list(a), (a) => bool) => list(a)' },
  { name: 'foldl', type: '(list(a), b, (b, a) => b) => b' },
  { name: 'foldr', type: '(list(a), b, (a, b) => b) => b' },
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
  { name: 'to', type: '(int, int) => set(int)' },
  { name: 'iuminus', type: '(int) => int' },
]
const temporalOperators = [
  { name: 'always', type: '(bool) => bool' },
  { name: 'eventually', type: '(bool) => bool' },
  { name: 'next', type: '(a) => a' },
  { name: 'stutter', type: '(bool, a) => bool' },
  { name: 'nostutter', type: '(bool, a) => bool' },
  { name: 'enabled', type: '(bool) => bool' },
  { name: 'weakFair', type: '(bool, a) => bool' },
  { name: 'strongFair', type: '(bool, a) => bool' },
]

const otherOperators = [
  { name: 'assign', type: '(a, a) => bool' },
  { name: 'ite', type: '(bool, a, a) => a' },
  // Should we do this? https://github.com/informalsystems/tnt/discussions/109
]

function uniformArgsWithResult (argsType: string, resultType: string): Signature {
  return (arity: number) => {
    const args = Array.from(Array(arity).keys()).map(i => argsType)
    return parseAndQuantify(`(${args.join(', ')}) => ${resultType}`)
  }
}

// TODO: check arity conditions, see issue https://github.com/informalsystems/tnt/issues/169
const multipleAritySignatures: [string, Signature][] = [
  ['list', uniformArgsWithResult('a', 'list(a)')],
  ['set', uniformArgsWithResult('a', 'set(a)')],
  ['mapOf', uniformArgsWithResult('(a, b)', 'a -> b')],
  ['and', uniformArgsWithResult('bool', 'bool')],
  ['actionAll', uniformArgsWithResult('bool', 'bool')],
  ['or', uniformArgsWithResult('bool', 'bool')],
  ['actionAny', uniformArgsWithResult('bool', 'bool')],
  ['tup', (arity: number) => {
    const args = Array.from(Array(arity).keys()).map(i => `t${i}`).join(', ')
    return parseAndQuantify(`(${args}) => (${args})`)
  }],
  ['rec', (arity: number) => {
    const indexes = Array.from(Array(arity / 2).keys())
    const args = indexes.map(i => `n${i}, t${i}`).join(', ')
    const result = indexes.map(i => `n${i}: t${i}`).join(', ')
    return parseAndQuantify(`(${args}) => { ${result} }`)
  }],
  ['match', (arity: number) => {
    const args = Array.from(Array((arity - 1) / 2).keys()).map(r => 'str, (a) => b')
    return parseAndQuantify(`(a, ${args.join(', ')}) => b`)
  }],
  ['tuples', (arity: number) => {
    const ts = Array.from(Array(arity).keys()).map(i => `t${i}`)
    const args = ts.map(t => `set(${t})`)
    const tupleType = `(${ts.join(', ')})`
    return parseAndQuantify(`(${args.join(', ')}) => set(${tupleType})`)
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
].flat().map(sig => [sig.name, (_: number) => parseAndQuantify(sig.type)])

function parseAndQuantify (typeString: string): TypeScheme {
  const t = parseTypeOrThrow(typeString)
  return {
    type: t,
    variables: typeNames(t),
  }
}
