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

  it('finds an error when oneOf is used in a val', () => {
    const text = `module A {
      val a = Set(1,2).oneOf()
    }`

    const { module, table, types } = parseAndTypecheck(text)

    const errors = new NondetChecker(table).checkNondets(types, module.declarations)

    assert.sameDeepMembers(errors, [
      { code: 'QNT203', message: "'oneOf' must be used inside a nondet definition", reference: 4n, data: {} },
    ])
  })

  it('finds an error when oneOf is not the outtermost expression', () => {
    const text = `module A {
      var x: int

      action foo = { nondet bar = Set(1,2).oneOf() + 1 { x' = bar } }
    }`

    const { module, table, types } = parseAndTypecheck(text)

    const errors = new NondetChecker(table).checkNondets(types, module.declarations)

    assert.sameDeepMembers(errors, [
      {
        code: 'QNT204',
        message: "'oneOf' must be the outermost expression in a nondet definition",
        reference: 8n,
        data: {},
      },
    ])
  })

  it('find an error when nondet is a top-level definition', () => {
    const text = `module A {
      var x: int

      nondet top_level = Set(1,2).oneOf()
    }`

    const { module, table, types } = parseAndTypecheck(text)

    const errors = new NondetChecker(table).checkNondets(types, module.declarations)

    assert.sameDeepMembers(errors, [
      {
        code: 'QNT206',
        message: "'nondet' can only be used inside actions, not at the top level",
        reference: 7n,
        data: {},
      },
    ])
  })

  it('finds an error when the scope expression for the nondet binding is not boolean', () => {
    // FIXME: ideally this should also complain about the top-level def not
    // being an action. This requires the introduction of a new effect, which is
    // not trivial. For now, checking for boolean returns should already help a
    // lot.
    const text = `module A {
      // error: nondet bindings can only be used with boolean expressions
      val non_action = { nondet bar = Set(1,2).oneOf() bar }
    }`

    const { module, table, types } = parseAndTypecheck(text)

    const errors = new NondetChecker(table).checkNondets(types, module.declarations)

    assert.sameDeepMembers(errors, [
      {
        code: 'QNT205',
        message: 'nondet bindings can only be used with boolean expressions, but expression has type: int',
        reference: 7n,
        data: {},
      },
    ])
  })

  it('can survive missing types and lookup table entries', () => {
    const text = `module A {
      var x: int

      nondet top_level = Set(1,2).oneOf()
      val non_action = { nondet bar = Set(1,2).oneOf() bar }
    }`

    const { module } = parseAndTypecheck(text)
    const table = new Map()
    const types = new Map()

    const errors = new NondetChecker(table).checkNondets(types, module.declarations)

    assert.sameDeepMembers(errors, [])
  })
})
