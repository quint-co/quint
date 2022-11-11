import { describe, it } from 'mocha'
import { assert } from 'chai'
import { solveConstraint, unify, unifyRows } from '../../src/types/constraintSolver'
import { parseRowOrThrow, parseTypeOrThrow } from '../../src/types/parser'
import { Constraint } from '../../src/types/base'
import { substitutionsToString } from '../../src/types/printing'
import { Substitutions } from '../../src/types/substitutions'
import { Row } from '../../src/tntTypes'
import { errorTreeToString } from '../../src/errorTree'

describe('solveConstraint', () => {
  it('solves simple equality', () => {
    const constraint: Constraint = {
      kind: 'eq',
      types: [
        parseTypeOrThrow('a'),
        parseTypeOrThrow('int'),
      ],
      sourceId: 1n,
    }

    const result = solveConstraint(constraint)

    assert.isTrue(result.isRight())
    result.map(subs => assert.deepEqual(substitutionsToString(subs),
      '[ a |-> int ]'
    ))
  })

  it('solves conjunctions', () => {
    const constraint1: Constraint = {
      kind: 'eq',
      types: [
        parseTypeOrThrow('a'),
        parseTypeOrThrow('int'),
      ],
      sourceId: 1n,
    }

    const constraint2: Constraint = {
      kind: 'eq',
      types: [
        parseTypeOrThrow('b'),
        parseTypeOrThrow('a'),
      ],
      sourceId: 2n,
    }

    const constraint: Constraint = {
      kind: 'conjunction',
      constraints: [constraint1, constraint2],
      sourceId: 3n,
    }

    const result = solveConstraint(constraint)

    assert.isTrue(result.isRight())
    result.map(subs => assert.deepEqual(substitutionsToString(subs),
      '[ a |-> int, b |-> int ]'
    ))
  })

  it('solves empty constraint', () => {
    const constraint: Constraint = { kind: 'empty' }

    const result = solveConstraint(constraint)

    assert.isTrue(result.isRight())
    result.map(subs => assert.sameDeepMembers(subs, []))
  })

  it('fails to solve equality constraint between incompatible types', () => {
    const constraint1: Constraint = {
      kind: 'eq',
      types: [
        parseTypeOrThrow('bool'),
        parseTypeOrThrow('int'),
      ],
      sourceId: 1n,
    }

    const constraint2: Constraint = {
      kind: 'eq',
      types: [
        parseTypeOrThrow('set(a)'),
        parseTypeOrThrow('list(a)'),
      ],
      sourceId: 2n,
    }

    const constraint: Constraint = {
      kind: 'conjunction',
      constraints: [constraint1, constraint2],
      sourceId: 3n,
    }

    const result = solveConstraint(constraint)

    assert.isTrue(result.isLeft())
    result.mapLeft(errors => {
      assert.sameDeepMembers([...errors.entries()], [
        [1n, {
          message: "Couldn't unify bool and int",
          location: 'Trying to unify bool and int',
          children: [],
        }],
        [2n, {
          message: "Couldn't unify set and list",
          location: 'Trying to unify set(a) and list(a)',
          children: [],
        }],
      ])
    })
  })
})

describe('unify', () => {
  it('unifies variable with other type', () => {
    const result = unify(
      parseTypeOrThrow('a'),
      parseTypeOrThrow('(set(b)) => list(b)')
    )

    assert.isTrue(result.isRight())
    result.map(subs => assert.deepEqual(substitutionsToString(subs),
      '[ a |-> (set(b)) => list(b) ]'
    ))
  })

  it('returns empty substitution for equal types', () => {
    const result = unify(
      parseTypeOrThrow('(set(b)) => list(b)'),
      parseTypeOrThrow('(set(b)) => list(b)')
    )

    assert.isTrue(result.isRight())
    result.map(subs => assert.sameDeepMembers(subs, []))
  })

  it('unifies args and results of arrow and function types', () => {
    const result = unify(
      parseTypeOrThrow('(a) => int -> bool'),
      parseTypeOrThrow('((set(b)) => list(b)) => b -> c')
    )

    assert.isTrue(result.isRight())
    result.map(subs => assert.deepEqual(substitutionsToString(subs),
      '[ a |-> (set(int)) => list(int), c |-> bool, b |-> int ]'
    ))
  })

  it('unifies elements of tuples, set and list types', () => {
    const result = unify(
      parseTypeOrThrow('(set(a), list(b))'),
      parseTypeOrThrow('(set(int), list(bool))')
    )

    assert.isTrue(result.isRight())
    result.map(subs => assert.deepEqual(substitutionsToString(subs),
      '[ a |-> int, b |-> bool ]'
    ))
  })

  it("returns error when variable occurs in the other type's body", () => {
    const result = unify(
      parseTypeOrThrow('a'),
      parseTypeOrThrow('set(a)')
    )

    assert.isTrue(result.isLeft())
    result.mapLeft(err => assert.deepEqual(err, {
      message: "Can't bind a to set(a): cyclical binding",
      location: 'Trying to unify a and set(a)',
      children: [],
    }))
  })

  it('returns error when unifying operator with different number of args', () => {
    const result = unify(
      parseTypeOrThrow('(a, b) => c'),
      parseTypeOrThrow('(int) => c')
    )

    assert.isTrue(result.isLeft())
    result.mapLeft(err => assert.deepEqual(err, {
      message: 'Expected 2 arguments, got 1',
      location: 'Trying to unify (a, b) => c and (int) => c',
      children: [],
    }))
  })

  it('returns error when unifying tuples with different number of args', () => {
    const result = unify(
      parseTypeOrThrow('(a, b, c)'),
      parseTypeOrThrow('(int, bool)')
    )

    assert.isTrue(result.isLeft())
    result.mapLeft(err => assert.deepEqual(err, {
      message: 'Expected 3 arguments, got 2',
      location: 'Trying to unify (a, b, c) and (int, bool)',
      children: [],
    }))
  })
})

describe('unifyRows', () => {
  it('unifies empty row with non-empty', () => {
    const row1: Row = parseRowOrThrow('')
    const row2: Row = parseRowOrThrow('a')

    const result = unifyRows(row1, row2)
    const expectedSubs: Substitutions = [{ kind: 'row', name: 'a', value: { kind: 'empty' } }]

    result.map(subs => assert.sameDeepMembers(subs, expectedSubs))
      .mapLeft(err => assert.fail(errorTreeToString(err)))
  })

  it('unifies row var with row with fields', () => {
    const row1: Row = parseRowOrThrow('f: int')
    const row2: Row = parseRowOrThrow('a')

    const result = unifyRows(row1, row2)
    const expectedSubs: Substitutions = [{ kind: 'row', name: 'a', value: row1 }]

    result.map(subs => assert.sameDeepMembers(subs, expectedSubs))
      .mapLeft(err => assert.fail(errorTreeToString(err)))
  })

  it('unifies two partial rows', () => {
    const row1: Row = parseRowOrThrow('f1: int, f2: str, a')
    const row2: Row = parseRowOrThrow('f3: bool, b')

    const result = unifyRows(row1, row2)
    const expectedSubs: Substitutions = [
      {
        kind: 'row',
        name: 'a',
        value: {
          kind: 'row',
          fields: [
            { fieldName: 'f3', fieldType: { kind: 'bool', id: 1n } },
          ],
          other: { kind: 'var', name: '$a$b' },
        },
      },
      {
        kind: 'row',
        name: 'b',
        value: {
          kind: 'row',
          fields: [
            { fieldName: 'f1', fieldType: { kind: 'int', id: 1n } },
            { fieldName: 'f2', fieldType: { kind: 'str', id: 2n } },
          ],
          other: { kind: 'var', name: '$a$b' },
        },
      },
    ]

    result.map(subs => assert.sameDeepMembers(subs, expectedSubs))
      .mapLeft(err => assert.fail(errorTreeToString(err)))
  })

  it('unifies partial row with complete row', () => {
    const row1: Row = parseRowOrThrow('f1: int, f2: str, a')
    const row2: Row = parseRowOrThrow('f3: bool, f1: int, f2: str,')

    const result = unifyRows(row1, row2)
    const expectedSubs: Substitutions = [{
      kind: 'row',
      name: 'a',
      value: parseRowOrThrow('f3: bool'),
    }]

    result.map(subs => assert.sameDeepMembers(subs, expectedSubs))
      .mapLeft(err => assert.fail(errorTreeToString(err)))
  })

  it('unifies two row variables', () => {
    const row1: Row = parseRowOrThrow('a')
    const row2: Row = parseRowOrThrow('b')

    const result = unifyRows(row1, row2)
    const expectedSubs: Substitutions = [{ kind: 'row', name: 'a', value: { kind: 'var', name: 'b' } }]

    result.map(subs => assert.sameDeepMembers(subs, expectedSubs))
      .mapLeft(err => assert.fail(errorTreeToString(err)))
  })

  it('fails at unifying rows with incompatible fields', () => {
    const row1: Row = parseRowOrThrow('f1: int')
    const row2: Row = parseRowOrThrow('f1: str')

    const result = unifyRows(row1, row2)

    result.mapLeft(err => assert.deepEqual(err, {
      location: 'Trying to unify row f1: int and row f1: str',
      children: [{
        message: "Couldn't unify int and str",
        location: 'Trying to unify int and str',
        children: [],
      }],
    })).map(subs => assert.fail('Expected error, got substitutions: ' + substitutionsToString(subs)))
  })

  it('fails at unifying complete rows with distinct fields', () => {
    const row1: Row = parseRowOrThrow('shared: bool, f1: int')
    const row2: Row = parseRowOrThrow('shared: bool, f2: str')

    const result = unifyRows(row1, row2)

    result.mapLeft(err => assert.deepEqual(err, {
      location: 'Trying to unify row shared: bool, f1: int and row shared: bool, f2: str',
      children: [{
        message: 'Incompatible tails in f1: int and f2: str',
        location: 'Trying to unify row f1: int and row f2: str',
        children: [],
      }],
    })).map(subs => assert.fail('Expected error, got substitutions: ' + substitutionsToString(subs)))
  })

  it('fails at unifying rows with cyclical references', () => {
    const row1: Row = parseRowOrThrow('a')
    const row2: Row = parseRowOrThrow('f1: str, a')

    const result = unifyRows(row1, row2)

    result.mapLeft(err => assert.deepEqual(err, {
      message: "Can't bind a to f1: str, a: cyclical binding",
      location: 'Trying to unify var a and row f1: str, a',
      children: [],
    })).map(subs => assert.fail('Expected error, got substitutions: ' + substitutionsToString(subs)))
  })

  it('fails at unifying rows with cyclical references on tail', () => {
    const row1: Row = parseRowOrThrow('f1: str, a')
    const row2: Row = parseRowOrThrow('f2: int, a')

    const result = unifyRows(row1, row2)

    result.mapLeft(err => assert.deepEqual(err, {
      location: 'Trying to unify row f1: str, a and row f2: int, a',
      message: 'Incompatible tails in f1: str, a and f2: int, a',
      children: [],
    })).map(subs => assert.fail('Expected error, got substitutions: ' + substitutionsToString(subs)))
  })

  it('fails at unifying incompatible rows', () => {
    const row1: Row = parseRowOrThrow('')
    const row2: Row = parseRowOrThrow('f1: str, a')

    const result = unifyRows(row1, row2)

    result.mapLeft(err => assert.deepEqual(err, {
      message: "Couldn't unify  and f1: str, a",
      location: 'Trying to unify empty  and row f1: str, a',
      children: [],
    })).map(subs => assert.fail('Expected error, got substitutions: ' + substitutionsToString(subs)))
  })
})
