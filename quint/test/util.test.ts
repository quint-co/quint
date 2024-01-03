import { assert } from 'chai'
import { describe, it } from 'mocha'

import { just, none } from '@sweet-monads/maybe'

import { findMap } from '../src/util'

describe('findMap', () => {
  it('is none on empty iterable', () => {
    assert(findMap(new Map().values(), _ => just(42)).isNone(), 'should be none on empty iterable')
  })

  it('is `just` when a vaule can be found', () => {
    const actual = findMap(
      new Map([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ]).values(),
      n => (n % 2 === 0 ? just(n) : none<Number>())
    )

    assert.deepEqual(just(2), actual)
  })

  it('is `none` when no value can be found', () => {
    const result = findMap(
      new Map([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ]).values(),
      n => (n > 3 ? just(n) : none<Number>())
    )

    assert(result.isNone(), 'should be none')
  })
})
