import { describe, it } from 'mocha'
import { assert } from 'chai'
import { buildModuleWithDefs } from '../builders/ir'
import { OpQualifier } from '../../src/quintIr'
import { EffectInferrer } from '../../src/effects/inferrer'
import { ModeChecker } from '../../src/effects/modeChecker'
import { QuintError, quintErrorToString } from '../../src/quintError'
import { resolveNames } from '../../src/nameResolver'
import JSONbig from 'json-bigint'
import { collectDefinitions } from '../../src/definitionsCollector'
import { treeFromModule } from '../../src/scoping'
import { moduleToString } from '../../src/IRprinting'
import { errorTreeToString } from '../../src/errorTree'

describe('checkModes', () => {
  const baseDefs = ['var x: int', 'var y: bool']

  function checkMockedDefs(defs: string[]): [Map<bigint, QuintError>, Map<bigint, OpQualifier>] {
    const module = buildModuleWithDefs(baseDefs.concat(defs))
    const table = collectDefinitions(module)
    const lookupTable = resolveNames(module, table, treeFromModule(module))
    if (lookupTable.isLeft()) {
      throw new Error(
        `Failed to resolve names in mocked up module: ${JSONbig.stringify(
          lookupTable.value
        )}\n Module: ${moduleToString(module)}`
      )
    }

    const inferrer = new EffectInferrer(lookupTable.value)
    const [errors, effects] = inferrer.inferEffects(module.defs)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const modeChecker = new ModeChecker()
    return modeChecker.checkModes(module.defs, effects)
  }

  it('finds mode errors between action and def', () => {
    const defs = [`def a(p) = x' = p`]

    const [errors, _suggestions] = checkMockedDefs(defs)

    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [
          9n,
          {
            message:
              "def operators may only read state variables, but operator `a` updates variables 'x'. Use action instead.",
            code: 'QNT200',
            data: { fix: { kind: 'replace', original: 'def', replacement: 'action' } },
          },
        ],
      ]
    )
  })

  it('finds no errors for correct action', () => {
    const defs = [`action a(p) = x' = p`]

    const [errors, suggestions] = checkMockedDefs(defs)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(quintErrorToString)}`)
    assert.deepEqual(suggestions.size, 0)
  })

  it('finds no errors for pure def using polymorphic operator', () => {
    const defs = [`pure def a(p) = if (not(p > 1)) p else p + 1`]

    const [errors, suggestions] = checkMockedDefs(defs)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(quintErrorToString)}`)
    assert.deepEqual(suggestions.size, 0)
  })

  it('finds suggestions for def with action annotation', () => {
    const defs = ['action a(p) = x + p']

    const [errors, suggestions] = checkMockedDefs(defs)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(quintErrorToString)}`)
    assert.sameDeepMembers([...suggestions.entries()], [[9n, 'def']])
  })

  it('finds mode errors between pureval and val', () => {
    const defs = ['pure val v = x + 1']

    const [errors, _suggestions] = checkMockedDefs(defs)

    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [
          8n,
          {
            message:
              "pure val operators may not interact with state variables, but operator `v` reads variables 'x'. Use val instead.",
            code: 'QNT200',
            data: { fix: { kind: 'replace', original: 'pure val', replacement: 'val' } },
          },
        ],
      ]
    )
  })

  it('finds suggestions for pure val with val annotation', () => {
    const defs = ['val a = 1']

    const [errors, suggestions] = checkMockedDefs(defs)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(quintErrorToString)}`)
    assert.sameDeepMembers([...suggestions.entries()], [[6n, 'pureval']])
  })

  it('finds mode errors between puredef and def', () => {
    const defs = ['pure def f(p) = not(y)']

    const [errors, _suggestions] = checkMockedDefs(defs)

    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [
          8n,
          {
            message:
              "pure def operators may not interact with state variables, but operator `f` reads variables 'y'. Use def instead.",
            code: 'QNT200',
            data: { fix: { kind: 'replace', original: 'pure def', replacement: 'def' } },
          },
        ],
      ]
    )
  })

  it('finds suggestions for pure def with def annotation', () => {
    const defs = ['def a(p) = p']

    const [errors, suggestions] = checkMockedDefs(defs)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(quintErrorToString)}`)
    assert.sameDeepMembers([...suggestions.entries()], [[7n, 'puredef']])
  })

  it('finds mode errors between val and temporal', () => {
    const defs = ['pure val v = always(x > 5)']

    const [errors, _suggestions] = checkMockedDefs(defs)

    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [
          9n,
          {
            message:
              "pure val operators may not interact with state variables, but operator `v` performs temporal operations over variables 'x'. Use temporal instead.",
            code: 'QNT200',
            data: { fix: { kind: 'replace', original: 'pure val', replacement: 'temporal' } },
          },
        ],
      ]
    )
  })

  it('finds errors when an instance override is not pure', () => {
    const defs = [
      'const A1::c : int', // avoid having to simulate imports in this test
      'import A(c = x) as A1',
    ]

    const [errors, _suggestions] = checkMockedDefs(defs)

    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [
          7n,
          {
            message: "Instance overrides must be pure, but the value for c reads variables 'x'",
            code: 'QNT201',
            data: {},
          },
        ],
      ]
    )
  })

  it('allows operators as override values', () => {
    const defs = [
      'const A1::c : (int) => int', // avoid having to simulate imports in this test
      'def f(p) = p + 1',
      'import A(c = f) as A1',
    ]

    const [errors, _suggestions] = checkMockedDefs(defs)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(quintErrorToString)}`)
  })

  it('finds errors in nested definitions', () => {
    const defs = ['pure val a = { val m = x + 1 { m } }']

    const [errors, _suggestions] = checkMockedDefs(defs)

    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [
          11n,
          {
            message:
              "pure val operators may not interact with state variables, but operator `a` reads variables 'x'. Use val instead.",
            code: 'QNT200',
            data: { fix: { kind: 'replace', original: 'pure val', replacement: 'val' } },
          },
        ],
      ]
    )
  })

  it('finds no error with proper high order operators', () => {
    const defs = ['pure def c(p, f) = Set(p).map(f)']

    const [errors, suggestions] = checkMockedDefs(defs)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(quintErrorToString)}`)
    assert.deepEqual(suggestions.size, 0)
  })

  it('keeps track of parameters in nested definitions', () => {
    const defs = ['pure def f(p) = { pure def m(q) = p + 1 { m(1) } }']

    const [errors, suggestions] = checkMockedDefs(defs)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(quintErrorToString)}`)
    assert.deepEqual(suggestions.size, 0)
  })
})
