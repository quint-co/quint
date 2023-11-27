// Unit tests for CLI procedures
import { describe, it } from 'mocha'
import { assert } from 'chai'
import { parse, stage, typecheck } from '../src/cliCommands'

const exModule = `
module exModule {
  const C: int
  val s: Set[int] = Set(1, 2)
}
`

const loaded = {
  args: {},
  path: 'mocked/path',
  sourceCode: new Map([['mocked/path', exModule]]),
  stage: 'loading' as stage,
  warnings: [],
}

describe('the parse CLI routine', () =>
  it('succeeds with "parsed" status', () => {
    parse(loaded).then(res => res.map(s => assert.equal(s.stage, 'parsing')))
  }))

describe('the typecheck CLI routine', () =>
  it('succeeds with "typechecked" status', () => {
    parse(loaded)
      .then(parsed => parsed.asyncChain(typecheck))
      .then(res => res.map(s => assert.equal(s.stage, 'typechecking')))
  }))
