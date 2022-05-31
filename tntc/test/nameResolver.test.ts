import { describe, it } from 'mocha'
import { assert } from 'chai'
import { ValueDefinition, defaultDefinitions, DefinitionTable, TypeDefinition, DefinitionTableByModule } from '../src/definitionsCollector'
import { resolveNames, NameResolutionResult } from '../src/nameResolver'

import { buildModuleWithExpressions, buildModuleWithDefs } from './builders/ir'
import { ScopeTree } from '../src/scoping'

describe('nameResolver', () => {
  const valueDefinitions: ValueDefinition[] = defaultDefinitions().valueDefinitions.concat([
    { kind: 'const', identifier: 'TEST_CONSTANT' },
    { kind: 'def', identifier: 'unscoped_def' },
    { kind: 'def', identifier: 'scoped_def', scope: BigInt(2) },
  ])
  const typeDefinitions: TypeDefinition[] = [
    { identifier: 'MY_TYPE', type: { id: BigInt(100), kind: 'int' } },
    { identifier: 'a', type: { id: BigInt(101), kind: 'int' } },
  ]

  const moduleName = 'wrapper'
  const table: DefinitionTable = { valueDefinitions: valueDefinitions, typeDefinitions: typeDefinitions }
  const tables: DefinitionTableByModule = new Map<string, DefinitionTable>([[moduleName, table]])
  const dummyScopeTree: ScopeTree = { value: BigInt(0), children: [] }

  describe('operator definitions', () => {
    it('finds top level definitions', () => {
      const tntModule = buildModuleWithExpressions(['TEST_CONSTANT.filter(a => unscoped_def > 0)'])

      const result = resolveNames(tntModule, tables, dummyScopeTree)
      assert.deepEqual(result, { kind: 'ok' })
    })

    it('finds scoped definitions', () => {
      const tntModule = buildModuleWithExpressions(['TEST_CONSTANT.filter(a => scoped_def > 0)'])
      const dummyScopeTree: ScopeTree = {
        value: BigInt(0),
        children: [
          { value: BigInt(1), children: [] },
          { value: BigInt(2), children: [] },
        ],
      }

      const result = resolveNames(tntModule, tables, dummyScopeTree)
      assert.deepEqual(result, { kind: 'ok' })
    })

    it('does not find scoped definitions outside of scope', () => {
      const tntModule = buildModuleWithExpressions(['TEST_CONSTANT', 'scoped_def'])

      const result = resolveNames(tntModule, tables, dummyScopeTree)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [{ kind: 'value', name: 'scoped_def', definitionName: 'd1', moduleName: moduleName, reference: BigInt(3) }],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('find unresolved names inside aplication', () => {
      const tntModule = buildModuleWithExpressions(['head(x)', 'x(true)'])

      const result = resolveNames(tntModule, tables, dummyScopeTree)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'value', name: 'x', definitionName: 'd0', moduleName: moduleName, reference: BigInt(1) },
          { kind: 'value', name: 'x', definitionName: 'd1', moduleName: moduleName, reference: BigInt(5) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('find unresolved names inside lambdas', () => {
      const tntModule = buildModuleWithExpressions(['Nat.filter(a => x > 1)'])

      const result = resolveNames(tntModule, tables, dummyScopeTree)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'value', name: 'x', definitionName: 'd0', moduleName: moduleName, reference: BigInt(2) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('find unresolved names inside lambdas', () => {
      const tntModule = buildModuleWithExpressions(['Nat.filter(a => x > 1)'])

      const result = resolveNames(tntModule, tables, dummyScopeTree)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'value', name: 'x', definitionName: 'd0', moduleName: moduleName, reference: BigInt(2) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('find unresolved names inside lets', () => {
      const tntModule = buildModuleWithExpressions(['val a = x { true }', 'val b = true { x }'])

      const result = resolveNames(tntModule, tables, dummyScopeTree)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'value', name: 'x', definitionName: 'a', moduleName: moduleName, reference: BigInt(1) },
          { kind: 'value', name: 'x', definitionName: 'b', moduleName: moduleName, reference: BigInt(8) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('find unresolved names inside modules', () => {
      const tntModule = buildModuleWithDefs(['module test_module { def a = x }'])

      const result = resolveNames(tntModule, tables, dummyScopeTree)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'value', name: 'x', definitionName: 'a', moduleName: 'test_module', reference: BigInt(1) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })
  })

  describe('type aliases', () => {
    it('resolves defined aliases', () => {
      const tntModule = buildModuleWithDefs([
        'const a: MY_TYPE',
        'var b: a -> set(a)',
      ])
      const result = resolveNames(tntModule, tables, dummyScopeTree)
      const expectedResult: NameResolutionResult = { kind: 'ok' }
      assert.deepEqual(result, expectedResult)
    })

    it('finds unresolved aliases under typed definitions', () => {
      const tntModule = buildModuleWithDefs([
        'const a: UNKNOWN_TYPE_0',
        'var b: UNKNOWN_TYPE_1',
        'type c = set(t)',
        'assume d = 1',
      ])
      const result = resolveNames(tntModule, tables, dummyScopeTree)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'type', name: 'UNKNOWN_TYPE_0', definitionName: 'a', moduleName: moduleName, reference: BigInt(1) },
          { kind: 'type', name: 'UNKNOWN_TYPE_1', definitionName: 'b', moduleName: moduleName, reference: BigInt(3) },
          { kind: 'type', name: 't', definitionName: 'c', moduleName: moduleName, reference: BigInt(5) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('finds unresolved aliases under chained lets', () => {
      const tntModule = buildModuleWithExpressions(['val x = 1 { val y: set(UNKNOWN_TYPE) = 1 { set(0) } }'])
      const result = resolveNames(tntModule, tables, dummyScopeTree)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [{ kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'y', moduleName: moduleName, reference: BigInt(3) }],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('finds unresolved aliases under set()', () => {
      const tntModule = buildModuleWithExpressions(['val x: set(UNKNOWN_TYPE) = 1 { 0 }'])
      const result = resolveNames(tntModule, tables, dummyScopeTree)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [{ kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'x', moduleName: moduleName, reference: BigInt(1) }],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('finds unresolved aliases under seq()', () => {
      const tntModule = buildModuleWithExpressions(['val x: seq(UNKNOWN_TYPE) = 1 { 0 }'])
      const result = resolveNames(tntModule, tables, dummyScopeTree)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [{ kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'x', moduleName: moduleName, reference: BigInt(1) }],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('finds unresolved aliases under functions', () => {
      const tntModule = buildModuleWithExpressions(['val x: UNKNOWN_TYPE -> OTHER_UNKNOWN_TYPE = 1 { 0 }'])
      const result = resolveNames(tntModule, tables, dummyScopeTree)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'x', moduleName: moduleName, reference: BigInt(1) },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'x', moduleName: moduleName, reference: BigInt(2) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('finds unresolved aliases under operators', () => {
      const tntModule = buildModuleWithExpressions(['val f(x): (UNKNOWN_TYPE) => OTHER_UNKNOWN_TYPE = { unscoped_def } { 0 }'])
      const result = resolveNames(tntModule, tables, dummyScopeTree)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'f', moduleName: moduleName, reference: BigInt(1) },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'f', moduleName: moduleName, reference: BigInt(2) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('finds unresolved aliases under tuples', () => {
      const tntModule = buildModuleWithExpressions(['val x: (UNKNOWN_TYPE, OTHER_UNKNOWN_TYPE) = (1, 2) { 0 }'])
      const result = resolveNames(tntModule, tables, dummyScopeTree)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'x', moduleName: moduleName, reference: BigInt(1) },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'x', moduleName: moduleName, reference: BigInt(2) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('finds unresolved aliases under records', () => {
      const tntModule = buildModuleWithExpressions(['val x: { a: UNKNOWN_TYPE, b: OTHER_UNKNOWN_TYPE } = { a: 1, b: 2 } { 0 }'])
      const result = resolveNames(tntModule, tables, dummyScopeTree)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'x', moduleName: moduleName, reference: BigInt(1) },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'x', moduleName: moduleName, reference: BigInt(2) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('finds unresolved aliases under union', () => {
      const tntModule = buildModuleWithExpressions([
        'val x: | { tag: "a", a: UNKNOWN_TYPE } | { tag: "b", b: OTHER_UNKNOWN_TYPE } = { tag: "a", a: 1 } { 0 }',
      ])
      const result = resolveNames(tntModule, tables, dummyScopeTree)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'x', moduleName: moduleName, reference: BigInt(1) },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'x', moduleName: moduleName, reference: BigInt(3) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })
  })
})
