import { describe, it } from 'mocha'
import { assert } from 'chai'

import { buildExpression } from './builders/ir'
import { toItf } from '../src/itf'

describe('itf', () => {
  it('converts two states', () => {
    const trace = ['{ x: 2, y: true }', '{ x: 3, y: false }'].map(buildExpression)

    const itfTrace = toItf(['x', 'y'], trace)
    const expected = {
      vars: ['x', 'y'],
      states: [
        {
          '#meta': { index: 0 },
          x: 2n,
          y: true,
        },
        {
          '#meta': { index: 1 },
          x: 3n,
          y: false,
        },
      ],
    }
    assert(itfTrace.isRight(), itfTrace.unwrap())
    assert.deepEqual(itfTrace.unwrap(), expected)
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
          a: 2n,
          b: 'hello',
          c: { '#bigint': '1000000000000000000' },
          d: { '#set': [5n, 6n] },
          e: { foo: 3n, bar: true },
          f: { '#tup': [7n, 'myStr'] },
          g: {
            '#map': [
              [1n, 'a'],
              [2n, 'b'],
              [3n, 'c'],
            ],
          },
          h: { '#map': [] },
          i: { '#map': [[1n, 'a']] },
        },
      ],
    }
    assert(itfTrace.isRight(), itfTrace.value)
    assert.deepEqual(itfTrace.unwrap(), expected)
  })
})
