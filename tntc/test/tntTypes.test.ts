import { describe, it } from 'mocha'
import { assert } from 'chai'
import { typeNames } from '../src/tntTypes'
import { parseTypeOrThrow } from '../src/types/parser'

describe('typeNames', () => {
  it('find names in types', () => {
    const result = typeNames(
      parseTypeOrThrow('(set(a)) => list(b) -> (c, int)')
    )

    assert.sameDeepMembers(Array.from(result), ['a', 'b', 'c'])
  })
})
