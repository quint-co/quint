import { describe, it } from 'mocha'
import { assert } from 'chai'
import { typeNames } from '../src/tntTypes'
import { parseTypeOrThrow } from '../src/types/parser'

describe('typeNames', () => {
  it('find names in types', () => {
    const result = typeNames(
      parseTypeOrThrow('(Set[a]) => List[b] -> (c, int, r)')
    )

    assert.sameDeepMembers(Array.from(result.typeVariables), ['a', 'b', 'c'])
    assert.sameDeepMembers(Array.from(result.rowVariables), ['r'])
  })
})
