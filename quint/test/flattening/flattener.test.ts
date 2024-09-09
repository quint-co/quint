import { assert } from 'chai'
import { describe, it } from 'mocha'
import { flattenModule } from '../../src/flattening/flattener'
import { QuintModule } from '../../src/ir/quintIr'
import { declarationToString } from '../../src/ir/IRprinting'
import { newIdGenerator } from '../../src/idGenerator'
import { SourceLookupPath } from '../../src/parsing/sourceResolver'
import { parse } from '../../src/parsing/quintParserFrontend'

describe('flattenModule', () => {
  function getFlatennedDecls(
    baseDecls: string[],
    decls: string[],
    thirdModuleDecls: string[],
    moduleToCheck: string = 'B'
  ): string[] {
    const idGenerator = newIdGenerator()
    const fake_path: SourceLookupPath = { normalizedPath: 'fake_path', toSourceName: () => 'fake_path' }

    const quintModules: string = `module A { ${baseDecls.join('\n')} } module B { ${decls.join(
      '\n'
    )} } module C { ${thirdModuleDecls.join('\n')} }`

    const { modules, table, errors } = parse(idGenerator, 'fake_location', fake_path, quintModules)

    assert.isEmpty(errors, 'Failed to parse mocked up module')

    const modulesByName: Map<string, QuintModule> = new Map(modules.map(m => [m.name, m]))

    modules.forEach(m => {
      const flattenedModule = flattenModule(m, modulesByName, table)
      modulesByName.set(m.name, flattenedModule)
    })
    const flattenedModule = modulesByName.get(moduleToCheck)!

    return flattenedModule.declarations.map(decl => declarationToString(decl))
  }

  it('flattens simple import', () => {
    const baseDecls = ['def f(x) = x + 1']

    const decls = ['import A.*', 'def g(x) = f(x)']

    const expectedDecls = ['def f = ((x) => iadd(x, 1))', 'def g = ((x) => f(x))']

    const flattenedDecls = getFlatennedDecls(baseDecls, decls, [])
    assert.deepEqual(flattenedDecls, expectedDecls)
  })

  it('flattens import with qualifier', () => {
    const baseDecls = ['def f(x) = x + 1']

    const decls = ['import A as MyA', 'val a = MyA::f(1)']

    const expectedDecls = ['def MyA::f = ((MyA::x) => iadd(MyA::x, 1))', 'val a = MyA::f(1)']

    const flattenedDecls = getFlatennedDecls(baseDecls, decls, [])
    assert.deepEqual(flattenedDecls, expectedDecls)
  })

  it('flattens import with self-qualifier', () => {
    const baseDecls = ['def f(x) = x + 1']

    const decls = ['import A', 'val a = A::f(1)']

    const expectedDecls = ['def A::f = ((A::x) => iadd(A::x, 1))', 'val a = A::f(1)']

    const flattenedDecls = getFlatennedDecls(baseDecls, decls, [])
    assert.deepEqual(flattenedDecls, expectedDecls)
  })

  it('flattens export with previous import without definitions being used', () => {
    const baseDecls = ['def f(x) = x + 1']

    // No definition from A is used here
    const decls = ['import A.*', 'export A.*']

    const thirdModuleDecls = ['import B.*', 'val a = f(1)']

    const expectedDecls = ['def f = ((x) => iadd(x, 1))']

    const flattenedDecls = getFlatennedDecls(baseDecls, decls, thirdModuleDecls)
    assert.deepEqual(flattenedDecls, expectedDecls)
  })

  it('flattens export with previous import with used definition', () => {
    const baseDecls = ['def f(x) = x + 1']

    const decls = ['import A.*', 'val a = f(2)', 'export A.*']

    const thirdModuleDecls = ['import B.*', 'val b = f(1)']

    const expectedDecls = ['def f = ((x) => iadd(x, 1))', 'val a = f(2)']

    const flattenedDecls = getFlatennedDecls(baseDecls, decls, thirdModuleDecls)
    assert.deepEqual(flattenedDecls, expectedDecls)
  })

  it('flattens export without previous import', () => {
    const baseDecls = ['def f(x) = x + 1']

    const decls = ['export A.*']

    const thirdModuleDecls = ['import B.*', 'val a = f(1)']

    const expectedDecls = ['def f = ((x) => iadd(x, 1))']

    const flattenedDecls = getFlatennedDecls(baseDecls, decls, thirdModuleDecls)
    assert.deepEqual(flattenedDecls, expectedDecls)
  })

  it('does not flatten definitions that come from instance', () => {
    const baseDecls = ['const N: int', 'def f(x) = x + 1']

    const decls = ['import A(N = 1) as A1', 'val a = A1::f(1)']

    const expectedDecls = decls

    const flattenedDecls = getFlatennedDecls(baseDecls, decls, [])
    assert.deepEqual(flattenedDecls, expectedDecls)
  })

  it('flattens export qualified module with no qualifier', () => {
    const baseDecls = ['def f(x) = x + 1']

    const decls = ['import A as MyA', 'export MyA.*']

    const thirdModuleDecls = ['import B.*', 'val a = f(1)']

    const expectedDecls = ['def f = ((x) => iadd(x, 1))']

    const flattenedDecls = getFlatennedDecls(baseDecls, decls, thirdModuleDecls)
    assert.deepEqual(flattenedDecls, expectedDecls)
  })

  it('flattens export instance with no qualifier', () => {
    // I was not able to make this scenario work in the PoC, not with interactions with the instance flattener.
    // In #1102, we should make sure a proper error is raised in the export + import combinatinos we do not support.
    // Alternatively (and at some point), we could support this scenario.
    const baseDecls = ['const N: int', 'def f(x) = x + 1']

    const decls = ['import A(N = 1) as A1', 'export A1.*']

    const thirdModuleDecls = ['import B.*', 'val a = f(1)']

    const expectedDecls = ['import A(N = 1) as A1', 'def f = ((x) => iadd(x, 1))', 'const N: int']

    const flattenedDecls = getFlatennedDecls(baseDecls, decls, thirdModuleDecls)
    assert.deepEqual(flattenedDecls, expectedDecls)
  })

  it('imports definitions recursively when there are dependencies', () => {
    const baseDecls = ['val z = 3', 'def f(x) = x + z']

    const decls = ['import A as MyA', 'val a = MyA::f(1)']

    const expectedDecls = ['val MyA::z = 3', 'def MyA::f = ((MyA::x) => iadd(MyA::x, MyA::z))', 'val a = MyA::f(1)']

    const flattenedDecls = getFlatennedDecls(baseDecls, decls, [])
    assert.deepEqual(flattenedDecls, expectedDecls)
  })

  it('imports definitions recursively when there are dependencies in single def import', () => {
    const baseDecls = ['val z = 3', 'def f(x) = x + z']

    const decls = ['import A.f', 'val a = f(1)']

    const expectedDecls = ['val z = 3', 'def f = ((x) => iadd(x, z))', 'val a = f(1)']

    const flattenedDecls = getFlatennedDecls(baseDecls, decls, [])
    assert.deepEqual(flattenedDecls, expectedDecls)
  })

  it('does not create conflicts', () => {
    const baseDecls = ['val z = val x = 3 { x }', 'def f(x) = x + z', 'val y = 1']

    const decls = ['import A.f', 'val a = def g = f { g(1) }', 'export A.*']

    const thirdModuleDecls = ['import B.*', 'val b = z + y']

    const expectedDecls = [
      'val z = val x = 3 { x }',
      'def f = ((x) => iadd(x, z))',
      'val y = 1',
      'val a = def g = f { g(1) }',
    ]

    const flattenedDecls = getFlatennedDecls(baseDecls, decls, thirdModuleDecls)
    assert.deepEqual(flattenedDecls, expectedDecls)
  })

  it('can have definitions with same id but different name (#1141)', () => {
    const baseDecls = ['val a = 1']

    const decls = ['import A.*', 'val b = a']

    const thirdModuleDecls = ['import A.*', 'import B', 'val c = a + B::b']

    const expectedDecls = ['val a = 1', 'val B::a = 1', 'val B::b = B::a', 'val c = iadd(a, B::b)']

    const flattenedDecls = getFlatennedDecls(baseDecls, decls, thirdModuleDecls, 'C')
    assert.deepEqual(flattenedDecls, expectedDecls)
  })
})
