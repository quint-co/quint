import { describe, it } from 'mocha'
import { assert } from 'chai'
import { OpQualifier } from '../../src/ir/quintIr'
import { EffectInferrer } from '../../src/effects/inferrer'
import { ModeChecker } from '../../src/effects/modeChecker'
import { QuintError, quintErrorToString } from '../../src/quintError'
import { errorTreeToString } from '../../src/errorTree'
import { parseMockedModule } from '../util'

describe('checkModes', () => {
  const baseDefs = ['var x: int', 'var y: bool']

  function checkMockedDefs(defs: string[]): [Map<bigint, QuintError>, Map<bigint, OpQualifier>] {
    const text = `module A { const c: int } module wrapper { ${baseDefs.concat(defs).join('\n')} }`
    const { modules, table } = parseMockedModule(text)
    const wrapper = modules.find(m => m.name === 'wrapper')!

    const inferrer = new EffectInferrer(table)
    const [errors, effects] = inferrer.inferEffects(wrapper.declarations)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const modeChecker = new ModeChecker()

    return modeChecker.checkModes(wrapper.declarations, effects)
  }

  it('finds mode errors between action and def', () => {
    const defs = [`def a(p) = x' = p`]

    const [errors, _suggestions] = checkMockedDefs(defs)

    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [
          13n,
          {
            message:
              "def operators may only read state variables, but operator `a` updates variables 'x'. Use action instead.",
            code: 'QNT200',
            reference: 13n,
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
    assert.sameDeepMembers([...suggestions.entries()], [[13n, 'def']])
  })

  it('finds mode errors between pureval and val', () => {
    const defs = ['pure val v = x + 1']

    const [errors, _suggestions] = checkMockedDefs(defs)

    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [
          11n,
          {
            message:
              "pure val operators may not interact with state variables, but operator `v` reads variables 'x'. Use val instead.",
            code: 'QNT200',
            reference: 11n,
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
    assert.sameDeepMembers([...suggestions.entries()], [[9n, 'pureval']])
  })

  it('finds mode errors between puredef and def', () => {
    const defs = ['pure def f(p) = not(y)']

    const [errors, _suggestions] = checkMockedDefs(defs)

    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [
          12n,
          {
            message:
              "pure def operators may not interact with state variables, but operator `f` reads variables 'y'. Use def instead.",
            code: 'QNT200',
            reference: 12n,
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
    assert.sameDeepMembers([...suggestions.entries()], [[11n, 'puredef']])
  })

  it('finds mode errors between val and temporal', () => {
    const defs = ['pure val v = always(x > 5)']

    const [errors, _suggestions] = checkMockedDefs(defs)

    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [
          12n,
          {
            message:
              "pure val operators may not interact with state variables, but operator `v` performs temporal operations over variables 'x'. Use temporal instead.",
            code: 'QNT200',
            reference: 12n,
            data: { fix: { kind: 'replace', original: 'pure val', replacement: 'temporal' } },
          },
        ],
      ]
    )
  })

  it('finds errors when an instance override is not pure', () => {
    const defs = ['import A(c = x) as A1']

    const [errors, _suggestions] = checkMockedDefs(defs)

    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [
          8n,
          {
            message: "Instance overrides must be pure, but the value for c reads variables 'x'",
            code: 'QNT201',
            reference: 8n,
            data: {},
          },
        ],
      ]
    )
  })

  it('allows operators as override values', () => {
    const defs = ['def f(p) = p + 1', 'import A(c = f) as A1']

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
          14n,
          {
            message:
              "pure val operators may not interact with state variables, but operator `a` reads variables 'x'. Use val instead.",
            code: 'QNT200',
            reference: 14n,
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

  it('finds correct equalities between entity unions (#808)', () => {
    const defs = ['pure def foo(s: Set[int]): bool = { tuples(s, s).forall( ((a,b)) => (a + b).in(s)) }']

    const [errors, suggestions] = checkMockedDefs(defs)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(quintErrorToString)}`)
    assert.deepEqual(suggestions.size, 0)
  })

  it('complains about parameters on pure val vs pure def', () => {
    const defs = ['pure val foo(p) = p + 1']

    const [errors, _suggestions] = checkMockedDefs(defs)

    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [
          13n,
          {
            message:
              'pure val operators may not have parameters, but operator `foo` has 1 parameter. Use pure def instead.',
            code: 'QNT200',
            reference: 13n,
            data: { fix: { kind: 'replace', original: 'pure val', replacement: 'pure def' } },
          },
        ],
      ]
    )
  })

  it('complains about parameters on val vs def', () => {
    const defs = ['val foo(p) = p + 1']

    const [errors, _suggestions] = checkMockedDefs(defs)

    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [
          13n,
          {
            message: 'val operators may not have parameters, but operator `foo` has 1 parameter. Use def instead.',
            code: 'QNT200',
            reference: 13n,
            data: { fix: { kind: 'replace', original: 'val', replacement: 'def' } },
          },
        ],
      ]
    )
  })

  it('prioritizes messages about effects over parameters', () => {
    const defs = ['pure val foo(p) = p + x']

    const [errors, _suggestions] = checkMockedDefs(defs)

    assert.sameDeepMembers(
      [...errors.entries()],
      [
        [
          13n,
          {
            message:
              "pure val operators may not interact with state variables, but operator `foo` reads variables 'x'. Use def instead.",
            code: 'QNT200',
            reference: 13n,
            data: { fix: { kind: 'replace', original: 'pure val', replacement: 'def' } },
          },
        ],
      ]
    )
  })
})
