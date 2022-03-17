import { describe, it } from 'mocha'
import { assert } from 'chai'
import { NameDefinition, defaultDefinitions, DefinitionTable, TypeDefinition } from '../src/definitionsCollector'
import { resolveNames, NameResolutionResult } from '../src/nameResolver'
import { TntModule, TntEx } from '../src/tntIr'

import { parseExpression } from './builders/expressions'
import { buildModuleWithExpressions } from './builders/modules'

describe('nameResolver', () => {
  const expr = parseExpression('TEST_CONSTANT.filter(x -> set(x))')

  // Dummy expression to generate different scope
  const valueExpr: TntEx = {
    kind: 'bool',
    value: true,
    id: BigInt(20),
    type: { kind: 'bool' },
  }

  const tntModule: TntModule = {
    name: 'Test module',
    id: BigInt(0),
    defs: [
      { kind: 'def', name: 'A', qualifier: 'def', expr: expr, id: BigInt(1), type: { kind: 'int' } },
      { kind: 'def', name: 'B', qualifier: 'def', expr: valueExpr, id: BigInt(2), type: { kind: 'const', name: 'MY_TYPE' } },
    ],
  }

  it('finds top level definitions', () => {
    const nameDefinitions: NameDefinition[] = defaultDefinitions.nameDefinitions.concat([
      {
        identifier: 'TEST_CONSTANT',
        kind: 'const',
      },
      {
        identifier: 'x',
        kind: 'def',
      },
    ])
    const typeDefinitions: TypeDefinition[] = [
      { identifier: 'MY_TYPE', type: { kind: 'int' } },
    ]
    const table: DefinitionTable = { nameDefinitions: nameDefinitions, typeDefinitions: typeDefinitions }

    const result = resolveNames(tntModule, table)
    assert.deepEqual(result, { kind: 'ok' })
  })

  it('finds scoped definitions', () => {
    const nameDefinitions: NameDefinition[] = defaultDefinitions.nameDefinitions.concat([
      {
        identifier: 'TEST_CONSTANT',
        kind: 'const',
      },
      {
        identifier: 'x',
        kind: 'def',
        scope: BigInt(2),
      },
    ])
    const typeDefinitions: TypeDefinition[] = [
      { identifier: 'MY_TYPE', type: { kind: 'int' } },
    ]
    const table: DefinitionTable = { nameDefinitions: nameDefinitions, typeDefinitions: typeDefinitions }

    const result = resolveNames(tntModule, table)
    assert.deepEqual(result, { kind: 'ok' })
  })

  it('does not find scoped definitions outside of scope', () => {
    const nameDefinitions: NameDefinition[] = defaultDefinitions.nameDefinitions.concat([
      {
        identifier: 'TEST_CONSTANT',
        kind: 'const',
      },
      {
        identifier: 'x',
        kind: 'def',
        scope: BigInt(20),
      },
    ])
    const typeDefinitions: TypeDefinition[] = [
      { identifier: 'MY_TYPE', type: { kind: 'int' } },
    ]
    const table: DefinitionTable = { nameDefinitions: nameDefinitions, typeDefinitions: typeDefinitions }

    const result = resolveNames(tntModule, table)
    const expectedResult: NameResolutionResult = {
      kind: 'error',
      errors: [{ kind: 'operator', name: 'x', definitionName: 'A', reference: BigInt(2) }],
    }
    assert.deepEqual(result, expectedResult)
  })

  describe('type aliases', () => {
    const nameDefinitions: NameDefinition[] = defaultDefinitions.nameDefinitions.concat([
      { identifier: 'TEST_CONSTANT', kind: 'const' },
      { identifier: 'x', kind: 'def' },
    ])
    const typeDefinitions: TypeDefinition[] = [
      { identifier: 'MY_TYPE', type: { kind: 'int' } },
    ]
    const table: DefinitionTable = { nameDefinitions: nameDefinitions, typeDefinitions: typeDefinitions }

    it('find unresolved aliases under set()', () => {
      const tntModule = buildModuleWithExpressions(['val x: set(UNKNOWN_TYPE) = 1 { x }'])
      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [{ kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(2) }],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('find unresolved aliases under seq()', () => {
      const tntModule = buildModuleWithExpressions(['val x: seq(UNKNOWN_TYPE) = 1 { x }'])
      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [{ kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(2) }],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('find unresolved aliases under functions', () => {
      const tntModule = buildModuleWithExpressions(['val x: UNKNOWN_TYPE -> OTHER_UNKNOWN_TYPE = 1 { x }'])
      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(2) },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(2) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('find unresolved aliases under operators', () => {
      const tntModule = buildModuleWithExpressions(['val f(x): (UNKNOWN_TYPE) => OTHER_UNKNOWN_TYPE = { x } { f(1) }'])
      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(2) },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(2) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('find unresolved aliases under tuples', () => {
      const tntModule = buildModuleWithExpressions(['val x: (UNKNOWN_TYPE, OTHER_UNKNOWN_TYPE) = (1, 2) { x }'])
      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(4) },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(4) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('find unresolved aliases under records', () => {
      const tntModule = buildModuleWithExpressions(['val x: { a: UNKNOWN_TYPE, b: OTHER_UNKNOWN_TYPE } = { a: 1, b: 2 } { x }'])
      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(6) },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(6) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })

    it('find unresolved aliases under union', () => {
      const tntModule = buildModuleWithExpressions([
        'val x: | { tag: "a", a: UNKNOWN_TYPE } | { tag: "b", b: OTHER_UNKNOWN_TYPE } = { tag: "a", a: 1 } { x }',
      ])
      const result = resolveNames(tntModule, table)
      const expectedResult: NameResolutionResult = {
        kind: 'error',
        errors: [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(4) },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'd0', reference: BigInt(4) },
        ],
      }
      assert.deepEqual(result, expectedResult)
    })
  })
})
