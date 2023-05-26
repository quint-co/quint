import { describe, it } from 'mocha'
import { assert } from 'chai'
import { quintExAreEqual, zip } from './util'

import { buildExpression } from './builders/ir'
import { ofItf, toItf } from '../src/itf'

describe('toItf', () => {
  it('converts two states', () => {
    const trace = ['{ x: 2, y: true }', '{ x: 3, y: false }'].map(buildExpression)

    const itfTrace = toItf(['x', 'y'], trace)
    const expected = {
      vars: ['x', 'y'],
      states: [
        {
          '#meta': { index: 0 },
          x: 2,
          y: true,
        },
        {
          '#meta': { index: 1 },
          x: 3,
          y: false,
        },
      ],
    }
    assert(itfTrace.isRight(), `invalid ITF trace: ${JSON.stringify(itfTrace.unwrap)}`)
    assert.deepEqual(itfTrace.unwrap(), expected)

    const roundTripTrace = ofItf(itfTrace.unwrap())
    assert(roundTripTrace.isRight(), `failed to convert ITF back to Quint: ${roundTripTrace.value}`)
    assert(
      zip(roundTripTrace.unwrap(), trace).every(([a, b]) => quintExAreEqual(a, b)),
      `round trip conversion of trace failed`
    )
  })

  it('converts all kinds', () => {
    const text = `{
  a: 2,
  b: "hello",
  c: 1000000000000000000,
  d: Set(5, 6),
  e: { foo: 3, bar: true },
  f: (7, "myStr"),
  g: Map(1 -> "a", 2 -> "b", 3 -> "c"),
  h: Map(),
  i: Map(1 -> "a"),
}
`
    const trace = [buildExpression(text)]
    const vars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
    const itfTrace = toItf(vars, trace)
    const expected = {
      vars: vars,
      states: [
        {
          '#meta': {
            index: 0,
          },
          a: 2,
          b: 'hello',
          c: { '#bigint': '1000000000000000000' },
          d: { '#set': [5, 6] },
          e: { foo: 3, bar: true },
          f: { '#tup': [7, 'myStr'] },
          g: {
            '#map': [
              [1, 'a'],
              [2, 'b'],
              [3, 'c'],
            ],
          },
          h: { '#map': [] },
          i: { '#map': [[1, 'a']] },
        },
      ],
    }
    assert(itfTrace.isRight(), `invalid ITF trace: ${JSON.stringify(itfTrace.unwrap)}`)
    assert.deepEqual(itfTrace.unwrap(), expected)

    const roundTripTrace = ofItf(itfTrace.unwrap())
    assert(roundTripTrace.isRight(), `failed to convert ITF back to Quint: ${roundTripTrace.value}`)
    assert(
      zip(roundTripTrace.unwrap(), trace).every(([a, b]) => quintExAreEqual(a, b)),
      `round trip conversion of trace failed`
    )
  })
})
