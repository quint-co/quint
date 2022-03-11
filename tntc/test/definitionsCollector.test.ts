import { describe, it } from 'mocha'
import { assert } from 'chai'
import { NameDefinition, collectDefinitions, defaultDefinitions } from '../src/definitionsCollector'
import { TntModule } from '../src/tntIr'

describe('collectDefinitions', () => {
  it('finds top level definitions', () => {
    const tntModule: TntModule = {
      name: 'Test module',
      id: BigInt(0),
      defs: [
        { kind: 'const', name: 'TEST_CONSTANT', id: BigInt(1), type: { kind: 'int' } },
        { kind: 'var', name: 'test_var', id: BigInt(2), type: { kind: 'str' } },
        { kind: 'instance', name: 'test_instance', id: BigInt(3), overrides: [], identityOverride: true, protoName: 'OtherModule' },
        { kind: 'module', id: BigInt(4), module: { name: 'TestModule', id: BigInt(5), defs: [] } },
      ],
    }

    const expectedDefinitions: NameDefinition[] = defaultDefinitions.concat([
      {
        identifier: 'TEST_CONSTANT',
        kind: 'const',
      },
      {
        identifier: 'test_var',
        kind: 'var',
      },
      {
        identifier: 'test_instance',
        kind: 'namespace',
      },
      {
        identifier: 'TestModule',
        kind: 'namespace',
      },
    ])

    const result = collectDefinitions(tntModule)
    assert.deepEqual(result, { nameDefinitions: expectedDefinitions, typeDefinitions: [] })
  })

  it('finds scoped definitions', () => {
    const tntModule: TntModule = {
      name: 'Test module',
      id: BigInt(0),
      defs: [
        {
          id: BigInt(1),
          kind: 'def',
          name: 'test_definition',
          qualifier: 'val',
          expr: {
            id: BigInt(2),
            kind: 'let',
            opdef: {
              id: BigInt(3),
              kind: 'def',
              name: 'test_op',
              qualifier: 'val',
              expr: {
                id: BigInt(4),
                kind: 'lambda',
                params: ['x'],
                qualifier: 'def',
                expr: { id: BigInt(5), kind: 'name', name: 'x' },
              },
            },
            expr: {
              id: BigInt(6),
              kind: 'name',
              name: 'test_op',
            },
          },
        },
      ],
    }

    const expectedDefinitions: NameDefinition[] = defaultDefinitions.concat([
      {
        identifier: 'test_definition',
        kind: 'def',
      },
      {
        identifier: 'test_op',
        kind: 'val',
        scope: BigInt(2),
      },
      {
        identifier: 'x',
        kind: 'def',
        scope: BigInt(4),
      },
    ])

    const result = collectDefinitions(tntModule)
    assert.deepEqual(result, { nameDefinitions: expectedDefinitions, typeDefinitions: [] })
  })
})
