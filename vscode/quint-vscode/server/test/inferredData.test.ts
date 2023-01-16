import { describe, it } from 'mocha'
import { Loc, LookupTableByModule, QuintModule, parsePhase1, parsePhase2 } from '@informalsystems/quint'
import { checkTypesAndEffects } from '../src/inferredData'
import { assert } from 'chai'
import { parseOrThrow } from './util'


describe('checkTypesAndEffects', () => {
  it('assembles inferred data for the module', async() => {
    const [module, sourceMap, table] = parseOrThrow(`module test { val foo: int = 1 }`)

    const inferredData = checkTypesAndEffects(module, sourceMap, table)

    const r = await inferredData.catch(e => assert.fail(`Unexpected error: ${e}`))

    assert.sameDeepMembers([...r.effects.entries()], [
      [
        {
          start: { col: 29, index: 29, line: 0 },
          end: { col: 29, index: 29, line: 0 },
          source: "mocked_path",
        },
        "Pure",
      ],
      [
        {
          start: { col: 14, index: 14, line: 0 },
          end: { col: 29, index: 29, line: 0 },
          source: "mocked_path",
        },
        "Pure",
      ],
    ])
    assert.sameDeepMembers([...r.types.entries()], [
      [
        {
          start: { col: 29, index: 29, line: 0 },
          end: { col: 29, index: 29, line: 0 },
          source: "mocked_path",
        },
        "int",
      ],
      [
        {
          start: { col: 14, index: 14, line: 0 },
          end: { col: 29, index: 29, line: 0 },
          source: "mocked_path",
        },
        "int",
      ],
    ])
    assert.sameDeepMembers([...r.modes.entries()], [
      [3n, "pureval"],
    ])
  })

  it('returns diagnostics for errors', async() => {
    const [module, sourceMap, table] = parseOrThrow(`module test {
      var x: int

      val foo: int = always(x > 1)
    }`)

    const inferredData = checkTypesAndEffects(module, sourceMap, table)

    const r = await inferredData.catch(e => assert.sameDeepMembers(e, [
      {
        message: "Couldn't unify bool and int\nTrying to unify bool and int\n",
        range: {
          start: { character: 6, line: 3 },
          end: { character: 34, line: 3 },
        },
        severity: 1,
        source: "parser",
      },
      {
        message: "Expected temporal mode, found: val\nChecking modes for val foo: int = always(igt(x, 1))\n",
        range: {
          start: { character: 6, line: 3 },
          end: { character: 34, line: 3 },
        },
        severity: 1,
        source: "parser",
      },
    ]))

    assert.deepEqual(r, undefined)
  })
})
