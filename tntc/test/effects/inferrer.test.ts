import { describe, it } from 'mocha'
import { assert } from 'chai'
import { inferEffects } from '../../src/effects/inferrer'
import { LookupTable, LookupTableByModule, newTable } from '../../src/lookupTable'
import { Effect } from '../../src/effects/base'
import { buildModuleWithDefs } from '../builders/ir'
import { effectToString } from '../../src/effects/printing'
import { errorTreeToString } from '../../src/errorTree'
import { defaultValueDefinitions } from '../../src/definitionsCollector'

describe('inferEffects', () => {
  const table: LookupTable = newTable({
    valueDefinitions: defaultValueDefinitions().concat([
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
      { kind: 'const', identifier: 'S', reference: 11n },
    ]),
  })

  const definitionsTable: LookupTableByModule = new Map<string, LookupTable>([['wrapper', table]])

  it('infers simple operator effect', () => {
    const tntModule = buildModuleWithDefs([
      'def a(p) = x <- p',
    ])

    const effects = inferEffects(definitionsTable, tntModule)

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
      'def a(p) = and(p, x)',
      'def b(p) = and(p, 1, 2)',
    ])

    const effects = inferEffects(definitionsTable, tntModule)

    effects
      .map((es: Map<bigint, Effect>) => {
        assert.deepEqual(effectToString(es.get(4n)!), "(Read[v4] & Temporal[v5]) => Read[v4, 'x'] & Temporal[v5]")
        assert.deepEqual(effectToString(es.get(9n)!), '(Read[v4] & Temporal[v5]) => Read[v4] & Temporal[v5]')
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

    const effects = inferEffects(definitionsTable, tntModule)

    const expectedEffect = "(Read[v0]) => Read[v0, 'x']"

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

    const effects = inferEffects(definitionsTable, tntModule)

    const expectedEffect = "(Read[v2]) => Read[v2, 'x']"

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

    const effects = inferEffects(definitionsTable, tntModule)

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

    const effects = inferEffects(definitionsTable, tntModule)

    const expectedEffect = 'Pure'

    effects
      .map((es: Map<bigint, Effect>) => assert.deepEqual(effectToString(es.get(3n)!), expectedEffect))
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('handles underscore', () => {
    const tntModule = buildModuleWithDefs([
      'val b = N.map(_ => 1)',
    ])

    const effects = inferEffects(definitionsTable, tntModule)

    const expectedEffect = 'Pure'

    effects
      .map((es: Map<bigint, Effect>) => assert.deepEqual(effectToString(es.get(1n)!), expectedEffect))
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('infers polymorphic high order operators', () => {
    const tntModule = buildModuleWithDefs([
      'def a(g, p) = g(p)',
    ])

    const effects = inferEffects(definitionsTable, tntModule)

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

    const effects = inferEffects(definitionsTable, tntModule)

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
      'def A = undefinedOperator(1)',
    ])

    const effects = inferEffects(definitionsTable, tntModule)

    effects
      .mapLeft(e => e.forEach(v => assert.deepEqual(v, {
        location: 'Trying to infer effect for operator application in undefinedOperator(1)',
        message: 'Signature not found for name: undefinedOperator',
        children: [],
      })))

    assert.isTrue(effects.isLeft())
  })

  it('returns error when high order operator is undefined', () => {
    const tntModule = buildModuleWithDefs([
      'def a(p) = foldl(x, p, undefinedOperator)',
    ])

    const effects = inferEffects(definitionsTable, tntModule)

    effects
      .mapLeft(e => e.forEach(v => assert.deepEqual(v, {
        location: 'Inferring effect for undefinedOperator',
        message: "Couldn't find undefinedOperator in the lookup table",
        children: [],
      })))

    assert.isTrue(effects.isLeft())
  })

  it('returns error when operator signature is not unifiable with args', () => {
    const tntModule = buildModuleWithDefs([
      'def a = S.map(p => x <- p)',
    ])

    const effects = inferEffects(definitionsTable, tntModule)

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
              location: "Trying to unify Read[v3] and Update['x']",
            }],
            location: "Trying to unify (Pure) => Read[v3] and (Read[v1]) => Read[v1] & Update['x']",
          }],
          location: "Trying to unify (Read[v2], (Read[v2]) => Read[v3]) => Read[v2, v3] and (Pure, (Read[v1]) => Read[v1] & Update['x']) => e1",
        }],
        location: 'Trying to infer effect for operator application in map(S, (p => assign(x, p)))',
      })))

    assert.isTrue(effects.isLeft())
  })

  it('returns error when operator signature is not defined inside a let-in body', () => {
    const tntModule = buildModuleWithDefs([
      'def A = val t = undefined(1) { t }',
    ])

    const effects = inferEffects(definitionsTable, tntModule)

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
