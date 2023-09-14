import { describe, it } from 'mocha'
import { assert } from 'chai'
import { newIdGenerator } from '../../src/idGenerator'
import { SourceLookupPath } from '../../src/parsing/sourceResolver'
import { parse } from '../../src/parsing/quintParserFrontend'
import { unshadowNames } from '../../src/names/unshadower'
import { moduleToString } from '../../src'
import { dedent } from '../textUtils'

describe('unshadowNames', () => {
  function parseModules(text: string) {
    const idGenerator = newIdGenerator()
    const fake_path: SourceLookupPath = { normalizedPath: 'fake_path', toSourceName: () => 'fake_path' }

    const result = parse(idGenerator, 'test_location', fake_path, text)
    if (result.isLeft()) {
      assert.fail(`Expected no error, but got ${result.value.map(e => e.explanation)}`)
    }

    return result.unwrap()
  }

  it('returns a module with no shadowed names', () => {
    const { modules, table } = parseModules(`
      module A {
        def f(a) = a > 0
        val b = val a = 1 { a }
      }

      module B {
        var a: int
        import A.*
      }`)

    const unshadowedModules = modules.map(m => unshadowNames(m, table))

    assert.sameDeepMembers(unshadowedModules.map(moduleToString), [
      dedent(`module A {
             |  val b = val a_9 = 1 { a_9 }
             |  def f = ((a_5) => igt(a_5, 0))
             |}`),
      dedent(`module B {
              |  var a: int
              |  import A.*
              |}`),
    ])
  })
})
