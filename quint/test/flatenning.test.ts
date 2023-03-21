import { assert } from 'chai'
import { describe, it } from 'mocha'
import { collectDefinitions } from '../src/definitionsCollector'
import { scanConflicts } from '../src/definitionsScanner'
import { flatten } from '../src/flattening'
import { newIdGenerator } from '../src/idGenerator'
import { resolveImports } from '../src/importResolver'
import { definitionToString } from '../src/IRprinting'
import { resolveNames } from '../src/nameResolver'
import { quintErrorToString } from '../src/quintError'
import { treeFromModule } from '../src/scoping'
import { buildModuleWithDefs } from './builders/ir'
import { collectIds } from './util'

describe('flatten', () => {
  function assertFlatennedDefs(baseDefs: string[], defs: string[], expectedDefs: string[]): void {
    const idGenerator = newIdGenerator()

    const moduleA = buildModuleWithDefs(baseDefs, 'A', idGenerator)
    const tableA = collectDefinitions(moduleA)
    const lookupTableA = resolveNames(moduleA, tableA, treeFromModule(moduleA)).unwrap()

    const module = buildModuleWithDefs(defs, undefined, idGenerator)
    const table = collectDefinitions(module)
    const [errors, tableWithImports] = resolveImports(module, new Map([
      ['A', tableA],
      ['wrapper', table],
    ]))

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(quintErrorToString)}`)

    const lookupTable = new Map([
      ...lookupTableA.entries(),
      ...resolveNames(module, tableWithImports, treeFromModule(module)).unwrap().entries(),
    ])

    const flattenedModule = flatten(module, lookupTable, new Map([
      ['A', moduleA],
      ['wrapper', module],
    ]))

    it('flattens instances', () => {
      assert.sameDeepMembers(flattenedModule.defs.map(def => definitionToString(def)), expectedDefs)
    })

    it('does not repeat ids', () => {
      const ids = collectIds(flattenedModule)
      assert.notDeepInclude(collectIds(moduleA), ids)
      assert.sameDeepMembers(ids, [...new Set(ids)])
    })

    it('does not have conflicting definitions', () => {
      assert.isTrue(scanConflicts(table, treeFromModule(module)).isRight())
    })
  }

  describe('multiple instances', () => {
    const baseDefs = [
      'const N: int',
      'val x = N + 1',
    ]

    const defs = [
      'module A1 = A(N = 1)',
      'module A2 = A(N = 2)',
    ]

    const expectedDefs = [
      'pure val A1::N: int = 1',
      'val A1::x = iadd(A1::N, 1)',
      'pure val A2::N: int = 2',
      'val A2::x = iadd(A2::N, 1)',
    ]

    assertFlatennedDefs(baseDefs, defs, expectedDefs)
  })

  describe('single instance with several definitions', () => {
    const baseDefs = [
      'const N: int',
      'var x: int',
      'pure def f(a) = a + 1',
      `action V = x' = f(x)`,
      'assume T = N > 0',
      'def lam = val b = 1 { a => b + a }',
      'def lam2 = val b = 1 { a => b + a }',

    ]

    const defs = [
      'module A1 = A(N = 1)',
    ]

    const expectedDefs = [
      'pure val A1::N: int = 1',
      'var A1::x: int',
      'pure def A1::f = (a => iadd(a, 1))',
      `action A1::V = assign(A1::x, A1::f(A1::x))`,
      'assume A1::T = igt(A1::N, 0)',
      'def A1::lam = val A1::b = 1 { (a => iadd(A1::b, a)) }',
      'def A1::lam2 = val A1::b = 1 { (a => iadd(A1::b, a)) }',
    ]

    assertFlatennedDefs(baseDefs, defs, expectedDefs)
  })
})
