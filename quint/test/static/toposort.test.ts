import { describe, it } from 'mocha'
import { assert } from 'chai'
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
    const { cycles, sorted } = toposort(Map<bigint, Set<bigint>>(), [])
    assert.isEmpty(cycles.toArray())
    assert.isEmpty(sorted)
  })

  it('sorts a fork', () => {
    // 1 uses 3 and 2
    const edges: [bigint, Set<bigint>][] = [
      [1n, Set([2n, 3n])],
      [2n, Set([3n])],
    ]

    const { cycles, sorted } = toposort(Map(edges), [n1, n3, n2])
    assert.isEmpty(cycles.toArray())
    assert.deepEqual(sorted, [n3, n2, n1])
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
    const { cycles, sorted } = toposort(Map(edges), [n3, n2, n5, n4, n1])
    assert.isEmpty(cycles.toArray())
    assert.deepEqual(sorted, [n5, n3, n4, n2, n1])
  })

  it('sorts two defs', () => {
    // 5 uses 1 and 11
    // 11 uses 6 and 7
    const edges: [bigint, Set<bigint>][] = [
      [5n, Set([1n, 11n])],
      [11n, Set([6n, 7n])],
    ]
    const { cycles, sorted } = toposort(Map(edges), [n5, n11])
    assert.isEmpty(cycles.toArray())
    assert.deepEqual(sorted, [n11, n5])
  })
})
