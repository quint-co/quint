import { describe, it } from 'mocha'
import { assert } from 'chai'
import { quintExAreEqual } from './util'
import { zip } from '../src/util'

import { buildExpression } from './builders/ir'
import { ItfTrace, ofItf, toItf } from '../src/itf'

describe('toItf', () => {
  it('converts two states', () => {
    const trace = ['{ x: 2, y: true }', '{ x: 3, y: false }'].map(buildExpression)

    const itfTrace = toItf(['x', 'y'], trace)
    const expected: ItfTrace = {
      vars: ['x', 'y'],
      states: [
        {
          '#meta': { index: 0 },
          x: { '#bigint': '2' },
          y: true,
        },
        {
          '#meta': { index: 1 },
          x: { '#bigint': '3' },
          y: false,
        },
      ],
    }
    assert(itfTrace.isRight(), `invalid ITF trace: ${JSON.stringify(itfTrace.unwrap)}`)
    assert.deepEqual(itfTrace.unwrap(), expected)

    const roundTripTrace = ofItf(itfTrace.unwrap())
    assert(
      zip(roundTripTrace, trace).every(([a, b]) => quintExAreEqual(a, b)),
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
  j: variant("A", 2)
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
          a: { '#bigint': '2' },
          b: 'hello',
          c: { '#bigint': '1000000000000000000' },
          d: { '#set': [{ '#bigint': '5' }, { '#bigint': '6' }] },
          e: { foo: { '#bigint': '3' }, bar: true },
          f: { '#tup': [{ '#bigint': '7' }, 'myStr'] },
          g: {
            '#map': [
              [{ '#bigint': '1' }, 'a'],
              [{ '#bigint': '2' }, 'b'],
              [{ '#bigint': '3' }, 'c'],
            ],
          },
          h: { '#map': [] },
          i: { '#map': [[{ '#bigint': '1' }, 'a']] },
          j: { tag: 'A', value: { '#bigint': '2' } },
        },
      ],
    }
    assert(itfTrace.isRight(), `invalid ITF trace: ${JSON.stringify(itfTrace.unwrap)}`)
    assert.deepEqual(itfTrace.unwrap(), expected)

    const roundTripTrace = ofItf(itfTrace.unwrap())
    assert(
      zip(roundTripTrace, trace).every(([a, b]) => quintExAreEqual(a, b)),
      `round trip conversion of trace failed`
    )
  })

  it('converts unit type from Apalache', () => {
    const text = '{ a: () }'

    const trace = [buildExpression(text)]
    const vars = ['a']
    const itfTrace = {
      vars: vars,
      states: [
        {
          '#meta': {
            index: 0,
          },
          a: { tag: 'UNIT' },
        },
      ],
    }

    const roundTripTrace = ofItf(itfTrace)
    assert(
      zip(roundTripTrace, trace).every(([a, b]) => quintExAreEqual(a, b)),
      `round trip conversion of trace failed`
    )
  })
})
