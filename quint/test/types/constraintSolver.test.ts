import { describe, it } from 'mocha'
import { assert } from 'chai'
import { solveConstraint, unify, unifyRows } from '../../src/types/constraintSolver'
import { parseRowOrThrow, parseTypeOrThrow } from '../../src/types/parser'
import { Constraint } from '../../src/types/base'
import { substitutionsToString } from '../../src/types/printing'
import { Substitutions } from '../../src/types/substitutions'
import { Row, sumType, unitType } from '../../src/ir/quintTypes'
import { errorTreeToString } from '../../src/errorTree'
import { LookupTable } from '../../src/names/base'

const table: LookupTable = new Map([
  // A type alias (id 1n)
  [3n, { kind: 'typedef', name: 'MY_ALIAS', type: { kind: 'int' }, id: 1n }],
  // An uniterpreted type (id 2n)
  [4n, { kind: 'typedef', name: 'MY_UNINTERPRETED', id: 2n }],
  [5n, { kind: 'typedef', name: 'MY_UNINTERPRETED', id: 2n }],
  [
    6n,
    {
      kind: 'typedef',
      name: 'SumType',
      id: 7n,
      type: sumType([
        ['A', { kind: 'int' }],
        ['B', { kind: 'str' }],
      ]),
    },
  ],
])

describe('solveConstraint', () => {
  it('solves simple equality', () => {
    const constraint: Constraint = {
      kind: 'eq',
      types: [parseTypeOrThrow('a'), parseTypeOrThrow('int')],
      sourceId: 1n,
    }

    const result = solveConstraint(table, constraint)

    assert.isTrue(result.isRight())
    result.map(subs => assert.deepEqual(substitutionsToString(subs), '[ a |-> int ]'))
  })

  it('solves conjunctions', () => {
    const constraint1: Constraint = {
      kind: 'eq',
      types: [parseTypeOrThrow('a'), parseTypeOrThrow('int')],
      sourceId: 1n,
    }

    const constraint2: Constraint = {
      kind: 'eq',
      types: [parseTypeOrThrow('b'), parseTypeOrThrow('a')],
      sourceId: 2n,
    }

    const constraint: Constraint = {
      kind: 'conjunction',
      constraints: [constraint1, constraint2],
      sourceId: 3n,
    }

    const result = solveConstraint(table, constraint)

    assert.isTrue(result.isRight())
    result.map(subs => assert.deepEqual(substitutionsToString(subs), '[ a |-> int, b |-> int ]'))
  })

  it('solves isDefined constraint when unifiable type is defined', () => {
    const constraint: Constraint = {
      kind: 'isDefined',
      type: sumType([['A', { kind: 'int' }]], 'a'),
      sourceId: 1n,
    }

    const result = solveConstraint(table, constraint)

    assert.isTrue(result.isRight())
    result.map(subs => assert.deepEqual(substitutionsToString(subs), '[ a |-> { B: str } ]'))
  })

  it('isDefined constraint fails when type is not defined', () => {
    const constraint: Constraint = {
      kind: 'isDefined',
      type: sumType([['NotDefined', { kind: 'int' }]], 'a'),
      sourceId: 1n,
    }

    const result = solveConstraint(table, constraint)

    assert.isTrue(result.isLeft())
    result.mapLeft(errs => {
      const err = errs.get(1n)
      assert.deepEqual(err?.location, 'Looking for defined type unifying with (NotDefined(int))')
      assert.deepEqual(err?.message, 'Expected type is not defined')
    })
  })

  it('solves empty constraint', () => {
    const constraint: Constraint = { kind: 'empty' }

    const result = solveConstraint(table, constraint)

    assert.isTrue(result.isRight())
    result.map(subs => assert.sameDeepMembers(subs, []))
  })

  it('fails to solve equality constraint between incompatible types', () => {
    const constraint1: Constraint = {
      kind: 'eq',
      types: [parseTypeOrThrow('bool'), parseTypeOrThrow('int')],
      sourceId: 1n,
    }

    const constraint2: Constraint = {
      kind: 'eq',
      types: [parseTypeOrThrow('Set[a]'), parseTypeOrThrow('List[a]')],
      sourceId: 2n,
    }

    const constraint: Constraint = {
      kind: 'conjunction',
      constraints: [constraint1, constraint2],
      sourceId: 3n,
    }

    const result = solveConstraint(table, constraint)

    assert.isTrue(result.isLeft())
    result.mapLeft(errors => {
      assert.sameDeepMembers(
        [...errors.entries()],
        [
          [
            1n,
            {
              message: "Couldn't unify bool and int",
              location: 'Trying to unify bool and int',
              children: [],
            },
          ],
          [
            2n,
            {
              message: "Couldn't unify set and list",
              location: 'Trying to unify Set[a] and List[a]',
              children: [],
            },
          ],
        ]
      )
    })
  })
})

describe('unify', () => {
  it('unifies variable with other type', () => {
    const result = unify(table, parseTypeOrThrow('a'), parseTypeOrThrow('(Set[b]) => List[b]'))

    assert.isTrue(result.isRight())
    result.map(subs => assert.deepEqual(substitutionsToString(subs), '[ a |-> (Set[b]) => List[b] ]'))
  })

  it('returns empty substitution for equal types', () => {
    const result = unify(table, parseTypeOrThrow('(Set[b]) => List[b]'), parseTypeOrThrow('(Set[b]) => List[b]'))

    assert.isTrue(result.isRight())
    result.map(subs => assert.sameDeepMembers(subs, []))
  })

  it('returns empty substitution for equal types with alias', () => {
    const result = unify(table, { kind: 'const', name: 'MY_ALIAS', id: 3n }, { kind: 'int' })

    assert.isTrue(result.isRight())
    result.map(subs => assert.sameDeepMembers(subs, []))
  })

  it('returns empty substitution for equal uninterpreted types', () => {
    const result = unify(
      table,
      { kind: 'const', name: 'MY_UNINTERPRETED', id: 4n },
      { kind: 'const', name: 'MY_UNINTERPRETED', id: 5n }
    )

    assert.isTrue(result.isRight())
    result.map(subs => assert.sameDeepMembers(subs, []))
  })

  it('returns error when uninterpreted type is unified with other type', () => {
    const result = unify(table, { kind: 'const', name: 'MY_UNINTERPRETED', id: 4n }, { kind: 'int' })

    assert.isTrue(result.isLeft())
    result.mapLeft(err =>
      assert.deepEqual(err, {
        message: "Couldn't unify uninterpreted type MY_UNINTERPRETED with different type",
        location: 'Trying to unify MY_UNINTERPRETED and int',
        children: [],
      })
    )
  })

  it('returns error when type alias is not found', () => {
    const result = unify(table, { kind: 'const', name: 'UNEXISTING_ALIAS', id: 999n }, { kind: 'int' })

    assert.isTrue(result.isLeft())
    result.mapLeft(err =>
      assert.deepEqual(err, {
        message: "Couldn't find type alias UNEXISTING_ALIAS",
        location: 'Trying to unify UNEXISTING_ALIAS and int',
        children: [],
      })
    )
  })

  it('unifies args and results of arrow and function types', () => {
    const result = unify(
      table,
      parseTypeOrThrow('(a) => int -> bool'),
      parseTypeOrThrow('((Set[b]) => List[b]) => b -> c')
    )

    assert.isTrue(result.isRight())
    result.map(subs =>
      assert.deepEqual(substitutionsToString(subs), '[ a |-> (Set[int]) => List[int], c |-> bool, b |-> int ]')
    )
  })

  it('unifies elements of tuples, set and list types', () => {
    const result = unify(table, parseTypeOrThrow('(Set[a], List[b])'), parseTypeOrThrow('(Set[int], List[bool])'))

    assert.isTrue(result.isRight())
    result.map(subs => assert.deepEqual(substitutionsToString(subs), '[ a |-> int, b |-> bool ]'))
  })

  it('unifies sum-type', () => {
    const result = unify(
      table,
      sumType([
        ['A', { kind: 'var', name: 'a' }],
        ['B', { kind: 'int' }],
        ['C', unitType(0n)],
      ]),
      sumType([
        ['C', unitType(0n)],
        ['A', { kind: 'str' }],
        ['B', { kind: 'var', name: 'b' }],
      ])
    )

    assert.isTrue(result.isRight())
    result.map(subs => assert.deepEqual(substitutionsToString(subs), '[ a |-> str, b |-> int ]'))
  })

  it("returns error when variable occurs in the other type's body", () => {
    const result = unify(table, parseTypeOrThrow('a'), parseTypeOrThrow('Set[a]'))

    assert.isTrue(result.isLeft())
    result.mapLeft(err =>
      assert.deepEqual(err, {
        message: "Can't bind a to Set[a]: cyclical binding",
        location: 'Trying to unify a and Set[a]',
        children: [],
      })
    )
  })

  it('returns error when unifying operator with different number of args', () => {
    const result = unify(table, parseTypeOrThrow('(a, b) => c'), parseTypeOrThrow('(int) => c'))

    assert.isTrue(result.isLeft())
    result.mapLeft(err =>
      assert.deepEqual(err, {
        message: 'Expected 2 arguments, got 1',
        location: 'Trying to unify (a, b) => c and (int) => c',
        children: [],
      })
    )
  })

  it('returns error when unifying tuples with different number of args', () => {
    const result = unify(table, parseTypeOrThrow('(a, b, c)'), parseTypeOrThrow('(int, bool)'))

    assert.isTrue(result.isLeft())
    result.mapLeft(err =>
      assert.deepEqual(err, {
        location: 'Trying to unify (a, b, c) and (int, bool)',
        children: [
          {
            location: 'Trying to unify { 0: a, 1: b, 2: c } and { 0: int, 1: bool }',
            children: [
              {
                message: "Couldn't unify row and empty",
                location: 'Trying to unify { 2: c } and {}',
                children: [],
              },
            ],
          },
        ],
      })
    )
  })
})

describe('unifyRows', () => {
  it('unifies empty row with non-empty', () => {
    const row1: Row = parseRowOrThrow('')
    const row2: Row = parseRowOrThrow('| a')

    const result = unifyRows(table, row1, row2)
    const expectedSubs: Substitutions = [{ kind: 'row', name: 'a', value: { kind: 'empty' } }]

    result.map(subs => assert.sameDeepMembers(subs, expectedSubs)).mapLeft(err => assert.fail(errorTreeToString(err)))
  })

  it('unifies row var with row with fields', () => {
    const row1: Row = parseRowOrThrow('f: int')
    const row2: Row = parseRowOrThrow('| a')

    const result = unifyRows(table, row1, row2)
    const expectedSubs: Substitutions = [{ kind: 'row', name: 'a', value: row1 }]

    result.map(subs => assert.sameDeepMembers(subs, expectedSubs)).mapLeft(err => assert.fail(errorTreeToString(err)))
  })

  it('unifies two partial rows', () => {
    const row1: Row = parseRowOrThrow('f1: int, f2: str | a')
    const row2: Row = parseRowOrThrow('f3: bool | b')

    const result = unifyRows(table, row1, row2)
    const expectedSubs: Substitutions = [
      {
        kind: 'row',
        name: 'a',
        value: {
          kind: 'row',
          fields: [{ fieldName: 'f3', fieldType: { kind: 'bool', id: 1n } }],
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

    result.map(subs => assert.sameDeepMembers(subs, expectedSubs)).mapLeft(err => assert.fail(errorTreeToString(err)))
  })

  it('unifies partial row with complete row', () => {
    const row1: Row = parseRowOrThrow('f1: int, f2: str | a')
    const row2: Row = parseRowOrThrow('f3: bool, f2: str, f1: int')

    const result = unifyRows(table, row1, row2)
    const expectedSubs: Substitutions = [
      {
        kind: 'row',
        name: 'a',
        value: parseRowOrThrow('f3: bool'),
      },
    ]

    result.map(subs => assert.sameDeepMembers(subs, expectedSubs)).mapLeft(err => assert.fail(errorTreeToString(err)))
  })

  it('unifies two row variables', () => {
    const row1: Row = parseRowOrThrow('| a')
    const row2: Row = parseRowOrThrow('| b')

    const result = unifyRows(table, row1, row2)
    const expectedSubs: Substitutions = [{ kind: 'row', name: 'a', value: { kind: 'var', name: 'b' } }]

    result.map(subs => assert.sameDeepMembers(subs, expectedSubs)).mapLeft(err => assert.fail(errorTreeToString(err)))
  })

  it('fails at unifying rows with incompatible fields', () => {
    const row1: Row = parseRowOrThrow('f1: int')
    const row2: Row = parseRowOrThrow('f1: str')

    const result = unifyRows(table, row1, row2)

    result
      .mapLeft(err =>
        assert.deepEqual(err, {
          location: 'Trying to unify { f1: int } and { f1: str }',
          children: [
            {
              message: "Couldn't unify int and str",
              location: 'Trying to unify int and str',
              children: [],
            },
          ],
        })
      )
      .map(subs => assert.fail('Expected error, got substitutions: ' + substitutionsToString(subs)))
  })

  it('fails at unifying complete rows with distinct fields', () => {
    const row1: Row = parseRowOrThrow('shared: bool, f1: int')
    const row2: Row = parseRowOrThrow('shared: bool, f2: str')

    const result = unifyRows(table, row1, row2)

    result
      .mapLeft(err =>
        assert.deepEqual(err, {
          location: 'Trying to unify { shared: bool, f1: int } and { shared: bool, f2: str }',
          children: [
            {
              message: 'Incompatible tails for rows with disjoint fields: {} and {}',
              location: 'Trying to unify { f1: int } and { f2: str }',
              children: [],
            },
          ],
        })
      )
      .map(subs => assert.fail('Expected error, got substitutions: ' + substitutionsToString(subs)))
  })

  it('fails at unifying rows with cyclical references', () => {
    const row1: Row = parseRowOrThrow('| a')
    const row2: Row = parseRowOrThrow('f1: str | a')

    const result = unifyRows(table, row1, row2)

    result
      .mapLeft(err =>
        assert.deepEqual(err, {
          message: "Can't bind a to { f1: str | a }: cyclical binding",
          location: 'Trying to unify { | a } and { f1: str | a }',
          children: [],
        })
      )
      .map(subs => assert.fail('Expected error, got substitutions: ' + substitutionsToString(subs)))
  })

  it('fails at unifying rows with cyclical references on tail', () => {
    const row1: Row = parseRowOrThrow('f1: str | a')
    const row2: Row = parseRowOrThrow('f2: int | a')

    const result = unifyRows(table, row1, row2)

    result
      .mapLeft(err =>
        assert.deepEqual(err, {
          location: 'Trying to unify { f1: str | a } and { f2: int | a }',
          message: 'Incompatible tails for rows with disjoint fields: { | a } and { | a }',
          children: [],
        })
      )
      .map(subs => assert.fail('Expected error, got substitutions: ' + substitutionsToString(subs)))
  })

  it('fails at unifying incompatible rows', () => {
    const row1: Row = parseRowOrThrow('')
    const row2: Row = parseRowOrThrow('f1: str | a')

    const result = unifyRows(table, row1, row2)

    result
      .mapLeft(err =>
        assert.deepEqual(err, {
          message: "Couldn't unify empty and row",
          location: 'Trying to unify {} and { f1: str | a }',
          children: [],
        })
      )
      .map(subs => assert.fail('Expected error, got substitutions: ' + substitutionsToString(subs)))
  })
})
