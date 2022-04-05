import { describe, it } from 'mocha'
import { assert } from 'chai'
import { ValueDefinition, defaultDefinitions, DefinitionTable, TypeDefinition } from '../src/definitionsCollector'
import { resolveNames, NameResolutionResult } from '../src/nameResolver'

import { buildModuleWithExpressions, buildModuleWithDefs } from './builders/modules'

describe('nameResolver', () => {
  const valueDefinitions: ValueDefinition[] = defaultDefinitions.valueDefinitions.concat([
    { kind: 'const', identifier: 'TEST_CONSTANT' },
    { kind: 'def', identifier: 'unscoped_def' },
    { kind: 'def', identifier: 'scoped_def', scope: BigInt(2) },
  ])
  const typeDefinitions: TypeDefinition[] = [
    { identifier: 'MY_TYPE', type: { id: BigInt(100), kind: 'int' } },
  ]

  const table: DefinitionTable = { valueDefinitions: valueDefinitions, typeDefinitions: typeDefinitions }

  describe('operator definitions', () => {
    it('finds top level definitions', () => {
      const tntModule = buildModuleWithExpressions(['TEST_CONSTANT.filter(a -> unscoped_def > 0)'])

      const result = resolveNames(tntModule, table)
      assert.deepEqual(result, { kind: 'ok' })
    })

    it('finds scoped definitions', () => {
      const tntModule = buildModuleWithExpressions(['TEST_CONSTANT.filter(a -> scoped_def > 0)'])

      const result = resolveNames(tntModule, table)
      assert.deepEqual(result, { kind: 'ok' })
    })

    it('does not find scoped definitions outside of scope', () => {
      const tntModule = buildModuleWithExpressions(['TEST_CONSTANT', 'scoped_def'])

      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [{ kind: 'value', name: 'scoped_def', definitionName: 'd1', reference: BigInt(3) }],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('find unresolved names inside aplication', () => {
      const tntModule = buildModuleWithExpressions(['head(x)', 'x(TRUE)'])

      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'value', name: 'x', definitionName: 'd0', reference: BigInt(1) },
          { kind: 'value', name: 'x', definitionName: 'd1', reference: BigInt(5) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('find unresolved names inside lambdas', () => {
      const tntModule = buildModuleWithExpressions(['Nat.filter(a -> x > 1)'])

      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'value', name: 'x', definitionName: 'd0', reference: BigInt(2) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('find unresolved names inside lambdas', () => {
      const tntModule = buildModuleWithExpressions(['Nat.filter(a -> x > 1)'])

      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'value', name: 'x', definitionName: 'd0', reference: BigInt(2) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('find unresolved names inside lets', () => {
      const tntModule = buildModuleWithExpressions(['val a = x { TRUE }', 'val a = TRUE { x }'])

      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'value', name: 'x', definitionName: 'd0', reference: BigInt(1) },
          { kind: 'value', name: 'x', definitionName: 'd1', reference: BigInt(8) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })
  })

  describe('type aliases', () => {
    it('resolves defined aliases', () => {
      const tntModule = buildModuleWithDefs([
        'const a: MY_TYPE',
        'var b: MY_TYPE',
      ])
      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = { kind: 'ok' }
      assert.deepEqual(result, expectedResult)
    })

    it('finds unresolved aliases under typed definitions', () => {
      const tntModule = buildModuleWithDefs([
        'const a: UNKNOWN_TYPE_0',
        'var b: UNKNOWN_TYPE_1',
        'type c = UNKNOWN_TYPE_2',
        'assume d = 1',
      ])
      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'type', name: 'UNKNOWN_TYPE_0', definitionName: 'a', reference: BigInt(1) },
          { kind: 'type', name: 'UNKNOWN_TYPE_1', definitionName: 'b', reference: BigInt(3) },
          { kind: 'type', name: 'UNKNOWN_TYPE_2', definitionName: 'c', reference: BigInt(5) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('finds unresolved aliases under chained lets', () => {
      const tntModule = buildModuleWithExpressions(['val x = 1 { val y: set(UNKNOWN_TYPE) = 1 { set(0) } }'])
      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [{ kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(3) }],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('finds unresolved aliases under set()', () => {
      const tntModule = buildModuleWithExpressions(['val x: set(UNKNOWN_TYPE) = 1 { 0 }'])
      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [{ kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(1) }],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('finds unresolved aliases under seq()', () => {
      const tntModule = buildModuleWithExpressions(['val x: seq(UNKNOWN_TYPE) = 1 { 0 }'])
      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [{ kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(1) }],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('finds unresolved aliases under functions', () => {
      const tntModule = buildModuleWithExpressions(['val x: UNKNOWN_TYPE -> OTHER_UNKNOWN_TYPE = 1 { 0 }'])
      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(1) },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(2) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('finds unresolved aliases under operators', () => {
      const tntModule = buildModuleWithExpressions(['val f(x): (UNKNOWN_TYPE) => OTHER_UNKNOWN_TYPE = { unscoped_def } { 0 }'])
      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(1) },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(2) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('finds unresolved aliases under tuples', () => {
      const tntModule = buildModuleWithExpressions(['val x: (UNKNOWN_TYPE, OTHER_UNKNOWN_TYPE) = (1, 2) { 0 }'])
      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(1) },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(2) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('finds unresolved aliases under records', () => {
      const tntModule = buildModuleWithExpressions(['val x: { a: UNKNOWN_TYPE, b: OTHER_UNKNOWN_TYPE } = { a: 1, b: 2 } { 0 }'])
      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(1) },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(2) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('finds unresolved aliases under union', () => {
      const tntModule = buildModuleWithExpressions([
        'val x: | { tag: "a", a: UNKNOWN_TYPE } | { tag: "b", b: OTHER_UNKNOWN_TYPE } = { tag: "a", a: 1 } { 0 }',
      ])
      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(1) },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(3) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })
  })
})
