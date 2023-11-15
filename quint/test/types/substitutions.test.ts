import { describe, it } from 'mocha'
import { assert } from 'chai'
import { parseTypeOrThrow } from '../../src/types/parser'
import { Substitutions, applySubstitution, applySubstitutionToConstraint, compose } from '../../src/types/substitutions'
import { Constraint } from '../../src/types/base'
import { constraintToString } from '../../src/types/printing'
import { Row } from '../../src'
import { LookupTable } from '../../src/names/base'

const table: LookupTable = new Map()

describe('compose', () => {
  it('composes two substitutions', () => {
    const row: Row = {
      kind: 'row',
      fields: [{ fieldName: 'f', fieldType: parseTypeOrThrow('bool') }],
      other: { kind: 'empty' },
    }
    const s1: Substitutions = [
      {
        kind: 'type',
        name: 'a',
        value: parseTypeOrThrow('int'),
      },
    ]
    const s2: Substitutions = [
      {
        kind: 'row',
        name: 'b',
        value: row,
      },
    ]

    const result = compose(table, s1, s2)

    assert.sameDeepMembers(result, [
      { kind: 'type', name: 'a', value: parseTypeOrThrow('int') },
      { kind: 'row', name: 'b', value: row },
    ])
  })

  it('unifies values of substitutions with same name', () => {
    const s1: Substitutions = [{ kind: 'type', name: 'v1', value: parseTypeOrThrow('int') }]
    const s2: Substitutions = [{ kind: 'type', name: 'v1', value: { kind: 'var', name: 'q' } }]

    const result = compose(table, s1, s2)

    assert.sameDeepMembers(result, s1.concat([{ kind: 'type', name: 'q', value: parseTypeOrThrow('int') }]))
  })
})

describe('applySubstitution', () => {
  it('substitutes variables in arrow type', () => {
    const s: Substitutions = [
      { kind: 'type', name: 'a', value: { kind: 'int', id: 1n } },
      { kind: 'type', name: 'b', value: { kind: 'bool', id: 2n } },
    ]

    const t = parseTypeOrThrow('(a) => b')

    const result = applySubstitution(table, s, t)

    assert.deepEqual(result, parseTypeOrThrow('(int) => bool'))
  })

  it('substitutes variables in function type', () => {
    const s: Substitutions = [
      { kind: 'type', name: 'a', value: { kind: 'int', id: 1n } },
      { kind: 'type', name: 'b', value: { kind: 'bool', id: 2n } },
    ]

    const t = parseTypeOrThrow('a -> b')

    const result = applySubstitution(table, s, t)

    assert.deepEqual(result, parseTypeOrThrow('int -> bool'))
  })

  it('substitutes variables in lists, sets and tuples types', () => {
    const s: Substitutions = [
      { kind: 'type', name: 'a', value: { kind: 'int', id: 1n } },
      { kind: 'type', name: 'b', value: { kind: 'bool', id: 3n } },
      { kind: 'type', name: 'c', value: { kind: 'str', id: 5n } },
    ]

    const t = parseTypeOrThrow('(List[a], Set[b], c)')

    const result = applySubstitution(table, s, t)

    assert.deepEqual(result, parseTypeOrThrow('(List[int], Set[bool], str)'))
  })

  it('substitutes variables in record type', () => {
    const s: Substitutions = [
      { kind: 'type', name: 'a', value: { kind: 'int', id: 1n } },
      { kind: 'type', name: 'b', value: { kind: 'bool', id: 2n } },
    ]

    const t = parseTypeOrThrow('{ a: a, b: b }')

    const result = applySubstitution(table, s, t)

    assert.deepEqual(result, parseTypeOrThrow('{ a: int, b: bool }'))
  })

  it('substitutes variables in record type with row variable', () => {
    const s: Substitutions = [
      { kind: 'type', name: 'a', value: { kind: 'int', id: 1n } },
      { kind: 'type', name: 'b', value: { kind: 'bool', id: 2n } },
      { kind: 'row', name: 'r', value: { kind: 'empty' } },
    ]

    const t = parseTypeOrThrow('{ a: a, b: b | r }')

    const result = applySubstitution(table, s, t)

    assert.deepEqual(result, parseTypeOrThrow('{ a: int, b: bool }'))
  })

  it('substitutes with transitivity', () => {
    const s: Substitutions = [
      { kind: 'type', name: 'a', value: { kind: 'var', id: 1n, name: 'b' } },
      { kind: 'type', name: 'b', value: { kind: 'bool', id: 2n } },
    ]

    const t = parseTypeOrThrow('a')

    const result = applySubstitution(table, s, t)

    assert.deepEqual(result, { kind: 'bool', id: 2n })
  })
})

describe('applySubstitutionToConstraint', () => {
  const s: Substitutions = [
    { kind: 'type', name: 'a', value: { kind: 'int', id: 1n } },
    { kind: 'type', name: 'b', value: { kind: 'bool', id: 1n } },
  ]

  it('applies substitution to types in equality constraint', () => {
    const t1 = parseTypeOrThrow('a')
    const t2 = parseTypeOrThrow('b')

    const result = applySubstitutionToConstraint(table, s, { kind: 'eq', types: [t1, t2], sourceId: 1n })
    const expectedResult: Constraint = {
      kind: 'eq',
      types: [parseTypeOrThrow('int'), parseTypeOrThrow('bool')],
      sourceId: 1n,
    }

    assert.deepEqual(
      result,
      expectedResult,
      `expected ${constraintToString(expectedResult)}, got ${constraintToString(result)}`
    )
  })

  it('does nothing to empty constraint', () => {
    const result = applySubstitutionToConstraint(table, s, { kind: 'empty' })
    const expectedResult: Constraint = { kind: 'empty' }

    assert.deepEqual(
      result,
      expectedResult,
      `expected ${constraintToString(expectedResult)}, got ${constraintToString(result)}`
    )
  })

  it('applies substitution recursively to constraints in conjunction', () => {
    const c1: Constraint = { kind: 'eq', types: [parseTypeOrThrow('a'), parseTypeOrThrow('b')], sourceId: 1n }
    const c2: Constraint = { kind: 'eq', types: [parseTypeOrThrow('b'), parseTypeOrThrow('b')], sourceId: 1n }
    const result = applySubstitutionToConstraint(table, s, { kind: 'conjunction', constraints: [c1, c2], sourceId: 1n })

    const expected1: Constraint = {
      kind: 'eq',
      types: [parseTypeOrThrow('int'), parseTypeOrThrow('bool')],
      sourceId: 1n,
    }
    const expected2: Constraint = {
      kind: 'eq',
      types: [parseTypeOrThrow('bool'), parseTypeOrThrow('bool')],
      sourceId: 1n,
    }
    const expectedResult: Constraint = { kind: 'conjunction', constraints: [expected1, expected2], sourceId: 1n }

    assert.deepEqual(
      result,
      expectedResult,
      `expected ${constraintToString(expectedResult)}, got ${constraintToString(result)}`
    )
  })
})
