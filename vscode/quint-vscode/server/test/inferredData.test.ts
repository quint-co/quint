import { describe, it } from 'mocha'
import { Loc, LookupTableByModule, QuintModule, parsePhase1, parsePhase2 } from '@informalsystems/quint'
import { checkTypesAndEffects } from '../src/inferredData'
import { assert } from 'chai'

function parse(moduleText: string): [QuintModule, Map<bigint, Loc>, LookupTableByModule] {
  const result1 = parsePhase1(moduleText, 'mocked_path')
  const result2 = result1.chain(parsePhase2)

  if (result1.isLeft() || result2.isLeft()) {
    throw new Error('Failed to parse mocked module')
  }

  return [result1.value.module, result1.value.sourceMap, result2.value.table]
}

describe('checkTypesAndEffects', () => {
  it('assembles inferred data for the module', async() => {
    const [module, sourceMap, table] = parse(`module test { val foo: int = 1 }`)

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
    const [module, sourceMap, table] = parse(`module test {
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
