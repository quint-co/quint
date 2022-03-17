import { describe, it } from 'mocha'
import { assert } from 'chai'
import { collectDefinitions, defaultDefinitions } from '../src/definitionsCollector'
import { buildModuleWithDefs } from './builders/modules'

describe('collectDefinitions', () => {
  describe('collecting operator names', () => {
    it('collects constant definitions', () => {
      const tntModule = buildModuleWithDefs(['const TEST_CONSTANT: int'])

      const result = collectDefinitions(tntModule)

      assert.deepInclude(result.nameDefinitions, { kind: 'const', identifier: 'TEST_CONSTANT' })
    })

    it('collects variable definitions', () => {
      const tntModule = buildModuleWithDefs(['var test_variable: int'])

      const result = collectDefinitions(tntModule)

      assert.deepInclude(result.nameDefinitions, { kind: 'var', identifier: 'test_variable' })
    })

    it('collects operator definitions and its parameters including a scope', () => {
      const tntModule = buildModuleWithDefs(['def test_operator(x) = x + 1'])

      const result = collectDefinitions(tntModule)

      assert.includeDeepMembers(result.nameDefinitions, [
        { kind: 'def', identifier: 'test_operator' },
        { kind: 'def', identifier: 'x', scope: BigInt(4) },
      ])
    })

    it('collects names from application inside definition body', () => {
      const tntModule = buildModuleWithDefs(['def test_operator = S.filter(x -> x > 0)'])

      const result = collectDefinitions(tntModule)

      assert.includeDeepMembers(result.nameDefinitions, [
        { kind: 'def', identifier: 'test_operator' },
        { kind: 'def', identifier: 'x', scope: BigInt(5) },
      ])
    })

    it('collects names from let inside definition body', () => {
      const tntModule = buildModuleWithDefs(['def test_operator = val x = 10 { x > 0 }'])

      const result = collectDefinitions(tntModule)

      assert.includeDeepMembers(result.nameDefinitions, [
        { kind: 'def', identifier: 'test_operator' },
        { kind: 'val', identifier: 'x', scope: BigInt(6) },
      ])
    })

    it('collects instances and scoped variables inside parameters', () => {
      const tntModule = buildModuleWithDefs(['module test_module = test_module(a = val x = 10 {x})'])

      const result = collectDefinitions(tntModule)

      assert.includeDeepMembers(result.nameDefinitions, [
        { kind: 'namespace', identifier: 'test_module' },
        { kind: 'val', identifier: 'x', scope: BigInt(4) },
      ])
    })

    it('collects module definitions', () => {
      // TODO: collect definitions inside modules (issue #33)
      const tntModule = buildModuleWithDefs(['module test_module { def a = 1 }'])

      const result = collectDefinitions(tntModule)

      assert.deepInclude(result.nameDefinitions, { kind: 'namespace', identifier: 'test_module' })
    })

    it('collects assume definitions and scoped variables in body', () => {
      const tntModule = buildModuleWithDefs(['assume test_assumption = N > val x = 2 { x }'])

      const result = collectDefinitions(tntModule)

      assert.includeDeepMembers(result.nameDefinitions, [
        { kind: 'assumption', identifier: 'test_assumption' },
        { kind: 'val', identifier: 'x', scope: BigInt(5) },
      ])
    })

    it('does not collect anything from imports', () => {
      const tntModule = buildModuleWithDefs(['import test_module.*'])

      const result = collectDefinitions(tntModule)

      assert.deepEqual(result.nameDefinitions, defaultDefinitions)
    })
  })

  describe('collecting type aliases', () => {
    it('collects aliases from typedefs', () => {
      const tntModule = buildModuleWithDefs(['type TEST_TYPE = int'])

      const result = collectDefinitions(tntModule)

      assert.deepInclude(result.typeDefinitions, { type: { kind: 'int' }, identifier: 'TEST_TYPE' })
    })
  })
})
