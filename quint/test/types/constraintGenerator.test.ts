import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Constraint } from '../../src/types/base'
import { ConstraintGeneratorVisitor, SolvingFunctionType } from '../../src/types/constraintGenerator'
import { left, right } from '@sweet-monads/either'
import { walkModule } from '../../src/ir/IRVisitor'
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
      '(int, int) => int ~ (t_x_9, int) => _t0 /\\ (Set[_t1], (_t1) => _t2) => Set[_t2] ~ (t_S_7, (t_x_9) => _t0) => _t3'

    const solvingFunction = (_: LookupTable, c: Constraint) => {
      assert.deepEqual(constraintToString(c), expectedConstraint)
      return right([])
    }

    visitModuleWithDefs(defs, solvingFunction)
  })

  it('handles underscore', () => {
    const defs = ['def d(S) = S.map(_ => 10)']

    const expectedConstraint = '(Set[_t1], (_t1) => _t2) => Set[_t2] ~ (t_S_7, (_t0) => int) => _t3'

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

  function testArityError(def: string, location: string, message: string) {
    const defs = [def]

    const solvingFunction: SolvingFunctionType = (_: LookupTable, _c: Constraint) => right([])

    const visitor = visitModuleWithDefs(defs, solvingFunction)
    const [errors, _types] = visitor.getResult()

    const [error] = Array.from(errors.values())[0].children

    assert.equal(error.location, location, 'unexpected error location')
    assert.equal(error.message, message, 'unexpected error message')
  }

  it('catches invalid arity on Rec operator', () => {
    testArityError(
      'val x = Rec("a")',
      'Checking arity for application of Rec',
      'Operator expects even number of arguments but was given 1'
    )
  })

  it('catches invalid arity on field operator', () => {
    testArityError(
      'val x = Rec("a", 1).field()',
      'Checking arity for application of field',
      'Operator expects 2 arguments but was given 1'
    )
  })

  it('catches invalid arity on fieldNames operator', () => {
    testArityError(
      'val x = Rec("a", 1).fieldNames(1)',
      'Checking arity for application of fieldNames',
      'Operator expects 1 arguments but was given 2'
    )
  })

  it('catches invalid arity on with operator', () => {
    testArityError(
      'val x = Rec("a", 1).with("a", 1, 2)',
      'Checking arity for application of with',
      'Operator expects 3 arguments but was given 4'
    )
  })

  it('catches invalid arity on item operator', () => {
    testArityError(
      'val x = (0, 1).item()',
      'Checking arity for application of item',
      'Operator expects 2 arguments but was given 1'
    )
  })

  it('catches invalid arity on variant operator', () => {
    testArityError(
      'val x = variant("foo")',
      'Checking arity for application of variant',
      'Operator expects 2 arguments but was given 1'
    )
  })

  it('catches invalid arity on matchVariant operator', () => {
    testArityError(
      'val x = matchVariant("foo", "A")',
      'Checking arity for application of matchVariant',
      'Operator expects odd number of arguments but was given 2'
    )
  })
})
