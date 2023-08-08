import { describe, it } from 'mocha'
import { assert } from 'chai'
import { typeNames } from '../../src/internal_representation/quintTypes'
import { parseType, parseTypeOrThrow } from '../../src/types/parser'

describe('typeNames', () => {
  it('find names in types', () => {
    const result = typeNames(parseTypeOrThrow('(Set[a]) => List[b] -> { f1: c | r }'))

    assert.sameDeepMembers(Array.from(result.typeVariables), ['a', 'b', 'c'])
    assert.sameDeepMembers(Array.from(result.rowVariables), ['r'])
  })
})

describe('operator types', () => {
  it('support annotations with single, unbracketed param type', () => {
    // Regression test for https://github.com/informalsystems/quint/issues/455
    const result = parseType('int => str')

    assert(result.isRight())
    result.map(t => assert(t.kind === 'oper'))
    if (result.isRight() && result.value.kind === 'oper') {
      assert.deepEqual(
        result.value.args.map(t => t.kind),
        ['int']
      )
      assert.deepEqual(result.value.res.kind, 'str')
    }
  })
})
