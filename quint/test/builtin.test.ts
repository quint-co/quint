import { assert } from 'chai'
import { describe, it } from 'mocha'
import { builtInDocs } from '../src/builtin'

describe('builtInDocs', () => {
  it('has documentation for builtin definitions', () => {
    const result = builtInDocs()

    assert.isTrue(result.isRight())
    result.map(docs => {
      assert.deepEqual(docs.get('Bool'), {
        label: 'pure val Bool: Set[bool]',
        documentation: 'The set of all booleans\n\nThat is, Set(false, true)',
      })
    })
  })
})
