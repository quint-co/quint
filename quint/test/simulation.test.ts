import { describe, it } from 'mocha'
import { expect } from 'chai'

import { getTraceStatistics } from '../src/simulation'

describe('getTraceStatistics', () => {
  it('computes max, min, and average for a small array', () => {
    const stats = getTraceStatistics([1, 5, 3, 7, 2])
    expect(stats.maxTraceLength).to.equal(7)
    expect(stats.minTraceLength).to.equal(1)
    expect(stats.averageTraceLength).to.equal(3.6)
  })

  it('handles a single-element array', () => {
    const stats = getTraceStatistics([42])
    expect(stats.maxTraceLength).to.equal(42)
    expect(stats.minTraceLength).to.equal(42)
    expect(stats.averageTraceLength).to.equal(42)
  })

  // Regression: Math.max(...arr) / Math.min(...arr) overflow Node's argument
  // stack at ~65k elements (nodejs/node#43043). 100k is comfortably above
  // the threshold and runs fast.
  it("does not stack-overflow on arrays larger than Node's argument-stack limit", () => {
    const n = 100_000
    const lengths = Array.from({ length: n }, (_, i) => (i % 100) + 1)
    const stats = getTraceStatistics(lengths)
    expect(stats.maxTraceLength).to.equal(100)
    expect(stats.minTraceLength).to.equal(1)
    expect(stats.averageTraceLength).to.be.closeTo(50.5, 0.01)
  })
})
