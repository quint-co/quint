import { describe, it } from 'mocha'
import { assert, expect } from 'chai'
import { fail } from 'assert'
import { Map, Set } from 'immutable'

import { toposort } from '../../src/static/toposort'

describe('topological sort', () => {
  const n1 = { id: 1n }
  const n2 = { id: 2n }
  const n3 = { id: 3n }
  const n4 = { id: 4n }
  const n5 = { id: 5n }
  const n11 = { id: 11n }

  it('sorts empty', () => {
    toposort(Map<bigint, Set<bigint>>(), [])
      .mapRight(s => assert(s.length === 0))
      .mapLeft(s => fail(`Expected an array, found: ${s}`))
  })

  it('sorts a fork', () => {
    // 1 uses 3 and 2
    const edges: [bigint, Set<bigint>][] = [
      [1n, Set([2n, 3n])],
      [2n, Set([3n])],
    ]

    toposort(Map(edges), [n1, n3, n2])
      .mapRight(s => expect(s).to.eql([n3, n2, n1]))
      .mapLeft(s => fail(`Expected an array, found: ${s}`))
  })

  it('sorts two layers', () => {
    // 1 uses 3 and 2
    // 2 uses 4
    // 3 uses 5
    // 4 uses 5
    const edges: [bigint, Set<bigint>][] = [
      [1n, Set([2n, 3n])],
      [2n, Set([4n])],
      [3n, Set([5n])],
      [4n, Set([5n])],
    ]
    toposort(Map(edges), [n3, n2, n5, n4, n1])
      .mapRight(s => expect(s).to.eql([n5, n3, n4, n2, n1]))
      .mapLeft(s => fail(`Expected an array, found: ${s}`))
  })

  it('sorts two defs', () => {
    // 5 uses 1 and 11
    // 11 uses 6 and 7
    const edges: [bigint, Set<bigint>][] = [
      [5n, Set([1n, 11n])],
      [11n, Set([6n, 7n])],
    ]
    toposort(Map(edges), [n5, n11])
      .mapRight(s => expect(s).to.eql([n11, n5]))
      .mapLeft(s => fail(`Expected an array, found: ${s}`))
  })
})
