import { describe, it } from 'mocha'
import { assert } from 'chai'
import { LookupTable, LookupTableByModule, newTable } from '../src/lookupTable'
import { buildModuleWithDefs } from './builders/ir'
import { resolveImports } from '../src/importResolver'

describe('resolveImports', () => {
  const table: LookupTable = newTable({
    valueDefinitions: [
      { kind: 'def', identifier: 'a', reference: 1n },
      { kind: 'def', identifier: 'b', reference: 2n },
      { kind: 'def', identifier: 'c', reference: 3n, scope: 10n },
      { kind: 'module', identifier: 'unexisting_module', reference: 5n },
      { kind: 'const', identifier: 'c1', reference: 6n },
      { kind: 'const', identifier: 'c2', reference: 7n },
    ],
    typeDefinitions: [
      { identifier: 'T', reference: 1n },
      { identifier: 'R' },
    ],
  })

  const tables: LookupTableByModule = new Map<string, LookupTable>([
    ['wrapper', newTable({})], ['test_module', table],
  ])

  describe('existing modules', () => {
    it('imports named definitions', () => {
      const quintModule = buildModuleWithDefs([
        'import test_module.a',
      ])

      const result = resolveImports(quintModule, tables)

      result
        .map(definitions => {
          assert.deepInclude([...definitions.valueDefinitions.keys()], 'a')
          assert.notDeepInclude([...definitions.valueDefinitions.keys()], 'b')
        })
        .mapLeft(e => assert.fail(`Expected no error, got ${e}`))
    })

    it('imports all definitions', () => {
      const quintModule = buildModuleWithDefs([
        'import test_module.*',
      ])

      const result = resolveImports(quintModule, tables)

      result
        .map(definitions => {
          assert.includeDeepMembers([...definitions.valueDefinitions.keys()], ['a', 'b'])
          assert.includeDeepMembers([...definitions.typeDefinitions.keys()], ['T'])
        })
        .mapLeft(e => assert.fail(`Expected no error, got ${e}`))
    })

    it('instantiates modules', () => {
      const quintModule = buildModuleWithDefs([
        'module test_module_instance = test_module(c1 = 3, c2 = 4)',
      ])

      const result = resolveImports(quintModule, tables)


      result
        .map(definitions => {
          assert.includeDeepMembers([...definitions.valueDefinitions.keys()], [
            'test_module_instance::c1',
            'test_module_instance::c2',
          ])
          assert.includeDeepMembers([...definitions.typeDefinitions.keys()], [
            'test_module_instance::T',
          ])
        })
        .mapLeft(e => assert.fail(`Expected no error, got ${e}`))
    })
  })

  describe('unexisting modules', () => {
    it('fails importing', () => {
      const quintModule = buildModuleWithDefs([
        'import unexisting_module.*',
      ])

      const result = resolveImports(quintModule, tables)

      result
        .mapLeft(errors => assert.sameDeepMembers([...errors.entries()], [
          [1n, { code: 'QNT404', message: 'Module unexisting_module not found', data: {} }],
        ]))
        .map(_ => assert.fail('Expected errors'))
    })

    it('fails instantiating', () => {
      const quintModule = buildModuleWithDefs([
        'module test_module_instance = unexisting_module(c1 = c1, c2 = c2)',
      ])

      const result = resolveImports(quintModule, tables)

      result
        .mapLeft(errors => assert.sameDeepMembers([...errors.entries()], [
          [3n, { code: 'QNT404', message: 'Module unexisting_module not found', data: {} }],
        ]))
        .map(_ => assert.fail('Expected errors'))
    })
  })
})
