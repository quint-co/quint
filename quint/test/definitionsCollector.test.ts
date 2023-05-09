import { describe, it } from 'mocha'
import { assert } from 'chai'
import { collectDefinitions } from '../src/definitionsCollector'
import { buildModuleWithDefs } from './builders/ir'

describe('collectDefinitions', () => {
  describe('collecting operator names', () => {
    it('collects constant definitions', () => {
      const quintModule = buildModuleWithDefs(['const TEST_CONSTANT: int'])

      const result = collectDefinitions(quintModule)

      assert.deepInclude([...result!.valueDefinitions.keys()], 'TEST_CONSTANT')
    })

    it('collects variable definitions', () => {
      const quintModule = buildModuleWithDefs(['var test_variable: int'])

      const result = collectDefinitions(quintModule)

      assert.deepInclude([...result!.valueDefinitions.keys()], 'test_variable')
    })

    it('collects operator definitions and its parameters including a scope', () => {
      const quintModule = buildModuleWithDefs(['def test_operator(x) = x + 1'])

      const result = collectDefinitions(quintModule)

      assert.includeDeepMembers([...result!.valueDefinitions.keys()], ['test_operator', 'x'])
    })

    it('collects names from application inside definition body', () => {
      const quintModule = buildModuleWithDefs(['def test_operator = S.filter(x => x > 0)'])

      const result = collectDefinitions(quintModule)

      assert.includeDeepMembers([...result!.valueDefinitions.keys()], ['test_operator', 'x'])
    })

    it('collects names from let inside definition body', () => {
      const quintModule = buildModuleWithDefs(['def test_operator = val x = 10 { x > 0 }'])

      const result = collectDefinitions(quintModule)

      assert.includeDeepMembers([...result!.valueDefinitions.keys()], ['test_operator', 'x'])
    })

    it('collects instances and scoped variables inside parameters', () => {
      const quintModule = buildModuleWithDefs(['import test_module(a = val x = 10 {x}) as test_module_instance'])

      const result = collectDefinitions(quintModule)

      assert.includeDeepMembers([...result.valueDefinitions.keys()], ['x'])
    })

    it('collects assume definitions and scoped variables in body', () => {
      const quintModule = buildModuleWithDefs(['assume test_assumption = N > val x = 2 { x }'])

      const result = collectDefinitions(quintModule)

      assert.includeDeepMembers([...result!.valueDefinitions.keys()], ['test_assumption', 'x'])
    })
  })

  describe('collecting type aliases', () => {
    it('collects aliases from typedefs', () => {
      const quintModule = buildModuleWithDefs(['type TEST_TYPE = int'])

      const result = collectDefinitions(quintModule)

      assert.deepInclude([...result!.typeDefinitions.keys()], 'TEST_TYPE')
    })
  })
})
