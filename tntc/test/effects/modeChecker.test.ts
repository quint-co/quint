import { describe, it } from 'mocha'
import { assert } from 'chai'
import { inferEffects } from '../../src/effects/inferrer'
import { DefinitionTable, DefinitionTableByModule } from '../../src/definitionsCollector'
import { Signature } from '../../src/effects/base'
import { buildModuleWithDefs } from '../builders/ir'
import { parseEffectOrThrow } from '../../src/effects/parser'
import { ErrorTree, errorTreeToString } from '../../src/errorTree'
import { OpQualifier, TntModule } from '../../src/tntIr'
import { Either } from '@sweet-monads/either'
import { checkModes } from '../../src/effects/modeChecker'

describe('checkModes', () => {
  const table: DefinitionTable = {
    valueDefinitions: [
      { kind: 'param', identifier: 'p' },
      { kind: 'const', identifier: 'N' },
      { kind: 'var', identifier: 'x' },
      { kind: 'var', identifier: 'y' },
      { kind: 'val', identifier: 'm' },
      { kind: 'val', identifier: 't' },
      { kind: 'def', identifier: 'assign' },
      { kind: 'def', identifier: 'iadd' },
      { kind: 'def', identifier: 'igt' },
    ],
    typeDefinitions: [],
  }
  const definitionsTable: DefinitionTableByModule = new Map<string, DefinitionTable>([['wrapper', table]])

  const signatures: Map<string, Signature> = new Map<string, Signature>([
    ['assign', () => parseEffectOrThrow('(Read[r1], Read[r2]) => Read[r2] & Update[r1]')],
    ['always', () => parseEffectOrThrow('(Read[r] & Temporal[t]) => Temporal[r, t]')],
    ['iadd', () => parseEffectOrThrow('(Read[r1], Read[r2]) => Read[r1, r2]')],
    ['igt', () => parseEffectOrThrow('(Read[r1], Read[r2]) => Read[r1, r2]')],
    ['not', () => parseEffectOrThrow('(Read[r] & Temporal[t]) => Read[r] & Temporal[t]')],
  ])

  function checkModuleModes (tntModule: TntModule): Either<Map<BigInt, ErrorTree>, Map<BigInt, OpQualifier>> {
    const effects = inferEffects(signatures, definitionsTable, tntModule)

    effects
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })

    return effects.chain(es => checkModes(tntModule, es))
  }

  it('finds mode errors between action and def', () => {
    const tntModule = buildModuleWithDefs([
      'def a(p) = x <- p',
    ])

    const modeCheckingResult = checkModuleModes(tntModule)

    assert.isTrue(modeCheckingResult.isLeft())
    modeCheckingResult
      .mapLeft((err: Map<BigInt, ErrorTree>) => assert.sameDeepMembers([...err.entries()], [
        [4n, {
          location: 'Checking modes for def a = (p => assign(x, p))',
          message: 'Expected action mode, found: def',
          children: [],
        }],
      ]))
  })

  it('finds no errors for correct action', () => {
    const tntModule = buildModuleWithDefs([
      'action a(p) = x <- p',
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

  it('finds mode errors between staticval and val', () => {
    const tntModule = buildModuleWithDefs([
      'static val v = x + 1',
    ])

    const modeCheckingResult = checkModuleModes(tntModule)

    assert.isTrue(modeCheckingResult.isLeft())
    modeCheckingResult
      .mapLeft((err: Map<BigInt, ErrorTree>) => assert.sameDeepMembers([...err.entries()], [
        [4n, {
          location: 'Checking modes for staticval v = iadd(x, 1)',
          message: 'Expected val mode, found: staticval',
          children: [],
        }],
      ]))
  })

  it('finds suggestions for static val with val annotation', () => {
    const tntModule = buildModuleWithDefs([
      'val a = 1',
    ])

    const modeCheckingResult = checkModuleModes(tntModule)

    assert.isTrue(modeCheckingResult.isRight())
    modeCheckingResult
      .map(suggestions => assert.sameDeepMembers([...suggestions.entries()], [
        [2n, 'staticval'],
      ]))
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('finds mode errors between staticdef and def', () => {
    const tntModule = buildModuleWithDefs([
      'static def f(p) = not(y)',
    ])

    const modeCheckingResult = checkModuleModes(tntModule)

    assert.isTrue(modeCheckingResult.isLeft())
    modeCheckingResult
      .mapLeft((err: Map<BigInt, ErrorTree>) => assert.sameDeepMembers([...err.entries()], [
        [3n, {
          location: 'Checking modes for staticdef f = (p => not(y))',
          message: 'Expected def mode, found: staticdef',
          children: [],
        }],
      ]))
  })

  it('finds suggestions for static def with def annotation', () => {
    const tntModule = buildModuleWithDefs([
      'def a(p) = p',
    ])

    const modeCheckingResult = checkModuleModes(tntModule)

    assert.isTrue(modeCheckingResult.isRight())
    modeCheckingResult
      .map(suggestions => assert.sameDeepMembers([...suggestions.entries()], [
        [2n, 'staticdef'],
      ]))
      .mapLeft(e => {
        const errors = Array.from(e.values())
        assert.isEmpty(errors, `Should find no errors, found: ${errors.map(errorTreeToString)}`)
      })
  })

  it('finds mode errors between val and temporal', () => {
    const tntModule = buildModuleWithDefs([
      'static val v = always(x > 5)',
    ])

    const modeCheckingResult = checkModuleModes(tntModule)

    assert.isTrue(modeCheckingResult.isLeft())
    modeCheckingResult
      .mapLeft((err: Map<BigInt, ErrorTree>) => assert.sameDeepMembers([...err.entries()], [
        [5n, {
          location: 'Checking modes for staticval v = always(igt(x, 5))',
          message: 'Expected temporal mode, found: staticval',
          children: [],
        }],
      ]))
  })
})
