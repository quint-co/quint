import { describe, it } from 'mocha'
import { assert } from 'chai'
import { solveConstraint, Constraint } from '../../src/types/constraintSolver'
import { parseTypeOrThrow } from '../../src/types/parser'

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
