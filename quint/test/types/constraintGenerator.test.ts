import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Constraint } from '../../src/types/base'
import { ConstraintGeneratorVisitor, SolvingFunctionType } from '../../src/types/constraintGenerator'
import { left, right } from '@sweet-monads/either'
import { walkModule } from '../../src/IRVisitor'
import { constraintToString } from '../../src/types/printing'
import { ErrorTree } from '../../src/errorTree'
import { LookupTable } from '../../src/names/base'
import { parseMockedModule } from '../util'

describe('ConstraintGeneratorVisitor', () => {
  const baseDefs = ['var s: str', 'var y: int', 'const N: int']

  function visitModuleWithDefs(defs: string[], solvingFunction: SolvingFunctionType): ConstraintGeneratorVisitor {
    const text = `module wrapper { ${baseDefs.concat(defs).join('\n')} }`
    const { modules, table } = parseMockedModule(text)

    const visitor = new ConstraintGeneratorVisitor(solvingFunction, table)
    walkModule(visitor, modules[0])

    return visitor
  }

  it('collects constraints from expressions', () => {
    const defs = ['def d(S) = S.map(x => x + 10)']

    const expectedConstraint =
      '(int, int) => int ~ (t_x_9, int) => t0 /\\ (Set[t1], (t1) => t2) => Set[t2] ~ (t_S_7, (t_x_9) => t0) => t3'

    const solvingFunction = (_: LookupTable, c: Constraint) => {
      assert.deepEqual(constraintToString(c), expectedConstraint)
      return right([])
    }

    visitModuleWithDefs(defs, solvingFunction)
  })

  it('handles underscore', () => {
    const defs = ['def d(S) = S.map(_ => 10)']

    const expectedConstraint = '(Set[t1], (t1) => t2) => Set[t2] ~ (t_S_7, (t0) => int) => t3'

    const solvingFunction = (_: LookupTable, c: Constraint) => {
      assert.deepEqual(constraintToString(c), expectedConstraint)
      return right([])
    }

    visitModuleWithDefs(defs, solvingFunction)
  })

  it('collects types from variable and constant definitions', () => {
    const defs = ['def a = s', 'def b = N']

    const solvingFunction = (_: LookupTable, _c: Constraint) => right([])

    const visitor = visitModuleWithDefs(defs, solvingFunction)
    const [errors, types] = visitor.getResult()

    assert.isEmpty(errors)
    assert.includeDeepMembers(
      [...types.entries()],
      [
        [7n, { typeVariables: new Set([]), rowVariables: new Set([]), type: { kind: 'str', id: 1n } }],
        [9n, { typeVariables: new Set([]), rowVariables: new Set([]), type: { kind: 'int', id: 5n } }],
      ]
    )
  })

  it('collects solving errors', () => {
    const defs = ['def a = 1 + true']

    const error: ErrorTree = {
      location: 'Mocked location',
      message: 'Mocked message',
      children: [],
    }

    const solvingErrors = new Map<bigint, ErrorTree>([[1n, error]])

    const solvingFunction = (_: LookupTable, _c: Constraint) => left(solvingErrors)

    const visitor = visitModuleWithDefs(defs, solvingFunction)
    const [errors, _types] = visitor.getResult()

    assert.sameDeepMembers(Array.from(errors.entries()), Array.from(solvingErrors.entries()))
  })

  it('collects internal errors', () => {
    const defs = [
      'val a: t = 1',
      // Everything after the error is ignored. This behavior should be improved
      // after https://github.com/informalsystems/quint/issues/177
      'def b(x) = a',
      'def c = b(1)',
      'def d = val m = 1 { a }',
    ]

    const solvingFunction: SolvingFunctionType = (_: LookupTable, _c: Constraint) =>
      right([{ kind: 'type', name: 't', value: { kind: 'int', id: 6n } }])

    const error: ErrorTree = {
      location: 'Checking type annotation t',
      children: [
        {
          location: 'Checking variable t',
          message: 'Type annotation is too general: t should be int',
          children: [],
        },
      ],
    }

    const visitor = visitModuleWithDefs(defs, solvingFunction)
    const [errors, _types] = visitor.getResult()

    assert.sameDeepMembers(Array.from(errors.values()), [error])
  })
})
