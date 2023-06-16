import { describe, it } from 'mocha'
import { assert } from 'chai'
import { DefinitionsByModule, DefinitionsByName, newTable } from '../../src/names/definitionsByName'
import { buildModuleWithDefs } from '../builders/ir'
import { resolveImports } from '../../src/names/importResolver'

describe('resolveImports', () => {
  const table: DefinitionsByName = newTable({
    valueDefinitions: [
      { kind: 'def', identifier: 'a', reference: 1n },
      { kind: 'def', identifier: 'b', reference: 2n },
      { kind: 'def', identifier: 'c', reference: 3n, scope: 10n },
      { kind: 'module', identifier: 'unexisting_module', reference: 5n },
      { kind: 'const', identifier: 'c1', reference: 6n },
      { kind: 'const', identifier: 'c2', reference: 7n },
    ],
    typeDefinitions: [{ identifier: 'T', reference: 1n }, { identifier: 'R' }],
  })

  function tables(): DefinitionsByModule {
    return new Map<string, DefinitionsByName>([
      ['wrapper', newTable({})],
      ['test_module', table],
    ])
  }

  describe('existing modules', () => {
    it('imports named definitions', () => {
      const quintModule = buildModuleWithDefs(['import test_module.a'])

      const [errors, definitions] = resolveImports(quintModule, tables())

      assert.isEmpty(errors)
      assert.deepInclude([...definitions.valueDefinitions.keys()], 'a')
      assert.notDeepInclude([...definitions.valueDefinitions.keys()], 'b')
    })

    it('imports all definitions', () => {
      const quintModule = buildModuleWithDefs(['import test_module.*'])

      const [errors, definitions] = resolveImports(quintModule, tables())

      assert.isEmpty(errors)
      assert.includeDeepMembers([...definitions.valueDefinitions.keys()], ['a', 'b'])
      assert.includeDeepMembers([...definitions.typeDefinitions.keys()], ['T'])
    })

    it('instantiates modules', () => {
      const quintModule = buildModuleWithDefs(['import test_module(c1 = 3, c2 = 4) as test_module_instance'])

      const [errors, definitions] = resolveImports(quintModule, tables())

      assert.isEmpty(errors)
      assert.includeDeepMembers(
        [...definitions.valueDefinitions.keys()],
        ['test_module_instance::c1', 'test_module_instance::c2']
      )
      assert.includeDeepMembers([...definitions.typeDefinitions.keys()], ['test_module_instance::T'])
    })

    it('fails importing itself', () => {
      const quintModule = buildModuleWithDefs(['import wrapper.*', 'import wrapper(c1 = 1) as w', 'export wrapper.*'])

      const [errors, _definitions] = resolveImports(quintModule, tables())

      assert.sameDeepMembers(
        [...errors.entries()],
        [
          [1n, { code: 'QNT407', message: 'Cannot import wrapper inside wrapper', data: {} }],
          [4n, { code: 'QNT407', message: 'Cannot instantiate wrapper inside wrapper', data: {} }],
          [5n, { code: 'QNT407', message: 'Cannot export wrapper inside wrapper', data: {} }],
        ]
      )
    })

    it('exports all definitions', () => {
      const quintModule = buildModuleWithDefs(['export test_module.*'])

      const [errors, definitions] = resolveImports(quintModule, tables())

      assert.isEmpty(errors)
      assert.deepEqual(definitions.valueDefinitions.get('a'), [
        { kind: 'def', identifier: 'a', reference: 1n, scope: undefined },
      ])
      assert.deepEqual(definitions.typeDefinitions.get('T'), [{ identifier: 'T', reference: 1n, scope: undefined }])
    })

    it('exports previously imported definitions', () => {
      const quintModule = buildModuleWithDefs(['import test_module.*', 'export test_module.*'])

      const [errors, definitions] = resolveImports(quintModule, tables())

      assert.isEmpty(errors)
      assert.deepEqual(definitions.valueDefinitions.get('a'), [
        { kind: 'def', identifier: 'a', reference: 1n, scope: undefined },
      ])
      assert.deepEqual(definitions.typeDefinitions.get('T'), [{ identifier: 'T', reference: 1n, scope: undefined }])
    })

    it('exports specific definitions', () => {
      const quintModule = buildModuleWithDefs(['import test_module.*', 'export test_module.a'])

      const [errors, definitions] = resolveImports(quintModule, tables())

      assert.isEmpty(errors)
      assert.deepEqual(definitions.valueDefinitions.get('a'), [
        { kind: 'def', identifier: 'a', reference: 1n, scope: undefined },
      ])
      assert.deepEqual(definitions.typeDefinitions.get('T'), [{ identifier: 'T', reference: 1n, scope: 3n }])
    })

    it('exports definitions with qualifier', () => {
      const quintModule = buildModuleWithDefs(['import test_module.*', 'export test_module as my_export'])

      const [errors, definitions] = resolveImports(quintModule, tables())

      assert.isEmpty(errors)
      assert.deepEqual(definitions.valueDefinitions.get('a'), [
        { kind: 'def', identifier: 'a', reference: 1n, scope: 3n },
      ])
      assert.deepEqual(definitions.valueDefinitions.get('my_export::a'), [
        { kind: 'def', identifier: 'my_export::a', reference: 1n, scope: undefined },
      ])
    })
  })

  describe('unexisting modules', () => {
    it('fails importing', () => {
      const quintModule = buildModuleWithDefs(['import unexisting_module.*'])

      const [errors, _definitions] = resolveImports(quintModule, tables())

      assert.sameDeepMembers(
        [...errors.entries()],
        [[1n, { code: 'QNT404', message: 'Module unexisting_module not found', data: {} }]]
      )
    })

    it('fails instantiating', () => {
      const quintModule = buildModuleWithDefs(['import unexisting_module(c1 = c1, c2 = c2) as test_module_instanc'])

      const [errors, _definitions] = resolveImports(quintModule, tables())

      assert.sameDeepMembers(
        [...errors.entries()],
        [[5n, { code: 'QNT404', message: 'Module unexisting_module not found', data: {} }]]
      )
    })

    it('fails exporting', () => {
      const quintModule = buildModuleWithDefs(['export unexisting_module.*'])

      const [errors, _definitions] = resolveImports(quintModule, tables())

      assert.sameDeepMembers(
        [...errors.entries()],
        [[1n, { code: 'QNT404', message: 'Module unexisting_module not found', data: {} }]]
      )
    })
  })
})
