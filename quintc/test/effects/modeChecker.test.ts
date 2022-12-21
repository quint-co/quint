import { describe, it } from 'mocha'
import { assert } from 'chai'
import { inferEffects } from '../../src/effects/inferrer'
import { LookupTable, LookupTableByModule, newTable } from '../../src/lookupTable'
import { buildModuleWithDefs } from '../builders/ir'
import { ErrorTree, errorTreeToString } from '../../src/errorTree'
import { OpQualifier, QuintModule } from '../../src/quintIr'
import { Either } from '@sweet-monads/either'
import { checkModes } from '../../src/effects/modeChecker'

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

  function checkModuleModes(quintModule: QuintModule): Either<Map<bigint, ErrorTree>, Map<bigint, OpQualifier>> {
    const [errors, effects] = inferEffects(definitionsTable, quintModule)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    return checkModes(quintModule, effects)
  }

  it('finds mode errors between action and def', () => {
    const quintModule = buildModuleWithDefs([
      `def a(p) = x' = p`,
    ])

    const modeCheckingResult = checkModuleModes(quintModule)

    assert.isTrue(modeCheckingResult.isLeft())
    modeCheckingResult
      .mapLeft((err: Map<bigint, ErrorTree>) => assert.sameDeepMembers([...err.entries()], [
        [4n, {
          location: 'Checking modes for def a = (p => assign(x, p))',
          message: 'Expected action mode, found: def',
          children: [],
        }],
      ]))
  })

  it('finds no errors for correct action', () => {
    const quintModule = buildModuleWithDefs([
      `action a(p) = x' = p`,
    ])

    const modeCheckingResult = checkModuleModes(quintModule)

    assert.isTrue(modeCheckingResult.isRight())
    modeCheckingResult
      .map(suggestions => assert.deepEqual(suggestions.size, 0))
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('finds no errors for pure def using polymorphic operator', () => {
    const quintModule = buildModuleWithDefs([
      `pure def a(p) = if (not(p > 1)) p else p + 1`,
    ])

    const modeCheckingResult = checkModuleModes(quintModule)

    assert.isTrue(modeCheckingResult.isRight())
    modeCheckingResult
      .map(suggestions => assert.deepEqual(suggestions.size, 0))
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('finds suggestions for def with action annotation', () => {
    const quintModule = buildModuleWithDefs([
      'action a(p) = x + p',
    ])

    const modeCheckingResult = checkModuleModes(quintModule)

    assert.isTrue(modeCheckingResult.isRight())
    modeCheckingResult
      .map(suggestions => assert.sameDeepMembers([...suggestions.entries()], [
        [4n, 'def'],
      ]))
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('finds mode errors between pureval and val', () => {
    const quintModule = buildModuleWithDefs([
      'pure val v = x + 1',
    ])

    const modeCheckingResult = checkModuleModes(quintModule)

    assert.isTrue(modeCheckingResult.isLeft())
    modeCheckingResult
      .mapLeft((err: Map<bigint, ErrorTree>) => assert.sameDeepMembers([...err.entries()], [
        [4n, {
          location: 'Checking modes for pure val v = iadd(x, 1)',
          message: 'Expected val mode, found: pure val',
          children: [],
        }],
      ]))
  })

  it('finds suggestions for pure val with val annotation', () => {
    const quintModule = buildModuleWithDefs([
      'val a = 1',
    ])

    const modeCheckingResult = checkModuleModes(quintModule)

    assert.isTrue(modeCheckingResult.isRight())
    modeCheckingResult
      .map(suggestions => assert.sameDeepMembers([...suggestions.entries()], [
        [2n, 'pureval'],
      ]))
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('finds mode errors between puredef and def', () => {
    const quintModule = buildModuleWithDefs([
      'pure def f(p) = not(y)',
    ])

    const modeCheckingResult = checkModuleModes(quintModule)

    assert.isTrue(modeCheckingResult.isLeft())
    modeCheckingResult
      .mapLeft((err: Map<bigint, ErrorTree>) => assert.sameDeepMembers([...err.entries()], [
        [3n, {
          location: 'Checking modes for pure def f = (p => not(y))',
          message: 'Expected def mode, found: pure def',
          children: [],
        }],
      ]))
  })

  it('finds suggestions for pure def with def annotation', () => {
    const quintModule = buildModuleWithDefs([
      'def a(p) = p',
    ])

    const modeCheckingResult = checkModuleModes(quintModule)

    assert.isTrue(modeCheckingResult.isRight())
    modeCheckingResult
      .map(suggestions => assert.sameDeepMembers([...suggestions.entries()], [
        [2n, 'puredef'],
      ]))
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('finds mode errors between val and temporal', () => {
    const quintModule = buildModuleWithDefs([
      'pure val v = always(x > 5)',
    ])

    const modeCheckingResult = checkModuleModes(quintModule)

    assert.isTrue(modeCheckingResult.isLeft())
    modeCheckingResult
      .mapLeft((err: Map<bigint, ErrorTree>) => assert.sameDeepMembers([...err.entries()], [
        [5n, {
          location: 'Checking modes for pure val v = always(igt(x, 5))',
          message: 'Expected temporal mode, found: pure val',
          children: [],
        }],
      ]))
  })
})
