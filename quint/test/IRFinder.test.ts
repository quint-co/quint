import { assert } from 'chai'
import { describe, it } from 'mocha'
import { findExpressionWithId, findTypeWithId } from '../src/IRFinder'
import { buildModuleWithDefs, buildModuleWithExpressions } from './builders/ir'

describe('findExpressionWithId', () => {
  const module = buildModuleWithExpressions(['Nat'])

  it('finds expression for existing id', () => {
    const expr = findExpressionWithId(module, 1n)

    assert.isDefined(expr)
    assert.deepEqual(expr, { id: 1n, kind: 'name', name: 'Nat' })
  })

  it('returns undefined for inexisting id', () => {
    const expr = findExpressionWithId(module, 99n)

    assert.isUndefined(expr)
  })
})

describe('findTypeWithId', () => {
  const module = buildModuleWithDefs(['const N: MY_TYPE'])

  it('finds type for existing id', () => {
    const type = findTypeWithId(module, 1n)

    assert.isDefined(type)
    assert.deepEqual(type, { id: 1n, kind: 'const', name: 'MY_TYPE' })
  })

  it('returns undefined for inexisting id', () => {
    const type = findTypeWithId(module, 99n)

    assert.isUndefined(type)
  })
})
