import { assert } from 'chai'
import { describe, it } from 'mocha'
import { quintErrorToString } from '../src'
import { collectDefinitions } from '../src/definitionsCollector'
import { flatten } from '../src/flattening'
import { resolveImports } from '../src/importResolver'
import { definitionToString } from '../src/IRprinting'
import { resolveNames } from '../src/nameResolver'
import { treeFromModule } from '../src/scoping'
import { buildModuleWithDefs } from './builders/ir'
import { collectIds } from './util'

describe('flatten', () => {
  const moduleA = buildModuleWithDefs([
    'const N: int',
    'val x = N + 1',
  ], 'A')

  const tableA = collectDefinitions(moduleA)
  const lookupTableA = resolveNames(moduleA, tableA, treeFromModule(moduleA)).unwrap()

  function assertFlatennedDefs(defs: string[], expectedDefs: string[]): void {
    const module = buildModuleWithDefs(defs)
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
      assert.notDeepInclude(collectIds(moduleA), collectIds(flattenedModule))
    })
  }

  describe('multiple instances', () => {
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

    assertFlatennedDefs(defs, expectedDefs)
  })
})
