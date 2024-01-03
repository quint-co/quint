import { assert } from 'chai'
import { describe, it } from 'mocha'
import { QuintDef, QuintModule } from '../../src/ir/quintIr'
import { declarationToString, moduleToString } from '../../src/ir/IRprinting'
import { newIdGenerator } from '../../src/idGenerator'
import { SourceLookupPath } from '../../src/parsing/sourceResolver'
import { parse } from '../../src/parsing/quintParserFrontend'
import { flattenInstances } from '../../src/flattening/instanceFlattener'
import { analyzeModules } from '../../src/quintAnalyzer'

describe('flattenInstances', () => {
  function getFlattenedInstances(baseDecls: string[], decls: string[], thirdModuleDecls: string[]): QuintModule[] {
    const idGenerator = newIdGenerator()
    const fake_path: SourceLookupPath = { normalizedPath: 'fake_path', toSourceName: () => 'fake_path' }

    const quintModules: string = `module A { ${baseDecls.join('\n')} } module B { ${decls.join(
      '\n'
    )} } module C { ${thirdModuleDecls.join('\n')} }`

    const { modules, table, sourceMap, errors } = parse(idGenerator, 'fake_location', fake_path, quintModules)
    assert.isEmpty(errors, 'Failed to parse mocked up module')

    const [analysisErrors, analysisOutput] = analyzeModules(table, modules)
    assert.isEmpty(analysisErrors)

    const modulesByName: Map<string, QuintModule> = new Map(modules.map(m => [m.name, m]))
    return flattenInstances(modulesByName.get('B')!, modulesByName, table, idGenerator, sourceMap, analysisOutput)
  }

  it('flattens simple instance', () => {
    const baseDecls = ['const N: int', 'def f(x) = x + N']

    const decls = ['import A(N=1).*', 'def g(x) = f(x)']

    const expectedModuleForInstance = `module B::A {
  pure val B::A::N: int = 1
  def B::A::f = ((B::A::x) => iadd(B::A::x, B::A::N))
}`
    const expectedDeclsInMain = ['import B::A.*', 'def g = ((x) => B::A::f(x))']

    const [moduleForInstance, module] = getFlattenedInstances(baseDecls, decls, [])
    assert.deepEqual(moduleToString(moduleForInstance), expectedModuleForInstance)
    assert.sameDeepMembers(
      module.declarations.map(d => declarationToString(d)),
      expectedDeclsInMain
    )
  })

  it('copies dependent definitions from expressions in parameters', () => {
    const baseDecls = ['const N: int', 'def f(x) = x + N']

    const decls = ['pure val myVal = 1', 'import A(N=myVal).*', 'def g(x) = f(x)']

    const expectedModuleForInstance = `module B::A {
  pure val myVal = 1
  pure val B::A::N: int = myVal
  def B::A::f = ((B::A::x) => iadd(B::A::x, B::A::N))
}`
    const expectedDeclsInMain = ['pure val myVal = 1', 'import B::A.*', 'def g = ((x) => B::A::f(x))']

    const [moduleForInstance, module] = getFlattenedInstances(baseDecls, decls, [])
    assert.deepEqual(moduleToString(moduleForInstance), expectedModuleForInstance)
    assert.sameDeepMembers(
      module.declarations.map(d => declarationToString(d)),
      expectedDeclsInMain
    )
  })

  it('flattens simple instance with N=N', () => {
    const baseDecls = ['const N: int', 'val a = N + 1']

    const decls = ['pure val N = 1', 'import A(N=N) as A1', 'def g(x) = x + A1::a']

    const expectedModuleForInstance = `module B::A1 {
  pure val N = 1
  pure val B::A1::N: int = N
  val B::A1::a = iadd(B::A1::N, 1)
}`
    const expectedDeclsInMain = ['pure val N = 1', 'import B::A1.*', 'def g = ((x) => iadd(x, B::A1::a))']

    const [moduleForInstance, module] = getFlattenedInstances(baseDecls, decls, [])
    assert.deepEqual(moduleToString(moduleForInstance), expectedModuleForInstance)
    assert.sameDeepMembers(
      module.declarations.map(d => declarationToString(d)),
      expectedDeclsInMain
    )
  })

  it('generate different ids for different instances', () => {
    const baseDecls = ['const N: int', 'val a = N + 1']

    const decls = ['import A(N=1) as A1', 'import A(N=2) as A2', 'val b = A1::a + A2::a']

    const [moduleForA1, moduleForA2, _module] = getFlattenedInstances(baseDecls, decls, [])

    const a1 = moduleForA1.declarations.find(d => (d as QuintDef).name === 'B::A1::a')!
    const a2 = moduleForA2.declarations.find(d => (d as QuintDef).name === 'B::A2::a')!

    assert.notEqual(a1.id, a2.id)
  })
})
