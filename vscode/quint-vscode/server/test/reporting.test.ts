import { describe, it } from 'mocha'
import { assert } from 'chai'
import { Loc, QuintError } from '@informalsystems/quint'
import {
  assembleDiagnostic,
  diagnosticsFromErrors,
  findBestMatchingResult,
  findName,
  isPositionInLoc,
  locToRange,
} from '../src/reporting'
import { Position } from 'vscode-languageserver'
import { parseOrThrow } from './util'

describe('diagnosticsFromErrorMap', () => {
  const errors: QuintError[] = [{ code: 'QNT000', message: 'Message', reference: 1n, data: {} }]

  const sourceMap = new Map<bigint, Loc>([
    [1n, { start: { col: 1, index: 1, line: 1 }, end: { col: 1, index: 1, line: 1 }, source: 'mocked_path' }],
  ])

  it('assembles diagnosticts from error maps', () => {
    const diagnostics = diagnosticsFromErrors(errors, sourceMap)

    assert.sameDeepMembers(diagnostics.get('mocked_path')!, [
      {
        message: 'Message',
        range: {
          start: { character: 1, line: 1 },
          end: { character: 2, line: 1 },
        },
        severity: 1,
        code: 'QNT000',
        source: 'quint',
        data: {},
      },
    ])
  })
})

describe('assembleDiagnostic', () => {
  const loc: Loc = { start: { col: 1, index: 1, line: 1 }, end: { col: 1, index: 1, line: 1 }, source: 'mocked_path' }

  it('assembles a single diagnostict', () => {
    const diagnostic = assembleDiagnostic({ code: 'QNT000', message: 'Message', reference: 0n, data: {} }, loc)

    assert.deepEqual(diagnostic, {
      message: 'Message',
      range: {
        start: { character: 1, line: 1 },
        end: { character: 2, line: 1 },
      },
      severity: 1,
      code: 'QNT000',
      source: 'quint',
      data: {},
    })
  })
})

describe('findBestMatchingResult', () => {
  const sourceFile = 'myFile.qnt'
  const sourceMap = new Map<bigint, Loc>([
    [1n, { start: { col: 1, index: 1, line: 1 }, end: { col: 1, index: 1, line: 1 }, source: sourceFile }],
    [2n, { start: { col: 1, index: 1, line: 1 }, end: { col: 10, index: 10, line: 1 }, source: sourceFile }],
    [3n, { start: { col: 1, index: 11, line: 2 }, end: { col: 2, index: 12, line: 2 }, source: sourceFile }],
  ])

  const results: [bigint, string][] = [
    [1n, 'result 1'],
    [2n, 'result 2'],
    [3n, 'result 3'],
  ]
  it('finds the result with best matching loc to the position - 1', () => {
    const position: Position = { line: 1, character: 1 }

    const matched = findBestMatchingResult(sourceMap, results, position, sourceFile)

    assert.deepEqual(matched?.result, 'result 1')
  })

  it('finds the result with best matching loc to the position - 2', () => {
    const position: Position = { line: 1, character: 8 }

    const matched = findBestMatchingResult(sourceMap, results, position, sourceFile)

    assert.deepEqual(matched?.result, 'result 2')
  })

  it('finds the result with best matching loc to the position - 3', () => {
    const position: Position = { line: 2, character: 1 }

    const matched = findBestMatchingResult(sourceMap, results, position, sourceFile)

    assert.deepEqual(matched?.result, 'result 3')
  })

  it('matches multi-line ranges on middle lines without column constraints', () => {
    const multilineSourceMap = new Map<bigint, Loc>([
      [
        10n,
        {
          start: { col: 10, index: 0, line: 1 },
          end: { col: 2, index: 0, line: 3 },
          source: sourceFile,
        },
      ],
    ])
    const multilineResults: [bigint, string][] = [[10n, 'multi']]
    const middleLinePosition: Position = { line: 2, character: 0 }

    const matched = findBestMatchingResult(multilineSourceMap, multilineResults, middleLinePosition, sourceFile)

    assert.deepEqual(matched?.result, 'multi')
  })

  describe('findName', () => {
    const [modules, sourceMap, _table] = parseOrThrow(
      'module test { type MY_TYPE = bool val foo: MY_TYPE = Nat.isFinite() }'
    )
    const sourceFile = 'mocked_path'
    const results: [Loc, bigint][] = [...sourceMap.entries()].map(([id, loc]) => [loc, id])

    it('finds the name when position is under a name', () => {
      const position: Position = { line: 0, character: 55 }

      const [name, _id] = findName(modules, results, position, sourceFile) ?? [undefined, undefined]

      assert.deepEqual(name, 'Nat')
    })

    it('finds the name when position is under an application', () => {
      const position: Position = { line: 0, character: 58 }

      const [name, _id] = findName(modules, results, position, sourceFile) ?? [undefined, undefined]

      assert.deepEqual(name, 'isFinite')
    })

    it('finds the name when position is under a type alias', () => {
      const position: Position = { line: 0, character: 45 }

      const [name, _id] = findName(modules, results, position, sourceFile) ?? [undefined, undefined]

      assert.deepEqual(name, 'MY_TYPE')
    })

    it('returns undefined when the position is not under a name', () => {
      const position: Position = { line: 1, character: 8 }

      const result = findName(modules, results, position, sourceFile)

      assert.deepEqual(result, undefined)
    })
  })

  describe('locToRange', () => {
    it('converts a loc to a range', () => {
      const loc: Loc = {
        source: 'mocked_path',
        start: { col: 1, index: 1, line: 1 },
        end: { col: 5, index: 1, line: 1 },
      }

      const range = locToRange(loc)

      assert.deepEqual(range, {
        start: { character: 1, line: 1 },
        end: { character: 6, line: 1 },
      })
    })
  })

  describe('isPositionInLoc', () => {
    const loc: Loc = {
      source: 'myFile.qnt',
      start: { col: 10, index: 0, line: 1 },
      end: { col: 2, index: 0, line: 3 },
    }

    it('accepts middle-line positions regardless of start/end columns', () => {
      const position: Position = { line: 2, character: 0 }
      assert.isTrue(isPositionInLoc(loc, position, 'myFile.qnt'))
    })

    it('applies start-column check only on start line', () => {
      const beforeStart: Position = { line: 1, character: 5 }
      const afterStart: Position = { line: 1, character: 10 }
      assert.isFalse(isPositionInLoc(loc, beforeStart, 'myFile.qnt'))
      assert.isTrue(isPositionInLoc(loc, afterStart, 'myFile.qnt'))
    })

    it('applies end-column check only on end line', () => {
      const beforeEnd: Position = { line: 3, character: 2 }
      const afterEnd: Position = { line: 3, character: 3 }
      assert.isTrue(isPositionInLoc(loc, beforeEnd, 'myFile.qnt'))
      assert.isFalse(isPositionInLoc(loc, afterEnd, 'myFile.qnt'))
    })
  })
})
