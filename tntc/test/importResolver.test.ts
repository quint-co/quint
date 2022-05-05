import { describe, it } from 'mocha'
import { assert } from 'chai'
import { DefinitionTable, DefinitionTableByModule } from '../src/definitionsCollector'
import { buildModuleWithDefs } from './builders/ir'
import { resolveImports } from '../src/importResolver'

describe('resolveImports', () => {
  const moduleName = 'wrapper'
  const table: DefinitionTable = {
    valueDefinitions: [
      { kind: 'def', identifier: 'a', reference: BigInt(1) },
      { kind: 'def', identifier: 'b', reference: BigInt(2) },
      { kind: 'def', identifier: 'c', reference: BigInt(3), scope: BigInt(10) },
    ],
    typeDefinitions: [],
  }
  const tables: DefinitionTableByModule = new Map<string, DefinitionTable>([['test_module', table]])

  describe('existing modules', () => {
    it('imports named definitions', () => {
      const tntModule = buildModuleWithDefs([
        'module test_module { def a = 1 def b =2 }',
        'import test_module.a',
      ])

      const result = resolveImports(tntModule, tables)
      assert.deepEqual(result.kind, 'ok')
      if (result.kind === 'ok') {
        const defs = result.definitions.get(moduleName)

        assert.deepInclude(defs!.valueDefinitions.map(d => d.identifier), 'a')
        assert.notDeepInclude(defs!.valueDefinitions.map(d => d.identifier), 'b')
      }
    })

    it('imports all definitions', () => {
      const tntModule = buildModuleWithDefs([
        'module test_module { def a = 1 def b = 2 }',
        'import test_module.*',
      ])

      const result = resolveImports(tntModule, tables)
      assert.deepEqual(result.kind, 'ok')
      if (result.kind === 'ok') {
        const defs = result.definitions.get(moduleName)

        assert.includeDeepMembers(defs!.valueDefinitions.map(d => d.identifier), ['a', 'b'])
      }
    })

    it('intantiates modules', () => {
      const tntModule = buildModuleWithDefs([
        'module test_module { def a = 1 def b = 2 }',
        'module test_module_instance = test_module(a = 3, b = 4)',
      ])

      const result = resolveImports(tntModule, tables)
      assert.deepEqual(result.kind, 'ok')
      if (result.kind === 'ok') {
        const defs = result.definitions.get(moduleName)

        assert.includeDeepMembers(defs!.valueDefinitions.map(d => d.identifier), [
          'test_module_instance::a',
          'test_module_instance::b',
        ])
      }
    })
  })

  describe('unexisting modules', () => {
    it('fails importing', () => {
      const tntModule = buildModuleWithDefs([
        'module test_module { def a = 1 def b = 2 }',
        'import unexisting_module.*',
      ])

      const result = resolveImports(tntModule, tables)
      assert.deepEqual(result.kind, 'error')
      if (result.kind === 'error') {
        assert.deepEqual(result.errors.map(e => e.moduleName), ['unexisting_module'])
      }
    })

    it('fails instantiating', () => {
      const tntModule = buildModuleWithDefs([
        'module test_module { def a = 1 def b = 2 }',
        'module test_module_instance = unexisting_module(a = a, b = b)',
      ])

      const result = resolveImports(tntModule, tables)
      assert.deepEqual(result.kind, 'error')
      if (result.kind === 'error') {
        assert.deepEqual(result.errors.map(e => e.moduleName), ['unexisting_module'])
      }
    })
  })
})
