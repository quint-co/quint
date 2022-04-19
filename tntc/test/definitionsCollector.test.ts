import { describe, it } from 'mocha'
import { assert } from 'chai'
import { collectDefinitions } from '../src/definitionsCollector'
import { buildModuleWithDefs } from './builders/ir'

describe('collectDefinitions', () => {
  describe('collecting operator names', () => {
    it('collects constant definitions', () => {
      const tntModule = buildModuleWithDefs(['const TEST_CONSTANT: int'])

      const result = collectDefinitions(tntModule)

      assert.deepInclude(result.valueDefinitions, { kind: 'const', identifier: 'TEST_CONSTANT', reference: BigInt(2) })
    })

    it('collects variable definitions', () => {
      const tntModule = buildModuleWithDefs(['var test_variable: int'])

      const result = collectDefinitions(tntModule)

      assert.deepInclude(result.valueDefinitions, { kind: 'var', identifier: 'test_variable', reference: BigInt(2) })
    })

    it('collects operator definitions and its parameters including a scope', () => {
      const tntModule = buildModuleWithDefs(['def test_operator(x) = x + 1'])

      const result = collectDefinitions(tntModule)

      assert.includeDeepMembers(result.valueDefinitions, [
        { kind: 'def', identifier: 'test_operator', reference: BigInt(4) },
        { kind: 'def', identifier: 'x', reference: BigInt(4), scope: BigInt(4) },
      ])
    })

    it('collects names from application inside definition body', () => {
      const tntModule = buildModuleWithDefs(['def test_operator = S.filter(x -> x > 0)'])

      const result = collectDefinitions(tntModule)

      assert.includeDeepMembers(result.valueDefinitions, [
        { kind: 'def', identifier: 'test_operator', reference: BigInt(7) },
        { kind: 'def', identifier: 'x', reference: BigInt(5), scope: BigInt(5) },
      ])
    })

    it('collects names from let inside definition body', () => {
      const tntModule = buildModuleWithDefs(['def test_operator = val x = 10 { x > 0 }'])

      const result = collectDefinitions(tntModule)

      assert.includeDeepMembers(result.valueDefinitions, [
        { kind: 'def', identifier: 'test_operator', reference: BigInt(7) },
        { kind: 'val', identifier: 'x', reference: BigInt(2), scope: BigInt(6) },
      ])
    })

    it('collects instances and scoped variables inside parameters', () => {
      const tntModule = buildModuleWithDefs([
        'module test_module { def a = 2 module nested_module { def b = 3 } }',
        'module test_module_instance = test_module(a = val x = 10 {x})',
      ])

      const result = collectDefinitions(tntModule)

      assert.includeDeepMembers(result.valueDefinitions, [
        { kind: 'namespace', identifier: 'test_module', reference: BigInt(8) },
        { kind: 'namespace', identifier: 'test_module_instance', reference: BigInt(13) },
        { kind: 'def', identifier: 'test_module_instance::a', reference: BigInt(13) },
        { kind: 'namespace', identifier: 'test_module_instance::nested_module', reference: BigInt(13) },
        { kind: 'def', identifier: 'test_module_instance::nested_module::b', reference: BigInt(13) },
        { kind: 'val', identifier: 'x', reference: BigInt(10), scope: BigInt(12) },
      ])
    })

    it('collects module definitions', () => {
      const tntModule = buildModuleWithDefs(['module test_module { module nested_module { def a = 1 } }'])

      const result = collectDefinitions(tntModule)

      assert.includeDeepMembers(result.valueDefinitions, [
        { kind: 'namespace', identifier: 'test_module', reference: BigInt(6) },
        { kind: 'namespace', identifier: 'test_module::nested_module', reference: BigInt(6) },
        { kind: 'def', identifier: 'test_module::nested_module::a', reference: BigInt(6) },
      ])
    })

    it('collects assume definitions and scoped variables in body', () => {
      const tntModule = buildModuleWithDefs(['assume test_assumption = N > val x = 2 { x }'])

      const result = collectDefinitions(tntModule)

      assert.includeDeepMembers(result.valueDefinitions, [
        { kind: 'assumption', identifier: 'test_assumption', reference: BigInt(7) },
        { kind: 'val', identifier: 'x', reference: BigInt(3), scope: BigInt(5) },
      ])
    })

    it('collects imported module\'s definitions as unscoped definitions', () => {
      const tntModule = buildModuleWithDefs([
        'module test_module { def a = 1 module nested_module { def b = 1 } }',
        'import test_module.*',
      ])

      const result = collectDefinitions(tntModule)

      assert.includeDeepMembers(result.valueDefinitions, [
        { kind: 'namespace', identifier: 'test_module', reference: BigInt(8) },
        { kind: 'def', identifier: 'test_module::a', reference: BigInt(8) },
        { kind: 'namespace', identifier: 'test_module::nested_module', reference: BigInt(8) },
        { kind: 'def', identifier: 'test_module::nested_module::b', reference: BigInt(8) },
        { kind: 'def', identifier: 'a', reference: BigInt(9) },
        // After import
        { kind: 'namespace', identifier: 'nested_module', reference: BigInt(9) },
        { kind: 'def', identifier: 'nested_module::b', reference: BigInt(9) },
      ])
    })

    it('collects imported module\'s named definition as unscoped definition', () => {
      const tntModule = buildModuleWithDefs([
        'module test_module { def a = 1 }',
        'import test_module.a',
      ])

      const result = collectDefinitions(tntModule)

      assert.deepInclude(result.valueDefinitions, { kind: 'def', identifier: 'a', reference: BigInt(5) })
    })
  })

  describe('collecting type aliases', () => {
    it('collects aliases from typedefs', () => {
      const tntModule = buildModuleWithDefs(['type TEST_TYPE = int'])

      const result = collectDefinitions(tntModule)

      assert.deepInclude(result.typeDefinitions, { type: { id: BigInt(1), kind: 'int' }, identifier: 'TEST_TYPE', reference: BigInt(2) })
    })
  })
})
