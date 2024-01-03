import { describe, it } from 'mocha'
import { assert } from 'chai'
import { formatError } from '../src/errorReporter'
import lineColumn from 'line-column'
import { ErrorMessage } from '../src/ErrorMessage'

describe('errorReporter', () => {
  const text = `module test {
  def op = "value"
}`
  const sourceCode: Map<string, string> = new Map([['file', text]])
  const finder: Map<string, any> = new Map([['file', lineColumn(text)]])

  it('highlights the middle line', () => {
    const message: ErrorMessage = {
      explanation: 'error explanation',
      locs: [
        {
          source: 'file',
          start: { line: 1, col: 4, index: 17 },
          end: { line: 1, col: 7, index: 21 },
        },
      ],
    }

    const expectedError = `file:2:5 - error: error explanation
2:   def op = "value"
       ^^^^`

    const error = formatError(sourceCode, finder, message).trim()
    assert.equal(error, expectedError)
  })

  it('highlights the first 2 lines', () => {
    const message: ErrorMessage = {
      explanation: 'error explanation',
      locs: [
        {
          source: 'file',
          start: { line: 0, col: 4, index: 4 },
          end: { line: 1, col: 7, index: 21 },
        },
      ],
    }

    const expectedError = `file:1:5 - error: error explanation
1: module test {
       ^^^^^^^^^
2:   def op = "value"
   ^^^^^^^^`

    const error = formatError(sourceCode, finder, message).trim()
    assert.equal(error, expectedError)
  })

  it('highlights a single char when loc has no end', () => {
    const message: ErrorMessage = {
      explanation: 'error explanation',
      locs: [
        {
          source: 'file',
          start: { line: 1, col: 4, index: 17 },
        },
      ],
    }

    const expectedError = `file:2:5 - error: error explanation
2:   def op = "value"
       ^`

    const error = formatError(sourceCode, finder, message).trim()
    assert.equal(error, expectedError)
  })

  it('uses column information when index is 0', () => {
    const message: ErrorMessage = {
      explanation: 'error explanation',
      locs: [
        {
          source: 'file',
          start: { line: 1, col: 4, index: 0 },
          end: { line: 1, col: 7, index: 0 },
        },
      ],
    }

    const expectedError = `file:2:5 - error: error explanation
2:   def op = "value"
       ^^^^`

    const error = formatError(sourceCode, finder, message).trim()
    assert.equal(error, expectedError)
  })

  it('outputs just explanation when there are no locs', () => {
    const message: ErrorMessage = {
      explanation: 'error explanation',
      locs: [],
    }

    const expectedError = 'error: error explanation'

    const error = formatError(sourceCode, finder, message).trim()
    assert.equal(error, expectedError)
  })
})
