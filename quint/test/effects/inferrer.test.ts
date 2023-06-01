import { describe, it } from 'mocha'
import { assert } from 'chai'
import { buildModuleWithDefs } from '../builders/ir'
import { effectSchemeToString } from '../../src/effects/printing'
import { errorTreeToString } from '../../src/errorTree'
import { collectDefinitions } from '../../src/definitionsCollector'
import { EffectInferenceResult, EffectInferrer } from '../../src/effects/inferrer'
import { EffectScheme, treeFromModule } from '../../src'
import { resolveNames } from '../../src/nameResolver'
import JSONbig from 'json-bigint'

describe('inferEffects', () => {
  const baseDefs = ['const N: int', 'const S: Set[int]', 'var x: int']

  function inferEffectsForDefs(defs: string[]): EffectInferenceResult {
    const module = buildModuleWithDefs(baseDefs.concat(defs))
    const table = collectDefinitions(module)
    const lookupTable = resolveNames(module, table, treeFromModule(module))
    if (lookupTable.isLeft()) {
      throw new Error(`Failed to resolve names in mocked up module: ${JSONbig.stringify(lookupTable.value)}`)
    }

    const inferrer = new EffectInferrer(lookupTable.value)
    return inferrer.inferEffects(module.defs)
  }

  function effectForDef(defs: string[], effects: Map<bigint, EffectScheme>, defName: string) {
    const module = buildModuleWithDefs(baseDefs.concat(defs))
    const result = module.defs.find(
      def => def.kind !== 'instance' && def.kind !== 'import' && def.kind != 'export' && def.name === defName
    )

    if (!result) {
      throw new Error(`Could not find def with name ${defName}`)
    }

    return effectSchemeToString(effects.get(result.id)!)
  }

  it('infers simple operator effect', () => {
    const defs = [`def a(p) = x' = p`]

    const [errors, effects] = inferEffectsForDefs(defs)

    const expectedEffect = "∀ v0 . (Read[v0]) => Read[v0] & Update['x']"

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectForDef(defs, effects, 'a'), expectedEffect)
  })

  it('infers application of multiple arity opertors', () => {
    const defs = ['def a(p) = and(p, x)', 'def b(p) = and(p, 1, 2)']

    const [errors, effects] = inferEffectsForDefs(defs)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(
      effectForDef(defs, effects, 'a'),
      "∀ v0, v1 . (Read[v0] & Temporal[v1]) => Read[v0, 'x'] & Temporal[v1]"
    )
    assert.deepEqual(
      effectForDef(defs, effects, 'b'),
      '∀ v0, v1 . (Read[v0] & Temporal[v1]) => Read[v0] & Temporal[v1]'
    )
  })

  it('infers references to operators', () => {
    const defs = ['def a(p) = foldl(x, p, iadd)']

    const [errors, effects] = inferEffectsForDefs(defs)

    const expectedEffect = "∀ v0, v1 . (Read[v0] & Temporal[v1]) => Read[v0, 'x'] & Temporal[v1]"

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectForDef(defs, effects, 'a'), expectedEffect)
  })

  it('infers references to user-defined operators', () => {
    const defs = ['def a(p) = def my_add = iadd { foldl(x, p, my_add) }']

    const [errors, effects] = inferEffectsForDefs(defs)

    const expectedEffect = "∀ v0, v1 . (Read[v0] & Temporal[v1]) => Read[v0, 'x'] & Temporal[v1]"

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectForDef(defs, effects, 'a'), expectedEffect)
  })

  it('infers effects for operators defined with let-in', () => {
    const defs = ['val b = val m = x { m }']

    const [errors, effects] = inferEffectsForDefs(defs)

    const expectedEffect = "Read['x']"

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectForDef(defs, effects, 'b'), expectedEffect)
  })

  it('infers pure effect for literals and value constants', () => {
    const defs = ['val b = N + 1']

    const [errors, effects] = inferEffectsForDefs(defs)

    const expectedEffect = 'Pure'

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectForDef(defs, effects, 'b'), expectedEffect)
  })

  it('infers arrow effect for operator constants', () => {
    const defs = ['const MyOp: int => int', 'val b = MyOp(x)']

    const [errors, effects] = inferEffectsForDefs(defs)

    const expectedEffect = "Read['x']"

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectForDef(defs, effects, 'b'), expectedEffect)
  })

  it('handles underscore', () => {
    const defs = ['val b = N.map(_ => 1)']

    const [errors, effects] = inferEffectsForDefs(defs)

    const expectedEffect = 'Pure'

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectForDef(defs, effects, 'b'), expectedEffect)
  })

  it('infers polymorphic high order operators', () => {
    const defs = ['def a(g, p) = g(p)']

    const [errors, effects] = inferEffectsForDefs(defs)

    const expectedEffect = '∀ e0, e1 . ((e0) => e1, e0) => e1'

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectForDef(defs, effects, 'a'), expectedEffect)
  })

  it('infers monomorphic high order operators', () => {
    const defs = ['def a(g, p) = g(p) + g(not(p))']

    const [errors, effects] = inferEffectsForDefs(defs)

    const expectedEffect =
      '∀ v0, v1, v2, v3 . ((Read[v0] & Temporal[v1]) => Read[v2] & Temporal[v3], Read[v0] & Temporal[v1]) => Read[v2] & Temporal[v3]'

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectForDef(defs, effects, 'a'), expectedEffect)
  })

  it('unpacks arguments as tuples', () => {
    const defs = ['def a(tup) = Set(tup, (x, 4)).map((p, g) => p + g)']

    const [errors, effects] = inferEffectsForDefs(defs)

    const expectedEffect = "∀ v0, v1 . (Read[v0] & Temporal[v1]) => Read[v0, 'x'] & Temporal[v1]"

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectForDef(defs, effects, 'a'), expectedEffect)
  })

  it('keeps track of substitutions with nested defs', () => {
    const defs = [
      'pure def a(p) = and{' +
        '  val b = p + 1' +
        '  p + b > 0,' +
        '  val c = p + 2' +
        '  p + c > 0,' +
        '  p > 0,' +
        '}',
    ]

    const [errors, effects] = inferEffectsForDefs(defs)

    const expectedEffect = '∀ v0, v1 . (Read[v0] & Temporal[v1]) => Read[v0] & Temporal[v1]'

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectForDef(defs, effects, 'a'), expectedEffect)
  })

  it('returns error when operator signature is not unifiable with args', () => {
    const defs = [`def a = S.map(p => x' = p)`]

    const [errors] = inferEffectsForDefs(defs)

    errors.forEach(v =>
      assert.deepEqual(v, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        children: [],
                        location: "Trying to unify entities ['x'] and []",
                        message: 'Expected [x] and [] to be the same',
                      },
                    ],
                    location: "Trying to unify Read[v5] & Temporal[v6] and Update['x']",
                  },
                ],
                location: "Trying to unify (Pure) => Read[v5] & Temporal[v6] and (Read[v2]) => Read[v2] & Update['x']",
              },
            ],
            location:
              "Trying to unify (Read[v3] & Temporal[v4], (Read[v3] & Temporal[v4]) => Read[v5] & Temporal[v6]) => Read[v3, v5] & Temporal[v4, v6] and (Pure, (Read[v2]) => Read[v2] & Update['x']) => e1",
          },
        ],
        location: 'Trying to infer effect for operator application in map(S, (p => assign(x, p)))',
      })
    )
  })

  it('returns error when lambda returns an operator', () => {
    const defs = ['pure def f(x) = x', 'pure def myOp = (_) => f']

    const [errors] = inferEffectsForDefs(defs)

    errors.forEach(v =>
      assert.deepEqual(v, {
        children: [],
        location: 'Inferring effect for f',
        message: 'Result cannot be an opperator',
      })
    )
  })
})
