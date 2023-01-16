import { assert } from 'chai'
import { describe, it } from 'mocha'
import { findExpressionWithId } from '../src/IRExpressionFinder'
import { buildModuleWithExpressions } from './builders/ir'

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
