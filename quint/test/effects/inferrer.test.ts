import { describe, it } from 'mocha'
import { assert } from 'chai'
import { LookupTable, LookupTableByModule, mergeTables, newTable } from '../../src/lookupTable'
import { buildModuleWithDefs } from '../builders/ir'
import { effectSchemeToString } from '../../src/effects/printing'
import { errorTreeToString } from '../../src/errorTree'
import { collectDefinitions, defaultValueDefinitions } from '../../src/definitionsCollector'
import { EffectInferenceResult, EffectInferrer } from '../../src/effects/inferrer'
import { QuintModule } from '../../src'

describe('inferEffects', () => {
  const table: LookupTable = newTable({
    valueDefinitions: defaultValueDefinitions().concat([
      { kind: 'const', identifier: 'N', reference: 1n },
      { kind: 'const', identifier: 'S', reference: 1n },
      { kind: 'var', identifier: 'x', reference: 1n },
    ]),
  })

  function inferEffectsForModule(quintModule: QuintModule): EffectInferenceResult {
    const mergedTable = mergeTables(collectDefinitions(quintModule).get('wrapper')!, table)
    const definitionsTable: LookupTableByModule = new Map<string, LookupTable>([['wrapper', mergedTable]])

    const inferrer = new EffectInferrer(definitionsTable)
    return inferrer.inferEffects(quintModule)

  }

  it('infers simple operator effect', () => {
    const quintModule = buildModuleWithDefs([
      `def a(p) = x' = p`,
    ])

    const [errors, effects] = inferEffectsForModule(quintModule)

    const expectedEffect = "∀ v0 . (Read[v0]) => Read[v0] & Update['x']"

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectSchemeToString(effects.get(4n)!), expectedEffect)
  })

  it('infers application of multiple arity opertors', () => {
    const quintModule = buildModuleWithDefs([
      'def a(p) = and(p, x)',
      'def b(p) = and(p, 1, 2)',
    ])

    const [errors, effects] = inferEffectsForModule(quintModule)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectSchemeToString(effects.get(4n)!), "∀ v0, v1 . (Read[v0] & Temporal[v1]) => Read[v0, 'x'] & Temporal[v1]")
    assert.deepEqual(effectSchemeToString(effects.get(9n)!), '∀ v0, v1 . (Read[v0] & Temporal[v1]) => Read[v0] & Temporal[v1]')
  })

  it('infers references to operators', () => {
    const quintModule = buildModuleWithDefs([
      'def a(p) = foldl(x, p, iadd)',
    ])

    const [errors, effects] = inferEffectsForModule(quintModule)

    const expectedEffect = "∀ v0, v1 . (Read[v0] & Temporal[v1]) => Read[v0, 'x'] & Temporal[v1]"

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectSchemeToString(effects.get(5n)!), expectedEffect)
  })

  it('infers references to user-defined operators', () => {
    const quintModule = buildModuleWithDefs([
      'def a(p) = def my_add = iadd { foldl(x, p, my_add) }',
    ])

    const [errors, effects] = inferEffectsForModule(quintModule)

    const expectedEffect = "∀ v0, v1 . (Read[v0] & Temporal[v1]) => Read[v0, 'x'] & Temporal[v1]"

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectSchemeToString(effects.get(8n)!), expectedEffect)
  })

  it('infers effects for operators defined with let-in', () => {
    const quintModule = buildModuleWithDefs([
      'val b = val m = x { m }',
    ])

    const [errors, effects] = inferEffectsForModule(quintModule)

    const expectedEffect = "Read['x']"

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectSchemeToString(effects.get(4n)!), expectedEffect)
  })

  it('infers pure effect for literals and constants', () => {
    const quintModule = buildModuleWithDefs([
      'val b = N + 1',
    ])

    const [errors, effects] = inferEffectsForModule(quintModule)

    const expectedEffect = 'Pure'

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectSchemeToString(effects.get(3n)!), expectedEffect)
  })

  it('handles underscore', () => {
    const quintModule = buildModuleWithDefs([
      'val b = N.map(_ => 1)',
    ])

    const [errors, effects] = inferEffectsForModule(quintModule)

    const expectedEffect = 'Pure'

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectSchemeToString(effects.get(1n)!), expectedEffect)
  })

  it('infers polymorphic high order operators', () => {
    const quintModule = buildModuleWithDefs([
      'def a(g, p) = g(p)',
    ])

    const [errors, effects] = inferEffectsForModule(quintModule)

    const expectedEffect = '∀ e0, e1 . ((e0) => e1, e0) => e1'

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectSchemeToString(effects.get(3n)!), expectedEffect)
  })

  it('infers monomorphic high order operators', () => {
    const quintModule = buildModuleWithDefs([
      'def a(g, p) = g(p) + g(not(p))',
    ])

    const [errors, effects] = inferEffectsForModule(quintModule)

    const expectedEffect = '∀ v0, v1, v2, v3 . ((Read[v0] & Temporal[v1]) => Read[v2] & Temporal[v3], Read[v0] & Temporal[v1]) => Read[v2] & Temporal[v3]'

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectSchemeToString(effects.get(7n)!), expectedEffect)
  })

  it('unpacks arguments as tuples', () => {
    const quintModule = buildModuleWithDefs([
      'def a(tup) = Set(tup, (x, 4)).map((p, g) => p + g)',
    ])

    const [errors, effects] = inferEffectsForModule(quintModule)

    const expectedEffect = "∀ v0, v1 . (Read[v0] & Temporal[v1]) => Read[v0, 'x'] & Temporal[v1]"

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectSchemeToString(effects.get(11n)!), expectedEffect)
  })

  it('keeps track of substitutions with nested defs', () => {
    const quintModule = buildModuleWithDefs([
      'pure def a(x) = and{' +
      '  val b = x + 1' +
      '  x + b > 0,' +
      '  val c = x + 2' +
      '  x + c > 0,' +
      '  x > 0,' +
      '}',
    ])

    const [errors, effects] = inferEffectsForModule(quintModule)

    const expectedEffect = "∀ v0, v1 . (Read[v0] & Temporal[v1]) => Read[v0] & Temporal[v1]"

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectSchemeToString(effects.get(25n)!), expectedEffect)
  })

  it('returns error when operator signature is not defined', () => {
    const quintModule = buildModuleWithDefs([
      'def A = undefinedOperator(1)',
    ])

    const [errors] = inferEffectsForModule(quintModule)

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

    const [errors] = inferEffectsForModule(quintModule)

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

    const [errors] = inferEffectsForModule(quintModule)

    errors.forEach(v => assert.deepEqual(v, {
      children: [{
        children: [{
          children: [{
            children: [{
              children: [],
              location: "Trying to unify variables ['x'] and []",
              message: 'Expected variables [x] and [] to be the same',
            }],
            location: "Trying to unify Read[v5] & Temporal[v6] and Update['x']",
          }],
          location: "Trying to unify (Pure) => Read[v5] & Temporal[v6] and (Read[v2]) => Read[v2] & Update['x']",
        }],
        location: "Trying to unify (Read[v3] & Temporal[v4], (Read[v3] & Temporal[v4]) => Read[v5] & Temporal[v6]) => Read[v3, v5] & Temporal[v4, v6] and (Pure, (Read[v2]) => Read[v2] & Update['x']) => e1",
      }],
      location: 'Trying to infer effect for operator application in map(S, (p => assign(x, p)))',
    }))
  })

  it('returns error when operator signature is not defined inside a let-in body', () => {
    const quintModule = buildModuleWithDefs([
      'def A = val t = undefined(1) { t }',
    ])

    const [errors] = inferEffectsForModule(quintModule)

    errors.forEach(v => assert.deepEqual(v, {
      location: 'Trying to infer effect for operator application in undefined(1)',
      message: 'Signature not found for name: undefined',
      children: [],
    }))
  })
})
