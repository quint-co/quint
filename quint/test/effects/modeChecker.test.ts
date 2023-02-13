import { describe, it } from 'mocha'
import { assert } from 'chai'
import { LookupTable, LookupTableByModule, newTable } from '../../src/lookupTable'
import { buildModuleWithDefs } from '../builders/ir'
import { OpQualifier, QuintModule } from '../../src/quintIr'
import { EffectInferrer } from '../../src/effects/inferrer'
import { ModeChecker } from '../../src/effects/modeChecker'
import { QuintError, quintErrorToString } from '../../src/quintError'
import { errorTreeToString } from '../../src'

describe('checkModes', () => {
  const table: LookupTable = newTable({
    valueDefinitions: [
      { kind: 'param', identifier: 'p', reference: 1n },
      { kind: 'const', identifier: 'N', reference: 1n },
      { kind: 'var', identifier: 'x', reference: 1n },
      { kind: 'var', identifier: 'y', reference: 1n },
      { kind: 'val', identifier: 'm', reference: 1n },
      { kind: 'val', identifier: 't', reference: 1n },
      { kind: 'def', identifier: 'assign' },
      { kind: 'def', identifier: 'igt' },
      { kind: 'def', identifier: 'iadd' },
      { kind: 'def', identifier: 'not' },
    ],
  })

  const definitionsTable: LookupTableByModule = new Map<string, LookupTable>([['wrapper', table]])

  function checkModuleModes(quintModule: QuintModule): [Map<bigint, QuintError>, Map<bigint, OpQualifier>] {
    const inferrer = new EffectInferrer(definitionsTable)
    const [errors, effects] = inferrer.inferEffects(quintModule)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    const modeChecker = new ModeChecker()
    return modeChecker.checkModes(quintModule, effects)
  }

  it('finds mode errors between action and def', () => {
    const quintModule = buildModuleWithDefs([
      `def a(p) = x' = p`,
    ])

    const [errors, _suggestions] = checkModuleModes(quintModule)

    assert.sameDeepMembers([...errors.entries()], [
      [4n, {
        message: "def operators may only read state variables, but operator `a` updates variables 'x'. Use action instead.",
        code: 'QNT200',
        data: { fix: { kind: 'replace', original: 'def', replacement: 'action' } },
      }],
    ])
  })

  it('finds no errors for correct action', () => {
    const quintModule = buildModuleWithDefs([
      `action a(p) = x' = p`,
    ])

    const [errors, suggestions] = checkModuleModes(quintModule)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(quintErrorToString)}`)
    assert.deepEqual(suggestions.size, 0)
  })

  it('finds no errors for pure def using polymorphic operator', () => {
    const quintModule = buildModuleWithDefs([
      `pure def a(p) = if (not(p > 1)) p else p + 1`,
    ])

    const [errors, suggestions] = checkModuleModes(quintModule)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(quintErrorToString)}`)
    assert.deepEqual(suggestions.size, 0)
  })

  it('finds suggestions for def with action annotation', () => {
    const quintModule = buildModuleWithDefs([
      'action a(p) = x + p',
    ])

    const [errors, suggestions] = checkModuleModes(quintModule)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(quintErrorToString)}`)
    assert.sameDeepMembers([...suggestions.entries()], [
      [4n, 'def'],
    ])
  })

  it('finds mode errors between pureval and val', () => {
    const quintModule = buildModuleWithDefs([
      'pure val v = x + 1',
    ])

    const [errors, _suggestions] = checkModuleModes(quintModule)

    assert.sameDeepMembers([...errors.entries()], [
      [4n, {
        message: "pure val operators may not interact with state variables, but operator `v` reads variables 'x'. Use val instead.",
        code: 'QNT200',
        data: { fix: { kind: 'replace', original: 'pure val', replacement: 'val' } },
      }],
    ])
  })

  it('finds suggestions for pure val with val annotation', () => {
    const quintModule = buildModuleWithDefs([
      'val a = 1',
    ])

    const [errors, suggestions] = checkModuleModes(quintModule)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(quintErrorToString)}`)
    assert.sameDeepMembers([...suggestions.entries()], [
      [2n, 'pureval'],
    ])
  })

  it('finds mode errors between puredef and def', () => {
    const quintModule = buildModuleWithDefs([
      'pure def f(p) = not(y)',
    ])

    const [errors, _suggestions] = checkModuleModes(quintModule)

    assert.sameDeepMembers([...errors.entries()], [
      [3n, {
        message: "pure def operators may not interact with state variables, but operator `f` reads variables 'y'. Use def instead.",
        code: 'QNT200',
        data: { fix: { kind: 'replace', original: 'pure def', replacement: 'def' } },
      }],
    ])
  })

  it('finds suggestions for pure def with def annotation', () => {
    const quintModule = buildModuleWithDefs([
      'def a(p) = p',
    ])

    const [errors, suggestions] = checkModuleModes(quintModule)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(quintErrorToString)}`)
    assert.sameDeepMembers([...suggestions.entries()], [
      [2n, 'puredef'],
    ])
  })

  it('finds mode errors between val and temporal', () => {
    const quintModule = buildModuleWithDefs([
      'pure val v = always(x > 5)',
    ])

    const [errors, _suggestions] = checkModuleModes(quintModule)

    assert.sameDeepMembers([...errors.entries()], [
      [5n, {
        message: "pure val operators may not interact with state variables, but operator `v` performs temporal operations over variables 'x'. Use temporal instead.",
        code: 'QNT200',
        data: { fix: { kind: 'replace', original: 'pure val', replacement: 'temporal' } },
      }],
    ])
  })


  it('finds errors when an instance override is not pure', () => {
    const quintModule = buildModuleWithDefs([
      'module A1 = A(c = x)',
    ])

    const [errors, _suggestions] = checkModuleModes(quintModule)

    assert.sameDeepMembers([...errors.entries()], [
      [1n, {
        message: "Instance overrides must be pure values, but the value for c reads variables 'x'",
        code: 'QNT200',
        data: {},
      }],
    ])
  })
})
