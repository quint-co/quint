import { describe, it } from 'mocha'
import { assert } from 'chai'
import { parseTypeOrThrow } from '../../src/types/parser'
import { compose, Substitutions, applySubstitution, applySubstitutionToConstraint } from '../../src/types/substitutions'
import { Constraint } from '../../src/types/base'
import { constraintToString } from '../../src/types/printing'

describe('compose', () => {
  it('composes two substitutions', () => {
    const s1: Substitutions = [{
      name: 'a',
      value: parseTypeOrThrow('int'),
    }]
    const s2: Substitutions = [{
      name: 'b',
      value: parseTypeOrThrow('list(a)'),
    }]

    const result = compose(s1, s2)

    assert.sameDeepMembers(result, [
      { name: 'a', value: parseTypeOrThrow('int') },
      { name: 'b', value: parseTypeOrThrow('list(int)') },
    ])
  })
})

describe('applySubstitution', () => {
  it('substitutes variables in arrow type', () => {
    const s: Substitutions = [
      { name: 'a', value: { kind: 'int', id: 1n } },
      { name: 'b', value: { kind: 'bool', id: 2n } },
    ]

    const t = parseTypeOrThrow('(a) => b')

    const result = applySubstitution(s, t)

    assert.deepEqual(result, parseTypeOrThrow('(int) => bool'))
  })

  it('substitutes variables in function type', () => {
    const s: Substitutions = [
      { name: 'a', value: { kind: 'int', id: 1n } },
      { name: 'b', value: { kind: 'bool', id: 2n } },
    ]

    const t = parseTypeOrThrow('a -> b')

    const result = applySubstitution(s, t)

    assert.deepEqual(result, parseTypeOrThrow('int -> bool'))
  })

  it('substitutes variables in lists, sets and tuples types', () => {
    const s: Substitutions = [
      { name: 'a', value: { kind: 'int', id: 1n } },
      { name: 'b', value: { kind: 'bool', id: 3n } },
      { name: 'c', value: { kind: 'str', id: 5n } },
    ]

    const t = parseTypeOrThrow('(list(a), set(b), c)')

    const result = applySubstitution(s, t)

    assert.deepEqual(result, parseTypeOrThrow('(list(int), set(bool), str)'))
  })

  it('substitutes variables in record type', () => {
    const s: Substitutions = [
      { name: 'a', value: { kind: 'int', id: 1n } },
      { name: 'b', value: { kind: 'bool', id: 2n } },
    ]

    const t = parseTypeOrThrow('{ a: a, b: b }')

    const result = applySubstitution(s, t)

    assert.deepEqual(result, parseTypeOrThrow('{ a: int, b: bool }'))
  })

  it('substitutes variables in union type', () => {
    const s: Substitutions = [
      { name: 'a', value: { kind: 'int', id: 1n } },
      { name: 'b', value: { kind: 'bool', id: 3n } },
    ]

    const t = parseTypeOrThrow('| { tag: "a", a: a }\n| { tag: "b", b: b }')

    const result = applySubstitution(s, t)

    assert.deepEqual(result, parseTypeOrThrow('| { tag: "a", a: int }\n| { tag: "b", b: bool }'))
  })
})

describe('applySubstitutionToConstraint', () => {
  const s: Substitutions = [
    { name: 'a', value: { kind: 'int', id: 1n } },
    { name: 'b', value: { kind: 'bool', id: 1n } },
  ]

  it('applies substitution to types in equality constraint', () => {
    const t1 = parseTypeOrThrow('a')
    const t2 = parseTypeOrThrow('b')

    const result = applySubstitutionToConstraint(s, { kind: 'eq', types: [t1, t2], sourceId: 1n })
    const expectedResult: Constraint = { kind: 'eq', types: [parseTypeOrThrow('int'), parseTypeOrThrow('bool')], sourceId: 1n }

    assert.deepEqual(result, expectedResult, `expected ${constraintToString(expectedResult)}, got ${constraintToString(result)}`)
  })

  it('does nothing to empty constraint', () => {
    const result = applySubstitutionToConstraint(s, { kind: 'empty' })
    const expectedResult: Constraint = { kind: 'empty' }

    assert.deepEqual(result, expectedResult, `expected ${constraintToString(expectedResult)}, got ${constraintToString(result)}`)
  })

  it('applies substitution recursively to constraints in conjunction', () => {
    const c1: Constraint = { kind: 'eq', types: [parseTypeOrThrow('a'), parseTypeOrThrow('b')], sourceId: 1n }
    const c2: Constraint = { kind: 'eq', types: [parseTypeOrThrow('b'), parseTypeOrThrow('b')], sourceId: 1n }
    const result = applySubstitutionToConstraint(s, { kind: 'conjunction', constraints: [c1, c2], sourceId: 1n })

    const expected1: Constraint = { kind: 'eq', types: [parseTypeOrThrow('int'), parseTypeOrThrow('bool')], sourceId: 1n }
    const expected2: Constraint = { kind: 'eq', types: [parseTypeOrThrow('bool'), parseTypeOrThrow('bool')], sourceId: 1n }
    const expectedResult: Constraint = { kind: 'conjunction', constraints: [expected1, expected2], sourceId: 1n }

    assert.deepEqual(result, expectedResult, `expected ${constraintToString(expectedResult)}, got ${constraintToString(result)}`)
  })
})
