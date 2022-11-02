import { describe, it } from 'mocha'
import { assert } from 'chai'
import { inferEffects } from '../../src/effects/inferrer'
import { LookupTable, LookupTableByModule, newTable } from '../../src/lookupTable'
import { Effect, Signature } from '../../src/effects/base'
import { buildModuleWithDefs } from '../builders/ir'
import { parseEffectOrThrow } from '../../src/effects/parser'
import { effectToString } from '../../src/effects/printing'
import { errorTreeToString } from '../../src/errorTree'

describe('inferEffects', () => {
  const table: LookupTable = newTable({
    valueDefinitions: [
      { kind: 'param', identifier: 'p', reference: 1n },
      { kind: 'const', identifier: 'N', reference: 2n },
      { kind: 'var', identifier: 'x', reference: 3n },
      { kind: 'val', identifier: 'm', reference: 2n },
      { kind: 'val', identifier: 't', reference: 5n },
      { kind: 'def', identifier: 'f', reference: 6n },
      { kind: 'param', identifier: 'g', reference: 7n },
      { kind: 'def', identifier: 'my_add', reference: 2n },
      { kind: 'def', identifier: 'a', reference: 9n },
      { kind: 'val', identifier: 'b', reference: 10n },
    ],
  })

  const definitionsTable: LookupTableByModule = new Map<string, LookupTable>([['wrapper', table]])

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
    ['not', () => parseEffectOrThrow('(Read[r1] & Temporal[t1]) => Read[r1] & Temporal[t1]')],
  ])

  it('infers simple operator effect', () => {
    const tntModule = buildModuleWithDefs([
      'def a(p) = x <- p',
    ])

    const effects = inferEffects(signatures, definitionsTable, tntModule)

    const expectedEffect = "(Read[v1]) => Read[v1] & Update['x']"

    effects
      .map((es: Map<bigint, Effect>) => assert.deepEqual(effectToString(es.get(4n)!), expectedEffect))
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
      .map((es: Map<bigint, Effect>) => {
        assert.deepEqual(effectToString(es.get(4n)!), "(Read[v2]) => Read[v2, 'x']")
        assert.deepEqual(effectToString(es.get(9n)!), '(Read[v2]) => Read[v2]')
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
      .map((es: Map<bigint, Effect>) => assert.deepEqual(effectToString(es.get(5n)!), expectedEffect))
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

    const expectedEffect = "(Read[v1]) => Read[v1, 'x']"

    effects
      .map((es: Map<bigint, Effect>) => assert.deepEqual(effectToString(es.get(8n)!), expectedEffect))
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('infers effects for operators defined with let-in', () => {
    const tntModule = buildModuleWithDefs([
      'val b = val m = x { m }',
    ])

    const effects = inferEffects(signatures, definitionsTable, tntModule)

    const expectedEffect = "Read['x']"

    effects
      .map((es: Map<bigint, Effect>) => assert.deepEqual(effectToString(es.get(4n)!), expectedEffect))
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('infers pure effect for literals and constants', () => {
    const tntModule = buildModuleWithDefs([
      'val b = N + 1',
    ])

    const effects = inferEffects(signatures, definitionsTable, tntModule)

    const expectedEffect = 'Pure'

    effects
      .map((es: Map<bigint, Effect>) => assert.deepEqual(effectToString(es.get(3n)!), expectedEffect))
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('infers polymorphic high order operators', () => {
    const tntModule = buildModuleWithDefs([
      'def a(g, p) = g(p)',
    ])

    const effects = inferEffects(signatures, definitionsTable, tntModule)

    const expectedEffect = '((e_p_1) => e0, e_p_1) => e0'

    effects
      .map((es: Map<bigint, Effect>) => assert.deepEqual(effectToString(es.get(3n)!), expectedEffect))
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('infers monomorphic high order operators', () => {
    const tntModule = buildModuleWithDefs([
      'def a(g, p) = g(p) + g(not(p))',
    ])

    const effects = inferEffects(signatures, definitionsTable, tntModule)

    const expectedEffect = '((Read[v0] & Temporal[v1]) => Read[v2], Read[v0] & Temporal[v1]) => Read[v2]'

    effects
      .map((es: Map<bigint, Effect>) => assert.deepEqual(effectToString(es.get(7n)!), expectedEffect))
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
        message: 'Signature not found for name: undefined',
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
        location: 'Inferring effect for undefined',
        message: 'Signature not found for name: undefined',
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
              location: "Trying to unify Read[v4] and Read[v1] & Update['x']",
            }],
            location: "Trying to unify (Read['x'], Read[v3]) => Read[v4] and (Read[v0], Read[v1]) => Read[v1] & Update[v0]",
          }],
          location: "Trying to unify (Read[v2], Read[v3], (Read[v2], Read[v3]) => Read[v4]) => Read[v2, v3, v4] and (Read['x'], e_p_1, (Read[v0], Read[v1]) => Read[v1] & Update[v0]) => e0",
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
          message: 'Signature not found for name: undefined',
          children: [],
        },
      ]))

    assert.isTrue(effects.isLeft())
  })
})
