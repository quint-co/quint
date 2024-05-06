import { describe, it } from 'mocha'
import { assert } from 'chai'
import { errorTreeToString, newIdGenerator, parse, quintErrorToString } from '../../src'
import { NondetChecker } from '../../src/effects/NondetChecker'
import { SourceLookupPath } from '../../src/parsing/sourceResolver'
import { TypeInferrer } from '../../src/types/inferrer'

describe('checkNondets', () => {
  function parseAndTypecheck(text: string) {
    const idGen = newIdGenerator()
    const fake_path: SourceLookupPath = { normalizedPath: 'fake_path', toSourceName: () => 'fake_path' }
    const { modules, table, errors } = parse(idGen, 'fake_location', fake_path, text)
    assert.isEmpty(errors, `Unexpected parse errors: ${[...errors].map(quintErrorToString)}`)

    const typeInferrer = new TypeInferrer(table)
    const [typeErrors, types] = typeInferrer.inferTypes(modules[0].declarations)
    assert.isEmpty(typeErrors, `Unexpected type errors: ${[...typeErrors.values()].map(errorTreeToString)}`)

    return { module: modules[0], table, types }
  }

  it('returns empty map for effects with no problems', () => {
    const text = `module A {
      val a = 1
      var x: int
      action foo = { nondet bar = Set(1,2).oneOf() x' = bar }
    }`

    const { module, table, types } = parseAndTypecheck(text)

    const errors = new NondetChecker(table).checkNondets(types, module.declarations)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(quintErrorToString)}`)
  })

  it('returns a map with errors for all problems', () => {
    const text = `module A {
      val a = Set(1,2).oneOf() // error: 'oneOf' must be used inside a nondet definition
      var x: int

      // error: 'oneOf' must be the outtermost expression in a nondet definition
      action foo = { nondet bar = Set(1,2).oneOf() + 1 { x' = bar } }

      nondet top_level = Set(1,2).oneOf() // error: TODO

      // error: nondet bindings can only be used with boolean expressions
      val non_action = { nondet bar = Set(1,2).oneOf() bar }
    }`

    const { module, table, types } = parseAndTypecheck(text)

    const errors = new NondetChecker(table).checkNondets(types, module.declarations)

    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [4n, { code: 'QNT203', message: "'oneOf' must be used inside a nondet definition", reference: 4n, data: {} }],
        [
          13n,
          {
            code: 'QNT204',
            message: "'oneOf' must be the outtermost expression in a nondet definition",
            reference: 13n,
            data: {},
          },
        ],
        [
          24n,
          {
            code: 'QNT206',
            message: "'nondet' can only be used inside actions, not at the top level",
            reference: 24n,
            data: {},
          },
        ],
        [
          31n,
          {
            code: 'QNT205',
            message: 'nondet bindings can only be used with boolean expressions',
            reference: 31n,
            data: {},
          },
        ],
      ]
    )
  })
})
