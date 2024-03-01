import { describe, it } from 'mocha'
import { assert } from 'chai'

import { NameResolutionResult } from '../../src/names/base'
import { resolveNames } from '../../src/names/resolver'
import { buildModule, buildModuleWithDecls } from '../builders/ir'
import { zerog } from '../../src/idGenerator'

describe('resolveNames', () => {
  const baseDefs = [
    'const TEST_CONSTANT: int',
    'val unscoped_def = val scoped_def = 10 scoped_def ',
    'type MY_TYPE = int',
  ]

  function resolveNamesForExprs(exprs: string[]): NameResolutionResult {
    const module = buildModule(baseDefs, exprs, undefined, zerog)

    return resolveNames([module])
  }

  function resolveNamesForDefs(defs: string[]): NameResolutionResult {
    const module = buildModuleWithDecls(baseDefs.concat(defs), undefined, zerog)

    return resolveNames([module])
  }

  describe('operator definitions', () => {
    it('finds top level definitions', () => {
      const result = resolveNamesForExprs(['TEST_CONSTANT.filter(a => unscoped_def > 0)'])

      assert.isEmpty(result.errors)
    })

    it('finds scoped definitions inside of scope', () => {
      const result = resolveNamesForExprs(['TEST_CONSTANT.filter(a => a > 0)'])
      assert.isEmpty(result.errors)
    })

    it('finds unused definitions', () => {
      const module = buildModule(baseDefs, ['1 + TEST_CONSTANT'], undefined, zerog)

      const result = resolveNames([module])

      assert.isEmpty(result.errors)
      assert.sameDeepMembers(
        Array.from(result.unusedDefinitions('wrapper')).map(d => d.name),
        ['unscoped_def', 'MY_TYPE', 'd0']
      )
    })

    it('does not find scoped definitions outside of scope', () => {
      const result = resolveNamesForExprs(['TEST_CONSTANT', 'scoped_def'])

      assert.deepEqual(result.errors, [
        { code: 'QNT404', message: "Name 'scoped_def' not found", reference: 0n, data: {} },
      ])
    })

    it('find unresolved names inside application', () => {
      const result = resolveNamesForExprs(['head(x)', 'x(true)'])

      assert.deepEqual(result.errors, [
        { code: 'QNT404', message: "Name 'x' not found", reference: 0n, data: {} },
        { code: 'QNT404', message: "Name 'x' not found", reference: 0n, data: {} },
      ])
    })

    it('find unresolved names inside lambdas', () => {
      const result = resolveNamesForExprs(['Nat.filter(a => x > 1)'])

      assert.deepEqual(result.errors, [{ code: 'QNT404', message: "Name 'x' not found", reference: 0n, data: {} }])
    })

    it('find unresolved names inside lets', () => {
      const result = resolveNamesForExprs(['val a = x { true }', 'val b = true { x }'])

      assert.deepEqual(result.errors, [
        { code: 'QNT404', message: "Name 'x' not found", reference: 0n, data: {} },
        { code: 'QNT404', message: "Name 'x' not found", reference: 0n, data: {} },
      ])
    })
  })

  describe('type aliases', () => {
    it('resolves defined aliases', () => {
      const result = resolveNamesForDefs(['const a: MY_TYPE', 'var b: a -> Set[a]'])

      assert.isEmpty(result.errors)
    })

    it('finds unresolved aliases under typed definitions', () => {
      const result = resolveNamesForDefs([
        'const a: UNKNOWN_TYPE_0',
        'var b: UNKNOWN_TYPE_1',
        'type C[t] = Set[t]',
        'assume d = 1',
      ])

      assert.deepEqual(result.errors, [
        { code: 'QNT404', message: "Type alias 'UNKNOWN_TYPE_0' not found", reference: 0n, data: {} },
        { code: 'QNT404', message: "Type alias 'UNKNOWN_TYPE_1' not found", reference: 0n, data: {} },
      ])
    })

    it('finds unresolved aliases under chained lets', () => {
      const result = resolveNamesForExprs(['val x = 1 { val y: Set[UNKNOWN_TYPE] = 1 { Set(0) } }'])

      assert.deepEqual(result.errors, [
        { code: 'QNT404', message: "Type alias 'UNKNOWN_TYPE' not found", reference: 0n, data: {} },
      ])
    })

    it('finds unresolved aliases under Set', () => {
      const result = resolveNamesForExprs(['val x: Set[UNKNOWN_TYPE] = 1 { 0 }'])

      assert.deepEqual(result.errors, [
        { code: 'QNT404', message: "Type alias 'UNKNOWN_TYPE' not found", reference: 0n, data: {} },
      ])
    })

    it('finds unresolved aliases under List', () => {
      const result = resolveNamesForExprs(['val x: List[UNKNOWN_TYPE] = 1 { 0 }'])

      assert.deepEqual(result.errors, [
        { code: 'QNT404', message: "Type alias 'UNKNOWN_TYPE' not found", reference: 0n, data: {} },
      ])
    })

    it('finds unresolved aliases under functions', () => {
      const result = resolveNamesForExprs(['val x: UNKNOWN_TYPE -> OTHER_UNKNOWN_TYPE = 1 { 0 }'])

      assert.deepEqual(result.errors, [
        { code: 'QNT404', message: "Type alias 'UNKNOWN_TYPE' not found", reference: 0n, data: {} },
        { code: 'QNT404', message: "Type alias 'OTHER_UNKNOWN_TYPE' not found", reference: 0n, data: {} },
      ])
    })

    it('finds unresolved aliases under operators', () => {
      const result = resolveNamesForExprs(['val f(x): (UNKNOWN_TYPE) => OTHER_UNKNOWN_TYPE = { unscoped_def } { 0 }'])

      assert.deepEqual(result.errors, [
        { code: 'QNT404', message: "Type alias 'UNKNOWN_TYPE' not found", reference: 0n, data: {} },
        { code: 'QNT404', message: "Type alias 'OTHER_UNKNOWN_TYPE' not found", reference: 0n, data: {} },
      ])
    })

    it('finds unresolved aliases under tuples', () => {
      const result = resolveNamesForExprs(['val x: (UNKNOWN_TYPE, OTHER_UNKNOWN_TYPE) = (1, 2) { 0 }'])

      assert.deepEqual(result.errors, [
        { code: 'QNT404', message: "Type alias 'UNKNOWN_TYPE' not found", reference: 0n, data: {} },
        { code: 'QNT404', message: "Type alias 'OTHER_UNKNOWN_TYPE' not found", reference: 0n, data: {} },
      ])
    })

    it('finds unresolved aliases under records', () => {
      const result = resolveNamesForExprs(['val x: { a: UNKNOWN_TYPE, b: OTHER_UNKNOWN_TYPE } = { a: 1, b: 2 } { 0 }'])

      assert.deepEqual(result.errors, [
        { code: 'QNT404', message: "Type alias 'UNKNOWN_TYPE' not found", reference: 0n, data: {} },
        { code: 'QNT404', message: "Type alias 'OTHER_UNKNOWN_TYPE' not found", reference: 0n, data: {} },
      ])
    })
  })
})
