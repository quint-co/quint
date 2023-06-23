import { assert } from 'chai'
import { QuintModule } from '../../src/quintIr'
import { inlineAliases } from '../../src/types/aliasInliner'
import { newIdGenerator } from '../../src/idGenerator'
import { SourceLookupPath } from '../../src/parsing/sourceResolver'
import { parse } from '../../src/parsing/quintParserFrontend'
import { moduleToString } from '../../src'
import { dedent } from '../textUtils'

function inlineModule(text: string): QuintModule {
  const idGen = newIdGenerator()
  const fake_path: SourceLookupPath = { normalizedPath: 'fake_path', toSourceName: () => 'fake_path' }
  const parseResult = parse(idGen, 'fake_location', fake_path, text)
  if (parseResult.isLeft()) {
    assert.fail('Failed to parse mocked up module')
  }
  const { modules, table } = parseResult.unwrap()

  return inlineAliases(table, modules[0])
}

describe('inlineAliases', () => {
  it('should inline aliases in a simple module', () => {
    const quintModule = `module A {
      type MY_ALIAS = int
      var x: MY_ALIAS
    }`

    const result = inlineModule(quintModule)

    const expectedModule = dedent(`module A {
                                  |  var x: int
                                  |}`)

    assert.deepEqual(moduleToString(result), expectedModule)
  })

  it('should handle nested aliases', () => {
    const quintModule = `module A {
      type MY_ALIAS = int
      type MY_OTHER_ALIAS = MY_ALIAS
      var x: MY_OTHER_ALIAS
    }`

    const result = inlineModule(quintModule)
    const expectedModule = dedent(`module A {
                                  |  var x: int
                                  |}`)

    assert.deepEqual(moduleToString(result), expectedModule)
  })
})
