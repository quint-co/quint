import { assert } from 'chai'
import { newIdGenerator } from '../../src/idGenerator'
import { SourceLookupPath } from '../../src/parsing/sourceResolver'
import { parse } from '../../src/parsing/quintParserFrontend'
import { dedent } from '../textUtils'
import { inlineTypeAliases } from '../../src/types/aliasInliner'
import { QuintModule } from '../../src/ir/quintIr'
import { LookupTable } from '../../src/names/base'
import { moduleToString } from '../../src/ir/IRprinting'
import { AnalysisOutput, analyzeModules } from '../../src/quintAnalyzer'

function inlineModule(text: string): { modules: QuintModule[]; table: LookupTable; analysisOutput: AnalysisOutput } {
  const idGen = newIdGenerator()
  const fake_path: SourceLookupPath = { normalizedPath: 'fake_path', toSourceName: () => 'fake_path' }
  const { modules, table, errors } = parse(idGen, 'fake_location', fake_path, text)
  assert.isEmpty(errors)

  const [analysisErrors, analysisOutput] = analyzeModules(table, modules)
  assert.isEmpty(analysisErrors)

  return inlineTypeAliases(modules, table, analysisOutput)
}

describe('inlineAliases', () => {
  it('inlines aliases in a simple module', () => {
    const quintModule = `module A {
      type MY_ALIAS = int
      var x: MY_ALIAS
      val a = x
    }`

    const { modules, table, analysisOutput } = inlineModule(quintModule)

    const expectedModule = dedent(`module A {
                                  |  type MY_ALIAS = int
                                  |  var x: int
                                  |  val a = x
                                  |}`)

    assert.deepEqual(moduleToString(modules[0]), expectedModule)
    assert.deepEqual(table.get(5n)?.typeAnnotation?.kind, 'int')
    assert.deepEqual(analysisOutput.types.get(4n)?.type.kind, 'int')
  })

  it('handles nested aliases', () => {
    const quintModule = `module A {
      type MY_ALIAS = int
      type MY_OTHER_ALIAS = MY_ALIAS
      var x: MY_OTHER_ALIAS
    }`

    const { modules } = inlineModule(quintModule)

    const expectedModule = dedent(`module A {
                                  |  type MY_ALIAS = int
                                  |  type MY_OTHER_ALIAS = int
                                  |  var x: int
                                  |}`)

    assert.deepEqual(moduleToString(modules[0]), expectedModule)
  })

  it('handles nested sum types constructors', () => {
    const quintModule = `module A {
      type T1 = B | C
      type T2 = Some(T1) | None
      var x: T2
    }`

    const { modules } = inlineModule(quintModule)

    const expectedModule = dedent(`module A {
                                  |  type T1 = (B | C)
                                  |  val C: (B | C) = variant("C", Tup())
                                  |  type T2 = (Some((B | C)) | None)
                                  |  val B: (B | C) = variant("B", Tup())
                                  |  def Some: ((B | C)) => (Some((B | C)) | None) = ((__SomeParam) => variant("Some", __SomeParam))
                                  |  val None: (Some((B | C)) | None) = variant("None", Tup())
                                  |  var x: (Some((B | C)) | None)
                                  |}`)

    assert.deepEqual(moduleToString(modules[0]), expectedModule)
  })
})
