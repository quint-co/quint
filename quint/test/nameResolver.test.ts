import { describe, it } from 'mocha'
import { assert } from 'chai'
import { defaultValueDefinitions } from '../src/definitionsCollector'
import { LookupTable, newTable } from '../src/lookupTable'
import { resolveNames } from '../src/nameResolver'

import { buildModuleWithDefs, buildModuleWithExpressions } from './builders/ir'
import { ScopeTree } from '../src/scoping'

describe('nameResolver', () => {
  const table: LookupTable = newTable({
    valueDefinitions: [
      ...defaultValueDefinitions(),
      { kind: 'const', identifier: 'TEST_CONSTANT' },
      { kind: 'def', identifier: 'unscoped_def' },
      { kind: 'def', identifier: 'scoped_def', scope: 2n },
    ],
    typeDefinitions: [
      { identifier: 'MY_TYPE', type: { id: 100n, kind: 'int' } },
    ],
  })

  const moduleName = 'wrapper'
  const dummyScopeTree: ScopeTree = { value: 0n, children: [] }

  describe('operator definitions', () => {
    it('finds top level definitions', () => {
      const quintModule = buildModuleWithExpressions(['TEST_CONSTANT.filter(a => unscoped_def > 0)'])

      const result = resolveNames(quintModule, table, dummyScopeTree)
      assert.isTrue(result.isRight())
    })

    it('finds scoped definitions', () => {
      const quintModule = buildModuleWithExpressions(['TEST_CONSTANT.filter(a => scoped_def > 0)'])
      const dummyScopeTree: ScopeTree = {
        value: 0n,
        children: [
          { value: 1n, children: [] },
          { value: 2n, children: [] },
        ],
      }

      const result = resolveNames(quintModule, table, dummyScopeTree)
      assert.isTrue(result.isRight())
    })

    it('does not find scoped definitions outside of scope', () => {
      const quintModule = buildModuleWithExpressions(['TEST_CONSTANT', 'scoped_def'])

      const result = resolveNames(quintModule, table, dummyScopeTree)

      result
        .mapLeft(errors => assert.deepEqual(errors, [
          { kind: 'value', name: 'scoped_def', definitionName: 'd1', moduleName, reference: 3n },
        ]))
        .map(_ => assert.fail('Expected errors'))
    })

    it('find unresolved names inside application', () => {
      const quintModule = buildModuleWithExpressions(['head(x)', 'x(true)'])

      const result = resolveNames(quintModule, table, dummyScopeTree)

      result
        .mapLeft(errors => assert.deepEqual(errors, [
          { kind: 'value', name: 'x', definitionName: 'd0', moduleName, reference: 1n },
          { kind: 'value', name: 'x', definitionName: 'd1', moduleName, reference: 5n },
        ]))
        .map(_ => assert.fail('Expected errors'))
    })

    it('find unresolved names inside lambdas', () => {
      const quintModule = buildModuleWithExpressions(['Nat.filter(a => x > 1)'])

      const result = resolveNames(quintModule, table, dummyScopeTree)

      result
        .mapLeft(errors => assert.deepEqual(errors, [
          { kind: 'value', name: 'x', definitionName: 'd0', moduleName, reference: 2n },
        ]))
        .map(_ => assert.fail('Expected errors'))
    })

    it('find unresolved names inside lambdas', () => {
      const quintModule = buildModuleWithExpressions(['Nat.filter(a => x > 1)'])

      const result = resolveNames(quintModule, table, dummyScopeTree)

      result
        .mapLeft(errors => assert.deepEqual(errors, [
          { kind: 'value', name: 'x', definitionName: 'd0', moduleName, reference: 2n },
        ]))
        .map(_ => assert.fail('Expected errors'))
    })

    it('find unresolved names inside lets', () => {
      const quintModule = buildModuleWithExpressions(['val a = x { true }', 'val b = true { x }'])

      const result = resolveNames(quintModule, table, dummyScopeTree)

      result
        .mapLeft(errors => assert.deepEqual(errors, [
          { kind: 'value', name: 'x', definitionName: 'a', moduleName, reference: 1n },
          { kind: 'value', name: 'x', definitionName: 'b', moduleName, reference: 8n },
        ]))
        .map(_ => assert.fail('Expected errors'))
    })
  })

  describe('type aliases', () => {
    it('resolves defined aliases', () => {
      const quintModule = buildModuleWithDefs([
        'const a: MY_TYPE',
        'var b: a -> Set[a]',
      ])
      const result = resolveNames(quintModule, table, dummyScopeTree)

      assert.isTrue(result.isRight())
    })

    it('finds unresolved aliases under typed definitions', () => {
      const quintModule = buildModuleWithDefs([
        'const a: UNKNOWN_TYPE_0',
        'var b: UNKNOWN_TYPE_1',
        'type C = Set[t]',
        'assume d = 1',
      ])
      const result = resolveNames(quintModule, table, dummyScopeTree)

      result
        .mapLeft(errors => assert.deepEqual(errors, [
          { kind: 'type', name: 'UNKNOWN_TYPE_0', definitionName: 'a', moduleName, reference: 1n },
          { kind: 'type', name: 'UNKNOWN_TYPE_1', definitionName: 'b', moduleName, reference: 3n },
        ]))
        .map(_ => assert.fail('Expected errors'))
    })

    it('finds unresolved aliases under chained lets', () => {
      const quintModule = buildModuleWithExpressions(['val x = 1 { val y: Set[UNKNOWN_TYPE] = 1 { Set(0) } }'])
      const result = resolveNames(quintModule, table, dummyScopeTree)

      result
        .mapLeft(errors => assert.deepEqual(errors, [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'y', moduleName, reference: 3n },
        ]))
        .map(_ => assert.fail('Expected errors'))
    })

    it('finds unresolved aliases under Set', () => {
      const quintModule = buildModuleWithExpressions(['val x: Set[UNKNOWN_TYPE] = 1 { 0 }'])
      const result = resolveNames(quintModule, table, dummyScopeTree)

      result
        .mapLeft(errors => assert.deepEqual(errors, [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'x', moduleName, reference: 1n },
        ]))
        .map(_ => assert.fail('Expected errors'))
    })

    it('finds unresolved aliases under List', () => {
      const quintModule = buildModuleWithExpressions(['val x: List[UNKNOWN_TYPE] = 1 { 0 }'])
      const result = resolveNames(quintModule, table, dummyScopeTree)

      result
        .mapLeft(errors => assert.deepEqual(errors, [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'x', moduleName, reference: 1n },
        ]))
        .map(_ => assert.fail('Expected errors'))
    })

    it('finds unresolved aliases under functions', () => {
      const quintModule = buildModuleWithExpressions(['val x: UNKNOWN_TYPE -> OTHER_UNKNOWN_TYPE = 1 { 0 }'])
      const result = resolveNames(quintModule, table, dummyScopeTree)

      result
        .mapLeft(errors => assert.deepEqual(errors, [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'x', moduleName, reference: 1n },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'x', moduleName, reference: 2n },
        ]))
        .map(_ => assert.fail('Expected errors'))
    })

    it('finds unresolved aliases under operators', () => {
      const quintModule = buildModuleWithExpressions(['val f(x): (UNKNOWN_TYPE) => OTHER_UNKNOWN_TYPE = { unscoped_def } { 0 }'])
      const result = resolveNames(quintModule, table, dummyScopeTree)

      result
        .mapLeft(errors => assert.deepEqual(errors, [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'f', moduleName, reference: 1n },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'f', moduleName, reference: 2n },
        ]))
        .map(_ => assert.fail('Expected errors'))
    })

    it('finds unresolved aliases under tuples', () => {
      const quintModule = buildModuleWithExpressions(['val x: (UNKNOWN_TYPE, OTHER_UNKNOWN_TYPE) = (1, 2) { 0 }'])
      const result = resolveNames(quintModule, table, dummyScopeTree)

      result
        .mapLeft(errors => assert.deepEqual(errors, [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'x', moduleName, reference: 1n },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'x', moduleName, reference: 2n },
        ]))
        .map(_ => assert.fail('Expected errors'))
    })

    it('finds unresolved aliases under records', () => {
      const quintModule = buildModuleWithExpressions(['val x: { a: UNKNOWN_TYPE, b: OTHER_UNKNOWN_TYPE } = { a: 1, b: 2 } { 0 }'])
      const result = resolveNames(quintModule, table, dummyScopeTree)

      result
        .mapLeft(errors => assert.deepEqual(errors, [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'x', moduleName, reference: 1n },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'x', moduleName, reference: 2n },
        ]))
        .map(_ => assert.fail('Expected errors'))
    })

    it('finds unresolved aliases under union', () => {
      const quintModule = buildModuleWithExpressions([
        'val x: | { tag: "a", a: UNKNOWN_TYPE } | { tag: "b", b: OTHER_UNKNOWN_TYPE } = { tag: "a", a: 1 } { 0 }',
      ])
      const result = resolveNames(quintModule, table, dummyScopeTree)

      result
        .mapLeft(errors => assert.deepEqual(errors, [
          { kind: 'type', name: 'UNKNOWN_TYPE', definitionName: 'x', moduleName, reference: 1n },
          { kind: 'type', name: 'OTHER_UNKNOWN_TYPE', definitionName: 'x', moduleName, reference: 2n },
        ]))
        .map(_ => assert.fail('Expected errors'))
    })
  })
})
