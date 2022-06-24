import { describe, it } from 'mocha'
import { assert } from 'chai'
import { inferEffects } from '../../src/effects/inferrer'
import { DefinitionTable, DefinitionTableByModule } from '../../src/definitionsCollector'
import { Effect, Signature } from '../../src/effects/base'
import { buildModuleWithDefs } from '../builders/ir'
import { parseEffectOrThrow } from '../../src/effects/parser'

describe('inferEffects', () => {
  const table: DefinitionTable = {
    valueDefinitions: [
      { kind: 'param', identifier: 'p' },
      { kind: 'var', identifier: 'x' },
    ],
    typeDefinitions: [],
  }
  const definitionsTable: DefinitionTableByModule = new Map<string, DefinitionTable>([['wrapper', table]])

  const readManyEffect = (arity: number) => {
    const rs = Array.from(Array(arity).keys()).map(i => `r${i}`)
    const args = rs.map(r => `Read[${r}]`)
    return parseEffectOrThrow(`(${args.join(', ')}) => Read[${rs.join(', ')}]`)
  }
  const signatures: Map<string, Signature> = new Map<string, Signature>([
    ['assign', () => parseEffectOrThrow('(Read[r1], Read[r2] & Update[u2]) => Read[r2] & Update[r1, u2]')],
    ['multipleArityOp', readManyEffect],
  ])

  it('infers simple operator effect', () => {
    const tntModule = buildModuleWithDefs([
      'def a(p) = x <- p',
    ])

    const effects = inferEffects(signatures, definitionsTable, tntModule)

    const expectedEffect = parseEffectOrThrow("(Read[r_p]) => Read[r_p] & Update['x']")

    effects
      .map((es: Map<BigInt, Effect>) => assert.deepEqual(es.get(BigInt(4))!, expectedEffect))
      .mapLeft(console.log)

    assert.isTrue(effects.isRight())
  })

  it('infers application of multiple arity opertors', () => {
    const tntModule = buildModuleWithDefs([
      'def a(p) = multipleArityOp(p, x)',
      'def b(p) = multipleArityOp(p, 1, 2)',
    ])

    const effects = inferEffects(signatures, definitionsTable, tntModule)

    effects
      .map((es: Map<BigInt, Effect>) => {
        assert.deepEqual(es.get(BigInt(4))!, parseEffectOrThrow("(Read[r_p]) => Read[r_p, 'x']"))
        assert.deepEqual(es.get(BigInt(9))!, parseEffectOrThrow('(Read[r_p]) => Read[r_p]'))
      })
      .mapLeft(console.log)

    assert.isTrue(effects.isRight())
  })
})
