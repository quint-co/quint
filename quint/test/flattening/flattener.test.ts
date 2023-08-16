import { assert } from 'chai'
import { describe, it } from 'mocha'
import { flattenModule } from '../../src/flattening/flattener'
import { QuintModule } from '../../src/ir/quintIr'
import { declarationToString } from '../../src/ir/IRprinting'
import { newIdGenerator } from '../../src/idGenerator'
import { SourceLookupPath } from '../../src/parsing/sourceResolver'
import { parse } from '../../src/parsing/quintParserFrontend'

describe('flattenModule', () => {
  function assertFlatennedDefs(baseDefs: string[], defs: string[], thirdModuleDefs: string[], expectedDefs: string[]): void {
    const idGenerator = newIdGenerator()
    const fake_path: SourceLookupPath = { normalizedPath: 'fake_path', toSourceName: () => 'fake_path' }

    const quintModules: string = `module A { ${baseDefs.join('\n')} } module B { ${defs.join('\n')} } module C { ${thirdModuleDefs.join('\n')} }`

    const parseResult = parse(idGenerator, 'fake_location', fake_path, quintModules)
    if (parseResult.isLeft()) {
      assert.fail('Failed to parse mocked up module')
    }
    const { modules, table } = parseResult.unwrap()
    const modulesByName: Map<string, QuintModule> = new Map(modules.map(m => [m.name, m]))

    modules.forEach(m => {
      const flattenedModule = flattenModule(m, modulesByName, table)
      modulesByName.set(m.name, flattenedModule)
    })
    const flattenedModule = modulesByName.get('B')!

    it('has all expected declarations', () => {
      assert.sameDeepMembers(
        flattenedModule.declarations.map(decl => declarationToString(decl)),
        expectedDefs
      )
    })
  }

  describe('imports', () => {
    const baseDefs = ['val f(x) = x + 1']

    const defs = ['import A.*', 'val a = f(1)']

    const expectedDefs = ['val f = ((x) => iadd(x, 1))', 'val a = f(1)']

    assertFlatennedDefs(baseDefs, defs, [], expectedDefs)
  })

  describe('export with previous import', () => {
    const baseDefs = ['val f(x) = x + 1']

    const defs = ['import A.*', 'export A.*']

    const thirdModuleDefs = ['import B.*', 'val a = f(1)']

    const expectedDefs = ['val f = ((x) => iadd(x, 1))']

    assertFlatennedDefs(baseDefs, defs, thirdModuleDefs, expectedDefs)
  })

  describe('export without previous import', () => {
    const baseDefs = ['val f(x) = x + 1']

    const defs = ['export A.*']

    const thirdModuleDefs = ['import B.*', 'val a = f(1)']

    const expectedDefs = ['val f = ((x) => iadd(x, 1))']

    assertFlatennedDefs(baseDefs, defs, thirdModuleDefs, expectedDefs)
  })
})
