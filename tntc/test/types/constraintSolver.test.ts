import { describe, it } from 'mocha'
import { assert } from 'chai'
import { solveConstraint, unify, typeNames } from '../../src/types/constraintSolver'
import { parseTypeOrThrow } from '../../src/types/parser'
import { Constraint } from '../../src/types/base'

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
    result.map(subs => assert.sameDeepMembers(subs, [
      { name: 'a', value: parseTypeOrThrow('int') },
    ]))
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
    result.map(subs => assert.sameDeepMembers(subs, [
      { name: 'a', value: parseTypeOrThrow('int') },
      { name: 'b', value: parseTypeOrThrow('int') },
    ]))
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
        parseTypeOrThrow('seq(a)'),
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
      assert.deepEqual(errors.size, 2)
      assert.sameDeepMembers([...errors.entries()], [
        [1n, {
          message: "Couldn't unify bool and int",
          location: 'Trying to unify bool and int',
          children: [],
        }],
        [2n, {
          message: "Couldn't unify set and seq",
          location: 'Trying to unify set(a) and seq(a)',
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
      parseTypeOrThrow('(set(b)) => seq(b)')
    )

    assert.isTrue(result.isRight())
    result.map(subs => assert.sameDeepMembers(subs, [
      { name: 'a', value: parseTypeOrThrow('(set(b)) => seq(b)') },
    ]))
  })

  it('returns empty substitution for equal types', () => {
    const result = unify(
      parseTypeOrThrow('(set(b)) => seq(b)'),
      parseTypeOrThrow('(set(b)) => seq(b)')
    )

    assert.isTrue(result.isRight())
    result.map(subs => assert.sameDeepMembers(subs, []))
  })

  it('unifies args and results of arrow and function types', () => {
    const result = unify(
      parseTypeOrThrow('(a) => int -> bool'),
      parseTypeOrThrow('((set(b)) => seq(b)) => b -> c')
    )

    assert.isTrue(result.isRight())
    result.map(subs => assert.sameDeepMembers(subs, [
      { name: 'a', value: parseTypeOrThrow('(set(b)) => seq(b)') },
      { name: 'b', value: { kind: 'int', id: 2n } },
      { name: 'c', value: { kind: 'bool', id: 3n } },
    ]))
  })

  it('unifies elements of tuples, set and seq types', () => {
    const result = unify(
      parseTypeOrThrow('(set(a), seq(b))'),
      parseTypeOrThrow('(set(int), seq(bool))')
    )

    assert.isTrue(result.isRight())
    result.map(subs => assert.sameDeepMembers(subs, [
      { name: 'a', value: { kind: 'int', id: 1n } },
      { name: 'b', value: { kind: 'bool', id: 3n } },
    ]))
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

describe('typeNames', () => {
  it('find names in types', () => {
    const result = typeNames(
      parseTypeOrThrow('(set(a)) => seq(b) -> (c, int)')
    )

    assert.sameDeepMembers(Array.from(result), ['a', 'b', 'c'])
  })
})
