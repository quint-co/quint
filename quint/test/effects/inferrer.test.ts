import { describe, it } from 'mocha'
import { assert } from 'chai'
import { buildModuleWithDecls } from '../builders/ir'
import { effectSchemeToString } from '../../src/effects/printing'
import { errorTreeToString } from '../../src/errorTree'
import { EffectInferenceResult, EffectInferrer } from '../../src/effects/inferrer'
import { parseMockedModule } from '../util'
import { EffectScheme } from '../../src/effects/base'
import { isDef } from '../../src/ir/quintIr'

describe('inferEffects', () => {
  const baseDefs = ['const N: int', 'const S: Set[int]', 'var x: int']

  function inferEffectsForDefs(defs: string[]): EffectInferenceResult {
    const text = `module wrapper { ${baseDefs.concat(defs).join('\n')} }`
    const { modules, table } = parseMockedModule(text)

    const inferrer = new EffectInferrer(table)
    return inferrer.inferEffects(modules[0].declarations)
  }

  function effectForDef(defs: string[], effects: Map<bigint, EffectScheme>, defName: string) {
    const module = buildModuleWithDecls(baseDefs.concat(defs))
    const result = module.declarations.find(decl => isDef(decl) && decl.name === defName)

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

  it('keeps track of substitutions with lambdas and applications', () => {
    const defs = [
      `pure def MinBy(__set: Set[a], __f: a => int, __i: a): a = {
        __set.fold(
          __i,
          (__m, __e) => if(__f(__m) < __f(__e)) {__m } else {__e}
        )
      }`,
    ]

    const [errors, effects] = inferEffectsForDefs(defs)

    const expectedEffect = '∀ v0, v1 . (Read[v0], (Read[v0]) => Read[v1], Read[v0]) => Read[v0, v1]'

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectForDef(defs, effects, 'MinBy'), expectedEffect)
  })

  it('regression on #1091', () => {
    const defs = [
      'var channel: int',
      `action CoolAction(boolean: bool): bool =
         any {
           all {
             boolean,
             channel' = channel
           },
           all {
             not(boolean),
             channel' = channel
           }
        }`,
    ]

    const [errors, effects] = inferEffectsForDefs(defs)

    const expectedEffect = "∀ v0 . (Read[v0]) => Read[v0, 'channel'] & Update['channel']"

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
    assert.deepEqual(effectForDef(defs, effects, 'CoolAction'), expectedEffect)
  })

  it('avoids invalid cyclical binding error (regression on #1356)', () => {
    const defs = [
      `pure def foo(s: int, g: int => int): int = {
        val r = if (true) s else g(s)
        g(r)
      }`,
    ]

    const [errors, _] = inferEffectsForDefs(defs)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)
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
                    location: "Trying to unify Read[_v4] & Temporal[_v5] and Update['x']",
                  },
                ],
                location:
                  "Trying to unify (Pure) => Read[_v4] & Temporal[_v5] and (Read[_v1]) => Read[_v1] & Update['x']",
              },
            ],
            location:
              "Trying to unify (Read[_v2] & Temporal[_v3], (Read[_v2] & Temporal[_v3]) => Read[_v4] & Temporal[_v5]) => Read[_v2, _v4] & Temporal[_v3, _v5] and (Pure, (Read[_v1]) => Read[_v1] & Update['x']) => _e1",
          },
        ],
        location: 'Trying to infer effect for operator application in map(S, ((p) => assign(x, p)))',
      })
    )
  })

  it('returns error when lambda returns an operator', () => {
    const defs = ['pure def f(p) = p', 'pure def myOp = (_) => f']

    const [errors] = inferEffectsForDefs(defs)

    assert.deepEqual([...errors.values()][0], {
      children: [],
      location: 'Inferring effect for f',
      message: 'Result cannot be an opperator',
    })
  })

  it('returns error when `match` branches update different variables', () => {
    const defs = ['type Result = | Some(int) | None', "val foo = match Some(1) { | Some(n) => x' = n | None => true }"]

    const [errors] = inferEffectsForDefs(defs)

    assert.deepEqual([...errors.values()][0].children[0].children[0].children[0].children[0], {
      children: [],
      location: "Trying to unify entities ['x'] and []",
      message: 'Expected [x] and [] to be the same',
    })
  })

  it('differentiates variables from different instances', () => {
    const baseDefs = ['const N: int', 'const S: Set[int]', 'var x: int']

    const text = `
      module base { ${baseDefs.join('\n')} }
      module wrapper {
       import base(N=1) as B1
       import base(N=2) as B2
       val a = B1::x + B2::x
    }`
    const { modules, table } = parseMockedModule(text)

    const inferrer = new EffectInferrer(table)
    inferrer.inferEffects(modules[0].declarations)
    const [errors, effects] = inferrer.inferEffects(modules[1].declarations)
    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const def = modules[1].declarations.find(decl => isDef(decl) && decl.name === 'a')!

    const expectedEffect = "Read['wrapper::B1::x', 'wrapper::B2::x']"

    assert.deepEqual(effectSchemeToString(effects.get(def.id)!), expectedEffect)
  })
})
