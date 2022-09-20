import { describe, it } from 'mocha'
import { assert } from 'chai'
import { inferEffects } from '../../src/effects/inferrer'
import { DefinitionTable, DefinitionTableByModule } from '../../src/definitionsCollector'
import { Effect, Signature } from '../../src/effects/base'
import { buildModuleWithDefs } from '../builders/ir'
import { parseEffectOrThrow } from '../../src/effects/parser'
import { effectToString } from '../../src/effects/printing'
import { errorTreeToString } from '../../src/errorTree'

describe('inferEffects', () => {
  const table: DefinitionTable = {
    valueDefinitions: [
      { kind: 'param', identifier: 'p' },
      { kind: 'const', identifier: 'N' },
      { kind: 'var', identifier: 'x' },
      { kind: 'val', identifier: 'm' },
      { kind: 'val', identifier: 't' },
      { kind: 'def', identifier: 'assign' },
      { kind: 'def', identifier: 'foldl' },
      { kind: 'def', identifier: 'iadd' },
      { kind: 'def', identifier: 'my_add' },
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
    ['assign', () => parseEffectOrThrow('(Read[r1], Read[r2]) => Read[r2] & Update[r1]')],
    ['multipleArityOp', readManyEffect],
    ['foldl', () => parseEffectOrThrow('(Read[r1], Read[r2], (Read[r1], Read[r2]) => Read[r3]) => Read[r1, r2, r3]')],
    ['iadd', () => parseEffectOrThrow('(Read[r1], Read[r2]) => Read[r1, r2]')],
  ])

  it('infers simple operator effect', () => {
    const tntModule = buildModuleWithDefs([
      'def a(p) = x <- p',
    ])

    const effects = inferEffects(signatures, definitionsTable, tntModule)

    const expectedEffect = "(Read[r_p_4]) => Read[r_p_4] & Update['x']"

    effects
      .map((es: Map<BigInt, Effect>) => assert.deepEqual(effectToString(es.get(BigInt(4))!), expectedEffect))
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('infers application of multiple arity opertors', () => {
    const tntModule = buildModuleWithDefs([
      'def a(p) = multipleArityOp(p, x)',
      'def b(p) = multipleArityOp(p, 1, 2)',
    ])

    const effects = inferEffects(signatures, definitionsTable, tntModule)

    effects
      .map((es: Map<BigInt, Effect>) => {
        assert.deepEqual(effectToString(es.get(BigInt(4))!), "(Read[r_p_4]) => Read[r_p_4, 'x']")
        assert.deepEqual(effectToString(es.get(BigInt(9))!), '(Read[r_p_9]) => Read[r_p_9]')
        return true
      })
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('infers references to operators', () => {
    const tntModule = buildModuleWithDefs([
      'def a(p) = foldl(x, p, iadd)',
    ])

    const effects = inferEffects(signatures, definitionsTable, tntModule)

    const expectedEffect = "(Read[v1]) => Read[v1, 'x']"

    effects
      .map((es: Map<BigInt, Effect>) => assert.deepEqual(effectToString(es.get(BigInt(5))!), expectedEffect))
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('infers references to user-defined operators', () => {
    const tntModule = buildModuleWithDefs([
      'def a(p) = def my_add = iadd { foldl(x, p, my_add) }',
    ])

    const effects = inferEffects(signatures, definitionsTable, tntModule)

    const expectedEffect = "(Read[v5]) => Read[v5, 'x']"

    effects
      .map((es: Map<BigInt, Effect>) => assert.deepEqual(effectToString(es.get(BigInt(8))!), expectedEffect))
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('infers effects for operators defined with let-in', () => {
    const tntModule = buildModuleWithDefs([
      'def A = val m = x { m }',
    ])

    const effects = inferEffects(signatures, definitionsTable, tntModule)

    const expectedEffect = "Read['x']"

    effects
      .map((es: Map<BigInt, Effect>) => assert.deepEqual(effectToString(es.get(BigInt(4))!), expectedEffect))
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('infers pure effect for literals and constants', () => {
    const tntModule = buildModuleWithDefs([
      'def A = N + 1',
    ])

    const effects = inferEffects(signatures, definitionsTable, tntModule)

    const expectedEffect = 'Pure'

    effects
      .map((es: Map<BigInt, Effect>) => assert.deepEqual(effectToString(es.get(BigInt(3))!), expectedEffect))
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('returns error when operator signature is not defined', () => {
    const tntModule = buildModuleWithDefs([
      'def A = undefined(1)',
    ])

    const effects = inferEffects(signatures, definitionsTable, tntModule)

    effects
      .mapLeft(e => e.forEach(v => assert.deepEqual(v, {
        location: 'Trying to infer effect for operator application in undefined(1)',
        message: 'Signature not found for operator: undefined',
        children: [],
      })))

    assert.isTrue(effects.isLeft())
  })

  it('returns error when high order operator is undefined', () => {
    const tntModule = buildModuleWithDefs([
      'def a(p) = foldl(x, p, undefined)',
    ])

    const effects = inferEffects(signatures, definitionsTable, tntModule)

    effects
      .mapLeft(e => e.forEach(v => assert.deepEqual(v, {
        location: 'Inferring effect for name undefined',
        message: "Couldn't find definition for undefined in definition table in scope",
        children: [],
      })))

    assert.isTrue(effects.isLeft())
  })

  it('returns error when operator signature is not unifiable with args', () => {
    const tntModule = buildModuleWithDefs([
      'def a(p) = foldl(x, p, assign)',
    ])

    const effects = inferEffects(signatures, definitionsTable, tntModule)

    effects
      .mapLeft(e => e.forEach(v => assert.deepEqual(v, {
        children: [{
          children: [{
            children: [{
              children: [{
                children: [],
                location: "Trying to unify variables [] and ['x']",
                message: 'Expected variables [] and [x] to be the same',
              }],
              location: "Trying to unify Read[v8] and Read[v1] & Update['x']",
            }],
            location: "Trying to unify (Read['x'], Read[r_p_5]) => Read[v8] and (Read[v0], Read[v1]) => Read[v1] & Update[v0]",
          }],
          location: "Trying to unify (Read[v4], Read[v5], (Read[v4], Read[v5]) => Read[v8]) => Read[v4, v5, v8] and (Read['x'], Read[r_p_5], (Read[v0], Read[v1]) => Read[v1] & Update[v0]) => e0",
        }],
        location: 'Trying to infer effect for operator application in foldl(x, p, assign)',
      })))

    assert.isTrue(effects.isLeft())
  })

  it('returns error when operator signature is not defined inside a let-in body', () => {
    const tntModule = buildModuleWithDefs([
      'def A = val t = undefined(1) { t }',
    ])

    const effects = inferEffects(signatures, definitionsTable, tntModule)

    effects
      .mapLeft(e => assert.sameDeepMembers(Array.from(e.values()), [
        {
          location: 'Trying to infer effect for operator application in undefined(1)',
          message: 'Signature not found for operator: undefined',
          children: [],
        },
      ]))

    assert.isTrue(effects.isLeft())
  })
})
