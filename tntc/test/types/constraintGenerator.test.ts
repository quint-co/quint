import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Constraint } from '../../src/types/base'
import { ConstraintGeneratorVisitor } from '../../src/types/constraintGenerator'
import { left, right } from '@sweet-monads/either'
import { walkModule } from '../../src/IRVisitor'
import { buildModuleWithDefs } from '../builders/ir'
import { constraintToString } from '../../src/types/printing'
import { ErrorTree } from '../../src/errorTree'

describe('ConstraintGeneratorVisitor', () => {
  it('collects constraints from expressions', () => {
    const tntModule = buildModuleWithDefs([
      'def d(S) = S.map(x => x + 10)',
    ])

    const expectedConstraint = '(int, int) => int ~ (t1, int) => t2 /\\ (set(t3), (t3) => t4) => set(t4) ~ (t0, (t1) => t2) => t5'

    const solvingFunction = (c: Constraint) => {
      assert.deepEqual(constraintToString(c), expectedConstraint)
      return right([])
    }

    const visitor = new ConstraintGeneratorVisitor(solvingFunction)
    walkModule(visitor, tntModule)
  })

  it('collects types from variable and constant definitions', () => {
    const tntModule = buildModuleWithDefs([
      'var s: str',
      'const N: int',
      'def a = s',
      'def b = N',
    ])

    const solvingFunction = (_: Constraint) => right([])

    const visitor = new ConstraintGeneratorVisitor(solvingFunction)
    walkModule(visitor, tntModule)

    assert.includeDeepMembers([...visitor.types.entries()], [
      [6n, { kind: 'str', id: 1n }],
      [8n, { kind: 'int', id: 3n }],
    ])
  })

  it('collects solving errors', () => {
    const tntModule = buildModuleWithDefs([
      'def a = 1 + true',
    ])

    const error: ErrorTree = {
      location: 'Mocked location',
      message: 'Mocked message',
      children: [],
    }

    const errors = new Map<bigint, ErrorTree>([[1n, error]])

    const solvingFunction = (_: Constraint) => left(errors)

    const visitor = new ConstraintGeneratorVisitor(solvingFunction)
    walkModule(visitor, tntModule)

    assert.sameDeepMembers(Array.from(visitor.errors.values()), Array.from(errors.values()))
  })

  it('collects internal errors', () => {
    const tntModule = buildModuleWithDefs([
      'def a = undefinedOperator',
      // Everything after the error is ignored. This behavior should be improved
      // after https://github.com/informalsystems/tnt/issues/177
      'def b(x) = a',
      'def c = b(1)',
      'def d = val y = x { a }',

    ])

    const error: ErrorTree = {
      location: 'Generating constraints for undefinedOperator',
      message: 'Signature not found for operator: undefinedOperator',
      children: [],
    }

    const errors = new Map<bigint, ErrorTree>([[1n, error]])

    const solvingFunction = (_: Constraint) => right([])
    const visitor = new ConstraintGeneratorVisitor(solvingFunction)
    walkModule(visitor, tntModule)

    assert.sameDeepMembers(Array.from(visitor.errors.values()), Array.from(errors.values()))
  })
})
