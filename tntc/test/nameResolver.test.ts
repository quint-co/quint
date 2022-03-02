import { describe, it } from 'mocha'
import { assert } from 'chai'
import { NameDefinition, defaultDefinitions } from '../src/definitionsCollector'
import { resolveNames, NameResolutionResult } from '../src/nameResolver'
import { TntModule, TntEx } from '../src/tntIr'

describe('nameResolver', () => {
  // The test definition is:
  //   def A = x -> set(x)
  // Every part of the definition is defined separately
  // in order to check the error trace

  // x
  const nameExpr: TntEx = {
    kind: 'name',
    name: 'x',
    id: BigInt(12),
    type: { kind: 'int' },
  }

  // set(x)
  const appExpr: TntEx = {
    kind: 'app',
    opcode: 'set',
    args: [nameExpr],
    id: BigInt(11),
    type: { kind: 'int' },
  }

  // x -> set(x)
  const lambdaExpr: TntEx = {
    kind: 'lambda',
    params: ['x'],
    qualifier: 'def',
    expr: appExpr,
    id: BigInt(10),
    type: { kind: 'int' },
  }

  // Dummy expression to generate different scope
  const valueExpr: TntEx = {
    kind: 'bool',
    value: true,
    id: BigInt(20),
    type: { kind: 'bool' },
  }

  const tntModule: TntModule = {
    name: 'Test module',
    id: BigInt(0),
    defs: [
      { kind: 'def', name: 'A', qualifier: 'def', expr: lambdaExpr, id: BigInt(1), type: { kind: 'int' } },
      { kind: 'def', name: 'B', qualifier: 'def', expr: valueExpr, id: BigInt(2), type: { kind: 'int' } },
    ],
  }

  it('finds top level definitions', () => {
    const definitions: NameDefinition[] = defaultDefinitions.concat([
      {
        identifier: 'TEST_CONSTANT',
        kind: 'const',
      },
      {
        identifier: 'x',
        kind: 'def',
      },
    ])

    const result = resolveNames(tntModule, definitions)
    assert.deepEqual(result, { kind: 'ok' })
  })

  it('finds scoped definitions', () => {
    const definitions: NameDefinition[] = defaultDefinitions.concat([
      {
        identifier: 'TEST_CONSTANT',
        kind: 'const',
      },
      {
        identifier: 'x',
        kind: 'def',
        scope: BigInt(10),
      },
    ])

    const result = resolveNames(tntModule, definitions)
    assert.deepEqual(result, { kind: 'ok' })
  })

  it('does not find scoped definitions outside of scope', () => {
    const definitions: NameDefinition[] = defaultDefinitions.concat([
      {
        identifier: 'TEST_CONSTANT',
        kind: 'const',
      },
      {
        identifier: 'x',
        kind: 'def',
        scope: BigInt(20),
      },
    ])

    const result = resolveNames(tntModule, definitions)
    const expectedResult: NameResolutionResult = {
      kind: 'error',
      errors: [{ name: 'x', expression: nameExpr, trace: [nameExpr, appExpr] }],
    }
    assert.deepEqual(result, expectedResult)
  })
})
