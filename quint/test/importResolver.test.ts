import { describe, it } from 'mocha'
import { assert } from 'chai'
import { LookupTable, LookupTableByModule, newTable } from '../src/lookupTable'
import { buildModuleWithDefs } from './builders/ir'
import { resolveImports } from '../src/importResolver'

describe('resolveImports', () => {
  const moduleName = 'wrapper'

  const table: LookupTable = newTable({
    valueDefinitions: [
      { kind: 'def', identifier: 'a', reference: 1n },
      { kind: 'def', identifier: 'b', reference: 2n },
      { kind: 'def', identifier: 'c', reference: 3n, scope: 10n },
      { kind: 'module', identifier: 'nested_module', reference: 4n },
      { kind: 'module', identifier: 'unexisting_module', reference: 5n },
    ],
    typeDefinitions: [
      { identifier: 'T', reference: 1n },
      { identifier: 'R' },
    ],
  })

  const nestedModuleTable: LookupTable = newTable({
    valueDefinitions: [
      { kind: 'def', identifier: 'd', reference: 1n },
      { kind: 'def', identifier: 'e', reference: 2n, scope: 10n },
    ],
  })

  const tables: LookupTableByModule = new Map<string, LookupTable>([
    ['wrapper', newTable({})], ['test_module', table], ['nested_module', nestedModuleTable],
  ])

  describe('existing modules', () => {
    it('imports named definitions', () => {
      const quintModule = buildModuleWithDefs([
        'module test_module { def a = 1 def b =2 }',
        'import test_module.a',
      ])

      const result = resolveImports(quintModule, tables)

      result
        .map(definitions => {
          const defs = definitions.get(moduleName)
          assert.deepInclude([...defs!.valueDefinitions.keys()], 'a')
          assert.notDeepInclude([...defs!.valueDefinitions.keys()], 'b')
        })
        .mapLeft(e => assert.fail(`Expected no error, got ${e}`))
    })

    it('imports all definitions', () => {
      const quintModule = buildModuleWithDefs([
        'module test_module { type T def a = 1 def b = 2 }',
        'import test_module.*',
      ])

      const result = resolveImports(quintModule, tables)

      result
        .map(definitions => {
          const defs = definitions.get(moduleName)
          assert.includeDeepMembers([...defs!.valueDefinitions.keys()], ['a', 'b'])
          assert.includeDeepMembers([...defs!.typeDefinitions.keys()], ['T'])
        })
        .mapLeft(e => assert.fail(`Expected no error, got ${e}`))
    })

    it('intantiates modules', () => {
      const quintModule = buildModuleWithDefs([
        'module test_module { def a = 1 def b = 2 }',
        'module test_module_instance = test_module(a = 3, b = 4)',
      ])

      const result = resolveImports(quintModule, tables)


      result
        .map(definitions => {
          const defs = definitions.get(moduleName)

          assert.includeDeepMembers([...defs!.valueDefinitions.keys()], [
            'test_module_instance::a',
            'test_module_instance::b',
          ])
          assert.includeDeepMembers([...defs!.typeDefinitions.keys()], [
            'test_module_instance::T',
          ])
        })
        .mapLeft(e => assert.fail(`Expected no error, got ${e}`))
    })

    it('imports nested module', () => {
      const quintModule = buildModuleWithDefs([
        'module test_module { module nested_module { def d = 10 } }',
        'import test_module.nested_module',
      ])

      const result = resolveImports(quintModule, tables)

      result
        .map(definitions => {
          const defs = definitions.get(moduleName)
          assert.includeDeepMembers([...defs!.valueDefinitions.keys()], [
            'nested_module::d',
          ])
        })
        .mapLeft(e => assert.fail(`Expected no error, got ${e}`))
    })
  })

  describe('unexisting modules', () => {
    it('fails importing', () => {
      const quintModule = buildModuleWithDefs([
        'module test_module { def a = 1 def b = 2 }',
        'import unexisting_module.*',
      ])

      const result = resolveImports(quintModule, tables)

      result
        .mapLeft(errors => assert.deepEqual(errors.map(e => e.moduleName), [ 'unexisting_module' ]))
        .map(_ => assert.fail('Expected errors'))
    })

    it('fails instantiating', () => {
      const quintModule = buildModuleWithDefs([
        'module test_module { def a = 1 def b = 2 }',
        'module test_module_instance = unexisting_module(a = a, b = b)',
      ])

      const result = resolveImports(quintModule, tables)

      result
        .mapLeft(errors => assert.deepEqual(errors.map(e => e.moduleName), ['unexisting_module']))
        .map(_ => assert.fail('Expected errors'))
    })

    it('fails importing nested', () => {
      const quintModule = buildModuleWithDefs([
        'module test_module { def a = 1 def b = 2 }',
        'import test_module.unexisting_module',
      ])

      const result = resolveImports(quintModule, tables)

      result
        .mapLeft(errors => assert.deepEqual(errors.map(e => e.defName), ['unexisting_module']))
        .map(_ => assert.fail('Expected errors'))
    })
  })
})
