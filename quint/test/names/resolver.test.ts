import { describe, it } from 'mocha'
import { assert } from 'chai'

import { NameResolutionResult } from '../../src/names/base'
import { resolveNames } from '../../src/names/resolver'
import { buildModule, buildModuleWithDecls } from '../builders/ir'
import { IdGenerator, newIdGenerator, zerog } from '../../src/idGenerator'

describe('resolveNames', () => {
  const baseDefs = [
    'const TEST_CONSTANT: int',
    'val unscoped_def = val scoped_def = 10 scoped_def ',
    'type MY_TYPE = int',
  ]

  function resolveNamesForExprs(exprs: string[], idGenerator?: IdGenerator): NameResolutionResult {
    const idGen = idGenerator ?? zerog
    const module = buildModule(baseDefs, exprs, undefined, idGen)

    return resolveNames([module])
  }

  function resolveNamesForDefs(defs: string[], idGenerator?: IdGenerator): NameResolutionResult {
    const idGen = idGenerator ?? zerog
    const module = buildModuleWithDecls(baseDefs.concat(defs), undefined, idGen)

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

    it('finds a definition itself with depth information', () => {
      const result = resolveNamesForExprs([], newIdGenerator())

      assert.isEmpty(result.errors)

      const def = [...result.table.values()].find(def => def.name === 'unscoped_def' || def.kind === 'def')

      assert.isNotNull(def)
      assert.deepEqual(result.table.get(def!.id)?.depth, 0)
    })
  })

  describe('shadowing', () => {
    it('resolves shadowed names', () => {
      const result = resolveNamesForDefs(
        ['val shadowing = def foo = (shadowing) => shadowing { foo(1) }', 'val a = shadowing'],
        newIdGenerator()
      )

      assert.isEmpty(result.errors)
      assert.isTrue([...result.table.values()].some(def => def.name === 'shadowing' && def.kind === 'def'))
      assert.isTrue([...result.table.values()].some(def => def.name === 'shadowing' && def.kind === 'param'))
    })

    it('collects depth and shadowing information properly', () => {
      const result = resolveNamesForDefs(['val shadowing = val a = 1 { val a = 2 { a } }'], newIdGenerator())

      assert.isEmpty(result.errors)
      assert.isTrue(
        [...result.table.values()].some(def => def.name === 'a' && def.depth === 2),
        'Could not find first a'
      )
      assert.isTrue(
        [...result.table.values()].some(def => def.name === 'a' && def.depth === 3 && def.shadowing === true),
        'Could not find second a'
      )
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
