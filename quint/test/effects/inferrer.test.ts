import { describe, it } from 'mocha'
import { assert } from 'chai'
import { LookupTable, LookupTableByModule, newTable } from '../../src/lookupTable'
import { buildModuleWithDefs } from '../builders/ir'
import { effectToString } from '../../src/effects/printing'
import { errorTreeToString } from '../../src/errorTree'
import { defaultValueDefinitions } from '../../src/definitionsCollector'
import { EffectInferrer } from '../../src/effects/inferrer'
import { FreshVarGenerator } from "../../src/FreshVarGenerator"

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
      { kind: 'param', identifier: 'tup', reference: 12n },
    ]),
  })

  const definitionsTable: LookupTableByModule = new Map<string, LookupTable>([['wrapper', table]])

  it('infers simple operator effect', () => {
    const quintModule = buildModuleWithDefs([
      `def a(p) = x' = p`,
    ])

    const inferrer = new EffectInferrer(definitionsTable, new FreshVarGenerator())
    const [errors, effects] = inferrer.inferEffects(quintModule)

    const expectedEffect = "(Read[v1]) => Read[v1] & Update['x']"

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectToString(effects.get(4n)!), expectedEffect)
  })

  it('infers application of multiple arity opertors', () => {
    const quintModule = buildModuleWithDefs([
      'def a(p) = and(p, x)',
      'def b(p) = and(p, 1, 2)',
    ])

    const inferrer = new EffectInferrer(definitionsTable, new FreshVarGenerator())
    const [errors, effects] = inferrer.inferEffects(quintModule)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectToString(effects.get(4n)!), "(Read[v4] & Temporal[v5]) => Read[v4, 'x'] & Temporal[v5]")
    assert.deepEqual(effectToString(effects.get(9n)!), '(Read[v4] & Temporal[v5]) => Read[v4] & Temporal[v5]')
  })

  it('infers references to operators', () => {
    const quintModule = buildModuleWithDefs([
      'def a(p) = foldl(x, p, iadd)',
    ])

    const inferrer = new EffectInferrer(definitionsTable, new FreshVarGenerator())
    const [errors, effects] = inferrer.inferEffects(quintModule)

    const expectedEffect = "(Read[v0]) => Read[v0, 'x']"

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectToString(effects.get(5n)!), expectedEffect)
  })

  it('infers references to user-defined operators', () => {
    const quintModule = buildModuleWithDefs([
      'def a(p) = def my_add = iadd { foldl(x, p, my_add) }',
    ])

    const inferrer = new EffectInferrer(definitionsTable, new FreshVarGenerator())
    const [errors, effects] = inferrer.inferEffects(quintModule)

    const expectedEffect = "(Read[v2]) => Read[v2, 'x']"

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectToString(effects.get(8n)!), expectedEffect)
  })

  it('infers effects for operators defined with let-in', () => {
    const quintModule = buildModuleWithDefs([
      'val b = val m = x { m }',
    ])

    const inferrer = new EffectInferrer(definitionsTable, new FreshVarGenerator())
    const [errors, effects] = inferrer.inferEffects(quintModule)

    const expectedEffect = "Read['x']"

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectToString(effects.get(4n)!), expectedEffect)
  })

  it('infers pure effect for literals and constants', () => {
    const quintModule = buildModuleWithDefs([
      'val b = N + 1',
    ])

    const inferrer = new EffectInferrer(definitionsTable, new FreshVarGenerator())
    const [errors, effects] = inferrer.inferEffects(quintModule)

    const expectedEffect = 'Pure'

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectToString(effects.get(3n)!), expectedEffect)
  })

  it('handles underscore', () => {
    const quintModule = buildModuleWithDefs([
      'val b = N.map(_ => 1)',
    ])

    const inferrer = new EffectInferrer(definitionsTable, new FreshVarGenerator())
    const [errors, effects] = inferrer.inferEffects(quintModule)

    const expectedEffect = 'Pure'

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectToString(effects.get(1n)!), expectedEffect)
  })

  it('infers polymorphic high order operators', () => {
    const quintModule = buildModuleWithDefs([
      'def a(g, p) = g(p)',
    ])

    const inferrer = new EffectInferrer(definitionsTable, new FreshVarGenerator())
    const [errors, effects] = inferrer.inferEffects(quintModule)

    const expectedEffect = '((e_p_1) => e0, e_p_1) => e0'

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectToString(effects.get(3n)!), expectedEffect)
  })

  it('infers monomorphic high order operators', () => {
    const quintModule = buildModuleWithDefs([
      'def a(g, p) = g(p) + g(not(p))',
    ])

    const inferrer = new EffectInferrer(definitionsTable, new FreshVarGenerator())
    const [errors, effects] = inferrer.inferEffects(quintModule)

    const expectedEffect = '((Read[v0] & Temporal[v1]) => Read[v2], Read[v0] & Temporal[v1]) => Read[v2]'

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectToString(effects.get(7n)!), expectedEffect)
  })

  it('unpacks arguments as tuples', () => {
    const quintModule = buildModuleWithDefs([
      'def a(tup) = Set(tup, (x, 4)).map((p, g) => p + g)',
    ])

    const inferrer = new EffectInferrer(definitionsTable, new FreshVarGenerator())
    const [errors, effects] = inferrer.inferEffects(quintModule)

    const expectedEffect = "(Read[v2]) => Read[v2, 'x']"

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectToString(effects.get(11n)!), expectedEffect)
  })

  it('returns error when operator signature is not defined', () => {
    const quintModule = buildModuleWithDefs([
      'def A = undefinedOperator(1)',
    ])

    const inferrer = new EffectInferrer(definitionsTable, new FreshVarGenerator())
    const [errors] = inferrer.inferEffects(quintModule)

    errors.forEach(v => assert.deepEqual(v, {
      location: 'Trying to infer effect for operator application in undefinedOperator(1)',
      message: 'Signature not found for name: undefinedOperator',
      children: [],
    }))
  })

  it('returns error when high order operator is undefined', () => {
    const quintModule = buildModuleWithDefs([
      'def a(p) = foldl(x, p, undefinedOperator)',
    ])

    const inferrer = new EffectInferrer(definitionsTable, new FreshVarGenerator())
    const [errors] = inferrer.inferEffects(quintModule)

    errors.forEach(v => assert.deepEqual(v, {
      location: 'Inferring effect for undefinedOperator',
      message: "Couldn't find undefinedOperator in the lookup table",
      children: [],
    }))
  })

  it('returns error when operator signature is not unifiable with args', () => {
    const quintModule = buildModuleWithDefs([
      `def a = S.map(p => x' = p)`,
    ])

    const inferrer = new EffectInferrer(definitionsTable, new FreshVarGenerator())
    const [errors] = inferrer.inferEffects(quintModule)

    errors.forEach(v => assert.deepEqual(v, {
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
    }))
  })

  it('returns error when operator signature is not defined inside a let-in body', () => {
    const quintModule = buildModuleWithDefs([
      'def A = val t = undefined(1) { t }',
    ])

    const inferrer = new EffectInferrer(definitionsTable, new FreshVarGenerator())
    const [errors] = inferrer.inferEffects(quintModule)

    errors.forEach(v => assert.deepEqual(v, {
      location: 'Trying to infer effect for operator application in undefined(1)',
      message: 'Signature not found for name: undefined',
      children: [],
    }))
  })
})
