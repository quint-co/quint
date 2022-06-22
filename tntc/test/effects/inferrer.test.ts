import { describe, it } from 'mocha'
import { assert } from 'chai'
import { inferEffects } from '../../src/effects/inferrer'
import { DefinitionTable, DefinitionTableByModule } from '../../src/definitionsCollector'
import { Signature } from '../../src/effects/builtinSignatures'
import { buildModuleWithDefs } from '../builders/ir'
import { parseEffectOrThrow } from '../../src/effects/parser'
import { Effect } from '../../src/effects/base'

describe('inferEffects', () => {
  const table: DefinitionTable = {
    valueDefinitions: [
      { kind: 'param', identifier: 'p' },
      { kind: 'var', identifier: 'x' },
    ],
    typeDefinitions: [],
  }
  const definitionsTable: DefinitionTableByModule = new Map<string, DefinitionTable>([['wrapper', table]])
  const signatures: Map<string, Signature> = new Map<string, Signature>([
    ['assign', () => parseEffectOrThrow('(Read[r1], Read[r2] & Update[u2]) => Read[r2] & Update[r1, u2]')],
  ])

  it('infer simple operator effect', () => {
    const tntModule = buildModuleWithDefs([
      'def a(p) = x <- p',
    ])

    const effects = inferEffects(signatures, definitionsTable, tntModule)

    const expectedEffect = parseEffectOrThrow("(Pure) => Update['x']")

    effects
      .map((es: Map<BigInt, Effect>) => assert.deepEqual(es.get(BigInt(4))!, expectedEffect))
      .mapLeft(console.log)

    assert.isTrue(effects.isRight())
  })
})
