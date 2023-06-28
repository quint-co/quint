import { assert } from 'chai'
import { describe, it } from 'mocha'
import { addDefToFlatModule, flattenModules } from '../src/flattening'
import { newIdGenerator } from '../src/idGenerator'
import { definitionToString } from '../src/IRprinting'
import { collectIds } from './util'
import { parse } from '../src/parsing/quintParserFrontend'
import { FlatModule, analyzeModules } from '../src'
import { SourceLookupPath } from '../src/parsing/sourceResolver'

describe('flattenModules', () => {
  function assertFlatennedDefs(baseDefs: string[], defs: string[], expectedDefs: string[]): void {
    const idGenerator = newIdGenerator()
    const fake_path: SourceLookupPath = { normalizedPath: 'fake_path', toSourceName: () => 'fake_path' }

    const quintModules: string = `module A { ${baseDefs.join('\n')} } module wrapper { ${defs.join('\n')} }`

    const parseResult = parse(idGenerator, 'fake_location', fake_path, quintModules)
    if (parseResult.isLeft()) {
      assert.fail('Failed to parse mocked up module')
    }
    const { modules, table, sourceMap } = parseResult.unwrap()
    const [moduleA, _module] = modules

    const [analysisErrors, analysisOutput] = analyzeModules(table, modules)
    assert.isEmpty(analysisErrors)

    const { flattenedModules, flattenedAnalysis } = flattenModules(
      modules,
      table,
      idGenerator,
      sourceMap,
      analysisOutput
    )
    const [_, flattenedModule] = flattenedModules

    it('has all expected defs', () => {
      assert.sameDeepMembers(
        flattenedModule.defs.map(def => definitionToString(def)),
        expectedDefs
      )
    })

    it('does not repeat ids', () => {
      const ids = collectIds(flattenedModule)
      assert.notDeepInclude(collectIds(moduleA), ids)
      assert.sameDeepMembers(ids, [...new Set(ids)])
    })

    it('adds new entries to the source map', () => {
      assert.includeDeepMembers(
        [...sourceMap.keys()],
        flattenedModule.defs.map(def => def.id)
      )
    })

    it('adds new entries to the types map', () => {
      assert.includeDeepMembers(
        [...flattenedAnalysis.types.keys()],
        flattenedModule.defs.filter(def => def.kind !== 'typedef').map(def => def.id)
      )
    })

    it('has no aliases in the types map', () => {
      assert.notIncludeMembers(
        [...flattenedAnalysis.types.values()].map(t => t.type.kind),
        ['const']
      )
    })
  }

  describe('multiple instances', () => {
    const baseDefs = ['const N: int', 'val x = N + 1']

    const defs = ['import A(N = 1) as A1', 'import A(N = 2) as A2']

    const expectedDefs = [
      'pure val A1::N: int = 1',
      'val A1::x = iadd(A1::N, 1)',
      'pure val A2::N: int = 2',
      'val A2::x = iadd(A2::N, 1)',
    ]

    assertFlatennedDefs(baseDefs, defs, expectedDefs)
  })

  describe('single instance with several definitions', () => {
    const baseDefs = [
      'const N: int',
      'var x: int',
      'pure def f(a) = a + 1',
      `action V = x' = f(x)`,
      'assume T = N > 0',
      'def lam = val b = 1 { a => b + a }',
      'def lam2 = val b = 1 { a => b + a }',
    ]

    const defs = ['import A(N = 1) as A1']

    const expectedDefs = [
      'pure val A1::N: int = 1',
      'var A1::x: int',
      'pure def A1::f = ((A1::a) => iadd(A1::a, 1))',
      `action A1::V = assign(A1::x, A1::f(A1::x))`,
      'assume A1::T = igt(A1::N, 0)',
      'def A1::lam = val A1::b = 1 { ((A1::a) => iadd(A1::b, A1::a)) }',
      'def A1::lam2 = val A1::b = 1 { ((A1::a) => iadd(A1::b, A1::a)) }',
    ]

    assertFlatennedDefs(baseDefs, defs, expectedDefs)
  })

  describe('imports', () => {
    const baseDefs = ['val f(x) = x + 1']

    const defs = ['import A.*']

    const expectedDefs = ['val f = ((x) => iadd(x, 1))']

    assertFlatennedDefs(baseDefs, defs, expectedDefs)
  })

  describe('export with previous import', () => {
    const baseDefs = ['val f(x) = x + 1']

    const defs = ['import A.*', 'export A.*']

    const expectedDefs = ['val f = ((x) => iadd(x, 1))']

    assertFlatennedDefs(baseDefs, defs, expectedDefs)
  })

  describe('export without previous import', () => {
    const baseDefs = ['val f(x) = x + 1']

    const defs = ['export A.*']

    const expectedDefs = ['val f = ((x) => iadd(x, 1))']

    assertFlatennedDefs(baseDefs, defs, expectedDefs)
  })

  describe('export instance', () => {
    const baseDefs = ['const N: int', 'val x = N + 1']

    const defs = ['import A(N = 1) as A1', 'export A1.*']

    const expectedDefs = [
      // Namespaced defs, from the instance statement
      'pure val A1::N: int = 1',
      'val A1::x = iadd(A1::N, 1)',
      // Exported defs, without namespace
      'pure val N: int = 1',
      'val x = iadd(N, 1)',
    ]

    assertFlatennedDefs(baseDefs, defs, expectedDefs)
  })

  describe('export instance with qualifier', () => {
    const baseDefs = ['const N: int', 'val x = N + 1']

    const defs = ['val myN = 1', 'import A(N = myN) as A1', 'export A1 as B']

    const expectedDefs = [
      'val myN = 1',
      // Namespaced defs, from the instance statement
      'pure val A1::N: int = myN',
      'val A1::x = iadd(A1::N, 1)',
      // Exported defs, with namespace B
      'pure val B::N: int = myN',
      'val B::x = iadd(B::N, 1)',
    ]

    assertFlatennedDefs(baseDefs, defs, expectedDefs)
  })

  describe('inlines aliases', () => {
    const baseDefs = ['type MY_ALIAS = int', 'const N: MY_ALIAS']

    const defs = ['import A(N = 1) as A1', 'var t: A1::MY_ALIAS']

    const expectedDefs = ['type A1::MY_ALIAS = int', 'pure val A1::N: int = 1', 'var t: int']

    assertFlatennedDefs(baseDefs, defs, expectedDefs)
  })
})

describe('addDefToFlatModule', () => {
  function assertAddedDefs(
    baseDefs: string[],
    currentModuleDefs: string[],
    defToAdd: string,
    expectedDefs: string[]
  ): void {
    const idGenerator = newIdGenerator()
    const fake_path: SourceLookupPath = { normalizedPath: 'fake_path', toSourceName: () => 'fake_path' }

    const quintModules: string = `module A { ${baseDefs.join('\n')} } module wrapper { ${currentModuleDefs
      .concat(defToAdd)
      .join('\n')} }`

    const parseResult = parse(idGenerator, 'fake_location', fake_path, quintModules)
    if (parseResult.isLeft()) {
      assert.fail('Failed to parse mocked up module')
    }
    const { modules, table, sourceMap } = parseResult.unwrap()
    const [moduleA, module] = modules

    const [analysisErrors, analysisOutput] = analyzeModules(table, modules)
    assert.isEmpty(analysisErrors)

    const def = module.defs[module.defs.length - 1]
    const moduleWithoutDef: FlatModule = { ...module, defs: [] }
    const { flattenedModule, flattenedAnalysis } = addDefToFlatModule(
      modules,
      table,
      idGenerator,
      sourceMap,
      analysisOutput,
      moduleWithoutDef,
      def
    )

    it('has all expected defs', () => {
      assert.sameDeepMembers(
        flattenedModule.defs.map(def => definitionToString(def)),
        expectedDefs
      )
    })

    it('does not repeat ids', () => {
      const ids = collectIds(flattenedModule)
      assert.notDeepInclude(collectIds(moduleA), ids)
      assert.sameDeepMembers(ids, [...new Set(ids)])
    })

    it('adds new entries to the source map', () => {
      assert.includeDeepMembers(
        [...sourceMap.keys()],
        flattenedModule.defs.map(def => def.id)
      )
    })

    it('adds new entries to the types map', () => {
      assert.includeDeepMembers(
        [...flattenedAnalysis.types.keys()],
        flattenedModule.defs.filter(def => def.kind !== 'typedef').map(def => def.id)
      )
    })

    it('has no aliases in the types map', () => {
      assert.notIncludeMembers(
        [...flattenedAnalysis.types.values()].map(t => t.type.kind),
        ['const']
      )
    })
  }

  describe('single instance with several definitions', () => {
    const baseDefs = [
      'const N: int',
      'var x: int',
      'pure def f(a) = a + 1',
      `action V = x' = f(x)`,
      'assume T = N > 0',
      'def lam = val b = 1 { a => b + a }',
      'def lam2 = val b = 1 { a => b + a }',
    ]

    const defToAdd = 'import A(N = 1) as A1'

    const expectedDefs = [
      'pure val A1::N: int = 1',
      'var A1::x: int',
      'pure def A1::f = ((A1::a) => iadd(A1::a, 1))',
      `action A1::V = assign(A1::x, A1::f(A1::x))`,
      'assume A1::T = igt(A1::N, 0)',
      'def A1::lam = val A1::b = 1 { ((A1::a) => iadd(A1::b, A1::a)) }',
      'def A1::lam2 = val A1::b = 1 { ((A1::a) => iadd(A1::b, A1::a)) }',
    ]

    assertAddedDefs(baseDefs, [], defToAdd, expectedDefs)
  })

  describe('imports', () => {
    const baseDefs = ['val f(x) = x + 1']

    const defToAdd = 'import A.*'

    const expectedDefs = ['val f = ((x) => iadd(x, 1))']

    assertAddedDefs(baseDefs, [], defToAdd, expectedDefs)
  })

  describe('type aliases', () => {
    const currentModuleDefs = ['type MY_ALIAS = int']

    const defToAdd = 'var N: MY_ALIAS'

    const expectedDefs = ['var N: int']

    assertAddedDefs([], currentModuleDefs, defToAdd, expectedDefs)
  })
})
