import { assert } from 'chai'
import { describe, it } from 'mocha'
import { dedent } from './textUtils'

import { builtinDocs } from '../src/builtin'
import { newIdGenerator } from '../src/idGenerator'

// Use a global id generator, limited to this test suite.
const idGen = newIdGenerator()

describe('builtInDocs', () => {
  it('has documentation for builtin definitions', () => {
    const result = builtinDocs(idGen)

    assert.isTrue(result.isRight())
    result.map(docs => {
      assert.deepEqual(docs.get('Bool'), {
        label: 'pure val Bool: Set[bool]',
        documentation: dedent(
          `The set of all booleans
          |
          |That is, Set(false, true)`
      )})
    })
  })
})
