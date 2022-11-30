// Unit tests for CLI procedures
import { describe, it } from 'mocha'
import { assert } from 'chai'
import { parse, status, typecheck } from '../src/cliCommands'

const exModule = `
module exModule {
  const C: int
  val s: Set[int] = Set(1, 2)
}
`

const loaded  = {
  args: {},
  path: "mocked/path",
  sourceCode: exModule,
  status: ('loaded' as status),
  warnings: [],
}

describe('the parse CLI routine', () =>
  it('succeeds with "parsed" status', () => {
    parse(loaded).map(s => assert.equal(s.status, 'parsed'))
  })
)

describe('the typecheck CLI routine', () =>
  it('succeeds with "typechecked" status', () => {
    parse(loaded).chain(typecheck).map(s => assert.equal(s.status, 'typechecked'))
  })
)
