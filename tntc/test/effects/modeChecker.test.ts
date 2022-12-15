import { describe, it } from 'mocha'
import { assert } from 'chai'
import { inferEffects } from '../../src/effects/inferrer'
import { LookupTable, LookupTableByModule, newTable } from '../../src/lookupTable'
import { buildModuleWithDefs } from '../builders/ir'
import { ErrorTree, errorTreeToString } from '../../src/errorTree'
import { OpQualifier, TntModule } from '../../src/tntIr'
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
    ],
  })

  const definitionsTable: LookupTableByModule = new Map<string, LookupTable>([['wrapper', table]])

  function checkModuleModes(tntModule: TntModule): Either<Map<bigint, ErrorTree>, Map<bigint, OpQualifier>> {
    const [errors, effects] = inferEffects(definitionsTable, tntModule)

    assert.isEmpty(errors, `Should find no errors, found: ${[...errors.values()].map(errorTreeToString)}`)

    return checkModes(tntModule, effects)
  }

  it('finds mode errors between action and def', () => {
    const tntModule = buildModuleWithDefs([
      `def a(p) = x' = p`,
    ])

    const modeCheckingResult = checkModuleModes(tntModule)

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
    const tntModule = buildModuleWithDefs([
      `action a(p) = x' = p`,
    ])

    const modeCheckingResult = checkModuleModes(tntModule)

    assert.isTrue(modeCheckingResult.isRight())
    modeCheckingResult
      .map(suggestions => assert.deepEqual(suggestions.size, 0))
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('finds suggestions for def with action annotation', () => {
    const tntModule = buildModuleWithDefs([
      'action a(p) = x + p',
    ])

    const modeCheckingResult = checkModuleModes(tntModule)

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
    const tntModule = buildModuleWithDefs([
      'pure val v = x + 1',
    ])

    const modeCheckingResult = checkModuleModes(tntModule)

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
    const tntModule = buildModuleWithDefs([
      'val a = 1',
    ])

    const modeCheckingResult = checkModuleModes(tntModule)

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
    const tntModule = buildModuleWithDefs([
      'pure def f(p) = not(y)',
    ])

    const modeCheckingResult = checkModuleModes(tntModule)

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
    const tntModule = buildModuleWithDefs([
      'def a(p) = p',
    ])

    const modeCheckingResult = checkModuleModes(tntModule)

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
    const tntModule = buildModuleWithDefs([
      'pure val v = always(x > 5)',
    ])

    const modeCheckingResult = checkModuleModes(tntModule)

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
