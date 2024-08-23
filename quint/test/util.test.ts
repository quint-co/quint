import { assert } from 'chai'
import { describe, it } from 'mocha'

import { just, none } from '@sweet-monads/maybe'

import { findMap, insertSorted } from '../src/util'

describe('findMap', () => {
  it('is none on empty iterable', () => {
    assert(findMap(new Map().values(), _ => just(42)).isNone(), 'should be none on empty iterable')
  })

  it('is `just` when a value can be found', () => {
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

describe('insertSorted', () => {
  it('can insert into empty array', () => {
    const array: number[] = []
    insertSorted(array, 42, (a, b) => a - b)
    assert.deepEqual([42], array)
  })

  it('can insert into sorted array', () => {
    const array = [1, 3, 5]
    insertSorted(array, 2, (a, b) => a - b)
    assert.deepEqual([1, 2, 3, 5], array)
  })

  it('can insert at the beginning of the array', () => {
    const array = [2, 3, 4]
    insertSorted(array, 1, (a, b) => a - b)
    assert.deepEqual([1, 2, 3, 4], array)
  })

  it('can insert at the end of the array', () => {
    const array = [1, 2, 3]
    insertSorted(array, 4, (a, b) => a - b)
    assert.deepEqual([1, 2, 3, 4], array)
  })

  it('can insert at the middle of the array', () => {
    const array = [1, 3, 4]
    insertSorted(array, 2, (a, b) => a - b)
    assert.deepEqual([1, 2, 3, 4], array)
  })

  it('can sort an array of numbers', () => {
    const array = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    var sorted: number[] = []
    for (const n of array) {
      insertSorted(sorted, n, (a, b) => a - b)
    }
    assert.deepEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9], sorted)
  })
})
