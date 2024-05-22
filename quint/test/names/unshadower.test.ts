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
    assert.isEmpty(result.errors)

    return result
  }

  it('returns a module with no shadowed names', () => {
    const { modules, table } = parseModules(`
      module A {
        val b = val a = 1 { a }
        val c = val a = { val a = 1 { a } } { a }
        val d = val a = 1 { val a = 2 { a } }
        def f(a) = a > 0
        def g(a) = a.map(a => a + 1)
      }

      module B {
        var a: int
        import A.*
      }`)

    const unshadowedModules = modules.map(m => unshadowNames(m, table))

    assert.sameDeepMembers(unshadowedModules.map(moduleToString), [
      dedent(`module A {
             |  val d = val a = 1 { val a_19 = 2 { a_19 } }
             |  def f = ((a_26) => igt(a_26, 0))
             |  def g = ((a_36) => map(a_36, ((a_34) => iadd(a_34, 1))))
             |  val b = val a = 1 { a }
             |  val c = val a = val a_9 = 1 { a_9 } { a }
             |}`),
      dedent(`module B {
              |  var a: int
              |  import A.*
              |}`),
    ])
  })
})
