import { describe, it } from 'mocha'
import { assert } from 'chai'
import { inferEffects } from '../../src/effects/inferrer'
import { DefinitionTable, DefinitionTableByModule } from '../../src/definitionsCollector'
import { Effect, Signature } from '../../src/effects/base'
import { buildModuleWithDefs } from '../builders/ir'
import { parseEffectOrThrow } from '../../src/effects/parser'
import { effectToString, errorTreeToString } from '../../src/effects/printing'

describe('inferEffects', () => {
  const table: DefinitionTable = {
    valueDefinitions: [
      { kind: 'param', identifier: 'p' },
      { kind: 'const', identifier: 'N' },
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
    ['foldl', () => parseEffectOrThrow('(Read[r1], Read[r2], (Read[p1], Read[p2]) => Read[p1, p2]) => Read[r1, r2, p1, p2]')],
    ['iadd', () => parseEffectOrThrow('(Read[r1], Read[r2]) => Read[r1, r2]')],
  ])

  it('infers simple operator effect', () => {
    const tntModule = buildModuleWithDefs([
      'def a(p) = x <- p',
    ])

    const effects = inferEffects(signatures, definitionsTable, tntModule)

    const expectedEffect = "(Read[r_p]) => Read[r_p] & Update['x']"

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
        assert.deepEqual(effectToString(es.get(BigInt(4))!), "(Read[r_p]) => Read[r_p, 'x']")
        assert.deepEqual(effectToString(es.get(BigInt(9))!), '(Read[r_p]) => Read[r_p]')
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

    const expectedEffect = "(Read[r_p]) => Read[r_p, 'x']"

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

    const expectedEffect = "(Read[r_p]) => Read[r_p, 'x']"

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
        message: 'Signature not found for operator: undefined',
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
                message: 'Expected variable(s) [] and [x] to be the same',
              }],
              location: "Trying to unify Read[r_p, 'x'] and Read[r_p] & Update['x']",
            }],
            location: "Trying to unify (Read[p1], Read[p2]) => Read[p1, p2] and (Read['x'], Read[r_p] & Update[u2]) => Read[r_p] & Update[u2, 'x']",
          }],
          location: "Trying to unify (Read[r1], Read[r2], (Read[p1], Read[p2]) => Read[p1, p2]) => Read[r1, r2, p1, p2] and (Read['x'], Read[r_p], (Read[r1], Read[r2] & Update[u2]) => Read[r2] & Update[r1, u2]) => e0 ",
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
        {
          message: 'Signature not found for operator: t',
          location: 'Inferring effect for name t',
          children: [],
        },
      ]))

    assert.isTrue(effects.isLeft())
  })
})
