import { assert } from 'chai'
import { describe, it } from 'mocha'
import { builtinDocs } from '../src/builtin'
import { dedent } from './textUtils'

describe('builtInDocs', () => {
  it('has documentation for builtin definitions', () => {
    const result = builtinDocs()

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
