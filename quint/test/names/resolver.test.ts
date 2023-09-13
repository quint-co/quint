import { describe, it } from 'mocha'
import { assert } from 'chai'

import { Either } from '@sweet-monads/either'
import { QuintError } from '../../src/quintError'
import { LookupTable } from '../../src/names/base'
import { resolveNames } from '../../src/names/resolver'
import { buildModule, buildModuleWithDecls } from '../builders/ir'
import { zerog } from '../../src/idGenerator'

describe('resolveNames', () => {
  const baseDefs = [
    'const TEST_CONSTANT: int',
    'val unscoped_def = val scoped_def = 10 scoped_def ',
    'type MY_TYPE = int',
  ]

  function resolveNamesForExprs(exprs: string[]): Either<QuintError[], LookupTable> {
    const module = buildModule(baseDefs, exprs, undefined, zerog)

    return resolveNames([module]).map(r => r.table)
  }

  function resolveNamesForDefs(defs: string[]): Either<QuintError[], LookupTable> {
    const module = buildModuleWithDecls(baseDefs.concat(defs), undefined, zerog)

    return resolveNames([module]).map(r => r.table)
  }

  describe('operator definitions', () => {
    it('finds top level definitions', () => {
      const result = resolveNamesForExprs(['TEST_CONSTANT.filter(a => unscoped_def > 0)'])

      assert.isTrue(result.isRight())
    })

    it('finds scoped definitions inside of scope', () => {
      const result = resolveNamesForExprs(['TEST_CONSTANT.filter(a => a > 0)'])
      assert.isTrue(result.isRight())
    })

    it('finds unused definitions', () => {
      const module = buildModule(baseDefs, ['1 + TEST_CONSTANT'], undefined, zerog)

      const result = resolveNames([module]).map(r => r.unusedDefinitions)

      result
        .map(unused =>
          assert.sameDeepMembers(
            Array.from(unused('wrapper')).map(d => d.name),
            ['unscoped_def', 'MY_TYPE', 'd0']
          )
        )
        .mapLeft(_ => assert.fail('Expected no errors'))
    })

    it('does not find scoped definitions outside of scope', () => {
      const result = resolveNamesForExprs(['TEST_CONSTANT', 'scoped_def'])

      result
        .mapLeft(errors =>
          assert.deepEqual(errors, [
            { code: 'QNT404', message: "Name 'scoped_def' not found", reference: 0n, data: {} },
          ])
        )
        .map(_ => assert.fail('Expected errors'))
    })

    it('find unresolved names inside application', () => {
      const result = resolveNamesForExprs(['head(x)', 'x(true)'])

      result
        .mapLeft(errors =>
          assert.deepEqual(errors, [
            { code: 'QNT404', message: "Name 'x' not found", reference: 0n, data: {} },
            { code: 'QNT404', message: "Name 'x' not found", reference: 0n, data: {} },
          ])
        )
        .map(_ => assert.fail('Expected errors'))
    })

    it('find unresolved names inside lambdas', () => {
      const result = resolveNamesForExprs(['Nat.filter(a => x > 1)'])

      result
        .mapLeft(errors =>
          assert.deepEqual(errors, [{ code: 'QNT404', message: "Name 'x' not found", reference: 0n, data: {} }])
        )
        .map(_ => assert.fail('Expected errors'))
    })

    it('find unresolved names inside lets', () => {
      const result = resolveNamesForExprs(['val a = x { true }', 'val b = true { x }'])

      result
        .mapLeft(errors =>
          assert.deepEqual(errors, [
            { code: 'QNT404', message: "Name 'x' not found", reference: 0n, data: {} },
            { code: 'QNT404', message: "Name 'x' not found", reference: 0n, data: {} },
          ])
        )
        .map(_ => assert.fail('Expected errors'))
    })
  })

  describe('type aliases', () => {
    it('resolves defined aliases', () => {
      const result = resolveNamesForDefs(['const a: MY_TYPE', 'var b: a -> Set[a]'])

      assert.isTrue(result.isRight())
    })

    it('finds unresolved aliases under typed definitions', () => {
      const result = resolveNamesForDefs([
        'const a: UNKNOWN_TYPE_0',
        'var b: UNKNOWN_TYPE_1',
        'type C = Set[t]',
        'assume d = 1',
      ])

      result
        .mapLeft(errors =>
          assert.deepEqual(errors, [
            { code: 'QNT404', message: "Type alias 'UNKNOWN_TYPE_0' not found", reference: 0n, data: {} },
            { code: 'QNT404', message: "Type alias 'UNKNOWN_TYPE_1' not found", reference: 0n, data: {} },
          ])
        )
        .map(_ => assert.fail('Expected errors'))
    })

    it('finds unresolved aliases under chained lets', () => {
      const result = resolveNamesForExprs(['val x = 1 { val y: Set[UNKNOWN_TYPE] = 1 { Set(0) } }'])

      result
        .mapLeft(errors =>
          assert.deepEqual(errors, [
            { code: 'QNT404', message: "Type alias 'UNKNOWN_TYPE' not found", reference: 0n, data: {} },
          ])
        )
        .map(_ => assert.fail('Expected errors'))
    })

    it('finds unresolved aliases under Set', () => {
      const result = resolveNamesForExprs(['val x: Set[UNKNOWN_TYPE] = 1 { 0 }'])

      result
        .mapLeft(errors =>
          assert.deepEqual(errors, [
            { code: 'QNT404', message: "Type alias 'UNKNOWN_TYPE' not found", reference: 0n, data: {} },
          ])
        )
        .map(_ => assert.fail('Expected errors'))
    })

    it('finds unresolved aliases under List', () => {
      const result = resolveNamesForExprs(['val x: List[UNKNOWN_TYPE] = 1 { 0 }'])

      result
        .mapLeft(errors =>
          assert.deepEqual(errors, [
            { code: 'QNT404', message: "Type alias 'UNKNOWN_TYPE' not found", reference: 0n, data: {} },
          ])
        )
        .map(_ => assert.fail('Expected errors'))
    })

    it('finds unresolved aliases under functions', () => {
      const result = resolveNamesForExprs(['val x: UNKNOWN_TYPE -> OTHER_UNKNOWN_TYPE = 1 { 0 }'])

      result
        .mapLeft(errors =>
          assert.deepEqual(errors, [
            { code: 'QNT404', message: "Type alias 'UNKNOWN_TYPE' not found", reference: 0n, data: {} },
            { code: 'QNT404', message: "Type alias 'OTHER_UNKNOWN_TYPE' not found", reference: 0n, data: {} },
          ])
        )
        .map(_ => assert.fail('Expected errors'))
    })

    it('finds unresolved aliases under operators', () => {
      const result = resolveNamesForExprs(['val f(x): (UNKNOWN_TYPE) => OTHER_UNKNOWN_TYPE = { unscoped_def } { 0 }'])

      result
        .mapLeft(errors =>
          assert.deepEqual(errors, [
            { code: 'QNT404', message: "Type alias 'UNKNOWN_TYPE' not found", reference: 0n, data: {} },
            { code: 'QNT404', message: "Type alias 'OTHER_UNKNOWN_TYPE' not found", reference: 0n, data: {} },
          ])
        )
        .map(_ => assert.fail('Expected errors'))
    })

    it('finds unresolved aliases under tuples', () => {
      const result = resolveNamesForExprs(['val x: (UNKNOWN_TYPE, OTHER_UNKNOWN_TYPE) = (1, 2) { 0 }'])

      result
        .mapLeft(errors =>
          assert.deepEqual(errors, [
            { code: 'QNT404', message: "Type alias 'UNKNOWN_TYPE' not found", reference: 0n, data: {} },
            { code: 'QNT404', message: "Type alias 'OTHER_UNKNOWN_TYPE' not found", reference: 0n, data: {} },
          ])
        )
        .map(_ => assert.fail('Expected errors'))
    })

    it('finds unresolved aliases under records', () => {
      const result = resolveNamesForExprs(['val x: { a: UNKNOWN_TYPE, b: OTHER_UNKNOWN_TYPE } = { a: 1, b: 2 } { 0 }'])

      result
        .mapLeft(errors =>
          assert.deepEqual(errors, [
            { code: 'QNT404', message: "Type alias 'UNKNOWN_TYPE' not found", reference: 0n, data: {} },
            { code: 'QNT404', message: "Type alias 'OTHER_UNKNOWN_TYPE' not found", reference: 0n, data: {} },
          ])
        )
        .map(_ => assert.fail('Expected errors'))
    })

    it('finds unresolved aliases under union', () => {
      const result = resolveNamesForExprs([
        'val x: | { tag: "a", a: UNKNOWN_TYPE } | { tag: "b", b: OTHER_UNKNOWN_TYPE } = { tag: "a", a: 1 } { 0 }',
      ])

      result
        .mapLeft(errors =>
          assert.deepEqual(errors, [
            { code: 'QNT404', message: "Type alias 'UNKNOWN_TYPE' not found", reference: 0n, data: {} },
            { code: 'QNT404', message: "Type alias 'OTHER_UNKNOWN_TYPE' not found", reference: 0n, data: {} },
          ])
        )
        .map(_ => assert.fail('Expected errors'))
    })
  })
})
