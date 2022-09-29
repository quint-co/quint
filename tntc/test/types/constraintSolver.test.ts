import { describe, it } from 'mocha'
import { assert } from 'chai'
import { solveConstraint, unify } from '../../src/types/constraintSolver'
import { parseTypeOrThrow } from '../../src/types/parser'
import { Constraint } from '../../src/types/base'
import { substitutionsToString } from '../../src/types/printing'

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
