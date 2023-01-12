import { describe, it } from 'mocha'
import { assert } from 'chai'
import { ErrorTree, Loc } from '@informalsystems/quint'
import { assembleDiagnostic, diagnosticsFromErrorMap, findBestMatchingResult } from '../src/reporting'
import { Position } from 'vscode-languageserver'

describe('diagnosticsFromErrorMap', () => {
  const errorMap = new Map<bigint, ErrorTree>([
    [1n, { message: 'Message', location: 'Location', children: [] }],
  ])

  const sourceMap = new Map<bigint, Loc>([
    [1n, { start: { col: 1, index: 1, line: 1 }, end: { col: 1, index: 1, line: 1 }, source: 'mocked_path' }],
  ])

  it('assembles diagnosticts from error maps', () => {
    const diagnostics = diagnosticsFromErrorMap(errorMap, sourceMap)

    assert.sameDeepMembers(diagnostics, [
      {
        message: 'Message\nLocation\n',
        range: {
          start: { character: 1, line: 1 },
          end: { character: 2, line: 1 },
        },
        severity: 1,
        source: "parser",
      },
    ])
  })
})

describe('assembleDiagnostic', () => {
  const loc: Loc = { start: { col: 1, index: 1, line: 1 }, end: { col: 1, index: 1, line: 1 }, source: 'mocked_path' }

  it('assembles a single diagnostict', () => {
    const diagnostic = assembleDiagnostic('Message', loc)

    assert.deepEqual(diagnostic, {
      message: 'Message',
      range: {
        start: { character: 1, line: 1 },
        end: { character: 2, line: 1 },
      },
      severity: 1,
      source: "parser",
    })
  })
})

describe('findBestMatchingResult', () => {
  const results: [Loc, string][] = [
    [{ start: { col: 1, index: 1, line: 1 }, end: { col: 1, index: 1, line: 1 }, source: 'mocked_path' }, 'result 1'],
    [{ start: { col: 1, index: 1, line: 1 }, end: { col: 10, index: 10, line: 1 }, source: 'mocked_path' }, 'result 2'],
    [{ start: { col: 1, index: 11, line: 2 }, end: { col: 2, index: 12, line: 2 }, source: 'mocked_path' }, 'result 3'],
  ]

  it('finds the result with best matching loc to the position - 1', () => {
    const position: Position = { line: 1, character: 1}

    const [_loc, result] = findBestMatchingResult(results, position)

    assert.deepEqual(result, 'result 1')
  })

  it('finds the result with best matching loc to the position - 2', () => {
    const position: Position = { line: 1, character: 8 }

    const [_loc, result] = findBestMatchingResult(results, position)

    assert.deepEqual(result, 'result 2')
  })

  it('finds the result with best matching loc to the position - 3', () => {
    const position: Position = { line: 2, character: 1 }

    const [_loc, result] = findBestMatchingResult(results, position)

    assert.deepEqual(result, 'result 3')
  })
})
